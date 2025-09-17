import { ProductVariation } from "@/components/singleProduct/types";

export interface Product {
    id: number,
    name: string,
    category: string,
    price: number,
    discount: number,
    discountType: string,
    productImagePath: string,
    imageUrl: string,
    slug: string,
    productVariationsList: ProductVariation[]
}

// id: 0,
//         name: "Product 0",
//         category: "Category 0",
//         price: 100,
//         discountedPrice: 90,
//         productImagePath: productImagePath