import { CHANGEPASSWORD } from "@/CONFIG/routes";
import { OTPInput } from "@/components/authentication";
import { Button } from "@/components/ui/button";
import useAuthFacade from "@/facades/useAuthFacade";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/API";
import Loader from "@/components/Loader";

const ForgotPasswordOTP = () => {
    const { user, setIsForgotVerified } = useAuthFacade();
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    // Redirect if no user email
    if (!user?.email) {
        return (
            <div className="mx-auto grid w-[350px] md:w-[450px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Error</h1>
                    <p className="text-balance text-muted-foreground">
                        No email found. Please try forgot password again.
                    </p>
                </div>
                <Button onClick={() => navigate("/auth/forgotpassword")} className="w-full">
                    Go to Forgot Password
                </Button>
            </div>
        );
    }

    const verifyOtpMutation = useMutation({
        mutationFn: (data: { email: string; otp: string; type: string }) => 
            axiosInstance.post('/auth/validateforgotpasswordotp', data),
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
                setIsForgotVerified(true);
                navigate(CHANGEPASSWORD);
            } else {
                toast.error(message || "OTP verification failed");
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'OTP verification failed';
            toast.error(errorMessage);
        }
    });

    const resendOtpMutation = useMutation({
        mutationFn: (data: { email: string; type: string }) => 
            axiosInstance.post('/auth/resendotp', data),
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
            } else {
                toast.error(message || "Failed to resend OTP");
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend OTP';
            toast.error(errorMessage);
        }
    });

    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        if (!user?.email) {
            toast.error("Email not found. Please try again.");
            return;
        }

        verifyOtpMutation.mutate({
            email: user.email,
            otp,
            type: "PASSWORD_RESET"
        });
    };

    const handleResendOtp = () => {
        if (!user?.email) {
            toast.error("Email not found. Please try again.");
            return;
        }

        resendOtpMutation.mutate({
            email: user.email,
            type: "PASSWORD_RESET"
        });
    };

    return (
        <div className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Verify OTP</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    We've sent a 6-digit verification code to <strong>{user.email}</strong>
                </p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <OTPInput value={otp} onChange={setOtp} />
                </div>
                <Button 
                    onClick={handleVerifyOtp} 
                    className="w-full" 
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                >
                    {verifyOtpMutation.isPending ? <Loader /> : "Verify OTP"}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={handleResendOtp} 
                    className="w-full"
                    disabled={resendOtpMutation.isPending}
                >
                    {resendOtpMutation.isPending ? <Loader /> : "Resend OTP"}
                </Button>
            </div>
        </div>
    );
};

export default ForgotPasswordOTP;
