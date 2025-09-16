'use client';

import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '../../hooks/useRoleAuth';

const AuthTestPage = () => {
  const { userRole, isAuthenticated, isLoading, refreshAuth } = useRoleAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        jwt: localStorage.getItem('jwt'),
        userRole: localStorage.getItem('userRole'),
        userId: localStorage.getItem('userId'),
        expiryDate: localStorage.getItem('expiryDate'),
        firstName: localStorage.getItem('firstName'),
        lastName: localStorage.getItem('lastName'),
      });
    }
  }, []);

  const setTestPatient = () => {
    localStorage.setItem('jwt', 'test-jwt-token');
    localStorage.setItem('userRole', 'Patient');
    localStorage.setItem('userId', 'test-patient-123');
    localStorage.setItem('firstName', 'Test');
    localStorage.setItem('lastName', 'Patient');
    localStorage.setItem('expiryDate', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // 24 hours from now
    refreshAuth();
    window.location.reload();
  };

  const setTestDoctor = () => {
    localStorage.setItem('jwt', 'test-jwt-token');
    localStorage.setItem('userRole', 'Doctor');
    localStorage.setItem('userId', 'test-doctor-123');
    localStorage.setItem('firstName', 'Dr. Test');
    localStorage.setItem('lastName', 'Doctor');
    localStorage.setItem('expiryDate', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // 24 hours from now
    refreshAuth();
    window.location.reload();
  };

  const clearAuth = () => {
    localStorage.clear();
    refreshAuth();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Authentication Test & Debug</h1>
        
        {/* Current Auth State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">Is Loading</h3>
              <p className={`text-lg font-semibold ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isLoading ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-600">Is Authenticated</h3>
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
          </div>
        </div>

        {/* LocalStorage Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">LocalStorage Data</h2>
          <div className="space-y-2">
            {Object.entries(localStorageData).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">{key}:</span>
                <span className="text-gray-800 truncate max-w-xs">{String(value) || 'Not Set'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={setTestPatient}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set Test Patient
            </button>
            <button
              onClick={setTestDoctor}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Set Test Doctor
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Auth
            </button>
          </div>
        </div>

        {/* Navigation Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/health-records'}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Health Records (Auto-Redirect)
            </button>
            <button
              onClick={() => window.location.href = '/patientProfile/healthRecords'}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Patient Health Records
            </button>
            <button
              onClick={() => window.location.href = '/doctorProfile/healthRecords'}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Doctor Health Records
            </button>
            <button
              onClick={() => window.location.href = '/health-records-debug'}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Health Records Debug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;