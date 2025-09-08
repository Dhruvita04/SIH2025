import React from "react";
import { HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineGlobeAlt, HiOutlineHeart } from "react-icons/hi2";

const Benefits = () => {
  const benefits = [
    {
      title: "Save Time & Travel",
      desc: "Patients avoid long journeys to hospitals. Consult online and access prescriptions nearby.",
      icon: HiOutlineClock,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Affordable Access",
      desc: "Daily-wage earners save money by reducing travel and consultation delays.",
      icon: HiOutlineCurrencyDollar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Digital Health Records",
      desc: "Secure records available offline, ensuring continuity of care even without stable internet.",
      icon: HiOutlineDocumentText,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
  ];

  const additionalFeatures = [
    { icon: HiOutlineShieldCheck, text: "HIPAA Compliant" },
    { icon: HiOutlineGlobeAlt, text: "Works Offline" },
    { icon: HiOutlineHeart, text: "24/7 Support" }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Why Choose <span className="gradient-text">TeleMedPilot</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform is specifically designed for rural healthcare challenges, 
            ensuring every patient gets the care they deserve.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={idx}
                className="group card-elevated p-8 text-center space-y-6 hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${benefit.bgColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-8 h-8 ${benefit.textColor}`} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                </div>
                <div className={`h-1 w-12 mx-auto rounded-full bg-gradient-to-r ${benefit.color}`}></div>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Built for Rural India</h3>
            <p className="text-gray-600">Designed with the unique challenges of rural healthcare in mind</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {additionalFeatures.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 text-gray-700">
                  <IconComponent className="w-6 h-6 text-primary-600" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
