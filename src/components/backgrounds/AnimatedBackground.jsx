import React from 'react';

/**
 * Animated SVG background for the Hero section.
 * Features floating orbs, gradient mesh, and subtle particle lines.
 */
function AnimatedBackground() {
  return (
    <div className="animated-bg-wrapper" aria-hidden="true">
      <svg
        className="animated-bg-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for large orbs */}
          <radialGradient id="orb1Grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb2Grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb3Grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb4Grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid pattern */}
          <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Subtle grid overlay */}
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Large floating orbs */}
        <circle cx="250" cy="300" r="280" fill="url(#orb1Grad)" filter="url(#softGlow)">
          <animate attributeName="cx" values="250;350;250" dur="18s" repeatCount="indefinite" />
          <animate attributeName="cy" values="300;200;300" dur="22s" repeatCount="indefinite" />
          <animate attributeName="r" values="280;320;280" dur="15s" repeatCount="indefinite" />
        </circle>

        <circle cx="1100" cy="200" r="240" fill="url(#orb2Grad)" filter="url(#softGlow)">
          <animate attributeName="cx" values="1100;1000;1100" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="200;350;200" dur="25s" repeatCount="indefinite" />
          <animate attributeName="r" values="240;290;240" dur="18s" repeatCount="indefinite" />
        </circle>

        <circle cx="700" cy="600" r="200" fill="url(#orb3Grad)" filter="url(#softGlow)">
          <animate attributeName="cx" values="700;800;700" dur="16s" repeatCount="indefinite" />
          <animate attributeName="cy" values="600;500;600" dur="20s" repeatCount="indefinite" />
          <animate attributeName="r" values="200;260;200" dur="14s" repeatCount="indefinite" />
        </circle>

        <circle cx="1300" cy="700" r="180" fill="url(#orb4Grad)" filter="url(#softGlow)">
          <animate attributeName="cx" values="1300;1200;1300" dur="22s" repeatCount="indefinite" />
          <animate attributeName="cy" values="700;550;700" dur="19s" repeatCount="indefinite" />
          <animate attributeName="r" values="180;220;180" dur="16s" repeatCount="indefinite" />
        </circle>

        {/* Floating particles — small circles */}
        {[
          { cx: 120, cy: 150, r: 2, dur: '12s', durY: '10s' },
          { cx: 400, cy: 80, r: 1.5, dur: '14s', durY: '11s' },
          { cx: 650, cy: 250, r: 2.5, dur: '16s', durY: '13s' },
          { cx: 900, cy: 120, r: 1.8, dur: '11s', durY: '15s' },
          { cx: 1150, cy: 350, r: 2, dur: '13s', durY: '12s' },
          { cx: 300, cy: 500, r: 1.5, dur: '15s', durY: '14s' },
          { cx: 550, cy: 700, r: 2.2, dur: '17s', durY: '11s' },
          { cx: 800, cy: 450, r: 1.8, dur: '12s', durY: '16s' },
          { cx: 1050, cy: 600, r: 2, dur: '14s', durY: '13s' },
          { cx: 1350, cy: 400, r: 1.6, dur: '16s', durY: '15s' },
          { cx: 200, cy: 750, r: 2.3, dur: '18s', durY: '12s' },
          { cx: 1000, cy: 800, r: 1.4, dur: '13s', durY: '17s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="rgba(255,255,255,0.15)">
            <animate attributeName="cx" values={`${p.cx};${p.cx + 40};${p.cx}`} dur={p.dur} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${p.cy};${p.cy - 30};${p.cy}`} dur={p.durY} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur={p.dur} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Thin connecting lines between some particles */}
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
          <line x1="120" y1="150" x2="400" y2="80">
            <animate attributeName="opacity" values="0.04;0.1;0.04" dur="8s" repeatCount="indefinite" />
          </line>
          <line x1="650" y1="250" x2="900" y2="120">
            <animate attributeName="opacity" values="0.04;0.08;0.04" dur="10s" repeatCount="indefinite" />
          </line>
          <line x1="300" y1="500" x2="550" y2="700">
            <animate attributeName="opacity" values="0.04;0.1;0.04" dur="12s" repeatCount="indefinite" />
          </line>
          <line x1="800" y1="450" x2="1050" y2="600">
            <animate attributeName="opacity" values="0.03;0.08;0.03" dur="9s" repeatCount="indefinite" />
          </line>
          <line x1="1150" y1="350" x2="1350" y2="400">
            <animate attributeName="opacity" values="0.04;0.09;0.04" dur="11s" repeatCount="indefinite" />
          </line>
        </g>

      </svg>
    </div>
  );
}

export default AnimatedBackground;
