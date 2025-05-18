# Authentication Types Demo

A comprehensive demonstration of various authentication methods and their implementations. This project showcases different authentication techniques with both backend and frontend implementations.

## 🛡️ Features

### Authentication Methods
- **Basic Authentication**
  - Username/password based authentication
  - Base64 encoded credentials
  - Stateless authentication

- **Token Authentication**
  - Custom token generation
  - Token-based session management
  - Token validation and expiration

- **JWT Authentication**
  - JWT token generation and validation
  - Refresh token mechanism
  - Token expiration and renewal

- **Session Authentication**
  - Server-side session management
  - Cookie-based session handling
  - Session expiration and cleanup

- **OAuth 2.0**
  - OAuth flow implementation
  - Third-party authentication
  - Access token management

- **Single Sign-On (SSO)**
  - SSO implementation
  - Cross-domain authentication
  - Session sharing

### Testing Suite
- Interactive test interface for all auth methods
- Real-time request/response monitoring
- Test history and results tracking
- Custom token/session testing

## 🚀 Getting Started

### Prerequisites
- Go 1.16 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Start the server:
   ```bash
   go run main.go
   ```
   The server will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
   The application will open in your browser at `http://localhost:3000`

## 📁 Project Structure

```
.
├── backend/
│   ├── handlers/      # Request handlers
│   ├── middleware/    # Authentication middleware
│   ├── models/        # Data models
│   └── utils/         # Utility functions
│
├── frontend/
│   ├── public/        # Static files
│   └── src/
│       ├── components/    # React components
│       ├── services/      # API services
│       └── utils/         # Utility functions
│
└── docs/             # Documentation
```

## 🔧 Configuration

### Backend Configuration
Create a `.env` file in the backend directory:
```env
PORT=8080
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### Frontend Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8080
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
# or
yarn test
```

## 📚 API Documentation

### Authentication Endpoints

#### Basic Auth
- `POST /api/basic-auth/login` - Login with basic auth
- `GET /api/basic-auth/protected` - Access protected resource

#### Token Auth
- `POST /api/token-auth/login` - Get access token
- `GET /api/token-auth/protected` - Access protected resource

#### JWT Auth
- `POST /api/jwt-auth/login` - Get JWT tokens
- `GET /api/jwt-auth/protected` - Access protected resource
- `POST /api/jwt-auth/refresh` - Refresh access token
- `POST /api/jwt-auth/logout` - Invalidate tokens

#### Session Auth
- `POST /api/session-auth/login` - Create session
- `GET /api/session-auth/protected` - Access protected resource
- `POST /api/session-auth/logout` - End session

