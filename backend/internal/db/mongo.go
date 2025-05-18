package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client     *mongo.Client
	Database   *mongo.Database
	Collection *mongo.Collection
)

// Connect establishes a connection to MongoDB
func Connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get MongoDB URI from environment variable
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017" // fallback to local MongoDB
	}

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	// Get database and collection names from environment variables
	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		dbName = "auth_demo" // fallback to default
	}

	collectionName := os.Getenv("MONGODB_COLLECTION")
	if collectionName == "" {
		collectionName = "users" // fallback to default
	}

	// Set global variables
	Client = client
	Database = client.Database(dbName)
	Collection = Database.Collection(collectionName)

	log.Println("Connected to MongoDB!")
	return nil
}

// Disconnect closes the MongoDB connection
func Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if Client != nil {
		return Client.Disconnect(ctx)
	}
	return nil
}
