"use client";
import React, { JSX, useState } from "react";
import EmailStep from "./steps/EmailStep";
import OtpStep from "./steps/OtpStep";
import PasswordStep from "./steps/PasswordStep";
import { FormData } from "../../../../types/PasswordTypes";
import StepTabs from "./StepTabs";

const STEPS = [
  { id: 1, title: "Email", component: EmailStep },
  { id: 2, title: "OTP", component: OtpStep },
  { id: 3, title: "PASSWORD", component: PasswordStep },
];
const ForgotPasswordWizard = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    newpassword: "",
    confirmpassword: "",
  });

  const CurrentStepComponent = STEPS.find(
    (step) => step.id === currentStep
  )?.component;
  if (!CurrentStepComponent) {
    return <div>Step not found</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <StepTabs
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
      />

      <div className="mt-6">
        <CurrentStepComponent
          formData={formData}
          setFormData={setFormData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          completedStep={completedSteps}
          setCompletedSteps={setCompletedSteps}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordWizard;
