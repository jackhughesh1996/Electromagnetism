import React from 'react';

interface InductionMeterProps {
  deflection: number; // -1.0 (full left) to +1.0 (full right)
  value?: number; // -100 to +100
  size?: 'sm' | 'md' | 'lg';
}

export const InductionMeter: React.FC<InductionMeterProps> = ({
  deflection,
  value,
  size = 'md',
}) => {
  // Angle range: -45 degrees (left) to +45 degrees (right)
  const angle = Math.max(-50, Math.min(50, deflection * 48));

  // Determine indicator color
  let activeColor = '#94a3b8'; // center gray
  if (deflection > 0.05) activeColor = '#38bdf8'; // sky blue
  if (deflection < -0.05) activeColor = '#f59e0b'; // amber/orange

  const width = size === 'sm' ? 140 : size === 'lg' ? 240 : 180;
  const height = size === 'sm' ? 90 : size === 'lg' ? 150 : 115;

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between w-full px-1 mb-1 text-[11px] font-semibold text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor }} />
          Centre-Zero Galvanometer
        </span>
        <span className="font-mono text-slate-300">
          {value !== undefined ? `${Math.round(value)}%` : `${Math.round(deflection * 100)}%`}
        </span>
      </div>

      <svg width={width} height={height} viewBox="0 0 200 125" className="overflow-visible">
        {/* Dial Background Arc */}
        <path
          d="M 25 105 A 85 85 0 0 1 175 105"
          fill="none"
          stroke="#1e293b"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Major Tick Marks */}
        {/* -1.0 (Far Left) */}
        <line x1="38" y1="95" x2="48" y2="92" stroke="#64748b" strokeWidth="2" />
        {/* -0.5 */}
        <line x1="65" y1="58" x2="73" y2="64" stroke="#64748b" strokeWidth="1.5" />
        {/* 0 (Centre) */}
        <line x1="100" y1="20" x2="100" y2="34" stroke="#e2e8f0" strokeWidth="3" />
        {/* +0.5 */}
        <line x1="135" y1="58" x2="127" y2="64" stroke="#64748b" strokeWidth="1.5" />
        {/* +1.0 (Far Right) */}
        <line x1="162" y1="95" x2="152" y2="92" stroke="#64748b" strokeWidth="2" />

        {/* Scale labels */}
        <text x="35" y="112" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
          ← Left
        </text>
        <text x="100" y="46" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
          0
        </text>
        <text x="165" y="112" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
          Right →
        </text>

        {/* Center Pivot Base */}
        <circle cx="100" cy="115" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2" />

        {/* Deflecting Needle Pointer */}
        <g transform={`rotate(${angle}, 100, 115)`} style={{ transition: 'transform 0.05s ease-out' }}>
          {/* Needle shadow */}
          <line x1="101" y1="115" x2="101" y2="28" stroke="rgba(0,0,0,0.5)" strokeWidth="3" />
          {/* Needle main line */}
          <line
            x1="100"
            y1="115"
            x2="100"
            y2="28"
            stroke={Math.abs(deflection) > 0.05 ? activeColor : '#e2e8f0'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle arrow tip */}
          <polygon
            points="97,32 100,22 103,32"
            fill={Math.abs(deflection) > 0.05 ? activeColor : '#e2e8f0'}
          />
        </g>

        {/* Pivot Center Cap */}
        <circle cx="100" cy="115" r="5" fill="#e2e8f0" />
      </svg>

      <div className="flex items-center justify-between w-full px-2 text-[10px] text-slate-400 font-medium">
        <span>Deflection: {deflection < -0.05 ? 'Left (←)' : deflection > 0.05 ? 'Right (→)' : 'Zero (0)'}</span>
        <span className="text-slate-400">Relative Effect</span>
      </div>
    </div>
  );
};
