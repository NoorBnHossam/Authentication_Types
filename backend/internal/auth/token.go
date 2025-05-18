package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"strings"
	"time"

	"github.com/NoorBnHossam/Authentication_Types/internal/db"
	"github.com/NoorBnHossam/Authentication_Types/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type Token struct {
	Value     string    `bson:"value"`
	UserID    string    `bson:"user_id"`
	CreatedAt time.Time `bson:"created_at"`
	ExpiresAt time.Time `bson:"expires_at"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func TokenAuthLogin(c *gin.Context) {
	var loginReq models.LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var user models.User
	err := db.Collection.FindOne(context.Background(), bson.M{"username": loginReq.Username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	tokenValue, err := generateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	token := Token{
		Value:     tokenValue,
		UserID:    user.ID.Hex(),
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	tokensCollection := db.Database.Collection("tokens")
	_, err = tokensCollection.InsertOne(context.Background(), token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not store token"})
		return
	}

	c.JSON(http.StatusOK, TokenResponse{Token: tokenValue})
}

func TokenAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		if !strings.HasPrefix(auth, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		tokenValue := strings.TrimPrefix(auth, "Bearer ")

		tokensCollection := db.Database.Collection("tokens")
		var token Token
		err := tokensCollection.FindOne(context.Background(), bson.M{
			"value": tokenValue,
			"expires_at": bson.M{
				"$gt": time.Now(),
			},
		}).Decode(&token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		var user models.User
		objectID, err := primitive.ObjectIDFromHex(token.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID format"})
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
		c.Next()
	}
}
