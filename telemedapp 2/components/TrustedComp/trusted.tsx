import React from "react";
import { HiOutlineShieldCheck, HiOutlineBuildingOffice, HiOutlineHeart, HiOutlineAcademicCap } from "react-icons/hi2";

const Trusted = () => {
  const partners = [
    {
      name: "Punjab Health Department",
      description: "Government Healthcare Initiative",
      icon: HiOutlineBuildingOffice,
      color: "text-blue-600"
    },
    {
      name: "Civil Hospital Nabha",
      description: "Regional Medical Center",
      icon: HiOutlineHeart,
      color: "text-red-600"
    },
    {
      name: "Local Pharmacies",
      description: "Medicine Distribution Network",
      icon: HiOutlineShieldCheck,
      color: "text-green-600"
    },
    {
      name: "NABH Certified",
      description: "Quality Healthcare Standards",
      icon: HiOutlineAcademicCap,
      color: "text-purple-600"
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Trusted by <span className="gradient-text">Healthcare Partners</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work closely with government institutions, hospitals, and healthcare providers 
            to ensure quality care reaches every corner of rural India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {partners.map((partner, idx) => {
            const IconComponent = partner.icon;
            return (
              <div
                key={idx}
                className="group text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-primary-50 transition-colors`}>
                  <IconComponent className={`w-8 h-8 ${partner.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 bg-gray-50 rounded-3xl p-8">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Certified & Compliant
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <HiOutlineShieldCheck className="w-5 h-5 text-primary-600" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlineAcademicCap className="w-5 h-5 text-primary-600" />
                <span className="font-medium">NABH Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlineBuildingOffice className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Government Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trusted;
