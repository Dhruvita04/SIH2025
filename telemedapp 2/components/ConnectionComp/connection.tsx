import React from "react";
import { HiOutlineUser, HiOutlineHeart, HiOutlineUserGroup, HiOutlineHome, HiOutlinePlus, HiOutlineAcademicCap } from "react-icons/hi2";

const Connection = () => {
  const services = [
    {
      icon: HiOutlineUser,
      title: "General Physicians",
      description: "Primary healthcare consultations",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: HiOutlineHeart,
      title: "Cardiology",
      description: "Heart health specialists",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      icon: HiOutlineUserGroup,
      title: "Pediatrics",
      description: "Child healthcare experts",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: HiOutlineHome,
      title: "Geriatrics",
      description: "Elderly care specialists",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: HiOutlinePlus,
      title: "Pharmacy Access",
      description: "Medicine delivery network",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      icon: HiOutlineAcademicCap,
      title: "Specialist Care",
      description: "Advanced medical expertise",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Our <span className="gradient-text">Healthcare Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive medical specialties designed to meet the diverse healthcare needs 
            of rural communities across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <div
                key={idx}
                className="group card-elevated p-8 text-center space-y-6 hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.bgColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-8 h-8 ${service.textColor}`} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
                <div className={`h-1 w-12 mx-auto rounded-full bg-gradient-to-r ${service.color}`}></div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Specific Specialist?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our platform connects you with qualified specialists across various medical fields. 
              If you don't see your required specialty, contact us and we'll help you find the right doctor.
            </p>
            <button className="btn-primary">
              Find Your Specialist
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connection;
