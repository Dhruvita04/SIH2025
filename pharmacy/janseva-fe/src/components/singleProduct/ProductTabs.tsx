import { useState } from "react";

const tabs: string[] = ["uses", "Direction for use", "Side Effects", "Additional Information"]

function ProductTabs() {

    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <div className="mb-6">
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">

                <ul className="flex -mb-px text-sm font-medium text-center overflow-x-auto pb-3" data-tabs-toggle="#default-tab-content" role="tablist">

                    {
                        tabs.map((tab, index) => (
                            <li key={index} className="me-2 shrink-0" role="presentation" onClick={() => setActiveTab(tab)}>
                                <button className={`inline-block p-4 rounded-t-lg ${activeTab === tab ? "border-b-2 border-primary" : ""}`} type="button" role="tab" aria-selected="false">{tab}</button>
                            </li>
                        ))
                    }

                </ul>

            </div>
            <div>
                {
                    tabs.map((tab, index) => (
                        <div key={index} className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === tab ? "block" : "hidden"}`} role="tabpanel">
                            <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">{tab}</strong>. Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ProductTabs