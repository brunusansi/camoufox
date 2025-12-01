"use client";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${
                    isCompleted
                      ? "bg-accent border-accent text-white"
                      : isCurrent
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-background-secondary border-border text-foreground-muted"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              {/* Step label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-foreground-muted"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div
                className={`
                  flex-1 h-0.5 mx-3 mt-[-24px]
                  ${isCompleted ? "bg-accent" : "bg-border"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
