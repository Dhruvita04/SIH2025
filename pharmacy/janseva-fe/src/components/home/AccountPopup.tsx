"use client"

import type React from "react"

import {
  ArrowLeftStartOnRectangleIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Separator } from "../ui/separator"
import { Link } from "react-router-dom"
import { ACCOUNT_DETAILS, HELP, MANAGE_ADDRESS, ORDERS } from "@/CONFIG/routes"
import useAuthFacade from "@/facades/useAuthFacade"

interface AccountPopupProps {
  handleClose: () => void
}

const AccountPopup: React.FC<AccountPopupProps> = ({ handleClose }) => {
  const { user, storeLogout } = useAuthFacade()


  const handleLogout = () => {
    storeLogout()
    handleClose()
  }

  return (
    <div
      id="accountDropdown1"
      className="absolute right-[0px] top-[calc(100%+8px)] z-50 bg-white rounded-lg shadow-lg p-4 w-[272px]"
    >
      <Link
        onClick={handleClose}
        to={ACCOUNT_DETAILS}
        title=""
        className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-100"
      >
        <img
          className="w-10 h-10 rounded-full"
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png"
          alt=""
        />
        <div className="text-sm font-medium">
          <p className="text-gray-900">{user?.name}</p>
          <p className="text-gray-500 truncate w-[85%]">{user?.email}</p>
        </div>
      </Link>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        <li onClick={handleClose}>
          <Link to={ACCOUNT_DETAILS} title="" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
            <UserCircleIcon className="w-6 h-6 text-gray-500" />
            <span>My Account</span>
          </Link>
        </li>
        <li onClick={handleClose}>
          <Link to={ORDERS} title="" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
            <ShoppingBagIcon className="w-6 h-6 text-gray-500" />
            <span>My Orders</span>
          </Link>
        </li>
        <li onClick={handleClose}>
          <Link to={MANAGE_ADDRESS} title="" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
            <MapPinIcon className="w-6 h-6 text-gray-500" />
            <span>Manage Addresses</span>
          </Link>
        </li>
        <li onClick={handleClose}>
          <Link to={HELP} title="" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
            <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
            <span>Help</span>
          </Link>
        </li>

        <Separator />

        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-red-50 text-left"
          >
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6 text-red-500" />
            <span className="text-red-500">Log out</span>
          </button>
        </li>
      </ul>
    </div>
  )
}

export default AccountPopup
