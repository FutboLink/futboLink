"use client";

interface WizardStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps?: number;
  labels?: string[];
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
  canReachStep?: (step: 1 | 2 | 3 | 4) => boolean;
}

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  labels = [],
  onStepClick,
  canReachStep,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isBackward = step < currentStep;
        const isForwardReachable =
          step > currentStep && (canReachStep ? canReachStep(step as 1 | 2 | 3 | 4) : false);
        const isClickable = !!onStepClick && !isActive && (isBackward || isForwardReachable);
        const label = labels[index];

        const circleClasses = [
          "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2",
          isActive
            ? "bg-verde-oscuro text-white border-verde-oscuro shadow-md scale-110"
            : isCompleted
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-white text-gray-400 border-gray-300",
          isClickable ? "hover:scale-110 hover:shadow-md cursor-pointer" : "",
        ].join(" ");

        const labelClasses = [
          "hidden sm:block text-xs font-medium",
          isActive
            ? "text-verde-oscuro"
            : isCompleted
            ? "text-emerald-600"
            : "text-gray-400",
          isClickable ? "hover:underline" : "",
        ].join(" ");

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step as 1 | 2 | 3 | 4)}
                  className={circleClasses}
                  aria-label={label ? `Ir al paso ${step}: ${label}` : `Ir al paso ${step}`}
                >
                  {isCompleted ? "✓" : step}
                </button>
              ) : (
                <div className={circleClasses}>{isCompleted ? "✓" : step}</div>
              )}
              {label && (
                isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(step as 1 | 2 | 3 | 4)}
                    className={labelClasses}
                  >
                    {label}
                  </button>
                ) : (
                  <span className={labelClasses}>{label}</span>
                )
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
