"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  birthDate: string;
  languages: string;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the auth check to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("jwt");
    const expiryDate = localStorage.getItem("expiryDate");
    const userRole = localStorage.getItem("userRole");
    const storedProfile = localStorage.getItem("registeredUser");
    
    if (!token) {
      if (
        pathname !== "/auth/signin" &&
        pathname !== "/auth/signup" &&
        pathname !== "/doctors" &&
        pathname !== "/"
      ) {
        router.push("/auth/signin");
      }
    } else if (
      expiryDate &&
      Math.floor(new Date().getTime() / 1000) > Number(expiryDate)
    ) {
      localStorage.clear();
      router.push("/auth/signin");
      return;
    }

    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfileData(parsedProfile);
      } catch (error) {
        console.error("Error parsing stored profile:", error);
      }
    }
    
    setLoading(false);
  }, [pathname, router]);

  useEffect(() => {
    // Debounce the auth check to prevent excessive calls
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      profileData,
      loading,
      setLoading,
    }),
    [profileData, loading]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};
