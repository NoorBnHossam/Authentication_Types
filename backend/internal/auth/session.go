package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/NoorBnHossam/Authentication_Types/internal/db"
	"github.com/NoorBnHossam/Authentication_Types/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type Session struct {
	ID           string    `bson:"_id"`
	UserID       string    `bson:"user_id"`
	UserAgent    string    `bson:"user_agent"`
	IPAddress    string    `bson:"ip_address"`
	LastActivity time.Time `bson:"last_activity"`
	CreatedAt    time.Time `bson:"created_at"`
	ExpiresAt    time.Time `bson:"expires_at"`
	IsValid      bool      `bson:"is_valid"`
}

// SessionConfig holds session configuration
type SessionConfig struct {
	SessionDuration time.Duration
	MaxSessions     int
	IdleTimeout     time.Duration
}

var defaultSessionConfig = SessionConfig{
	SessionDuration: 24 * time.Hour,
	MaxSessions:     5,
	IdleTimeout:     30 * time.Minute,
}

func generateSessionID() (string, error) {
	for i := 0; i < 3; i++ { // Try up to 3 times to generate a unique session ID
		b := make([]byte, 32)
		if _, err := rand.Read(b); err != nil {
			return "", fmt.Errorf("failed to generate random bytes: %w", err)
		}
		sessionID := base64.URLEncoding.EncodeToString(b)

		// Check if session ID already exists
		count, err := db.Database.Collection("sessions").CountDocuments(context.Background(), bson.M{"_id": sessionID})
		if err != nil {
			return "", fmt.Errorf("failed to check session ID uniqueness: %w", err)
		}
		if count == 0 {
			return sessionID, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique session ID after 3 attempts")
}

func enforceMaxSessions(ctx context.Context, userID string) error {
	sessionsCollection := db.Database.Collection("sessions")

	// Count active sessions
	count, err := sessionsCollection.CountDocuments(ctx, bson.M{
		"user_id":  userID,
		"is_valid": true,
	})
	if err != nil {
		return fmt.Errorf("failed to count active sessions: %w", err)
	}

	// If we're at or over the limit, delete oldest sessions
	if int(count) >= defaultSessionConfig.MaxSessions {
		// Find and delete oldest sessions
		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})
		cursor, err := sessionsCollection.Find(ctx, bson.M{
			"user_id":  userID,
			"is_valid": true,
		}, opts)
		if err != nil {
			return fmt.Errorf("failed to find old sessions: %w", err)
		}
		defer cursor.Close(ctx)

		var sessions []Session
		if err = cursor.All(ctx, &sessions); err != nil {
			return fmt.Errorf("failed to decode old sessions: %w", err)
		}

		// Delete oldest sessions that exceed the limit
		sessionsToDelete := int(count) - defaultSessionConfig.MaxSessions + 1
		for i := 0; i < sessionsToDelete; i++ {
			_, err = sessionsCollection.UpdateOne(
				ctx,
				bson.M{"_id": sessions[i].ID},
				bson.M{"$set": bson.M{"is_valid": false}},
			)
			if err != nil {
				return fmt.Errorf("failed to invalidate old session: %w", err)
			}
		}
	}
	return nil
}

