import { Button } from "@/components/ui/button"
import { LOGIN } from "@/CONFIG/routes"
import { memo } from "react"
import { Link } from "react-router-dom"




const PasswordChangeSuccess = () => {


    return (
        <div className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <p className="text-[2rem] h-[88px] w-[88px] flex justify-center items-center bg-green-100 rounded-full ">🎉</p>
                <h1 className="text-3xl font-bold md:text-left">Password Changed Successfully</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    Your password has been changed successfully. Please login with your new password
                </p>
            </div>
            <div className="grid gap-4">
                <Link to={LOGIN}>
                    <Button className="w-full">
                        Go To Login
                    </Button>
                </Link>
            </div>
        </div>
    )
}


export default memo(PasswordChangeSuccess)