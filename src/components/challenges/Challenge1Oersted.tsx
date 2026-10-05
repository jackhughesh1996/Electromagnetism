import { useState } from 'react';
import { ThreeCanvas } from '../ThreeCanvas';
import { SimulationConfig } from '../../types';
import { CheckCircle2, RotateCw, Zap, ArrowRight, Eye, AlertCircle, RefreshCcw, Battery } from 'lucide-react';

interface Challenge1Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function Challenge1Oersted({ onComplete, isCompleted }: Challenge1Props) {
  const [pred1, setPred1] = useState<'deflect' | 'spin' | 'same' | null>(null);
  const [pred2, setPred2] = useState<'opposite' | 'same' | 'spin' | null>(null);
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [isBatteryReversed, setIsBatteryReversed] = useState(false);
  const [particleType, setParticleType] = useState<'electrons' | 'conventional'>('electrons');
  const [hasObserved1, setHasObserved1] = useState(false);
  const [hasObserved2, setHasObserved2] = useState(false);

  // 3D scene config for straight wire
  const currentVal = !isSwitchClosed ? 0 : isBatteryReversed ? -5.0 : 5.0;

  const config: SimulationConfig = {
    mode: 'wire',
    current: currentVal,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: 12,
    hasIronCore: false,
    ironCorePermeability: 80,
    fieldLinesCount: 14,
    showFieldLines: isSwitchClosed,
    showFilingsPlane: false,
    filingsPlaneAxis: 'xz',
    filingsPlaneOffset: 0,
    filingsDensity: 24,
    showCompassProbe: true,
    probePosition: [1.4, 0, 0],
    showCurrentParticles: true,
    showRightHandRule: false,
    showPoles: false,
    fieldLineSpeed: 1.0,
    sliceCutaway: false,
    switchClosed: isSwitchClosed,
    showCircuit: true,
    particleType: particleType,
  };

  const handleSwitchToggle = () => {
    const next = !isSwitchClosed;
    setIsSwitchClosed(next);
    if (next && !hasObserved1) {
      setHasObserved1(true);
    }
  };

  const handleReverseBattery = () => {
    if (!isSwitchClosed) {
      setIsSwitchClosed(true);
    }
    setIsBatteryReversed((prev) => !prev);
    if (!hasObserved2) {
      setHasObserved2(true);
    }
  };

  const isStep1Done = hasObserved1 && hasObserved2;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 1 — Oersted&apos;s Evidence
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep1Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : hasObserved1
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep1Done
            ? 'Evidence Collected'
            : hasObserved1
            ? 'Observe Reversal Next'
            : pred1
            ? 'Prediction Saved'
            : 'Predict First'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Instruction Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-slate-800 text-sm">
          <strong>Question:</strong> What will a magnetic plotting compass needle do when electric current flows through a straight wire directly beside or above it?
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <ThreeCanvas
                config={config}
                onToggleSwitch={handleSwitchToggle}
                onToggleBatteryDirection={handleReverseBattery}
              />

