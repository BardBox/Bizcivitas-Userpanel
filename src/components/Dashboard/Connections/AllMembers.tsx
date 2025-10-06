import React, { useMemo } from "react";
import UserCard from "../UserCard";
import { useGetSuggestionsAllQuery } from "@/store/api/userApi";
import { Users } from "lucide-react";
import { usePagination } from "../Pagination/usePagination";
import Pagination from "../Pagination/Pagination";
interface SuggestionMember {
  _id: string;
  id: string;
  fname?: string;
  lname?: string;
  avatar?: string;
  classification?: string;
  companyName?: string;
  profile?: {
    professionalDetails?: {
      companyName?: string;
    };
  };
}

interface CardMember {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline: boolean;
}

interface AllMembersProps {
  searchQuery?: string;
  referrerTab?: string;
  onPaginationChange?: (state: {
    startIndex: number;
    endIndex: number;
    totalItems: number;
    itemsPerPage: number;
  }) => void;
}

const AllMembers: React.FC<AllMembersProps> = ({
  searchQuery = "",
  referrerTab = "connect-members",
  onPaginationChange,
}) => {
  const { data: suggestions, isLoading, error } = useGetSuggestionsAllQuery("");

  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  };

  // Transform API data to match UserCard props - MUST be before any conditional returns
  const membersData: CardMember[] = useMemo(() => {
    if (!suggestions) return [];

    return suggestions.map((user: SuggestionMember) => {
      const fullName = `${user.fname || ""} ${user.lname || ""}`.trim();

      // Get title/classification
      let title = "";
      if (
        user.classification &&
        user.classification.length <= 50 &&
        !user.classification.includes("@")
      ) {
        title = user.classification;
      } else {
        title = "Business Professional";
      }

      // Get company
      const company =
        user.companyName ||
        user.profile?.professionalDetails?.companyName ||
        "BizCivitas Member";

      return {
        id: user._id || user.id || "",
        name: fullName || "-",
        title: title || "-",
        company: company || "-",
        avatar: getAvatarUrl(user.avatar),
        isOnline: false,
      };
    });
  }, [suggestions]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersData;

    const query = searchQuery.toLowerCase();
    return membersData.filter(
      (member: { name: string; title: string; company: string }) =>
        member.name.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query) ||
        member.company.toLowerCase().includes(query)
    );
  }, [membersData, searchQuery]);

  // Setup pagination
  const {
    state: paginationState,
    actions: paginationActions,
    paginatedData,
  } = usePagination(filteredMembers, {
    initialItemsPerPage: 12,
    itemsPerPageOptions: [12, 24, 36, 48],
  });

  const currentMembers: CardMember[] = paginatedData(filteredMembers);

  // Notify parent component about pagination changes
  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange({
        startIndex: paginationState.startIndex,
        endIndex: paginationState.endIndex,
        totalItems: paginationState.totalItems,
        itemsPerPage: paginationState.itemsPerPage,
      });
    }
  }, [paginationState, onPaginationChange]);

  // Loading state - After all hooks
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state - After all hooks
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load members
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading members. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No users state - After all hooks
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No members found
          </h3>
          <p className="text-gray-600">
            All available members are already in your network.
          </p>
        </div>
      </div>
    );
  }

  // No search results - After all hooks
  if (filteredMembers.length === 0 && searchQuery) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No members found
          </h3>
          <p className="text-gray-600 mb-4">
            No members match &quot;{searchQuery}&quot;
          </p>
          <p className="text-sm text-gray-500">
            Try adjusting your search terms
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentMembers.map((member) => (
          <UserCard
            key={member.id}
            id={member.id}
            name={member.name}
            title={member.title}
            company={member.company}
            avatar={member.avatar}
            isOnline={member.isOnline}
            referrerTab={referrerTab}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {paginationState.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            state={paginationState}
            actions={paginationActions}
            itemName="members"
            searchTerm={searchQuery}
            layout="inline"
            showItemsPerPage={false}
            showFirstLastButtons={true}
            size="md"
            className="flex justify-center"
          />
        </div>
      )}
    </>
  );
};

export default AllMembers;
