import { useState } from 'react';
import { MotorCanvas } from '../MotorCanvas';
import { MotorConfig, MotorState } from '../../../types';
import { RefreshCw, CheckCircle2, ArrowRight, Gauge, Zap, Layers, Magnet, Sliders } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function MotorChallenge5Strengthen({ onComplete, isCompleted }: Props) {
  const [currentLevel, setCurrentLevel] = useState<'low' | 'med' | 'high'>('med');
  const [coilTurns, setCoilTurns] = useState<20 | 40 | 60>(40);
  const [magnetStrength, setMagnetStrength] = useState<'standard' | 'strong'>('standard');
  const [magnetGap, setMagnetGap] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [batteryReversed, setBatteryReversed] = useState<boolean>(false);
  const [relativeTurningEffect, setRelativeTurningEffect] = useState<number>(50);

  // Verification tracking
  const [testedReversed, setTestedReversed] = useState<boolean>(false);
  const [testedMaxPower, setTestedMaxPower] = useState<boolean>(false);
  const [summaryAns, setSummaryAns] = useState<string | null>(null);

  const currentVal = currentLevel === 'low' ? 2.0 : currentLevel === 'med' ? 4.0 : 6.0;

  const config: MotorConfig = {
    mode: 'motor',
    current: currentVal,
    switchClosed: true,
    batteryReversed: batteryReversed,
    magnetStrength: magnetStrength,
    magnetGap: magnetGap,
    coilTurns: coilTurns,
    hasCommutator: true,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: true,
    showSymbols: true,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 0.5,
    frozenAngle: null,
    isPlaying: true,
    highlightSides: true,
  };

  const handleStateUpdate = (state: MotorState) => {
    setRelativeTurningEffect(state.relativeTurningEffect);
    if (batteryReversed) setTestedReversed(true);
    if (currentLevel === 'high' && coilTurns === 60 && magnetStrength === 'strong' && magnetGap === 'narrow') {
      setTestedMaxPower(true);
    }
  };

  const isStep5Done = testedReversed && testedMaxPower && summaryAns === 'three_factors';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            5
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 5 — Reverse and Strengthen the Electric Motor
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep5Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep5Done ? 'Mastery Achieved' : 'Investigating Variables'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage with Relative Turning Effect Meter */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <MotorCanvas config={config} onStateUpdate={handleStateUpdate} height="100%" />

              {/* Turning Direction Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    batteryReversed ? 'bg-amber-400 animate-pulse' : 'bg-blue-400 animate-pulse'
                  }`}
                />
                <span>Rotation: {batteryReversed ? 'Counter-Clockwise (Reversed)' : 'Clockwise (Normal)'}</span>
              </div>

              {/* Turning Effect Live HUD Meter */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700 p-3 rounded-xl backdrop-blur-md shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-400" /> Relative Turning Effect (Torque)
                  </span>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {relativeTurningEffect}% Max
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400"
                    style={{ width: `${relativeTurningEffect}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick helper */}
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Scientific Metric: Relative Turning Moment τ = N · I · A · B</span>
              <span className="font-semibold text-slate-700">
                {testedReversed ? 'Tested Reverse ✓' : 'Try Reverse'} •{' '}
                {testedMaxPower ? 'Tested Max Torque ✓' : 'Try Max Settings'}
              </span>
            </div>
          </div>

          {/* Right: Full Interactive Laboratory Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Battery Polarity Switcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Battery Direction
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {batteryReversed ? 'REVERSED (-/+)' : 'NORMAL (+/-)'}
                </span>
              </div>
              <button
                onClick={() => setBatteryReversed(!batteryReversed)}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reverse Battery Polarity
              </button>
            </div>

            {/* 4 Variable Controls Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              {/* 1. Current */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Current (I)
                  </span>
                  <span className="font-mono text-blue-600">{currentVal.toFixed(1)} A</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'med', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCurrentLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                        currentLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Coil Turns */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" /> Coil Turns (N)
                  </span>
                  <span className="font-mono text-blue-600">{coilTurns} Turns</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {([20, 40, 60] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCoilTurns(t)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        coilTurns === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t} Turns
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Magnet Strength */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Magnet className="w-3.5 h-3.5 text-red-500" /> Magnet Strength
                  </span>
                  <span className="font-mono text-blue-600 capitalize">{magnetStrength}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['standard', 'strong'] as const).map((str) => (
                    <button
                      key={str}
                      onClick={() => setMagnetStrength(str)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                        magnetStrength === str
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {str}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Magnet Gap */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Magnet Pole Gap
                  </span>
                  <span className="font-mono text-blue-600 capitalize">{magnetGap}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['narrow', 'normal', 'wide'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setMagnetGap(g)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                        magnetGap === g
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scientific Check */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Summary: What 3 changes make an electric motor rotate with the greatest turning effect?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    id: 'three_factors',
                    label: 'More coil turns, higher electric current, and stronger magnets with a narrow gap.',
                  },
                  {
                    id: 'fewer_turns',
                    label: 'Fewer coil turns, lower current, and wider magnet gaps.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSummaryAns(opt.id)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      summaryAns === opt.id
                        ? summaryAns === 'three_factors'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-red-100 border-red-400 text-red-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {summaryAns === 'three_factors' && (
                <p className="text-xs text-emerald-700 font-medium">
                  ✓ Outstanding! The turning force increases with current ($I$), coil turns ($N$), and magnetic field strength ($B$).
                </p>
              )}
            </div>

            {/* Advance / Finish Button */}
            <button
              onClick={() => {
                if (isStep5Done) onComplete();
              }}
              disabled={!isStep5Done}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isStep5Done
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'All L4 Challenges Mastered ✓' : 'Complete Challenge 5 (Finish Lesson 4)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
