import React from "react";

interface RewardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function RewardCard({ children, className = "" }: RewardCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
