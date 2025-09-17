import AccordionItem from "./AccordionItem"
import environment from "../../CONFIG/environment"

interface Faq {
  title: string
  content: string
}

const FAQS: Faq[] = [
  {
    title: "What are the delivery charges for medicines?",
    content: `Free delivery on orders above ${environment.FREE_DELIVERY_MINIMUM}. Orders below ${environment.FREE_DELIVERY_MINIMUM} have a delivery charge of ${environment.SHIPPING_CHARGE} across India.`,
  },
  {
    title: "How long does medicine delivery take?",
    content: `Delivery takes ${environment.DELIVERY_DAYS_STANDARD} across India.`,
  },
  {
    title: "Do you deliver medicines pan-India?",
    content:
      "Yes, we deliver pan-India. Enter your PIN code at checkout to confirm delivery availability in your area.",
  },
  {
    title: "How can I track my medicine order?",
    content:
      "Go to Profile → My Orders to track your order status and get real-time updates on your medicine delivery.",
  },
  {
    title: "What can I do if I receive a 'ORDER DELIVERED' message, but my order is still not delivered?",
    content: `If you receive a delivery confirmation but haven't received your medicines, please contact us immediately on WhatsApp at ${environment.SUPPORT_PHONE}. Our team will investigate and resolve the issue promptly.`,
  },
]

function Delivery() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Medicine Delivery FAQs</h2>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  )
}

export default Delivery
