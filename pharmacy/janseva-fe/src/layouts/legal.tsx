interface LegalLayoutProps {
    title: string,
    lastUpdated: string,
    children: React.ReactNode
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
    title,
    lastUpdated,
    children
}) => {
    return (
        <section className="">
            <div className="w-full">
                <section className="w-full relative overflow-hidden px-[20px] md:px-[48px]">

                    <h2 className="font-manrope font-bold lg:text-4xl text-3xl text-gray-900 mb-5">{title}</h2>
                    <div className="flex items-center gap-3 lg:mb-10 mb-8">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0054 8V12.5322C12.0054 12.8286 12.1369 13.1098 12.3645 13.2998L15 15.5M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="font-medium text-xl leading-8 text-indigo-600">Last updated: {lastUpdated}</p>
                    </div>
                    {
                        children
                    }
                </section>
            </div>
        </section>

    )
}

export default LegalLayout