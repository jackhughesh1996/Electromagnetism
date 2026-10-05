import { useState } from 'react';
import { MotorCanvas } from '../MotorCanvas';
import { MotorConfig, MotorState } from '../../../types';
import { CheckCircle2, ArrowRight, ToggleLeft, ToggleRight, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function MotorChallenge4Commutator({ onComplete, isCompleted }: Props) {
  const [hasCommutator, setHasCommutator] = useState<boolean>(false); // Starts with commutator disabled so students see the problem first!
  const [swappedMessage, setSwappedMessage] = useState<string>('');
  const [hasTestedDisabled, setHasTestedDisabled] = useState(false);
  const [hasTestedEnabled, setHasTestedEnabled] = useState(false);
  const [studentConclusion, setStudentConclusion] = useState<string | null>(null);

  const config: MotorConfig = {
    mode: 'motor',
    current: 5.0,
    switchClosed: true,
    batteryReversed: false,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 40,
    hasCommutator: hasCommutator,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: true,
    showSymbols: true,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 0.35, // Smooth slow-mo so brush reversals are easily watched
    frozenAngle: null,
    isPlaying: true,
    highlightSides: true,
  };

  const handleStateUpdate = (state: MotorState) => {
    if (!hasCommutator) {
      setHasTestedDisabled(true);
      if (Math.abs(state.angularVelocity) < 10 && Math.abs(state.angleDeg - 90) < 15) {
        setSwappedMessage('Without a commutator, the forces oppose rotation past 90° — the coil is stuck oscillating!');
      }
    } else {
      setHasTestedEnabled(true);
      if (state.commutatorSwapped) {
        setSwappedMessage('⚡ Brush swapped split-ring segment: Current through the coil has reversed to keep torque spinning the same way!');
      } else {
        setSwappedMessage('⚡ Normal contact: Sustained forward driving torque.');
      }
    }
  };

  const isStep4Done = hasTestedDisabled && hasTestedEnabled && studentConclusion === 'reverses_current';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            4
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 4 — The Split-Ring Commutator Challenge
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep4Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep4Done ? 'Commutator Mastered' : 'Testing Commutator'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage with Live Commutator Status Banner */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <MotorCanvas config={config} onStateUpdate={handleStateUpdate} height="100%" />

              {/* Status Pill */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    hasCommutator ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>Commutator: {hasCommutator ? 'ENABLED (Split Ring)' : 'DISABLED (Continuous Slip Ring)'}</span>
              </div>

              {/* Live Physics Notification Banner */}
              <div
                className={`absolute bottom-3 left-3 right-3 p-3 rounded-xl backdrop-blur-md border text-xs font-medium transition-all ${
                  hasCommutator
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {hasCommutator ? (
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span>
                    {swappedMessage ||
                      (hasCommutator
                        ? 'Split-ring commutator active: Watch the brushes change contact every 180°!'
                        : 'Commutator disabled: The coil cannot maintain continuous rotation.')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick helper */}
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Zoom in to inspect the rotating split ring at the front axle!</span>
              <span className="font-semibold text-slate-700">
                {hasTestedDisabled ? 'Tested Disabled ✓' : 'Test Disabled First'} •{' '}
                {hasTestedEnabled ? 'Tested Enabled ✓' : 'Test Enabled'}
              </span>
            </div>
          </div>

          {/* Right: Commutator Controls & Scientific Reasoning */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Big Toggle Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Commutator Switch
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    hasCommutator ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {hasCommutator ? 'SPLIT RING ACTIVE' : 'SPLIT RING DISABLED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHasCommutator(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !hasCommutator
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <ToggleLeft className="w-4 h-4" /> Disable Commutator
                </button>

                <button
                  onClick={() => setHasCommutator(true)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    hasCommutator
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <ToggleRight className="w-4 h-4" /> Enable Commutator
                </button>
              </div>
            </div>

            {/* Scientific Question */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Why is the split-ring commutator essential in a DC electric motor?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'reverses_current',
                    label:
                      'It reverses current in the coil every half-turn so forces always push in the direction of rotation.',
                  },
                  {
                    id: 'increase_voltage',
                    label: 'It doubles the voltage produced by the battery cells without adding more batteries.',
                  },
                  {
                    id: 'stops_sparking',
                    label: 'It permanently turns off the current whenever the motor gets too hot.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStudentConclusion(opt.id)}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      studentConclusion === opt.id
                        ? studentConclusion === 'reverses_current'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-red-100 border-red-400 text-red-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {studentConclusion === 'reverses_current' && (
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  ✓ Exactly right! Without the split-ring commutator, the coil would turn $90^\circ$ and then stop or bounce back. The commutator reverses the current every half-turn ($180^\circ$), ensuring sustained continuous rotation in one direction.
                </p>
              )}
            </div>

            {/* Advance Button */}
            <button
              onClick={() => {
                if (isStep4Done) onComplete();
              }}
              disabled={!isStep4Done}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isStep4Done
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isCompleted ? 'Challenge Completed ✓' : 'Complete Challenge 4 & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
