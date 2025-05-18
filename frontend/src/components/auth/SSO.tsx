import React, { useState } from 'react';
import axios from 'axios';

const SSO = () => {
  const [error, setError] = useState<string | null>(null);
  const [protectedData, setProtectedData] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleSSOLogin = async () => {
    try {
      // In a real app, this would redirect to the SSO provider
      // For demo purposes, we'll simulate a successful login
      const response = await axios.post('http://localhost:8080/api/sso/login', {
        token: 'demo_token'
      });
      setIsLoggedIn(true);
      setError(null);
    } catch (err) {
      setError('Failed to login with SSO');
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/sso/logout');
      setIsLoggedIn(false);
      setProtectedData(null);
      setError(null);
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const fetchProtectedData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/sso/protected');
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
          <h2 className="text-xl font-semibold text-primary-900">Single Sign-On (SSO)</h2>
          <p className="mt-2 text-primary-700">
            A centralized authentication system that allows users to access multiple applications with one set of credentials.
          </p>
        </div>
        <div className="p-6">
          <div className="prose prose-primary max-w-none">
            <h3 className="text-lg font-medium text-gray-900">How it Works</h3>
            <p className="text-gray-600">
              SSO enables users to authenticate once and gain access to multiple applications without
              having to log in separately to each one. This is commonly used in enterprise environments.
            </p>
            <div className="mt-4 bg-purple-50 border-l-4 border-purple-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    <strong>Key Features:</strong> Centralized authentication, reduced password fatigue,
                    enhanced security through centralized access control. Ideal for enterprise applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Login with SSO
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Click below to authenticate with your organization's SSO provider:</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleSSOLogin}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Login with SSO
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                SSO Login Active
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>You are logged in with SSO. You can now access protected routes.</p>
              </div>
              <div className="mt-5 space-x-4">
                <button
                  type="button"
                  onClick={fetchProtectedData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Test Protected Route
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Logout
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

export default SSO; 