import React, { JSX, useState } from "react";
import {
  StepProps,
  PasswordResetApiResponse,
} from "../../../../../types/PasswordTypes";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function PasswordStep({
  formData,
  setFormData,
  setCurrentStep,
  setCompletedSteps,
}: StepProps): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<string>("");

  const checkPasswordStrength = (password: string): string => {
    if (password.length < 6) return "weak";
    if (password.length < 8) return "medium";
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        password
      )
    ) {
      return "strong";
    }
    return "medium";
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newpassword = e.target.value;
    setFormData((prev) => ({ ...prev, newpassword }));
    setPasswordStrength(checkPasswordStrength(newpassword));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev) => ({ ...prev, confirmpassword: e.target.value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (formData.newpassword !== formData.confirmpassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use unified password reset endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/password-reset/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            newPassword: formData.newpassword,
          }),
        }
      );

      const data: PasswordResetApiResponse = await response.json();

      if (response.ok && data.success) {
        setCompletedSteps((prev) => [...prev, 3]);
        toast.success("Password reset successful! Redirecting to home page...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.newpassword &&
    formData.confirmpassword &&
    formData.newpassword === formData.confirmpassword &&
    formData.newpassword.length >= 6;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={formData.newpassword}
          onChange={handlePasswordChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new password"
        />
        {formData.newpassword && (
          <div
            className={`text-xs mt-1 ${
              passwordStrength === "weak"
                ? "text-red-500"
                : passwordStrength === "medium"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            Password strength: {passwordStrength}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-2"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmpassword}
          onChange={handleConfirmPasswordChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm new password"
        />
        {formData.confirmpassword &&
          formData.newpassword !== formData.confirmpassword && (
            <div className="text-red-500 text-xs mt-1">
              Passwords do not match
            </div>
          )}
      </div>

      {error && (
        <div className="text-red-500 text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentStep(2)}
          type="button"
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </form>
  );
}
