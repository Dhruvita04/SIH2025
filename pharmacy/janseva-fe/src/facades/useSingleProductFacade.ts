import useSingleProduct from '@/store/useSingleProduct';

const useSingleProductFacade = () => {
  const {
    id,
    productDetails,
    productAlternative,
    productVariations,
    setId,
    setProductDetails,
    setProductAlternative,
    setProductVariations,
    setCurrentOption,
    currentOption
  } = useSingleProduct();

  return {
    id,
    productDetails,
    productAlternative,
    productVariations,
    setId,
    setProductDetails,
    setProductAlternative,
    setProductVariations,
    setCurrentOption,
    currentOption
  };
};

export default useSingleProductFacade;

