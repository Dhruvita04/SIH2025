export declare class CreatePrescriptionDto {
    userId: string;
    patientName: string;
    patientAge: number;
    doctorName: string;
    patientGender: string;
    prescriptionUrl: string;
    patientWeight?: number | null;
    patientHeight?: number | null;
    patientBloodGroup?: string | null;
}
