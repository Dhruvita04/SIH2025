import React from "react";

const Reviews = () => {
  const feedback = [
    {
      name: "Harpreet, Farmer",
      text: "Earlier I had to travel 25 km to see a doctor. Now I can consult from home and get medicines at nearby stores.",
    },
    {
      name: "Sita Devi, Daily-wage Worker",
      text: "The app saved me from losing workdays. I could talk to a doctor and get treatment without leaving my village.",
    },
    {
      name: "Civil Hospital Doctor",
      text: "This helps us reach patients who cannot travel, ensuring better follow-up and continuity of care.",
    },
  ];

  return (
    <section className="mb-4">
      <div className="max-w-full md:max-w-[90%] lg:max-w-[75%] mx-auto">
        <h2 className="text-[#343a40] font-bold text-3xl mb-6 text-center">
          What People Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedback.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-4"
            >
              <p className="text-gray-700 italic">“{review.text}”</p>
              <p className="text-[#035fe9] font-semibold">- {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
