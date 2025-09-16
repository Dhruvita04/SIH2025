"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PiSignInBold } from "react-icons/pi";
import { BsPersonFillAdd } from "react-icons/bs";
import MenuList from "../MenuList/menuList";
import { IoMenu } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineHeart, HiOutlineDocumentText, HiOutlineUserGroup, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useRoleAuth } from '../../hooks/useRoleAuth';

const menuIcon = (
  <div className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200">
    <IoMenu className="h-6 w-6 text-primary-600" />
  </div>
);
const signedInIcon = (
  <div className="p-2 rounded-full hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200">
    <FaUserCircle className="h-8 w-8 text-primary-600" />
  </div>
);

const Navbar = () => {
  const { userRole, isAuthenticated, refreshAuth } = useRoleAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    localStorage.clear();
    refreshAuth(); // Refresh auth state
    router.push("/auth/signin");
  };

  useEffect(() => {
    // No need to manually check token since useRoleAuth handles this
  }, [pathname !== "/"]);

  return (
    <nav className="bg-gradient-to-r from-white/95 via-primary-50/95 to-accent-50/95 backdrop-blur-md border-b border-primary-200 sticky top-0 z-50 shadow-primary">
      <div className="container-max">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow" src="/assets/logo.png" alt="logo" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold gradient-text">TeleMedPilot</span>
          </Link>

          {/* Menu Items */}
          <div className="hidden lg:flex items-center space-x-1">
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-secondary-600 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100 transition-all duration-200 font-medium"
              onClick={() => router.push("/pharmacy")}
            >
              <HiOutlineHeart className="w-4 h-4" />
              <span>Pharmacy</span>
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 transition-all duration-200 font-medium"
              onClick={() => {
                // Route based on user role
                if (userRole === 'Doctor') {
                  router.push("/doctorProfile/healthRecords");
                } else {
                  router.push("/patientProfile/healthRecords");
                }
              }}
            >
              <HiOutlineDocumentText className="w-4 h-4" />
              <span>Health Records</span>
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-accent-600 hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 transition-all duration-200 font-medium"
              onClick={() => router.push("/doctors")}
            >
              <HiOutlineUserGroup className="w-4 h-4" />
              <span>Find A Doctor</span>
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-warm-600 hover:bg-gradient-to-r hover:from-warm-50 hover:to-warm-100 transition-all duration-200 font-medium"
              onClick={() => router.push("/symptom-checker")}
            >
              <HiOutlineMagnifyingGlass className="w-4 h-4" />
              <span>Symptom Checker</span>
            </button>
          </div>

          {/* Right Side (Sign in / Sign up or Profile Menu) */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/signin">
                  <button className="hidden lg:inline-block btn-outline text-sm">
                    Sign in
                  </button>
                  <button className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <PiSignInBold className="h-5 w-5 text-primary-600" />
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="hidden lg:inline-block btn-primary text-sm">
                    Sign up
                  </button>
                  <button className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <BsPersonFillAdd className="h-5 w-5 text-primary-600" />
                  </button>
                </Link>
              </>
            ) : (
              <div>
                <MenuList
                  linkTo={
                    userRole === "Patient"
                      ? [
                          "/patientProfile",
                          "/patientProfile/upcoming_appointments",
                          "/patientProfile/patientDocuments",
                          "/patientProfile/paymentInfo",
                          "/auth/signout",
                        ]
                      : [
                          "/doctorProfile",
                          "/doctorProfile/timeSlots",
                          "/doctorProfile/appointments",
                          "/auth/signout",
                        ]
                  }
                  linkName={
                    userRole === "Patient"
                      ? [
                          "View Profile",
                          "My Appointments",
                          "My Documents",
                          "Wallet",
                          "Sign Out",
                        ]
                      : [
                          "View Profile",
                          "Set Time Slots",
                          "My Appointments",
                          "Sign Out",
                        ]
                  }
                  text={signedInIcon}
                  onSignOut={handleSignOut}
                />
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <MenuList
                linkTo={[
                  "/pharmacy", 
                  userRole === 'Doctor' ? "/doctorProfile/healthRecords" : "/patientProfile/healthRecords", 
                  "/doctors", 
                  "/symptom-checker"
                ]}
                linkName={[
                  "Pharmacy",
                  "Health Records",
                  "Find a Doctor",
                  "Symptom Checker",
                ]}
                text={menuIcon}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
