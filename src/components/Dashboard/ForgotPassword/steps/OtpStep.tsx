import React, { useState, useRef, useEffect, JSX } from "react";
import { ApiResponse, StepProps } from "../../../../../types/PasswordTypes";

export default function OtpStep({
  formData,
  setFormData,
  setCurrentStep,
  setCompletedSteps,
}: StepProps): JSX.Element {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all fields filled
      if (
        newOtp.every((digit) => digit !== "") &&
        newOtp.join("").length === 4
      ) {
        handleSubmit(newOtp.join(""));
      }
    }
  };

  const handleSubmit = async (
    otpValue: string = otp.join("")
  ): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forgetpassword/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otpValue,
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setFormData((prev) => ({ ...prev, otp: otpValue }));
        setCompletedSteps((prev) => [...prev, 2]);
        setCurrentStep(3);
      } else {
        setError(data.message || "Invalid OTP");
        setOtp(["", "", "", ""]); // Clear OTP on error
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    setTimer(60);
    setCanResend(false);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forgetpassword/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Enter the 4-digit OTP sent to {formData.email}
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={1}
            inputMode="numeric"
            pattern="\d*"
          />
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center" role="alert">
          {error}
        </div>
      )}

      <div className="text-center">
        {!canResend ? (
          <p className="text-sm text-gray-500">Resend OTP in {timer}s</p>
        ) : (
          <button
            onClick={handleResendOtp}
            className="text-blue-500 text-sm hover:underline"
            type="button"
          >
            Resend OTP
          </button>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          type="button"
        >
          Back
        </button>
        <button
          onClick={() => handleSubmit()}
          disabled={loading || otp.some((digit) => digit === "")}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
