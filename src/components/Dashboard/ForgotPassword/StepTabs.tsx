import React from "react";
import { StepTabsProps } from "../../../../types/PasswordTypes";

const StepTabs = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepTabsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const isClickable = isCompleted || step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                ${
                  isActive
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                    : isCompleted
                    ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isCompleted ? "✓" : step.id}
            </button>
            <span
              className={`ml-2 text-sm font-medium ${
                isActive ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepTabs;
