import { useState } from 'react';
import { InductionCanvas } from '../InductionCanvas';
import { InductionMeter } from '../InductionMeter';
import { InductionConfig, InductionState } from '../../../types';
import { calculateInductionPhysics } from '../../../physics/inductionPhysics';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Square,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function InductionChallenge1ChangingField({ onComplete, isCompleted }: Props) {
  // Apparatus position & motion
  const [magnetPos, setMagnetPos] = useState<number>(3.6);
  const [coilPos, setCoilPos] = useState<number>(0.0);
  const [actionDone, setActionDone] = useState<{
    stationaryOutside: boolean;
    movingIn: boolean;
    stoppedInside: boolean;
    pulledOut: boolean;
    bothTogether: boolean;
  }>({
    stationaryOutside: true, // starts stationary
    movingIn: false,
    stoppedInside: false,
    pulledOut: false,
    bothTogether: false,
  });

  const [conclusion, setConclusion] = useState<string | null>(null);

  const config: InductionConfig = {
    magnetStrength: 'standard',
    magnetFlipped: false,
    coilTurns: 50,
    motionSpeed: 'medium',
    showFieldLines: true,
    showFieldDisc: true,
    showCurrentIndicator: true,
    showGraph: false,
    showMeter: true,
    autoMode: 'none',
  };

  const [state, setState] = useState<InductionState>(() =>
    calculateInductionPhysics(3.6, 0.0, 0.0, 0.0, config)
  );

  // Trigger movement steps
  const runAction = (actionType: 'move_in' | 'stop_inside' | 'pull_out' | 'move_both') => {
    if (actionType === 'move_in') {
      // Animate from 3.6 to 0.0 (inside coil)
      let currentX = 3.6;
      const targetX = 0.0;
      const vel = -4.5;
      const startT = performance.now();
      const interval = setInterval(() => {
        currentX += vel * 0.02;
        if (currentX <= targetX) {
          currentX = targetX;
          clearInterval(interval);
          setMagnetPos(0);
          setState(calculateInductionPhysics(0, 0, 0, 0, config));
          setActionDone((prev) => ({ ...prev, movingIn: true, stoppedInside: true }));
        } else {
          setMagnetPos(currentX);
          setState(calculateInductionPhysics(currentX, 0, vel, 0, config));
          setActionDone((prev) => ({ ...prev, movingIn: true }));
        }
      }, 20);
    } else if (actionType === 'stop_inside') {
      setMagnetPos(0);
      setCoilPos(0);
      setState(calculateInductionPhysics(0, 0, 0, 0, config));
      setActionDone((prev) => ({ ...prev, stoppedInside: true }));
    } else if (actionType === 'pull_out') {
      let currentX = magnetPos;
      const targetX = 3.6;
      const vel = 4.5;
      const interval = setInterval(() => {
        currentX += vel * 0.02;
        if (currentX >= targetX) {
          currentX = targetX;
          clearInterval(interval);
          setMagnetPos(targetX);
          setState(calculateInductionPhysics(targetX, 0, 0, 0, config));
          setActionDone((prev) => ({ ...prev, pulledOut: true }));
        } else {
          setMagnetPos(currentX);
          setState(calculateInductionPhysics(currentX, 0, vel, 0, config));
          setActionDone((prev) => ({ ...prev, pulledOut: true }));
        }
      }, 20);
    } else if (actionType === 'move_both') {
      // Move magnet and coil together at identical speed!
      let count = 0;
      const vel = 3.0;
      const interval = setInterval(() => {
        count++;
        const cX = Math.sin(count * 0.1) * 1.5;
        const mX = cX + 3.2; // Fixed separation of 3.2
        setCoilPos(cX);
        setMagnetPos(mX);
        setState(calculateInductionPhysics(mX, cX, vel, vel, config));
        if (count >= 50) {
          clearInterval(interval);
          setState(calculateInductionPhysics(mX, cX, 0, 0, config));
          setActionDone((prev) => ({ ...prev, bothTogether: true }));
        }
      }, 20);
    }
  };

  const handleSelectConclusion = (choice: string) => {
    setConclusion(choice);
    if (choice === 'changing_field') {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Challenge Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            1
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Challenge 1 — When Does the Coil Produce Current?
            </h2>
            <p className="text-xs text-slate-400">
              Confronting the core misconception: Does a stationary magnet produce electricity?
            </p>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed!</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Apparatus & Live Meter */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <InductionCanvas
              config={config}
              magnetPos={magnetPos}
              coilPos={coilPos}
              inductionState={state}
            />

            {/* Live Center-Zero Meter Overlay */}
            <div className="absolute top-3 right-3 z-10 scale-90 sm:scale-100 origin-top-right">
              <InductionMeter deflection={state.meterDeflection} value={state.inducedCurrent} size="sm" />
            </div>

            {/* Current Flow Alert Pill */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 shadow">
              <span>
                <strong>Meter Status:</strong>{' '}
                {Math.abs(state.inducedCurrent) > 1.5 ? (
                  <span className="text-emerald-400 font-bold">
                    ⚡ Deflecting {state.currentDirectionDescriptor === '←' ? 'Left (←)' : 'Right (→)'}
                  </span>
                ) : (
                  <span className="text-slate-400">Zero (At Rest 0)</span>
                )}
              </span>
            </div>
          </div>

          {/* Interactive Test Action Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1">Perform Test:</span>
            <button
              onClick={() => runAction('move_in')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>A. Push Magnet Into Coil</span>
            </button>
            <button
              onClick={() => runAction('stop_inside')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs"
            >
              <Square className="w-3.5 h-3.5" />
              <span>B. Stop Magnet Inside</span>
            </button>
            <button
              onClick={() => runAction('pull_out')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
            >
              <span>C. Pull Magnet Out</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => runAction('move_both')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-xs"
            >
              <span>D. Move Both Together</span>
            </button>
          </div>
        </div>

        {/* Right: Observation Table & Scientific Deduction */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Observation Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Observation Record
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-1">Action</th>
                  <th className="py-1">Field Changing?</th>
                  <th className="py-1">Current?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                <tr>
                  <td className="py-1.5">Magnet stationary outside</td>
                  <td className="py-1.5 text-slate-500">No</td>
                  <td className="py-1.5 text-slate-400 font-bold">0 (None)</td>
                </tr>
                <tr className={actionDone.movingIn ? 'bg-sky-50' : ''}>
                  <td className="py-1.5">Push magnet into coil</td>
                  <td className="py-1.5 text-sky-600 font-bold">Yes (Increasing)</td>
                  <td className="py-1.5 text-emerald-600 font-bold">⚡ Yes</td>
                </tr>
                <tr className={actionDone.stoppedInside ? 'bg-amber-50' : ''}>
                  <td className="py-1.5">Magnet stopped inside coil</td>
                  <td className="py-1.5 text-slate-500">No (Constant)</td>
                  <td className="py-1.5 text-rose-600 font-bold">0 (Drops to Zero!)</td>
                </tr>
                <tr className={actionDone.pulledOut ? 'bg-sky-50' : ''}>
                  <td className="py-1.5">Pull magnet out of coil</td>
                  <td className="py-1.5 text-sky-600 font-bold">Yes (Decreasing)</td>
                  <td className="py-1.5 text-emerald-600 font-bold">⚡ Yes (Reversed)</td>
                </tr>
                <tr className={actionDone.bothTogether ? 'bg-purple-50' : ''}>
                  <td className="py-1.5">Move both together at same speed</td>
                  <td className="py-1.5 text-slate-500">No (Distance constant)</td>
                  <td className="py-1.5 text-purple-700 font-bold">0 (None)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Conclusion Question */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              What must happen for electricity to be produced?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleSelectConclusion('inside_always')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusion === 'inside_always'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                A magnet resting inside a coil produces a steady current.
              </button>

              <button
                onClick={() => handleSelectConclusion('changing_field')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusion === 'changing_field'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                The magnetic field through the coil must be actively changing.
              </button>

              <button
                onClick={() => handleSelectConclusion('move_anywhere')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusion === 'move_anywhere'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                As long as the magnet moves through space (even if the coil moves with it), current flows.
              </button>
            </div>

            {/* Explanation Feedback */}
            {conclusion === 'inside_always' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Notice step B! When the magnet stops inside the coil, the meter immediately drops to zero. A static magnetic field does not produce electricity.
                </span>
              </div>
            )}

            {conclusion === 'move_anywhere' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Test action D! When the magnet and coil move together at the same speed, their separation does not change, so no current is induced.
                </span>
              </div>
            )}

            {conclusion === 'changing_field' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>Excellent!</strong> Current is induced only while there is relative motion that changes the magnetic field through the coil. When motion stops, current stops immediately!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
