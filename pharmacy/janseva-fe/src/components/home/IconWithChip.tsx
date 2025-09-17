import type React from "react"
const formatCountChip = (count: number): string => {
  return count > 99 ? "99+" : `${count}`
}

interface IconWithChipProps {
  count?: number
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const IconWithChip: React.FC<IconWithChipProps> = ({ count, Icon }) => {
  return (
    <div className="relative sm:mr-1">
      {/* Render the passed Icon component */}
      <Icon height={28} width={28} />
      {count && <span className="chip">{formatCountChip(count)}</span>}
    </div>
  )
}

export default IconWithChip
