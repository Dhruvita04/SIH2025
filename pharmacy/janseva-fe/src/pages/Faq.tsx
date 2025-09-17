import { Link, Outlet, useMatch } from "react-router-dom"

const CATEGORIES = [
    { title: "Medicine Substitutes", path: "medicine-substitutes" },
    { title: "Doctor Consultation", path: "doctor-consultation" },
    { title: "General Issues", path: "general-issues" },
    { title: "Payment", path: "payment" },
    { title: "Returns & Refunds", path: "returns-refunds" },
    { title: "Delivery", path: "delivery" },
]

function Faq() {
    const match = useMatch("/faq/:category")

    return (
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
            <div className="grid md:grid-cols-5 gap-10">
                {/* Sidebar - ALWAYS visible */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold md:text-4xl md:leading-tight">
                        Frequently
                        <br />
                        Asked Questions
                    </h2>
                    <p className="mt-1 hidden md:block text-gray-600">Answers to the most frequently asked questions.</p>
                </div>

                {/* Main content area */}
                <div className="md:col-span-3">
                    {!match ? (
                        // Categories list - only shown when not on a category page
                        <div className="space-y-4">
                            {CATEGORIES.map((category) => (
                                <Link
                                    key={category.path}
                                    to={`/faq/${category.path}`}
                                    className="flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <span className="text-lg font-medium text-black">{category.title}</span>
                                    <svg
                                        className="size-5 text-gray-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // Category questions with back button
                        <div>
                            <Outlet />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Faq

