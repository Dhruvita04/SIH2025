import { useState } from "react";

interface AccordionItemProps {
    title: string;
    content: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content }) => {
    const [collapse, setCollapse] = useState(true);

    return (
        <div className={`p-4 rounded-xl mb-2 ${!collapse ? "bg-gray-100" : "bg-gray-50"}`}>
            <button
                className="group pb-3 inline-flex items-center justify-between gap-x-3 w-full text-lg font-semibold text-start text-gray-800 rounded-lg transition hover:text-gray-500 focus:outline-none"
                onClick={() => setCollapse(!collapse)}
            >
                {title}
                <svg className={`size-5 text-gray-600 transition-transform ${collapse ? "-rotate-0" : "rotate-180"}`}
                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {!collapse && (
                <div className="w-full overflow-hidden transition-[height] duration-300">
                    <p className="text-gray-600 dark:text-neutral-400">{content}</p>
                </div>
            )}
        </div>
    );
};

export default AccordionItem;