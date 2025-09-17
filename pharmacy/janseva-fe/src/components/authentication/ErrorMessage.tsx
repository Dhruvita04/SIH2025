import { ExclamationCircleIcon } from '@heroicons/react/20/solid'

function ErrorMessage({ message }: { message: string }) {
    return (
        <span className="flex gap-2 items-center">
            <ExclamationCircleIcon height={18} width={18} className="text-destructive" />
            <p className="text-red-500">{message}</p>
        </span>
    )
}

export default ErrorMessage