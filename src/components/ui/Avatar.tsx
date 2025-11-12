"use client";

import React from "react";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fallbackText?: string;
  showMembershipBorder?: boolean;
  membershipType?: string;
  showCrown?: boolean;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  fallbackText = "",
  showMembershipBorder = false,
  membershipType,
  showCrown = false,
  className = "",
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    "2xl": "w-32 h-32",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const crownSizeClasses = {
    xs: "w-3 h-3 text-xs",
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-xs",
    xl: "w-7 h-7 text-sm",
    "2xl": "w-8 h-8 text-base",
  };

  // Get image URL, falling back to default avatar
  const imageUrl = getAbsoluteImageUrl(src || undefined);
  const isCoreMemeber = membershipType === "Core Member";
  const initials = fallbackText
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Detect if this is a favicon/logo (should use contain instead of cover)
  const isFavicon = imageUrl?.includes('favicon');

  const borderClasses = showMembershipBorder ? (isCoreMemeber ? "" : "") : "";

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  return (
    <div
      className={`relative ${sizeClasses[size]} ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Avatar container with optional membership border */}
      {showMembershipBorder ? (
        <div className={`${sizeClasses[size]} rounded-full ${borderClasses}`}>
          <div className={`relative w-full h-full rounded-full overflow-hidden ${isFavicon ? 'bg-white' : 'bg-gray-200'}`}>
            {imageUrl && !imageError ? (
              isFavicon ? (
                <img
                  src={imageUrl}
                  alt={alt}
                  className="w-full h-full object-contain p-0.5"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt={alt}
                  fill
                  sizes={`${sizeClasses[size]}`}
                  className="object-cover"
                  style={{ objectFit: 'cover' }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                  }}
                />
              )
            ) : (
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span
                  className={`text-white ${textSizeClasses[size]} font-semibold`}
                >
                  {initials || "?"}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative w-full h-full rounded-full overflow-hidden ${isFavicon ? 'bg-white' : 'bg-gray-200'}`}>
          {imageUrl && !imageError ? (
            isFavicon ? (
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full object-contain p-0.5"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <Image
                src={imageUrl}
                alt={alt}
                fill
                sizes={`${sizeClasses[size]}`}
                className="object-cover"
                style={{ objectFit: 'cover' }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                }}
              />
            )
          ) : (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span
                className={`text-white ${textSizeClasses[size]} font-semibold`}
              >
                {initials || "?"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Crown icon for Core Members */}
      {showCrown && isCoreMemeber && (
        <div className="absolute -top-1 -right-1">
          <div
            className={`${crownSizeClasses[size].split(" ")[0]} ${
              crownSizeClasses[size].split(" ")[1]
            } bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white`}
          >
            <span
              className={`text-yellow-800 ${
                crownSizeClasses[size].split(" ")[2]
              }`}
            >
              👑
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
