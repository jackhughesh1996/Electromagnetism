import { useState } from 'react';
import { MotorCanvas } from '../MotorCanvas';
import { MotorConfig, MotorState } from '../../../types';
import { Play, Pause, StepForward, Gauge, CheckCircle2, ArrowRight, RotateCw, Power } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function MotorChallenge3Rotation({ onComplete, isCompleted }: Props) {
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.25); // Starts in slow motion for clarity
  const [frozenAngle, setFrozenAngle] = useState<number | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [exploredAngles, setExploredAngles] = useState<Set<number>>(new Set());
  const [conceptAns, setConceptAns] = useState<string | null>(null);

  const config: MotorConfig = {
    mode: 'motor',
    current: isSwitchClosed ? 5.0 : 0,
    switchClosed: isSwitchClosed,
    batteryReversed: false,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 40,
    hasCommutator: true,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: true,
    showSymbols: true,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: speedMultiplier,
    frozenAngle: frozenAngle,
    isPlaying: isPlaying && isSwitchClosed,
    highlightSides: true,
  };

  const handleStep45 = () => {
    setIsPlaying(false);
    const nextAngle = Math.round(((currentAngle + 45) % 360) / 45) * 45;
    setFrozenAngle(nextAngle);
    setCurrentAngle(nextAngle);
    setExploredAngles((prev) => new Set([...prev, nextAngle]));
  };

  const handleStateUpdate = (state: MotorState) => {
    setCurrentAngle(Math.round(state.angleDeg));
    if (isSwitchClosed && isPlaying) {
      const snap = Math.round(state.angleDeg / 45) * 45;
      setExploredAngles((prev) => new Set([...prev, snap % 360]));
    }
  };

  const isStep3Done = isSwitchClosed && exploredAngles.size >= 4 && conceptAns === 'opposite_forces';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            3
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 3 — Make the Motor Turn (Step & Slow Motion Analysis)
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep3Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep3Done ? 'Rotation Mastered' : 'Observing Motion'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage with Playback Controls */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <MotorCanvas config={config} onStateUpdate={handleStateUpdate} height="100%" />

              {/* Status Pill */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSwitchClosed && isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>Coil Angle: {currentAngle}°</span>
                <span className="text-slate-400 text-[11px] font-mono">
                  {speedMultiplier === 0.25 ? '(Slow Motion 0.25×)' : '(Normal Speed 1.0×)'}
                </span>
              </div>

              {/* In-Canvas Playback Control Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700 p-2 rounded-xl backdrop-blur-md flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isSwitchClosed) setIsSwitchClosed(true);
                      setFrozenAngle(null);
                      setIsPlaying(!isPlaying);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isPlaying && isSwitchClosed
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isPlaying && isSwitchClosed ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Play
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStep45}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <StepForward className="w-3.5 h-3.5" /> Step 45°
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSpeedMultiplier(0.25)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      speedMultiplier === 0.25 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    0.25× Slow
                  </button>
                  <button
                    onClick={() => setSpeedMultiplier(1.0)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      speedMultiplier === 1.0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1.0× Normal
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Helper Bar */}
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Notice how force vectors remain visible and adapt at every angle!</span>
              <span className="font-semibold text-slate-700">Explored {exploredAngles.size}/4 Quadrants</span>
            </div>
          </div>

          {/* Right: Laboratory Controls & Guided Questions */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Knife Switch Controller */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Power Circuit
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSwitchClosed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {isSwitchClosed ? 'SWITCH CLOSED (5.0 A)' : 'SWITCH OPEN (0.0 A)'}
                </span>
              </div>

              <button
                onClick={() => {
                  const next = !isSwitchClosed;
                  setIsSwitchClosed(next);
                  if (next) {
                    setFrozenAngle(null);
                    setIsPlaying(true);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSwitchClosed
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                }`}
              >
                <Power className="w-4 h-4" />
                {isSwitchClosed ? 'Open Knife Switch (Stop Current)' : 'Close Knife Switch (Start Motor)'}
              </button>
            </div>

            {/* Scientific Explanation Question */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                How do interacting magnetic fields produce continuous rotation?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'opposite_forces',
                    label:
                      'Current produces magnetic forces in opposite directions on the two sides of the coil, creating a turning torque.',
                  },
                  {
                    id: 'friction',
                    label: 'The brushes rub against the axle so hard that mechanical friction spins the rotor.',
                  },
                  {
                    id: 'single_magnet',
                    label: 'Only the North permanent magnet pushes; the South magnet does not participate.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setConceptAns(opt.id)}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      conceptAns === opt.id
                        ? conceptAns === 'opposite_forces'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-red-100 border-red-400 text-red-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {conceptAns === 'opposite_forces' && (
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  ✓ Outstanding! The sequence is: <strong>Current → Magnetic Interaction → Opposite Forces on Each Side → Sustained Turning Effect</strong>.
                </p>
              )}
            </div>

            {/* Advance Button */}
            <button
              onClick={() => {
                if (isStep3Done) onComplete();
              }}
              disabled={!isStep3Done}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isStep3Done
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isCompleted ? 'Challenge Completed ✓' : 'Complete Challenge 3 & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
