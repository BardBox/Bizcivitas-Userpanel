# 🎨 Stylish Message Input Component

A **beautiful, modern, and highly customizable** message input component for your BizCivitas User Panel!

---

## ✨ Features

### 🎯 Core Features
- ✅ **Prominent Send Button** - Large, gradient blue button that's impossible to miss
- ✅ **Emoji Picker** - Full emoji support with search and categories
- ✅ **File Upload** - Attach images and documents with preview
- ✅ **Real-time Validation** - Button enables only when there's content
- ✅ **Loading States** - Visual feedback during send operations
- ✅ **Character Counter** - Optional display of message length
- ✅ **Keyboard Shortcuts** - Press Enter to send

### 🎨 Design Features
- 🌈 **Gradient Send Button** - Beautiful blue gradient with hover effects
- 🔄 **Smooth Animations** - Scale and transform effects on interaction
- 📱 **Fully Responsive** - Works perfectly on all screen sizes
- 🎭 **Multiple Variants** - Rounded or square styles
- 📏 **Three Sizes** - Small, medium, and large options
- ✨ **Glow Effects** - Focus rings and shadows for better UX

---

## 📦 Installation

The component is already created in your project:

```
Bizcivitas-Userpanel/
└── src/
    └── components/
        └── MessageInput/
            ├── index.tsx          ← Main component
            ├── README.md          ← Full documentation
            └── MessageInput.module.css  ← Custom styles
```

---

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import MessageInput from "@/components/MessageInput";

function ChatPage() {
  const handleSend = async (message: string) => {
    console.log("Sending:", message);
    // Your API call here
  };

  return (
    <MessageInput
      onSendMessage={handleSend}
      placeholder="Type your message..."
    />
  );
}
```

### 2. With All Features Enabled

```tsx
import MessageInput from "@/components/MessageInput";

function ChatPage() {
  const handleSend = async (message: string, files?: File[]) => {
    // Handle message
    console.log("Message:", message);

    // Handle files
    if (files && files.length > 0) {
      console.log("Files:", files);
    }
  };

  return (
    <MessageInput
      onSendMessage={handleSend}
      placeholder="Type your message..."
      showEmojiPicker={true}
      showFileUpload={true}
      allowImages={true}
      maxFiles={5}
      size="md"
      variant="rounded"
    />
  );
}
```

---

## 🎭 Visual Examples

### Size Comparison

```tsx
// Small - Perfect for compact comment sections
<MessageInput size="sm" onSendMessage={handleSend} />

// Medium - Default, balanced size for most use cases
<MessageInput size="md" onSendMessage={handleSend} />

// Large - Great for prominent message areas
<MessageInput size="lg" onSendMessage={handleSend} />
```

### Shape Variants

```tsx
// Rounded - Modern, chat-like appearance (Default)
<MessageInput variant="rounded" onSendMessage={handleSend} />

// Square - Professional, form-like appearance
<MessageInput variant="square" onSendMessage={handleSend} />
```

---

## 🎨 Design Specifications

### Colors

The send button uses a beautiful gradient:

```css
Active State:
- Gradient: from-blue-600 to-blue-700
- Hover: from-blue-700 to-blue-800
- Shadow: blue-500/50 with glow effect

Disabled State:
- Background: gray-300
- Text: gray-500
```

### Button Behavior

**When Enabled:**
- ✅ Beautiful blue gradient background
- ✅ White send icon clearly visible
- ✅ Hover effect: Scales up (105%) with darker gradient
- ✅ Click effect: Scales down (95%)
- ✅ Glowing shadow on hover

**When Disabled:**
- ⚪ Gray background
- ⚪ Gray icon
- ⚪ No hover effects
- ⚪ Cursor shows "not-allowed"

### Spacing & Layout

```
Small (sm):
- Input padding: py-2 px-4 (8px vertical, 16px horizontal)
- Button padding: p-2 (8px all sides)
- Icon size: 16px × 16px

Medium (md) - DEFAULT:
- Input padding: py-3 px-4 (12px vertical, 16px horizontal)
- Button padding: p-3 (12px all sides)
- Icon size: 20px × 20px

Large (lg):
- Input padding: py-4 px-5 (16px vertical, 20px horizontal)
- Button padding: p-4 (16px all sides)
- Icon size: 24px × 24px
```

---

## 📋 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **onSendMessage** | `(message: string, files?: File[]) => Promise<void>` | Required | Callback when send is clicked |
| **placeholder** | `string` | `"Type your message..."` | Input placeholder |
| **disabled** | `boolean` | `false` | Disable all interactions |
| **showEmojiPicker** | `boolean` | `true` | Show emoji button |
| **showFileUpload** | `boolean` | `false` | Show file attach button |
| **maxFiles** | `number` | `5` | Max files to attach |
| **allowImages** | `boolean` | `true` | Allow image uploads |
| **className** | `string` | `""` | Additional CSS classes |
| **variant** | `"rounded" \| "square"` | `"rounded"` | Button/input shape |
| **size** | `"sm" \| "md" \| "lg"` | `"md"` | Component size |

---

## 💡 Real-World Examples

### Example 1: Chat Interface

```tsx
import MessageInput from "@/components/MessageInput";
import { useSendMessageMutation } from "@/store/api/messageApi";

