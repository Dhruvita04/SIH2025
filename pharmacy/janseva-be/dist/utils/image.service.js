"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();
let ImageService = class ImageService {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error("Missing required Supabase environment variables");
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                persistSession: true,
            },
        });
    }
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async getSignedUrl(bucket, path, durationInMinutes) {
        const maxRetries = 3;
        const baseDelay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const segments = path.split("/");
                const filename = segments[segments.length - 1];
                const safeDuration = Math.max(durationInMinutes, 10);
                const { data, error } = await this.supabase.storage.from(bucket).createSignedUrl(filename, safeDuration * 60);
                if (error) {
                    if (attempt === maxRetries) {
                        if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
                            throw new common_1.HttpException("Network connection to storage service failed. Please check your internet connection and try again.", common_1.HttpStatus.SERVICE_UNAVAILABLE);
                        }
                        if (error.message?.includes("exp") || error.message?.includes("JWT")) {
                            throw new common_1.HttpException("Signed URL has expired. Please refresh and try again.", common_1.HttpStatus.GONE);
                        }
                        throw new common_1.HttpException(`Failed to get signed URL: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (!data?.signedUrl) {
                    if (attempt === maxRetries) {
                        throw new common_1.HttpException("No signed URL returned from Supabase", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                return data.signedUrl;
            }
            catch (err) {
                if (err instanceof common_1.HttpException) {
                    if (attempt === maxRetries) {
                        throw err;
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (err.message?.includes("fetch failed") ||
                    err.message?.includes("ECONNRESET") ||
                    err.message?.includes("ENOTFOUND") ||
                    err.message?.includes("ETIMEDOUT")) {
                    if (attempt === maxRetries) {
                        throw new common_1.HttpException("Unable to connect to storage service. Please check your network connection and Supabase status.", common_1.HttpStatus.SERVICE_UNAVAILABLE);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (err.message?.includes("exp")) {
                    throw new common_1.HttpException("Signed URL has expired. Please refresh and try again.", common_1.HttpStatus.GONE);
                }
                if (attempt === maxRetries) {
                    throw new common_1.HttpException("Failed to generate signed URL", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                await this.delay(baseDelay * Math.pow(2, attempt - 1));
            }
        }
        throw new common_1.HttpException("Failed to generate signed URL after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async uploadImage(bucket, path, contentType, file) {
        const maxRetries = 3;
        const baseDelay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { data, error } = await this.supabase.storage.from(bucket).upload(path, file, {
                    upsert: true,
                    contentType: contentType,
                });
                if (error) {
                    if (attempt === maxRetries) {
                        if (error.message.includes("row-level security policy")) {
                            throw new common_1.HttpException("Permission denied: Unable to upload image due to security policy", common_1.HttpStatus.FORBIDDEN);
                        }
                        if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
                            throw new common_1.HttpException("Network connection failed during upload. Please try again.", common_1.HttpStatus.SERVICE_UNAVAILABLE);
                        }
                        throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(data.path);
                return publicUrlData.publicUrl;
            }
            catch (err) {
                if (err instanceof common_1.HttpException) {
                    if (attempt === maxRetries) {
                        throw err;
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (attempt === maxRetries) {
                    throw new common_1.HttpException("Failed to upload image after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                await this.delay(baseDelay * Math.pow(2, attempt - 1));
            }
        }
        throw new common_1.HttpException("Failed to upload image after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async deleteImage(bucket, path) {
        const maxRetries = 3;
        const baseDelay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const segments = path.split("/");
                path = segments[segments.length - 1];
                const { error, data: deletedData } = await this.supabase.storage.from(bucket).remove([path]);
                if (error) {
                    if (attempt === maxRetries) {
                        if (error.message.includes("row-level security policy")) {
                            throw new common_1.HttpException("Permission denied: Unable to delete image due to security policy", common_1.HttpStatus.FORBIDDEN);
                        }
                        if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
                            throw new common_1.HttpException("Network connection failed during deletion. Please try again.", common_1.HttpStatus.SERVICE_UNAVAILABLE);
                        }
                        throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                const { data } = await this.supabase.storage.from(bucket).list(path.split("/").slice(0, -1).join("/"), {
                    search: path.split("/").pop(),
                });
                if (data && data.length > 0) {
                    if (attempt === maxRetries) {
                        throw new common_1.HttpException("Failed to delete image", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                return;
            }
            catch (error) {
                if (error instanceof common_1.HttpException) {
                    if (attempt === maxRetries) {
                        throw error;
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (attempt === maxRetries) {
                    throw new common_1.HttpException("Failed to delete image after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                await this.delay(baseDelay * Math.pow(2, attempt - 1));
            }
        }
    }
    getImagePathFromUrl(url) {
        const urlObj = new URL(url);
        return urlObj.pathname.split("/").slice(-2).join("/");
    }
    async getImageFileFromUrl(bucket, url) {
        const maxRetries = 3;
        const baseDelay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { data, error } = await this.supabase.storage
                    .from(bucket)
                    .download(this.getImagePathFromUrl(url).split("/").pop());
                if (error) {
                    if (attempt === maxRetries) {
                        if (error.message?.includes("fetch failed") || error.message?.includes("ECONNRESET")) {
                            throw new common_1.HttpException("Network connection failed during download. Please try again.", common_1.HttpStatus.SERVICE_UNAVAILABLE);
                        }
                        throw new common_1.HttpException("Failed to download image", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (!data) {
                    if (attempt === maxRetries) {
                        throw new common_1.HttpException("No image data found", common_1.HttpStatus.NOT_FOUND);
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                return new File([data], "logo", { type: "image/png" });
            }
            catch (error) {
                if (error instanceof common_1.HttpException) {
                    if (attempt === maxRetries) {
                        throw error;
                    }
                    await this.delay(baseDelay * Math.pow(2, attempt - 1));
                    continue;
                }
                if (attempt === maxRetries) {
                    throw new common_1.HttpException("Failed to download image after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                await this.delay(baseDelay * Math.pow(2, attempt - 1));
            }
        }
        throw new common_1.HttpException("Failed to download image after all retries", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ImageService);
//# sourceMappingURL=image.service.js.map