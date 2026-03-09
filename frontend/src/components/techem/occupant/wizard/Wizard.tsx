// components/wizard/Wizard.tsx
import { useState } from "react";
import StepNavigation from "./StepNavigation";

interface Step {
  component: React.ComponentType;
}

interface WizardProps {
  steps: Step[];
}

export default function Wizard({ steps }: WizardProps) {
  const [current, setCurrent] = useState(0);

  const goNext = () => current < steps.length - 1 && setCurrent(current + 1);
  const goPrev = () => current > 0 && setCurrent(current - 1);

  const StepComponent = steps[current].component;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <>
              <StepComponent />
              <StepNavigation
                current={current}
                total={steps.length}
                onNext={goNext}
                onPrev={goPrev}
              />
            </>
          </div>
    
          <div className="col-span-12 space-y-6 xl:col-span-5">
            
          </div>
    
    </div>
  );
}