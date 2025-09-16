"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleAuth } from '../../hooks/useRoleAuth';

const HealthRecordsRedirect = () => {
  const router = useRouter();
  const { userRole, isAuthenticated, isLoading } = useRoleAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Redirect based on user role
    if (userRole === "Doctor") {
      router.push("/doctorProfile/healthRecords");
    } else if (userRole === "Patient") {
      router.push("/patientProfile/healthRecords");
    } else {
      // If role is unclear, redirect to auth
      router.push('/auth');
    }
  }, [userRole, isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your health records...</p>
        {userRole && (
          <p className="text-sm text-gray-500 mt-2">Detected role: {userRole}</p>
        )}
      </div>
    </div>
  );
};

export default HealthRecordsRedirect;