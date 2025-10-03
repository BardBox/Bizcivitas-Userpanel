import { useState } from "react";
import { PasswordResetApiResponse } from "../../types/PasswordTypes";

interface UseForgotPasswordReturn {
  loading: boolean;
  error: string;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function useForgotPassword(): UseForgotPasswordReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const sendOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendOtp,
    verifyOtp,
    resetPassword,
  };
}
