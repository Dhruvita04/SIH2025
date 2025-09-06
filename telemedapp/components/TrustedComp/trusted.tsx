import React from "react";

const Trusted = () => {
  return (
    <section className="mb-4">
      <div className="max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto flex flex-col space-y-8">
        <div className="text-[#343a40] font-bold text-3xl text-center">
          Trusted By
        </div>
        <div className="grid grid-cols-2 md:flex md:justify-around items-center">
          <img className="w-24 h-24" src="assets/nhm.jpg" alt="Punjab Health Dept" />
          <img className="w-24 h-24" src="assets/pjg.jpg" alt="Civil Hospital Nabha" />
          <img className="w-24 h-24" src="assets/pjh.png" alt="Local Pharmacies" />
          <img className="w-24 h-24" src="assets/NABH.webp" alt="Community Groups" />
        </div>
      </div>
    </section>
  );
};

export default Trusted;
