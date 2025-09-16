import React from "react";
import { HiOutlineVideoCamera, HiOutlineClock, HiOutlineArrowRight, HiOutlineShieldCheck } from "react-icons/hi2";

const ReadyTherapist = () => {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-secondary-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium opacity-90">LIVE NOW</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Doctors are available now to assist rural patients
                </h2>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <HiOutlineVideoCamera className="w-5 h-5" />
                    <span className="text-sm opacity-90">Video Consultations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiOutlineClock className="w-5 h-5" />
                    <span className="text-sm opacity-90">15 min response</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiOutlineShieldCheck className="w-5 h-5" />
                    <span className="text-sm opacity-90">Verified Doctors</span>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img className="w-12 h-12 rounded-xl" src="/assets/logo.png" alt="logo" />
                    <div>
                      <div className="text-lg font-bold">5 doctors online</div>
                      <div className="text-sm opacity-80">Ready for consultations</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Average wait time</span>
                      <span className="font-semibold">2 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available specialties</span>
                      <span className="font-semibold">12+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Languages supported</span>
                      <span className="font-semibold">5+</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-primary-600 font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 group">
                  <span>Book Consultation Now</span>
                  <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyTherapist;
