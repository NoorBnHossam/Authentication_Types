import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm';

const JWTAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [protectedData, setProtectedData] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8080/api/jwt-auth/login', {
        username,
        password,
      });
      setToken(response.data.token);
      setIsLoggedIn(true);
      setError(null);
    } catch (err) {
      setError('Invalid credentials');
      setIsLoggedIn(false);
      setToken(null);
    }
  };

  const fetchProtectedData = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/jwt-auth/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProtectedData(response.data.message);
      setError(null);
    } catch (err) {
      setError('Failed to fetch protected data');
      setProtectedData(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
          <h2 className="text-xl font-semibold text-primary-900">JWT Authentication</h2>
          <p className="mt-2 text-primary-700">
            A stateless authentication method using JSON Web Tokens (JWT).
          </p>
        </div>
        <div className="p-6">
          <div className="prose prose-primary max-w-none">
            <h3 className="text-lg font-medium text-gray-900">How it Works</h3>
            <p className="text-gray-600">
              JWT Auth provides a self-contained token that includes encoded user information and permissions.
              The token is signed with a secret key and can be verified without database access. This makes it
              perfect for distributed systems and microservices.
            </p>
            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Key Benefits:</strong> Stateless authentication, no database lookup required for verification,
                    perfect for distributed systems and microservices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn ? (
        <LoginForm
          onSubmit={handleLogin}
          title="JWT Authentication"
          description="Enter your credentials to receive a JWT"
        />
      ) : (
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Authentication Successful
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>You have received a JWT. You can now test the protected route.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={fetchProtectedData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Test Protected Route
                </button>
              </div>
              {protectedData && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-900">Protected Data:</h4>
                  <p className="mt-2 text-sm text-gray-500">{protectedData}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JWTAuth; 