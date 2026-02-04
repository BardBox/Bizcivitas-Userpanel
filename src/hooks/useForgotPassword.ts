import { useState } from "react";
import { PasswordResetApiResponse } from "../../types/PasswordTypes";

interface UseForgotPasswordReturn {
  loading: boolean;
  error: string;
  accountType: string | null;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string; accountType?: string }>;
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
  const [accountType, setAccountType] = useState<string | null>(null);

  const sendOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string; accountType?: string }> => {
    setLoading(true);
    setError("");

    try {
      // Use unified password reset endpoint that supports both Users and Franchise Partners
      const response = await fetch("/api/proxy/api/v1/password-reset/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      // Store account type for display purposes
      const accType = data.data?.accountType || "user";
      setAccountType(accType);

      return { success: true, accountType: accType };
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
      // Use unified password reset endpoint
      const response = await fetch("/api/proxy/api/v1/password-reset/verify-otp", {
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
      // Use unified password reset endpoint
      const response = await fetch("/api/proxy/api/v1/password-reset/reset-password", {
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
    accountType,
    sendOtp,
    verifyOtp,
    resetPassword,
  };
}
