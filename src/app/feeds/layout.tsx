import FeedsLayoutClient from "./FeedsLayoutClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ReduxProvider } from "@/components/ReduxProvider";

export default function FeedsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <ProtectedRoute>
        <FeedsLayoutClient>{children}</FeedsLayoutClient>
      </ProtectedRoute>
    </ReduxProvider>
  );
}
