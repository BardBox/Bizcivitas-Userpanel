"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import FullscreenGallery from "./FullscreenGallery";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export default function ImageCarousel({ images, alt = "Post image" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const handleDownload = async (e: React.MouseEvent, imageUrl: string, index: number) => {
    e.stopPropagation(); // Prevent opening fullscreen gallery

    try {
      const loadingToast = toast.loading("Downloading image...");

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = imageUrl.split("/").pop() || `image-${index + 1}.jpg`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  // If only one image, show without carousel
  if (images.length === 1) {
    return (
      <>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group">
          <div
            className="relative w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setIsGalleryOpen(true)}
          >
            <Image
              src={images[0]}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-800 pointer-events-none">
                Click to view fullscreen
              </div>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={(e) => handleDownload(e, images[0], 0)}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Download image"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <FullscreenGallery
          images={images}
          initialIndex={0}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          alt={alt}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative w-full space-y-3">
        <div className="rounded-lg overflow-hidden group">
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3,
              el: '.custom-pagination',
            }}
            keyboard={{
              enabled: true,
            }}
            onSlideChange={(swiper: SwiperType) => setCurrentIndex(swiper.activeIndex)}
            className="w-full"
          >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full aspect-video bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setIsGalleryOpen(true)}
              >
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority={index === 0}
                />
                {/* Zoom hint overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-800 pointer-events-none">
                    Click to view fullscreen
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous image"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next image"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

          {/* Top right controls */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {/* Download button */}
            <button
              onClick={(e) => handleDownload(e, images[currentIndex], currentIndex)}
              className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Download current image"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>

            {/* Image Counter */}
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* Pagination dots below image */}
        <div className="custom-pagination flex justify-center pb-2"></div>
      </div>

      {/* Fullscreen Gallery Modal */}
      <FullscreenGallery
        images={images}
        initialIndex={currentIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        alt={alt}
      />
    </>
  );
}
