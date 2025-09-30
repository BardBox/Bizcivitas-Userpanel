import React from "react";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface ViewOnlyConnectionsProps {
  connections: Array<{
    _id: string;
    sender: string;
    receiver: string;
    isAccepted: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
  currentUserId: string; // The ID of the person whose profile we're viewing
}

const ViewOnlyConnections: React.FC<ViewOnlyConnectionsProps> = ({
  connections = [],
  currentUserId,
}) => {
  const router = useRouter();
  const acceptedConnections = connections.filter(conn => conn.isAccepted);

  if (acceptedConnections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>This member hasn&apos;t connected with anyone yet.</p>
      </div>
    );
  }

  const handleViewConnections = () => {
    router.push(`/feeds/connections/${currentUserId}/connections`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Connections
        </h4>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <h5 className="font-medium text-gray-900 mb-2">
          {acceptedConnections.length} Connections
        </h5>
        <p className="text-sm text-gray-600 mb-4">
          This member is connected with {acceptedConnections.length} other members in the network.
        </p>
        <button
          onClick={handleViewConnections}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View All Connections
        </button>
      </div>
    </div>
  );
};

export default ViewOnlyConnections;