import React from "react"

interface ProgressTrackerProps {
  steps: string[]
  currentStep: number
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, currentStep }) => {
  const getMobileSteps = () => {
    const totalSteps = steps.length

    // If we have 3 or fewer steps, show all
    if (totalSteps <= 3) {
      return steps.map((step, index) => ({ step, originalIndex: index }))
    }

    let startIndex: number

    // Determine start index based on current step
    if (currentStep <= 1) {
      // Show first 3 steps (0, 1, 2)
      startIndex = 0
    } else if (currentStep >= totalSteps - 2) {
      // Show last 3 steps
      startIndex = totalSteps - 3
    } else {
      // Show current step ± 1
      startIndex = currentStep - 1
    }

    return steps.slice(startIndex, startIndex + 3).map((step, index) => ({
      step,
      originalIndex: startIndex + index,
    }))
  }

  const mobileSteps = getMobileSteps()

  return (
    <>
      {/* Mobile View - Show only 3 steps */}
      <ol className="md:hidden items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-4 px-3">
        {mobileSteps.map(({ step, originalIndex }, displayIndex) => {
          return (
            <React.Fragment key={`mobile-step-${originalIndex}`}>
              <li
                className={`after:border-1 flex items-center ${originalIndex <= currentStep ? "text-primary" : "text-gray-300"} dark:text-primary-500 flex-1`}
              >
                <span className="flex flex-col items-center w-full">
                  <svg
                    className="me-2 h-8 w-8 sm:h-9 sm:w-9 mb-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke={originalIndex <= currentStep ? "currentColor" : "#D1D6E2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <p className="text-center whitespace-nowrap text-base font-medium">{step}</p>
                </span>
              </li>
              {displayIndex < mobileSteps.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0 px-1">
                  <span
                    className="w-[6vw] max-w-[30px] border-b-[1px] border-gray-300"
                    key={`mobile-separator-${originalIndex}`}
                  ></span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </ol>

      {/* Desktop View - Show all steps */}
      <ol className="hidden md:flex items-center w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base py-2 px-3">
        {steps.map((step, index) => {
          return (
            <React.Fragment key={`desktop-step-${index}`}>
              <li
                className={`after:border-1 flex items-center ${index <= currentStep ? "text-primary" : "text-gray-300"} dark:text-primary-500 w-full`}
              >
                <span className="flex flex-row items-center">
                  <svg
                    className="me-2 h-4 w-4 sm:h-5 sm:w-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke={index <= currentStep ? "currentColor" : "#D1D6E2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <p className="whitespace-nowrap">{step}</p>
                </span>
              </li>
              {index < steps.length - 1 && (
                <span
                  className="w-[15vw] max-w-[60px] mx-[6px] md:mx-[10px] border-b-[1px] border-gray-300"
                  key={`desktop-separator-${index}`}
                ></span>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </>
  )
}

export default ProgressTracker
