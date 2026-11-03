import React from 'react';

interface ErrorIllustrationProps {
  className?: string;
  type?: '404' | '403' | '500';
}

export const ErrorIllustration: React.FC<ErrorIllustrationProps> = ({ 
  className = "", 
  type = '404' 
}) => {
  return (
    <div className={`relative w-full max-w-[280px] mx-auto aspect-square ${className}`}>
      {/* Background Soft Blobs */}
      <div className="absolute inset-0 bg-[#c96442]/5 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
      <div className="absolute inset-4 bg-[#e8e6dc]/40 rounded-full blur-2xl opacity-80" />

      {/* Main SVG Vector */}
      <svg 
        viewBox="0 0 240 240" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-xl"
      >
        {/* Abstract Base / Platform */}
        <path 
          d="M120 210C169.706 210 210 189.853 210 165C210 140.147 169.706 120 120 120C70.2944 120 30 140.147 30 165C30 189.853 70.2944 210 120 210Z" 
          fill="#faf9f5" 
          stroke="#e8e6dc" 
          strokeWidth="2"
        />
        <path 
          d="M120 210C169.706 210 210 189.853 210 165" 
          stroke="#f0eee6" 
          strokeWidth="4" 
          strokeLinecap="round"
        />

        {/* Dynamic Inner Elements based on Type */}
        {type === '404' && (
          <g>
            {/* Magnifying Glass / Search */}
            <circle cx="105" cy="95" r="35" fill="white" stroke="#141413" strokeWidth="6" />
            <path d="M130 120L155 145" stroke="#141413" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Missing Document */}
            <path d="M70 70L85 55H130V90" stroke="#c96442" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
            <path d="M70 70V110" stroke="#c96442" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
            <circle cx="105" cy="95" r="15" fill="#f5f4ed" />
            <path d="M95 95H115" stroke="#c96442" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          </g>
        )}

        {type === '403' && (
          <g>
            {/* Shield / Lock */}
            <path d="M120 50L170 70V115C170 150 120 180 120 180C120 180 70 150 70 115V70L120 50Z" fill="white" stroke="#141413" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M120 50L170 70V115C170 150 120 180 120 180C120 180 70 150 70 115V70L120 50Z" fill="#faf9f5" />
            
            {/* Keyhole */}
            <circle cx="120" cy="100" r="12" fill="#c96442" />
            <path d="M114 105L110 130H130L126 105H114Z" fill="#c96442" />
            
            {/* Accent Stars / Sparks */}
            <path d="M180 60L185 50L190 60L200 65L190 70L185 80L180 70L170 65L180 60Z" fill="#e8e6dc" />
            <path d="M50 110L53 102L60 100L53 98L50 90L47 98L40 100L47 102L50 110Z" fill="#e8e6dc" />
          </g>
        )}

        {type === '500' && (
          <g>
            {/* Broken Server / Gear */}
            <rect x="70" y="70" width="100" height="90" rx="12" fill="white" stroke="#141413" strokeWidth="6" />
            <line x1="90" y1="95" x2="150" y2="95" stroke="#e8e6dc" strokeWidth="4" strokeLinecap="round" />
            <line x1="90" y1="115" x2="130" y2="115" stroke="#e8e6dc" strokeWidth="4" strokeLinecap="round" />
            
            {/* Warning / Lightning Bolt */}
            <path d="M130 50L100 100H120L110 140L150 85H130L130 50Z" fill="#c96442" stroke="#c96442" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Floating detached elements */}
            <circle cx="170" cy="80" r="4" fill="#141413" />
            <circle cx="160" cy="60" r="6" fill="#e8e6dc" />
            <circle cx="65" cy="130" r="5" fill="#141413" />
          </g>
        )}

        {/* Floating Abstract Elements common to all */}
        <circle cx="190" cy="150" r="8" fill="#c96442" opacity="0.4" />
        <circle cx="45" cy="170" r="12" fill="#141413" opacity="0.1" />
        <path d="M50 80C50 80 65 75 70 60" stroke="#141413" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" opacity="0.3"/>
        <path d="M180 120C180 120 190 135 210 130" stroke="#c96442" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" opacity="0.3"/>
        
      </svg>
    </div>
  );
};
