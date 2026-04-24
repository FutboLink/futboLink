"use client";

interface WizardStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps?: number;
  labels?: string[];
}

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  labels = [],
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const label = labels[index];
        return (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2",
                  isActive
                    ? "bg-verde-oscuro text-white border-verde-oscuro shadow-md scale-110"
                    : isCompleted
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-400 border-gray-300",
                ].join(" ")}
              >
                {isCompleted ? "✓" : step}
              </div>
              {label && (
                <span
                  className={[
                    "hidden sm:block text-xs font-medium",
                    isActive
                      ? "text-verde-oscuro"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              )}
            </div>
            {step < totalSteps && (
              <div
                className={[
                  "h-0.5 w-6 sm:w-16 transition-all",
                  isCompleted ? "bg-emerald-500" : "bg-gray-300",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardStepIndicator;
