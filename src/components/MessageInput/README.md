# MessageInput Component

A beautiful, reusable message input component with emoji picker, file upload, and customizable styling.

## Features

✅ **Stylish Design** - Modern gradient send button with hover effects
✅ **Emoji Picker** - Built-in emoji support with dynamic loading
✅ **File Upload** - Optional file/image attachment support
✅ **Responsive** - Works perfectly on mobile and desktop
✅ **Customizable** - Multiple size and variant options
✅ **Keyboard Shortcuts** - Press Enter to send
✅ **Loading States** - Visual feedback during send operations
✅ **Character Counter** - Optional character count display

## Usage

### Basic Usage

```tsx
import MessageInput from "@/components/MessageInput";

function MyComponent() {
  const handleSendMessage = async (message: string) => {
    console.log("Sending message:", message);
    // Your send logic here
  };

  return (
    <MessageInput
      onSendMessage={handleSendMessage}
      placeholder="Type your message..."
    />
  );
}
```

### With File Upload

```tsx
import MessageInput from "@/components/MessageInput";

function ChatComponent() {
  const handleSendMessage = async (message: string, files?: File[]) => {
    console.log("Message:", message);
    console.log("Files:", files);

    // Upload files and send message
    if (files && files.length > 0) {
      // Handle file upload
    }

    // Send message
    await sendMessageAPI({ content: message });
  };

  return (
    <MessageInput
      onSendMessage={handleSendMessage}
      showFileUpload={true}
      allowImages={true}
      maxFiles={5}
    />
  );
}
```

### Different Sizes

```tsx
// Small size
<MessageInput
  onSendMessage={handleSend}
  size="sm"
/>

// Medium size (default)
<MessageInput
  onSendMessage={handleSend}
  size="md"
/>

// Large size
<MessageInput
  onSendMessage={handleSend}
  size="lg"
/>
```

### Different Variants

```tsx
// Rounded (default) - fully rounded input and button
<MessageInput
  onSendMessage={handleSend}
  variant="rounded"
/>

// Square - slightly rounded corners
<MessageInput
  onSendMessage={handleSend}
  variant="square"
/>
```

### Custom Styling

```tsx
<MessageInput
  onSendMessage={handleSend}
  className="border-t border-gray-200 p-4 bg-gray-50"
/>
```

### Disabled State

```tsx
<MessageInput
  onSendMessage={handleSend}
  disabled={isLoading}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSendMessage` | `(message: string, files?: File[]) => Promise<void> \| void` | **Required** | Callback when message is sent |
| `placeholder` | `string` | `"Type your message..."` | Input placeholder text |
| `disabled` | `boolean` | `false` | Disable the input |
| `showEmojiPicker` | `boolean` | `true` | Show emoji picker button |
| `showFileUpload` | `boolean` | `false` | Show file upload button |
| `maxFiles` | `number` | `5` | Maximum number of files |
| `allowImages` | `boolean` | `true` | Allow image uploads |
| `className` | `string` | `""` | Additional CSS classes |
| `variant` | `"rounded" \| "square"` | `"rounded"` | Input shape variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Component size |

## Examples

### Chat Application

```tsx
import MessageInput from "@/components/MessageInput";
import { useSendMessageMutation } from "@/store/api/messageApi";

export default function ChatPage() {
  const [sendMessage] = useSendMessageMutation();

  const handleSend = async (message: string) => {
    try {
      await sendMessage({
        chatId: "123",
        content: message,
      }).unwrap();
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {/* Your messages here */}
      </div>

      {/* Input area */}
      <MessageInput
        onSendMessage={handleSend}
        showEmojiPicker={true}
        variant="rounded"
        size="md"
        className="border-t border-gray-200 p-4"
      />
    </div>
  );
}
```

### Comment Section

```tsx
import MessageInput from "@/components/MessageInput";

export default function CommentSection({ postId }: { postId: string }) {
  const handleComment = async (comment: string) => {
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: comment }),
    });
  };

  return (
    <div className="mt-4">
      <MessageInput
        onSendMessage={handleComment}
        placeholder="Write a comment..."
        size="sm"
        variant="square"
        showEmojiPicker={true}
        showFileUpload={false}
      />
    </div>
  );
}
```

### Contact Form

```tsx
import MessageInput from "@/components/MessageInput";

export default function ContactForm() {
  const handleSubmit = async (message: string, files?: File[]) => {
    const formData = new FormData();
    formData.append("message", message);

    files?.forEach((file) => {
      formData.append("attachments", file);
    });

    await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <MessageInput
        onSendMessage={handleSubmit}
        placeholder="Write your message..."
        showFileUpload={true}
        allowImages={true}
        maxFiles={3}
        size="lg"
        variant="square"
      />
    </div>
  );
}
```

## Styling Guide

The component uses Tailwind CSS classes. You can customize colors by modifying the component or wrapping it in a div with custom styles.

### Custom Send Button Color

To change the send button color, modify the gradient classes in the component:

```tsx
// Change from blue to green
from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
```

### Custom Border Color

```tsx
// Add custom border color via className
<MessageInput
  onSendMessage={handleSend}
  className="[&_input]:border-purple-500 [&_input:focus]:ring-purple-100"
/>
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line (not implemented in single-line input)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- `lucide-react` - Icons
- `emoji-picker-react` - Emoji picker (dynamically loaded)
- `react` - Core functionality

## Notes

- The emoji picker is dynamically imported to avoid SSR issues
- File upload is optional and can be disabled
- The component automatically focuses the input after sending
- Character counter appears when typing
- File previews show with remove buttons
