import FeedsLayoutClient from "./FeedsLayoutClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function FeedsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <FeedsLayoutClient>{children}</FeedsLayoutClient>
    </ProtectedRoute>
  );
}
