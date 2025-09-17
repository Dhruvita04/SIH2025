import { ProgressTracker } from "@/components/checkout"
import { PrescriptionReview } from "@/components/prescriptionorder";
import BackButton from "@/components/ui/BackButton"
import { PRESCRIPTION_ORDER_STATUS } from "@/CONFIG/api-routes";
import axiosInstance from "@/utils/API";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function OrderPrescriptionDetails() {

    // const [currentStatus, setCurrentStatus] = useState("UPLOADED");
    const [currentStep, setCurrentStep] = useState(0);

    const steps: string[] = ["Prescription Uploaded", "Prescription Checked", "Order Placed"];
    // const currentStep: number = 0;

    const { id } = useParams();

    const getPrescriptionDetails = async () => {
        const response = await axiosInstance.get(`${PRESCRIPTION_ORDER_STATUS}/${id}`);
        return response.data;
    }

    const { data: prescription } = useQuery({
        queryKey: ["prescription-details", id],
        queryFn: () => getPrescriptionDetails()
    })

    useEffect(() => {
        if (prescription) {
            setCurrentStep(getCurrentStep(prescription.data.status));
        }
    }, [prescription])

    const getCurrentStep = (status: string) => {
        switch (status) {
            case "UPLOADED":
                return 0;
            case "APPROVED":
                return 1;
            case "ORDERED":
                return 2;
            case "REJECTED":
                return 3;
            default:
                return 0;
        }
    }




    const getStepComponentBasedOnStep = (step: number) => {
        switch (step) {
            case 0:
                return <PrescriptionReview step={step} />;
            case 1:
                return <PrescriptionReview step={step} />;
            case 2:
                return <PrescriptionReview step={step} />;
            case 3:
                return <PrescriptionReview step={step} reason={prescription?.data?.data?.rejectionReason} />;
        }
    }



    return (
        <div className="w-full px-[12px] md:px-[20px]">
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-4">
                    <BackButton />
                    <div className="mt-4 flex flex-col gap-12">
                        <div className="flex justify-center">
                        <ProgressTracker steps={steps} currentStep={currentStep} />
                        </div>


                        <div className="w-1/2 mx-auto">
                            {
                                getStepComponentBasedOnStep(currentStep)
                            }
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPrescriptionDetails
