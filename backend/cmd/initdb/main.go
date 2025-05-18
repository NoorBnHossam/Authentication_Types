package main

import (
	"context"
	"log"
	"time"

	"github.com/NoorBnHossam/Authentication_Types/internal/db"
	"github.com/NoorBnHossam/Authentication_Types/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := db.Connect(); err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Disconnect()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	user := models.User{
		Username:  "admin",
		Password:  string(hashedPassword),
		Email:     "admin@example.com",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	var existingUser models.User
	err = db.Collection.FindOne(context.Background(), bson.M{"username": user.Username}).Decode(&existingUser)
	if err == nil {
		log.Println("Test user already exists")
		return
	}

	_, err = db.Collection.InsertOne(context.Background(), user)
	if err != nil {
		log.Fatal("Failed to insert test user:", err)
	}

	log.Println("Test user created successfully")
}
