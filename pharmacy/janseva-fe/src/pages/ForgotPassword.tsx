import { ErrorMessage } from "@/components/authentication"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FORGOTPASSWORDOTP, LOGIN, VERIFYACCOUNT } from "@/CONFIG/routes"
import { ChevronLeftIcon } from "@heroicons/react/20/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { FORGOTPASSWORD } from "@/CONFIG/api-routes"
import toast from "react-hot-toast";
import Loader from "@/components/Loader"
import useAuthFacade from "@/facades/useAuthFacade"

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address")
});

type Inputs = z.infer<typeof schema>;

export default function ForgotPassword() {
    const navigate = useNavigate();

    const { setUser } = useAuthFacade();


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    })

    const forgotPasswordMutation = useMutation({
        mutationFn: (data: Inputs) => axiosInstance.post(FORGOTPASSWORD, data),
        onSuccess: (response) => {
            const { data } = response;

            // Handle the nested response structure
            if (data.status === "success" && data.data) {
                const responseData = data.data;
                
                if (responseData.isVerified) {
                    if (responseData.success) {
                        setUser(responseData.user);
                        toast.success(responseData.message);
                        navigate(FORGOTPASSWORDOTP);
                    } else {
                        toast.error(responseData.message);
                    }
                } else {
                    navigate(VERIFYACCOUNT);
                    toast.error(responseData.message);
                }
            } else {
                toast.error(data.message || 'An error occurred');
            }
        },
        onError: (error) => {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        forgotPasswordMutation.mutate(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <Link to={LOGIN} className="p-4 bg-gray-100 rounded-full flex justify-center items-center w-[56px] h-[59px]">
                <ChevronLeftIcon height={24} width={24} />
            </Link>

            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Forgot Password</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    Enter your email below to recover your account
                </p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        {...register("email")}
                    />
                    {errors.email && <ErrorMessage message={errors.email.message || ""} />}
                </div>
                <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending ? <Loader /> : "Recover Account"}
                </Button>
            </div>
        </form>
    )
}
