import AccordionItem from "./AccordionItem"

interface Faq {
  title: string
  content: string
}

const FAQS: Faq[] = [
  {
    title: "What payment methods are accepted on JanSeva?",
    content:
      "We accept all major payment methods through our secure Cashfree payment gateway including Credit Cards (Visa, MasterCard, American Express), Debit Cards, Net Banking, UPI payments, and digital wallets. All transactions are processed securely with 256-bit SSL encryption.",
  },
  {
    title: "Is it safe to make payments on JanSeva?",
    content:
      "Yes, absolutely safe. We use Cashfree, a PCI DSS compliant payment gateway that ensures your card details are never stored on our servers. All transactions are encrypted and processed through secure banking channels with multiple layers of fraud protection.",
  },
  {
    title: "What should I do if my payment fails or shows as pending?",
    content:
      "If your payment fails, you can retry immediately using the same or different payment method. For pending payments, wait for 15-30 minutes as bank processing may take time. If amount is debited but order isn't confirmed, contact our support - refunds are processed within 5-7 business days.",
  },
  {
    title: "How do refunds work and when will I receive my money back?",
    content:
      "Refunds are processed automatically through Cashfree to your original payment method. Credit/Debit card refunds take 5-7 business days, while UPI and wallet refunds are processed within 1-2 business days. You'll receive SMS and email confirmation once refund is initiated.",
  },
  {
    title: "Do you offer Cash on Delivery (COD) option?",
    content:
      "No, we currently do not offer Cash on Delivery. We only accept online payments through our secure Cashfree gateway to ensure faster order processing and delivery. This also helps us maintain competitive pricing on generic medicines.",
  },
]

function PaymentFAQ() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment & Billing</h2>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  )
}

export default PaymentFAQ
