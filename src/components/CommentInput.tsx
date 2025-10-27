"use client";

import React, { useState } from "react";
import { ImagePlus, Loader2, Send } from "lucide-react";
import Image from "next/image";

interface CommentInputProps {
  postId: string;
  onCommentAdded: (formData: FormData) => Promise<void>;
  loading?: boolean;
}

export default function CommentInput({
  postId,
  onCommentAdded,
  loading = false,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    const formData = new FormData();
    formData.append("content", content);
    if (media) {
      formData.append("media", media);
    }

    try {
      await onCommentAdded(formData);
      setContent("");
      setMedia(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleMediaChange}
              accept="image/*,video/*"
            />
            <ImagePlus className="w-6 h-6 text-gray-500 hover:text-orange-500" />
          </label>
          <button
            type="submit"
            disabled={loading || (!content.trim() && !media)}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-400"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {previewUrl && (
        <div className="relative w-24 h-24">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeMedia}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
}
