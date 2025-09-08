import React from "react";
import { HiOutlineUserPlus, HiOutlineCalendar, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineArrowRight } from "react-icons/hi2";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Register",
      description: "Patients sign up with basic details. Multilingual support ensures accessibility for all.",
      icon: HiOutlineUserPlus,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      number: "02", 
      title: "Book a Consultation",
      description: "Select a doctor or get automatically matched. App works on low internet bandwidth.",
      icon: HiOutlineCalendar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      number: "03",
      title: "Get Digital Care",
      description: "Consult via video, receive prescriptions digitally, and track pharmacy availability in real time.",
      icon: HiOutlineVideoCamera,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            How <span className="gradient-text">TeleMedPilot</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in just three simple steps and connect with healthcare professionals instantly.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div key={idx} className="group">
                  <div className="card-elevated p-8 text-center space-y-6 hover:scale-105 transition-all duration-300">
                    {/* Step Number */}
                    <div className="relative">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${step.bgColor} group-hover:scale-110 transition-transform`}>
                        <span className="text-2xl font-bold text-gray-400">{step.number}</span>
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>

                    {/* Arrow for mobile */}
                    {idx < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center">
                        <HiOutlineArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-primary rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of patients who have already experienced better healthcare access.
            </p>
            <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
