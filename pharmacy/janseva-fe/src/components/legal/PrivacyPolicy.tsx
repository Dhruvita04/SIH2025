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
  EFFECTIVE_DATE,
  SUPPORT_HOURS,
  WORKING_HOURS,
} = environment

const privacyPolicyData = {
  title: "Privacy Policy",
  lastUpdated: EFFECTIVE_DATE,
  sections: [
    {
      title: "Scope and Purpose",
      content: [
        {
          id: "1.1",
          text: `This Privacy Policy governs what information ${COMPANY_NAME} ("${COMPANY_NAME}"/ "We"/ "Us"/ "Our"/ "the Company"), as the owner and operator of the domain name ${WEBSITE_URL}, and internet based platform, and "${COMPANY_NAME}", a mobile application (each individually, "Website" and "App" respectively, and together, "the Platforms"), collects from a user ("You"/ "Your" / "User") of the Platforms in the course of providing Services (as defined in the Terms of Use available at ${WEBSITE_URL}/legal/terms-and-conditions and how We use, process, store, deal, handle or disclose such information.`,
        },
        {
          id: "1.2",
          text: `${COMPANY_NAME} is fully committed to respecting confidentiality, protecting your privacy and ensuring the security of any personal information received from You or a registered medical practitioner authorized by You. We strictly adhere to the applicable laws on data protection India, and this Privacy Policy is especially published in accordance with:`,
          subPoints: [
            {
              label: "",
              text: 'Section 43A of the Information Technology Act, 2000 ("IT Act");',
            },
            {
              label: "",
              text: 'Rule 4 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011 ("RSP Rules");',
            },
            {
              label: "",
              text: 'Rule 3(1) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 ("Intermediary Guidelines"); and,',
            },
            {
              label: "",
              text: 'Appendix 5 (Telemedicine Practice Guidelines) to the Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002 introduced in 2020 ("Telemedicine Guidelines").',
            },
          ],
        },
        {
          text: `This Privacy Policy is effective from ${EFFECTIVE_DATE}. Any word capitalized and not defined in this Privacy Policy shall derive its meaning from the Terms of Use.`,
        },
      ],
    },
    {
      title: "General Terms",
      content: [
        {
          id: "2.1",
          text: "Please read this Privacy Policy carefully before using the Website or App.",
        },
        {
          id: "2.2",
          text: 'By clicking "I Accept", or when otherwise accessing or using the Platforms, You confirm that you have read, understood and agree to be bound the terms of this Privacy Policy including any terms incorporated by reference and expressly consent to the collection, use, storage, handling and disclosure of Your information as per this Privacy Policy.',
        },
        {
          id: "2.3",
          text: "You hereby explicitly represent that any information provided by You on our Platforms, or to the registered medical practitioner / Service Provider providing You the Services or otherwise is voluntary and subject to this Privacy Policy. You agree that We will not be required to validate any information provided by You, unless otherwise offered by Us or required under applicable law.",
        },
        {
          id: "2.4",
          text: "By accessing or using the Platforms, you hereby confirm that You have the capacity to enter into a legally binding contract under Indian law, and in particular, the Indian Contract Act, 1872.",
        },
        {
          id: "2.5",
          text: `You represent that You are duly authorized as per applicable law by any third party (including a person under the age of 18 years) whose information you share with us and for that information to be processed as per the terms of this Privacy Policy. You hereby agree that ${COMPANY_NAME} shall be acting as per your representation of authority and shall not make any independent enquiries to ascertain the genuineness of your authorization. Any liability in relation to your acts and omissions in this regard (including in sharing information) or resulting from consequent actions taken by us pursuant to your acts and omissions in accordance with this Privacy Policy shall also solely be borne by you.`,
        },
        {
          id: "2.6",
          text: `If You are accessing or using our Services on the Platforms from a location outside India, You do so at your own risk, and ${COMPANY_NAME} shall not be liable for compliance with any applicable local laws outside India.`,
        },
        {
          id: "2.7",
          text: "If You do not agree with any of the terms and conditions of this Privacy Policy, please do not proceed further to use the Website or the App or any Services.",
        },
        {
          id: "2.8",
          text: "You hereby consent to Our collection, use, sharing, and disclosure of Your information as described in this Privacy Policy. We reserve the right to change, modify, add or delete portions of the terms of this Privacy Policy, from time to time as we deem fit, without intimating you. Your continued use of the Website, App, the Services or the Platform, following any such amendments to the Privacy Policy, will be deemed as an implicit acceptance of the Privacy Policy in its amended form. You are requested to review the Privacy Policy on a regular basis to keep yourself updated with any changes, modifications made to the terms hereof. If you do not accept any changes, modifications made to the terms, You may terminate your use of this Website, App, the Services or the Platform immediately.",
        },
      ],
    },
    {
      title: "Information that We collect",
      content: [
        {
          id: "3.1",
          text: `A User may have limited access to the Platforms and Services provided by ${COMPANY_NAME} without creating an account on the Website or App. In order to access all features and benefits of the Services, a User is required to first create an account on the Platforms. The information required for registration is provided in the Terms of Use but may be updated from time to time. Other information requested on the registration page which is optional shall be indicated as such.`,
        },
        {
          id: "3.2",
          text: 'During the course of You accessing or using the Platforms and availing Services, You may provide, or We may collect personal information, i.e., information which, either directly or indirectly, in combination with other information, is capable of identifying You or some other individual. Some of this personal information also qualifies as sensitive personal data or information ("SPDI") as defined under the RSP Rules. Given below are the types of information that we may collect.',
        },
        {
          id: "3.3",
          text: "Information You give Us: We receive and store information provided by You on the Platforms in connection with Our Services. This includes: a. Contact Information: Name, Delivery Address, Phone Number, Email ID, Password; b. Demographic Information: Gender, Age, Date of Birth, Nationality, Marital Status; c. Medical Information: Medical records and history, details of your prescribing doctor, prescriptions uploaded and any other physical, physiological or mental health condition which you voluntarily provide Us, Our personnel or the Service Provider; d. Usage History: Search history, history of teleconsultation appointments made on the Platforms, history of medicines ordered (completed, cancelled or returned) including those which are substitute drugs and any other detail relating to the same as voluntarily provided by You; e. Surveys: Any information provided by you in relation to surveys, contests or referrals; f. Call records: Any call records relating to the rendering of Services or teleconsultation (discussed below); and g. Any additional information that you voluntarily choose to provide to ${COMPANY_NAME} or the Service Provider through any mode of communication or during any interaction.",
        },
        {
          id: "3.4",
          text: "Information from Other Sources: We receive information about You from third parties viz. Our partners, advertisers, Service Provider, and Third Party Delivery Partners etc. such as order details and other information that You share with such third parties.",
        },
        {
          id: "3.5",
          text: 'Cookies and tracking technologies: "Cookies" are small data files (usually in a text format) that are placed by network operators and web platforms on a user\'s internal device storage (e.g. hard drive, memory card etc.) to collect information about activity on the web platform. Like most websites and apps, We also utilize cookies to analyze data about Our Platforms traffic, which helps save Your preference for future visits. Tracking technologies may record information such as internet domain and host names, internet protocol (IP) addresses, browser software and operating system types, stream patterns, and dates and times that Website or App is accessed. Our use of cookies and other tracking technologies allows Us to improve the Platforms as well as Your experience.',
        },
        {
          id: "3.6",
          text: "Our cookies do not collect any SPDI from You, except that voluntarily provided by You. Most browsers/mobile settings allow You to control cookies, including whether or not to accept them and how to remove them. You may set most browsers/mobile application to notify you if you receive a cookie, or You may choose to block cookies with your browser/mobile applications. However, by refusing or blocking cookies in relation to our Website or App, You may not be able to use certain features on the Platforms or take full advantage of our Services.",
        },
        {
          id: "3.7",
          text: 'Third party tools and software: The App utilizes third party software developer kits ("SDKs") for its architecture and infrastructure, with the majority being various payment options by which a User can make a payment for an order.',
        },
        {
          id: "3.8",
          text: "Automatic technical information: During your visit to our Platforms, We may automatically receive technical information about your computer/device, such as your Internet Protocol (\"IP\") address, your computer operating system type and version, time-zone, browser type and plug-in details due to certain communication protocol settings on the Internet. We may also receive information about Your location and Your mobile device such as a unique identification number for your device. Please note that the link between the User's IP address and the User's personally identifiable information is not shared with third parties without User's permission or except when required by law or to provide or facilitate the User with the Services. The amount of information sent to us depends on the settings of the web browser used by the User to access the Website. The User may refer to the browser used, if the User wishes to learn what information is provided to us.",
        },
        {
          id: "3.9",
          text: "Teleconsultation: Pursuant to the Telemedicine Guidelines, it is incumbent on a registered medical practitioner to maintain and request for, as applicable, – (i) log or record of telemedicine interaction (e.g. Phone logs, email records, chat/ text record, video interaction logs etc), (ii) Patient records, reports, documents, images, diagnostics, data etc. (Digital or non-Digital) utilized in the telemedicine consultation, (iii) specifically, in case a prescription is shared with the patient, the prescription records, (iv) additional information from You required to be able to exercise proper clinical judgement. As the Service Provider is obliged to follow the applicable law, such information provided by You shall also be collected and stored. We also reserve the right to record, store or supervise the teleconsultation session between You and the Service Provider for internal quality control purposes as well as store your e-prescription, and by accessing or using Our Services You hereby explicitly consent to the same.",
        },
      ],
    },
    {
      title: "How We use Your Information",
      content: [
        {
          id: "4.1",
          text: `${COMPANY_NAME} collects and uses Your information only to the extent necessary for the below listed purposes:`,
          subPoints: [
            {
              label: "",
              text: "To register You for the purpose of receiving Our Services, identification, communication, notification and for performance of Our obligations or obligations of the Service Provider or Third Party Delivery Partners arising out of or in relation to the Terms of Use such as, inter alia, ordering, arranging teleconsultation, delivery, billing;",
            },
            {
              label: "",
              text: "To improve functionality of Our Platforms and Services, and customize Your future experience with us so as to be most effective for You;",
            },
            {
              label: "",
              text: "To address Your requests, queries and complaints, if any, pertaining to Our Services, and other customer care related activities;",
            },
            {
              label: "",
              text: "To analyse data, track trends, build algorithms, create databases for rating systems, recommendation engines, to optimize Our Services;",
            },
            {
              label: "",
              text: "To conduct audits and quality control or assessment procedures;",
            },
            {
              label: "",
              text: "For non-targeting reasons such as frequency capping, compliance, billing, market research, or product development purposes;",
            },
            {
              label: "",
              text: "For research purposes;",
            },
            {
              label: "",
              text: "To send the reminders via calls to enable the chronic patients to place their recurrent orders;",
            },
            {
              label: "",
              text: `To send notices, communications, alerts, messages, new offers relevant to use of the Services offered by ${COMPANY_NAME} or the Service Provider;`,
            },
            {
              label: "",
              text: "For the purpose of contacting You by way of SMS, email and phone calls to provide You with information on new Services and offers, taking feedback, assisting you with completion of transactions and placing the incomplete orders or educating the customers about the relevant/related products or any other issues relating to the use of Services;",
            },
            {
              label: "",
              text: "To contact You by way of SMS, email and phone calls, if You have added certain products to Your cart but have not been able to complete the checkout process or place the order successfully. This is to facilitate Your order completion effectively and provide assistance with any issues that You may be experiencing with regard to Our Services;",
            },
            {
              label: "",
              text: `To send You information about special promotions or offers (either offered by ${COMPANY_NAME} or by its business partners), new features or products both of the ${COMPANY_NAME} as well as third-party offers or products with whom ${COMPANY_NAME} has a tie-up;`,
            },
            {
              label: "",
              text: "To conduct surveys, contests or referral programs;",
            },
            {
              label: "",
              text: "To the extent necessary for Our internal business purposes; or",
            },
            {
              label: "",
              text: "To detect or monitor any fraudulent or illegal activity on the Platform.",
            },
            {
              label: "",
              text: "To comply with applicable law such as to meet any legal or regulatory requirement or comply with a request from any governmental or judicial authority.",
            },
          ],
        },
        {
          id: "4.2",
          text: `${COMPANY_NAME} may utilize cookies and other information that is automatically collected to (i) personalize Our services, such as remembering Your information so that You will not have to re-enter it during your visit or the next time you visit the Service; (ii) provide customized content and information; (iii) monitor and analyze the effectiveness of the Service and third-party marketing activities; (iv) monitor aggregate site usage metrics such as total number of visitors and pages viewed; and (v) track Your entries, submissions, and status in any promotions or other activities on the Service. A designated ${COMPANY_NAME} personnel may also use Your personal information for data analysis or for understanding other trends about your lifestyle and You hereby authorize us to share the same with Our Service Provider for the limited purpose of their understanding and consideration. ${COMPANY_NAME} shall exclusively own such data, unless You opt to purchase the same for a consideration payable to Us.`,
        },
        {
          id: "4.3",
          text: `${COMPANY_NAME} may access or store Your information to investigate, prevent, or take action regarding illegal activities, suspected fraud, situations involving potential threats to the safety of any person, violations of the Terms of Use, or as otherwise required by law.`,
        },
        {
          id: "4.4",
          text: `We may collect, analyze, use, publish, create and sell to third parties non-personally identifiable information in an aggregated form for internal research, statistical analysis and business intelligence purposes including those for the purposes of determining the number of visitors and transactional details or any other purpose deemed necessary by ${COMPANY_NAME}.`,
        },
      ],
    },
    {
      title: "Access, Disclosure and Sharing of Your Information",
      content: [
        {
          id: "5.1",
          text: `${COMPANY_NAME} treats Your personal information with the highest regard for Your privacy and the same is dealt with by ${COMPANY_NAME} employees only on a need-to-know basis and after such employees are bound to confidentiality obligations. We do not sell, rent or exchange any personally identifiable information that You provide to Us through the Platforms with any third party for commercial reasons. However, we share Your personal information with Our Service Provider and Third Party Delivery Partners to the extent required by our Services as well as online payment service partners to perform payment processing and authorization. Pursuant to applicable law, such information is only shared after taking best efforts to ensure that such third party has implemented measures to assure data protection measures that are either subject to this Privacy Policy or follow practices to the greatest extent possible which are as protective as those described in this Privacy Policy. By using the Platforms, You accept the terms hereof and hereby consent to the storage and processing of the personal information and SPDI by the said third parties and/or the Service Provider. Further, We are the facilitator between our Users and our Service Provider. You consent to sharing your personal information with the Service Provider and the registered medical practitioners engaged by the Service Provider and agree to undertake all the risks associate with it. It is clarified that we will not be responsible and liable for the acts of omissions and commissions of such third parties associated with us. However, We may facilitate resolving any issue You may face with third parties associated with us.`,
        },
        {
          id: "5.2",
          text: "As with any business, it is possible that as Our business develops, We might sell or buy other businesses or assets. In such transactions, user information is typically one of the transferred business assets. Consequently, any third party to which We transfer or sell Our assets, merge or consolidate with, will have the right to continue to use the information (including SPDI) provided to Us by You, in accordance with the Terms of Use and this Privacy Policy. We may disclose information to Our partners, affiliates, subsidiaries, group entities, investors, stakeholders or potential associates in an anonymized and aggregate manner, so that they too may understand how users use Our Website or App and enable Us to create a better overall experience for You.",
        },
        {
          id: "5.3",
          text: `${COMPANY_NAME} may release account and other personal information when We believe in good faith that such release is appropriate to comply with applicable law including: (i) pursuant to an order under the law for the time being in force, (ii) in response to enquiries by Government agencies for the purpose of verification of identity, or for prevention, detection, investigation including cyber incidents, prosecution, and punishment of offences, (iii) to protect and defend the rights or property of ${COMPANY_NAME}; (iv) to fight fraud and credit risk or otherwise address technical issues; (v) to enforce the Terms of Use or Privacy Policy; (vi) prevent a crime or in interest of national security; (vii) protect personal safety of Our Users or the public; or (viii) when ${COMPANY_NAME} deems it necessary in order to protect its rights or the rights of others.`,
        },
        {
          id: "5.4",
          text: "Notwithstanding the aforesaid, but subject to applicable law, We may at Our sole discretion, transfer personal information, including SPDI, to any other body corporate that has taken best efforts to ensure at least the same level of data protection as is provided by Us under the terms hereof, located in India or any other country. By accessing or using the Platforms, You accept the terms hereof and explicitly consent to Us sharing and/or processing Your personal information, including SPDI, with third parties and in any of location outside India. We will make best efforts to ensure that the third party or the location to which the SPDI is transferred accords same level of data protection as would be afforded under Indian law.",
        },
        {
          id: "5.5",
          text: `To the extent necessary to provide Users with the services on the Website and app (iOS & Android), ${COMPANY_NAME} may provide their Personal Information to third party contractors who work on behalf of or with ${COMPANY_NAME} to provide Users with such services, to help ${COMPANY_NAME} communicate with Users or to maintain the Website and app (iOS & Android). Generally, these contractors do not have any independent right to share this information, however certain contractors who provide services on the Website and app (iOS & Android), including the providers of online communications services, will have rights to use and disclose the personal information collected in connection with the provision of these services in accordance with their own privacy policies.`,
        },
        {
          id: "5.6",
          text: `Non-personally identifiable information may be disclosed to third parties such as technology vendors and research firms and ${COMPANY_NAME} may also share its aggregate findings (not specific information) based on information relating to the User's internet use to prospective, investors, strategic partners, sponsors and others in order to help growth of ${COMPANY_NAME}'s business.`,
        },
      ],
    },
    {
      title: "Retention of Information",
      content: [
        {
          id: "6.1",
          text: "We store Your personal information in accordance with the applicable laws and such information shall be secure with Us as long as it is necessary to offer You Our services. Such information in Our possession or under Our control, shall be destroyed and/or anonymized as soon as it is reasonable to assume that: (i) the purposes for which your information has been collected have been fulfilled; and (ii) retention is no longer necessary for any other reason, or under any applicable law. We keep non-personally identifiable information for research and statistical purposes for a longer period.",
        },
        {
          id: "6.2",
          text: "In case You do not want to avail Our services and wish to withdraw or cancel your registration, as per the applicable laws, We are obligated to retain Your information for a further period of one hundred and eighty days after such withdrawal or cancellation. We are also obliged to keep such information for 180 days after receiving actual knowledge of any storage or hosting of information described in rule 3(1)(g) read with rule 3(1)(h) of the Intermediaries Guidelines. We may also keep Your information for a longer period of time if so required by any order of a Court or a direction of a competent authority or Government agency as per applicable law, or for any other purpose as required under applicable law.",
        },
        {
          id: "6.3",
          text: "Notwithstanding anything in the foregoing, the storage and retention of information shall be subject to applicable law, including but not limited to rule 3(1) of the Intermediaries Guidelines and the Telemedicine Guidelines.",
        },
      ],
    },
    {
      title: "Our Security Policy",
      content: [
        {
          id: "7.1",
          text: `${COMPANY_NAME} has taken reasonable precautions to treat personal information as confidential and to protect it from unauthorized access, improper use, disclosure or modification, and unlawful destruction or accidental loss.`,
        },
        {
          id: "7.2",
          text: "To prevent unauthorized access, We have put in place the industry-standard security technology and procedures to safeguard the information We collect data on the Platforms or via email, messages etc. In particular, Your personal information, including any records of your e-prescription or teleconsultation, is encrypted and is protected with AWS Security Protocols. We store your personally information on the computer servers placed in a secure environment.",
        },
        {
          id: "7.3",
          text: `Even though We have taken significant steps to protect Your personal information, no company, including ${COMPANY_NAME}, can fully eliminate security risks associated with the storage and retention of personal information.`,
        },
      ],
    },
    {
      title: "Your rights in relation to Your Information",
      content: [
        {
          id: "8.1",
          text: "You have the right to withdraw Your consent at any time to use Our Services at any time, or delete Your account. However, such withdrawal of consent will not be retroactive, and Your personal information will nonetheless be subject to retention obligations under applicable law as noted in clause 6.2.",
        },
        {
          id: "8.2",
          text: `You may review, correct, update, change the information that You have provided such as e-mail and contact preferences etc. by logging into your account or contacting customer support or through any other mode made available from time to time. If certain information is incorrect, You may request Us to modify or delete the same by emailing us at ${SUPPORT_EMAIL}. ${COMPANY_NAME} will take all reasonable measures to ensure that the information is modified and used for rendering Services to You and as otherwise in compliance with laws. We reserve the right to verify and authenticate Your identity and Your personal information in order to ensure accurate delivery of products and Services. Access to or correction, updating or deletion of your personal information may be denied or limited by Us if it would violate another person's rights and/or is not otherwise permitted by applicable law, or would require unreasonable technical efforts.`,
        },
        {
          id: "8.3",
          text: `If a User, as a casual visitor who has not registered, has inadvertently browsed through the Platforms prior to reading the Privacy Policy and the Terms of Use, and such User does not agree with the manner in which such information is obtained, the act of uninstalling the App or quitting the web browser application should ordinarily clear all temporary cookies installed by ${COMPANY_NAME}. All visitors, however, are encouraged to use the "clear cookies" functionality of their browsers, or similar functionality on their mobile devices to ensure such clearing/ deletion, as ${COMPANY_NAME} cannot guarantee, predict or provide for the behavior of the equipment of all its visitors.`,
        },
        {
          id: "8.4",
          text: `In case You do not provide Your information or consent for usage of personal information or subsequently withdraw Your consent for usage of the personal information so collected, ${COMPANY_NAME} reserves the right to discontinue the services for which the said information was sought subject to applicable law.`,
        },
      ],
    },
    {
      title: "Updates to the Privacy Policy & Promotional Communication",
      content: [
        {
          id: "9.1",
          text: "As per applicable law, We shall periodically inform our registered Users, at least once every year, that in case of non-compliance with this Privacy Policy or Terms of Use, we have the right to terminate our Services immediately or remove non-compliant information or both.",
        },
        {
          id: "9.2",
          text: "As per applicable law, We shall periodically, and at least once in a year, inform our registered Users of the Privacy Policy or Terms of Use or any change thereto.",
        },
        {
          id: "9.3",
          text: `${COMPANY_NAME} does not make any unsolicited calls or otherwise market any products or services, except for in relation to the purpose for which such information has been provided or taking any feedback or addressing the complaints. However, ${COMPANY_NAME} may periodically send You emails about new products, special offers or other information of a promotional nature. If You do not wish to receive promotional information from Us, You can, at any time, choose to opt out of receiving the same by way of links provided at the bottom of each mail or by writing to us at ${SUPPORT_EMAIL}.`,
        },
      ],
    },
    {
      title: "Miscellaneous",
      content: [
        {
          id: "10.1",
          text: 'The Platforms may include hyperlinks to various external websites, and may also include advertisements, and hyperlinks to applications, content or resources ("Third Party Links"). We have no control over such Third Party Links present on the Platforms, and You agree that We are not responsible for any collection or disclosure of Your information by any external sites, applications, companies or persons thereof.',
        },
        {
          id: "10.2",
          text: `Third Party Links may place their own cookies or other files on the Users' computer, collect data or solicit personal information from the Users, for which ${COMPANY_NAME} is not responsible or liable. Accordingly, ${COMPANY_NAME} does not make any representations concerning the privacy practices or policies of such third parties or terms of use of such websites, nor does ${COMPANY_NAME} guarantee the accuracy, integrity, or quality of the information, data, text, software, sound, photographs, graphics, videos, messages or other materials available on such Third Party Links. The presence of any Third Party Links on our Platforms, cannot be construed as a recommendation, endorsement or solicitation for the same, or any other material on or available via such Third Party Links.`,
        },
        {
          id: "10.3",
          text: "You further acknowledge and agree that We are not liable for any loss or damage which may be incurred by You as a result of the collection and/or disclosure of your information via Third Party Links, as a result of any reliance placed by You on the completeness, accuracy or existence of any advertising, products services, or other materials on, or available via such Third Party Links.",
        },
        {
          id: "10.4",
          text: "We recommend that You review the applicable privacy policies available on the websites or applications of such Third Party Links.",
        },
        {
          id: "10.5",
          text: "In accordance with applicable law, You hereby agree that You shall not host, display, upload, modify, publish, transmit, store, update or share any information on the Platform that:",
          subPoints: [
            {
              label: "",
              text: "belongs to another person and to which You do not have any right;",
            },
            {
              label: "",
              text: "is defamatory, obscene, pornographic, paedophilic, invasive of another's privacy, including bodily privacy, insulting or harassing on the basis of gender, libellous, racially or ethnically objectionable, relating or encouraging money laundering or gambling, or otherwise inconsistent with or contrary to the laws in force;",
            },
            {
              label: "",
              text: "is harmful to children;",
            },
            {
              label: "",
              text: "infringes any patent, trademark, copyright or other proprietary rights;",
            },
            {
              label: "",
              text: "violates any law for the time being in force;",
            },
            {
              label: "",
              text: "deceives or misleads the addressee about the origin of the message or knowingly and intentionally communicates any information which is patently false or misleading in nature but may reasonably be perceived as a fact;",
            },
            {
              label: "",
              text: "impersonates another person;",
            },
            {
              label: "",
              text: "threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign States, or public order, or causes incitement to the commission of any cognisable offence or prevents investigation of any offence or is insulting other nation;",
            },
            {
              label: "",
              text: "contains software virus or any other computer code, file or program designed to interrupt, destroy or limit the functionality of any computer resource;",
            },
            {
              label: "",
              text: "is patently false and untrue, and is written or published in any form, with the intent to mislead or harass a person, entity or agency for financial gain or to cause any injury to any person.",
            },
          ],
        },
        {
          id: "10.6",
          text: `In the event of a breach of clause 10.5 committed by You, ${COMPANY_NAME} reserves the right to take appropriate actions as per applicable law.`,
        },
      ],
    },
    {
      title: "Contact Information & Grievances",
      content: [
        {
          id: "11.1",
          text: `If You have any questions regarding this Privacy Policy you may contact ${SHOP_PHARMACIST_NAME}. You can also reach out to our support team via our mobile number at ${SUPPORT_PHONE} ${SUPPORT_HOURS} or email Us at ${SUPPORT_EMAIL}.`,
        },
        {
          id: "11.2",
          text: "In accordance with the IT Act, and the rules and regulations thereunder, the contact details of the Grievance Officer are provided as below:",
          subPoints: [
            {
              label: "",
              text: `Name: ${GRIEVANCE_OFFICER_NAME}`,
            },
            {
              label: "",
              text: `Email: ${SUPPORT_EMAIL}`,
            },
            {
              label: "",
              text: `Address: ${COMPANY_NAME}, ${SHOP_ADDRESS_LINE1}, ${SHOP_ADDRESS_LINE2}`,
            },
            {
              label: "",
              text: `Contact No: ${SUPPORT_PHONE}`,
            },
          ],
        },
        {
          id: "11.3",
          text: `Grievance Officer ${WORKING_HOURS}. 26th January, 15th August, 2nd October, and major festivals in India will be considered non-business days.`,
        },
        {
          id: "11.4",
          text: "In case You have any complaints or grievances on the Platforms, please contact the Grievance Officer with a thorough description of Your complaint. We shall acknowledge any complaint made within twenty-four hours, and shall try to resolve the same within a period of fifteen days from the date of its receipt. We shall also receive and acknowledge any order, notice or direction issued by the Government or any competent authority or court of competent jurisdiction.",
        },
      ],
    },
    {
      title: "Indemnity",
      content: [
        {
          text: "You agree and undertake to indemnify Us in any suit or dispute by any third party arising out of disclosure of information by You to third parties either through Our Website or App or otherwise and Your use and access of websites, applications and resources of third parties. We assume no liability for any actions of third parties with regard to Your personal information or SPDI which You may have disclosed to such third parties.",
        },
      ],
    },
    {
      title: "Severability",
      content: [
        {
          text: "Each clause of this Privacy Policy shall be and remain separate from and independent of and severable from all and any other clauses herein except where otherwise expressly indicated or indicated by the context of the Privacy Policy. The decision or declaration that one or more clauses are null and void shall have no effect on remaining clauses of this Privacy Policy.",
        },
      ],
    },
    {
      title: "Disclaimer",
      content: [
        {
          text: "We cannot ensure that all of Your personal information and SPDI will never be disclosed in ways not otherwise described in this Privacy Policy. Therefore, although We are committed to protecting Your privacy, We do not promise, and You should not expect, that Your information or private communications will always remain private. As a User of the Website or the App, You consent to this disclosure of Your personal information and SPDI. You understand and agree that You assume all responsibility and risk for Your use of the Website or the App, the internet generally, and the information You post or access and for Your conduct on and off the Website or the App.",
        },
      ],
    },
    {
      title: "Governing Law and Jurisdiction",
      content: [
        {
          text: "The Privacy Policy is governed by and constructed in accordance with the laws of India, without reference to conflict of laws principles and You irrevocably and unconditionally submit to the exclusive jurisdiction of the courts located in Mumbai, India.",
        },
      ],
    },
  ],
}

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-8 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-2">{privacyPolicyData.title}</h1>
      <p className="text-sm text-gray-500 mb-8">(Last Updated {privacyPolicyData.lastUpdated})</p>

      {privacyPolicyData.sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            {index + 1}. {section.title}
          </h2>
          {section.content.map((paragraph, pIndex) => (
            <div key={pIndex} className="mb-4">
              {paragraph.id && (
                <p className="mb-2">
                  <span className="font-medium">{paragraph.id}</span> {paragraph.text}
                </p>
              )}
              {!paragraph.id && <p className="mb-2">{paragraph.text}</p>}

              {paragraph.subPoints && (
                <ul className="pl-8 mt-2 space-y-2">
                  {paragraph.subPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="list-item">
                      <span className="font-medium">{point.label}</span> {point.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}

export default PrivacyPolicy
