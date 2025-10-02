"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  onSave?: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt = "Image",
  title = "Edit Image",
  onSave,
  aspectRatio = 1,
  circularCrop = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !onSave) return;

    setIsProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onSave(croppedImageBlob);
      onClose();
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!croppedAreaPixels || isProcessing}
              className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-gray-600">Zoom:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24"
              />
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
              <span className="text-xs text-gray-500 min-w-[3rem]">
                {(zoom * 100).toFixed(0)}%
              </span>
            </div>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Image Editor */}
        <div className="p-4">
          {imageSrc ? (
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                cropShape={circularCrop ? "round" : "rect"}
                showGrid={!circularCrop}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">No image selected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
