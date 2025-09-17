import AccordionItem from "./AccordionItem"
import environment from "@/CONFIG/environment"

interface Faq {
  title: string
  content: string
}

const FAQS: Faq[] = [
  {
    title: "How do I contact JanSeva customer support?",
    content: `Call our helpline at ${environment.SUPPORT_PHONE}, use live chat on our app/website, or email ${environment.SUPPORT_EMAIL}. Our pharmacist team is available ${environment.SUPPORT_HOURS} for medicine-related queries.`,
  },
  {
    title: "How do I verify if my generic medicine is authentic?",
    content:
      "Scan the QR code on medicine packaging using our app's verification feature. All medicines come with batch numbers and manufacturing details for authenticity confirmation.",
  },
  {
    title: "What should I do if I experience side effects from a medicine?",
    content: `Stop taking the medicine immediately and consult your doctor. Report the adverse effect through our app's 'Report Side Effect' feature or contact our grievance officer ${environment.GRIEVANCE_OFFICER_NAME} for proper documentation and guidance.`,
  },
  {
    title: "Can I get help choosing the right generic alternative?",
    content: `Yes, our qualified pharmacist ${environment.SHOP_PHARMACIST_NAME} and team provide free consultation via chat or call. Upload your prescription and get personalized generic medicine recommendations with price comparisons.`,
  },
  {
    title: "How do I track my order and get delivery updates?",
    content:
      "Track your order real-time through our app using your order ID. You'll receive SMS/email updates at each stage: confirmed, packed, shipped, out for delivery, and delivered.",
  },
]

function GeneralIssues() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">General Issues & Support</h2>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  )
}

export default GeneralIssues
