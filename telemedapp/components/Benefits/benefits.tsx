import React from "react";

const Benefits = () => {
  const benefits = [
    {
      title: "Save Time & Travel",
      desc: "Patients avoid long journeys to hospitals. Consult online and access prescriptions nearby.",
      img: "assets/b1.svg",
    },
    {
      title: "Affordable Access",
      desc: "Daily-wage earners save money by reducing travel and consultation delays.",
      img: "assets/b2.svg",
    },
    {
      title: "Digital Health Records",
      desc: "Secure records available offline, ensuring continuity of care even without stable internet.",
      img: "assets/b3.svg",
    },
  ];

  return (
    <section>
      <div className="max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto flex flex-col space-y-20">
        <div className="text-[#343a40] font-bold text-3xl mx-auto text-center">
          Benefits of Our Solution
        </div>
        <div className="flex flex-col space-y-12 md:space-y-0 md:flex-row md:space-x-6 justify-between">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 flex flex-col space-y-4 shadow-lg md:max-w-[33%]"
            >
              <div className="flex justify-between relative">
                <h3 className="text-[#035fe9] font-bold">{b.title}</h3>
                <img className="absolute top-[-64px] right-0" src={b.img} alt="" />
              </div>
              <p className="text-gray-700">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
