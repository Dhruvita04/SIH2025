"use client"
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  TruckIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"
import { FAQ, CONTACT, ORDERS } from "@/CONFIG/routes"

function Help() {
  const supportHours = [
    { day: "Monday - Saturday", time: "10:30 AM - 10:30 PM" },
    { day: "Sunday", time: "11:00 AM - 9:00 PM" },
  ]

  const helpTopics = [
    {
      icon: <TruckIcon className="h-6 w-6" />,
      title: "Order & Delivery",
      description: "Track orders, delivery issues, and shipping queries",
      topics: ["Order tracking", "Delivery delays", "Address changes", "Delivery charges"],
    },
    {
      icon: <CreditCardIcon className="h-6 w-6" />,
      title: "Payment & Refunds",
      description: "Payment methods, refund status, and billing queries",
      topics: ["Payment failures", "Refund status", "Invoice download", "Payment methods"],
    },
    {
      icon: <DocumentTextIcon className="h-6 w-6" />,
      title: "Prescription Orders",
      description: "Upload prescriptions, verification, and medicine queries",
      topics: ["Prescription upload", "Medicine availability", "Dosage queries", "Alternative medicines"],
    },
    {
      icon: <QuestionMarkCircleIcon className="h-6 w-6" />,
      title: "Account & General",
      description: "Account issues, app problems, and general queries",
      topics: ["Login issues", "Profile updates", "App problems", "General queries"],
    },
  ]

  const contactMethods = [
    {
      icon: <PhoneIcon className="h-8 w-8 text-blue-600" />,
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+91 88058-23646",
      action: "tel:+918805823646",
      buttonText: "Call Now",
      availability: "Mon-Sat: 10:30 AM - 10:30 PM",
    },
    {
      icon: <EnvelopeIcon className="h-8 w-8 text-green-600" />,
      title: "Email Support",
      description: "Send us your queries via email",
      contact: "support@jansevagenmeds.com",
      action: "mailto:support@jansevagenmeds.com",
      buttonText: "Send Email",
      availability: "Response within 24 hours",
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />,
      title: "WhatsApp Chat",
      description: "Quick support via WhatsApp",
      contact: "+91 88058-23646",
      action: "https://wa.me/918805823646",
      buttonText: "Chat on WhatsApp",
      availability: "Instant response during business hours",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to assist you with all your healthcare needs. Choose the best way to reach us.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to={FAQ}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse FAQ</h3>
                <p className="text-sm text-gray-600">Find quick answers</p>
              </div>
            </div>
          </Link>

          <Link
            to={ORDERS}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TruckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Order</h3>
                <p className="text-sm text-gray-600">Check order status</p>
              </div>
            </div>
          </Link>

          <Link
            to={CONTACT}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact Form</h3>
                <p className="text-sm text-gray-600">Send detailed query</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get In Touch</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-full flex-shrink-0">{method.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{method.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 text-sm break-words sm:break-all">{method.contact}</p>
                        <p className="text-xs text-gray-500">{method.availability}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:flex-shrink-0">
                    <a
                      href={method.action}
                      target={method.action.startsWith("http") ? "_blank" : undefined}
                      rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block w-full sm:inline-block sm:w-auto bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center whitespace-nowrap"
                    >
                      {method.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center justify-center mb-6">
            <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Support Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportHours.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">{schedule.day}</span>
                <span className="text-blue-600 font-medium">{schedule.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-center">
              <span className="font-bold">Emergency:</span> For urgent medical emergencies, please contact your nearest
              hospital or call emergency services (108/102)
            </p>
          </div>
        </div>

        {/* Help Topics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Common Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-gray-600 mb-4">{topic.description}</p>
                    <div className="space-y-2">
                      {topic.topics.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Medical Emergency?</h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            If you're experiencing a medical emergency, please don't wait for our support. Contact your nearest hospital
            or emergency services immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:108"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-300"
            >
              Emergency: 108
            </a>
            <a
              href="tel:102"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-300"
            >
              Ambulance: 102
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
