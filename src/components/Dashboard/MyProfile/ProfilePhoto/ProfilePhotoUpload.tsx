"use client";

import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

import Avatar from "@/components/ui/Avatar";
import ImageModal from "@/components/ui/ImageModal";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import { toast } from "react-hot-toast";
import { useGetCurrentUserQuery, useUpdateProfileMutation } from "@/store/api";

// Image compression function using browser-image-compression
const compressImage = async (
  file: File,
  maxSizeMB: number = 1
): Promise<File> => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};

interface ProfilePhotoUploadProps {
  onImageUpdate?: (imageUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  onImageUpdate,
}) => {
  const { data: user } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUploading }] =
    useUpdateProfileMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      // Create preview URL and open crop modal
      const preview = URL.createObjectURL(file);
      setSelectedImageUrl(preview);
      setIsCropModalOpen(true);

      // Clear the input
      if (event.target) {
        event.target.value = "";
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Clear the input on error
      if (event.target) {
        event.target.value = "";
      }
      toast.error(error.message || "Failed to process image");
    }
  };

  const handleCroppedImageSave = async (croppedImageBlob: Blob) => {
    try {
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], "profile-photo.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile);

      // Upload the compressed file
      await handleImageUpload(compressedFile);

      // Clean up the selected image URL
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
        setSelectedImageUrl(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to process cropped image:", error);
      toast.error(error.message || "Failed to process the cropped image");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Create a new FormData instance
      const formData = new FormData();
      formData.append("avatar", file, file.name);

      // Send the FormData directly
      const response = await updateProfile(formData).unwrap();

      // Handle the response - same logic as company logo
      if (response) {
        // Clear any existing preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        // If we got a response with user data, the upload was successful
        if (response.avatar) {
          // Notify parent component
          if (onImageUpdate) {
            onImageUpdate(response.avatar);
          }
        }

        toast.success("Profile photo updated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Clear the preview URL if upload failed
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Extract error message from API response
      let errorMessage = "Failed to upload image. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error message with toast
      toast.error(errorMessage);
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    if (user?.avatar || previewUrl) {
      setIsModalOpen(true);
    } else {
      triggerFileInput();
    }
  };

  const handleModalEdit = () => {
    triggerFileInput();
  };

  const handleCropModalClose = () => {
    setIsCropModalOpen(false);
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center pt-8">
        <div
          className="relative mx-auto mb-3 sm:mb-4 group cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Use the improved Avatar component */}
          <Avatar
            src={previewUrl || user?.avatar}
            alt={`${user?.fname} ${user?.lname}`}
            fallbackText={`${user?.fname?.[0] || ""}${user?.lname?.[0] || ""}`}
            membershipType={user?.membershipType}
            showMembershipBorder={true}
            showCrown={user?.membershipType === "Core Member"}
            size="lg"
            className=""
          />

          {/* Upload overlay */}
          <div className="absolute inset-0 rounded-full  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Change Photo"}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={previewUrl || getAbsoluteImageUrl(user?.avatar)}
        imageAlt={`${user?.fname} ${user?.lname} Profile Photo`}
        title="Profile Photo"
        onEdit={handleModalEdit}
        showEditButton={true}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleCropModalClose}
        imageSrc={selectedImageUrl || undefined}
        imageAlt="Profile Photo"
        title="Edit Profile Photo"
        onSave={handleCroppedImageSave}
        aspectRatio={1} // Square aspect ratio for profile photos
        circularCrop={true}
      />
    </div>
  );
};

export default ProfilePhotoUpload;
