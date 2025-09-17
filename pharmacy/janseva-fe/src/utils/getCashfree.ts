// src/utils/getCashfree.ts
import { load } from "@cashfreepayments/cashfree-js"
import environment from "@/CONFIG/environment"

interface CashfreeOptions {
  mode: "sandbox" | "production"
}

export interface EnvConfig {
  mode: "sandbox" | "production"
  // Correct checkout endpoints:
  checkoutUrl: string
}

/**
 * Returns the SDK mode *and* the correct checkout endpoint,
 * regardless of your API base URLs.
 */
export function getEnvironmentConfig(): EnvConfig {
  const apiStatus = environment.CASHFREE_API_STATUS
  const testUrl = environment.CASHFREE_API_URL_TEST
  const prodUrl = environment.CASHFREE_API_URL

  // Validate required environment variables
  if (!apiStatus) {
    throw new Error("VITE_CASHFREE_API_STATUS environment variable is required")
  }

  if (!testUrl || !prodUrl) {
    throw new Error("VITE_CASHFREE_API_URL_TEST and VITE_CASHFREE_API_URL environment variables are required")
  }

  const isTest = apiStatus === "TEST"

  return {
    mode: isTest ? "sandbox" : "production",
    checkoutUrl: isTest ? testUrl : prodUrl,
  }
}

let cashfreePromise: Promise<any> | null = null

export default function getCashfree(): Promise<any> {
  if (!cashfreePromise) {
    const { mode } = getEnvironmentConfig()
    cashfreePromise = load({ mode } as CashfreeOptions).catch((e) => {
      cashfreePromise = null
      throw e
    })
  }
  return cashfreePromise
}
