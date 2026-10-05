import { useState } from 'react';
import { ThreeCanvas } from '../ThreeCanvas';
import { SimulationConfig } from '../../types';
import { CheckCircle2, ArrowRight, Play, Sliders, Sparkles, RotateCw } from 'lucide-react';

interface Challenge4Props {
  onComplete: () => void;
  isCompleted: boolean;
}

interface ComparisonTest {
  title: string;
  prompt: string;
  options: [string, string][];
  actual: string;
  changed: string;
  held: string;
  a: { turns: number; current: number; core: 'none' | 'iron'; dir: 'normal' | 'reversed' };
  b: { turns: number; current: number; core: 'none' | 'iron'; dir: 'normal' | 'reversed' };
  labels: [string, string];
  expectedCounts: [number, number];
}

const COMPARISONS: ComparisonTest[] = [
  {
    title: 'TEST A — NUMBER OF TURNS',
    prompt: 'What will happen if the number of coil turns increases from 20 to 40?',
    options: [
      ['stronger', 'Becomes stronger (lifts more staples)'],
      ['same', 'Stays about the same'],
      ['weaker', 'Becomes weaker'],
    ],
    actual: 'stronger',
    changed: 'Number of turns: 20 → 40 turns',
    held: 'Current 0.50 A, no iron core, normal battery direction',
    a: { turns: 20, current: 0.5, core: 'none', dir: 'normal' },
    b: { turns: 40, current: 0.5, core: 'none', dir: 'normal' },
    labels: ['20 turns', '40 turns'],
    expectedCounts: [5, 10],
  },
  {
    title: 'TEST B — ELECTRIC CURRENT',
    prompt: 'What will happen if the current increases from 0.50 A to 1.00 A?',
    options: [
      ['stronger', 'Becomes stronger (lifts more staples)'],
      ['same', 'Stays about the same'],
      ['weaker', 'Becomes weaker'],
    ],
    actual: 'stronger',
    changed: 'Current: 0.50 A → 1.00 A',
    held: '40 turns, no iron core, normal battery direction',
    a: { turns: 40, current: 0.5, core: 'none', dir: 'normal' },
    b: { turns: 40, current: 1.0, core: 'none', dir: 'normal' },
    labels: ['0.50 A', '1.00 A'],
    expectedCounts: [10, 15],
  },
  {
    title: 'TEST C — SOFT-IRON CORE',
    prompt: 'What will happen to magnetic lifting power when a soft-iron core is added?',
    options: [
      ['stronger', 'Becomes much stronger'],
      ['same', 'Stays about the same'],
      ['weaker', 'Becomes weaker'],
    ],
    actual: 'stronger',
    changed: 'Core: No iron core → Soft iron',
    held: '40 turns, 0.75 A, normal battery direction',
    a: { turns: 40, current: 0.75, core: 'none', dir: 'normal' },
    b: { turns: 40, current: 0.75, core: 'iron', dir: 'normal' },
    labels: ['No iron core', 'Soft iron core'],
    expectedCounts: [10, 16],
  },
  {
    title: 'TEST D — BATTERY DIRECTION',
    prompt: 'What will happen to lifting strength if the battery is reversed?',
    options: [
      ['same', 'Strength stays the same, but North and South poles reverse'],
      ['stronger', 'Becomes stronger'],
      ['weaker', 'Becomes weaker'],
    ],
    actual: 'same',
    changed: 'Battery direction: Normal → Reversed',
    held: '40 turns, 0.75 A, soft-iron core',
    a: { turns: 40, current: 0.75, core: 'iron', dir: 'normal' },
    b: { turns: 40, current: 0.75, core: 'iron', dir: 'reversed' },
    labels: ['Normal battery', 'Reversed battery'],
    expectedCounts: [16, 16],
  },
];

