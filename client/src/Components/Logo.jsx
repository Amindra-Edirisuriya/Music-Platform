import React from 'react';


export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { icon: 22, text: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 28, text: 'text-base', gap: 'gap-2' },
    lg: { icon: 40, text: 'text-xl', gap: 'gap-2.5' },
    xl: { icon: 56, text: 'text-3xl', gap: 'gap-3' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Icon mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.45)]"
      >
        {/* Outer circle glow */}
        <circle cx="24" cy="24" r="22" fill="url(#ssGrad)" opacity="0.15" />
        {/* Main disc */}
        <circle cx="24" cy="24" r="18" stroke="url(#ssGrad)" strokeWidth="2.5" fill="#18181b" />
        {/* Inner ring */}
        <circle cx="24" cy="24" r="11" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" />
        {/* Vinyl hole */}
        <circle cx="24" cy="24" r="3.5" fill="#a855f7" />
        {/* Sound wave arcs */}
        <path
          d="M32 16c3 3 4.5 6.5 4.5 8s-1.5 5-4.5 8"
          stroke="#c084fc"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M36 12c5 4.5 7 9.5 7 12s-2 7.5-7 12"
          stroke="#a855f7"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="ssGrad" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#c084fc" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span className={`font-black tracking-tighter text-white ${s.text}`}>
          Sound<span className="text-purple-400">Soul</span>
        </span>
      )}
    </div>
  );
}
