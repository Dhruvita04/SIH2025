import { ProductVariation } from "./types"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { useState } from "react"
import { Button } from "@/components/ui/button"

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import useSingleProductFacade from "@/facades/useSingleProductFacade"

interface DropDownOptionsProps {
    options: ProductVariation[] | null
}

const DropDownOptions: React.FC<DropDownOptionsProps> = ({
    options
}) => {

    const [open, setOpen] = useState(false)
    const { setCurrentOption, currentOption } = useSingleProductFacade();

    return (
        <div className="my-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-gray-50"
                    >
                        {currentOption
                            ? currentOption.name
                            : "Select Option..."}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search framework..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                                {options?.map((option) => (
                                    <CommandItem
                                        key={option.id}
                                        value={option.name}
                                        onSelect={() => {
                                            setCurrentOption(option)
                                            setOpen(false)
                                        }}
                                    >
                                        {option.name}
                                        <CheckIcon
                                            className={`ml-auto h-4 w-4 ${currentOption?.id === option.id ? "opacity-100" : "opacity-0"}`}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DropDownOptions