declare module "@cashfreepayments/cashfree-js" {
  interface CashfreeOptions {
    mode: "sandbox" | "production"
  }

  interface CheckoutOptions {
    paymentSessionId: string
    returnUrl: string
    redirectTarget?: string
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<any>
  }

  function load(options: CashfreeOptions): Promise<CashfreeInstance>

  export { load }
}

declare global {
  interface Window {
    Cashfree: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string
        returnUrl: string
        redirectTarget?: string
      }) => Promise<any>
    }
  }
}
