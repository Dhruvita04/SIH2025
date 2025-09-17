import AccordionItem from "./AccordionItem"

const FAQS = [
  {
    title: "How does the prescription upload and doctor review process work?",
    content:
      "Upload your prescription through our secure portal. Our licensed doctors review it within 24 hours and add the exact generic medicines to your cart based on your prescription requirements.",
  },
  {
    title: "What happens after I upload my prescription?",
    content:
      "Our qualified doctors verify your prescription and manually add the recommended generic medicines to your cart. You'll receive a notification once the medicines are added and ready for checkout.",
  },
  {
    title: "Can doctors modify my prescription or suggest alternatives?",
    content:
      "Our doctors can only add generic equivalents of prescribed medicines to your cart. They cannot modify prescriptions but may contact you if clarification is needed about dosage or medicine names.",
  },
  {
    title: "How long does it take for doctors to add medicines to my cart?",
    content:
      "Prescription review and medicine addition typically takes 12-24 hours. You'll receive SMS and email notifications once our doctors have added the medicines to your cart for purchase.",
  },
  {
    title: "What if the prescribed medicine is not available in generic form?",
    content:
      "Our doctors will contact you directly to discuss available alternatives. If no suitable generic equivalent exists, we'll inform you and suggest consulting your prescribing doctor for alternatives.",
  },
]

function DoctorConsultation() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">  Doctor Review Process</h2>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  )
}

export default DoctorConsultation
