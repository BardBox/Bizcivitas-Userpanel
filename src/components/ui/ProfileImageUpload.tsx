"use client";

import { useState, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import { useGetCurrentUserQuery } from "@/store/api";

interface ProfileImageUploadProps {
  onImageUpload?: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export default function ProfileImageUpload({
  onImageUpload,
  isUploading = false,
}: ProfileImageUploadProps) {
  const { data: user } = useGetCurrentUserQuery();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && onImageUpload) {
      try {
        await onImageUpload(selectedFile);
        // Clear preview after successful upload
        setPreviewImage(null);
        setSelectedFile(null);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const currentImage = previewImage || user?.avatar;
  const userName = user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "";

  // If no user data yet, show loading
  if (!user) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Debug info - make it more visible */}
      <div className="text-sm text-gray-700 text-center bg-yellow-100 p-3 rounded border">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>User loaded: {user ? "Yes" : "No"}</p>
        <p>Avatar source: {user?.avatar || "null"}</p>
        <p>Current image: {currentImage || "null"}</p>
        <p>Name: {userName || "null"}</p>
      </div>
      {/* Current/Preview Image */}
      <div className="relative cursor-pointer" onClick={triggerFileInput}>
        <Avatar
          src={currentImage}
          alt={userName || "Profile"}
          size="2xl"
          fallbackText={userName}
          showMembershipBorder={true}
          membershipType={user?.membershipType}
          showCrown={true}
        />

        {/* Upload overlay */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Click on the image to upload a new photo
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF (Max 5MB)
        </p>
      </div>

      {/* Preview Actions */}
      {previewImage && selectedFile && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Save Photo"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* File Details */}
      {selectedFile && (
        <div className="text-xs text-gray-500 text-center">
          <p>Selected: {selectedFile.name}</p>
          <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
