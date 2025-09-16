"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUser, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import debounce from "@/utils/debounce";
import { getBackendURL, getUserFromToken, isTokenExpired, shouldRedirectToLogin, clearAuthData } from "@/utils/jwt";

interface PatientItem {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  lastVisit?: string | null;
  totalAppointments?: number;
}

const DoctorHealthRecords = () => {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [tokenDebugInfo, setTokenDebugInfo] = useState<any>(null);

  // Function to validate and debug token
  const validateToken = () => {
    // Check if should redirect to login (clears invalid tokens)
    if (shouldRedirectToLogin()) {
      return { valid: false, error: "No valid authentication found. Please sign in again." };
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      return { valid: false, error: "No token found after validation" };
    }

    // Get user info from token
    const userInfo = getUserFromToken(token);
    if (!userInfo) {
      clearAuthData();
      return { valid: false, error: "Cannot decode user information from token" };
    }

    // Check if user has doctor role
    if (userInfo.role !== "Doctor") {
      return { valid: false, error: `Invalid role: ${userInfo.role}. Expected: Doctor` };
    }

    // Check if required fields are present
    if (!userInfo.id) {
      return { valid: false, error: "Token missing user ID" };
    }

    return { 
      valid: true, 
      userInfo, 
      expiresAt: new Date(userInfo.exp * 1000).toISOString() 
    };
  };

  const fetchPatients = async (q?: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Validate token before making request
      const tokenValidation = validateToken();
      setTokenDebugInfo(tokenValidation);
      
      if (!tokenValidation.valid) {
        setError(`Authentication Error: ${tokenValidation.error}`);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("jwt");
      const baseUrl = getBackendURL();
      const url = q && q.trim().length >= 2
        ? `${baseUrl}/doctor/patient-records/patients/search?searchTerm=${encodeURIComponent(q.trim())}`
        : `${baseUrl}/doctor/patient-records/patients`;

      console.log("Making request to:", url);
      console.log("Token validation:", tokenValidation);

      const res = await fetch(url, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        cache: "no-store",
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response body:", errorText);
        
        if (res.status === 401) {
          setError("Authentication failed. Your session may have expired. Please sign in again.");
        } else if (res.status === 403) {
          setError("Access denied. You may not have the required permissions.");
        } else {
          setError(`Failed to load patients (${res.status}): ${errorText}`);
        }
        return;
      }

      const data = await res.json();
      console.log("Success response:", data);
      const list: PatientItem[] = data.patients || data.data || data || [];
      setPatients(list);
    } catch (e: any) {
      console.error("Error fetching patients:", e);
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Validate authentication on component mount
    const tokenValidation = validateToken();
    setTokenDebugInfo(tokenValidation);
    
    if (!tokenValidation.valid) {
      setError(`Authentication Error: ${tokenValidation.error}`);
      // Don't fetch patients if not authenticated
      return;
    }
    
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedFetch = useMemo(() => debounce((q: string) => fetchPatients(q), 400), []);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    debouncedFetch(v);
  };

  const openPatient = (patientId: string) => {
    // Navigate to existing patient history page used elsewhere in the app
    window.location.href = `/doctorProfile/patientHistory/${patientId}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            placeholder="Search by name, email, or phone"
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Debug Panel - Show in development or when there are issues */}
      {(process.env.NODE_ENV === 'development' || tokenDebugInfo?.valid === false) && tokenDebugInfo && (
        <div className={`p-3 rounded border ${tokenDebugInfo.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className={tokenDebugInfo.valid ? 'text-green-600' : 'text-yellow-600'} />
            <span className="font-semibold">Token Debug Info</span>
          </div>
          <div className="text-sm space-y-1">
            <div>Status: {tokenDebugInfo.valid ? '✅ Valid' : '❌ Invalid'}</div>
            {tokenDebugInfo.error && <div>Error: {tokenDebugInfo.error}</div>}
            {tokenDebugInfo.userInfo && (
              <>
                <div>Role: {tokenDebugInfo.userInfo.role}</div>
                <div>User ID: {tokenDebugInfo.userInfo.id}</div>
                <div>Expires: {tokenDebugInfo.expiresAt}</div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Error Loading Patients</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {(error.includes("session") || error.includes("sign in") || error.includes("Authentication")) && (
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  onClick={() => (window.location.href = "/auth/signin")}
                >
                  Sign In
                </button>
              )}
              <button
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                onClick={() => {
                  setError("");
                  const validation = validateToken();
                  if (validation.valid) {
                    fetchPatients();
                  }
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading patients…</div>
      ) : patients.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No patients found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => openPatient(String(p.id))}
              className="w-full text-left p-4 hover:bg-gray-50 flex items-center gap-4"
            >
              {p.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.profilePicture}
                  alt={`${p.firstName} ${p.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {p.firstName} {p.lastName}
                  </span>
                  {p.email && (
                    <span className="text-xs text-gray-500">{p.email}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 flex gap-4 mt-1">
                  {p.phone && <span>{p.phone}</span>}
                  {typeof p.totalAppointments === 'number' && (
                    <span>{p.totalAppointments} appointments</span>
                  )}
                </div>
              </div>

              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center justify-end gap-1">
                  <FaCalendarAlt />
                  <span>
                    {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "No visits"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorHealthRecords;
