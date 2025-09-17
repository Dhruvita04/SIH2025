import { Link } from "react-router-dom";
import IconWithChip from "./IconWithChip";

interface HeaderActionElementProps {
    text: string,
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    count?: number,
    elementLink?: string,
    isLink: boolean,
    handleClick?: () => void
}


const HeaderActionElement: React.FC<HeaderActionElementProps> = ({ text, Icon, count, elementLink = "", isLink, handleClick }) => {
    return (

        isLink ? <Link to={elementLink} className="flex items-center py-1 px-3 rounded-md hover:bg-gray-200">
            <IconWithChip count={count} Icon={Icon} />
            <p className="text-md font-medium hidden sm:block">{text}</p>
        </Link> : <div className="flex items-center py-1 px-3 rounded-md hover:bg-gray-200 hover:cursor-pointer" onClick={handleClick}>
            <IconWithChip count={count} Icon={Icon} />
            <p className="text-md font-medium hidden sm:block">{text}</p>
        </div>
    );
}

export default HeaderActionElement