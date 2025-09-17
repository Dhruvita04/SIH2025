import { LOGIN } from "@/CONFIG/routes";
import { OTPInput } from "@/components/authentication";
import { Button } from "@/components/ui/button";
import useAuthFacade from "@/facades/useAuthFacade";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/API";
import Loader from "@/components/Loader";

const VerifyAccount = () => {
    const { user } = useAuthFacade();
    const [otp, setOtp] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();

    // Start cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Redirect if no user email
    if (!user?.email) {
        return (
            <div className="mx-auto grid w-[350px] md:w-[450px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Error</h1>
                    <p className="text-balance text-muted-foreground">
                        No email found. Please sign up again.
                    </p>
                </div>
                <Link to="/auth/signup">
                    <Button className="w-full">Go to Signup</Button>
                </Link>
            </div>
        );
    }

    const verifyOtpMutation = useMutation({
        mutationFn: (data: { email: string; otp: string; type: string }) => 
            axiosInstance.post('/auth/verifyaccount', data),
        onSuccess: (response) => {
            const { data: responseData } = response;
            const { status, message } = responseData;
            
            if (status === "success") {
                toast.success(message || "Account verified successfully");
                navigate(LOGIN);
            } else {
                toast.error(message || "Verification failed");
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Verification failed';
            toast.error(errorMessage);
        }
    });

    const resendOtpMutation = useMutation({
        mutationFn: (data: { email: string; type: string }) => 
            axiosInstance.post('/auth/resendotp', data),
        onSuccess: (response) => {
            const { data: responseData } = response;
            const { status, message } = responseData;
            
            if (status === "success") {
                toast.success(message || "OTP sent successfully");
                setResendCooldown(30); // Start 30 second cooldown
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
            toast.error("Email not found. Please sign up again.");
            return;
        }

        verifyOtpMutation.mutate({
            email: user.email,
            otp,
            type: "REGISTRATION"
        });
    };

    const handleResendOtp = () => {
        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before resending`);
            return;
        }

        if (!user?.email) {
            toast.error("Email not found. Please sign up again.");
            return;
        }

        resendOtpMutation.mutate({
            email: user.email,
            type: "REGISTRATION"
        });
    };

    return (
        <div className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Verify Account</h1>
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
                    {verifyOtpMutation.isPending ? <Loader /> : "Verify Account"}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={handleResendOtp} 
                    className="w-full"
                    disabled={resendOtpMutation.isPending || resendCooldown > 0}
                >
                    {resendOtpMutation.isPending ? (
                        <Loader />
                    ) : resendCooldown > 0 ? (
                        `Resend OTP (${resendCooldown}s)`
                    ) : (
                        "Resend OTP"
                    )}
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to={LOGIN} className="underline">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default VerifyAccount;
