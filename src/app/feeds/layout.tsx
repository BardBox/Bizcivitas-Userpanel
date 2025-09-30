import FeedsLayoutClient from "./FeedsLayoutClient";

export default function FeedsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No server-side cookie check; rely on client-side localStorage auth
  return <FeedsLayoutClient>{children}</FeedsLayoutClient>;
}
