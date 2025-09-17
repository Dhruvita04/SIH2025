import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid"


export default function PasswordSummary({ isPasswordValid }: {
    isPasswordValid: {
        minLength: boolean
        hasUpperCase: boolean
        hasNumber: boolean
        hasSpecialChar: boolean
    }
}) {
    return (
        <ul className="list-none p-0 mt-2">
            <PasswordSummaryItem itemValid={isPasswordValid.minLength} message="Password must be at least 8 characters long" />
            <PasswordSummaryItem itemValid={isPasswordValid.hasUpperCase} message="Password must contain at least one uppercase letter" />
            <PasswordSummaryItem itemValid={isPasswordValid.hasNumber} message="Password must contain at least one number" />
            <PasswordSummaryItem itemValid={isPasswordValid.hasSpecialChar} message="Password must contain at least one special character" />
        </ul>
    );
}


function PasswordSummaryItem({ itemValid, message }: { itemValid: boolean, message: string }) {
    return (
        <li className={`flex items-center gap-2 ${itemValid ? "text-green-600" : "text-gray-600"}`}>
            {
                itemValid ?
                    <CheckCircleIcon height={18} width={18} className="text-green-600" />
                    : <XCircleIcon height={18} width={18} className="text-gray-600" />
            }
            {
                message
            }
        </li>

    )
}
