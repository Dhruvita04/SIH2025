import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AddressState {
    addressId: string | null
    setAddressId: (addressId: string | null) => void
}

export const useAddress = create<AddressState>()(
    persist(
        (set) => ({
            addressId: null,
            setAddressId: (addressId: string | null) => set({ addressId }),
        }),
        {
            name: 'address-storage',
        }
    )
)
