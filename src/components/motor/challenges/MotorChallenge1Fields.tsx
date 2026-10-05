import { useState } from 'react';
import { MotorCanvas } from '../MotorCanvas';
import { MotorConfig } from '../../../types';
import { CheckCircle2, ArrowRight, Eye, RefreshCw, Zap, Layers, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function MotorChallenge1Fields({ onComplete, isCompleted }: Props) {
  const [subTab, setSubTab] = useState<'wire' | 'fields'>('wire');
  const [wireCurrent, setWireCurrent] = useState<number>(4.0);
  const [wireBatteryReversed, setWireBatteryReversed] = useState(false);
  const [fieldViewMode, setFieldViewMode] = useState<'apparatus' | 'fields'>('fields');
  const [showPermanent, setShowPermanent] = useState(true);
  const [showCoil, setShowCoil] = useState(true);

  // Student question answers
  const [ans1, setAns1] = useState<string | null>(null);
  const [ans2, setAns2] = useState<string | null>(null);

  const wireConfig: MotorConfig = {
    mode: 'single_wire',
    current: wireCurrent,
    switchClosed: true,
    batteryReversed: wireBatteryReversed,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 20,
    hasCommutator: true,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: true,
    showSymbols: false,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 1.0,
    frozenAngle: 0,
    isPlaying: false,
  };

  const fieldsConfig: MotorConfig = {
    mode: 'motor',
    current: 4.0,
    switchClosed: true,
    batteryReversed: false,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 40,
    hasCommutator: true,
    showPermanentField: showPermanent,
    showCoilField: showCoil,
    showForceArrows: false,
    showSymbols: false,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 0.25,
    frozenAngle: 30,
    isPlaying: false,
    viewMode: fieldViewMode,
  };

  const isStep1Done = ans1 === 'reverses' && ans2 === 'two_fields';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 1 — The Motor Effect & Two Magnetic Fields
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep1Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep1Done ? 'Challenge Complete' : 'In Progress'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Sub-mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setSubTab('wire')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'wire'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Part A: Force on a Single Wire
          </button>
          <button
            onClick={() => setSubTab('fields')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'fields'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Part B: The Two Interacting Fields
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <MotorCanvas config={subTab === 'wire' ? wireConfig : fieldsConfig} height="100%" />

              {/* View Overlay Controls */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md">
                {subTab === 'wire' ? (
                  <span>Motor Effect on Straight Conductor</span>
                ) : (
                  <span>Coil & Permanent Magnet Fields</span>
                )}
              </div>

              {subTab === 'fields' && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl backdrop-blur-md text-xs">
                  <button
                    onClick={() => setFieldViewMode(fieldViewMode === 'fields' ? 'apparatus' : 'fields')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                      fieldViewMode === 'fields'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {fieldViewMode === 'fields' ? 'Field View' : 'Apparatus View'}
                  </button>
                  {fieldViewMode === 'fields' && (
                    <>
                      <button
                        onClick={() => setShowPermanent(!showPermanent)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                          showPermanent ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400'
                        }`}
                      >
                        Permanent (N→S)
                      </button>
                      <button
                        onClick={() => setShowCoil(!showCoil)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                          showCoil ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'
                        }`}
                      >
                        Coil Field
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Helper Bar */}
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Left-click + drag to orbit in 3D • Scroll to zoom</span>
              <span className="font-medium text-slate-600">Red = North Pole • Blue = South Pole</span>
            </div>
          </div>

          {/* Right: Scientific Exploration Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {subTab === 'wire' ? (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Single Wire Controls
                    </span>
                    <button
                      onClick={() => setWireBatteryReversed(!wireBatteryReversed)}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" /> Reverse Battery Polarity
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When a wire carrying electric current passes through a magnetic field, the magnetic field around the wire interacts with the permanent magnetic field, creating a physical <strong>mechanical force (green arrow)</strong>.
                  </p>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Question 1: What happens to the magnetic force arrow when you reverse the current direction?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'reverses', label: 'The force arrow reverses direction (swaps up/down)' },
                      { id: 'same', label: 'The force arrow stays pointing in the exact same direction' },
                      { id: 'zero', label: 'The force completely disappears' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAns1(opt.id)}
                        className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          ans1 === opt.id
                            ? ans1 === 'reverses'
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-red-100 border-red-400 text-red-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {ans1 === 'reverses' && (
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ Correct! Reversing the current direction reverses the magnetic field around the wire, flipping the resulting force vector.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    The 2 Magnetic Fields in a Motor
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong className="text-sky-400">1. Permanent Field:</strong> Runs horizontally across the gap from North (Red, left) to South (Blue, right).
                    </li>
                    <li>
                      <strong className="text-amber-400">2. Coil Field:</strong> Current in the rectangular loop creates an electromagnet field that opposes or attracts the permanent poles!
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Question 2: What produces the turning force in an electric motor?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'two_fields',
                        label: 'Interaction between the permanent magnetic field and the coil’s magnetic field',
                      },
                      { id: 'gravity', label: 'Gravity pulling down on the heavy copper wire' },
                      { id: 'voltage', label: 'Static electric charges pushing electrons into the air' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAns2(opt.id)}
                        className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          ans2 === opt.id
                            ? ans2 === 'two_fields'
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-red-100 border-red-400 text-red-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {ans2 === 'two_fields' && (
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ Exactly! An electric motor is fundamentally two interacting magnetic fields: a permanent magnet field and a current-carrying coil electromagnet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Complete & Advance Button */}
            <button
              onClick={() => {
                if (isStep1Done) {
                  onComplete();
                }
              }}
              disabled={!isStep1Done}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isStep1Done
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isCompleted ? 'Challenge Completed ✓' : 'Complete Challenge 1 & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
