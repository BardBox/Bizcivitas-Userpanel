# 🚀 Quick Start - Message Input Component

## ⚡ 3-Step Setup

### Step 1: Import the Component
```tsx
import MessageInput from "@/components/MessageInput";
```

### Step 2: Create Send Handler
```tsx
const handleSend = async (message: string) => {
  console.log("Sending:", message);
  // Your API call here
};
```

### Step 3: Add to Your Page
```tsx
<MessageInput onSendMessage={handleSend} />
```

**That's it! You're done!** 🎉

---

## 🎯 Complete Example

```tsx
"use client";

import MessageInput from "@/components/MessageInput";

export default function MyPage() {
  const handleSend = async (message: string) => {
    console.log("Message:", message);
    // Add your send logic here
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Chat</h1>

      <MessageInput
        onSendMessage={handleSend}
        placeholder="Type your message..."
      />
    </div>
  );
}
```

---

## 🎨 View the Demo

To see the component in action, run your dev server and visit:

```
http://localhost:3000/demo/message-input
```

You'll see:
- ✅ Live interactive chat
- ✅ All size variants
- ✅ All shape variants
- ✅ Feature demonstrations
- ✅ Copy-paste code examples

---

## 📝 Common Use Cases

### 1. Chat Page

```tsx
import MessageInput from "@/components/MessageInput";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-auto">
        {/* Your messages */}
      </div>

      <div className="border-t p-4 bg-white">
        <MessageInput
          onSendMessage={async (msg) => console.log(msg)}
          showEmojiPicker={true}
        />
      </div>
    </div>
  );
}
```

### 2. Comment Section

```tsx
import MessageInput from "@/components/MessageInput";

export default function Comments() {
  return (
    <div className="mt-6">
      <h3 className="font-bold mb-3">Comments</h3>

      <MessageInput
        onSendMessage={async (msg) => console.log(msg)}
        placeholder="Write a comment..."
        size="sm"
        variant="square"
      />
    </div>
  );
}
```

### 3. Contact Form

```tsx
import MessageInput from "@/components/MessageInput";

export default function ContactForm() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <MessageInput
        onSendMessage={async (msg, files) => {
          console.log("Message:", msg);
          console.log("Files:", files);
        }}
        placeholder="How can we help?"
        showFileUpload={true}
        size="lg"
      />
    </div>
  );
}
```

---

## 🎛️ Customization Options

### Change Size
```tsx
<MessageInput size="sm" />   // Small
<MessageInput size="md" />   // Medium (default)
<MessageInput size="lg" />   // Large
```

### Change Shape
```tsx
<MessageInput variant="rounded" />  // Fully rounded (default)
<MessageInput variant="square" />   // Slightly rounded
```

### Enable/Disable Features
```tsx
<MessageInput
  showEmojiPicker={true}   // Show emoji button
  showFileUpload={true}    // Show file attach button
  allowImages={true}       // Allow image uploads
  maxFiles={5}            // Max 5 files
/>
```

### Custom Placeholder
```tsx
<MessageInput placeholder="What's on your mind? 💭" />
```

### Disable While Loading
```tsx
const [isLoading, setIsLoading] = useState(false);

<MessageInput
  onSendMessage={async (msg) => {
    setIsLoading(true);
    // ... send logic
    setIsLoading(false);
  }}
  disabled={isLoading}
/>
```

---

## 📱 Responsive Behavior

The component automatically adjusts for different screen sizes:

- **Mobile**: Compact layout, touch-optimized
- **Tablet**: Balanced spacing
- **Desktop**: Full-size with optimal spacing

**No extra configuration needed!**

---

## 🎨 The Send Button

### When It's Visible (Blue & Prominent)
- ✅ Text is typed in the input
- ✅ Files are attached
- ✅ Not in disabled state

### When It's Gray (Disabled)
- ⚪ Input is empty
- ⚪ No files attached
- ⚪ Component is disabled

**The blue gradient makes it impossible to miss!**

---

## ⌨️ Keyboard Shortcuts

- Press **Enter** to send message
- Click emoji button or file button as needed

---

## 🆘 Troubleshooting

### "I can't see the send button!"

**Check:**
1. Is there text in the input? (Button is gray when empty)
2. Try typing something - button should turn BLUE
3. The button is on the right side of the input

### "Emoji picker not showing"

**Solution:**
The emoji picker library is already installed. Make sure you're clicking the smiley face icon 🙂

### "Button too small"

**Solution:**
```tsx
<MessageInput size="lg" />  // Use large size
```

---

## 📚 Full Documentation

For complete documentation, see:

- **Main Docs**: `src/components/MessageInput/README.md`
- **Visual Guide**: `src/components/MessageInput/VISUAL_GUIDE.md`
- **Feature Overview**: `STYLISH_MESSAGE_INPUT.md`

---

## ✅ Checklist

Before using the component, make sure:

- [ ] Component imported: `import MessageInput from "@/components/MessageInput"`
- [ ] Send handler created: `const handleSend = async (msg) => { ... }`
- [ ] Component added to page: `<MessageInput onSendMessage={handleSend} />`
- [ ] Dev server running: `npm run dev`

---

## 🎉 You're Ready!

The component is production-ready and works out of the box.

**Start using it in your pages now!** 🚀

### Quick Copy-Paste Template

```tsx
"use client";

import MessageInput from "@/components/MessageInput";

export default function MyPage() {
  const handleSend = async (message: string, files?: File[]) => {
    console.log("Message:", message);
    if (files) console.log("Files:", files);

    // TODO: Add your API call here
    // await sendMessageAPI({ content: message });
  };

  return (
    <div className="p-6">
      <MessageInput
        onSendMessage={handleSend}
        placeholder="Type your message..."
        showEmojiPicker={true}
        showFileUpload={false}
        size="md"
        variant="rounded"
      />
    </div>
  );
}
```

**Copy this template and customize as needed!** 📋
