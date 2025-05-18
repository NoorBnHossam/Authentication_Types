package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// all configuration
type Config struct {
	MongoDBURI        string
	MongoDBDatabase   string
	MongoDBCollection string
	JWTSecret         string
	JWTExpiration     time.Duration
	Port              string
	Env               string
	AllowedOrigins    []string
}

func Load() *Config {
	config := &Config{
		MongoDBURI:        getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDBDatabase:   getEnv("MONGODB_DATABASE", "auth_demo"),
		MongoDBCollection: getEnv("MONGODB_COLLECTION", "users"),
		JWTSecret:         getRequiredEnv("JWT_SECRET_KEY"),
		JWTExpiration:     parseDuration(getEnv("JWT_EXPIRATION", "24h")),
		Port:              getEnv("PORT", "8080"),
		Env:               getEnv("ENV", "development"),
		AllowedOrigins:    []string{"http://localhost:3000"},
	}

	if config.Env == "production" {
		origins := getEnv("ALLOWED_ORIGINS", "")
		if origins != "" {
			config.AllowedOrigins = strings.Split(origins, ",")
		}
	}

	if err := config.validate(); err != nil {
		panic(fmt.Sprintf("Invalid configuration: %v", err))
	}

	return config
}

func (c *Config) validate() error {
	if c.MongoDBURI == "" {
		return fmt.Errorf("MongoDB URI is required")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET_KEY environment variable is required")
	}
	if c.Port == "" {
		return fmt.Errorf("Port is required")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("Required environment variable %s is not set", key))
	}
	return value
}

func parseDuration(value string) time.Duration {
	duration, err := time.ParseDuration(value)
	if err != nil {
		return 24 * time.Hour
	}
	return duration
}

func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}
