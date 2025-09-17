"use client"

import type React from "react"

import {
  ArrowLeftStartOnRectangleIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ACCOUNT_DETAILS, HELP, MANAGE_ADDRESS, ORDERS } from "@/CONFIG/routes"

import { Separator } from "@/components/ui/separator"
import { Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import useAuthFacade from "@/facades/useAuthFacade"
import useProfileFacade from "@/facades/useProfileFacade"
import { defaultProfileImagePath } from "@/assets/images"

const Account: React.FC = () => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, storeLogout } = useAuthFacade()
  const { profile } = useProfileFacade()

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth > 500) {
        setIsAccountMenuOpen(true)
      }
    }

    handleWindowResize()

    window.addEventListener("resize", handleWindowResize)
  }, [])

  const handleLogout = () => {
    storeLogout()
    navigate("/")
  }

  return (
    <div className="px-[12px] md:px-[20px]">
      <div className="flex flex-col gap-y-4 md:flex-row md:gap-y-0 md:gap-x-4 md:max-w-[800px] lg:max-w-[1100px] md:mx-auto">
        <div className="w-full p-4 border border-gray-200 rounded-lg md:w-[240px] lg:w-[300px] md:sticky md:top-4 md:h-fit md:max-h-[calc(100vh-2rem)] md:overflow-y-auto">
          <div
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-100"
          >
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={profile?.profileImageUrl || defaultProfileImagePath}
              alt=""
            />
            <div className="text-sm font-medium">
              <p className="text-gray-900">{user?.name}</p>
              <p className="text-gray-400 font-regular">{user?.email}</p>
            </div>
          </div>

          {isAccountMenuOpen && <Separator className="my-4" />}
          <ul className={`space-y-2 text-sm text-gray-700 ${!isAccountMenuOpen ? "h-0 overflow-hidden" : "mt-4 "} `}>
            <li>
              <Link
                to={ACCOUNT_DETAILS}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${location.pathname === ACCOUNT_DETAILS ? "bg-gray-100" : ""}`}
              >
                <UserCircleIcon className="w-6 h-6 text-gray-500" />
                <span>My Account</span>
              </Link>
            </li>
            <li>
              <Link
                to={ORDERS}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${location.pathname === ORDERS ? "bg-gray-100" : ""}`}
              >
                <ShoppingBagIcon className="w-6 h-6 text-gray-500" />
                <span>My Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to={MANAGE_ADDRESS}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${location.pathname === MANAGE_ADDRESS ? "bg-gray-100" : ""}`}
              >
                <MapPinIcon className="w-6 h-6 text-gray-500" />
                <span>Manage Addresses</span>
              </Link>
            </li>
            <li>
              <Link
                to={HELP}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${location.pathname === HELP ? "bg-gray-100" : ""}`}
              >
                <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
                <span>Help</span>
              </Link>
            </li>

            <Separator />

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-red-50 w-full text-left"
              >
                <ArrowLeftStartOnRectangleIcon className="w-6 h-6 text-red-500" />
                <span className="text-red-500">Log out</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="md:w-[calc(100%-256px)] lg:w-[calc(100%-324px)]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Account
