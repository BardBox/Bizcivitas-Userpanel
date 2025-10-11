export interface FormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
}

export interface Step {
  id: number;
  title: string;
  component: React.ComponentType<StepProps>;
}
