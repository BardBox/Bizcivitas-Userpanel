"use client";

import { useState } from "react";
import MessageInput from "@/components/MessageInput";
import { MessageCircle, FileText, Mail } from "lucide-react";

export default function MessageInputDemo() {
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; files?: string[] }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (
    message: string,
    files?: File[]
  ): Promise<void> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newMessage = {
      id: Date.now(),
      text: message,
      files: files?.map((f) => f.name),
    };

    setMessages([...messages, newMessage]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Message Input Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            A beautiful, customizable message input with multiple variants and sizes
          </p>
        </div>

        {/* Live Chat Demo */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Live Chat Demo</h2>
                <p className="text-sm text-blue-100">
                  Try sending messages with emojis and files!
                </p>
              </div>
            </div>
          </div>

          {/* Messages Display */}
          <div className="p-6 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No messages yet. Send your first message below!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-none max-w-[80%]">
                    <p className="text-sm break-words">{msg.text}</p>
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.files.map((file, i) => (
                          <div
                            key={i}
                            className="text-xs bg-blue-700 px-2 py-1 rounded"
                          >
                            📎 {file}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <MessageInput
              onSendMessage={handleSendMessage}
              placeholder="Type your message..."
              showEmojiPicker={true}
              showFileUpload={true}
              allowImages={true}
              maxFiles={5}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Size Variants */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Size Variants</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Small */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                  SM
                </span>
                Small Size
              </h3>
              <MessageInput
                onSendMessage={async (msg) => {}}
                size="sm"
                placeholder="Small input..."
              />
            </div>

            {/* Medium */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                  MD
                </span>
                Medium Size (Default)
              </h3>
              <MessageInput
                onSendMessage={async (msg) => {}}
                size="md"
                placeholder="Medium input..."
              />
            </div>

            {/* Large */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                  LG
                </span>
                Large Size
              </h3>
              <MessageInput
                onSendMessage={async (msg) => {}}
                size="lg"
                placeholder="Large input..."
              />
            </div>
          </div>
        </div>

        {/* Shape Variants */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Shape Variants</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rounded */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Rounded (Default)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Fully rounded input and button - perfect for modern chat interfaces
              </p>
              <MessageInput
                onSendMessage={async (msg) => {}}
                variant="rounded"
                placeholder="Rounded variant..."
              />
            </div>

            {/* Square */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Square
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Slightly rounded corners - great for comment sections and forms
              </p>
              <MessageInput
                onSendMessage={async () => {}}
                variant="square"
                placeholder="Square variant..."
              />
            </div>
          </div>
        </div>

        {/* Feature Variants */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Feature Variants</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* With File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                With File Upload
              </h3>
              <MessageInput
                onSendMessage={async () => {}}
                showFileUpload={true}
                allowImages={true}
                placeholder="Attach files..."
              />
            </div>

            {/* Simple (No Emoji) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Simple (No Emoji Picker)
              </h3>
              <MessageInput
                onSendMessage={async () => {}}
                showEmojiPicker={false}
                placeholder="Simple input..."
              />
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Use Cases</h2>

          <div className="grid grid-cols-1 gap-6">
            {/* Comment Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Comment Section Example
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Sample comments */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div>
                      <div className="bg-gray-100 rounded-lg px-4 py-3">
                        <p className="font-semibold text-sm text-gray-900">
                          John Doe
                        </p>
                        <p className="text-sm text-gray-700">
                          This component looks amazing! 🚀
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-4">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                </div>

                <MessageInput
                  onSendMessage={async () => {}}
                  placeholder="Write a comment..."
                  size="sm"
                  variant="square"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h3 className="font-semibold text-white">
                  Contact Form Example
                </h3>
              </div>
              <div className="p-6">
                <MessageInput
                  onSendMessage={async () => {}}
                  placeholder="Write your message to us..."
                  showFileUpload={true}
                  allowImages={true}
                  size="lg"
                  variant="square"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Start Code</h2>
          <pre className="text-sm overflow-x-auto">
            <code>{`import MessageInput from "@/components/MessageInput";

function MyComponent() {
  const handleSend = async (message: string, files?: File[]) => {
    // Your send logic here
  };

  return (
    <MessageInput
      onSendMessage={handleSend}
      placeholder="Type your message..."
      showEmojiPicker={true}
      showFileUpload={true}
      size="md"
      variant="rounded"
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
