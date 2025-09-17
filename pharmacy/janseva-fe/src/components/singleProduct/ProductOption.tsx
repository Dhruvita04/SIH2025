import useSingleProductFacade from "@/facades/useSingleProductFacade"
import RadioOptions from "./RadioOptions"

const ProductOption = () => {
  const { productVariations } = useSingleProductFacade()

  if (!productVariations || productVariations.length === 0) {
    return null
  }

  // Always use RadioOptions instead of dropdown
  return <RadioOptions options={productVariations} />
}

export default ProductOption
