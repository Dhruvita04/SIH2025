import Image from 'next/image';
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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-primary-600"
              >
                Get Started Today
                <HiOutlineArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-200">
                <HiOutlinePlay className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Verified Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Image Section - Optimized */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/assets/banner.jpg"
                alt="Healthcare professionals helping rural communities"
                width={600}
                height={600}
                priority={true}
                className="rounded-2xl shadow-2xl"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full blur-xl opacity-50 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