export default function ChatPage() {
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const handleSend = async (message: string) => {
    try {
      await sendMessage({ chatId: "123", content: message }).unwrap();
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Your messages here */}
      </div>

      {/* Input at bottom */}
      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput
          onSendMessage={handleSend}
          disabled={isLoading}
          showEmojiPicker={true}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
}
```

### Example 2: Comment Section

```tsx
import MessageInput from "@/components/MessageInput";

export default function BlogPost({ postId }: { postId: string }) {
  const handleComment = async (comment: string) => {
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
  };

  return (
    <div>
      {/* Post content */}
      <article>...</article>

      {/* Comments section */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Comments</h3>

        <MessageInput
          onSendMessage={handleComment}
          placeholder="Write a comment..."
          size="sm"
          variant="square"
          showEmojiPicker={true}
          showFileUpload={false}
        />
      </div>
    </div>
  );
}
```

### Example 3: Contact Form with File Upload

```tsx
import MessageInput from "@/components/MessageInput";

export default function ContactForm() {
  const handleSubmit = async (message: string, files?: File[]) => {
    const formData = new FormData();
    formData.append("message", message);

    files?.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-6">
        Send us a message and we'll get back to you soon!
      </p>

      <MessageInput
        onSendMessage={handleSubmit}
        placeholder="Write your message here..."
        showFileUpload={true}
        allowImages={true}
        maxFiles={3}
        size="lg"
        variant="square"
        className="shadow-lg"
      />
    </div>
  );
}
```

---

## 🎯 Demo Page

A **live demo** is available at:

```
http://localhost:3000/demo/message-input
```

The demo page includes:
- ✅ Interactive live chat simulation
- ✅ All size variants side-by-side
- ✅ All shape variants comparison
- ✅ Feature toggles (emoji, file upload)
- ✅ Use case examples (chat, comments, forms)
- ✅ Code snippets for quick copy-paste

---

## 🔧 Customization

### Custom Button Color

Want a different color? Modify the component's button classes:

```tsx
// In MessageInput/index.tsx, find the button and replace:
from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800

// With your custom gradient:
from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
// or
from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
```

### Custom Input Border

```tsx
<MessageInput
  onSendMessage={handleSend}
  className="[&_input]:border-purple-500 [&_input:focus]:ring-purple-200"
/>
```

### Custom Placeholder

```tsx
<MessageInput
  onSendMessage={handleSend}
  placeholder="What's on your mind? 💭"
/>
```

---

## 🎪 Advanced Features

### 1. Auto-focus after Send

The component automatically focuses the input after a successful send.

### 2. Character Counter

Appears automatically when you start typing, showing character count.

### 3. File Preview

Shows thumbnails and names of selected files with remove buttons.

### 4. Emoji Insertion

Emojis are inserted at cursor position, not just appended.

### 5. Loading State

Shows spinner in send button during async operations.

---

## 📱 Responsive Behavior

The component is **fully responsive**:

- **Mobile (< 640px)**: Compact layout, smaller icons
- **Tablet (640px - 1024px)**: Balanced spacing
- **Desktop (> 1024px)**: Full-size with optimal spacing

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Escape** | Close emoji picker (if open) |

---

## 🐛 Troubleshooting

### Send button not visible?

Make sure you're not wrapping the component in a container with `overflow: hidden` that clips it.

### Emoji picker not showing?

The emoji picker is dynamically loaded. Ensure `emoji-picker-react` is installed:

```bash
npm install emoji-picker-react
```

### Button always disabled?

Check that you're typing in the input. The button only enables when there's content.

---

## 🎉 Summary

You now have a **production-ready, beautiful message input component** with:

✅ **Prominent blue gradient send button**
✅ **Emoji picker with full Unicode support**
✅ **File upload with preview**
✅ **Three sizes (sm, md, lg)**
✅ **Two variants (rounded, square)**
✅ **Smooth animations and hover effects**
✅ **Fully responsive design**
✅ **Character counter**
✅ **Loading states**
✅ **Complete documentation**

**Ready to use anywhere in your application!**

---

## 📚 Additional Resources

- **Component File**: `src/components/MessageInput/index.tsx`
- **Documentation**: `src/components/MessageInput/README.md`
- **Demo Page**: `src/app/demo/message-input/page.tsx`
- **Custom Styles**: `src/components/MessageInput/MessageInput.module.css`

---

**Created for BizCivitas User Panel** 🚀
**Version**: 1.0.0
**Date**: November 7, 2025
