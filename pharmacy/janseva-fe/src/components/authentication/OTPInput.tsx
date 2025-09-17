import { useEffect, useRef, useState } from "react";

export default function OTPInput({ onChange, value }: { onChange: (value: string) => void, value: string }) {
    const numberOfDigits = 6;
    const [otp, setOtp] = useState<string[]>(value.split('').concat(new Array(numberOfDigits - value.length).fill('')));

    // Create refs for the input fields
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus on the first empty input field when the component mounts or value changes
    useEffect(() => {
        const firstEmptyIndex = otp.findIndex(digit => digit === '');
        if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
            inputRefs.current[firstEmptyIndex]?.focus();
        } else if (inputRefs.current[numberOfDigits - 1]) {
            inputRefs.current[numberOfDigits - 1]?.focus();
        }
    }, [value]);

    // Update OTP state when value prop changes
    useEffect(() => {
        setOtp(value.split('').concat(new Array(numberOfDigits - value.length).fill('')));
    }, [value]);

    // Handle changes in the OTP input fields
    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (isNaN(Number(inputValue))) return; // Only allow numeric input

        const newOtp = [...otp];
        // Allow only one character per input field
        newOtp[index] = inputValue.substring(inputValue.length - 1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Move to the next input field if the current one is filled
        if (inputValue && index < numberOfDigits - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle clicks on the OTP input fields
    const handleClick = (index: number) => {
        inputRefs.current[index]?.setSelectionRange(1, 1);

        // Optional: Focus on the first empty field if the previous field is not filled
        if (index > 0 && !otp[index - 1]) {
            const firstEmptyIndex = otp.indexOf("");
            if (firstEmptyIndex !== -1) {
                inputRefs.current[firstEmptyIndex]?.focus();
            }
        }
    };

    // Handle keydown events on the OTP input fields
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0 &&
            inputRefs.current[index - 1]
        ) {
            // Move focus to the previous input field on backspace
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="grid gap-4 grid-cols-6">
            {
                otp.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder="0"
                        ref={(input) => (inputRefs.current[index] = input)}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onClick={() => handleClick(index)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-[56px] w-[56px] text-center text-lg rounded-md bg-gray-100"
                    />
                ))
            }
        </div>
    );
}
