import { FieldMeasurement } from '../types';
import { Compass, Move, Zap } from 'lucide-react';

interface CompassProbeHudProps {
  measurement: FieldMeasurement | null;
  probePos: [number, number, number];
  onPosChange: (pos: [number, number, number]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CompassProbeHud({
  measurement,
  probePos,
  onPosChange,
  isOpen,
  onToggle,
}: CompassProbeHudProps) {
  if (!isOpen) {
    return (
      <button
        id="btn-open-compass-hud"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md text-xs font-semibold transition"
      >
        <Compass className="w-4 h-4 text-amber-400" />
        <span>3D Compass Probe</span>
      </button>
    );
  }

  const bMag = measurement ? (measurement.magnitude * 10).toFixed(2) : '0.00';
  const bx = measurement ? (measurement.bVector.x * 10).toFixed(2) : '0.00';
  const by = measurement ? (measurement.bVector.y * 10).toFixed(2) : '0.00';
  const bz = measurement ? (measurement.bVector.z * 10).toFixed(2) : '0.00';

  const quickPositions = [
    { label: 'Inside Core', pos: [0, 0, 0] as [number, number, number] },
    { label: 'Top / N-Pole', pos: [0, 2.2, 0] as [number, number, number] },
    { label: 'Side Return', pos: [2.5, 0, 0] as [number, number, number] },
    { label: 'Diagonal', pos: [1.8, 1.8, 1.8] as [number, number, number] },
  ];

  return (
    <div
      id="compass-probe-hud"
      className="fixed bottom-4 right-4 z-20 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-slate-200"
    >
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide text-slate-100 uppercase">Plotting Compass & Sensor</h3>
            <span className="text-[10px] text-slate-400">Magnetic Field Strength & Direction</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition"
        >
          Hide
        </button>
      </div>

      {/* Main Measurement Readout */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" /> Field Strength
          </span>
          <span className="text-lg font-bold font-mono text-sky-400 tracking-tight">
            {bMag} <span className="text-xs font-normal text-slate-400">units</span>
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight mt-1">
          The red tip of the compass needle points along the magnetic field line towards the South pole!
        </p>
      </div>

      {/* Quick Jump Positions */}
      <div className="mb-3">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
          Probe Placement Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPositions.map((item) => (
            <button
              key={item.label}
              onClick={() => onPosChange(item.pos)}
              className="px-2 py-1.5 text-[11px] bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 rounded-lg text-center transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate Sliders */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Move className="w-3 h-3 text-slate-500" /> Position (X, Y, Z)</span>
          <span className="font-mono text-slate-300">
            ({probePos[0].toFixed(1)}, {probePos[1].toFixed(1)}, {probePos[2].toFixed(1)})
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] text-slate-500 block text-center">X: {probePos[0].toFixed(1)}</label>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={probePos[0]}
              onChange={(e) => onPosChange([parseFloat(e.target.value), probePos[1], probePos[2]])}
              className="w-full accent-sky-400 h-1 bg-slate-800 rounded appearance-none"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 block text-center">Y: {probePos[1].toFixed(1)}</label>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={probePos[1]}
              onChange={(e) => onPosChange([probePos[0], parseFloat(e.target.value), probePos[2]])}
              className="w-full accent-emerald-400 h-1 bg-slate-800 rounded appearance-none"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 block text-center">Z: {probePos[2].toFixed(1)}</label>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={probePos[2]}
              onChange={(e) => onPosChange([probePos[0], probePos[1], parseFloat(e.target.value)])}
              className="w-full accent-amber-400 h-1 bg-slate-800 rounded appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
