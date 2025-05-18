import React, { useState, ChangeEvent, FC } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  KeyIcon,
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ServerIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

interface Endpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  requiresAuth: boolean;
  authType?: 'basic' | 'token' | 'jwt' | 'session' | 'oauth' | 'sso';
  defaultBody?: Record<string, unknown>;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
  error?: string;
}

interface ResponseData {
  status: number;
  headers: Record<string, string>;
  data: AuthResponse;
}

const AuthTest: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [authToken, setAuthToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const endpoints: Record<string, Endpoint> = {
    'basic-auth-login': {
      name: 'Basic Auth Login',
      path: '/api/basic-auth/login',
      method: 'POST',
      description: 'Login using Basic Authentication',
      requiresAuth: false,
      authType: 'basic',
      defaultBody: {
        username: 'admin',
        password: 'admin123'
      }
    },
    'basic-auth-protected': {
      name: 'Basic Auth Protected',
      path: '/api/basic-auth/protected',
      method: 'GET',
      description: 'Access protected route using Basic Auth',
      requiresAuth: true,
      authType: 'basic'
    },
    'token-auth-login': {
      name: 'Token Auth Login',
      path: '/api/token-auth/login',
      method: 'POST',
      description: 'Login to get an access token',
      requiresAuth: false,
      authType: 'token',
      defaultBody: {
        username: 'admin',
        password: 'admin123'
      }
    },
    'token-auth-protected': {
      name: 'Token Auth Protected',
      path: '/api/token-auth/protected',
      method: 'GET',
      description: 'Access protected route using Token Auth',
      requiresAuth: true,
      authType: 'token'
    },
    'jwt-auth-login': {
      name: 'JWT Auth Login',
      path: '/api/jwt-auth/login',
      method: 'POST',
      description: 'Login to get JWT tokens',
      requiresAuth: false,
      authType: 'jwt',
      defaultBody: {
        username: 'admin',
        password: 'admin123'
      }
    },
    'jwt-auth-protected': {
      name: 'JWT Auth Protected',
      path: '/api/jwt-auth/protected',
      method: 'GET',
      description: 'Access protected route using JWT',
      requiresAuth: true,
      authType: 'jwt'
    },
    'jwt-auth-refresh': {
      name: 'JWT Refresh Token',
      path: '/api/jwt-auth/refresh',
      method: 'POST',
      description: 'Refresh JWT access token',
      requiresAuth: true,
      authType: 'jwt'
    },
    'jwt-auth-logout': {
      name: 'JWT Logout',
      path: '/api/jwt-auth/logout',
      method: 'POST',
      description: 'Logout and invalidate JWT tokens',
      requiresAuth: true,
      authType: 'jwt'
    },
    'session-auth-login': {
      name: 'Session Auth Login',
      path: '/api/session-auth/login',
      method: 'POST',
      description: 'Login to create a session',
      requiresAuth: false,
      authType: 'session',
      defaultBody: {
        username: 'admin',
        password: 'admin123'
      }
    },
    'session-auth-protected': {
      name: 'Session Auth Protected',
      path: '/api/session-auth/protected',
      method: 'GET',
      description: 'Access protected route using Session',
      requiresAuth: true,
      authType: 'session'
    },
    'session-auth-logout': {
      name: 'Session Logout',
      path: '/api/session-auth/logout',
      method: 'POST',
      description: 'Logout and invalidate session',
      requiresAuth: true,
      authType: 'session'
    }
  };

  const addTestResult = (result: string): void => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const getAuthHeaders = (endpoint: Endpoint): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (endpoint.requiresAuth) {
      switch (endpoint.authType) {
        case 'token':
        case 'jwt':
          headers['Authorization'] = `Bearer ${authToken}`;
          break;
        case 'session':
          headers['Cookie'] = `session=${sessionId}`;
          break;
      }
    }

    return headers;
  };

  const handleEndpointSelect = (endpointId: string): void => {
    setSelectedEndpoint(endpointId);
    const endpoint = endpoints[endpointId];
    if (endpoint.defaultBody) {
      setRequestBody(JSON.stringify(endpoint.defaultBody, null, 2));
    } else {
      setRequestBody('{}');
    }
  };

  const runTest = async (): Promise<void> => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setResponseData(null);
    const endpoint = endpoints[selectedEndpoint];

    try {
      let response: AxiosResponse<AuthResponse>;
      const headers = getAuthHeaders(endpoint);
      const body = requestBody ? JSON.parse(requestBody) : undefined;

      switch (endpoint.method) {
        case 'GET':
          response = await axios.get<AuthResponse>(`http://localhost:8080${endpoint.path}`, { headers });
          break;
        case 'POST':
          response = await axios.post<AuthResponse>(`http://localhost:8080${endpoint.path}`, body, { headers });
          break;
        case 'PUT':
          response = await axios.put<AuthResponse>(`http://localhost:8080${endpoint.path}`, body, { headers });
          break;
        case 'DELETE':
          response = await axios.delete<AuthResponse>(`http://localhost:8080${endpoint.path}`, { headers });
          break;
      }

      // Handle successful responses
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
      }
      if (response.headers['set-cookie']) {
        const sessionCookie = response.headers['set-cookie']
          .find((cookie: string) => cookie.startsWith('session='));
        if (sessionCookie) {
          const newSessionId = sessionCookie.split(';')[0].split('=')[1];
          setSessionId(newSessionId);
        }
      }

      setResponseData({
        status: response.status,
        headers: response.headers as Record<string, string>,
        data: response.data
      });

      addTestResult(`✅ Success: ${endpoint.name} completed with status ${response.status}`);
    } catch (error: any) {
      setResponseData({
        status: error.response?.status || 500,
        headers: error.response?.headers as Record<string, string> || {},
        data: error.response?.data || { error: error.message }
      });

      addTestResult(`❌ Error: ${endpoint.name} failed - ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const clearResults = (): void => {
    setTestResults([]);
    setResponseData(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
        <h2 className="text-2xl font-bold">Authentication Test Suite</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Endpoint Selection */}
        <div className="space-y-6">
          {/* Endpoint Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ServerIcon className="h-6 w-6 text-gray-500" />
              <h3 className="text-xl font-semibold">Select Endpoint</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(endpoints).map(([id, endpoint]) => (
                <div
                  key={id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEndpoint === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleEndpointSelect(id)}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className={`h-5 w-5 ${endpoint.requiresAuth ? 'text-blue-500' : 'text-gray-400'}`} />
                    <h4 className="font-medium">{endpoint.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      <CodeBracketIcon className="h-3 w-3" />
                      {endpoint.method}
                    </span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      <ArrowRightIcon className="h-3 w-3" />
                      {endpoint.path}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Token Input */}
          {selectedEndpoint && endpoints[selectedEndpoint].requiresAuth && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyIcon className="h-6 w-6 text-gray-500" />
                <h3 className="text-xl font-semibold">Authentication</h3>
              </div>
              <div className="space-y-4">
                {(endpoints[selectedEndpoint].authType === 'token' || 
                  endpoints[selectedEndpoint].authType === 'jwt') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={authToken}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setAuthToken(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded"
                        placeholder="Enter auth token"
                      />
                      <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                )}
                {endpoints[selectedEndpoint].authType === 'session' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sessionId}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSessionId(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded"
                        placeholder="Enter session ID"
                      />
                      <ClockIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Request Body and Response */}
        <div className="space-y-6">
          {/* Request Body */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-6 w-6 text-gray-500" />
              <h3 className="text-xl font-semibold">Request Body</h3>
            </div>
            <textarea
              value={requestBody}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRequestBody(e.target.value)}
              className="w-full h-48 px-3 py-2 border rounded font-mono text-sm"
              placeholder="Enter JSON request body"
            />
          </div>

          {/* Run Test Button */}
          <button
            onClick={runTest}
            disabled={loading || !selectedEndpoint}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-5 w-5" />
                Run Test
              </>
            )}
          </button>

          {/* Response Display */}
          {responseData && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <ServerIcon className="h-6 w-6 text-gray-500" />
                <h3 className="text-xl font-semibold">Response</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${
                    responseData.status >= 200 && responseData.status < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {responseData.status >= 200 && responseData.status < 300 ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5" />
                    )}
                    {responseData.status}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Headers</h4>
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(responseData.headers, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Body</h4>
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(responseData.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test History */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-gray-500" />
            <h3 className="text-xl font-semibold">Test History</h3>
          </div>
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <XMarkIcon className="h-5 w-5" />
            Clear History
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run some tests to see results here.</p>
          ) : (
            <ul className="space-y-2">
              {testResults.map((result, index) => (
                <li key={index} className="font-mono text-sm flex items-center gap-2">
                  {result.includes('✅') ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  {result}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTest; 