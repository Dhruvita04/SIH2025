'use client';

import React, { useState } from 'react';
import { FaUserMd, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { useRoleAuth } from '../../hooks/useRoleAuth';

const AuthTestPage = () => {
  const { userRole, isAuthenticated, isLoading, refreshAuth } = useRoleAuth();
  const [testCredentials, setTestCredentials] = useState({
    email: 'patient@test.com',
    password: 'password123'
  });
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleTestSignin = async (role: 'Patient' | 'Doctor') => {
    setIsSigningIn(true);
    try {
      const email = role === 'Doctor' ? 'doctor@test.com' : 'patient@test.com';
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: 'password123'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save auth data
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);
        localStorage.setItem('expiryDate', data.tokenExpiryDate);
        
        refreshAuth();
        alert(`Successfully signed in as ${role}!`);
      } else {
        alert('Signin failed');
      }
    } catch (error) {
      console.error('Test signin error:', error);
      alert('Signin error');
    }
    setIsSigningIn(false);
  };

  const handleSignOut = () => {
    localStorage.clear();
    refreshAuth();
    alert('Signed out successfully!');
  };

  const testNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Authentication Test</h1>
        
        {/* Current Auth State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">Loading</h3>
              <p className={`text-lg font-semibold ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isLoading ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">Authenticated</h3>
              <p className={`text-lg font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">User Role</h3>
              <p className={`text-lg font-semibold ${userRole ? 'text-blue-600' : 'text-gray-400'}`}>
                {userRole || 'Not Set'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">User ID</h3>
              <p className="text-sm text-gray-600 truncate">
                {typeof window !== 'undefined' && localStorage.getItem('userId') || 'Not Set'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Authentication */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Authentication</h2>
          
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-gray-600">Sign in with test credentials to test role-based authentication:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleTestSignin('Patient')}
                  disabled={isSigningIn}
                  className="flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FaUser />
                  <span>Sign in as Patient</span>
                  {isSigningIn && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                </button>
                
                <button
                  onClick={() => handleTestSignin('Doctor')}
                  disabled={isSigningIn}
                  className="flex items-center justify-center space-x-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <FaUserMd />
                  <span>Sign in as Doctor</span>
                  {isSigningIn && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                </button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Test Credentials:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Patient:</strong> patient@test.com / password123</p>
                  <p><strong>Doctor:</strong> doctor@test.com / password123</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">✅ Successfully Authenticated</h4>
                <p className="text-green-700">Role: {userRole}</p>
                <p className="text-green-700">Name: {localStorage.getItem('firstName')} {localStorage.getItem('lastName')}</p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Test Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Role-Based Navigation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => testNavigation('/health-records')}
              className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Health Records (Auto-Redirect)
            </button>
            
            <button
              onClick={() => testNavigation('/patientProfile/healthRecords')}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Patient Health Records
            </button>
            
            <button
              onClick={() => testNavigation('/doctorProfile/healthRecords')}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Doctor Health Records
            </button>
            
            <button
              onClick={() => testNavigation('/auth')}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Auth Pages
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Expected Behavior:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              {isAuthenticated ? (
                <>
                  <p>• Health Records should redirect to your role-specific page</p>
                  <p>• Patient Health Records: {userRole === 'Patient' ? '✅ Accessible' : '❌ Access Denied'}</p>
                  <p>• Doctor Health Records: {userRole === 'Doctor' ? '✅ Accessible' : '❌ Access Denied'}</p>
                </>
              ) : (
                <p>• All protected pages should redirect to /auth since you're not authenticated</p>
              )}
            </div>
          </div>
        </div>

        {/* Manual Auth Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Manual Authentication Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => testNavigation('/auth/signin')}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaSignInAlt />
              <span>Go to Sign In Page</span>
            </button>
            
            <button
              onClick={() => testNavigation('/auth/signup')}
              className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaUserPlus />
              <span>Go to Sign Up Page</span>
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                refreshAuth();
                window.location.reload();
              }}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;