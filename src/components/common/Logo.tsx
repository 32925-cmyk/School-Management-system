/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: 'favicon' | 'sidebar' | 'loginHero' | 'header';
  variant?: 'full' | 'markOnly' | 'textOnly';
  className?: string;
  isDark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'sidebar',
  variant = 'full',
  className = '',
  isDark = false,
}) => {
  // Dimension definitions
  const dimensions = {
    favicon: { icon: 24, text: 'text-sm', subtext: 'text-[9px]' },
    header: { icon: 32, text: 'text-base', subtext: 'text-[10px]' },
    sidebar: { icon: 36, text: 'text-base', subtext: 'text-[10px]' },
    loginHero: { icon: 56, text: 'text-2xl', subtext: 'text-xs' },
  }[size];

  const iconSvg = (
    <svg
      width={dimensions.icon}
      height={dimensions.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
      aria-label="Aurelian Heights Academy Crest"
    >
      <defs>
        {/* Brand Indigo to Teal gradient */}
        <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B3FD8" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        {/* Subtle gold accent gradient */}
        <linearGradient id="goldGrad" x1="50" y1="12" x2="50" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD470" />
          <stop offset="100%" stopColor="#E8B04B" />
        </linearGradient>
        <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B3FD8" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Minimalist modern shield outline */}
      <path
        d="M50 8C68 8 86 16 88 36C88 64 68 86 50 94C32 86 12 64 12 36C14 16 32 8 50 8Z"
        fill="url(#shieldGrad)"
        filter="url(#subtleGlow)"
      />

      {/* Inner shield inset hairline */}
      <path
        d="M50 14C65 14 80 21 82 38C82 62 65 80 50 87C35 80 18 62 18 38C20 21 35 14 50 14Z"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Monogram 'A' - Rising Star / Arrow Apex in warm gold */}
      <path
        d="M50 20L58 32H42L50 20Z"
        fill="url(#goldGrad)"
      />
      <circle cx="50" cy="27" r="1.5" fill="#FFFFFF" />

      {/* Monogram 'A' Crossbar & Open Book Base (academic legacy) */}
      {/* Left Book Page / Leg of A */}
      <path
        d="M48 40L30 70C36 67 44 68 48 72V40Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Right Book Page / Leg of A */}
      <path
        d="M52 40L70 70C64 67 56 68 52 72V40Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />

      {/* Book spine line & A cross-connection */}
      <line x1="38" y1="56" x2="62" y2="56" stroke="#E8B04B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="56" r="2" fill="#3B3FD8" />
    </svg>
  );

  if (variant === 'markOnly') {
    return <div className={`inline-flex items-center ${className}`}>{iconSvg}</div>;
  }

  const textBlock = (
    <div className="flex flex-col leading-none select-none">
      <span className={`font-bold tracking-tight font-['Sora'] ${dimensions.text} ${isDark ? 'text-white' : 'text-neutral-900'}`}>
        Aurelian Heights
      </span>
      <span className={`font-medium tracking-wider uppercase opacity-75 mt-1 font-['Plus_Jakarta_Sans'] ${dimensions.subtext} ${isDark ? 'text-teal-300' : 'text-indigo-700 dark:text-teal-300'}`}>
        Academy
      </span>
    </div>
  );

  if (variant === 'textOnly') {
    return <div className={`inline-flex items-center ${className}`}>{textBlock}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {iconSvg}
      {textBlock}
    </div>
  );
};
