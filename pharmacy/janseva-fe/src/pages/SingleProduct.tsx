"use client"

import { ProductSlider } from "@/components/home"
import { Features, ProductGallery, ProductOption } from "@/components/singleProduct"
import type { ProductDetails, AlternativeProduct, ProductVariation } from "@/components/singleProduct/types"
import { Button } from "@/components/ui/button"
import { CART_ADD, PRODUCTS } from "@/CONFIG/api-routes"
import useSingleProductFacade from "@/facades/useSingleProductFacade"
import axiosInstance from "@/utils/API"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./singleProduct.css"
import ProductCard from "@/components/ProductCard"
import AlternativeProductComponent from "@/components/singleProduct/AlternativeProduct"
import ProductPrice from "@/components/singleProduct/ProductPrice"
import useCartFacade from "@/facades/useCartFacade"
import { ShoppingBagIcon } from "lucide-react"
import toast from "react-hot-toast"
import useAuthFacade from "@/facades/useAuthFacade"

interface ProductDetailsResponse {
  status: string
  message: string
  data: {
    alternativeDetails: AlternativeProduct
    productDetails: ProductDetails
    variationsDetails: ProductVariation[]
  }
}

function SingleProduct() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthFacade()
  const { addToCart, generateCartId, cartItems } = useCartFacade()
  const { setProductDetails, setProductAlternative, setProductVariations, setCurrentOption, currentOption } =
    useSingleProductFacade()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<ProductDetailsResponse | null>(null)

  const { mutate: addToCartMutate, isPending } = useMutation({
    mutationFn: (payload: any) => {
      return axiosInstance.post(CART_ADD, payload)
    },
    onSuccess: () => {
      toast.success("Cart item synced to server")
    },
    onError: () => {
      toast.error("Failed to sync cart item to server")
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return

      try {
        const response = await axiosInstance.get(`${PRODUCTS}${slug}`)
        setData(response.data)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug])

  useEffect(() => {
    if (data?.data) {
      const { productDetails, variationsDetails, alternativeDetails } = data.data
      if (productDetails && variationsDetails) {
        setProductDetails(productDetails)
        setProductVariations(variationsDetails)
        if (variationsDetails.length !== 0) {
          setCurrentOption(variationsDetails[0])
        }
      }

      if (alternativeDetails) {
        setProductAlternative(alternativeDetails)
      }
    }
  }, [data, setProductDetails, setProductVariations, setProductAlternative, setCurrentOption])

  // Check if specific product variant is in cart
  const isProductVariantInCart = (productSlug: string, variantId: string): boolean =>
    cartItems.some(
      (item) => item.cartItem.productDetails.slug === productSlug && item.cartItem.currentOption.id === variantId,
    )

  // Get cart item for specific product variant
  const getCartItemForVariant = (productSlug: string, variantId: string) =>
    cartItems.find(
      (item) => item.cartItem.productDetails.slug === productSlug && item.cartItem.currentOption.id === variantId,
    )

  const handleAddToCart = () => {
    if (currentOption && data?.data?.productDetails) {
      const generatedId = generateCartId()

      // Always add to local cart first
      addToCart({
        id: generatedId,
        quantity: 1,
        cartItem: {
          productDetails: data.data.productDetails,
          currentOption: currentOption,
        },
      })

      // Only sync to server if user is logged in
      if (user) {
        addToCartMutate({
          userId: user?.id,
          productId: data.data.productDetails.id,
          quantity: 1,
          variantId: currentOption.id,
        })
      } else {
        toast.success("Item added to cart")
      }
    }
  }

  const handleGoToCart = () => {
    navigate("/cart")
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full p-[12px] md:p-[20px] grid grid-cols-4 md:grid-cols-12 gap-x-4">
        <div className="col-span-4 md:col-span-9 grid grid-cols-12 gap-x-4">
          <div className="col-span-12 md:col-span-6">
            <div className="bg-muted animate-pulse rounded-lg h-96 mb-4"></div>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="space-y-4">
              <div className="bg-muted animate-pulse h-8 w-3/4 rounded"></div>
              <div className="bg-muted animate-pulse h-6 w-1/2 rounded"></div>
              <div className="bg-muted animate-pulse h-6 w-1/3 rounded"></div>
              <div className="bg-muted animate-pulse h-12 w-full rounded"></div>
              <div className="bg-muted animate-pulse h-10 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-full p-[12px] md:p-[20px] flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-card border border-border rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load the product information. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return null
  }

  const { productDetails, alternativeDetails } = data.data
  const {
    name,
    brand,
    category,
    uses,
    direction,
    routeOfAdministration,
    sideEffects,
    medActivity,
    precaution,
    interactions,
    dosageInformation,
    storage,
    dietAndLifestyleGuidance,
    highlights,
    ingredients,
    keyUses,
    howToUse,
    safetyInformation,
    additionalInfo,
    composition,
  } = productDetails

  // Check if current variant is in cart
  const isCurrentVariantInCart = currentOption ? isProductVariantInCart(productDetails.slug, currentOption.id) : false
  const currentCartItem = currentOption ? getCartItemForVariant(productDetails.slug, currentOption.id) : null

  return (
    <>
      <div className="w-full max-w-full p-[12px] md:p-[20px] grid grid-cols-4 md:grid-cols-12 gap-x-4 overflow-visible">
        <div className="col-span-4 md:col-span-9 grid grid-cols-12 gap-x-4 overflow-visible">
          <div className="col-span-12 md:col-span-6 md:sticky md:top-4 md:self-start">
            <ProductGallery />
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="w-full md:p-4">
              <div className="border-b border-border pb-3 md:pb-6 mb-4 md:mb-6">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-3 leading-tight text-balance">
                  {name}
                </h1>
                <div className="flex flex-col gap-1 md:gap-2 mb-2 md:mb-4">
                  <p className="text-sm md:text-lg text-muted-foreground">
                    by <span className="font-semibold text-primary">{brand}</span>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground bg-muted px-2 md:px-3 py-1 rounded-full inline-block w-fit capitalize">
                    {category}
                  </p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <ProductPrice />
                <ProductOption />

                {!isCurrentVariantInCart ? (
                  <Button
                    className="w-full py-6 text-lg font-semibold hover:opacity-90 transition-opacity"
                    onClick={handleAddToCart}
                    disabled={isPending || !currentOption}
                  >
                    {isPending ? "Adding to Cart..." : "Add To Cart"}
                  </Button>
                ) : (
                  <Button
                    className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 py-6 text-lg font-semibold transition-colors"
                    onClick={handleGoToCart}
                  >
                    <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Go To Cart ({currentCartItem?.quantity || 0} in cart)
                  </Button>
                )}
              </div>

              {alternativeDetails && <AlternativeProductComponent />}

              <div className="mt-8">
                <Features />
              </div>

              <div className="mt-8 space-y-6" id="productDetails">
                <div className="border-t border-border pt-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Product Information</h2>
                </div>

                {composition && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Composition
                    </h3>
                    <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                      {composition}
                    </div>
                  </div>
                )}

                {uses && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Uses
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: uses }}
                    />
                  </div>
                )}

                {direction && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Direction for Use
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: direction }}
                    />
                  </div>
                )}

                {dosageInformation && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Dosage Information
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: dosageInformation }}
                    />
                  </div>
                )}

                {sideEffects && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                      <span className="w-1 h-6 bg-red-600 rounded-full mr-3"></span>
                      Side Effects
                    </h3>
                    <div
                      className="text-sm text-red-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sideEffects }}
                    />
                  </div>
                )}

                {precaution && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                      <span className="w-1 h-6 bg-amber-600 rounded-full mr-3"></span>
                      Precautions
                    </h3>
                    <div
                      className="text-sm text-amber-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: precaution }}
                    />
                  </div>
                )}

                {safetyInformation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                      Safety Information
                    </h3>
                    <div
                      className="text-sm text-blue-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: safetyInformation }}
                    />
                  </div>
                )}

                {routeOfAdministration && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Route of Administration
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: routeOfAdministration }}
                    />
                  </div>
                )}

                {medActivity && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Medicinal Activity
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: medActivity }}
                    />
                  </div>
                )}

                {interactions && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Drug Interactions
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: interactions }}
                    />
                  </div>
                )}

                {storage && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Storage Instructions
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: storage }}
                    />
                  </div>
                )}

                {ingredients && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Active Ingredients
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: ingredients }}
                    />
                  </div>
                )}

                {howToUse && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      How to Use
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: howToUse }}
                    />
                  </div>
                )}

                {keyUses && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Key Uses
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: keyUses }}
                    />
                  </div>
                )}

                {dietAndLifestyleGuidance && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Diet and Lifestyle Guidance
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: dietAndLifestyleGuidance }}
                    />
                  </div>
                )}

                {highlights && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Product Highlights
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: highlights }}
                    />
                  </div>
                )}

                {additionalInfo && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      Additional Information
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: additionalInfo }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {alternativeDetails && (
          <div className="col-span-4 md:col-span-3">
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm sticky top-4">
              <div className="p-4 relative">
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
                  BRANDED ALTERNATIVE
                </div>
                <ProductCard
                  category={alternativeDetails.companyName}
                  companyName={alternativeDetails.companyName}
                  price={alternativeDetails.price}
                  discount={alternativeDetails.discount}
                  discountType={alternativeDetails.discountType}
                  name={alternativeDetails.productName}
                  productImagePath={alternativeDetails.imageUrl}
                  showAddToCart={false}
                  showDiscountBadge={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <ProductSlider title="Similar Products" showTitle={true} description="" />
      </div>
    </>
  )
}

export default SingleProduct
