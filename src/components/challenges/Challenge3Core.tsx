import { useState } from 'react';
import { ThreeCanvas } from '../ThreeCanvas';
import { DomainViewer } from '../DomainViewer';
import { SimulationConfig } from '../../types';
import { CheckCircle2, ArrowRight, Zap, Eye } from 'lucide-react';

interface Challenge3Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function Challenge3Core({ onComplete, isCompleted }: Challenge3Props) {
  const [prediction, setPrediction] = useState<'none' | 'iron' | 'same' | null>(null);
  const [selectedCore, setSelectedCore] = useState<'none' | 'iron'>('none');
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [staplesLiftedCount, setStaplesLiftedCount] = useState(0);
  const [staplesProgress, setStaplesProgress] = useState(0);
  const [results, setResults] = useState<{ none: number | null; iron: number | null }>({
    none: null,
    iron: null,
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const hasIronCore = selectedCore === 'iron';
  const currentVal = isSwitchClosed ? 6.0 : 0;

  const config: SimulationConfig = {
    mode: hasIronCore ? 'electromagnet' : 'solenoid',
    current: currentVal,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: 12,
    hasIronCore: hasIronCore,
    ironCorePermeability: 80,
    fieldLinesCount: hasIronCore ? 24 : 16,
    showFieldLines: isSwitchClosed,
    showFilingsPlane: false,
    filingsPlaneAxis: 'xz',
    filingsPlaneOffset: 0,
    filingsDensity: 24,
    showCompassProbe: true,
    probePosition: [1.8, -1.0, 1.8],
    showCurrentParticles: true,
    showRightHandRule: false,
    showPoles: isSwitchClosed,
    fieldLineSpeed: 1.0,
    sliceCutaway: false,
    switchClosed: isSwitchClosed,
    showCircuit: true,
  };

  const handleSwitchToggle = () => {
    const next = !isSwitchClosed;
    setIsSwitchClosed(next);
    if (!next) {
      // Power cut: staples drop immediately
      setStaplesProgress(0);
      setStaplesLiftedCount(0);
      setFeedbackMsg('Switch opened: Current stops. Without current, the soft-iron core demagnetizes and staples fall!');
    } else {
      setFeedbackMsg('Switch closed: Current flows! Now click "TEST WITH STAPLES" to measure lifting capacity.');
    }
  };

  const handleSelectCore = (core: 'none' | 'iron') => {
    setSelectedCore(core);
    setStaplesProgress(0);
    setStaplesLiftedCount(0);
    setFeedbackMsg(
      core === 'iron'
        ? 'Soft iron core inserted into the coil. Close the switch, then test lifting power!'
        : 'Air core (no iron). Close the switch, then test lifting power!'
    );
  };

  const handleTestStaples = () => {
    if (!isSwitchClosed) {
      setFeedbackMsg('Close the switch first! With current turned off, an electromagnet has zero lifting force.');
      return;
    }

    const count = hasIronCore ? 10 : 3;
    setStaplesLiftedCount(count);

    // Animate lifting in 3D
    let start = performance.now();
    const duration = 650;
    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setStaplesProgress(ease);
      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setResults((prev) => ({ ...prev, [selectedCore]: count }));
        setFeedbackMsg(
          `Observed: Lifted ${count} staples with ${hasIronCore ? 'soft iron core' : 'no iron core'}.`
        );
      }
    };
    requestAnimationFrame(animate);
  };

  const bothTested = results.none !== null && results.iron !== null;
  const isStep3Done = bothTested;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            3
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 3 — Build an Electromagnet
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep3Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : prediction
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep3Done
            ? 'Both Conditions Tested'
            : prediction
            ? 'Test Both Cores'
            : 'Predict First'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Instruction */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-slate-800 text-sm">
          <strong>Prediction Question:</strong> Which arrangement will lift more steel staples when the exact same current flows: a coil with <strong>no iron core</strong>, or a coil with a <strong>soft iron core</strong>?
        </div>

