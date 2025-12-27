"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface FullscreenGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export default function FullscreenGallery({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = "Image",
}: FullscreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDownload = async () => {
    const currentImage = images[currentIndex];
    const rawFilename = currentImage.split("/").pop() || `image-${currentIndex + 1}.jpg`;
    const filename = rawFilename.split("?")[0];

    try {
      // Show loading toast
      const loadingToast = toast.loading("Downloading image...");

      // Fetch the image
      const response = await fetch(currentImage, { mode: 'cors' });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      // Show success toast
      toast.success("Image downloaded successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Download failed:", error);
      toast.dismiss();

      // Fallback
      const link = document.createElement("a");
      link.href = currentImage;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast('Image opened in new tab. Right-click to "Save As".', {
        icon: 'ℹ️',
        duration: 4000
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Top center controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        {/* Zoom toggle */}
        <button
          onClick={toggleZoom}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          {isZoomed ? (
            <ZoomOut className="w-5 h-5" />
          ) : (
            <ZoomIn className="w-5 h-5" />
          )}
        </button>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label="Download image"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-30"
          disabled={images.length <= 1}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-30"
          disabled={images.length <= 1}
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main image container */}
      <div
        className={`relative w-full h-full flex items-center justify-center p-16 transition-all duration-300 ${isZoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in"
          }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            toggleZoom();
          }
        }}
      >
        <div
          className={`relative transition-all duration-300 ${isZoomed ? "w-auto h-auto max-w-none" : "max-w-[90vw] max-h-full"
            }`}
        >
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className={`object-contain transition-all duration-300 ${isZoomed
              ? "w-auto h-auto max-w-none cursor-grab active:cursor-grabbing"
              : "max-w-full max-h-[85vh] w-auto h-auto"
              }`}
            style={isZoomed ? { imageRendering: "crisp-edges" } : {}}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 backdrop-blur-sm p-3 rounded-xl max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${index === currentIndex
                ? "ring-2 ring-white scale-110"
                : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close gallery"
      />
    </div>
  );
}
