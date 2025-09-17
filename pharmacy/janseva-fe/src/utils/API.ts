// axiosInstance.ts
import { LOGIN } from '@/CONFIG/routes';
import axios from 'axios';
import toast from "react-hot-toast";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Set your API base URL
    timeout: 120000, // Set a timeout for requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            }
            return config;
        } catch (err) {
            console.error('Error accessing authentication data:', err);
            return config;
        }
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Handle successful responses
        return response;
    },
    (error) => {
        const { response, request, message } = error;

        // Handle errors
        if (response) {
            if (response.status === 401) {
                // Only redirect if we're not already on a login page
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/signup')) {
                    // Clear auth storage
                    localStorage.removeItem('auth-storage');
                    
                    // Use window.location.replace instead of href to avoid adding to history
                    window.location.replace(LOGIN);
                    return Promise.reject("Unauthorized - Please login again");
                }
            }
            // Don't show toast errors for authentication endpoints during login/signup
            const isAuthEndpoint = error.config?.url?.includes('/auth/');
            if (!isAuthEndpoint) {
                if (response.data?.message) {
                    toast.error(response.data.message);
                } else {
                    toast.error(`Error: ${response.status}`);
                }
            }
        } else if (request) {
            // The request was made but no response was received
            console.error('No response received from the server');
            toast.error('No response received from the server');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error(`Request setup error: ${message}`);
            toast.error(`Error: ${message}`);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
