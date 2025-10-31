"use client";

export default function ComingSoon({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
      <div className="text-center max-w-md px-4">
        {/* Illustration */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto"
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Circle */}
            <circle cx="200" cy="150" r="120" fill="transparent" />

            {/* Rocket */}
            <g transform="translate(180, 80)">
              {/* Rocket Body */}
              <path
                d="M20 100 L20 40 Q20 20 30 15 L30 15 Q40 20 40 40 L40 100 Z"
                fill="#F97316"
              />

              {/* Rocket Window */}
              <circle cx="30" cy="50" r="8" fill="#FED7AA" />

              {/* Rocket Fins */}
              <path d="M20 85 L5 100 L20 95 Z" fill="#EA580C" />
              <path d="M40 85 L55 100 L40 95 Z" fill="#EA580C" />

              {/* Rocket Fire */}
              <ellipse cx="30" cy="105" rx="8" ry="12" fill="#FEF3C7" />
              <ellipse cx="30" cy="108" rx="6" ry="8" fill="#FDE047" />
              <ellipse cx="30" cy="110" rx="4" ry="6" fill="#FACC15" />
            </g>

            {/* Stars */}
            <circle cx="80" cy="60" r="3" fill="#FBBF24" />
            <circle cx="320" cy="80" r="2" fill="#FBBF24" />
            <circle cx="100" cy="200" r="2.5" fill="#FBBF24" />
            <circle cx="300" cy="180" r="3" fill="#FBBF24" />
            <circle cx="150" cy="100" r="2" fill="#FBBF24" />
            <circle cx="280" cy="140" r="2" fill="#FBBF24" />

            {/* Clouds */}
            <ellipse cx="60" cy="220" rx="30" ry="10" fill="#E5E7EB" opacity="0.6" />
            <ellipse cx="340" cy="240" rx="40" ry="12" fill="#E5E7EB" opacity="0.6" />
            <ellipse cx="200" cy="260" rx="35" ry="10" fill="#E5E7EB" opacity="0.6" />
          </svg>
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          This feature is under development
        </p>
        <p className="text-base text-gray-500">
          We're working hard to bring you something amazing. Stay tuned for the next version!
        </p>

        {/* Badge */}
        <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 font-medium text-sm">
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Available in Next Version
        </div>
      </div>
    </div>
  );
}
