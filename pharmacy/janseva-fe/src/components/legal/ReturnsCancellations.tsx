import { LegalLayout } from "@/layouts"
import TermsList from "./TermsList"
import environment from "@/CONFIG/environment"

const {
  COMPANY_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SHOP_PHARMACIST_NAME,
  GRIEVANCE_OFFICER_NAME,
  SHOP_ADDRESS_LINE1,
  SHOP_ADDRESS_LINE2,
  WEBSITE_URL,
  SUPPORT_HOURS,
  WORKING_HOURS,
  LAST_UPDATED,
} = environment

const termsData = [
  {
    id: "1",
    title: "General Information",
    content: [
      {
        id: "1.1",
        title: "About Returns and Cancellations",
        content: `At ${COMPANY_NAME}, we understand that sometimes you may need to return or cancel your order. This policy outlines the terms and conditions for returns and cancellations of medicines and healthcare products purchased from our store.`,
      },
      {
        id: "1.2",
        title: "Contact Information",
        content: `For any queries regarding returns or cancellations, please contact us at ${SUPPORT_EMAIL} or call us at ${SUPPORT_PHONE} ${SUPPORT_HOURS}. Our customer service team is available ${WORKING_HOURS}.`,
      },
    ],
  },
  {
    id: "2",
    title: "Cancellation Policy",
    content: [
      {
        id: "2.1",
        title: "How and When Can I Cancel My Order?",
        content: `Orders can be cancelled at any stage before delivery. You can cancel your order through our website ${WEBSITE_URL}, mobile app, or by contacting our customer service team.`,
      },
      {
        id: "2.2",
        title: "Pre-dispatch Cancellation",
        content: [
          "You can cancel the order from our website or mobile app:",
          [
            "Go to Orders → Select your order → Order details → Cancel order",
            `Or by calling our Customer Service Representative at ${SUPPORT_PHONE} ${SUPPORT_HOURS}`,
          ],
          "Cancellation before dispatch is free of charge and full refund will be processed within 3-5 business days.",
        ],
      },
      {
        id: "2.3",
        title: "Post-Dispatch Cancellation",
        content: `If your order has already been dispatched, you will need to connect with our customer service team at ${SUPPORT_PHONE}. The refund will only be processed after the order is marked as "Returned to Origin". This process usually takes 5 to 7 business days. Refund will be initiated within 48 hours of ${COMPANY_NAME} receiving the returned medicines.`,
      },
      {
        id: "2.4",
        title: "Refund Process",
        content: [
          "Refunds for cancelled orders will be processed as follows:",
          [
            "Online payments: Refund to original payment method within 5-7 business days",
            "Cash on Delivery: No refund applicable as no payment was made",
            "Wallet payments: Refund to wallet within 24-48 hours",
          ],
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Return Policy",
    content: [
      {
        id: "3.1",
        title: "Return Eligibility",
        content: `You can initiate a return request within 15 days of delivery. Returns are subject to the condition that medicines are unopened, unused, and in their original packaging. Please check the product page on ${WEBSITE_URL} to verify if the specific product is eligible for return.`,
      },
      {
        id: "3.2",
        title: "How to Initiate a Return",
        content: [
          "To return your order, follow these steps:",
          [
            `Visit ${WEBSITE_URL} and go to your order history`,
            "Select the item you wish to return and specify the quantity and reason",
            `Alternatively, call us at ${SUPPORT_PHONE} ${SUPPORT_HOURS}`,
            "Our team may contact you to verify any damage or defects before processing the return",
            "Once approved, we will arrange pickup within 24-48 hours",
          ],
        ],
      },
      {
        id: "3.3",
        title: "Return Package Requirements",
        content: [
          "When preparing your return package:",
          [
            "Ensure medicines are in original packaging sent by " + COMPANY_NAME,
            "Include a handwritten note with your Order Number on the package",
            "Alternatively, include our original invoice in the return package",
            "All items must be unopened and unused",
            "Original packaging and seals must be intact",
          ],
        ],
      },
      {
        id: "3.4",
        title: "Return Processing",
        content: `Once we receive your returned package at our warehouse (usually within 5-7 days), our quality team will verify the returned medicines. Upon successful verification, a refund will be initiated within 48 hours of receiving the returned items. Refunds are processed to the original payment method.`,
      },
    ],
  },
  {
    id: "4",
    title: "Non-Returnable Items",
    content: [
      {
        id: "4.1",
        title: "Items That Cannot Be Returned",
        content: [
          "The following items are not eligible for return:",
          [
            "Prescription medicines that have been opened or used",
            "Cold chain products (vaccines, insulin, etc.) that require refrigeration",
            "Personal care items and cosmetics once opened",
            "Nutritional supplements with broken seals",
            "Medical devices and equipment once used",
            "Items damaged due to misuse or negligence",
            "Expired medicines (returns not accepted after expiry date)",
          ],
        ],
      },
      {
        id: "4.2",
        title: "Special Cases",
        content: `For prescription medicines, returns are only accepted if there was an error in dispensing or if the product was damaged during transit. All prescription returns require verification by our licensed pharmacist ${SHOP_PHARMACIST_NAME}.`,
      },
    ],
  },
  {
    id: "5",
    title: "Refund Policy",
    content: [
      {
        id: "5.1",
        title: "Refund Timeline",
        content: [
          "Refund processing times:",
          [
            "Credit/Debit Cards: 5-7 business days",
            "Net Banking: 5-7 business days",
            "UPI/Digital Wallets: 1-3 business days",
            `${COMPANY_NAME} Wallet: 24-48 hours`,
            "Cash on Delivery: Not applicable (no payment made)",
          ],
        ],
      },
      {
        id: "5.2",
        title: "Refund Amount",
        content: `The refund amount will be the actual amount paid for the product, excluding any delivery charges. If you used a discount coupon or promotional offer, the refund will be adjusted accordingly. Shipping charges are non-refundable unless the return is due to our error.`,
      },
      {
        id: "5.3",
        title: "Partial Refunds",
        content: `In case of partial returns (returning only some items from your order), the refund will be calculated proportionally. Delivery charges will be adjusted based on the remaining order value.`,
      },
    ],
  },
  {
    id: "6",
    title: "Damaged or Defective Products",
    content: [
      {
        id: "6.1",
        title: "Reporting Damaged Items",
        content: `If you receive damaged or defective products, please report it within 24 hours of delivery by calling ${SUPPORT_PHONE} or emailing ${SUPPORT_EMAIL}. Please provide clear photos of the damaged items and packaging.`,
      },
      {
        id: "6.2",
        title: "Resolution Process",
        content: [
          "For damaged or defective items:",
          [
            "We will arrange immediate pickup of the damaged product",
            "A replacement will be sent within 24-48 hours if available",
            "If replacement is not available, full refund will be processed",
            "No questions asked policy for manufacturing defects",
            "Expedited processing for critical medications",
          ],
        ],
      },
    ],
  },
  {
    id: "7",
    title: "Wrong Item Delivered",
    content: [
      {
        id: "7.1",
        title: "Incorrect Order Resolution",
        content: `If you receive an incorrect item, please contact us immediately at ${SUPPORT_PHONE}. Do not consume any medicine that was not prescribed to you. We will arrange pickup of the incorrect item and deliver the correct product at no additional cost.`,
      },
      {
        id: "7.2",
        title: "Safety First",
        content: `For your safety, never consume medicines that were not prescribed to you or that you did not order. Our licensed pharmacist ${SHOP_PHARMACIST_NAME} ensures all prescriptions are verified before dispensing.`,
      },
    ],
  },
  {
    id: "8",
    title: "Prescription Medicine Returns",
    content: [
      {
        id: "8.1",
        title: "Prescription Return Policy",
        content: `Prescription medicines can only be returned if they are unopened and in original packaging. Returns must be initiated within 15 days of delivery. All prescription returns require approval from our licensed pharmacist ${SHOP_PHARMACIST_NAME}.`,
      },
      {
        id: "8.2",
        title: "Regulatory Compliance",
        content: `As per Drugs and Cosmetics Act, 1940, and rules thereunder, we maintain strict protocols for prescription medicine returns. All returned prescription medicines are quarantined and disposed of as per regulatory guidelines to ensure patient safety.`,
      },
    ],
  },
  {
    id: "9",
    title: "Customer Support",
    content: [
      {
        id: "9.1",
        title: "Contact Information",
        content: [
          "For returns and cancellations support:",
          [
            `Phone: ${SUPPORT_PHONE} ${SUPPORT_HOURS}`,
            `Email: ${SUPPORT_EMAIL}`,
            `Website: ${WEBSITE_URL}`,
            `Owner & Licensed Pharmacist: ${SHOP_PHARMACIST_NAME}`,
            `Address: ${SHOP_ADDRESS_LINE1}, ${SHOP_ADDRESS_LINE2}`,
          ],
        ],
      },
      {
        id: "9.2",
        title: "Escalation Process",
        content: `If your query is not resolved within 7 business days, you may escalate it to our Grievance Officer ${GRIEVANCE_OFFICER_NAME} at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}. We are committed to resolving all customer concerns promptly and fairly.`,
      },
    ],
  },
  {
    id: "10",
    title: "Terms and Conditions",
    content: [
      {
        id: "10.1",
        title: "Policy Updates",
        content: `${COMPANY_NAME} reserves the right to modify this Returns and Cancellations policy at any time. Any changes will be updated on our website ${WEBSITE_URL} and will be effective immediately upon posting.`,
      },
      {
        id: "10.2",
        title: "Governing Law",
        content: `This policy is governed by the laws of India. Any disputes arising from returns or cancellations will be subject to the jurisdiction of courts in the state where ${COMPANY_NAME} is registered.`,
      },
      {
        id: "10.3",
        title: "Final Authority",
        content: `${COMPANY_NAME} reserves the right to make final decisions on all return and cancellation requests. Our licensed pharmacist ${SHOP_PHARMACIST_NAME} has the authority to approve or reject returns based on safety and regulatory requirements.`,
      },
    ],
  },
]

export default function ReturnsCancellations() {
  return (
    <LegalLayout title="Returns & Cancellations Policy" lastUpdated={LAST_UPDATED}>
      <div className="mb-6">
        <p className="text-gray-600 leading-relaxed">
          This Returns and Cancellations Policy outlines the procedures and conditions for returning products or
          cancelling orders placed with {COMPANY_NAME}. Our policy is designed to ensure customer satisfaction while
          maintaining compliance with pharmaceutical regulations and safety standards. For any assistance, please
          contact our Owner & Licensed Pharmacist {SHOP_PHARMACIST_NAME}, or reach out to our Grievance Officer{" "}
          {GRIEVANCE_OFFICER_NAME} for escalated concerns.
        </p>
      </div>
      <TermsList data={termsData} />
    </LegalLayout>
  )
}
