import React from "react";
import Link from "next/link";
import { HiOutlinePlay, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineClock, HiOutlineGlobeAlt } from "react-icons/hi2";

const Banner = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Section */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                <HiOutlineShieldCheck className="w-4 h-4 mr-2" />
                Trusted by 10,000+ Rural Patients
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Bringing{" "}
                <span className="gradient-text">
                  Healthcare
                </span>{" "}
                to Every Village
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Connect with qualified doctors instantly, access digital health records, 
                and get real-time pharmacy updates - all designed for rural communities 
                with limited internet connectivity.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 shadow-primary">
                <HiOutlineClock className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 shadow-secondary">
                <HiOutlineGlobeAlt className="w-5 h-5 text-secondary-600" />
                <span className="text-sm font-medium text-secondary-800">Low Bandwidth</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 shadow-accent">
                <HiOutlineShieldCheck className="w-5 h-5 text-accent-600" />
                <span className="text-sm font-medium text-accent-800">Secure & Private</span>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/doctors" className="group">
                <button className="btn-primary flex items-center space-x-2 text-lg px-8 py-4 group-hover:scale-105 transition-transform">
                  <span>Consult a Doctor</span>
                  <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/features">
                <button className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4">
                  <HiOutlinePlay className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl transform rotate-3 opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <img 
                  className="w-full h-auto rounded-2xl shadow-lg" 
                  src="assets/banner.jpg" 
                  alt="Telemedicine consultation" 
                />
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-secondary text-white p-3 rounded-full shadow-secondary animate-float">
                  <HiOutlineShieldCheck className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-accent text-white p-3 rounded-full shadow-accent animate-float" style={{animationDelay: '1s'}}>
                  <HiOutlineClock className="w-6 h-6" />
                </div>
                <div className="absolute top-1/2 -right-6 bg-gradient-to-r from-warm-400 to-warm-500 text-white p-2 rounded-full shadow-lg animate-pulse-soft" style={{animationDelay: '2s'}}>
                  <HiOutlineGlobeAlt className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
