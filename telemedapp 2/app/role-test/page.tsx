'use client';

import React from 'react';
import { useRoleAuth } from '../../hooks/useRoleAuth';
import RoleProtected from '../../components/common/RoleProtected';
import { debugLocalStorage, setTestUser } from '../../utils/debugAuth';

const RoleTestPage = () => {
  const { userRole, isAuthenticated, isLoading } = useRoleAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Role Authentication Test</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User Role:</strong> {userRole || 'None'}</p>
          </div>
        </div>

        {/* Role-Specific Content */}
        <div className="space-y-6">
          {/* Patient-Only Section */}
          <RoleProtected requiredRole="Patient">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Patient-Only Content</h3>
              <p className="text-blue-600">This content is only visible to patients.</p>
              <button 
                onClick={() => window.location.href = '/patientProfile/healthRecords'}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Patient Health Records
              </button>
            </div>
          </RoleProtected>

          {/* Doctor-Only Section */}
          <RoleProtected requiredRole="Doctor">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Doctor-Only Content</h3>
              <p className="text-green-600">This content is only visible to doctors.</p>
              <button 
                onClick={() => window.location.href = '/doctorProfile/healthRecords'}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Go to Doctor Health Records
              </button>
            </div>
          </RoleProtected>

          {/* Public Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Public Content</h3>
            <p className="text-gray-600">This content is visible to everyone.</p>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                setTestUser('Patient');
                window.location.reload();
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Set Test Patient User
            </button>
            <button
              onClick={() => {
                setTestUser('Doctor');
                window.location.reload();
              }}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Set Test Doctor User
            </button>
            <button
              onClick={() => {
                debugLocalStorage();
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Debug LocalStorage (Check Console)
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear All Data (Test Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleTestPage;