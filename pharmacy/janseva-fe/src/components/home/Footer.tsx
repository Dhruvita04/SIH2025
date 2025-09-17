"use client"

import type React from "react"

import { LogoImagePath } from "@/assets/images"
import {
  ABOUT,
  FAQ,
  TERMS_CONDITIONS,
  PRIVACY_POLICY,
  RETURN_POLICY,
  HOME,
  CART,
  ORDER_PRESCRIPTION,
  ORDERS,
  HELP,
  CONTACT,
  LOGIN,
} from "@/CONFIG/routes"
import { Link } from "react-router-dom"
import useAuthFacade from "@/facades/useAuthFacade"

function Footer() {
  const { isAuthenticated } = useAuthFacade()

  const handleOrderPrescriptionClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      localStorage.setItem("redirectAfterLogin", "prescription")
      window.location.href = LOGIN
    }
  }

  const handleMyOrdersClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      localStorage.setItem("redirectAfterLogin", "orders")
      window.location.href = LOGIN
    }
  }

  return (
    <footer className="w-full p-[12px] md:p-[20px]">
      <div className="w-full h-full bg-blue-50 rounded-2xl p-[24px]">
        <div className="flex flex-col gap-[28px] md:flex-row md:p-10 md:justify-around">
          <div>
            <div>
              <img className="h-[7.5vh]" src={LogoImagePath || "/placeholder.svg"} alt="Logo" />
              <p className="mt-2 text-md font-regular">Your trusted healthcare partner</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#2b2b2b] mb-[14px]">Quick Links</h3>
            <ul>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={HOME}>Home</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={ABOUT}>About</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={FAQ}>FAQ</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={CART}>Cart</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#2b2b2b] mb-[14px]">Services</h3>
            <ul>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={ORDER_PRESCRIPTION} onClick={handleOrderPrescriptionClick}>
                  Order with Prescription
                </Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={ORDERS} onClick={handleMyOrdersClick}>
                  My Orders
                </Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={HELP}>Help & Support</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={CONTACT}>Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#2b2b2b] mb-[14px]">Legal</h3>
            <ul>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={TERMS_CONDITIONS}>Terms & Conditions</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={PRIVACY_POLICY}>Privacy Policy</Link>
              </li>
              <li className="font-medium text-gray-700 mb-[8px]">
                <Link to={RETURN_POLICY}>Return Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row md:gap-[20px] md:justify-center md:items-center">
          <p className="text-sm text-center font-regular text-gray-700 mt-[32px] md:mt-0">
            Copyright © 2025. All Rights Reserved
          </p>
          <p className="hidden md:block">|</p>
          <p className="text-sm text-center font-regular text-gray-700 mt-[16px] md:mt-0">
            Made with love for rural India{" "}
            <a href="http://localhost:3000/" target="_blank" className="underline" rel="noreferrer">
              TelemedPilot
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
