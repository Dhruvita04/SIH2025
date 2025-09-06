import React from "react";
import { FaUserMd, FaBaby, FaHeartbeat, FaPills } from "react-icons/fa";
import { MdElderly, MdLocalHospital } from "react-icons/md";

const Connection = () => {
  return (
    <section className="mb-4">
      <div className="flex flex-col space-y-8 max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto">
        <div className="text-[#343a40] font-bold text-3xl mx-auto">
          Services We Provide
        </div>
        <div className="text-[#035fe9] text-lg md:text-2xl mx-auto">
          Accessible healthcare specialties for rural patients
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <FaUserMd className="text-4xl" />
            <span>General Physicians</span>
          </div>
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <FaHeartbeat className="text-4xl" />
            <span>Cardiology</span>
          </div>
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <FaBaby className="text-4xl" />
            <span>Pediatrics</span>
          </div>
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <MdElderly className="text-4xl" />
            <span>Geriatrics</span>
          </div>
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <FaPills className="text-4xl" />
            <span>Pharmacy Access</span>
          </div>
          <div className="text-[#035fe9] bg-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg">
            <MdLocalHospital className="text-4xl" />
            <span>Specialist Care</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connection;
