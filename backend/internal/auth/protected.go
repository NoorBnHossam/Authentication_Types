package auth

import (
	"net/http"

	"github.com/NoorBnHossam/Authentication_Types/internal/models"
	"github.com/gin-gonic/gin"
)

func ProtectedRoute(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	userModel, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type in context"})
		return
	}

	session, _ := c.Get("session")

	c.JSON(http.StatusOK, gin.H{
		"message": "Access granted",
		"user":    userModel.ToResponse(),
		"session": session,
	})
}
