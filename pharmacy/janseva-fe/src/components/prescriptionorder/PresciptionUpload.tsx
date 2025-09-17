"use client"

import type React from "react"

import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { useState } from "react"
import { toast } from "react-hot-toast"
import useAuthFacade from "@/facades/useAuthFacade"
import { PRESCRIPTION_UPLOAD } from "@/CONFIG/api-routes"

const formSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientAge: z.string().min(1, "Age is required"),
  patientGender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
    message: "Please select a gender",
  }),
  doctorName: z.string().min(2, "Doctor name is required"),
  weight: z.string().optional(),
  height: z.string().optional(),
  bloodGroup: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true
        return ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].includes(val)
      },
      {
        message: "Invalid blood group",
      },
    ),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PresciptionUploadProps {
  onSuccess?: () => void
}

function PresciptionUpload({ onSuccess }: PresciptionUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { user } = useAuthFacade()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await axiosInstance.post(PRESCRIPTION_UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
    onSuccess: () => {
      toast.success("Prescription uploaded successfully")
      setPreviewImage(null)
      setSelectedFile(null)
      reset()
      onSuccess?.()
    },
    onError: () => {
      toast.error("Failed to upload prescription")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!selectedFile) {
      toast.error("Please select a prescription image")
      return
    }

    const formData = new FormData()
    formData.append("userId", user?.id || "")
    formData.append("prescription", selectedFile)
    formData.append("patientName", data.patientName)
    formData.append("patientAge", data.patientAge)
    formData.append("patientGender", data.patientGender)
    formData.append("doctorName", data.doctorName)
    if (data.weight) {
      formData.append("weight", data.weight)
    }
    if (data.height) {
      formData.append("height", data.height)
    }
    if (data.bloodGroup && data.bloodGroup.trim() !== "") {
      formData.append("bloodGroup", data.bloodGroup)
    }
    if (data.description) {
      formData.append("description", data.description)
    }

    uploadMutation.mutate(formData)
  }

  return (
    <>
      <div className="mb-6">
        <label className="mb-5 block text-xl font-semibold text-[#07074D]">Upload Prescription</label>

        <div className="mb-8">
          <input type="file" name="file" id="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
          <label
            htmlFor="file"
            className="relative flex min-h-[200px] items-center justify-center rounded-md border-2 border-dashed border-[#e0e0e0] p-12 text-center cursor-pointer"
          >
            <div>
              <span className="mb-2 block text-xl font-semibold text-[#07074D]">Drop Prescription files here</span>
              <span className="mb-2 block text-base font-medium text-[#6B7280]">Or</span>
              <span className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D] hover:bg-primary hover:text-white hover:cursor-pointer">
                Browse
              </span>
            </div>
          </label>
        </div>

        {previewImage && (
          <div className="mb-5 rounded-lg bg-[#F5F7FB] p-4">
            <div className="relative">
              <div className="w-full h-[200px] flex items-center justify-center p-3 rounded-lg bg-gray-300 mb-4">
                <img src={previewImage || "/placeholder.svg"} className="h-full object-cover" alt="Preview" />
              </div>
              <span className="truncate pr-3 text-base font-medium text-[#07074D]">{selectedFile?.name}</span>
              <div className="absolute right-2 top-2 rounded-full flex items-center justify-between p-2 bg-white">
                <button
                  className="text-[#07074D]"
                  onClick={() => {
                    setPreviewImage(null)
                    setSelectedFile(null)
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input
              {...register("patientName")}
              placeholder="Enter patient name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Age</label>
              <input
                type="number"
                {...register("patientAge")}
                placeholder="Enter age"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.patientAge && <p className="text-red-500 text-sm mt-1">{errors.patientAge.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                {...register("patientGender")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.patientGender && (
                <p className="text-red-500 text-sm mt-1">{errors.patientGender.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor's Name</label>
            <input
              {...register("doctorName")}
              placeholder="Enter doctor's name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.doctorName && <p className="text-red-500 text-sm mt-1">{errors.doctorName.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg) (Optional)</label>
              <input
                type="number"
                step="0.1"
                {...register("weight")}
                placeholder="Enter weight"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Height (cm) (Optional)</label>
              <input
                type="number"
                {...register("height")}
                placeholder="Enter height"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group (Optional)</label>
            <select
              {...register("bloodGroup")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Add any additional notes or description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="w-full rounded-md bg-primary py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Prescription"}
          </button>
        </form>
      </div>
    </>
  )
}

export default PresciptionUpload
