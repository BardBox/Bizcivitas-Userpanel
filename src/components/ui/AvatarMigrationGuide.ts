// Utility patterns for converting old avatar code to new Avatar component

/*
OLD PATTERN:
{avatar && getAbsoluteImageUrl(avatar) ? (
  <Image
    src={getAbsoluteImageUrl(avatar)!}
    alt={name}
    width={48}
    height={48}
    className="w-12 h-12 rounded-full object-cover"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.style.display = "none";
    }}
  />
) : (
  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
    {getInitials(name)}
  </div>
)}

NEW PATTERN:
<Avatar
  src={avatar}
  alt={name}
  size="lg"  // xs=6, sm=8, md=12, lg=16, xl=20, 2xl=32 (in h-X w-X format)
  fallbackText={name}
  showMembershipBorder={true}  // optional
  membershipType={membershipType}  // optional
  showCrown={true}  // optional
  className="ring-2 ring-gray-200"  // optional additional classes
  onClick={handleClick}  // optional
/>

SIZE MAPPING:
- w-6 h-6 (24px) -> size="xs"
- w-8 h-8 (32px) -> size="sm"
- w-12 h-12 (48px) -> size="md"
- w-16 h-16 (64px) -> size="lg"
- w-20 h-20 (80px) -> size="xl"
- w-32 h-32 (128px) -> size="2xl"

REQUIRED IMPORTS:
- Remove: import { getAbsoluteImageUrl } from "@/utils/imageUtils";
- Remove: import Image from "next/image";
- Add: import Avatar from "@/components/ui/Avatar";

FUNCTIONS TO REMOVE:
- getInitials() functions
- getAvatarColor() functions
- Any manual avatar styling logic
*/

export {};