export function Challenge4Strength({ onComplete, isCompleted }: Challenge4Props) {
  const [compIndex, setCompIndex] = useState(0);
  const [compPred, setCompPred] = useState<string | null>(null);
  const [compDone, setCompDone] = useState<boolean[]>([false, false, false, false]);
  const [isFreeExplore, setIsFreeExplore] = useState(false);
  const [isRunningComp, setIsRunningComp] = useState(false);
  const [compResults, setCompResults] = useState<{ [key: string]: number } | null>(null);
  const [compFeedback, setCompFeedback] = useState<string>('');

  // Current active test state (either from comparison or free explore)
  const currentComp = COMPARISONS[compIndex];
  const [activeState, setActiveState] = useState(currentComp.a);
  const [staplesCount, setStaplesCount] = useState<number>(currentComp.expectedCounts[0]);
  const [staplesProgress, setStaplesProgress] = useState<number>(1);

  // Free explore inputs
  const [freeTurns, setFreeTurns] = useState<number>(40);
  const [freeCurrent, setFreeCurrent] = useState<number>(0.75);
  const [freeCore, setFreeCore] = useState<'none' | 'iron'>('iron');
  const [freeDir, setFreeDir] = useState<'normal' | 'reversed'>('normal');

  // Calculate strength for free explore
  const calcStrength = (turns: number, current: number, core: 'none' | 'iron') => {
    const coreFactor = core === 'iron' ? 3.2 : 1;
    const raw = turns * current * coreFactor;
    const max = 60 * 1.0 * 3.2; // 192
    const p = Math.min(1, raw / max);
    const count = Math.max(1, Math.round(p * 16));
    const word = p < 0.2 ? 'Weak' : p < 0.45 ? 'Moderate' : p < 0.75 ? 'Strong' : 'Very strong';
    return { p, count, word };
  };

  const freeResult = calcStrength(freeTurns, freeCurrent, freeCore);

  // Run controlled comparison
  const handleRunComparison = async () => {
    setIsRunningComp(true);
    setCompFeedback('Testing Condition A in 3D...');

    // First show condition A
    setActiveState(currentComp.a);
    setStaplesCount(currentComp.expectedCounts[0]);
    setStaplesProgress(1);

    await new Promise((r) => setTimeout(r, 800));

    // Transition to condition B
    setCompFeedback('Testing Condition B in 3D...');
    setActiveState(currentComp.b);
    setStaplesCount(currentComp.expectedCounts[1]);

    // Animate staples
    let start = performance.now();
    const duration = 500;
    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      setStaplesProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);

    await new Promise((r) => setTimeout(r, 600));

    // Finish comparison
    setCompResults({
      [currentComp.labels[0]]: currentComp.expectedCounts[0],
      [currentComp.labels[1]]: currentComp.expectedCounts[1],
    });

    const isMatch = compPred === currentComp.actual;
    let obsText = '';
    if (compIndex === 3) {
      obsText = `Observation: The magnetic field direction and North/South poles swapped ends in 3D, but the lifting power stayed identical at ${currentComp.expectedCounts[1]} staples.`;
    } else {
      obsText = `Observation: Lifting power increased from ${currentComp.expectedCounts[0]} to ${currentComp.expectedCounts[1]} staples.`;
    }

    setCompFeedback(`${obsText} ${isMatch ? 'Your prediction matched the experimental evidence!' : 'Your prediction differed — this clarifies how this variable operates.'}`);

    setCompDone((prev) => {
      const copy = [...prev];
      copy[compIndex] = true;
      return copy;
    });
    setIsRunningComp(false);
  };

  const handleNextComparison = () => {
    if (compIndex < 3) {
      const nextIdx = compIndex + 1;
      setCompIndex(nextIdx);
      setCompPred(null);
      setCompResults(null);
      setCompFeedback('');
      setActiveState(COMPARISONS[nextIdx].a);
      setStaplesCount(COMPARISONS[nextIdx].expectedCounts[0]);
    } else {
      setIsFreeExplore(true);
    }
  };

  // 3D Scene Config
  const currentDir = isFreeExplore ? freeDir : activeState.dir;
  const rawCurrent = isFreeExplore ? freeCurrent : activeState.current;
  const signedCurrent = currentDir === 'reversed' ? -rawCurrent * 6 : rawCurrent * 6;
  const activeCore = isFreeExplore ? freeCore : activeState.core;
  const activeTurns = isFreeExplore ? freeTurns : activeState.turns;

  const config: SimulationConfig = {
    mode: activeCore === 'iron' ? 'electromagnet' : 'solenoid',
    current: signedCurrent,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: Math.max(6, Math.min(24, Math.round(activeTurns / 3))),
    hasIronCore: activeCore === 'iron',
    ironCorePermeability: 80,
    fieldLinesCount: activeCore === 'iron' ? 22 : 14,
    showFieldLines: true,
    showFilingsPlane: false,
    filingsPlaneAxis: 'xz',
    filingsPlaneOffset: 0,
    filingsDensity: 24,
    showCompassProbe: true,
    probePosition: [1.8, -1.0, 1.8],
    showCurrentParticles: true,
    showRightHandRule: false,
    showPoles: true,
    fieldLineSpeed: 1.0,
    sliceCutaway: false,
    particleType: 'electrons',
    switchClosed: true,
    showCircuit: true,
  };

  const displayedStaplesCount = isFreeExplore ? freeResult.count : staplesCount;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            4
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 4 — Make It Stronger
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isFreeExplore
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-blue-50 text-blue-700 border-blue-300'
          }`}
        >
          {isCompleted || isFreeExplore ? 'Free Explore Unlocked' : 'Controlled Comparisons'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Comparison Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {COMPARISONS.map((comp, i) => (
            <button
              key={comp.title}
              type="button"
              disabled={isRunningComp}
              onClick={() => {
                setIsFreeExplore(false);
                setCompIndex(i);
                setCompPred(null);
                setCompResults(null);
                setCompFeedback('');
                setActiveState(COMPARISONS[i].a);
                setStaplesCount(COMPARISONS[i].expectedCounts[0]);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                !isFreeExplore && compIndex === i
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : compDone[i]
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {compDone[i] ? '✓ ' : ''}
              {comp.title.replace('TEST ', '')}
            </button>
          ))}

          <button
            type="button"
            disabled={!compDone.every(Boolean)}
            onClick={() => setIsFreeExplore(true)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              isFreeExplore
                ? 'bg-purple-600 text-white border-purple-600 shadow'
                : compDone.every(Boolean)
                ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Free Explore
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <ThreeCanvas
                config={config}
                staplesCount={displayedStaplesCount}
                staplesProgress={staplesProgress}
                showStaplesTray={true}
              />

              {/* 3D Condition Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow">
                <span className="font-semibold text-sky-400">
                  {isFreeExplore ? 'Free Sandbox Mode' : currentComp.title}:
                </span>{' '}
                {activeTurns} turns • {activeCore === 'iron' ? 'Soft Iron' : 'Air Core'} •{' '}
                {currentDir === 'reversed' ? 'Reversed Polarities' : 'Normal Polarities'}
              </div>

              {/* Live Strength HUD Callout */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 flex items-center justify-between text-xs text-slate-200 shadow">
                <div>
                  <span className="font-bold text-amber-400">3D Staples Lifted:</span>{' '}
                  <span className="text-base font-bold text-white font-mono ml-1">
                    {displayedStaplesCount}
                  </span>{' '}
                  staples
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-400 font-normal">Rating:</span>
                  <span className="text-sky-400">
                    {isFreeExplore
                      ? freeResult.word
                      : displayedStaplesCount <= 5
                      ? 'Weak'
                      : displayedStaplesCount <= 10
                      ? 'Moderate'
                      : 'Strong'}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-slate-900 rounded-lg text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">N</span> North Pole
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">S</span> South Pole
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky-400" /> Field Density = Strength
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-slate-200" /> Steel Staples
              </span>
            </div>
          </div>

          {/* Right: Controlled Comparison or Free Explore */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {!isFreeExplore ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {currentComp.title}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{currentComp.prompt}</p>

                {/* Prediction Options */}
                <div className="grid grid-cols-1 gap-2">
                  {currentComp.options.map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      disabled={isRunningComp || compDone[compIndex]}
                      onClick={() => setCompPred(val)}
                      className={`text-left p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                        compPred === val
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Fair Test Constraints Box */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="border-l-4 border-blue-600 pl-2">
                    <strong className="text-blue-900">CHANGED (Independent):</strong>{' '}
                    <span className="text-slate-700">{currentComp.changed}</span>
                  </div>
                  <div className="border-l-4 border-slate-400 pl-2">
                    <strong className="text-slate-600">HELD CONSTANT (Controlled):</strong>{' '}
                    <span className="text-slate-700">{currentComp.held}</span>
                  </div>
                </div>

                {/* Run comparison button */}
                <button
                  type="button"
                  disabled={!compPred || isRunningComp || compDone[compIndex]}
                  onClick={handleRunComparison}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-2 transition-all ${
                    !compPred || compDone[compIndex]
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  RUN CONTROLLED COMPARISON
                </button>

                {/* Comparative Results Box */}
                {compResults && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                    {Object.entries(compResults).map(([lbl, val]) => (
                      <div
                        key={lbl}
                        className="bg-white border border-slate-300 rounded-xl p-2.5 text-center shadow-sm"
                      >
                        <span className="text-[11px] text-slate-500 block font-medium">{lbl}</span>
                        <strong className="text-lg text-blue-600 font-mono">{val}</strong>
                        <span className="text-[10px] text-slate-400 block">staples lifted</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                {compFeedback && (
                  <div className="text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-3 leading-relaxed">
                    {compFeedback}
                  </div>
                )}

                {/* Next comparison button */}
                {compDone[compIndex] && (
                  <button
                    type="button"
                    onClick={handleNextComparison}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white shadow flex items-center justify-center gap-2"
                  >
                    <span>{compIndex < 3 ? 'NEXT COMPARISON' : 'UNLOCK FREE EXPLORE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Free Explore Panel */
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Free Sandbox Investigation
                  </div>
                  <span className="text-[11px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                    All Variables Unlocked
                  </span>
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Number of Turns</label>
                    <select
                      value={freeTurns}
                      onChange={(e) => setFreeTurns(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value={10}>10 turns</option>
                      <option value={20}>20 turns</option>
                      <option value={40}>40 turns</option>
                      <option value={60}>60 turns</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Current</label>
                    <select
                      value={freeCurrent}
                      onChange={(e) => setFreeCurrent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value={0.25}>0.25 A</option>
                      <option value={0.5}>0.50 A</option>
                      <option value={0.75}>0.75 A</option>
                      <option value={1.0}>1.00 A</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Core Material</label>
                    <select
                      value={freeCore}
                      onChange={(e) => setFreeCore(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value="none">No iron core (Air)</option>
                      <option value="iron">Soft iron core</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Battery Polarities</label>
                    <select
                      value={freeDir}
                      onChange={(e) => setFreeDir(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      <option value="normal">Normal (+ Top)</option>
                      <option value="reversed">Reversed (− Top)</option>
                    </select>
                  </div>
                </div>

                {/* Live Readout Card */}
                <div className="bg-white border border-slate-300 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Relative Strength:</span>
                    <strong className="text-blue-600 font-bold text-sm">{freeResult.word}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Simulated Staples Picked Up:</span>
                    <strong className="text-emerald-600 font-bold text-sm font-mono">
                      {freeResult.count} staples
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Staples lifted are a modelled measure of relative magnetic field force.
                  </p>
                </div>
              </div>
            )}

            {/* Continue to Challenge 5 */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!compDone.every(Boolean)}
                onClick={onComplete}
                className={`w-full font-bold text-sm px-5 py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                  compDone.every(Boolean)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE TO CHALLENGE 5 (FAIR INVESTIGATION)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
