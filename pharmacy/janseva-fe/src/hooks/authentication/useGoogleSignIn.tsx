import { HOME } from '@/CONFIG/routes';
import useAuthFacade from '@/facades/useAuthFacade';
import { useEffect } from 'react';
import toast from "react-hot-toast";

const useGoogleSignIn = (user: any, navigate: (path: string) => void) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'profile email';

    const { isAuthenticated } = useAuthFacade();

    useEffect(() => {
        if (user && isAuthenticated) {
            navigate(HOME);
        }
    }, [user, navigate, isAuthenticated]);

    const handleGoogleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (clientId && redirectUri && scope) {
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
            window.location.href = authUrl;
        } else {
            toast.error('Error in Google SignIn');
        }
    };

    return { handleGoogleSignIn };
};

export default useGoogleSignIn;
