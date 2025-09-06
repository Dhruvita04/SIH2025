import React from "react";
import buttonStyles from "../navbarComp/navbar.module.css";
import Link from "next/link";

const Banner = () => {
  return (
    <section className="h-screen flex flex-col-reverse md:flex md:flex-row md:ml-[12.5%]">
      {/* Text Section */}
      <div className="flex flex-col h-full space-y-4">
        <div className="flex flex-col p-2 space-y-6">
          <p className="text-xs text-[#343a40] font-light uppercase tracking-wide">
            Telemedicine Access for Rural Healthcare in Nabha
          </p>
          <h1 className="text-black text-5xl md:text-6xl font-light">
            Bringing{" "}
            <span className="font-bold text-[#035fe9]">
              Doctors & Digital Health
            </span>{" "}
            closer to rural communities
          </h1>
          <p className="text-base md:text-lg font-semibold text-[#343a40]">
            Nabha’s rural areas face poor access to healthcare. Our platform
            connects patients with doctors online, provides digital health
            records, and ensures real-time pharmacy updates even in
            low-bandwidth areas.
          </p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col items-center space-y-4 md:max-w-[80%]">
          <Link className="min-w-[80%] md:min-w-full" href="/doctors">
            <button
              className={
                buttonStyles.gradient_button +
                " md:px-12 py-2 my-2 text-base md:text-lg text-white rounded-lg w-full"
              }
            >
              Consult a Doctor
            </button>
          </Link>
          <Link className="min-w-[80%] md:min-w-full" href="/features">
            <button className="text-base md:text-lg border border-[#035fe9] rounded-lg text-[#035fe9] px-12 py-2">
              Explore Features
            </button>
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div>
        <img className="object-cover" src="assets/banner.jpg" alt="banner" />
      </div>
    </section>
  );
};

export default Banner;