func SessionAuthLogin(c *gin.Context) {
	var loginReq models.LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		log.Printf("[SessionAuthLogin] Invalid request payload for user %s: %v", loginReq.Username, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var user models.User
	err := db.Collection.FindOne(context.Background(), bson.M{"username": loginReq.Username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("[SessionAuthLogin] Failed login attempt for non-existent user: %s", loginReq.Username)
		} else {
			log.Printf("[SessionAuthLogin] Database error while looking up user %s: %v", loginReq.Username, err)
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		log.Printf("[SessionAuthLogin] Failed password attempt for user %s", loginReq.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Enforce maximum sessions limit
	if err := enforceMaxSessions(c.Request.Context(), user.ID.Hex()); err != nil {
		log.Printf("[SessionAuthLogin] Error enforcing max sessions for user %s: %v", loginReq.Username, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create session"})
		return
	}

	// Generate new session ID
	sessionID, err := generateSessionID()
	if err != nil {
		log.Printf("[SessionAuthLogin] Error generating session ID for user %s: %v", loginReq.Username, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create session"})
		return
	}

	// Create new session
	now := time.Now()
	session := Session{
		ID:           sessionID,
		UserID:       user.ID.Hex(),
		UserAgent:    c.GetHeader("User-Agent"),
		IPAddress:    c.ClientIP(),
		LastActivity: now,
		CreatedAt:    now,
		ExpiresAt:    now.Add(defaultSessionConfig.SessionDuration),
		IsValid:      true,
	}

	// Store session in database
	sessionsCollection := db.Database.Collection("sessions")
	_, err = sessionsCollection.InsertOne(context.Background(), session)
	if err != nil {
		log.Printf("[SessionAuthLogin] Error storing session for user %s: %v", loginReq.Username, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create session"})
		return
	}

	// Set session cookie
	c.SetCookie(
		"session_id",
		sessionID,
		int(defaultSessionConfig.SessionDuration.Seconds()),
		"/",
		"",
		true, // Secure
		true, // HttpOnly
	)

	log.Printf("[SessionAuthLogin] Successful login for user %s", loginReq.Username)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    user.ToResponse(),
	})
}

func SessionAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session required"})
			c.Abort()
			return
		}

		sessionsCollection := db.Database.Collection("sessions")
		var session Session
		err = sessionsCollection.FindOne(context.Background(), bson.M{
			"_id":      sessionID,
			"is_valid": true,
			"expires_at": bson.M{
				"$gt": time.Now(),
			},
		}).Decode(&session)
		if err != nil {
			c.SetCookie("session_id", "", -1, "/", "", true, true)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			c.Abort()
			return
		}

		// Check for session hijacking
		if session.UserAgent != c.GetHeader("User-Agent") || session.IPAddress != c.ClientIP() {
			// Invalidate session
			_, err = sessionsCollection.UpdateOne(
				context.Background(),
				bson.M{"_id": sessionID},
				bson.M{"$set": bson.M{"is_valid": false}},
			)
			if err != nil {
				log.Println("[SessionAuthMiddleware] Error invalidating session:", err)
			}
			c.SetCookie("session_id", "", -1, "/", "", true, true)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session security violation"})
			c.Abort()
			return
		}

		// Check for idle timeout
		if time.Since(session.LastActivity) > defaultSessionConfig.IdleTimeout {
			_, err = sessionsCollection.UpdateOne(
				context.Background(),
				bson.M{"_id": sessionID},
				bson.M{"$set": bson.M{"is_valid": false}},
			)
			if err != nil {
				log.Println("[SessionAuthMiddleware] Error invalidating idle session:", err)
			}
			c.SetCookie("session_id", "", -1, "/", "", true, true)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session expired due to inactivity"})
			c.Abort()
			return
		}

		// Update last activity
		_, err = sessionsCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": sessionID},
			bson.M{"$set": bson.M{"last_activity": time.Now()}},
		)
		if err != nil {
			log.Println("[SessionAuthMiddleware] Error updating session activity:", err)
		}

		var user models.User
		objectID, err := primitive.ObjectIDFromHex(session.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			c.Abort()
			return
		}

		err = db.Collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Set("session", session)
		c.Next()
	}
}

func SessionAuthLogout(c *gin.Context) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
		return
	}

	sessionsCollection := db.Database.Collection("sessions")
	_, err = sessionsCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": sessionID},
		bson.M{"$set": bson.M{"is_valid": false}},
	)
	if err != nil {
		log.Println("[SessionAuthLogout] Error invalidating session:", err)
	}

	c.SetCookie("session_id", "", -1, "/", "", true, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
