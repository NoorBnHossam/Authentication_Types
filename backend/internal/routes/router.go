package routes

import (
	"time"

	"github.com/NoorBnHossam/Authentication_Types/internal/auth"
	"github.com/NoorBnHossam/Authentication_Types/internal/config"
	"github.com/NoorBnHossam/Authentication_Types/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all the routes for the application
func SetupRouter(cfg *config.Config) *gin.Engine {
	// Set Gin mode to release to disable debug logs
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	// Initialize rate limiter
	rateLimiter := middleware.NewRateLimiter(100, time.Minute) // 100 requests per minute

	// Apply security middleware
	router.Use(middleware.SecurityHeaders())
	router.Use(rateLimiter.RateLimit())

	// CORS middleware
	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Check if origin is allowed
		allowed := false
		for _, allowedOrigin := range cfg.AllowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
			c.Writer.Header().Set("Vary", "Origin")                  // Important for caching
		}

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			if allowed {
				c.AbortWithStatus(204)
			} else {
				c.AbortWithStatus(403)
			}
			return
		}

		c.Next()
	})

	// Basic Auth routes
	router.POST("/api/basic-auth/login", auth.BasicAuthLogin)
	router.GET("/api/basic-auth/protected", auth.BasicAuthMiddleware(), auth.ProtectedRoute)

	// Token Auth routes
	router.POST("/api/token-auth/login", auth.TokenAuthLogin)
	router.GET("/api/token-auth/protected", auth.TokenAuthMiddleware(), auth.ProtectedRoute)

	// JWT Auth routes
	router.POST("/api/jwt-auth/login", auth.JWTAuthLogin)
	router.GET("/api/jwt-auth/protected", auth.JWTAuthMiddleware(), auth.ProtectedRoute)
	router.POST("/api/jwt-auth/refresh", auth.RefreshToken)
	router.POST("/api/jwt-auth/logout", auth.Logout)

	// Session Auth routes
	router.POST("/api/session-auth/login", auth.SessionAuthLogin)
	router.GET("/api/session-auth/protected", auth.SessionAuthMiddleware(), auth.ProtectedRoute)
	router.POST("/api/session-auth/logout", auth.SessionAuthLogout)

	// OAuth routes
	router.GET("/api/oauth/login", auth.OAuthLogin)
	router.GET("/api/oauth/callback", auth.OAuthCallback)
	router.GET("/api/oauth/protected", auth.OAuthMiddleware(), auth.ProtectedRoute)

	// SSO routes
	router.GET("/api/sso/login", auth.SSOLogin)
	router.GET("/api/sso/callback", auth.SSOCallback)
	router.GET("/api/sso/protected", auth.SSOMiddleware(), auth.ProtectedRoute)

	return router
}
