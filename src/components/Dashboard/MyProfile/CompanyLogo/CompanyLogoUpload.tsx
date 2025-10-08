"use client";

import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

import ImageModal from "@/components/ui/ImageModal";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { toast } from "react-hot-toast";
import {
  useGetFullProfileQuery,
  useUpdateProfessionDetailsMutation,
} from "@/store/api";

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

interface CompanyLogoUploadProps {
  companyName?: string;
  currentLogo?: string;
  onLogoUpdate?: (logoUrl: string) => void;
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  companyName,
  currentLogo,
  onLogoUpdate,
}) => {
  const { data: profile } = useGetFullProfileQuery();
  const [updateProfessionDetails, { isLoading: isUploading }] =
    useUpdateProfessionDetailsMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Construct full logo URL
  const getLogoUrl = (logoPath?: string) => {
    if (!logoPath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${logoPath}`;
  };

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
      const croppedFile = new File([croppedImageBlob], "company-logo.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile);

      // Upload the compressed file
      await handleLogoUpload(compressedFile);

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

  const handleLogoUpload = async (file: File) => {
    try {
      // Create FormData for company logo upload
      const formData = new FormData();
      formData.append("companyLogo", file, file.name);

      // Send the FormData to update professional details
      const response = await updateProfessionDetails(formData).unwrap();

      // Handle the response - check for success
      if (response) {
        // Clear any existing preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        // Notify parent component if logo was returned
        if (response.companyLogo && onLogoUpdate) {
          onLogoUpdate(response.companyLogo);
        }

        toast.success("Company logo updated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Logo upload failed:", error);

      // Clear the preview URL if upload failed
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Extract error message from API response
      let errorMessage = "Failed to upload logo. Please try again.";
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

  const handleLogoClick = () => {
    const logoUrl = getLogoUrl(currentLogo);
    if (logoUrl || previewUrl) {
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

  const displayLogoUrl = previewUrl || getLogoUrl(currentLogo);

  return (
    <div className="text-center">
      <div
        className="relative w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 overflow-hidden group cursor-pointer"
        onClick={handleLogoClick}
      >
        {displayLogoUrl ? (
          <img
            src={displayLogoUrl}
            alt={`${companyName || "Company"} Logo`}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <div class="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
          </div>
        )}

        {/* Upload overlay */}
        <div className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg
              className="w-4 h-4 text-white"
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

        {/* Loading indicator */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full  bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 mb-2"
      >
        {isUploading ? "Uploading..." : "Change Logo"}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={displayLogoUrl || undefined}
        imageAlt={`${companyName || "Company"} Logo`}
        title="Company Logo"
        onEdit={handleModalEdit}
        showEditButton={true}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleCropModalClose}
        imageSrc={selectedImageUrl || undefined}
        imageAlt="Company Logo"
        title="Edit Company Logo"
        onSave={handleCroppedImageSave}
        aspectRatio={1} // Square aspect ratio for company logos
        circularCrop={true}
      />
    </div>
  );
};

export default CompanyLogoUpload;
