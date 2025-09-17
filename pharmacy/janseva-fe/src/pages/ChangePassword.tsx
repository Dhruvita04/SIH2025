import { ErrorMessage, PasswordSummary } from "@/components/authentication"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CHANGEPASSWORD } from "@/CONFIG/api-routes"
import axiosInstance from "@/utils/API"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { MouseEvent, useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

// Define the Zod schema for validation
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query"
import { LOGIN, PASSWORDCHANGESUCCESS } from "@/CONFIG/routes"
import { useNavigate } from "react-router-dom"
import useAuthFacade from "@/facades/useAuthFacade"

const schema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Path of the error in the form
});

type Inputs = z.infer<typeof schema>;

export default function ChangePassword() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { user, resetState, setIsForgotVerified, isForgotVerified } = useAuthFacade();

    const handlePasswordVisibility = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    }

    const navigate = useNavigate();

    useEffect(() => {
        if (!isForgotVerified) {
            navigate(LOGIN);
        }
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>(
        {
            resolver: zodResolver(schema),
        }
    )

    const changePasswordMutation = useMutation({
        mutationFn: (data: Inputs) => axiosInstance.post(CHANGEPASSWORD, { ...data, email: user?.email }),
        onSuccess: (response) => {
            const { data } = response;
            // Handle the nested response structure
            const responseData = data.data || data;
            
            if (data.status === "success" && responseData.success) {
                resetState();
                setIsForgotVerified(false);
                toast.success(responseData.message || data.message);
                navigate(PASSWORDCHANGESUCCESS);
            } else {
                toast.error(responseData.message || data.message || "Password change failed");
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "An error occurred while changing password");
        }
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        changePasswordMutation.mutate(data);
    }

    const isPasswordValid = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[@$!%*?&#]/.test(password),
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Change Password</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    Enter and confirm your new password
                </p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            placeholder="********"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            {...register("password",
                                {
                                    required: true,
                                    onChange: (e) => setPassword(e.target.value)
                                }
                            )}
                        />

                        <button onClick={handlePasswordVisibility} className="top-1/2 -translate-y-1/2 right-[16px] absolute">
                            {
                                showPassword ? <EyeSlashIcon height={18} width={18} /> : <EyeIcon height={18} width={18} />
                            }
                        </button>
                    </div>
                    <PasswordSummary isPasswordValid={isPasswordValid} />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                    </div>
                    <Input
                        id="confirmPassword"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...register("confirmPassword", { required: true })}
                    />
                    {
                        errors.confirmPassword && <ErrorMessage message={errors.confirmPassword.message || ""} />
                    }
                </div>
                <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                </Button>
            </div>
        </form>
    )
}
