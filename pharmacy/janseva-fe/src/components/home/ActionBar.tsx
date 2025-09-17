"use client"

import type React from "react"
import { Link } from "react-router-dom"
import useAuthFacade from "@/facades/useAuthFacade"
import { LOGIN } from "@/CONFIG/routes"
import { FileText, Phone } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

interface ActionBarProps {
  LeftImageLink: string
  RightImageLink: string
  WhatsAppLink?: string
}

const ActionBar: React.FC<ActionBarProps> = ({
  LeftImageLink,
  RightImageLink,
  WhatsAppLink = "https://wa.me/918888288839",
}) => {
  const { isAuthenticated } = useAuthFacade()

  const handlePrescriptionClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      localStorage.setItem("redirectAfterLogin", "prescription")
      window.location.href = LOGIN
    }
  }

  const PrescriptionIcon = () => <FileText className="w-16 h-16 md:w-18 md:h-18 text-black" strokeWidth={1} />

  const PhoneIcon = () => <Phone className="w-16 h-16 md:w-18 md:h-18 text-black" strokeWidth={1} />

  const WhatsAppIcon = () => <FaWhatsapp className="w-16 h-16 md:w-18 md:h-18 text-black opacity-80" />

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-center items-stretch gap-6 lg:gap-6 w-full">
      <Link
        to={LeftImageLink}
        className="w-full lg:w-1/3 group transform transition-all duration-500 hover:scale-105"
        onClick={handlePrescriptionClick}
      >
        <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl p-5 lg:p-6 border border-blue-300/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:border-blue-400/70 backdrop-blur-sm overflow-hidden h-56 lg:h-64 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4 lg:mb-4">
              <div className="flex-1 pr-2">
                <div className="mb-3 lg:mb-4">
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                    Upload prescription
                  </h3>
                  <h4 className="text-xl md:text-3xl font-bold text-gray-800">to place order</h4>
                </div>
                <div className="space-y-1 lg:space-y-1">
                  <p className="text-sm md:text-base text-gray-700 font-medium">Upload only .jpg, .png or .pdf files</p>
                  <p className="text-sm md:text-base text-gray-600">Size limit is 15 MB</p>
                </div>
              </div>
              <div className="text-black transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 ml-2">
                <PrescriptionIcon />
              </div>
            </div>

            <div className="flex-grow lg:flex-grow-0"></div>

            <div className="w-full mt-auto">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 lg:px-6 lg:py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base">
                <span>Order Via Prescription</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>

      <Link to={RightImageLink} className="w-full lg:w-1/3 group transform transition-all duration-500 hover:scale-105">
        <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl p-5 lg:p-6 border border-blue-300/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:border-blue-400/70 backdrop-blur-sm overflow-hidden h-56 lg:h-64 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4 lg:mb-4">
              <div className="flex-1 pr-2">
                <div className="mb-3 lg:mb-4">
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">Call us to place</h3>
                  <h4 className="text-xl md:text-3xl font-bold text-gray-800">order</h4>
                </div>
                <div className="space-y-1 lg:space-y-1">
                  <p className="text-sm md:text-base text-gray-700 font-medium">Call us at +91 8888288839</p>
                  <p className="text-sm md:text-base text-gray-600">to place your order.</p>
                </div>
              </div>
              <div className="text-black transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 ml-2">
                <PhoneIcon />
              </div>
            </div>

            <div className="flex-grow lg:flex-grow-0"></div>

            <div className="w-full mt-auto">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 lg:px-6 lg:py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base">
                <span>Order Via Phone</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>

      <a
        href={WhatsAppLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full lg:w-1/3 group transform transition-all duration-500 hover:scale-105"
      >
        <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl p-5 lg:p-6 border border-blue-300/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:border-blue-400/70 backdrop-blur-sm overflow-hidden h-56 lg:h-64 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4 lg:mb-4">
              <div className="flex-1 pr-2">
                <div className="mb-3 lg:mb-4">
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">WhatsApp us to</h3>
                  <h4 className="text-xl md:text-3xl font-bold text-gray-800">place order</h4>
                </div>
                <div className="space-y-1 lg:space-y-1">
                  <p className="text-sm md:text-base text-gray-700 font-medium">Message us at +91 8888288839</p>
                  <p className="text-sm md:text-base text-gray-600">for quick assistance.</p>
                </div>
              </div>
              <div className="text-black transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 ml-2">
                <WhatsAppIcon />
              </div>
            </div>

            <div className="flex-grow lg:flex-grow-0"></div>

            <div className="w-full mt-auto">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 lg:px-6 lg:py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base">
                <span>Order Via WhatsApp</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}

export default ActionBar
