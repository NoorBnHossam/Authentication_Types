import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import BasicAuth from './components/auth/BasicAuth';
import TokenAuth from './components/auth/TokenAuth';
import JWTAuth from './components/auth/JWTAuth';
import SessionAuth from './components/auth/SessionAuth';
import OAuth from './components/auth/OAuth';
import SSO from './components/auth/SSO';
import AuthTest from './components/auth/AuthTest';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
                  <h1 className="text-xl font-bold text-gray-900">Auth Demo</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/basic"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Basic Auth
                  </Link>
                  <Link
                    to="/token"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Token Auth
                  </Link>
                  <Link
                    to="/jwt"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    JWT Auth
                  </Link>
                  <Link
                    to="/session"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Session Auth
                  </Link>
                  <Link
                    to="/oauth"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    OAuth
                  </Link>
                  <Link
                    to="/sso"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    SSO
                  </Link>
                  <Link
                    to="/test"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Auth Tests
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <Routes>
            <Route path="/" element={<BasicAuth />} />
            <Route path="/basic" element={<BasicAuth />} />
            <Route path="/token" element={<TokenAuth />} />
            <Route path="/jwt" element={<JWTAuth />} />
            <Route path="/session" element={<SessionAuth />} />
            <Route path="/oauth" element={<OAuth />} />
            <Route path="/sso" element={<SSO />} />
            <Route path="/test" element={<AuthTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 