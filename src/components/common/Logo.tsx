import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-black tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* House + Shield minimal SVG icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-700/20 ring-1 ring-teal-400/30 flex-shrink-0 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/6 h-5/6 text-white"
        >
          {/* Shield Outline */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255, 255, 255, 0.15)" stroke="currentColor" />
          {/* Minimal House Roof & Core nested inside shield */}
          <path d="M8.5 11l3.5-3 3.5 3" stroke="currentColor" strokeWidth="2.2" />
          <path d="M9.5 11.5v4.5h5v-4.5" stroke="currentColor" strokeWidth="1.8" />
          {/* Vault Keyhole / Sparkle dot */}
          <circle cx="12" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`text-slate-900 tracking-tight ${textSizes[size]}`}>
            HomeVault
          </span>
          <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-700 border border-teal-200/80">
            AI
          </span>
        </div>
        {showTagline && size !== 'sm' && (
          <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-0.5">
            Your Home. Your Appliances. All Protected.
          </span>
        )}
      </div>
    </div>
  );
};
