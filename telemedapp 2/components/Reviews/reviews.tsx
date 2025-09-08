import React from "react";
import { HiOutlineStar, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const Reviews = () => {
  const feedback = [
    {
      name: "Harpreet Singh",
      role: "Farmer",
      text: "Earlier I had to travel 25 km to see a doctor. Now I can consult from home and get medicines at nearby stores.",
      rating: 5,
      avatar: "👨‍🌾"
    },
    {
      name: "Sita Devi",
      role: "Daily-wage Worker", 
      text: "The app saved me from losing workdays. I could talk to a doctor and get treatment without leaving my village.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Civil Hospital Doctor",
      text: "This helps us reach patients who cannot travel, ensuring better follow-up and continuity of care.",
      rating: 5,
      avatar: "👨‍⚕️"
    },
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served" },
    { number: "500+", label: "Doctors Available" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What Our <span className="gradient-text">Community</span> Says
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from patients and healthcare providers who have experienced 
            the positive impact of TeleMedPilot.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-3 gap-8">
          {feedback.map((review, idx) => (
            <div
              key={idx}
              className="group card-elevated p-8 space-y-6 hover:scale-105 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <HiOutlineChatBubbleLeftRight className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center space-x-1">
                {[...Array(review.rating)].map((_, i) => (
                  <HiOutlineStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 italic text-center leading-relaxed">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="text-center space-y-2">
                <div className="text-2xl">{review.avatar}</div>
                <div>
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="text-primary-600 text-sm">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h3>
            <p className="text-gray-600 mb-6">
              Our platform is endorsed by medical professionals and healthcare institutions across rural India.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Punjab Health Dept</div>
              <div className="text-2xl font-bold text-gray-400">Civil Hospital Nabha</div>
              <div className="text-2xl font-bold text-gray-400">NABH Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
