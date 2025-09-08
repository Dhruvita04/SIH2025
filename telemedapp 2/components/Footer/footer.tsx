import React from "react";
import Link from "next/link";
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineHeart } from "react-icons/hi2";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Mission", href: "/mission" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" }
    ],
    services: [
      { name: "Find Doctors", href: "/doctors" },
      { name: "Book Appointment", href: "/book" },
      { name: "Health Records", href: "/records" },
      { name: "Pharmacy", href: "/pharmacy" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "FAQ", href: "/faq" }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center space-x-3">
                <img className="w-10 h-10 rounded-xl" src="/assets/logo.png" alt="TeleMedPilot" />
                <span className="text-2xl font-bold">TeleMedPilot</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Bringing quality healthcare to rural India through innovative telemedicine solutions. 
                Connecting patients with doctors, anytime, anywhere.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <HiOutlineEnvelope className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <HiOutlinePhone className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <HiOutlineMapPin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Services</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <HiOutlineHeart className="w-4 h-4 text-red-500" />
              <span>Made with love for rural India</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {currentYear} TeleMedPilot. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
