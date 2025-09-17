// Register Routes
export const LOGIN: string = "/auth/login";
export const SIGNUP: string = "/auth/signup";
export const VERIFYACCOUNT: string = "/auth/verifyaccount";
export const RESENDOTP: string = "/auth/resendotp";
export const VALIDATE_TOKEN: string = "/auth/validate-token";

export const FORGOTPASSWORD: string = "/auth/forgotpassword";
export const VALIDATEFORGOTPASSWORDOTP: string = "/auth/validateforgotpasswordotp";
export const RESENDFORGOTPASSWORD: string = "/auth/resendforgotpassword";
export const CHANGEPASSWORD: string = "/auth/changepassword";

export const ORDER_STATUS: string = "/orders/status";
export const PRODUCTS = "/products/"
export const PRODUCTS_TAGS = "/products/tags/"

export const GOOGLE_CALLBACK: string = "/auth/google";

export const CART_SYNC: string = "/cart/sync";
export const CART_GET_DATA: string = "/cart/get-data";
export const CART_REMOVE: string = "/cart/remove";
export const CART_ADD: string = "/cart/add";
export const CART_UPDATE_QUANTITY: string = "/cart/update-quantity";
export const CART_CHANGE_PRESCRIPTION = "/cart/change-prescription";


export const PRESCRIPTION_UPLOAD: string = "/prescription/upload";
export const PRESCRIPTION_HISTORY: string = "/prescription/user";
export const PRESCRIPTION: string = "/prescription/single";
export const PRESCRIPTION_ORDER_STATUS: string = "/prescription/order-status";
export const PRESCRIPTION_CREATE_ORDER: string = "/prescription/create-order"

export const PROFILE: string = "/profile";
export const ADDRESS: string = "/address";


export const BRANDS: string = "/brands/public";
export const CATEGORIES: string = "/categories/public";

export const SEARCH_BAR: string = "/search-bar";

export const SEARCH: string = "/searchpage";
export const FILTERS: string = "/filters";

export const COUPON: string = "/coupons/apply";

export const ORDERS: string = "/orders";
export const CONTACT_SUBMIT: string = "/contact";


export const PAYMENT_CREATE_SESSION = "/payment/create-order";
export const PAYMENT_VERIFY = "/payment/verify";
export const PAYMENT_WEBHOOK: string = "/payments/webhook";
export const PAYMENT_RETRY: string = "/payment/retry";