import React from 'react';
import ConnectionsViewPage from './client';

interface ConnectionsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ConnectionsPage: React.FC<ConnectionsPageProps> = async ({ params }) => {
  const { slug } = await params;

  if (!slug) {
    return <div>Invalid connection ID</div>;
  }

  return <ConnectionsViewPage slug={slug} />;
};

export default ConnectionsPage;