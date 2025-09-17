export declare class ImageService {
    private supabase;
    constructor();
    private delay;
    getSignedUrl(bucket: string, path: string, durationInMinutes: number): Promise<string>;
    uploadImage(bucket: string, path: string, contentType: string, file: Buffer): Promise<string>;
    deleteImage(bucket: string, path: string): Promise<void>;
    getImagePathFromUrl(url: string): string;
    getImageFileFromUrl(bucket: string, url: string): Promise<File>;
}
