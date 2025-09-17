"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
let PdfService = class PdfService {
    numberToWordsIndian(num) {
        const a = [
            "",
            "one ",
            "two ",
            "three ",
            "four ",
            "five ",
            "six ",
            "seven ",
            "eight ",
            "nine ",
            "ten ",
            "eleven ",
            "twelve ",
            "thirteen ",
            "fourteen ",
            "fifteen ",
            "sixteen ",
            "seventeen ",
            "eighteen ",
            "nineteen ",
        ];
        const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        function inWords(n) {
            let str = "";
            if (n >= 10000000) {
                str += inWords(Math.floor(n / 10000000)) + "crore ";
                n %= 10000000;
            }
            if (n >= 100000) {
                str += inWords(Math.floor(n / 100000)) + "lakh ";
                n %= 100000;
            }
            if (n >= 100) {
                str += a[Math.floor(n / 100)] + "hundred ";
                n %= 100;
            }
            if (n < 20) {
                str += a[n];
            }
            else {
                str += b[Math.floor(n / 10)] + " " + a[n % 10];
            }
            return str.trim();
        }
        const [integerPart, decimalPart] = num.toFixed(2).split(".");
        let words = "";
        if (Number.parseInt(integerPart) === 0) {
            words = "Zero";
        }
        else {
            words = inWords(Number.parseInt(integerPart));
        }
        words += " Rupees";
        if (Number.parseInt(decimalPart) > 0) {
            words += " And " + inWords(Number.parseInt(decimalPart)) + " Paise";
        }
        return words.trim() + " Only";
    }
    async generateOrderPdf(order, paginationConfig) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: "A4", margin: 30 });
                const chunks = [];
                doc.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                doc.on("end", () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    const base64Pdf = pdfBuffer.toString("base64");
                    resolve(base64Pdf);
                });
                const pagination = paginationConfig || {
                    firstPageSmallLimit: 7,
                    firstPageLargeLimit: 20,
                    otherPageWithFooterLimit: 19,
                    otherPageFullLimit: 28,
                };
                const shopName = process.env.SHOP_NAME;
                const shopAddressLine1 = process.env.SHOP_ADDRESS_LINE1;
                const shopAddressLine2 = process.env.SHOP_ADDRESS_LINE2;
                const shopGSTIN = process.env.SHOP_GSTIN;
                const shopDLNo = process.env.SHOP_DL_NO;
                const gstPercentage = Number.parseFloat(process.env.GST_PERCENTAGE);
                const hsnCode = process.env.HSN_CODE;
                const pharmacistName = process.env.SHOP_PHARMACIST_NAME;
                const pharmacistPRNo = process.env.SHOP_PHARMACIST_PR_NO;
                const startX = 30;
                const endX = doc.page.width - 30;
                let currentY = 30;
                const defaultLineHeight = 12;
                const maxLogoWidth = 120;
                const maxLogoHeight = 60;
                try {
                    const logoPath = "public/logo.png";
                    doc.image(logoPath, startX, currentY, {
                        fit: [maxLogoWidth, maxLogoHeight],
                        align: "left",
                        valign: "top",
                    });
                }
                catch (error) {
                    doc.rect(startX, currentY, maxLogoWidth, maxLogoHeight).stroke();
                    doc
                        .fontSize(8)
                        .font("Helvetica")
                        .text("COMPANY LOGO", startX + 35, currentY + 25);
                }
                const invoiceText = "INVOICE";
                doc.fontSize(18).font("Helvetica-Bold");
                const invoiceTextWidth = doc.widthOfString(invoiceText);
                const invoiceTextX = (doc.page.width - invoiceTextWidth) / 2;
                doc.text(invoiceText, invoiceTextX, currentY + 15);
                currentY += maxLogoHeight - 5;
                const orderDetailsLeftX = startX;
                const orderDetailsRightX = startX + (endX - startX) / 2 + 20;
                doc.fontSize(10).font("Helvetica-Bold").text("Order ID:", orderDetailsLeftX, currentY);
                doc.font("Helvetica").text(`${order.orderId}`, orderDetailsLeftX + 60, currentY);
                doc.font("Helvetica-Bold").text("Order Date:", orderDetailsRightX, currentY);
                doc
                    .font("Helvetica")
                    .text(`${new Date(order.date).toLocaleDateString("en-GB")}`, orderDetailsRightX + 65, currentY);
                currentY += defaultLineHeight + 5;
                doc.font("Helvetica-Bold").text("POS:", orderDetailsLeftX, currentY);
                doc.font("Helvetica").text("27-Maharashtra", orderDetailsLeftX + 60, currentY);
                doc.font("Helvetica-Bold").text("Status:", orderDetailsRightX, currentY);
                doc.font("Helvetica").text(`${order.status || "PENDING"}`, orderDetailsRightX + 65, currentY);
                currentY += defaultLineHeight + 10;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 10;
                const sectionHeaderY = currentY;
                const sectionColWidth = (endX - startX - 20) / 2;
                const soldByX = startX;
                const billToX = startX + sectionColWidth + 20;
                doc.fontSize(10).font("Helvetica-Bold").text("SOLD BY(PHARMACY)", soldByX, sectionHeaderY);
                doc.text("BILL TO / SHIP TO (PATIENT)", billToX, sectionHeaderY);
                currentY += defaultLineHeight + 5;
                let soldByContentY = currentY;
                let billToContentY = currentY;
                doc.font("Helvetica-Bold").text(shopName, soldByX, soldByContentY);
                soldByContentY += defaultLineHeight;
                doc.font("Helvetica").text(shopAddressLine1, soldByX, soldByContentY);
                soldByContentY += defaultLineHeight;
                doc.text(shopAddressLine2, soldByX, soldByContentY);
                soldByContentY += defaultLineHeight;
                doc.font("Helvetica-Bold").text(`GSTIN ${shopGSTIN}`, soldByX, soldByContentY);
                soldByContentY += defaultLineHeight + 5;
                doc.font("Helvetica-Bold").text(order.shippingAddress?.name || "N/A", billToX, billToContentY);
                billToContentY += defaultLineHeight;
                if (order.shippingAddress) {
                    const addressLines = [
                        order.shippingAddress.line1,
                        order.shippingAddress.line2,
                        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
                    ].filter(Boolean);
                    addressLines.forEach((line) => {
                        doc.font("Helvetica").text(line, billToX, billToContentY, { width: sectionColWidth });
                        billToContentY = doc.y;
                    });
                    doc.font("Helvetica").text(`Phone: ${order.shippingAddress.phone}`, billToX, billToContentY);
                    billToContentY += defaultLineHeight;
                }
                if (order.prescriptionDetails?.doctorName) {
                    doc.font("Helvetica-Bold").text(`Doctor ${order.prescriptionDetails.doctorName}`, billToX, billToContentY);
                    billToContentY += defaultLineHeight;
                }
                currentY = Math.max(soldByContentY, billToContentY) + 10;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 5;
                doc.fontSize(10).font("Helvetica").text(`DL No. ${shopDLNo}`, startX, currentY);
                currentY += defaultLineHeight + 10;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 10;
                const tableHeaderHeight = 20;
                const rowPadding = 3;
                const totalTableWidth = endX - startX;
                const columnWidths = {
                    hash: 25,
                    item: 150,
                    hsn: 45,
                    batch: 55,
                    expiry: 55,
                    mrp: 50,
                    priceIncl: 50,
                    qty: 30,
                    amount: 75,
                };
                const totalColumnsWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
                let colX = startX;
                const colPositions = {
                    hash: colX,
                    item: (colX += columnWidths.hash),
                    hsn: (colX += columnWidths.item),
                    batch: (colX += columnWidths.hsn),
                    expiry: (colX += columnWidths.batch),
                    mrp: (colX += columnWidths.expiry),
                    priceIncl: (colX += columnWidths.mrp),
                    qty: (colX += columnWidths.priceIncl),
                    amount: (colX += columnWidths.qty),
                };
                const drawTableHeader = (yPos) => {
                    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8);
                    const textYOffset = (tableHeaderHeight - doc.currentLineHeight()) / 2;
                    doc.rect(colPositions.hash, yPos, columnWidths.hash, tableHeaderHeight).stroke();
                    doc.text("#", colPositions.hash, yPos + textYOffset, { width: columnWidths.hash, align: "center" });
                    doc.rect(colPositions.item, yPos, columnWidths.item, tableHeaderHeight).stroke();
                    doc.text("ITEM NAME", colPositions.item, yPos + textYOffset, { width: columnWidths.item, align: "center" });
                    doc.rect(colPositions.hsn, yPos, columnWidths.hsn, tableHeaderHeight).stroke();
                    doc.text("HSN", colPositions.hsn, yPos + textYOffset, { width: columnWidths.hsn, align: "center" });
                    doc.rect(colPositions.batch, yPos, columnWidths.batch, tableHeaderHeight).stroke();
                    doc.text("BATCH", colPositions.batch, yPos + textYOffset, { width: columnWidths.batch, align: "center" });
                    doc.rect(colPositions.expiry, yPos, columnWidths.expiry, tableHeaderHeight).stroke();
                    doc.text("EXPIRY", colPositions.expiry, yPos + textYOffset, { width: columnWidths.expiry, align: "center" });
                    doc.rect(colPositions.mrp, yPos, columnWidths.mrp, tableHeaderHeight).stroke();
                    doc.text("MRP", colPositions.mrp, yPos + textYOffset, { width: columnWidths.mrp, align: "center" });
                    doc.rect(colPositions.priceIncl, yPos, columnWidths.priceIncl, tableHeaderHeight).stroke();
                    doc.text("PRICE", colPositions.priceIncl, yPos + textYOffset, {
                        width: columnWidths.priceIncl,
                        align: "center",
                    });
                    doc.rect(colPositions.qty, yPos, columnWidths.qty, tableHeaderHeight).stroke();
                    doc.text("QTY", colPositions.qty, yPos + textYOffset, { width: columnWidths.qty, align: "center" });
                    doc.rect(colPositions.amount, yPos, columnWidths.amount, tableHeaderHeight).stroke();
                    doc.text("AMOUNT", colPositions.amount, yPos + textYOffset, { width: columnWidths.amount, align: "center" });
                    doc.fillColor("#000000").font("Helvetica");
                };
                drawTableHeader(currentY);
                currentY += tableHeaderHeight;
                let productRows = [];
                const isShipped = order.status === "SHIPPED";
                if (isShipped && order.shippedBatches && order.shippedBatches.length > 0) {
                    const batchesByProduct = order.shippedBatches.reduce((acc, batch) => {
                        if (!acc[batch.orderProductId]) {
                            acc[batch.orderProductId] = [];
                        }
                        acc[batch.orderProductId].push(batch);
                        return acc;
                    }, {});
                    order.products.forEach((item) => {
                        const batches = batchesByProduct[item.id] || [];
                        if (batches.length > 0) {
                            batches.forEach((batch) => {
                                productRows.push({
                                    ...item,
                                    quantity: batch.quantity,
                                    batchNumber: batch.batchNumber,
                                    expiryDate: batch.expiryDate,
                                    hsnCode: batch.hsnCode,
                                    isFromBatch: true,
                                });
                            });
                        }
                        else {
                            productRows.push({
                                ...item,
                                batchNumber: "",
                                expiryDate: null,
                                hsnCode: item.product?.hsnCode,
                                isFromBatch: false,
                            });
                        }
                    });
                }
                else {
                    productRows = order.products.map((item) => ({
                        ...item,
                        batchNumber: "",
                        expiryDate: null,
                        hsnCode: item.product?.hsnCode,
                        isFromBatch: false,
                    }));
                }
                const totalProductsInOrder = productRows.length;
                const calculateFooterHeight = () => {
                    const totalRowHeightFooter = 25;
                    const gapAfterTotalRowFooter = 10;
                    const summaryRightColWidthFooter = 200;
                    const priceBreakdownHeaderHeightFooter = doc.heightOfString("PRICE BREAKDOWN", { width: summaryRightColWidthFooter }) + 5;
                    const priceBreakdownContentLinesFooter = 5;
                    const priceBreakdownContentHeightFooter = priceBreakdownContentLinesFooter * defaultLineHeight;
                    const priceBreakdownSectionActualHeightFooter = priceBreakdownHeaderHeightFooter + priceBreakdownContentHeightFooter;
                    const summarySectionActualHeightFooter = priceBreakdownSectionActualHeightFooter;
                    const gapAfterSummarySectionFooter = 10;
                    const noteLineHeightFooter = defaultLineHeight + 5;
                    const totalInvoiceAmountLineHeightFooter = defaultLineHeight + 5;
                    const totalSavingsLineHeightFooter = defaultLineHeight + 5;
                    const amountInWordsLineHeightFooter = doc.heightOfString(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, {
                        width: endX - startX,
                    }) + 5;
                    const noteAndFinalTotalSectionActualHeightFooter = noteLineHeightFooter +
                        totalInvoiceAmountLineHeightFooter +
                        totalSavingsLineHeightFooter +
                        amountInWordsLineHeightFooter;
                    const hr1HeightFooter = 1 + 10;
                    const pharmacistTextLine1HeightFooter = defaultLineHeight;
                    const pharmacistTextLine2HeightFooter = defaultLineHeight;
                    const pharmacistBlockActualHeightFooter = pharmacistTextLine1HeightFooter + pharmacistTextLine2HeightFooter;
                    const signatureTextLineHeightFooter = defaultLineHeight;
                    const signatureBoxHeightFooter = 50;
                    const signatureBlockActualHeightFooter = signatureTextLineHeightFooter + 5 + signatureBoxHeightFooter;
                    const signatureSectionActualHeightFooter = Math.max(pharmacistBlockActualHeightFooter, signatureBlockActualHeightFooter);
                    const gapAfterSignatureSectionFooter = 10;
                    const finalHrHeightFooter = 1 + 10;
                    const messageLine2Height = defaultLineHeight;
                    const messageLine3Height = defaultLineHeight;
                    const messageLine4Height = doc.heightOfString("Taxable person paying tax in terms of notification No. 2/2019-Central Tax (Rate) dated 07.03.2019, not eligible to collect tax on supplies", { width: endX - startX, fontSize: 8 });
                    const messageSectionHeight = messageLine2Height + messageLine3Height + messageLine4Height + 10;
                    return (totalRowHeightFooter +
                        gapAfterTotalRowFooter +
                        summarySectionActualHeightFooter +
                        gapAfterSummarySectionFooter +
                        noteAndFinalTotalSectionActualHeightFooter +
                        hr1HeightFooter +
                        signatureSectionActualHeightFooter +
                        gapAfterSignatureSectionFooter +
                        finalHrHeightFooter +
                        messageSectionHeight);
                };
                const footerHeight = calculateFooterHeight();
                const pageBottomMargin = 30;
                const minRowHeight = 20;
                let currentPageNumber = 1;
                let rowsPerPage;
                let productsDrawnOnCurrentPage = 0;
                let itemIndex = 1;
                let totalQuantity = 0;
                let totalAmount = 0;
                let totalMRP = 0;
                if (totalProductsInOrder <= 7) {
                    rowsPerPage = pagination.firstPageSmallLimit;
                }
                else {
                    rowsPerPage = pagination.firstPageLargeLimit;
                }
                const drawVerticalRowLines = (yPos, height) => {
                    doc.strokeColor("#000000").lineWidth(1);
                    doc
                        .moveTo(colPositions.hash, yPos)
                        .lineTo(colPositions.hash, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.hash + columnWidths.hash, yPos)
                        .lineTo(colPositions.hash + columnWidths.hash, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.item + columnWidths.item, yPos)
                        .lineTo(colPositions.item + columnWidths.item, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.hsn + columnWidths.hsn, yPos)
                        .lineTo(colPositions.hsn + columnWidths.hsn, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.batch + columnWidths.batch, yPos)
                        .lineTo(colPositions.batch + columnWidths.batch, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.expiry + columnWidths.expiry, yPos)
                        .lineTo(colPositions.expiry + columnWidths.expiry, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.mrp + columnWidths.mrp, yPos)
                        .lineTo(colPositions.mrp + columnWidths.mrp, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.priceIncl + columnWidths.priceIncl, yPos)
                        .lineTo(colPositions.priceIncl + columnWidths.priceIncl, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.qty + columnWidths.qty, yPos)
                        .lineTo(colPositions.qty + columnWidths.qty, yPos + height)
                        .stroke();
                    doc
                        .moveTo(colPositions.amount + columnWidths.amount, yPos)
                        .lineTo(colPositions.amount + columnWidths.amount, yPos + height)
                        .stroke();
                };
                productRows.forEach((item, index) => {
                    const productName = item.product ? item.product.name : "Unknown Product";
                    const variantName = item.variant ? item.variant.name : "";
                    const fullProductName = `${productName}\n${variantName}`;
                    const itemTextHeight = doc.heightOfString(fullProductName, { width: columnWidths.item - rowPadding * 2 });
                    const actualRowHeight = Math.max(minRowHeight, itemTextHeight + rowPadding * 2);
                    let shouldMoveToNextPage = false;
                    if (currentPageNumber === 1) {
                        shouldMoveToNextPage = productsDrawnOnCurrentPage >= rowsPerPage;
                    }
                    else {
                        shouldMoveToNextPage = productsDrawnOnCurrentPage >= rowsPerPage;
                    }
                    if (shouldMoveToNextPage) {
                        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                        doc.addPage();
                        currentPageNumber++;
                        currentY = 30;
                        drawTableHeader(currentY);
                        currentY += tableHeaderHeight;
                        productsDrawnOnCurrentPage = 0;
                        const remainingProductsAfterPageBreak = totalProductsInOrder - index;
                        if (remainingProductsAfterPageBreak <= pagination.otherPageWithFooterLimit) {
                            rowsPerPage = pagination.otherPageWithFooterLimit;
                        }
                        else {
                            rowsPerPage = pagination.otherPageFullLimit;
                        }
                    }
                    drawVerticalRowLines(currentY, actualRowHeight);
                    const rowStartContentY = currentY + rowPadding;
                    const unitPriceInclusive = item.price;
                    const discountValue = item.variant?.discount || 0;
                    const discountType = item.variant?.discountType || "AMOUNT";
                    let mrpInclusive = unitPriceInclusive;
                    if (discountType.toUpperCase() === "AMOUNT") {
                        mrpInclusive = unitPriceInclusive + discountValue;
                    }
                    else if (discountType.toUpperCase() === "PERCENTAGE") {
                        mrpInclusive = unitPriceInclusive / (1 - discountValue / 100);
                    }
                    const itemTotal = unitPriceInclusive * item.quantity;
                    totalMRP += mrpInclusive * item.quantity;
                    doc.fontSize(8);
                    doc.text(itemIndex.toString(), colPositions.hash, rowStartContentY, {
                        width: columnWidths.hash,
                        align: "center",
                    });
                    doc.text(fullProductName, colPositions.item + rowPadding, rowStartContentY, {
                        width: columnWidths.item - rowPadding * 2,
                        align: "left",
                    });
                    const displayHsnCode = item.hsnCode || hsnCode || "N/A";
                    doc.text(displayHsnCode, colPositions.hsn, rowStartContentY, { width: columnWidths.hsn, align: "center" });
                    doc.text(item.batchNumber || "-", colPositions.batch, rowStartContentY, {
                        width: columnWidths.batch,
                        align: "center",
                    });
                    const expiryText = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-GB") : "-";
                    doc.text(expiryText, colPositions.expiry, rowStartContentY, {
                        width: columnWidths.expiry,
                        align: "center",
                    });
                    doc.text(`${mrpInclusive.toFixed(2)}/-`, colPositions.mrp, rowStartContentY, {
                        width: columnWidths.mrp,
                        align: "center",
                    });
                    doc.text(`${unitPriceInclusive.toFixed(2)}/-`, colPositions.priceIncl, rowStartContentY, {
                        width: columnWidths.priceIncl,
                        align: "center",
                    });
                    doc.text(item.quantity.toString(), colPositions.qty, rowStartContentY, {
                        width: columnWidths.qty,
                        align: "center",
                    });
                    doc.text(`${itemTotal.toFixed(2)}/-`, colPositions.amount, rowStartContentY, {
                        width: columnWidths.amount,
                        align: "center",
                    });
                    currentY += actualRowHeight;
                    productsDrawnOnCurrentPage++;
                    itemIndex++;
                    totalQuantity += item.quantity;
                    totalAmount += itemTotal;
                });
                const remainingEmptyRows = rowsPerPage - productsDrawnOnCurrentPage;
                for (let i = 0; i < remainingEmptyRows; i++) {
                    drawVerticalRowLines(currentY, minRowHeight);
                    currentY += minRowHeight;
                }
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                if (currentY + footerHeight > doc.page.height - pageBottomMargin) {
                    doc.addPage();
                    currentY = 30;
                }
                const totalRowHeightFooter = 25;
                const gapAfterTotalRowFooter = 10;
                const totalMergedWidth = columnWidths.hash +
                    columnWidths.item +
                    columnWidths.hsn +
                    columnWidths.batch +
                    columnWidths.expiry +
                    columnWidths.mrp +
                    columnWidths.priceIncl;
                doc.rect(colPositions.hash, currentY, totalMergedWidth, totalRowHeightFooter).stroke();
                doc.rect(colPositions.qty, currentY, columnWidths.qty, totalRowHeightFooter).stroke();
                doc.rect(colPositions.amount, currentY, columnWidths.amount, totalRowHeightFooter).stroke();
                doc.fontSize(9).font("Helvetica-Bold");
                doc.text("TOTAL", colPositions.hash, currentY + rowPadding + 5, {
                    width: totalMergedWidth,
                    align: "center",
                });
                doc.text(totalQuantity.toString(), colPositions.qty, currentY + rowPadding + 5, {
                    width: columnWidths.qty,
                    align: "center",
                });
                doc.text(`${totalAmount.toFixed(2)}/-`, colPositions.amount, currentY + rowPadding + 5, {
                    width: columnWidths.amount,
                    align: "center",
                });
                currentY += totalRowHeightFooter + gapAfterTotalRowFooter;
                const hasValidBatchInfo = productRows.some((item) => {
                    const batchNumber = item.batchNumber || "";
                    const expiryDate = item.expiryDate;
                    const placeholderPatterns = [
                        /^j883ry$/i,
                        /^[a-z0-9]{6,10}$/i,
                        /^[a-z]+[0-9]+[a-z]*$/i,
                        /^[0-9]+[a-z]+[0-9]*$/i,
                        /^test/i,
                        /^dummy/i,
                        /^sample/i,
                    ];
                    const hasValidBatch = batchNumber &&
                        batchNumber !== "-" &&
                        batchNumber !== "" &&
                        !placeholderPatterns.some((pattern) => pattern.test(batchNumber)) &&
                        batchNumber.length >= 4;
                    const placeholderDates = ["12/08/2025", "01/01/2025", "31/12/2025", "01/01/2026"];
                    const hasValidExpiry = expiryDate &&
                        expiryDate !== null &&
                        !placeholderDates.includes(new Date(expiryDate).toLocaleDateString("en-GB"));
                    return hasValidBatch && hasValidExpiry;
                });
                if (isShipped && hasValidBatchInfo) {
                    doc.fontSize(9).font("Helvetica-Oblique");
                    doc.text("Note: Batch numbers and expiry dates are provided for shipped orders.", startX, currentY);
                    currentY += defaultLineHeight + 5;
                }
                else if (!isShipped) {
                    doc.fontSize(9).font("Helvetica-Oblique");
                    doc.text("Note: Batch numbers and expiry dates will be provided upon shipment.", startX, currentY);
                    currentY += defaultLineHeight + 5;
                }
                const summaryRightColX = startX;
                let summaryY = currentY;
                doc.fontSize(10).font("Helvetica-Bold").text("PRICE BREAKDOWN", summaryRightColX, summaryY);
                summaryY += defaultLineHeight + 5;
                doc.fontSize(10).font("Helvetica").text("Original Price (MRP):", summaryRightColX, summaryY);
                doc.text(`${(order.subTotal + order.discount + order.couponDiscount).toFixed(2)}/-`, summaryRightColX, summaryY, {
                    width: endX - summaryRightColX,
                    align: "right",
                });
                summaryY += defaultLineHeight;
                doc.fontSize(10).text("Discount:", summaryRightColX, summaryY);
                doc.text(`${order.discount.toFixed(2)}/-`, summaryRightColX, summaryY, {
                    width: endX - summaryRightColX,
                    align: "right",
                });
                summaryY += defaultLineHeight;
                doc.fontSize(10).font("Helvetica").text("Our Price:", summaryRightColX, summaryY);
                doc.text(`${order.subTotal.toFixed(2)}/-`, summaryRightColX, summaryY, {
                    width: endX - summaryRightColX,
                    align: "right",
                });
                summaryY += defaultLineHeight;
                doc.fontSize(10).text("Coupon Discount:", summaryRightColX, summaryY);
                doc.text(`${order.couponDiscount.toFixed(2)}/-`, summaryRightColX, summaryY, {
                    width: endX - summaryRightColX,
                    align: "right",
                });
                summaryY += defaultLineHeight;
                doc.fontSize(10).text("Shipping:", summaryRightColX, summaryY);
                doc.text(`${order.shipping.toFixed(2)}/-`, summaryRightColX, summaryY, {
                    width: endX - summaryRightColX,
                    align: "right",
                });
                summaryY += defaultLineHeight;
                currentY = summaryY + 10;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 10;
                doc.fontSize(9).font("Helvetica-Bold").text("Note :", startX, currentY);
                currentY += defaultLineHeight + 5;
                doc.fontSize(12).font("Helvetica-Bold").text("Total Invoice Amount:", startX, currentY);
                doc.text(`${order.orderTotal.toFixed(2)}/-`, endX - 80, currentY, { width: 80, align: "right" });
                currentY += defaultLineHeight + 5;
                doc
                    .fontSize(10)
                    .font("Helvetica")
                    .text(`Total savings is ${order.discount.toFixed(2)}/-`, startX, currentY);
                currentY += defaultLineHeight + 5;
                doc.fontSize(10).text(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, startX, currentY);
                currentY +=
                    doc.heightOfString(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, {
                        width: endX - startX,
                    }) + 5;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 10;
                const signatureBlockStartY = currentY;
                doc.fontSize(10).font("Helvetica-Bold").text("PHARMACIST :", startX, signatureBlockStartY);
                doc.font("Helvetica").text(`${pharmacistName}`, startX + 70, signatureBlockStartY);
                let leftColumnCurrentY = signatureBlockStartY + defaultLineHeight;
                doc.font("Helvetica-Bold").text(`For ${shopName}`, startX, leftColumnCurrentY);
                leftColumnCurrentY += defaultLineHeight;
                const signatureBoxWidth = 120;
                const signatureBoxHeight = 50;
                const authorizedSignatureText = "Authorized Signature";
                const signatureBoxX = endX - signatureBoxWidth;
                const signatureBoxY = signatureBlockStartY;
                doc.fontSize(10).font("Helvetica-Bold");
                const authorizedSignatureTextWidth = doc.widthOfString(authorizedSignatureText);
                const textPadding = 5;
                const authorizedSignatureTextX = signatureBoxX - authorizedSignatureTextWidth - textPadding;
                const authorizedSignatureTextY = signatureBoxY + signatureBoxHeight / 2 - doc.currentLineHeight() / 2;
                doc.text(authorizedSignatureText, authorizedSignatureTextX, authorizedSignatureTextY);
                doc.rect(signatureBoxX, signatureBoxY, signatureBoxWidth, signatureBoxHeight).stroke();
                const signatureImagePath = "public/sign.png";
                try {
                    doc.image(signatureImagePath, signatureBoxX + 5, signatureBoxY + 5, {
                        fit: [signatureBoxWidth - 10, signatureBoxHeight - 10],
                        align: "center",
                        valign: "top",
                    });
                }
                catch (error) {
                    console.error("Error loading signature image:", error);
                    doc
                        .fontSize(8)
                        .font("Helvetica")
                        .text("Signature Here", signatureBoxX, signatureBoxY + signatureBoxHeight / 2 - 4, {
                        width: signatureBoxWidth,
                        align: "center",
                    });
                }
                const rightColumnBottomY = signatureBoxY + signatureBoxHeight;
                currentY = Math.max(leftColumnCurrentY, rightColumnBottomY) + 10;
                doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
                currentY += 10;
                const currentDate = new Date().toLocaleDateString("en-GB");
                doc.fontSize(10).font("Helvetica");
                doc.text(`Thank you for trusting us. This bill is system generated on ${currentDate}.`, startX, currentY, { width: endX - startX });
                currentY += defaultLineHeight + 2;
                doc.text("For detailed terms and conditions, visit ", startX, currentY, { continued: true });
                doc.fillColor("blue").text("jansevagenmeds.com/terms-conditions", {
                    link: "https://www.jansevagenmeds.com/terms-conditions",
                    underline: true,
                    continued: false,
                });
                doc.fillColor("#000000");
                currentY = doc.y + 2;
                doc
                    .fontSize(8.8)
                    .text("Taxable person paying tax in terms of notification No. 2/2019-Central Tax (Rate) dated 07.03.2019, not eligible to collect tax on supplies", startX, currentY, { width: endX - startX });
                currentY = doc.y + 5;
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map