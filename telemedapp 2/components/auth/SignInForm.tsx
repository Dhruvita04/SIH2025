"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InputComponent from "./InputComponent";
import { useRouter } from "next/navigation";
import { getBackendURL, validateAuthResponse, getUserFromToken } from "../../utils/jwt";
import { useRoleAuth } from "../../hooks/useRoleAuth";

function SignInForm() {
  const router = useRouter();
  const { login } = useRoleAuth();
  const [formValid, setFormValid] = useState(false);
  const [error, setError] = useState<string>("");
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    validateForm();
  }, [formData]);

  const submitButtonClass = [
    "bg-sky-500 text-neutral-50 text-lg	p-3.5	w-full border-none rounded-lg cursor-pointer transition-[background-color]",
    "disabled:bg-neutral-300 disabled:text-neutral-700 disabled:cursor-not-allowed enabled:bg-sky-500",
  ].join(" ");

  const validateForm = () => {
    const { email, password } = formData;
    if (email && password) {
      setFormValid(true);
    } else {
      setFormValid(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   if (!formValid) {
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("jwt");

  //     // const response = await fetch(
  //     //   `${process.env.NEXT_PUBLIC_SERVER_NAME}/login`,
  //     //   {
  //     //     method: "POST",
  //     //     headers: {
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //     mode: "cors",
  //     //     body: JSON.stringify(formData),
  //     //   }
  //     // );
  //     const response = {
  //       ok: true,
  //       json: async () => ({
  //         token
  //       }),
  //     };

  //     if (!response.ok) {
  //       console.log("error in response");
  //       if (response.status === 400) {
  //         setLoading(false);
  //         setSignedIn(false);
  //         setError(true);
  //       }
  //       throw new Error("Failed To Sign In");
  //     }

  //     const users = await response.json();
  //     if (tokenAuthentication(users)) {
  //       localStorage.setItem("jwt", users.token);
  //       localStorage.setItem("expiryDate", users.tokenExpiryDate);
  //       localStorage.setItem("userRole", users.userRole);

  //       localStorage.setItem("userId", users.id);
  //       localStorage.setItem("firstName", users.firstName);
  //       localStorage.setItem("lastName", users.lastName);
  //       setLoading(false);
  //       setError(false);
  //       setSignedIn(true);
  //       router.replace("/");
  //     } else {
  //       console.log("Error During Token Authentication");
  //     }
  //   } catch (error) {
  //     console.error("Error During Sign In:", error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!formValid) {
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to signin with backend...');
      
      // Call the real backend API
      const backendURL = getBackendURL();
      const response = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Login error:', errorData);
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      console.log("Signin success:", data);

      // Validate and extract user info from JWT token
      const authData = validateAuthResponse(data);
      const { token, userInfo } = authData;

      console.log('User info from token:', userInfo);

      // Use the login function from useRoleAuth hook
      const expiryTime = new Date((userInfo.exp * 1000) - 60000).toISOString();
      login(userInfo.role, token, userInfo.id, expiryTime);
      
      setLoading(false);
      setError("");
      setSignedIn(true);
      
      // The login function handles the redirect, no need to do it here
      
    } catch (error: any) {
      console.error("Error During Sign In:", error);
      setLoading(false);
      setSignedIn(false);
      
      // Set specific error message
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.message) {
        if (error.message.includes("Account has not been activated yet")) {
          errorMessage = "Your account is being processed. This usually takes a few moments. Please try signing in again.";
        } else if (error.message.includes("Account has been banned")) {
          errorMessage = "Your account has been suspended. Please contact support for assistance.";
        } else if (error.message.includes("Invalid email or password")) {
          errorMessage = "Incorrect email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "No account found with this email address.";
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-primary">
            <img className="h-10 w-10" src="/assets/logo.png" alt="TeleMedPilot" />
          </div>
          <h2 className="text-4xl font-bold text-gradient-primary">
            Welcome back
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Sign in to your TeleMedPilot account
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-card rounded-3xl shadow-primary p-8 border border-primary-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputComponent
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputComponent
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
              disabled={!formValid || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {signedIn && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  Signed in successfully! Redirecting...
                </p>
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 border border-secondary-200 rounded-xl shadow-secondary bg-gradient-to-r from-secondary-50 to-secondary-100 text-sm font-medium text-secondary-700 hover:from-secondary-100 hover:to-secondary-200 transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-3 px-4 border border-accent-200 rounded-xl shadow-accent bg-gradient-to-r from-accent-50 to-accent-100 text-sm font-medium text-accent-700 hover:from-accent-100 hover:to-accent-200 transition-all duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInForm;
