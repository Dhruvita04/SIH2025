"use client"
import type React from "react"
import { useState, useRef } from "react"
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { CONTACT_SUBMIT } from "@/CONFIG/api-routes"

interface ContactFormData {
  name: string
  phoneNumber: string
  message: string
}

function Contact() {
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phoneNumber: "",
    message: "",
  })
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})

  const contactMutation = useMutation({
    mutationFn: (payload: ContactFormData) => {
      return axiosInstance.post(CONTACT_SUBMIT, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      toast.success("Message sent successfully!")
      setFormData({ name: "", phoneNumber: "", message: "" })
      setErrors({})
      formRef.current?.reset()
    },
    onError: (error: any) => {
      toast.error("Failed to send message. Please try again.")
      console.error("Contact form error:", error)
    },
  })
  
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number"
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    contactMutation.mutate(formData)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map Section */}
      <div className="w-full h-64 md:h-96">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.1156779406274!2d73.16630617498159!3d19.233789682003575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7953baf192413%3A0x2d49c4c029cbef35!2sJANSEVA%20GENERIC%20MEDICO%20STORE!5e0!3m2!1sen!2sin!4v1752021267112!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Contact Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="left">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">We're here to help with all your healthcare needs.</p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="wrap">
                <div className="cols grid grid-cols-2 gap-3 mb-6">
                  <fieldset>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Your Name*"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </fieldset>
                  <fieldset>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Your Phone*"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                  </fieldset>
                </div>
                <fieldset className="mb-6">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors resize-vertical ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Message*"
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </fieldset>
              </div>
              <div className="button-submit send-wrap">
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full sm:w-auto bg-[#2563eb] text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-800 focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text text-button">{contactMutation.isPending ? "Sending..." : "Send message"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="right">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+918805823646" className="text-[#2563eb] hover:text-blue-800 transition-colors">
                      +91 88058-23646
                    </a>
                    <p className="text-sm text-gray-500">Mon-Sat: 10:30 AM - 10:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:support@jansevagenmeds.com"
                      className="text-[#2563eb] hover:text-blue-800 transition-colors"
                    >
                      support@jansevagenmeds.com
                    </a>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      Shop No. 16, <br />
                      Seema Apartment, Khemani Chowk, <br />
                      Ulhasnagar, Maharashtra 421002
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white rounded-full p-4">
                <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Need Quick Support?</h3>
                <p className="text-green-100 mb-6">
                  Get instant help through WhatsApp for urgent queries and prescription assistance
                </p>
                <a
                  href="https://wa.me/918805823646"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
