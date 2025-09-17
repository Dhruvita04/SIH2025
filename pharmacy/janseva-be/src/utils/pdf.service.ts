import { Injectable } from "@nestjs/common"
import * as PDFDocument from "pdfkit"

@Injectable()
export class PdfService {
  private numberToWordsIndian(num: number): string {
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
    ]
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

    function inWords(n: number): string {
      let str = ""
      if (n >= 10000000) {
        str += inWords(Math.floor(n / 10000000)) + "crore "
        n %= 10000000
      }
      if (n >= 100000) {
        str += inWords(Math.floor(n / 100000)) + "lakh "
        n %= 100000
      }
      if (n >= 100) {
        str += a[Math.floor(n / 100)] + "hundred "
        n %= 100
      }
      if (n < 20) {
        str += a[n]
      } else {
        str += b[Math.floor(n / 10)] + " " + a[n % 10]
      }
      return str.trim()
    }

    const [integerPart, decimalPart] = num.toFixed(2).split(".")
    let words = ""

    if (Number.parseInt(integerPart) === 0) {
      words = "Zero"
    } else {
      words = inWords(Number.parseInt(integerPart))
    }

    words += " Rupees"

    if (Number.parseInt(decimalPart) > 0) {
      words += " And " + inWords(Number.parseInt(decimalPart)) + " Paise"
    }

