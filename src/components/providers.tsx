"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../../store/store";
import { initializeAuth } from "@/lib/authInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    initializeAuth();
    setMounted(true);
  }, []);

  // Dismiss all toasts on route change
  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  return (
    <ReduxProvider store={store}>
      {children}
      {/* Only render Toaster on client side to avoid hydration mismatch */}
      {mounted && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      )}
    </ReduxProvider>
  );
}
