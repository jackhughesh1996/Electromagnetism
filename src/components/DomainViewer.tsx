import { useEffect, useState } from 'react';

interface DomainViewerProps {
  isAligned: boolean;
  hasIronCore: boolean;
}

const DEFAULT_RANDOM_ANGLES = [-70, 35, 120, -25, 78, -130, 15, 155, -92, 58, -8, 104, -155, 44];

export function DomainViewer({ isAligned, hasIronCore }: DomainViewerProps) {
  const [angles, setAngles] = useState<number[]>(DEFAULT_RANDOM_ANGLES);

  useEffect(() => {
    if (!hasIronCore) {
      setAngles(DEFAULT_RANDOM_ANGLES);
      return;
    }

    let animationFrameId: number;
    const startAngles = [...angles];
    const targetAngles = isAligned
      ? DEFAULT_RANDOM_ANGLES.map((_, i) => ((i * 11) % 17) - 8) // mostly aligned along 0°
      : DEFAULT_RANDOM_ANGLES;

    const startTime = performance.now();
    const duration = 500;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      const current = startAngles.map((start, i) => {
        const target = targetAngles[i];
        return start + (target - start) * ease;
      });

      setAngles(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAligned, hasIronCore]);

  if (!hasIronCore) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">No Iron Core:</span> Magnetic domains only exist inside magnetic materials like iron.
      </div>
    );
  }

  const xs = [25, 65, 105, 145, 185, 225, 265];
  const ys = [25, 65];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Microscopic Magnetic Domains (Soft Iron)
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isAligned
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isAligned ? 'ALIGNED (Reinforcing)' : 'SCATTERED (Random)'}
        </span>
      </div>

      <div className="bg-slate-900 rounded-lg p-2 flex justify-center overflow-hidden border border-slate-800/80">
        <svg viewBox="0 0 290 90" className="w-full max-w-[290px] h-auto">
          {/* Iron core boundary representation */}
          <rect x="5" y="5" width="280" height="80" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          
          {angles.map((angle, i) => {
            const x = xs[i % 7];
            const y = ys[Math.floor(i / 7)];
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" />
                {/* North Pole (Red) pointing right */}
                <polygon points="14,0 7,-4.5 7,4.5" fill="#ef4444" />
                {/* South Pole (Blue) pointing left */}
                <polygon points="-14,0 -7,-4.5 -7,4.5" fill="#3b82f6" />
                <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
        {isAligned ? (
          <span className="text-emerald-300">
            <strong>Current flowing:</strong> The coil&apos;s magnetic field aligns the domains in the soft iron. Their combined fields massively amplify the electromagnet!
          </span>
        ) : (
          <span className="text-slate-400">
            <strong>Current off:</strong> Thermal vibration quickly scrambles soft-iron domains back into random directions, turning the magnetism off instantly.
          </span>
        )}
      </p>
    </div>
  );
}
