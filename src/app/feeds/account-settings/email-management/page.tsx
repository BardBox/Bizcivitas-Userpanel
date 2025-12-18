"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Check, Clock, Plus, Shield, Trash2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetUserEmailsQuery,
  useAddSecondaryEmailMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRemoveSecondaryEmailMutation,
  useChangePrimaryEmailMutation,
} from "@/store/api/emailManagementApi";

export default function EmailManagementPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // API Hooks
  const { data: emailData, isLoading, refetch } = useGetUserEmailsQuery();
  const [addSecondaryEmail, { isLoading: isAdding }] = useAddSecondaryEmailMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const [removeSecondaryEmail, { isLoading: isRemoving }] = useRemoveSecondaryEmailMutation();
  const [changePrimaryEmail, { isLoading: isChanging }] = useChangePrimaryEmailMutation();

  // Local state
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showChangePrimaryModal, setShowChangePrimaryModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [changingEmail, setChangingEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add Secondary Email
  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await addSecondaryEmail({ email: newEmail }).unwrap();
      toast.success("Verification email sent! Please check your inbox.");
      setNewEmail("");
      setShowAddEmailModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add email");
    }
  };

  // Verify Email
  const handleVerifyEmail = async () => {
    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      await verifyEmail({ email: verifyingEmail, otp }).unwrap();
      toast.success("Email verified successfully!");
      setOtp("");
      setVerifyingEmail("");
      setShowVerifyModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid OTP");
    }
  };

  // Resend Verification
  const handleResendVerification = async (email: string) => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    console.log("🔄 Resending verification to:", email);

    try {
      await resendVerification({ email }).unwrap();
      toast.success(`Verification email sent to ${email}`);
    } catch (error: any) {
      console.error("❌ Resend verification error:", error);
      console.error("Error data:", error?.data);
      console.error("Error status:", error?.status);
      const errorMessage = error?.data?.message || error?.message || "Failed to resend verification";
      toast.error(errorMessage);
    }
  };

  // Remove Secondary Email
  const handleRemoveEmail = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) {
      return;
    }

    try {
      await removeSecondaryEmail({ email }).unwrap();
      toast.success("Email removed successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove email");
    }
  };

  // Change Primary Email
  const handleChangePrimary = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      await changePrimaryEmail({
        newPrimaryEmail: changingEmail,
        password,
      }).unwrap();
      toast.success("Primary email changed! Please login with your new email.");
      setPassword("");
      setChangingEmail("");
      setShowChangePrimaryModal(false);
      refetch();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change primary email");
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const primaryEmail = emailData?.primaryEmail || "";
  const secondaryEmails = emailData?.secondaryEmails || [];
  const emailHistory = emailData?.emailHistory || [];

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 md:rounded-3xl md:mt-12">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Settings</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Email Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your primary and secondary email addresses
          </p>
        </div>

        {/* Primary Email Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Primary Email</h2>
          </div>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{primaryEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Check size={14} className="text-green-600" />
                  <span className="text-xs text-green-700">Verified & Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Login Email</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            This is your primary email used for login and important notifications
          </p>
        </div>

        {/* Secondary Emails Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Secondary Emails</h2>
            </div>
            <button
              onClick={() => setShowAddEmailModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isAdding}
            >
              <Plus size={16} />
              Add Email
            </button>
          </div>

          {secondaryEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No secondary emails added</p>
            </div>
          ) : (
            <div className="space-y-3">
              {secondaryEmails.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.isVerified ? (
                          <>
                            <Check size={14} className="text-green-600" />
                            <span className="text-xs text-green-700">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock size={14} className="text-orange-600" />
                            <span className="text-xs text-orange-700">Pending Verification</span>
                          </>
                        )}
                        <span className="text-xs text-gray-500">• Added {new Date(item.addedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isVerified ? (
                      <button
                        onClick={() => {
                          setChangingEmail(item.email);
                          setShowChangePrimaryModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        disabled={isChanging}
                      >
                        Make Primary
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setVerifyingEmail(item.email);
                            setShowVerifyModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleResendVerification(item.email)}
                          className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                          disabled={isResending}
                        >
                          Resend
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveEmail(item.email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      disabled={isRemoving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email History Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Email History</h2>
          </div>

          {emailHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No email change history</p>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">{item.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Active from {new Date(item.activeFrom).toLocaleDateString()}
                        {item.activeTo && ` to ${new Date(item.activeTo).toLocaleDateString()}`}
                      </p>
                    </div>
                    {item.wasPrimary && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                        Was Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                About Email Management
              </h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>You can add multiple secondary emails for account recovery</li>
                <li>Secondary emails must be verified before use</li>
                <li>You can promote any verified secondary email to primary</li>
                <li>Your primary email is used for login and important notifications</li>
                <li>All historical emails are preserved for data integrity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Email Modal */}
      {showAddEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Add Secondary Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter a new email address. We'll send a verification code to confirm ownership.
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new-email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={isAdding}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddEmailModal(false);
                  setNewEmail("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Email Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Verify Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 4-digit verification code sent to <strong>{verifyingEmail}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-center text-2xl tracking-widest font-mono"
              maxLength={4}
              disabled={isVerifying}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerifyingEmail("");
                  setOtp("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Primary Modal */}
      {showChangePrimaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Change Primary Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set <strong>{changingEmail}</strong> as your primary email. You'll need to login with this email next time.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Security Check:</strong> Please enter your password to confirm this change.
              </p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={isChanging}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChangePrimaryModal(false);
                  setChangingEmail("");
                  setPassword("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isChanging}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePrimary}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isChanging}
              >
                {isChanging ? "Changing..." : "Change Primary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
