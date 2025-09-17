import { useAddress } from "@/store/useAddress"

const useAddressFacade = () => {
    const { addressId, setAddressId } = useAddress()

    return {
        addressId,
        setAddressId
    }
}

export default useAddressFacade
