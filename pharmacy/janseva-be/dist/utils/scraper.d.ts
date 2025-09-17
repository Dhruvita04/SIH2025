interface ProductDetails {
    highlights: string[];
    description: string;
    ingredients: string[];
    keyUses: string[];
    howToUse: string[];
    safetyInformation: string;
    additionalInformation: string[];
}
interface ScrapeResult {
    status: 'success' | 'error';
    data?: ProductDetails;
    message?: string;
}
export type { ProductDetails, ScrapeResult };
export declare const scrape: (medicineName: string) => Promise<ScrapeResult>;
