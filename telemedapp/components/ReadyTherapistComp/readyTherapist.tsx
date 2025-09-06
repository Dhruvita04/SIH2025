import React from "react";
import { GoDotFill } from "react-icons/go";

const ReadyTherapist = () => {
  return (
    <section>
      <div className="bg-white rounded-3xl p-6 flex flex-col space-y-8 max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto shadow-lg">
        <div className="text-[#343a40] font-bold text-3xl">
          Doctors are available now to assist rural patients
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <img className="w-20 h-20" src="/assets/logo.png" alt="logo" />
            <div className="flex items-center text-sm md:text-lg">
              <GoDotFill className="rounded-full bg-lime-600 p-1 mr-2" />
              5 doctors ready for video consultations within 15 minutes
            </div>
          </div>
          <button className="border border-[#035fe9] rounded-lg text-[#035fe9] px-8 py-2 mt-4 md:mt-0">
            Book Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadyTherapist;
