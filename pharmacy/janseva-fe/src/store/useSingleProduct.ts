import { AlternativeProduct, ProductDetails, ProductVariation } from "@/components/singleProduct/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SingleProductState {
    id: string | null;
    productDetails: ProductDetails | null;
    productAlternative: AlternativeProduct | null;
    productVariations: ProductVariation[] | null;
    currentOption: ProductVariation | null;
    setId: (id: string) => void;
    setProductDetails: (productDetailsParam: ProductDetails) => void;
    setProductAlternative: (productAlternativeParam: AlternativeProduct) => void;
    setProductVariations: (productVariationsParam: ProductVariation[]) => void;
    setCurrentOption: (ProductVariationParam: ProductVariation) => void;
}

const useSingleProduct = create<SingleProductState>()(devtools(
    (set) => ({
        id: null,
        productDetails: null,
        productAlternative: null,
        productVariations: null,
        currentOption: null,
        setId: (id: string) => set({ id }, false, 'setId'),
        setProductDetails: (productDetailsParam: ProductDetails) =>
            set({ productDetails: productDetailsParam }, false, 'setProductDetails'),
        setProductAlternative: (productAlternativeParam: AlternativeProduct) =>
            set({ productAlternative: productAlternativeParam }, false, 'setProductAlternative'),
        setProductVariations: (productVariationsParam: ProductVariation[]) =>
            set({ productVariations: productVariationsParam }, false, 'setProductVariation'),
        setCurrentOption: (ProductVariationParam) => set({ currentOption: ProductVariationParam }, false, 'setCurrentOption')
    })
));

export default useSingleProduct;