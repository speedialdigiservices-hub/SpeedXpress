
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-10" }) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg viewBox="0 0 520 120" className="h-full w-auto">
        <defs>
          <linearGradient id="speeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#2299ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#44ddff', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="ialOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ff9900', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ffcc00', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Speed Lines to the left */}
        <g transform="translate(10, 35)">
          <rect x="0" y="0" width="50" height="6" rx="3" fill="#2299ff" />
          <rect x="15" y="12" width="60" height="6" rx="3" fill="#44ddff" />
          <rect x="5" y="24" width="45" height="6" rx="3" fill="#ffaa00" />
          <rect x="25" y="36" width="35" height="6" rx="3" fill="#ff7700" />
          <rect x="40" y="48" width="20" height="4" rx="2" fill="#2299ff" opacity="0.6" />
        </g>

        {/* "Spee" Text */}
        <text 
          x="85" y="85" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="900" 
          fontStyle="italic" 
          fontSize="72" 
          fill="url(#speeBlue)"
          letterSpacing="-2"
        >
          Spee
        </text>

        {/* Pin Icon (Stylized 'd') */}
        <g transform="translate(285, 40)">
          {/* Main Pin Shape */}
          <path 
            d="M30,0 C13,0 0,13 0,30 C0,47 30,75 30,75 C30,75 60,47 60,30 C60,13 47,0 30,0 Z" 
            fill="url(#ialOrange)" 
          />
          {/* Internal Circle */}
          <circle cx="30" cy="30" r="18" fill="#1e1b1b" />
          {/* Package Icon inside pin */}
          <g transform="translate(18, 18) scale(0.6)">
            <path d="M4 10l11 4 11-4-11-4-11 4zm0 0v9l11 4 11-4v-9m-11 4v9" stroke="#ff9900" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 14L4 10M15 14l11-4M15 14v13" stroke="#ff9900" strokeWidth="3" fill="none" />
          </g>
        </g>

        {/* "ial" Text */}
        <text 
          x="345" y="85" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="900" 
          fontStyle="italic" 
          fontSize="72" 
          fill="url(#ialOrange)"
          letterSpacing="-2"
        >
          ial
        </text>

        {/* "EXPRESS" Text */}
        <text 
          x="320" y="112" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="900" 
          fontSize="24" 
          fill="#ff9900"
          letterSpacing="1"
        >
          EXPRESS
        </text>
        
        {/* Underlines for speed effect below text */}
        <g transform="translate(180, 100)">
          <rect x="0" y="0" width="120" height="4" rx="2" fill="url(#ialOrange)" opacity="0.8" />
          <rect x="40" y="8" width="100" height="3" rx="1.5" fill="#ff7700" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
