import React from "react";
import { notFound } from "next/navigation";

import ConnectionDetailsClient from "./client";

interface ConnectionDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// This is a Server Component for better SEO and performance
export default async function ConnectionDetailsPage({
  params,
}: ConnectionDetailsPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <ConnectionDetailsClient slug={slug} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ConnectionDetailsPageProps) {
  const { slug } = await params;

  return {
    title: `Connection Profile - BizCivitas`,
    description: `View detailed connection profile and professional information on BizCivitas networking platform.`,
    openGraph: {
      title: `Connection Profile - BizCivitas`,
      description: `Professional networking and business connections.`,
      type: "profile",
    },
  };
}
