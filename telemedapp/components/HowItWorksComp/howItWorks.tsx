import React from "react";

const HowItWorks = () => {
  return (
    <section className="mb-4">
      <div className="flex flex-col space-y-8 max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto">
        <h1 className="text-[#343a40] font-bold text-3xl mx-auto">
          How It Works
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex space-x-6">
            <img src="assets/hiw1.svg" alt="step1" />
            <div className="flex flex-col space-y-4">
              <div className="text-[#035fe9] font-bold">1. Register</div>
              <div className="text-[#212529] text-sm">
                Patients sign up with basic details. Multilingual support ensures
                accessibility for all.
              </div>
            </div>
          </div>
          <div className="flex space-x-6">
            <img src="assets/hiw2.svg" alt="step2" />
            <div className="flex flex-col space-y-4">
              <div className="text-[#035fe9] font-bold">2. Book a Consultation</div>
              <div className="text-[#212529] text-sm">
                Select a doctor or get automatically matched. App works on low
                internet bandwidth.
              </div>
            </div>
          </div>
          <div className="md:col-span-2 flex space-x-6 justify-center">
            <img src="assets/hiw3.svg" alt="step3" />
            <div className="flex flex-col space-y-4">
              <div className="text-[#035fe9] font-bold">3. Get Digital Care</div>
              <div className="text-[#212529] text-sm">
                Consult via video, receive prescriptions digitally, and track
                pharmacy availability in real time.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
