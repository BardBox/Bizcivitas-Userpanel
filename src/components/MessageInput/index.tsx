"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Loader2, X, Image } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface MessageInputProps {
  onSendMessage: (message: string, files?: File[]) => Promise<void> | void;
  placeholder?: string;
  disabled?: boolean;
  showEmojiPicker?: boolean;
  showFileUpload?: boolean;
  maxFiles?: number;
  allowImages?: boolean;
  className?: string;
  variant?: "rounded" | "square";
  size?: "sm" | "md" | "lg";
}

export default function MessageInput({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  showEmojiPicker = true,
  showFileUpload = false,
  maxFiles = 5,
  allowImages = true,
  className = "",
  variant = "rounded",
  size = "md",
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  // Handle emoji selection
  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const input = messageInputRef.current;

    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = messageInput;
      const newValue =
        currentValue.slice(0, start) + emoji + currentValue.slice(end);

      setMessageInput(newValue);

      // Set cursor position after emoji
      setTimeout(() => {
        input.focus();
        const newPosition = start + emoji.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      setMessageInput(messageInput + emoji);
    }

    setShowEmoji(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    if (allowImages) {
      setSelectedFiles([...selectedFiles, ...files]);
    } else {
      // Filter out images if not allowed
      const nonImageFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );
      setSelectedFiles([...selectedFiles, ...nonImageFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Handle send message
  const handleSend = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || isSending || disabled) {
      return;
    }

    setIsSending(true);

    try {
      await onSendMessage(messageInput.trim(), selectedFiles);
      setMessageInput("");
      setSelectedFiles([]);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      input: "py-2 px-4 text-sm",
      button: "p-2",
      icon: "w-4 h-4",
    },
    md: {
      input: "py-3 px-4 text-base",
      button: "p-3",
      icon: "w-5 h-5",
    },
    lg: {
      input: "py-4 px-5 text-lg",
      button: "p-4",
      icon: "w-6 h-6",
    },
  };

  const currentSize = sizeClasses[size];
  const borderRadius = variant === "rounded" ? "rounded-full" : "rounded-lg";

  return (
    <div className={className}>
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white/80 rounded-lg backdrop-blur-sm">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-purple-200 shadow-sm"
            >
              {file.type.startsWith("image/") ? (
                <Image className="w-4 h-4 text-purple-600" />
              ) : (
                <Paperclip className="w-4 h-4 text-purple-600" />
              )}
              <span className="text-sm text-gray-700 max-w-[150px] truncate">
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-center gap-4 relative">
        {/* Main Input Area */}
        <div className="flex-1 relative">
          {/* Colorful gradient border wrapper */}
          <div className={`relative p-[3px] ${borderRadius} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300`}>
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className={`w-full ${currentSize.input} ${borderRadius} pr-20 focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 transition-all duration-300 font-semibold shadow-inner disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-purple-500 placeholder:font-normal outline-none`}
            />

            {/* Right Side Icons Container */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* File Upload Button */}
              {showFileUpload && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={allowImages ? "*" : "application/*"}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled || isSending}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 rounded-full transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                    title="Attach file"
                    disabled={disabled || isSending}
                  >
                    <Paperclip className={`${currentSize.icon} text-white drop-shadow`} />
                  </button>
                </>
              )}

              {/* Emoji Button */}
              {showEmojiPicker && (
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                  title="Add emoji"
                  disabled={disabled || isSending}
                >
                  <Smile className={`${currentSize.icon} text-white drop-shadow`} />
                </button>
              )}
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmoji && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border-4 border-purple-200"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                searchDisabled={false}
                skinTonesDisabled={false}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>

        {/* ULTRA COLORFUL SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={(!messageInput.trim() && selectedFiles.length === 0) || isSending || disabled}
          className={`relative ${currentSize.button} rounded-full transition-all duration-500 transform flex-shrink-0 flex items-center justify-center ${
            (messageInput.trim() || selectedFiles.length > 0) && !isSending && !disabled
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white hover:scale-125 active:scale-90 shadow-2xl hover:shadow-purple-500/50 animate-pulse"
              : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed shadow-lg"
          }`}
          style={{
            boxShadow: (messageInput.trim() || selectedFiles.length > 0) && !isSending && !disabled
              ? '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)'
              : 'none'
          }}
          title="Send message"
          type="button"
        >
          {/* Spinning gradient ring */}
          {(messageInput.trim() || selectedFiles.length > 0) && !isSending && !disabled && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-75 blur-sm animate-spin"></div>
          )}

          <div className="relative">
            {isSending ? (
              <Loader2 className={`${currentSize.icon} animate-spin drop-shadow-lg`} />
            ) : (
              <Send className={`${currentSize.icon} drop-shadow-lg`} />
            )}
          </div>
        </button>
      </div>

      {/* Colorful Character Counter */}
      {messageInput.length > 0 && (
        <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-right mt-3 animate-pulse">
          ✨ {messageInput.length} characters
        </div>
      )}
    </div>
  );
}
