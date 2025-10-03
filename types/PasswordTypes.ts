export interface FormData {
  email: string;
  otp: string;
  newpassword: string;
  confirmpassword: string;
}

export interface Step {
  id: number;
  title: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  completedStep: number[];
  setCompletedSteps: React.Dispatch<React.SetStateAction<number[]>>;
}
export interface StepTabsProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
}
export interface PasswordResetApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
