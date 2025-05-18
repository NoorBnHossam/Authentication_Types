package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func OAuthLogin(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "OAuth not implemented"})
}

func OAuthCallback(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "OAuth not implemented"})
}

func OAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "OAuth not implemented"})
		c.Abort()
	}
}

func SSOLogin(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "SSO not implemented"})
}

func SSOCallback(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "SSO not implemented"})
}

func SSOMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "SSO not implemented"})
		c.Abort()
	}
}
