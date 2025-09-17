export interface PrescriptionFile {
  url: string
  path: string
  hasError: boolean
  errorMessage: string | null
}

export interface Prescription {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  patientAge: number
  patientBloodGroup?: string | null
  patientGender: string
  patientHeight?: number | null
  patientName: string
  patientWeight?: number | null
  prescriptionUrl: string
  doctorName: string
  prescription: {
    url: string
    path: string
    hasError: boolean
    errorMessage: string | null
  }
  status: "UPLOADED" | "IN_REVIEW" | "APPROVED" | "ORDERED" | "REJECTED" | "COMPLETED"
  orderId?: string | null
  orderCreatedAt?: string | null
  rejectionReason?: string | null
  rejectionMessage?: string | null
}


export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PrescriptionData {
  data: Prescription[]
  pagination: PaginationInfo
}

export interface PrescriptionResponse {
  status: string
  message: string
  data: PrescriptionData
}

export interface Coupon {
  discountType: string
  discountValue: string
  minPurchaseAmount: string
  code: string
}