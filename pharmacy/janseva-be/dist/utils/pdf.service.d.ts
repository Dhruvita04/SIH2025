export declare class PdfService {
    private numberToWordsIndian;
    generateOrderPdf(order: any, paginationConfig?: {
        firstPageSmallLimit: number;
        firstPageLargeLimit: number;
        otherPageWithFooterLimit: number;
        otherPageFullLimit: number;
    }): Promise<string>;
}
