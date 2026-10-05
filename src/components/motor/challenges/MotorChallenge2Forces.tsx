import { useState } from 'react';
import { MotorCanvas } from '../MotorCanvas';
import { MotorConfig } from '../../../types';
import { CheckCircle2, ArrowRight, Eye, Sparkles, Orbit, Compass } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function MotorChallenge2Forces({ onComplete, isCompleted }: Props) {
  const [predLeft, setPredLeft] = useState<'up' | 'down' | null>(null);
  const [predRight, setPredRight] = useState<'up' | 'down' | null>(null);
  const [forcesRevealed, setForcesRevealed] = useState(false);
  const [symbolsRevealed, setSymbolsRevealed] = useState(false);
  const [hasRotatedCamera, setHasRotatedCamera] = useState(false);

  const config: MotorConfig = {
    mode: 'motor',
    current: 5.0,
    switchClosed: true,
    batteryReversed: false,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 40,
    hasCommutator: true,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: forcesRevealed,
    showSymbols: symbolsRevealed,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 1.0,
    frozenAngle: 45, // Frozen at 45 degrees
    isPlaying: false,
    highlightSides: true,
  };

  const isStep2Done = forcesRevealed && symbolsRevealed && predLeft === 'down' && predRight === 'up';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 2 — Where Are the Forces? (3D Vectors & 2D Symbols)
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep2Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep2Done ? 'Forces Understood' : 'Predicting Forces'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage with Frozen Coil at 45° */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner"
              onMouseDown={() => setHasRotatedCamera(true)}
            >
              <MotorCanvas config={config} height="100%" />

              {/* Status Pill */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Coil Frozen at 45° Orientation</span>
              </div>

              {/* 3D Orbit Tip Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <strong>Try rotating the 3D camera:</strong> Look down the axle to clearly see the two opposing force arrows!
                  </span>
                </div>
              </div>
            </div>

            {/* Wire side indicators */}
            <div className="mt-2 flex items-center justify-between text-xs px-1 text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Side A (Left Branch)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-cyan-600">
                <span className="w-3 h-3 rounded-full bg-cyan-500" /> Side B (Right Branch)
              </span>
            </div>
          </div>

          {/* Right: Step-by-Step Prediction & Symbol Introduction */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Step 1: Predict Force Directions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 1: Predict the Force on Each Side
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The permanent magnetic field points horizontally from North (Left) to South (Right). Current travels <strong>away from you along Side A</strong> and <strong>towards you along Side B</strong>.
              </p>

              {/* Side A Prediction */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-amber-800 block">1. Side A (Current going INTO screen):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPredLeft('up')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      predLeft === 'up'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Pushed UP ↑
                  </button>
                  <button
                    onClick={() => setPredLeft('down')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      predLeft === 'down'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Pushed DOWN ↓
                  </button>
                </div>
              </div>

              {/* Side B Prediction */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-cyan-800 block">2. Side B (Current coming OUT towards you):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPredRight('up')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      predRight === 'up'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Pushed UP ↑
                  </button>
                  <button
                    onClick={() => setPredRight('down')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      predRight === 'down'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Pushed DOWN ↓
                  </button>
                </div>
              </div>

              {/* Reveal Forces Button */}
              {predLeft && predRight && !forcesRevealed && (
                <button
                  onClick={() => setForcesRevealed(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Reveal 3D Force Vectors in Model
                </button>
              )}
            </div>

            {/* Step 2: 2D Symbols Introduction */}
            {forcesRevealed && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Step 2: 2D Diagram Symbols
                  </h3>
                  <button
                    onClick={() => setSymbolsRevealed(!symbolsRevealed)}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700"
                  >
                    {symbolsRevealed ? 'Hide Symbols' : 'Show • and × Symbols'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                      •
                    </span>
                    <div>
                      <strong className="text-slate-900">Dot (•)</strong>
                      <p className="text-[11px] text-slate-500">Coming towards you</p>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                      ×
                    </span>
                    <div>
                      <strong className="text-slate-900">Cross (×)</strong>
                      <p className="text-[11px] text-slate-500">Going away from you</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-800 leading-snug">
                  Because current travels in opposite directions on the two long sides of the loop, the magnetic forces act in opposite directions (one down, one up), producing a net <strong>turning torque</strong>!
                </p>
              </div>
            )}

            {/* Advance Button */}
            <button
              onClick={() => {
                if (isStep2Done) onComplete();
              }}
              disabled={!isStep2Done}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isStep2Done
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isCompleted ? 'Challenge Completed ✓' : 'Complete Challenge 2 & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
