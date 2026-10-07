import { useState, useEffect, useRef } from 'react';
import { InductionCanvas } from '../InductionCanvas';
import { InductionMeter } from '../InductionMeter';
import { InductionGraph } from '../InductionGraph';
import { InductionConfig, InductionState } from '../../../types';
import { calculateInductionPhysics } from '../../../physics/inductionPhysics';
import {
  CheckCircle2,
  Play,
  Square,
  RotateCcw,
  HelpCircle,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function InductionChallenge4Signal({ onComplete, isCompleted }: Props) {
  const [motionMode, setMotionMode] = useState<'stopped' | 'slow_auto' | 'fast_auto'>('stopped');
  const [magnetPos, setMagnetPos] = useState(3.6);
  const [signalHistory, setSignalHistory] = useState<number[]>(() => new Array(160).fill(0));

  // Student interpretation questions
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);

  const phaseRef = useRef<number>(0);
  const magnetPosRef = useRef<number>(3.6);
  const velRef = useRef<number>(0);

  const config: InductionConfig = {
    magnetStrength: 'standard',
    magnetFlipped: false,
    coilTurns: 50,
    motionSpeed: motionMode === 'fast_auto' ? 'fast' : 'slow',
    showFieldLines: true,
    showFieldDisc: true,
    showCurrentIndicator: true,
    showGraph: true,
    showMeter: true,
    autoMode: 'none',
  };

  const [state, setState] = useState<InductionState>(() =>
    calculateInductionPhysics(3.6, 0.0, 0.0, 0.0, config)
  );

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let tickCount = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let v = 0;
      if (motionMode === 'slow_auto') {
        phaseRef.current += dt * 2.2;
        const prevP = magnetPosRef.current;
        const newP = 1.3 + Math.cos(phaseRef.current) * 2.3;
        v = (newP - prevP) / dt;
        magnetPosRef.current = newP;
      } else if (motionMode === 'fast_auto') {
        phaseRef.current += dt * 5.2;
        const prevP = magnetPosRef.current;
        const newP = 1.3 + Math.cos(phaseRef.current) * 2.3;
        v = (newP - prevP) / dt;
        magnetPosRef.current = newP;
      } else {
        v = 0;
      }
      velRef.current = v;

      const curState = calculateInductionPhysics(magnetPosRef.current, 0, v, 0, config);

      tickCount++;
      if (tickCount % 2 === 0) {
        setMagnetPos(magnetPosRef.current);
        setState(curState);
        setSignalHistory((prev) => [...prev.slice(1), curState.inducedCurrent]);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [motionMode]);

  const checkCompletion = (a1 = q1, a2 = q2, a3 = q3) => {
    if (a1 === 'zero' && a2 === 'larger' && a3 === 'changes_sign') {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            4
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Challenge 4 — Turn Motion into an Electrical Signal
            </h2>
            <p className="text-xs text-slate-400">
              Observe how back-and-forth movement creates an alternating wave on the oscilloscope.
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

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Stage & Prominent Oscilloscope Graph */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative w-full h-[320px] sm:h-[350px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <InductionCanvas
              config={config}
              magnetPos={magnetPos}
              coilPos={0}
              inductionState={state}
            />

            {/* Meter in top corner */}
            <div className="absolute top-3 right-3 z-10 scale-90 origin-top-right">
              <InductionMeter deflection={state.meterDeflection} value={state.inducedCurrent} size="sm" />
            </div>
          </div>

          {/* Prominent Live Signal Graph */}
          <InductionGraph history={signalHistory} height={120} />

          {/* Motion Modes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-600 mr-1">Signal Generator:</span>
              <button
                onClick={() => setMotionMode('slow_auto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  motionMode === 'slow_auto'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Slow Alternating Motion</span>
              </button>

              <button
                onClick={() => setMotionMode('fast_auto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  motionMode === 'fast_auto'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Fast Alternating Motion</span>
              </button>

              <button
                onClick={() => setMotionMode('stopped')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  motionMode === 'stopped'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Pause Motion</span>
              </button>
            </div>

            <button
              onClick={() => setSignalHistory(new Array(160).fill(0))}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Waveform</span>
            </button>
          </div>
        </div>

        {/* Right: Waveform Interpretation Questions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Understanding the Waveform
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a magnet oscillates back and forth continuously through a coil, the induced electrical current alternates between positive (+) and negative (−), producing an <strong>alternating electrical signal</strong>.
            </p>
          </div>

          {/* Q1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">
              1. What happens to the electrical signal when the magnet pauses or stops moving?
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setQ1('zero');
                  checkCompletion('zero', q2, q3);
                }}
                className={`p-2 rounded-lg border font-bold ${
                  q1 === 'zero'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                The signal returns to zero
              </button>
              <button
                onClick={() => setQ1('freezes')}
                className={`p-2 rounded-lg border ${
                  q1 === 'freezes'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                The signal stays at its peak
              </button>
            </div>
          </div>

          {/* Q2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">
              2. What happens to the peak height (amplitude) when you switch from Slow to Fast motion?
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setQ2('larger');
                  checkCompletion(q1, 'larger', q3);
                }}
                className={`p-2 rounded-lg border font-bold ${
                  q2 === 'larger'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Peak height gets visibly larger
              </button>
              <button
                onClick={() => setQ2('same')}
                className={`p-2 rounded-lg border ${
                  q2 === 'same'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Peak height stays unchanged
              </button>
            </div>
          </div>

          {/* Q3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">
              3. When the magnet changes direction (moving in vs moving out), what happens on the graph?
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setQ3('changes_sign');
                  checkCompletion(q1, q2, 'changes_sign');
                }}
                className={`p-2 rounded-lg border font-bold ${
                  q3 === 'changes_sign'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                The trace flips across zero (+ to −)
              </button>
              <button
                onClick={() => setQ3('disappears')}
                className={`p-2 rounded-lg border ${
                  q3 === 'disappears'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                The trace stops completely
              </button>
            </div>
          </div>

          {q1 === 'zero' && q2 === 'larger' && q3 === 'changes_sign' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong>Waveform decoded!</strong> Movement produces a signal, faster movement produces higher peaks, and back-and-forth movement produces an alternating waveform!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
