export const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });
}

export const getPriceBasedOnDiscountType = (price: number, discount: number, discountType: string) => {
    const discountedPrice = discountType === "percentage" ? 
        Number((price - (price * (discount / 100))).toFixed(2)) : 
        Number((price - discount).toFixed(2));
    return formatPrice(discountedPrice);
}

export const getDiscountBasedOnDiscountType = (price: number, discount: number, discountType: string) => {
    const discountTotal = discountType === "percentage" ? 
        Number((price * (discount / 100)).toFixed(2)) : 
        Number(discount.toFixed(2));
    return discountTotal;
}