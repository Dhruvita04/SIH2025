import { formatPrice } from "@/utils/helperFunctions";

import useSingleProductFacade from "@/facades/useSingleProductFacade";
import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions";

function ProductPrice() {

    const { currentOption } = useSingleProductFacade();

    return (
        <>
            {currentOption && (
                <div>
                    <p className="text-3xl font-bold text-gray-800">₹ {getPriceBasedOnDiscountType(currentOption.price, currentOption.discount, currentOption.discountType)}</p>
                    {currentOption.discount !== 0 && (
                        <del className="text-gray-400">₹ {formatPrice(currentOption.price)}</del>
                    )}
                </div>
            )}
        </>
    )
}

export default ProductPrice