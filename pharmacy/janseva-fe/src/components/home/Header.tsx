"use client"

import { LogoImagePath } from "@/assets/images"
import { CART, HOME } from "@/CONFIG/routes"
import { ShoppingCartIcon, UserIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import HeaderActionElement from "./HeaderActionElement"
import { useCallback, useState, useEffect, useRef } from "react"
import AccountPopup from "./AccountPopup"
import { Link, useLocation } from "react-router-dom"
import useCartFacade from "@/facades/useCartFacade"
import useAuthFacade from "@/facades/useAuthFacade"

function Header() {
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false)
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const authDropdownRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const isOnCartPage = location.pathname === CART
  const isOnHomePage = location.pathname === HOME

  const handleAccountPopup = useCallback(() => {
    setIsAccountPopupOpen(!isAccountPopupOpen)
  }, [isAccountPopupOpen])

  const handleAuthDropdown = useCallback(() => {
    setIsAuthDropdownOpen(!isAuthDropdownOpen)
  }, [isAuthDropdownOpen])

  const handleLoginClick = useCallback(() => {
    if (isOnCartPage) {
      localStorage.setItem("redirectAfterLogin", "cart")
    } else if (isOnHomePage) {
      localStorage.removeItem("redirectAfterLogin")
    }
    setIsAuthDropdownOpen(false)
  }, [isOnCartPage, isOnHomePage])

  const { isAuthenticated } = useAuthFacade()

  const { cartItems } = useCartFacade()

  useEffect(() => {
    // If user is not on cart page but flag exists, remove it
    if (!isOnCartPage && localStorage.getItem("redirectAfterLogin") === "cart") {
      localStorage.removeItem("redirectAfterLogin")
    }
  }, [isOnCartPage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountPopupOpen(false)
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false)
      }
    }

    if (isAccountPopupOpen || isAuthDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAccountPopupOpen, isAuthDropdownOpen])

  return (
    <header className="bg-[#f5f8f9] flex justify-between items-center rounded-md py-3 px-[20px] m-[12px] sm:px-[36px] sm:m-[20px]">
      <Link to={HOME} className="logo">
        <img className="block h-[48px] sm:h-[56px]" src={LogoImagePath || "/placeholder.svg"} alt="" />
      </Link>

      <div className="flex items-center relative" ref={dropdownRef}>
        <HeaderActionElement
          text={"Cart"}
          isLink={true}
          elementLink={CART}
          Icon={ShoppingCartIcon}
          count={cartItems.length || 0}
        />

        {isAuthenticated ? (
          <>
            <HeaderActionElement handleClick={handleAccountPopup} text={"Account"} isLink={false} Icon={UserIcon} />
            {isAccountPopupOpen && <AccountPopup handleClose={handleAccountPopup} />}
          </>
        ) : (
          <>
            <div className="relative md:hidden" ref={authDropdownRef}>
              <HeaderActionElement handleClick={handleAuthDropdown} text={"Account"} isLink={false} Icon={UserIcon} />
              {isAuthDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-52 animate-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    <Link
                      to="/auth/login"
                      className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 group"
                      onClick={handleLoginClick}
                    >
                      <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      to="/auth/signup"
                      className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 group"
                      onClick={() => setIsAuthDropdownOpen(false)}
                    >
                      <UserPlusIcon className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex gap-3 ml-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                onClick={handleLoginClick}
              >
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 border border-blue-700 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
