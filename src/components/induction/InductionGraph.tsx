import React from 'react';

interface InductionGraphProps {
  history: number[]; // rolling history of induced values (-100 to +100)
  maxSamples?: number;
  width?: number | string;
  height?: number;
}

export const InductionGraph: React.FC<InductionGraphProps> = ({
  history,
  maxSamples = 160,
  width = '100%',
  height = 110,
}) => {
  const viewBoxWidth = 320;
  const viewBoxHeight = 110;
  const zeroY = viewBoxHeight / 2;

  // Build SVG path points
  const points = history.map((val, idx) => {
    // Map idx across viewBoxWidth
    const x = (idx / (maxSamples - 1)) * viewBoxWidth;
    // val is -100 to +100. Positive values go UP (smaller y), negative go DOWN (larger y)
    // Scale 100 to 45 pixels amplitude
    const y = zeroY - (val / 100) * 44;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : `M 0,${zeroY} L ${viewBoxWidth},${zeroY}`;

  // Current latest reading
  const currentVal = history.length > 0 ? history[history.length - 1] : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 shadow-lg backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          Live Signal Oscilloscope
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Signal: <strong className={currentVal > 1 ? 'text-sky-400' : currentVal < -1 ? 'text-amber-400' : 'text-slate-400'}>{Math.round(currentVal)}%</strong>
        </span>
      </div>

      <div className="w-full relative overflow-hidden rounded-lg bg-slate-950 border border-slate-800">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full block"
          style={{ height }}
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          <line x1="0" y1="18" x2={viewBoxWidth} y2="18" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1={zeroY} x2={viewBoxWidth} y2={zeroY} stroke="#334155" strokeWidth="1.5" />
          <line x1="0" y1={viewBoxHeight - 18} x2={viewBoxWidth} y2={viewBoxHeight - 18} stroke="#1e293b" strokeDasharray="3 3" />

          {/* Zero baseline label */}
          <text x="4" y={zeroY - 3} fill="#64748b" fontSize="8" fontWeight="bold">
            0 (Zero Induced Signal)
          </text>
          <text x="4" y="14" fill="#38bdf8" fontSize="8" fontWeight="bold">
            + Positive Deflection
          </text>
          <text x="4" y={viewBoxHeight - 6} fill="#f59e0b" fontSize="8" fontWeight="bold">
            − Negative Deflection
          </text>

          {/* Area fill for signal */}
          {points.length > 1 && (
            <path
              d={`${pathD} L ${(history.length - 1) * (viewBoxWidth / (maxSamples - 1))},${zeroY} L 0,${zeroY} Z`}
              fill="rgba(56, 189, 248, 0.12)"
            />
          )}

          {/* Waveform Trace */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Head Dot */}
          {points.length > 0 && (
            <circle
              cx={(history.length - 1) * (viewBoxWidth / (maxSamples - 1))}
              cy={zeroY - (currentVal / 100) * 44}
              r="3.5"
              fill={Math.abs(currentVal) > 2 ? '#38bdf8' : '#94a3b8'}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>Time: ~8 seconds rolling window</span>
        <span>Relative Induced Current vs Time</span>
      </div>
    </div>
  );
};