    return words.trim() + " Only"
  }

  async generateOrderPdf(
    order: any,
    paginationConfig?: {
      firstPageSmallLimit: number // For ≤7 products on first page
      firstPageLargeLimit: number // For >7 products on first page
      otherPageWithFooterLimit: number // For subsequent pages with footer
      otherPageFullLimit: number // For subsequent pages without footer (full page)
    },
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 30 })
        const chunks: Buffer[] = []

        doc.on("data", (chunk) => {
          chunks.push(chunk)
        })

        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks)
          const base64Pdf = pdfBuffer.toString("base64")
          resolve(base64Pdf)
        })

        // Default pagination configuration if not provided
        const pagination = paginationConfig || {
          firstPageSmallLimit: 7, // For ≤7 products on first page
          firstPageLargeLimit: 20, // For >7 products on first page
          otherPageWithFooterLimit: 19, // For subsequent pages with footer
          otherPageFullLimit: 28, // For subsequent pages without footer
        }

        const shopName = process.env.SHOP_NAME
        const shopAddressLine1 = process.env.SHOP_ADDRESS_LINE1
        const shopAddressLine2 = process.env.SHOP_ADDRESS_LINE2
        const shopGSTIN = process.env.SHOP_GSTIN
        const shopDLNo = process.env.SHOP_DL_NO
        const gstPercentage = Number.parseFloat(process.env.GST_PERCENTAGE)
        const hsnCode = process.env.HSN_CODE
        const pharmacistName = process.env.SHOP_PHARMACIST_NAME
        const pharmacistPRNo = process.env.SHOP_PHARMACIST_PR_NO

        const startX = 30
        const endX = doc.page.width - 30
        let currentY = 30
        const defaultLineHeight = 12

        // --- Top Header Section ---
        const maxLogoWidth = 120
        const maxLogoHeight = 60
        try {
          const logoPath = "public/logo.png"
          doc.image(logoPath, startX, currentY, {
            fit: [maxLogoWidth, maxLogoHeight],
            align: "left",
            valign: "top",
          })
        } catch (error) {
          doc.rect(startX, currentY, maxLogoWidth, maxLogoHeight).stroke()
          doc
            .fontSize(8)
            .font("Helvetica")
            .text("COMPANY LOGO", startX + 35, currentY + 25)
        }

        // Calculate center position for "Invoice"
        const invoiceText = "INVOICE"
        doc.fontSize(18).font("Helvetica-Bold")
        const invoiceTextWidth = doc.widthOfString(invoiceText)
        const invoiceTextX = (doc.page.width - invoiceTextWidth) / 2

        doc.text(invoiceText, invoiceTextX, currentY + 15) // Centered "Invoice"

        currentY += maxLogoHeight - 5

        // --- Order Details Section ---
        const orderDetailsLeftX = startX
        const orderDetailsRightX = startX + (endX - startX) / 2 + 20

        doc.fontSize(10).font("Helvetica-Bold").text("Order ID:", orderDetailsLeftX, currentY)
        doc.font("Helvetica").text(`${order.orderId}`, orderDetailsLeftX + 60, currentY)

        doc.font("Helvetica-Bold").text("Order Date:", orderDetailsRightX, currentY)
        doc
          .font("Helvetica")
          .text(`${new Date(order.date).toLocaleDateString("en-GB")}`, orderDetailsRightX + 65, currentY)

        currentY += defaultLineHeight + 5

        doc.font("Helvetica-Bold").text("POS:", orderDetailsLeftX, currentY)
        doc.font("Helvetica").text("27-Maharashtra", orderDetailsLeftX + 60, currentY)

        // Add order status information
        doc.font("Helvetica-Bold").text("Status:", orderDetailsRightX, currentY)
        doc.font("Helvetica").text(`${order.status || "PENDING"}`, orderDetailsRightX + 65, currentY)

        currentY += defaultLineHeight + 10

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 10

        // --- Sold By / Bill To Section ---
        const sectionHeaderY = currentY
        const sectionColWidth = (endX - startX - 20) / 2
        const soldByX = startX
        const billToX = startX + sectionColWidth + 20

        doc.fontSize(10).font("Helvetica-Bold").text("SOLD BY(PHARMACY)", soldByX, sectionHeaderY)
        doc.text("BILL TO / SHIP TO (PATIENT)", billToX, sectionHeaderY)
        currentY += defaultLineHeight + 5

        let soldByContentY = currentY
        let billToContentY = currentY

        doc.font("Helvetica-Bold").text(shopName, soldByX, soldByContentY)
        soldByContentY += defaultLineHeight
        doc.font("Helvetica").text(shopAddressLine1, soldByX, soldByContentY)
        soldByContentY += defaultLineHeight
        doc.text(shopAddressLine2, soldByX, soldByContentY)
        soldByContentY += defaultLineHeight
        doc.font("Helvetica-Bold").text(`GSTIN ${shopGSTIN}`, soldByX, soldByContentY)
        soldByContentY += defaultLineHeight + 5

        doc.font("Helvetica-Bold").text(order.shippingAddress?.name || "N/A", billToX, billToContentY)
        billToContentY += defaultLineHeight
        if (order.shippingAddress) {
          const addressLines = [
            order.shippingAddress.line1,
            order.shippingAddress.line2,
            `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
          ].filter(Boolean)

          addressLines.forEach((line) => {
            doc.font("Helvetica").text(line, billToX, billToContentY, { width: sectionColWidth })
            billToContentY = doc.y
          })
          doc.font("Helvetica").text(`Phone: ${order.shippingAddress.phone}`, billToX, billToContentY)
          billToContentY += defaultLineHeight
        }
        if (order.prescriptionDetails?.doctorName) {
          doc.font("Helvetica-Bold").text(`Doctor ${order.prescriptionDetails.doctorName}`, billToX, billToContentY)
          billToContentY += defaultLineHeight
        }

        currentY = Math.max(soldByContentY, billToContentY) + 10

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 5

        doc.fontSize(10).font("Helvetica").text(`DL No. ${shopDLNo}`, startX, currentY)
        currentY += defaultLineHeight + 10

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 10

        // --- Product Table with reordered columns ---
        const tableHeaderHeight = 20
        const rowPadding = 3

        // Calculate total available width for the table (exactly from margin to margin)
        const totalTableWidth = endX - startX // 535.28 points

        // Adjusted column widths to fit exactly within available width
        // New order: #, ITEM NAME, HSN, BATCH, EXPIRY, MRP, PRICE, QTY, AMOUNT
        const columnWidths = {
          hash: 25, // # column
          item: 150, // ITEM NAME - reduced from 180
          hsn: 45, // HSN code
          batch: 55, // BATCH number - moved after HSN
          expiry: 55, // EXPIRY date - moved after BATCH
          mrp: 50, // MRP price
          priceIncl: 50, // PRICE
          qty: 30, // QTY
          amount: 75, // AMOUNT - final column
        }

        // Verify total width fits within available space
        const totalColumnsWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0)

        let colX = startX
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
        }

        const drawTableHeader = (yPos: number) => {
          doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8)

          const textYOffset = (tableHeaderHeight - doc.currentLineHeight()) / 2

          doc.rect(colPositions.hash, yPos, columnWidths.hash, tableHeaderHeight).stroke()
          doc.text("#", colPositions.hash, yPos + textYOffset, { width: columnWidths.hash, align: "center" })

          doc.rect(colPositions.item, yPos, columnWidths.item, tableHeaderHeight).stroke()
          doc.text("ITEM NAME", colPositions.item, yPos + textYOffset, { width: columnWidths.item, align: "center" })

          doc.rect(colPositions.hsn, yPos, columnWidths.hsn, tableHeaderHeight).stroke()
          doc.text("HSN", colPositions.hsn, yPos + textYOffset, { width: columnWidths.hsn, align: "center" })

          doc.rect(colPositions.batch, yPos, columnWidths.batch, tableHeaderHeight).stroke()
          doc.text("BATCH", colPositions.batch, yPos + textYOffset, { width: columnWidths.batch, align: "center" })

          doc.rect(colPositions.expiry, yPos, columnWidths.expiry, tableHeaderHeight).stroke()
          doc.text("EXPIRY", colPositions.expiry, yPos + textYOffset, { width: columnWidths.expiry, align: "center" })

          doc.rect(colPositions.mrp, yPos, columnWidths.mrp, tableHeaderHeight).stroke()
          doc.text("MRP", colPositions.mrp, yPos + textYOffset, { width: columnWidths.mrp, align: "center" })

          doc.rect(colPositions.priceIncl, yPos, columnWidths.priceIncl, tableHeaderHeight).stroke()
          doc.text("PRICE", colPositions.priceIncl, yPos + textYOffset, {
            width: columnWidths.priceIncl,
            align: "center",
          })

          doc.rect(colPositions.qty, yPos, columnWidths.qty, tableHeaderHeight).stroke()
          doc.text("QTY", colPositions.qty, yPos + textYOffset, { width: columnWidths.qty, align: "center" })

          doc.rect(colPositions.amount, yPos, columnWidths.amount, tableHeaderHeight).stroke()
          doc.text("AMOUNT", colPositions.amount, yPos + textYOffset, { width: columnWidths.amount, align: "center" })

          doc.fillColor("#000000").font("Helvetica")
        }

        drawTableHeader(currentY)
        currentY += tableHeaderHeight

        // Prepare product rows based on order status
        let productRows = []
        const isShipped = order.status === "SHIPPED"

        if (isShipped && order.shippedBatches && order.shippedBatches.length > 0) {
          // Group shipped batches by orderProductId
          const batchesByProduct = order.shippedBatches.reduce((acc, batch) => {
            if (!acc[batch.orderProductId]) {
              acc[batch.orderProductId] = []
            }
            acc[batch.orderProductId].push(batch)
            return acc
          }, {})

          // Create rows for each batch
          order.products.forEach((item: any) => {
            const batches = batchesByProduct[item.id] || []

            if (batches.length > 0) {
              // Create separate row for each batch
              batches.forEach((batch) => {
                productRows.push({
                  ...item,
                  quantity: batch.quantity,
                  batchNumber: batch.batchNumber,
                  expiryDate: batch.expiryDate,
                  hsnCode: batch.hsnCode, // Use HSN from batch table
                  isFromBatch: true,
                })
              })
            } else {
              // Product without batch info
              productRows.push({
                ...item,
                batchNumber: "",
                expiryDate: null,
                hsnCode: item.product?.hsnCode, // Use HSN from product table
                isFromBatch: false,
              })
            }
          })
        } else {
          // Order not shipped, show products without batch info
          productRows = order.products.map((item: any) => ({
            ...item,
            batchNumber: "",
            expiryDate: null,
            hsnCode: item.product?.hsnCode, // Use HSN from product table
            isFromBatch: false,
          }))
        }

        const totalProductsInOrder = productRows.length

        // Calculate footer height to determine if it fits on current page
        const calculateFooterHeight = () => {
          const totalRowHeightFooter = 25
          const gapAfterTotalRowFooter = 10
          const summaryRightColWidthFooter = 200
          const priceBreakdownHeaderHeightFooter =
            doc.heightOfString("PRICE BREAKDOWN", { width: summaryRightColWidthFooter }) + 5
          const priceBreakdownContentLinesFooter = 5
          const priceBreakdownContentHeightFooter = priceBreakdownContentLinesFooter * defaultLineHeight
          const priceBreakdownSectionActualHeightFooter =
            priceBreakdownHeaderHeightFooter + priceBreakdownContentHeightFooter
          const summarySectionActualHeightFooter = priceBreakdownSectionActualHeightFooter
          const gapAfterSummarySectionFooter = 10
          const noteLineHeightFooter = defaultLineHeight + 5
          const totalInvoiceAmountLineHeightFooter = defaultLineHeight + 5
          const totalSavingsLineHeightFooter = defaultLineHeight + 5
          const amountInWordsLineHeightFooter =
            doc.heightOfString(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, {
              width: endX - startX,
            }) + 5
          const noteAndFinalTotalSectionActualHeightFooter =
            noteLineHeightFooter +
            totalInvoiceAmountLineHeightFooter +
            totalSavingsLineHeightFooter +
            amountInWordsLineHeightFooter
          const hr1HeightFooter = 1 + 10
          const pharmacistTextLine1HeightFooter = defaultLineHeight
          const pharmacistTextLine2HeightFooter = defaultLineHeight
          const pharmacistBlockActualHeightFooter = pharmacistTextLine1HeightFooter + pharmacistTextLine2HeightFooter
          const signatureTextLineHeightFooter = defaultLineHeight
          const signatureBoxHeightFooter = 50
          const signatureBlockActualHeightFooter = signatureTextLineHeightFooter + 5 + signatureBoxHeightFooter
          const signatureSectionActualHeightFooter = Math.max(
            pharmacistBlockActualHeightFooter,
            signatureBlockActualHeightFooter,
          )
          const gapAfterSignatureSectionFooter = 10
          const finalHrHeightFooter = 1 + 10
          const messageLine2Height = defaultLineHeight
          const messageLine3Height = defaultLineHeight
          const messageLine4Height = doc.heightOfString(
            "Taxable person paying tax in terms of notification No. 2/2019-Central Tax (Rate) dated 07.03.2019, not eligible to collect tax on supplies",
            { width: endX - startX, fontSize: 8 },
          )
          const messageSectionHeight = messageLine2Height + messageLine3Height + messageLine4Height + 10

          return (
            totalRowHeightFooter +
            gapAfterTotalRowFooter +
            summarySectionActualHeightFooter +
            gapAfterSummarySectionFooter +
            noteAndFinalTotalSectionActualHeightFooter +
            hr1HeightFooter +
            signatureSectionActualHeightFooter +
            gapAfterSignatureSectionFooter +
            finalHrHeightFooter +
            messageSectionHeight
          )
        }

        const footerHeight = calculateFooterHeight()
        const pageBottomMargin = 30
        const minRowHeight = 20

        // Advanced pagination logic based on user requirements
        let currentPageNumber = 1
        let rowsPerPage: number
        let productsDrawnOnCurrentPage = 0
        let itemIndex = 1
        let totalQuantity = 0
        let totalAmount = 0
        let totalMRP = 0

        // Determine rows per page for first page
        if (totalProductsInOrder <= 7) {
          rowsPerPage = pagination.firstPageSmallLimit
        } else {
          rowsPerPage = pagination.firstPageLargeLimit
        }

        const drawVerticalRowLines = (yPos: number, height: number) => {
          doc.strokeColor("#000000").lineWidth(1)
          doc
            .moveTo(colPositions.hash, yPos)
            .lineTo(colPositions.hash, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.hash + columnWidths.hash, yPos)
            .lineTo(colPositions.hash + columnWidths.hash, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.item + columnWidths.item, yPos)
            .lineTo(colPositions.item + columnWidths.item, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.hsn + columnWidths.hsn, yPos)
            .lineTo(colPositions.hsn + columnWidths.hsn, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.batch + columnWidths.batch, yPos)
            .lineTo(colPositions.batch + columnWidths.batch, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.expiry + columnWidths.expiry, yPos)
            .lineTo(colPositions.expiry + columnWidths.expiry, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.mrp + columnWidths.mrp, yPos)
            .lineTo(colPositions.mrp + columnWidths.mrp, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.priceIncl + columnWidths.priceIncl, yPos)
            .lineTo(colPositions.priceIncl + columnWidths.priceIncl, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.qty + columnWidths.qty, yPos)
            .lineTo(colPositions.qty + columnWidths.qty, yPos + height)
            .stroke()
          doc
            .moveTo(colPositions.amount + columnWidths.amount, yPos)
            .lineTo(colPositions.amount + columnWidths.amount, yPos + height)
            .stroke()
        }

        productRows.forEach((item: any, index: number) => {
          const productName = item.product ? item.product.name : "Unknown Product"
          const variantName = item.variant ? item.variant.name : ""
          const fullProductName = `${productName}\n${variantName}`

          const itemTextHeight = doc.heightOfString(fullProductName, { width: columnWidths.item - rowPadding * 2 })
          const actualRowHeight = Math.max(minRowHeight, itemTextHeight + rowPadding * 2)

          // Check if we need to move to next page
          let shouldMoveToNextPage = false

          if (currentPageNumber === 1) {
            // First page logic - simple check against first page limit
            shouldMoveToNextPage = productsDrawnOnCurrentPage >= rowsPerPage
          } else {
            // Subsequent pages logic - check against current page limit
            shouldMoveToNextPage = productsDrawnOnCurrentPage >= rowsPerPage
          }

          if (shouldMoveToNextPage) {
            doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()

            doc.addPage()
            currentPageNumber++
            currentY = 30
            drawTableHeader(currentY)
            currentY += tableHeaderHeight
            productsDrawnOnCurrentPage = 0

            // Determine rows per page for this new page
            const remainingProductsAfterPageBreak = totalProductsInOrder - index

            // Check if remaining products can fit with footer on one page
            if (remainingProductsAfterPageBreak <= pagination.otherPageWithFooterLimit) {
              // All remaining products can fit with footer - use otherPageWithFooterLimit
              rowsPerPage = pagination.otherPageWithFooterLimit
            } else {
              // More products than can fit with footer - use otherPageFullLimit
              rowsPerPage = pagination.otherPageFullLimit
            }
          }

          drawVerticalRowLines(currentY, actualRowHeight)
          const rowStartContentY = currentY + rowPadding

          const unitPriceInclusive = item.price
          const discountValue = item.variant?.discount || 0
          const discountType = item.variant?.discountType || "AMOUNT"

          let mrpInclusive = unitPriceInclusive
          if (discountType.toUpperCase() === "AMOUNT") {
            mrpInclusive = unitPriceInclusive + discountValue
          } else if (discountType.toUpperCase() === "PERCENTAGE") {
            mrpInclusive = unitPriceInclusive / (1 - discountValue / 100)
          }

          const itemTotal = unitPriceInclusive * item.quantity

          totalMRP += mrpInclusive * item.quantity

          doc.fontSize(8)
          doc.text(itemIndex.toString(), colPositions.hash, rowStartContentY, {
            width: columnWidths.hash,
            align: "center",
          })
          doc.text(fullProductName, colPositions.item + rowPadding, rowStartContentY, {
            width: columnWidths.item - rowPadding * 2,
            align: "left",
          })

          // Use HSN from batch table or product table with fallback
          const displayHsnCode = item.hsnCode || hsnCode || "N/A"
          doc.text(displayHsnCode, colPositions.hsn, rowStartContentY, { width: columnWidths.hsn, align: "center" })

          // Batch Number column (now after HSN)
          doc.text(item.batchNumber || "-", colPositions.batch, rowStartContentY, {
            width: columnWidths.batch,
            align: "center",
          })

          // Expiry Date column (now after BATCH)
          const expiryText = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-GB") : "-"
          doc.text(expiryText, colPositions.expiry, rowStartContentY, {
            width: columnWidths.expiry,
            align: "center",
          })

          doc.text(`${mrpInclusive.toFixed(2)}/-`, colPositions.mrp, rowStartContentY, {
            width: columnWidths.mrp,
            align: "center",
          })
          doc.text(`${unitPriceInclusive.toFixed(2)}/-`, colPositions.priceIncl, rowStartContentY, {
            width: columnWidths.priceIncl,
            align: "center",
          })
          doc.text(item.quantity.toString(), colPositions.qty, rowStartContentY, {
            width: columnWidths.qty,
            align: "center",
          })
          doc.text(`${itemTotal.toFixed(2)}/-`, colPositions.amount, rowStartContentY, {
            width: columnWidths.amount,
            align: "center",
          })

          currentY += actualRowHeight
          productsDrawnOnCurrentPage++
          itemIndex++

          totalQuantity += item.quantity
          totalAmount += itemTotal
        })

        // Fill remaining empty rows on current page
        const remainingEmptyRows = rowsPerPage - productsDrawnOnCurrentPage
        for (let i = 0; i < remainingEmptyRows; i++) {
          drawVerticalRowLines(currentY, minRowHeight)
          currentY += minRowHeight
        }

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()

        // Check if footer fits on current page, if not move to next page
        if (currentY + footerHeight > doc.page.height - pageBottomMargin) {
          doc.addPage()
          currentY = 30
        }

        // Add total row - updated for reordered columns
        const totalRowHeightFooter = 25
        const gapAfterTotalRowFooter = 10
        const totalMergedWidth =
          columnWidths.hash +
          columnWidths.item +
          columnWidths.hsn +
          columnWidths.batch +
          columnWidths.expiry +
          columnWidths.mrp +
          columnWidths.priceIncl

        doc.rect(colPositions.hash, currentY, totalMergedWidth, totalRowHeightFooter).stroke()
        doc.rect(colPositions.qty, currentY, columnWidths.qty, totalRowHeightFooter).stroke()
        doc.rect(colPositions.amount, currentY, columnWidths.amount, totalRowHeightFooter).stroke()

        doc.fontSize(9).font("Helvetica-Bold")
        doc.text("TOTAL", colPositions.hash, currentY + rowPadding + 5, {
          width: totalMergedWidth,
          align: "center",
        })
        doc.text(totalQuantity.toString(), colPositions.qty, currentY + rowPadding + 5, {
          width: columnWidths.qty,
          align: "center",
        })
        doc.text(`${totalAmount.toFixed(2)}/-`, colPositions.amount, currentY + rowPadding + 5, {
          width: columnWidths.amount,
          align: "center",
        })

        currentY += totalRowHeightFooter + gapAfterTotalRowFooter

        // Check if there are meaningful batch numbers and expiry dates
        const hasValidBatchInfo = productRows.some((item: any) => {
          const batchNumber = item.batchNumber || ""
          const expiryDate = item.expiryDate

          // List of common placeholder patterns for batch numbers
          const placeholderPatterns = [
            /^j883ry$/i, // Specific placeholder mentioned
            /^[a-z0-9]{6,10}$/i, // Random alphanumeric strings (6-10 chars)
            /^[a-z]+[0-9]+[a-z]*$/i, // Pattern like "e73278gyu", "8yee76e7", "cdcdw1212"
            /^[0-9]+[a-z]+[0-9]*$/i, // Pattern like "2ew32e32", "31e3e13"
            /^test/i, // Test batch numbers
            /^dummy/i, // Dummy batch numbers
            /^sample/i, // Sample batch numbers
          ]

          // Check if batch number looks like a real batch number (not a placeholder)
          const hasValidBatch =
            batchNumber &&
            batchNumber !== "-" &&
            batchNumber !== "" &&
            !placeholderPatterns.some((pattern) => pattern.test(batchNumber)) &&
            batchNumber.length >= 4 // Real batch numbers are usually longer

          // Check if expiry date exists and is not a common placeholder date
          const placeholderDates = ["12/08/2025", "01/01/2025", "31/12/2025", "01/01/2026"]

          const hasValidExpiry =
            expiryDate &&
            expiryDate !== null &&
            !placeholderDates.includes(new Date(expiryDate).toLocaleDateString("en-GB"))

          return hasValidBatch && hasValidExpiry // Both must be valid for real batch info
        })

        // Add note about batch information only if there are valid batch numbers/expiry dates
        if (isShipped && hasValidBatchInfo) {
          doc.fontSize(9).font("Helvetica-Oblique")
          doc.text("Note: Batch numbers and expiry dates are provided for shipped orders.", startX, currentY)
          currentY += defaultLineHeight + 5
        } else if (!isShipped) {
          doc.fontSize(9).font("Helvetica-Oblique")
          doc.text("Note: Batch numbers and expiry dates will be provided upon shipment.", startX, currentY)
          currentY += defaultLineHeight + 5
        }

        // --- Summary Section ---
        const summaryRightColX = startX // Align Price Breakdown to the left

        let summaryY = currentY // This will be the starting Y for Price Breakdown

        doc.fontSize(10).font("Helvetica-Bold").text("PRICE BREAKDOWN", summaryRightColX, summaryY)
        summaryY += defaultLineHeight + 5

        doc.fontSize(10).font("Helvetica").text("Original Price (MRP):", summaryRightColX, summaryY)
        doc.text(
          `${(order.subTotal + order.discount + order.couponDiscount).toFixed(2)}/-`,
          summaryRightColX,
          summaryY,
          {
            width: endX - summaryRightColX,
            align: "right",
          },
        )
        summaryY += defaultLineHeight

        doc.fontSize(10).text("Discount:", summaryRightColX, summaryY)
        doc.text(`${order.discount.toFixed(2)}/-`, summaryRightColX, summaryY, {
          width: endX - summaryRightColX,
          align: "right",
        })
        summaryY += defaultLineHeight

        doc.fontSize(10).font("Helvetica").text("Our Price:", summaryRightColX, summaryY)
        doc.text(`${order.subTotal.toFixed(2)}/-`, summaryRightColX, summaryY, {
          width: endX - summaryRightColX,
          align: "right",
        })
        summaryY += defaultLineHeight

        doc.fontSize(10).text("Coupon Discount:", summaryRightColX, summaryY)
        doc.text(`${order.couponDiscount.toFixed(2)}/-`, summaryRightColX, summaryY, {
          width: endX - summaryRightColX,
          align: "right",
        })
        summaryY += defaultLineHeight

        doc.fontSize(10).text("Shipping:", summaryRightColX, summaryY)
        doc.text(`${order.shipping.toFixed(2)}/-`, summaryRightColX, summaryY, {
          width: endX - summaryRightColX,
          align: "right",
        })
        summaryY += defaultLineHeight

        currentY = summaryY + 10

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 10

        // --- Note and Final Total Section ---
        doc.fontSize(9).font("Helvetica-Bold").text("Note :", startX, currentY)
        currentY += defaultLineHeight + 5

        doc.fontSize(12).font("Helvetica-Bold").text("Total Invoice Amount:", startX, currentY)
        doc.text(`${order.orderTotal.toFixed(2)}/-`, endX - 80, currentY, { width: 80, align: "right" })
        currentY += defaultLineHeight + 5

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Total savings is ${order.discount.toFixed(2)}/-`, startX, currentY)
        currentY += defaultLineHeight + 5

        doc.fontSize(10).text(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, startX, currentY)
        currentY +=
          doc.heightOfString(`Amount In Words: ${this.numberToWordsIndian(order.orderTotal)}`, {
            width: endX - startX,
          }) + 5

        // --- New Section: Pharmacist and Signature ---
        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 10

        const signatureBlockStartY = currentY // This is the common Y for both left and right columns

        // Left side: Pharmacist details
        doc.fontSize(10).font("Helvetica-Bold").text("PHARMACIST :", startX, signatureBlockStartY)
        doc.font("Helvetica").text(`${pharmacistName}`, startX + 70, signatureBlockStartY)
        let leftColumnCurrentY = signatureBlockStartY + defaultLineHeight

        doc.font("Helvetica-Bold").text(`For ${shopName}`, startX, leftColumnCurrentY)
        leftColumnCurrentY += defaultLineHeight

        // Right side: Authorized Signature text and box
        const signatureBoxWidth = 120
        const signatureBoxHeight = 50
        const authorizedSignatureText = "Authorized Signature"

        const signatureBoxX = endX - signatureBoxWidth // Right-align the box

        // Define the top Y position of the signature box, aligning it with the start of the pharmacist text
        const signatureBoxY = signatureBlockStartY

        // Calculate text width to position it to the left
        doc.fontSize(10).font("Helvetica-Bold")
        const authorizedSignatureTextWidth = doc.widthOfString(authorizedSignatureText)
        const textPadding = 5 // Padding between text and box

        // Position the "Authorized Signature" text to the left of the box, vertically centered with the box.
        const authorizedSignatureTextX = signatureBoxX - authorizedSignatureTextWidth - textPadding
        const authorizedSignatureTextY = signatureBoxY + signatureBoxHeight / 2 - doc.currentLineHeight() / 2

        doc.text(authorizedSignatureText, authorizedSignatureTextX, authorizedSignatureTextY)

        // Draw the signature box
        doc.rect(signatureBoxX, signatureBoxY, signatureBoxWidth, signatureBoxHeight).stroke()

        // Load and place the signature image inside the rectangle
        const signatureImagePath = "public/sign.png"
        try {
          // Place image 5 units from top-left of box to provide padding
          doc.image(signatureImagePath, signatureBoxX + 5, signatureBoxY + 5, {
            fit: [signatureBoxWidth - 10, signatureBoxHeight - 10], // Fit within the box with padding
            align: "center",
            valign: "top", // Ensures it's at the top of its *fit* area within the box
          })
        } catch (error) {
          console.error("Error loading signature image:", error)
          // Fallback text if image fails to load
          doc
            .fontSize(8)
            .font("Helvetica")
            .text("Signature Here", signatureBoxX, signatureBoxY + signatureBoxHeight / 2 - 4, {
              width: signatureBoxWidth,
              align: "center",
            })
        }

        const rightColumnBottomY = signatureBoxY + signatureBoxHeight // Bottom of the right signature block

        currentY = Math.max(leftColumnCurrentY, rightColumnBottomY) + 10

        doc.strokeColor("#000000").lineWidth(1).moveTo(startX, currentY).lineTo(endX, currentY).stroke()
        currentY += 10

        // --- New Message Section at the very bottom ---
        const currentDate = new Date().toLocaleDateString("en-GB")
        doc.fontSize(10).font("Helvetica") // Increased font size
        doc.text(
          `Thank you for trusting us. This bill is system generated on ${currentDate}.`,
          startX,
          currentY,
          { width: endX - startX }, // Make it span full width
        )
        currentY += defaultLineHeight + 2 // Adjusted line height for larger font

        doc.text("For detailed terms and conditions, visit ", startX, currentY, { continued: true })
        doc.fillColor("blue").text("jansevagenmeds.com/terms-conditions", {
          link: "https://www.jansevagenmeds.com/terms-conditions",
          underline: true,
          continued: false,
        })
        doc.fillColor("#000000") // Reset fill color
        currentY = doc.y + 2 // Adjusted line height

        // New line added here
        doc
          .fontSize(8.8)
          .text(
            "Taxable person paying tax in terms of notification No. 2/2019-Central Tax (Rate) dated 07.03.2019, not eligible to collect tax on supplies",
            startX,
            currentY,
            { width: endX - startX },
          )
        currentY = doc.y + 5 // Adjusted line height for smaller font

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }
}