              {/* 3D Interaction Badge & Camera Hint */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow">
                <span className="font-semibold text-sky-400">3D Interactive Stage:</span> Drag to orbit • Scroll to zoom
              </div>

              {/* Compass Needle Status Callout at bottom */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-300 shadow">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>
                    <strong>Compass Needle:</strong>{' '}
                    {!isSwitchClosed
                      ? 'Resting in arbitrary direction (no current)'
                      : isBatteryReversed
                      ? 'Deflected Southwards (−Z direction)'
                      : 'Deflected Northwards (+Z direction)'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-400">
                  {isSwitchClosed ? `${Math.abs(currentVal).toFixed(1)} A` : '0.0 A'}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-slate-900 rounded-lg text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-amber-600" /> Translucent Copper Wire
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" /> Electron Flow (e⁻)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky-400" /> Circular B-Field
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Red = Needle North
              </span>
            </div>
          </div>

          {/* Right: Interactive Pedagogy & Circuit Controls Panel */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Dedicated Lab Circuit & Electron Flow Controls (Relocated from 3D View) */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-md text-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Battery className="w-4 h-4 text-amber-400" />
                  <span>Lab Circuit & Electron Flow</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                    isSwitchClosed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isSwitchClosed ? '⚡ CLOSED (5.0 A)' : '⏹ OPEN (0.0 A)'}
                </span>
              </div>

              {/* Knife Switch Blade Button */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300 font-medium">Knife Switch Blade:</span>
                <button
                  type="button"
                  onClick={handleSwitchToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition shadow ${
                    isSwitchClosed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  {isSwitchClosed ? 'Open Switch (Stop I)' : 'Close Switch (Start I)'}
                </button>
              </div>

              {/* Battery Terminals & Polarity */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="font-medium">Terminals:</span>
                  <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${!isBatteryReversed ? 'bg-rose-900/50 text-rose-300' : 'bg-blue-900/50 text-blue-300'}`}>
                    {!isBatteryReversed ? '(+) Top • (−) Btm' : '(−) Top • (+) Btm'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReverseBattery}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <RotateCw className="w-3 h-3 text-sky-400" />
                  <span>Reverse (+ / −)</span>
                </button>
              </div>

              {/* Particle Type Toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      particleType === 'electrons' ? 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-medium">Particle Mode:</span>
                  <span className="font-mono text-[11px] text-slate-200">
                    {particleType === 'electrons' ? 'Electrons (e⁻)' : 'Conventional (I)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setParticleType((p) => (p === 'electrons' ? 'conventional' : 'electrons'))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700/60 border border-slate-700 text-[11px] font-mono transition"
                >
                  {particleType === 'electrons' ? 'Switch to I' : 'Switch to e⁻'}
                </button>
              </div>

              {/* Live Status Description */}
              <p className="text-[11px] text-slate-400 leading-tight pt-1.5 border-t border-slate-800/80">
                {isSwitchClosed
                  ? particleType === 'electrons'
                    ? '⚛ Free conduction electrons drift smoothly through the translucent wire from negative to positive terminal.'
                    : '⚡ Conventional current flows from positive to negative terminal.'
                  : '⏹ Circuit is open: conduction electrons vibrate at room temperature without net flow.'}
              </p>
            </div>
            {/* Prediction 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
                Prediction 1: When the switch is closed, the compass needle will...
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'deflect', label: 'Deflect to a new steady angle' },
                  { key: 'spin', label: 'Spin continuously around' },
                  { key: 'same', label: 'Not change at all' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setPred1(opt.key as any);
                      if (isSwitchClosed) {
                        setHasObserved1(true);
                      }
                    }}
                    className={`text-left text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg border transition-all ${
                      pred1 === opt.key
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-300'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {pred1 && (
                <div className="mt-3 text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Prediction saved! Observe the needle deflection and electron drift in the 3D stage.</span>
                </div>
              )}

              {/* Close / Open switch button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleSwitchToggle}
                  className={`w-full font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                    isSwitchClosed
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  {isSwitchClosed ? 'OPEN KNIFE SWITCH (STOP CURRENT)' : 'CLOSE KNIFE SWITCH (START CURRENT)'}
                </button>
              </div>

              {/* Observation 1 Feedback */}
              {hasObserved1 && (
                <div className="mt-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-2.5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Observation 1:
                  </div>
                  <p>
                    The compass needle deflected cleanly to point along the circular magnetic field line produced by the current!
                    {pred1 === 'deflect'
                      ? ' Your prediction matched the observation.'
                      : ' Your prediction differed from the observation — this is valuable evidence to update your mental model.'}
                  </p>
                </div>
              )}
            </div>

            {/* Prediction 2: Battery Reversal (Unlocked after Obs 1) */}
            {hasObserved1 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-300">
                <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
                  Prediction 2: If the battery terminals are reversed, the compass will...
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: 'opposite', label: 'Deflect in the opposite direction' },
                    { key: 'same', label: 'Stay pointing the same way' },
                    { key: 'spin', label: 'Spin continuously' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPred2(opt.key as any)}
                      className={`text-left text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg border transition-all ${
                        pred2 === opt.key
                          ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-300'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {pred2 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleReverseBattery}
                      className="w-full font-bold text-sm px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      REVERSE BATTERY TERMINALS
                    </button>
                  </div>
                )}

                {hasObserved2 && (
                  <div className="mt-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-2.5 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Observation 2:
                    </div>
                    <p>
                      The compass needle flipped 180° to point the opposite way!
                      {pred2 === 'opposite'
                        ? ' Your prediction matched the observation.'
                        : ' Your prediction differed — reversing the current reverses the direction of the magnetic field circles.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Explanation Note */}
            {isStep1Done && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-950 space-y-1.5">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-600" />
                  What the Evidence Shows (Hans Christian Ørsted, 1820):
                </div>
                <p className="leading-relaxed">
                  1. Electric current flowing through a straight wire produces an invisible <strong>circular magnetic field</strong>.
                </p>
                <p className="leading-relaxed">
                  2. At any point, a compass needle aligns with the <strong>local tangent</strong> of this field.
                </p>
                <p className="leading-relaxed">
                  3. Reversing the battery flips the direction of current, which flips the direction of the magnetic field circles!
                </p>
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!isStep1Done}
                onClick={onComplete}
                className={`w-full font-bold text-sm px-5 py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                  isStep1Done
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE TO CHALLENGE 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
