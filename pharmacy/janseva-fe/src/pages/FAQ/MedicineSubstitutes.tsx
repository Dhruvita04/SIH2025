import AccordionItem from "./AccordionItem"

interface Faq {
  title: string
  content: string
}

const FAQS: Faq[] = [
  {
    title: "What are generic medicines?",
    content:
      "Generic medicines contain the same active ingredients as branded medicines but are sold without brand names. They have identical therapeutic effects and safety profiles but cost 40-80% less than branded alternatives.",
  },
  {
    title: "Are generic medicines as effective as branded medicines?",
    content:
      "Yes, generic medicines are equally effective. They undergo the same rigorous testing and must meet identical safety, quality, and efficacy standards as branded medicines. They are approved by CDSCO and manufactured in WHO-GMP certified facilities.",
  },
  {
    title: "Why are generic medicines cheaper than branded ones?",
    content:
      "Generic medicines are cheaper because manufacturers don't invest in research, development, and marketing costs that original drug developers incurred. Once patents expire, multiple manufacturers can produce the same medicine, creating competition that reduces prices.",
  },
  {
    title: "Can I substitute my prescribed branded medicine with a generic one?",
    content:
      "Yes, you can safely substitute most branded medicines with generic equivalents as they contain identical active ingredients. However, for critical medications or specific health conditions, consult our pharmacist or your doctor before switching.",
  },
  {
    title: "How do I find the generic equivalent of my prescribed medicine?",
    content:
      "Simply search for your prescribed medicine on our platform using the brand name or active ingredient. Our system automatically displays available generic alternatives with the same composition, strength, and dosage form.",
  },
]

function MedicineSubstitutes() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Medicine Substitutes & Generics</h2>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} title={faq.title} content={faq.content} />
        ))}
      </div>
    </div>
  )
}

export default MedicineSubstitutes
