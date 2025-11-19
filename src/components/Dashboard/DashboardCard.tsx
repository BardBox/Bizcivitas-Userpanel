import { DashboardCard } from './data/dashboard-data';
import Image from 'next/image';

interface DashboardCardProps {
  card: DashboardCard;
  className?: string;
  isActive?: boolean;
}

export default function DashboardCardComponent({ card, className = "", isActive = false }: DashboardCardProps) {
  return (
    <div className={`
      ${isActive ? 'bg-[#4A62AD]' : card.bgColor}
      rounded-2xl p-4 sm:p-6 shadow-sm border
      ${isActive ? 'border-[#4A62AD] shadow-xl ring-2 ring-blue-300' : 'border-gray-100 hover:shadow-lg'}
      transition-all duration-300 ease-in-out cursor-pointer group ${className}
    `}>
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[140px] sm:min-h-[160px]">
         {/* Title */}
        <h3 className={`
          text-sm sm:text-base font-medium leading-tight
          ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#4A62AD]'}
          transition-colors duration-300
        `}>
          {card.title}
        </h3>
        {/* Icon */}
        <div className={`my-4 sm:mb-4 ${card.iconColor}`}>
          <div className={`
            w-12 h-12 sm:w-16 sm:h-16 rounded-full
            ${isActive ? 'bg-transparent' : 'bg-gray-50 group-hover:bg-blue-50'}
            flex items-center justify-center transition-all duration-300
          `}>
            <Image
              src={card.icon}
              alt={card.title}
              width={24}
              height={24}
              className={`w-6 h-6 sm:w-8 sm:h-8 ${isActive ? 'brightness-0 invert' : ''} transition-all duration-300`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
