'use client';

import React, { useState, useEffect } from 'react';
import { FaUserMd, FaUser, FaHeartbeat, FaFileMedical, FaCalendarAlt } from 'react-icons/fa';

const SimpleHealthRecordsPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      setIsLoading(false);
    }
  }, []);

  const setRole = (role: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('jwt', 'test-token');
    localStorage.setItem('userId', `test-${role.toLowerCase()}-123`);
    localStorage.setItem('expiryDate', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
    setUserRole(role);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {userRole === 'Doctor' ? (
                <FaUserMd className="text-3xl text-green-600" />
              ) : (
                <FaUser className="text-3xl text-blue-600" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {userRole === 'Doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                </h1>
                <p className="text-gray-600">Digital Health Records</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Role:</p>
              <p className="text-lg font-semibold text-blue-600">{userRole || 'Not Set'}</p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Test Role Switch</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setRole('Patient')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                userRole === 'Patient' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              <FaUser />
              <span>Patient</span>
            </button>
            <button
              onClick={() => setRole('Doctor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                userRole === 'Doctor' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              <FaUserMd />
              <span>Doctor</span>
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                setUserRole(null);
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear Role
            </button>
          </div>
        </div>

        {/* Content Based on Role */}
        {userRole === 'Patient' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Health Records */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaFileMedical className="text-2xl text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">My Health Records</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Recent Visit</h4>
                  <p className="text-sm text-blue-600">General Checkup - Dec 15, 2024</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Prescription</h4>
                  <p className="text-sm text-blue-600">Paracetamol 500mg - 2x daily</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Lab Results</h4>
                  <p className="text-sm text-blue-600">Blood Test - Normal Range</p>
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaHeartbeat className="text-2xl text-red-600" />
                <h3 className="text-lg font-semibold text-gray-700">Vital Signs</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Pressure:</span>
                  <span className="font-medium">120/80 mmHg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heart Rate:</span>
                  <span className="font-medium">72 bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">98.6°F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">70 kg</span>
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaCalendarAlt className="text-2xl text-green-600" />
                <h3 className="text-lg font-semibold text-gray-700">Appointments</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Upcoming</h4>
                  <p className="text-sm text-green-600">Dr. Smith - Dec 20, 2024</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800">Past</h4>
                  <p className="text-sm text-gray-600">Dr. Johnson - Dec 15, 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {userRole === 'Doctor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaUser className="text-2xl text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">My Patients</h3>
              </div>
              <div className="space-y-3">
                {['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'].map((patient, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">{patient}</h4>
                        <p className="text-sm text-gray-600">Patient ID: P{String(index + 1).padStart(3, '0')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-xs text-gray-500">Last visit: Dec {15 + index}, 2024</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaFileMedical className="text-2xl text-green-600" />
                <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-left">
                  <h4 className="font-medium">Add New Patient Record</h4>
                  <p className="text-sm">Create a new health record</p>
                </button>
                <button className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-left">
                  <h4 className="font-medium">Update Prescription</h4>
                  <p className="text-sm">Modify patient medications</p>
                </button>
                <button className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-left">
                  <h4 className="font-medium">Schedule Appointment</h4>
                  <p className="text-sm">Book patient consultation</p>
                </button>
                <button className="p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-left">
                  <h4 className="font-medium">View Reports</h4>
                  <p className="text-sm">Check lab results and tests</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {!userRole && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">No Role Selected</h3>
            <p className="text-gray-600 mb-4">Please select a role to view the appropriate health records interface.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setRole('Patient')}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaUser />
                <span>I'm a Patient</span>
              </button>
              <button
                onClick={() => setRole('Doctor')}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaUserMd />
                <span>I'm a Doctor</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/auth-test'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Auth Test
            </button>
            <button
              onClick={() => window.location.href = '/health-records'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Health Records
            </button>
            <button
              onClick={() => window.location.href = '/patientProfile/healthRecords'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Patient Records
            </button>
            <button
              onClick={() => window.location.href = '/doctorProfile/healthRecords'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Doctor Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHealthRecordsPage;