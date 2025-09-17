import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

@Injectable()
export class ImageService {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required Supabase environment variables")
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: true,
      },
    })
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getSignedUrl(bucket: string, path: string, durationInMinutes: number): Promise<string> {
    const maxRetries = 3
    const baseDelay = 1000 // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Extract filename from full path if needed
        const segments = path.split("/")
        const filename = segments[segments.length - 1]

        // Increase minimum duration to prevent immediate expiration
        const safeDuration = Math.max(durationInMinutes, 10) // Minimum 10 minutes

        const { data, error } = await this.supabase.storage.from(bucket).createSignedUrl(filename, safeDuration * 60)

        if (error) {
          // If it's the last attempt, throw the error
          if (attempt === maxRetries) {
            // Handle specific error types
            if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
              throw new HttpException(
                "Network connection to storage service failed. Please check your internet connection and try again.",
                HttpStatus.SERVICE_UNAVAILABLE,
              )
            }

            if (error.message?.includes("exp") || error.message?.includes("JWT")) {
              throw new HttpException("Signed URL has expired. Please refresh and try again.", HttpStatus.GONE)
            }

            throw new HttpException(`Failed to get signed URL: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
          }

          // Wait before retrying (exponential backoff)
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        if (!data?.signedUrl) {
          if (attempt === maxRetries) {
            throw new HttpException("No signed URL returned from Supabase", HttpStatus.INTERNAL_SERVER_ERROR)
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        return data.signedUrl
      } catch (err) {
        // If it's already an HttpException, don't wrap it again
        if (err instanceof HttpException) {
          if (attempt === maxRetries) {
            throw err
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        // Handle network errors specifically
        if (
          err.message?.includes("fetch failed") ||
          err.message?.includes("ECONNRESET") ||
          err.message?.includes("ENOTFOUND") ||
          err.message?.includes("ETIMEDOUT")
        ) {
          if (attempt === maxRetries) {
            throw new HttpException(
              "Unable to connect to storage service. Please check your network connection and Supabase status.",
              HttpStatus.SERVICE_UNAVAILABLE,
            )
          }

          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        // Handle JWT expiration error
        if (err.message?.includes("exp")) {
          throw new HttpException("Signed URL has expired. Please refresh and try again.", HttpStatus.GONE)
        }

        // For other errors, retry if not the last attempt
        if (attempt === maxRetries) {
          throw new HttpException("Failed to generate signed URL", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        await this.delay(baseDelay * Math.pow(2, attempt - 1))
      }
    }

    // This should never be reached, but just in case
    throw new HttpException("Failed to generate signed URL after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
  }

  async uploadImage(bucket: string, path: string, contentType: string, file: Buffer): Promise<string> {
    const maxRetries = 3
    const baseDelay = 1000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await this.supabase.storage.from(bucket).upload(path, file, {
          upsert: true,
          contentType: contentType,
        })

        if (error) {
          if (attempt === maxRetries) {
            if (error.message.includes("row-level security policy")) {
              throw new HttpException(
                "Permission denied: Unable to upload image due to security policy",
                HttpStatus.FORBIDDEN,
              )
            }

            if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
              throw new HttpException(
                "Network connection failed during upload. Please try again.",
                HttpStatus.SERVICE_UNAVAILABLE,
              )
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }

          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(data.path)
        return publicUrlData.publicUrl
      } catch (err) {
        if (err instanceof HttpException) {
          if (attempt === maxRetries) {
            throw err
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        if (attempt === maxRetries) {
          throw new HttpException("Failed to upload image after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        await this.delay(baseDelay * Math.pow(2, attempt - 1))
      }
    }

    throw new HttpException("Failed to upload image after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
  }

  async deleteImage(bucket: string, path: string): Promise<void> {
    const maxRetries = 3
    const baseDelay = 1000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const segments = path.split("/")
        path = segments[segments.length - 1]

        const { error, data: deletedData } = await this.supabase.storage.from(bucket).remove([path])

        if (error) {
          if (attempt === maxRetries) {
            if (error.message.includes("row-level security policy")) {
              throw new HttpException(
                "Permission denied: Unable to delete image due to security policy",
                HttpStatus.FORBIDDEN,
              )
            }

            if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
              throw new HttpException(
                "Network connection failed during deletion. Please try again.",
                HttpStatus.SERVICE_UNAVAILABLE,
              )
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }

          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        // Verify deletion by trying to get the file
        const { data } = await this.supabase.storage.from(bucket).list(path.split("/").slice(0, -1).join("/"), {
          search: path.split("/").pop(),
        })

        if (data && data.length > 0) {
          if (attempt === maxRetries) {
            throw new HttpException("Failed to delete image", HttpStatus.INTERNAL_SERVER_ERROR)
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        return
      } catch (error) {
        if (error instanceof HttpException) {
          if (attempt === maxRetries) {
            throw error
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        if (attempt === maxRetries) {
          throw new HttpException("Failed to delete image after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        await this.delay(baseDelay * Math.pow(2, attempt - 1))
      }
    }
  }

  getImagePathFromUrl(url: string): string {
    const urlObj = new URL(url)
    return urlObj.pathname.split("/").slice(-2).join("/")
  }

  async getImageFileFromUrl(bucket: string, url: string): Promise<File> {
    const maxRetries = 3
    const baseDelay = 1000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .download(this.getImagePathFromUrl(url).split("/").pop())

        if (error) {
          if (attempt === maxRetries) {
            if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
              throw new HttpException(
                "Network connection failed during download. Please try again.",
                HttpStatus.SERVICE_UNAVAILABLE,
              )
            }
            throw new HttpException("Failed to download image", HttpStatus.INTERNAL_SERVER_ERROR)
          }

          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        if (!data) {
          if (attempt === maxRetries) {
            throw new HttpException("No image data found", HttpStatus.NOT_FOUND)
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        return new File([data], "logo", { type: "image/png" })
      } catch (error) {
        if (error instanceof HttpException) {
          if (attempt === maxRetries) {
            throw error
          }
          await this.delay(baseDelay * Math.pow(2, attempt - 1))
          continue
        }

        if (attempt === maxRetries) {
          throw new HttpException("Failed to download image after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        await this.delay(baseDelay * Math.pow(2, attempt - 1))
      }
    }

    throw new HttpException("Failed to download image after all retries", HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
