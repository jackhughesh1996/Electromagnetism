import { useState, useRef } from 'react';
import { InductionCanvas } from '../InductionCanvas';
import { InductionMeter } from '../InductionMeter';
import { InductionConfig, InductionState } from '../../../types';
import { calculateInductionPhysics } from '../../../physics/inductionPhysics';
import {
  CheckCircle2,
  Gauge,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function InductionChallenge3Strength({ onComplete, isCompleted }: Props) {
  // Fair test active sub-investigation
  const [activeTest, setActiveTest] = useState<'speed' | 'magnet' | 'turns'>('speed');

  // Independent variables
  const [speedChoice, setSpeedChoice] = useState<'slow' | 'medium' | 'fast'>('slow');
  const [magnetChoice, setMagnetChoice] = useState<'standard' | 'strong'>('standard');
  const [turnsChoice, setTurnsChoice] = useState<25 | 50 | 100>(25);

  // Peak recordings for tests
  const [peakResults, setPeakResults] = useState<{
    speed: { slow?: number; medium?: number; fast?: number };
    magnet: { standard?: number; strong?: number };
    turns: { 25?: number; 50?: number; 100?: number };
  }>({
    speed: {},
    magnet: {},
    turns: {},
  });

  const [magnetPos, setMagnetPos] = useState(3.6);
  const [peakEffect, setPeakEffect] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Student deduction answers
  const [ansSpeed, setAnsSpeed] = useState<string | null>(null);
  const [ansMagnet, setAnsMagnet] = useState<string | null>(null);
  const [ansTurns, setAnsTurns] = useState<string | null>(null);

  // Config based on current test
  const currentSpeed = activeTest === 'speed' ? speedChoice : 'medium';
  const currentMagnet = activeTest === 'magnet' ? magnetChoice : 'standard';
  const currentTurns = activeTest === 'turns' ? turnsChoice : 50;

  const config: InductionConfig = {
    magnetStrength: currentMagnet,
    magnetFlipped: false,
    coilTurns: currentTurns,
    motionSpeed: currentSpeed,
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

  const runFairTest = () => {
    if (isRunning) return;
    setIsRunning(true);
    setMagnetPos(3.6);
    let currentX = 3.6;
    const targetX = 0.0;

    const velMagnitude = currentSpeed === 'slow' ? 2.5 : currentSpeed === 'fast' ? 7.0 : 4.5;
    const vel = -velMagnitude;

    let maxDeflection = 0;

    const interval = setInterval(() => {
      currentX += vel * 0.02;
      if (currentX <= targetX) {
        currentX = targetX;
        clearInterval(interval);
        setMagnetPos(targetX);
        setIsRunning(false);
        setState(calculateInductionPhysics(targetX, 0, 0, 0, config));

        // Record peak result
        const peakRecorded = Math.round(maxDeflection);
        setPeakEffect(peakRecorded);

        setPeakResults((prev) => {
          if (activeTest === 'speed') {
            return { ...prev, speed: { ...prev.speed, [speedChoice]: peakRecorded } };
          } else if (activeTest === 'magnet') {
            return { ...prev, magnet: { ...prev.magnet, [magnetChoice]: peakRecorded } };
          } else {
            return { ...prev, turns: { ...prev.turns, [turnsChoice]: peakRecorded } };
          }
        });
      } else {
        setMagnetPos(currentX);
        const curState = calculateInductionPhysics(currentX, 0, vel, 0, config);
        setState(curState);
        if (Math.abs(curState.inducedCurrent) > maxDeflection) {
          maxDeflection = Math.abs(curState.inducedCurrent);
        }
      }
    }, 20);
  };

  // Check completion
  const checkCompletion = (s = ansSpeed, m = ansMagnet, t = ansTurns) => {
    if (s === 'larger' && m === 'larger' && t === 'larger') {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            3
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Challenge 3 — Make the Induced Effect Stronger
            </h2>
            <p className="text-xs text-slate-400">
              Conduct fair tests on motion speed, magnet strength, and coil turns.
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
        {/* Left: 3D Apparatus & Test Controls */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Sub-tab Fair Test Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTest('speed')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTest === 'speed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test A: Speed
            </button>
            <button
              onClick={() => setActiveTest('magnet')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTest === 'magnet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test B: Magnet Strength
            </button>
            <button
              onClick={() => setActiveTest('turns')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTest === 'turns' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test C: Coil Turns
            </button>
          </div>

          <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <InductionCanvas
              config={config}
              magnetPos={magnetPos}
              coilPos={0}
              inductionState={state}
            />

            {/* Meter overlay */}
            <div className="absolute top-3 right-3 z-10 scale-90 sm:scale-100 origin-top-right">
              <InductionMeter deflection={state.meterDeflection} value={state.inducedCurrent} size="sm" />
            </div>

            {/* Peak relative induced effect overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-300 shadow">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Peak Relative Induced Effect</div>
              <div className="text-xl font-black text-sky-400 font-mono mt-0.5">
                {peakEffect}%
              </div>
            </div>
          </div>

          {/* Test Setup Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {activeTest === 'speed' && 'Independent Variable: Motion Speed'}
                {activeTest === 'magnet' && 'Independent Variable: Magnet Strength'}
                {activeTest === 'turns' && 'Independent Variable: Number of Coil Turns'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">All other variables held constant</span>
            </div>

            {/* Variable Buttons */}
            {activeTest === 'speed' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Speed:</span>
                {(['slow', 'medium', 'fast'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedChoice(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition ${
                      speedChoice === s
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {activeTest === 'magnet' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Magnet:</span>
                {(['standard', 'strong'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMagnetChoice(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition ${
                      magnetChoice === m
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {activeTest === 'turns' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Turns:</span>
                {([25, 50, 100] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTurnsChoice(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      turnsChoice === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t} turns
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={runFairTest}
              disabled={isRunning}
              className={`w-full py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Fair Test & Measure Peak Effect</span>
            </button>
          </div>
        </div>

        {/* Right: Automated Results Table & Final Conclusions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Results Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fair Test Measurements
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Test A: Motion Speed</div>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                  <span>Slow: <strong>{peakResults.speed.slow ? `${peakResults.speed.slow}%` : '—'}</strong></span>
                  <span>Medium: <strong>{peakResults.speed.medium ? `${peakResults.speed.medium}%` : '—'}</strong></span>
                  <span>Fast: <strong>{peakResults.speed.fast ? `${peakResults.speed.fast}%` : '—'}</strong></span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Test B: Magnet Strength</div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                  <span>Standard: <strong>{peakResults.magnet.standard ? `${peakResults.magnet.standard}%` : '—'}</strong></span>
                  <span>Strong: <strong>{peakResults.magnet.strong ? `${peakResults.magnet.strong}%` : '—'}</strong></span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Test C: Coil Turns</div>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                  <span>25 turns: <strong>{peakResults.turns[25] ? `${peakResults.turns[25]}%` : '—'}</strong></span>
                  <span>50 turns: <strong>{peakResults.turns[50] ? `${peakResults.turns[50]}%` : '—'}</strong></span>
                  <span>100 turns: <strong>{peakResults.turns[100] ? `${peakResults.turns[100]}%` : '—'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Questions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Draw Your Scientific Conclusions
            </h4>

            {/* Q1: Speed */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                1. Faster motion produces:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setAnsSpeed('larger');
                    checkCompletion('larger', ansMagnet, ansTurns);
                  }}
                  className={`p-2 rounded-lg border font-bold ${
                    ansSpeed === 'larger'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Larger induced effect
                </button>
                <button
                  onClick={() => setAnsSpeed('smaller')}
                  className={`p-2 rounded-lg border ${
                    ansSpeed === 'smaller'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Smaller induced effect
                </button>
              </div>
            </div>

            {/* Q2: Magnet Strength */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                2. A stronger magnet produces:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setAnsMagnet('larger');
                    checkCompletion(ansSpeed, 'larger', ansTurns);
                  }}
                  className={`p-2 rounded-lg border font-bold ${
                    ansMagnet === 'larger'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Larger induced effect
                </button>
                <button
                  onClick={() => setAnsMagnet('smaller')}
                  className={`p-2 rounded-lg border ${
                    ansMagnet === 'smaller'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Smaller induced effect
                </button>
              </div>
            </div>

            {/* Q3: Coil Turns */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                3. More turns in the coil produce:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setAnsTurns('larger');
                    checkCompletion(ansSpeed, ansMagnet, 'larger');
                  }}
                  className={`p-2 rounded-lg border font-bold ${
                    ansTurns === 'larger'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Larger induced effect
                </button>
                <button
                  onClick={() => setAnsTurns('smaller')}
                  className={`p-2 rounded-lg border ${
                    ansTurns === 'smaller'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Smaller induced effect
                </button>
              </div>
            </div>

            {ansSpeed === 'larger' && ansMagnet === 'larger' && ansTurns === 'larger' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>All 3 relationships verified!</strong> To maximize electricity generation: move faster, use stronger magnets, and add more turns to the coil!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
