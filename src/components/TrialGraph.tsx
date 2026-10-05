interface TrialGraphProps {
  means: { [turns: number]: number };
}

export function TrialGraph({ means }: TrialGraphProps) {
  const W = 520;
  const H = 300;
  const L = 60;
  const R = 30;
  const T = 30;
  const B = 55;
  const maxY = 16;
  const maxX = 60;

  const yTicks = [0, 4, 8, 12, 16];
  const xTicks = [0, 20, 40, 60];

  const plottedPoints = [20, 40, 60]
    .filter((t) => means[t] !== undefined)
    .map((t) => {
      const meanVal = means[t];
      const x = L + (t / maxX) * (W - R - L);
      const y = H - B - (meanVal / maxY) * (H - B - T);
      return { t, meanVal, x, y };
    });

  const pathD =
    plottedPoints.length > 1
      ? `M ${plottedPoints.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`
      : '';

  return (
    <div className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 shadow-inner">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* Subtle grid lines */}
        {yTicks.map((v) => {
          const y = H - B - (v / maxY) * (H - B - T);
          return (
            <g key={`y-${v}`}>
              <line x1={L} y1={y} x2={W - R} y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <line x1={L - 5} y1={y} x2={L} y2={y} stroke="#94a3b8" strokeWidth="1.5" />
              <text x={L - 10} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                {v}
              </text>
            </g>
          );
        })}

        {xTicks.map((v) => {
          const x = L + (v / maxX) * (W - R - L);
          return (
            <g key={`x-${v}`}>
              <line x1={x} y1={H - B} x2={x} y2={T} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <line x1={x} y1={H - B} x2={x} y2={H - B + 5} stroke="#94a3b8" strokeWidth="1.5" />
              <text x={x} y={H - B + 22} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                {v}
              </text>
            </g>
          );
        })}

        {/* Solid Axes */}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

        {/* Axis Labels */}
        <text x={(L + W - R) / 2} y={H - 12} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">
          Number of Wire Turns (N)
        </text>
        <text
          x={18}
          y={(T + H - B) / 2}
          transform={`rotate(-90 18 ${(T + H - B) / 2})`}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="13"
          fontWeight="bold"
        >
          Mean Staples Lifted
        </text>

        {/* Connecting Line of Best Fit */}
        {pathD && (
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Plotted Data Points */}
        {plottedPoints.map(({ t, meanVal, x, y }) => (
          <g key={t}>
            <circle cx={x} cy={y} r="6.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.2" />
            <rect
              x={x - 22}
              y={y - 28}
              width="44"
              height="20"
              rx="4"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text x={x} y={y - 14} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {meanVal.toFixed(1)}
            </text>
          </g>
        ))}

        {plottedPoints.length === 0 && (
          <text x={(L + W - R) / 2} y={(T + H - B) / 2} textAnchor="middle" fill="#64748b" fontSize="13">
            Run trials to plot experimental points on graph
          </text>
        )}
      </svg>
    </div>
  );
}
