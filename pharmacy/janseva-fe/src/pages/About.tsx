"use client"
import { shopImagePath, aboutImagePath } from "@/assets/images"

function About() {
  return (
    <div className="px-[12px] md:px-[20px]">
      <section className="py-14 lg:py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-9">
            <div className="img-box">
              <img
                src={shopImagePath || "/placeholder.svg"}
                alt="Janseva Pharmacy Store"
                className="max-lg:mx-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="lg:pl-[100px] flex items-center">
              <div className="data w-full">
                <h2 className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-9 max-lg:text-center relative">
                  About Janseva
                </h2>
                <p className="font-normal text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
                  Janseva is India's leading online pharmacy dedicated to making healthcare affordable and accessible
                  through generic medicines. We believe that quality healthcare should not be a luxury, and our mission
                  is to provide genuine, high-quality generic medications at prices that every family can afford.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative ">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-9 ">
            <div className="lg:pr-24 flex items-center">
              <div className="data w-full">
                <img
                  src={aboutImagePath || "/placeholder.svg"}
                  alt="Generic Medicine Focus"
                  className="block lg:hidden mb-9 mx-auto rounded-lg shadow-lg"
                />
                <h2 className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-9 max-lg:text-center">
                  Generic Medicine Specialists Since 2020
                </h2>
                <p className="font-normal text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
                  What sets Janseva apart from other medical e-commerce platforms is our exclusive focus on generic
                  medicines. We partner directly with WHO-GMP certified manufacturers to bring you the same therapeutic
                  benefits as branded medicines at up to 80% lower costs. Our licensed pharmacists ensure every generic
                  medicine meets the highest quality standards before reaching your doorstep.
                </p>
              </div>
            </div>
            <div className="img-box ">
              <img
                src={aboutImagePath || "/placeholder.svg"}
                alt="Generic Medicine Focus"
                className="hidden lg:block rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-24 relative bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-6">100% Generic Medicines Only</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Unlike other pharmacies that mix branded and generic medicines, Janseva exclusively sells generic
              medicines. We don't stock any branded medicines - this focused approach allows us to offer the best prices
              and maintain the highest quality standards for generic alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Branded Medicines</h4>
                  <p className="text-gray-600">
                    We deliberately choose not to sell expensive branded medicines, focusing entirely on their
                    therapeutically equivalent generic alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Same Active Ingredients</h4>
                  <p className="text-gray-600">
                    Our generic medicines contain the exact same active pharmaceutical ingredients as branded versions,
                    ensuring identical therapeutic effects.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Maximum Savings</h4>
                  <p className="text-gray-600">
                    By eliminating branded medicine markups, we pass on savings of 60-80% directly to our customers
                    without compromising on quality.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Approved</h4>
                  <p className="text-gray-600">
                    All our generic medicines are approved by CDSCO (Central Drugs Standard Control Organization) and
                    manufactured in WHO-GMP certified facilities.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Generic Only?</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">₹100</div>
                  <div className="text-sm text-gray-600 mb-4">Branded Medicine Price</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-red-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">₹20</div>
                  <div className="text-sm text-gray-600 mb-4">Generic Medicine Price (Same Effect)</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-green-500 h-2 rounded-full w-1/5"></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold text-green-800 mb-1">You Save ₹80</div>
                  <div className="text-sm text-green-600">80% savings on every purchase</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise to You</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                "We commit to selling only generic medicines because we believe healthcare should be affordable for
                everyone. Every rupee you save with us can be invested in your family's health and well-being. That's
                the Janseva difference."
              </p>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Trusted by 50,000+ families across India</span>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-manrope text-4xl text-center text-gray-900 font-bold mb-14">Our Impact in Numbers</h2>
          <div className="flex flex-col gap-5 xl:gap-8 lg:flex-row lg:justify-between">
            <div className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-blue-50 p-6 rounded-2xl">
              <div className="flex gap-5">
                <div className="font-manrope text-2xl font-bold text-primary">80%</div>
                <div className="flex-1">
                  <h4 className="text-xl text-gray-900 font-semibold mb-2">Cost Savings</h4>
                  <p className="text-xs text-gray-500 leading-5">
                    Average savings our customers achieve by choosing generic medicines over branded alternatives
                    through our platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-blue-50 p-6 rounded-2xl">
              <div className="flex gap-5">
                <div className="font-manrope text-2xl font-bold text-primary">50,000+</div>
                <div className="flex-1">
                  <h4 className="text-xl text-gray-900 font-semibold mb-2">Happy Customers</h4>
                  <p className="text-xs text-gray-500 leading-5">
                    Families across India trust Janseva for their healthcare needs, saving money without compromising on
                    quality.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-blue-50 p-6 rounded-2xl">
              <div className="flex gap-5">
                <div className="font-manrope text-2xl font-bold text-primary">5,000+</div>
                <div className="flex-1">
                  <h4 className="text-xl text-gray-900 font-semibold mb-2">Generic Medicines</h4>
                  <p className="text-xs text-gray-500 leading-5">
                    Comprehensive range of WHO-GMP certified generic medicines covering all major therapeutic
                    categories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-24 relative bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-6">
              Our Quality Assurance Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every medicine goes through our rigorous quality verification process before reaching you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Source Verification</h4>
              <p className="text-gray-600 text-sm">
                We verify that all medicines come from WHO-GMP certified manufacturers with proper documentation
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Pharmacist Review</h4>
              <p className="text-gray-600 text-sm">
                Our licensed pharmacists review each medicine for therapeutic equivalence and safety standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Quality Testing</h4>
              <p className="text-gray-600 text-sm">
                Random batch testing ensures consistent quality and potency of all generic medicines in our inventory
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Secure Storage</h4>
              <p className="text-gray-600 text-sm">
                Temperature-controlled warehouses maintain medicine integrity until secure delivery to your doorstep
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-gray-600">Pharmacist Verified</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Quality Monitoring</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">₹0</div>
                <div className="text-gray-600">Hidden Charges</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
