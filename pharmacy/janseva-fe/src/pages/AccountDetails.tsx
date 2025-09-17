import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { useState } from "react"
import useAuthFacade from "@/facades/useAuthFacade"
import toast from "react-hot-toast"
import { PROFILE } from "@/CONFIG/api-routes"
import useProfileFacade from "@/facades/useProfileFacade"
import { defaultProfileImagePath } from "@/assets/images"

const accountSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"), 
    age: z.string().transform(Number).pipe(z.number().min(1, "Age must be greater than 0")),
    gender: z.enum(["Male", "Female", "Other"]),
    phone: z.string().regex(/^\d{10}$/, "Invalid phone number"),
    profileImage: z.instanceof(File).optional()
})

type AccountFormData = z.infer<typeof accountSchema>

function AccountDetails() {
    const [preview, setPreview] = useState<string>("")
    const { user } = useAuthFacade()

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema)
    })
    const {  setProfile } = useProfileFacade()

    const { data: accountData } = useQuery({
        queryKey: ['account', user?.id],
        queryFn: async () => {
            const response = await axiosInstance.get(`${PROFILE}/${user?.id}`)
            const data = response.data.data
            
            // Set form values
            setValue('firstName', data.firstName)
            setValue('lastName', data.lastName)
            setValue('age', data.age)
            setValue('gender', data.gender)
            setValue('phone', data.phone)
            setPreview(data.profileImageUrl)
            
            setProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                age: data.age,
                gender: data.gender,
                phone: data.phone,
                profileImageUrl: data.profileImageUrl
            })

            return data
        },
        enabled: !!user?.id
    })

    console.log(accountData);
    

    const mutation = useMutation({
        mutationFn: async (data: AccountFormData) => {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value)
                } else {
                    formData.append(key, String(value))
                }
            })
            return axiosInstance.post(`${PROFILE}/${user?.id}`, formData)
        },
        onSuccess: () => {
            toast.success("Profile details updated successfully")
        },
        onError: () => {
            toast.error("Failed to update profile details")
        }
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setValue('profileImage', file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = (data: AccountFormData) => {
        mutation.mutate(data)
    }
    
    return (
        <div className="w-full md:p-1">
            <h1 className="text-2xl font-bold mb-2">Edit Account Details</h1>
            <p className="text-muted-foreground mb-4">
                Update your account details below.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-4">
                    <div>
                        <label className="text-sm">Profile Image</label>
                        <div className="mt-1 flex items-center gap-4">
                            {preview && <img src={preview || defaultProfileImagePath} alt="Profile" className="w-[80px] h-[80px] rounded-full object-cover flex-shrink-0" />}
                            <Input type="file" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm">First Name</label>
                        <Input {...register('firstName')} placeholder="First Name" className="mt-1" />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm">Last Name</label>
                        <Input {...register('lastName')} placeholder="Last Name" className="mt-1" />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm">Age</label>
                        <Input {...register('age')} placeholder="Age" className="mt-1" />
                        {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm">Phone Number</label>
                        <Input {...register('phone')} placeholder="Phone Number" className="mt-1" />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm">Gender</label>
                        <div className="flex items-center gap-x-4">
                            <span className="flex items-center gap-x-1">
                                <Input type="radio" {...register('gender')} value="Male" className="h-6" />
                                <label>Male</label>
                            </span>
                            <span className="flex items-center gap-x-1">
                                <Input type="radio" {...register('gender')} value="Female" className="h-6" />
                                <label>Female</label>
                            </span>
                            <span className="flex items-center gap-x-1">
                                <Input type="radio" {...register('gender')} value="Other" className="h-6" />
                                <label>Other</label>
                            </span>
                        </div>
                        {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                    </div>

                    <Button type="submit" className="py-5 mt-4" disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Details"}
                    </Button>

                </div>
            </form>
        </div >
    )
}

export default AccountDetails