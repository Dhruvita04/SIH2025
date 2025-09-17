interface TermsData {
    id: string;
    title: string;
    content: any;
}

interface TermsListProps {
    data: TermsData[];
}

const TermsList: React.FC<TermsListProps> = ({ data }) => {
    const renderContent = (content: any, parentId: string) => {
        if (typeof content === 'string') {
            return <p className="mt-2 font-normal text-lg leading-8 text-gray-500">{content}</p>;
        } else if (Array.isArray(content)) {
            return content.map((item, index) => {
                if (typeof item === 'string') {
                    return (
                        <p key={`${parentId}-${index}`} className="mt-2 font-normal text-lg leading-8 text-gray-500">
                            {item}
                        </p>
                    );
                } else if (Array.isArray(item)) {
                    return (
                        <ul key={`${parentId}-${index}`} className="mt-2 list-disc">
                            {item.map((subItem, subIndex) => (
                                <li key={`${parentId}-${index}-${subIndex}`} className="font-normal text-lg leading-8 text-gray-500">
                                    {subItem}
                                </li>
                            ))}
                        </ul>
                    );
                } else if (item && typeof item === 'object') {
                    // Handle nested TermsData objects
                    return (
                        <div key={item.id} className="mt-4">
                            <h3 className="font-semibold text-xl text-gray-800">{item.title}</h3>
                            <div className="mt-2">{renderContent(item.content, item.id)}</div>
                        </div>
                    );
                }
                return null;
            });
        }
        return null;
    };

    return (
        <div className="max-w-full mx-auto">
            {/* Navigation List */}
            <ul className="ml-8 lg:mb-10 mb-8 sticky top-4 bg-white p-4 rounded-lg shadow-sm">
                {data.map((term) => (
                    <li key={term.id} className="list-decimal font-normal text-lg text-gray-500 hover:text-blue-600">
                        <a href={`#${term.id}`}>{term.title}</a>
                    </li>
                ))}
            </ul>

            {/* Content Sections */}
            <div className="ml-8 space-y-10">
                {data.map((term) => (
                    <section key={term.id} id={term.id} className="scroll-mt-20">
                        <h2 className="font-bold lg:text-3xl text-2xl text-gray-900">{term.title}</h2>
                        <div className="mt-5 pl-4">{renderContent(term.content, term.id)}</div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default TermsList;