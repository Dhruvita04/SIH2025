import { orderPlacedIconPath, orderRejectedIconPath, reviewInProgressIconPath, uploadPrescriptionIconPath } from "@/assets/icons"
import { ORDER_PRESCRIPTION } from "@/CONFIG/routes";
import {  useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

// function PrescriptionReview() {
function PrescriptionReview({ step, reason }: { step: number, reason?: string }) {

    const PrescriptionStepDetails = [
        {
            icon: uploadPrescriptionIconPath,
            title: "Your Prescription is Uploaded",
            description: "Please be patient, it may take a 24 hours to get your prescription reviewed"
        },
        {
            icon: reviewInProgressIconPath,
            title: "Your Prescription is Checked",
            description: "Our doctor have check your prescription and approve it"
        },
        {
            icon: orderPlacedIconPath,
            title: "Your Prescription is Approved",
            description: "Your prescription has been approved, and your order is now in your cart. Please proceed with payment to complete your purchase."
        },{
            icon: orderRejectedIconPath,
            title: "Your Prescription is Rejected",
            description: "Your prescription is rejected by our doctor"
        }
    ];

    const navigate = useNavigate();

    return (
        <>
            <div className="flex flex-col items-center">
                <img className="h-[140px]" src={PrescriptionStepDetails[step].icon} alt="" />
                <h2 className="mt-4 mb-2 text-xl font-bold">{PrescriptionStepDetails[step].title}</h2>
                <p className="text-center text-gray-600">{PrescriptionStepDetails[step].description}</p>
                {step === 3 && reason && <p className="text-center text-red-600 text-2xl mt-8"><b>Reason: </b>{reason}</p>}
            </div>

            <Button onClick={() => navigate(ORDER_PRESCRIPTION)} className="mt-4 w-full py-6 rounded-lg">Upload New Prescription</Button>
        </>
    )
}

export default PrescriptionReview