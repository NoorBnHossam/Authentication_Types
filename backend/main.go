package main

import (
	"log"

	"github.com/NoorBnHossam/Authentication_Types/internal/config"
	"github.com/NoorBnHossam/Authentication_Types/internal/db"
	"github.com/NoorBnHossam/Authentication_Types/internal/routes"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Connect to MongoDB
	if err := db.Connect(); err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Disconnect()

	// Setup router with configuration
	router := routes.SetupRouter(cfg)

	// Start server
	log.Printf("Server starting on port %s in %s mode", cfg.Port, cfg.Env)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