        {/* Prediction Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { key: 'none', label: 'Coil with no iron core' },
            { key: 'iron', label: 'Coil with soft iron core' },
            { key: 'same', label: 'About the same' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setPrediction(opt.key as any);
                setFeedbackMsg('Prediction recorded. Now test both arrangements in the 3D lab!');
              }}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                prediction === opt.key
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300 shadow-sm'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <ThreeCanvas
                config={config}
                staplesCount={staplesLiftedCount}
                staplesProgress={staplesProgress}
                showStaplesTray={true}
                onToggleSwitch={handleSwitchToggle}
              />

              {/* 3D Core Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow">
                <span className="font-semibold text-sky-400">Core:</span>{' '}
                {hasIronCore ? 'Soft Iron Cylinder' : 'Air / Hollow (No Core)'}
              </div>

              {/* Switch HUD */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <div
                  className={`border px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow backdrop-blur-md ${
                    isSwitchClosed
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400'
                      : 'bg-red-950/90 border-red-500 text-red-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {isSwitchClosed ? 'CIRCUIT CLOSED (6.0 A)' : 'CIRCUIT OPEN (0.0 A)'}
                </div>
              </div>

              {/* Live Staples HUD Callout */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 flex items-center justify-between text-xs text-slate-200 shadow">
                <div>
                  <span className="font-bold text-amber-400">3D Staples Picked Up:</span>{' '}
                  <span className="text-base font-bold text-white font-mono ml-1">
                    {Math.round(staplesLiftedCount * staplesProgress)}
                  </span>{' '}
                  staples
                </div>
                <div className="text-[11px] text-slate-400">
                  {hasIronCore ? 'Soft iron concentrates & boosts flux' : 'Air core produces low magnetic pull'}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-slate-900 rounded-lg text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-slate-400" /> Soft Iron Core
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-amber-600" /> Copper Solenoid Coil
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky-400" /> Magnetic Flux
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-slate-200" /> Steel Staples
              </span>
            </div>
          </div>

          {/* Right: Controls, Results Table, Domain Alignment Box */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Core Selection & Switch Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  1. Choose Core Material
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!prediction}
                    onClick={() => handleSelectCore('none')}
                    className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                      selectedCore === 'none'
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No Iron Core
                  </button>
                  <button
                    type="button"
                    disabled={!prediction}
                    onClick={() => handleSelectCore('iron')}
                    className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                      selectedCore === 'iron'
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Soft Iron Core
                  </button>
                </div>
              </div>

              {/* Circuit Switch & Test Button */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!prediction}
                  onClick={handleSwitchToggle}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow ${
                    isSwitchClosed
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {isSwitchClosed ? 'OPEN SWITCH' : 'CLOSE SWITCH'}
                </button>

                <button
                  type="button"
                  disabled={!prediction}
                  onClick={handleTestStaples}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow flex items-center justify-center gap-1.5"
                >
                  TEST STAPLES
                </button>
              </div>

              {/* Live feedback string */}
              {feedbackMsg && (
                <div className="text-xs bg-slate-100 border border-slate-300 text-slate-700 rounded-lg p-2.5">
                  {feedbackMsg}
                </div>
              )}
            </div>

            {/* Results Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Comparative Results
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700 font-bold">
                      <th className="py-2 px-3 border border-slate-300 text-left">Core Type</th>
                      <th className="py-2 px-3 border border-slate-300">Staples Lifted</th>
                      <th className="py-2 px-3 border border-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="py-2 px-3 border border-slate-300 text-left font-medium">No iron core (Air)</td>
                      <td className="py-2 px-3 border border-slate-300 font-mono font-bold text-slate-900 text-sm">
                        {results.none !== null ? results.none : '—'}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-500">
                        {results.none !== null ? 'Tested ✓' : 'Not yet tested'}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2 px-3 border border-slate-300 text-left font-medium">Soft iron core</td>
                      <td className="py-2 px-3 border border-slate-300 font-mono font-bold text-blue-600 text-sm">
                        {results.iron !== null ? results.iron : '—'}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-500">
                        {results.iron !== null ? 'Tested ✓' : 'Not yet tested'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Microscopic Domain Viewer */}
            <DomainViewer isAligned={isSwitchClosed && hasIronCore} hasIronCore={hasIronCore} />

            {/* Evidence & Scientific Explanation */}
            {bothTested && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1.5 animate-in fade-in duration-300">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Scientific Explanation: Why Soft Iron Multiplies Magnetic Strength
                </div>
                <p className="leading-relaxed">
                  Inside soft iron are microscopic clusters of atoms called <strong>magnetic domains</strong>. When electricity flows through the coil, the coil&apos;s magnetic field encourages all these domains to line up in the same direction!
                </p>
                <p className="leading-relaxed">
                  Their combined magnetic forces add to the coil&apos;s field, multiplying lifting strength by over <strong>300%</strong>. When the switch is opened, soft iron immediately scrambles back into disorder, turning the magnet off!
                </p>
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!isStep3Done}
                onClick={onComplete}
                className={`w-full font-bold text-sm px-5 py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                  isStep3Done
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE TO CHALLENGE 4</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
