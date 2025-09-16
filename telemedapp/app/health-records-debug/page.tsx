'use client';

import React from 'react';
import { useRoleAuth } from '../../hooks/useRoleAuth';
import DigitalHealthRecords from '../../components/patientProfile/DigitalHealthRecords';
import DoctorHealthRecords from '../../components/doctorProfile/DoctorHealthRecords';

const SimpleHealthRecordsPage = () => {
  const { userRole, isAuthenticated, isLoading } = useRoleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Health Records Debug</h1>
          <div className="space-y-2">
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User Role:</strong> {userRole || 'Not set'}</p>
            <p><strong>JWT Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('jwt') ? 'Present' : 'Missing'}</p>
            <p><strong>User ID:</strong> {typeof window !== 'undefined' && localStorage.getItem('userId') ? 'Present' : 'Missing'}</p>
            <p><strong>Expiry Date:</strong> {typeof window !== 'undefined' && localStorage.getItem('expiryDate') || 'Not set'}</p>
          </div>
        </div>

        {isAuthenticated ? (
          <div>
            {userRole === 'Patient' && <DigitalHealthRecords />}
            {userRole === 'Doctor' && <DoctorHealthRecords />}
            {!userRole && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>User role not detected. Please sign in again.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Not authenticated. Please sign in.</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleHealthRecordsPage;