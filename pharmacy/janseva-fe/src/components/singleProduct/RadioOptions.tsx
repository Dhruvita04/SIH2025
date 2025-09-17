"use client"

import type React from "react"

import useSingleProductFacade from "@/facades/useSingleProductFacade"
import type { ProductVariation } from "./types"

interface RadioOptionsProps {
  options: ProductVariation[]
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ options }) => {
  const { setCurrentOption, currentOption } = useSingleProductFacade()

  const handleOptionChange = (option: ProductVariation) => {
    setCurrentOption(option)
  }

  return (
    <div className="my-8">
      <ul className="grid w-full gap-6 grid-cols-3">
        {options &&
          options.map((option) => (
            <li key={option.id} onClick={() => handleOptionChange(option)}>
              <input
                type="radio"
                id={option.id.toString()}
                name={option.name}
                value={option.id}
                checked={currentOption?.id === option.id}
                onChange={() => handleOptionChange(option)}
                className="hidden peer"
                required
              />
              <label
                htmlFor={option.id.toString()}
                className="inline-flex items-center justify-center w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="text-sm font-medium leading-tight break-words">{option.name}</div>
                </div>
              </label>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default RadioOptions
