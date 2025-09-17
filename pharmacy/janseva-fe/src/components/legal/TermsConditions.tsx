import environment from "../../CONFIG/environment"

export default function TermsConditions() {
  const {
    COMPANY_NAME,
    SUPPORT_EMAIL,
    SUPPORT_PHONE,
    SHOP_PHARMACIST_NAME,
    GRIEVANCE_OFFICER_NAME,
    SHOP_ADDRESS_LINE1,
    SHOP_ADDRESS_LINE2,
    WEBSITE_URL,
    EFFECTIVE_DATE,
    SUPPORT_HOURS,
    WORKING_HOURS,
  } = environment

  const terms = [
    {
      id: "1.",
      title: "TERMS OF USE",
      content: [
        `By continuing to access and use ${COMPANY_NAME} website or mobile application, you confirm your acceptance of our Terms of Use. If you do not accept these terms, please exit immediately.`,
      ],
    },
    {
      id: "2.",
      title: `About ${COMPANY_NAME}`,
      content: [
        `${WEBSITE_URL} website and mobile application (collectively referred to as 'Platform') are owned and operated by ${COMPANY_NAME}, having its licensed premises at ${SHOP_ADDRESS_LINE1} ${SHOP_ADDRESS_LINE2} and other locations. For inquiries or complaints, contact us at ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}.`,
        "Our Platform facilitates online sale of conventional and alternative pharmaceutical products (excluding Schedule X drugs), online medical teleconsultation services through third-party medical practitioners, recommendation of substitute medicines, and delivery of products through independent delivery partners.",
        `${COMPANY_NAME} has obtained all necessary licenses under the Drugs and Cosmetics Act, 1940 and Food Safety and Standards Act, 2006 to provide these services.`,
        `The Platform is available to individuals who register according to our procedures. ${COMPANY_NAME} acts as a facilitator between you and third-party service providers.`,
        "By accessing our Platform, you confirm you have legal capacity to enter into binding contracts under Indian law. You represent that you're authorized to share any third-party information with us.",
        "By clicking 'I Accept' or using our Platform, you agree to these Terms of Use and our Privacy Policy.",
        `These Terms are effective from ${EFFECTIVE_DATE}.`,
      ],
    },
    {
      id: "3.",
      title: "Professional Standards",
      content: [
        `${COMPANY_NAME} services are provided from our licensed premises, and medication dispensing is supervised by registered pharmacists who adhere to professional ethics and conduct standards.`,
      ],
    },
    {
      id: "4.",
      title: "Privacy",
      content: [
        "We value your privacy. Please review our Privacy Policy for details on what information we collect and how we use and protect it.",
      ],
    },
    {
      id: "5.",
      title: "Registration",
      content: [
        `By registering with ${COMPANY_NAME}, you confirm you are at least 18 years old and not legally barred from entering contracts. Registration is required to use our services. We reserve the right to suspend or terminate access if we believe your continued use may harm ${COMPANY_NAME} or other users. You agree to provide accurate information during registration and to update it promptly if changes occur.`,
      ],
    },
    {
      id: "6.",
      title: "Account Security",
      content: [
        "During registration, you'll receive a username and password or One-Time Password (OTP). You're responsible for keeping these credentials confidential and ensuring they aren't used by unauthorized persons.",
        "For details about the information we collect, please refer to our Privacy Policy.",
      ],
    },
    {
      id: "7.",
      title: "Third-Party Prescriptions",
      content: [
        "If submitting a prescription for someone else, you must have their authorization. By placing such an order, you confirm you have their permission.",
      ],
    },
    {
      id: "8.",
      title: "Age Restrictions",
      content: [
        "We accept prescription orders from users 18 years or older. For orders for minors, the ordering adult must have legal authority to do so. By placing an order, you confirm you're at least 18 years old and legally competent.",
      ],
    },
    {
      id: "9.",
      title: "Service Area",
      content: [`${COMPANY_NAME} currently accepts and delivers orders to selected locations within India only.`],
    },
    {
      id: "10.",
      title: "Order Confirmation",
      content: [
        `Your order becomes binding only after ${COMPANY_NAME} confirms it via phone, email, or in writing. We reserve the right to reject any order. All deliveries depend on valid prescription verification, availability of delivery services to your location, and product stock availability.`,
      ],
    },
    {
      id: "11.",
      title: "Prescription Requirements",
      content: [
        `If we don't receive a valid prescription within 24 hours of your order placement, we may cancel your order and initiate a refund. For queries, contact our support at ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}.`,
      ],
    },
    {
      id: "12.",
      title: "Prescription Verification",
      content: [
        "You must upload a legible, valid prescription from a registered Indian medical practitioner with a valid Certificate of Practice. Valid prescriptions are required for ordering medications as per the Drugs and Cosmetics Act, 1940.",
        "Our pharmacists will verify your prescription against your order information. If discrepancies exist, we may contact you using your registration information. If we cannot reach you, we reserve the right to return your prescription.",
        "You confirm that you'll only submit original or authentic electronic copies of prescriptions and will adhere to any refill limitations specified by the prescriber.",
        `You agree not to upload false, expired, tampered, or incorrect prescriptions. ${COMPANY_NAME} assumes no liability for products sold based on invalid prescriptions.`,
        "You confirm that medications are for legitimate patient use only, not for resale or unauthorized purposes.",
        `${COMPANY_NAME} reserves the right to verify prescription authenticity through all available means.`,
      ],
    },
    {
      id: "13.",
      title: "Teleconsultation Services",
      content: [
        `${COMPANY_NAME} partners with third-party service providers for teleconsultation services. These providers are independent entities whose services you access with your consent.`,
        `Medical consultations, opinions, and recommendations provided through our Platform are solely the responsibility of the medical practitioners providing them, not ${COMPANY_NAME}.`,
        `${COMPANY_NAME} facilitates the connection between you and healthcare providers but is not responsible for the medical advice given.`,
        "By using teleconsultation services, you explicitly consent to their initiation under applicable law.",
        `${COMPANY_NAME} does not verify the accuracy of information you provide for consultations.`,
        "Teleconsultations may be recorded for quality assurance purposes with your consent.",
      ],
    },
    {
      id: "14.",
      title: "Substitute Medicines",
      content: [
        "Substitute medications may be provided if your doctor has permitted generic equivalents or if the prescription lists salt names instead of brand names.",
        "Our service providers may recommend substitutes after professional examination through teleconsultation, with your consent.",
        `${COMPANY_NAME} is not liable for any issues arising from the sale of substitute medications.`,
      ],
    },
    {
      id: "15.",
      title: "Service Disclaimer",
      content: [
        `${COMPANY_NAME} is an intermediary technology service provider. Any complaints regarding health issues, consultations, or services provided by third-party service providers are between you and those providers.`,
        `${COMPANY_NAME} is not liable for medical negligence, prescription errors, appointment issues, or medical outcomes resulting from third-party services.`,
      ],
    },
    {
      id: "16.",
      title: "Subscription Services",
      content: [
        `${COMPANY_NAME} offers subscription plans for recurring medication needs. Orders under subscription plans are placed automatically according to your chosen schedule and are subject to all applicable terms and statutory requirements.`,
      ],
    },
    {
      id: "17.",
      title: "Promotional Offers",
      content: [
        `Promotional offers cannot be combined with subscription orders. Subscription orders receive standard discounts available at the time of processing. ${COMPANY_NAME} has sole discretion regarding applicable offers.`,
      ],
    },
    {
      id: "18.",
      title: "Product Discounts",
      content: [
        `Discounts are available on selected products only and may change at ${COMPANY_NAME}'s discretion without prior notice.`,
      ],
    },
    {
      id: "19.",
      title: "Product Availability",
      content: [
        "If ordered items are unavailable or unsuitable for dispensing, we'll attempt to contact you using your provided information.",
      ],
    },
    {
      id: "20.",
      title: "Product Ownership",
      content: [
        "Title to products transfers to you upon dispensation and invoice generation at our licensed premises, regardless of delivery location.",
        "Prescription medications require signature upon delivery. Items are delivered to your registered address or an alternative address you specify.",
      ],
    },
    {
      id: "21.",
      title: "Delivery Process",
      content: [
        "You appoint third-party delivery partners as your agents to collect medications from our licensed premises and deliver them to your specified address.",
        `These delivery partners are independent contractors, not ${COMPANY_NAME} employees.`,
        "All products are delivered in compliance with applicable laws regarding privacy and confidentiality.",
      ],
    },
    {
      id: "22.",
      title: "Service Limitations",
      content: [
        `${COMPANY_NAME} does not guarantee that our Platform will meet all your requirements or be error-free.`,
        `${COMPANY_NAME} is not liable for manufacturing defects in products. Claims regarding defects should be directed to the manufacturer.`,
      ],
    },
    {
      id: "23.",
      title: "Order Processing",
      content: [
        `Order acceptance depends on prescription verification, stock availability, and delivery feasibility. ${COMPANY_NAME} may share your prescription with associated pharmacies and distributors to fulfill your order in compliance with applicable laws.`,
      ],
    },
    {
      id: "24.",
      title: "Payment Options",
      content: [
        `${COMPANY_NAME} is entitled to full payment upon product delivery. Prices on our Platform are estimates; actual prices depend on the specific batch and will be shown on your invoice.`,
        "We currently support payment via debit cards, credit cards, prepaid cards, netbanking, UPI, digital wallets, EMI options, pay-later services, and cash on delivery.",
        `${COMPANY_NAME} is not liable for transaction declines due to exceeding preset limits with our acquiring bank.`,
      ],
    },
    {
      id: "25.",
      title: "Product Verification",
      content: [
        "You should carefully check all items immediately upon receipt. If you suspect a dispensing error, contact us immediately and do not use the products.",
      ],
    },
    {
      id: "26.",
      title: "Prescription Delivery",
      content: [
        `Prescription medications require signature upon delivery. Items are delivered to your registered address or an alternative address you specify. ${COMPANY_NAME} is not liable for items lost or damaged after delivery.`,
      ],
    },
    {
      id: "27.",
      title: "Returns and Refunds",
      content: [
        "Return requests must be submitted within 15 days of delivery by raising a ticket on our Platform. No refunds will be processed after this period.",
        "For missing, damaged, or incorrect items, we'll arrange return pickup and process refunds within 48 hours of verification.",
        "Electronic products and items requiring refrigeration are non-returnable and non-refundable.",
      ],
    },
    {
      id: "28.",
      title: "Delivery Verification",
      content: [
        "Please verify all details and documents at the time of delivery. Complaints regarding shortages or defects will not be entertained after acceptance.",
      ],
    },
    {
      id: "29.",
      title: "SAFETY WARNING",
      content: [
        `YOU MUST INSPECT ALL MEDICATIONS UPON RECEIPT AND SHOULD NOT TAKE ANY MEDICATION THAT APPEARS TAMPERED WITH OR INCORRECTLY DISPENSED. ${COMPANY_NAME} IS NOT LIABLE FOR HEALTH ISSUES RESULTING FROM FAILURE TO FOLLOW THIS WARNING.`,
      ],
    },
    {
      id: "30.",
      title: "Information Purpose",
      content: [
        "Content on our Platform regarding products is for general information only and does not constitute medical advice, diagnosis, treatment, or advertisement of drugs.",
      ],
    },
    {
      id: "31.",
      title: "Third-Party Promotions",
      content: [
        `${COMPANY_NAME} and our business partners may promote goods or services on our Platform. While we encourage quality offerings at competitive prices, we do not endorse these products or services and have no liability regarding their suitability.`,
      ],
    },
    {
      id: "32.",
      title: "Surveys and Referrals",
      content: [
        "Participation in surveys and contests is voluntary. Information collected may include contact and demographic details used to notify winners and improve our Platform.",
        "Our referral program offers rewards for referring new customers. Referral rewards are credited after successful delivery of the referred order.",
        `${COMPANY_NAME} reserves the right to modify or cancel these programs at any time.`,
      ],
    },
    {
      id: "33.",
      title: "User Communications",
      content: ["Please refer to our Privacy Policy for information about how and when we communicate with you."],
    },
    {
      id: "34.",
      title: "Platform Usage",
      content: [
        "You agree to use our Platform and materials only for permitted purposes under these Terms and applicable laws. You will not use automated means to access our Platform, circumvent navigation structures, or engage in activities that could interfere with proper operation.",
      ],
    },
    {
      id: "35.",
      title: "Intellectual Property",
      content: [
        "Our Platform and its content are protected by copyright and other intellectual property laws. You may display and print content for personal use only, without altering or removing copyright notices.",
        "You agree not to reproduce, store, distribute, modify, or create derivative works from our Platform without written permission, or use it for unlawful or commercial purposes.",
      ],
    },
    {
      id: "36.",
      title: "Content Suitability",
      content: [
        "We do not guarantee that materials on our Platform will meet your requirements or be secure, error-free, or virus-free.",
      ],
    },
    {
      id: "37.",
      title: "Platform Availability",
      content: [
        "Our Platform is provided free of charge without guarantees of uninterrupted or error-free service. We reserve the right to modify or withdraw any part of the Platform without notice.",
      ],
    },
    {
      id: "38.",
      title: "External Links",
      content: [
        `Our Platform may contain links to third-party websites. These links are provided for convenience only, and ${COMPANY_NAME} has no control over or liability for these external sites.`,
      ],
    },
    {
      id: "39.",
      title: "Usage Monitoring",
      content: [
        `${COMPANY_NAME} may monitor activity on our Platform and take appropriate action if we suspect violations of these Terms, including suspending access or notifying authorities.`,
      ],
    },
    {
      id: "40.",
      title: "Security Measures",
      content: [
        "Please refer to our Privacy Policy for information about our security practices and your obligations regarding the information you provide.",
      ],
    },
    {
      id: "41.",
      title: "Information Accuracy",
      content: [
        "We make reasonable efforts to ensure information accuracy, but our services are continuously evolving and information may occasionally be outdated. For current information, contact us directly.",
      ],
    },
    {
      id: "42.",
      title: "General Disclaimer",
      content: [
        `${COMPANY_NAME} DOES NOT WARRANT THAT PLATFORM CONTENT IS ACCURATE, COMPLETE, OR CURRENT, OR THAT THE PLATFORM WILL BE DEFECT-FREE. NOTHING ON THIS PLATFORM CONSTITUTES PROFESSIONAL ADVICE. CONSULT QUALIFIED PROFESSIONALS BEFORE TAKING OR REFRAINING FROM ANY ACTION.`,
      ],
    },
    {
      id: "43.",
      title: "Liability Limitations",
      content: [
        `${COMPANY_NAME}'S MAXIMUM LIABILITY IS LIMITED TO THE COST OF PRODUCTS PURCHASED OR SERVICES USED. WE ARE NOT LIABLE FOR INDIRECT, CONSEQUENTIAL, OR OTHER DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR ANTICIPATED SAVINGS.`,
      ],
    },
    {
      id: "44.",
      title: "Third-Party Rights",
      content: [
        "These Terms do not confer benefits on any third party, and non-parties have no rights to enforce them.",
      ],
    },
    {
      id: "45.",
      title: "Legal Compliance",
      content: [`${COMPANY_NAME} maintains data in compliance with applicable laws and regulatory requirements.`],
    },
    {
      id: "46.",
      title: "Force Majeure",
      content: [
        `${COMPANY_NAME} is not liable for performance failures due to circumstances beyond reasonable control, including legislative changes, natural disasters, accidents, epidemics, war, strikes, or government actions.`,
      ],
    },
    {
      id: "47.",
      title: "Governing Law",
      content: [
        "These Terms are governed by Indian law, and disputes are subject to the exclusive jurisdiction of courts in Maharashtra, India.",
      ],
    },
    {
      id: "48.",
      title: "Terms Acceptance",
      content: [
        "By clicking 'I accept the terms and conditions' during registration, you indicate acceptance of these Terms and our Privacy Policy. If you disagree with these Terms, you should not access our Platform.",
      ],
    },
    {
      id: "49.",
      title: "Modifications",
      content: [
        "No delay in enforcing rights under these Terms constitutes a waiver of those rights.",
        `${COMPANY_NAME} RESERVES THE RIGHT TO MODIFY THESE TERMS AT ANY TIME. CONTINUED USE OF OUR PLATFORM AFTER CHANGES INDICATES YOUR ACCEPTANCE OF THE NEW TERMS. PLEASE REVIEW THESE TERMS REGULARLY.`,
      ],
    },
    {
      id: "50.",
      title: "User Indemnification",
      content: [
        `You agree to indemnify and hold ${COMPANY_NAME} harmless from third-party claims arising from your use of our Platform, violation of these Terms, or infringement of intellectual property rights.`,
      ],
    },
    {
      id: "51.",
      title: "Severability",
      content: [
        "If any provision of these Terms is declared invalid, the remaining provisions remain in full force and effect.",
      ],
    },
    {
      id: "52.",
      title: "Customer Support",
      content: [
        `For assistance, contact our support team at ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE} ${SUPPORT_HOURS}.`,
        "Unresolved queries may be escalated to our Grievance Officer after 7 days:",
        `Name: ${GRIEVANCE_OFFICER_NAME}`,
        `Email: ${SUPPORT_EMAIL}`,
        `Address: ${COMPANY_NAME}, ${SHOP_ADDRESS_LINE1} ${SHOP_ADDRESS_LINE2}`,
        `Contact: ${SUPPORT_PHONE}`,
        `${WORKING_HOURS}, excluding national holidays`,
        `${COMPANY_NAME} NEVER requests confidential information like OTP/CVV/PIN through calls, SMS, or emails. Report suspicious activities to ${SUPPORT_EMAIL}`,
      ],
    },
    {
      id: "53.",
      title: "Contact Information",
      content: [
        `Email: ${SUPPORT_EMAIL}`,
        `Phone: ${SUPPORT_PHONE} ${SUPPORT_HOURS}`,
        `Owner & Pharmacist: ${SHOP_PHARMACIST_NAME}`,
        `Registered Office: ${COMPANY_NAME}, ${SHOP_ADDRESS_LINE1} ${SHOP_ADDRESS_LINE2}`,
        `Website: ${WEBSITE_URL}`,
      ],
    },
  ]

  return (
    <div className="max-w-full mx-auto p-5 font-sans">
      {terms.map((section) => (
        <div key={section.id} className="mb-5 last:mb-0">
          <h2 className="text-xl font-bold text-gray-900 mb-5 uppercase">
            {section.id} {section.title}
          </h2>
          <div className="space-y-5">
            {section.content.map((text, index) => (
              <p key={index} className="text-gray-600 leading-relaxed">
                {text}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
