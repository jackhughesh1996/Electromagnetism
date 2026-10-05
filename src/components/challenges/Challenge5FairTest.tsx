import { useState } from 'react';
import { ThreeCanvas } from '../ThreeCanvas';
import { TrialGraph } from '../TrialGraph';
import { SimulationConfig } from '../../types';
import { CheckCircle2, Award, FileText, Play, Check, AlertCircle } from 'lucide-react';

interface Challenge5Props {
  onComplete: () => void;
  isCompleted: boolean;
}

interface TrialItem {
  turns: number;
  trial: number;
  value: number;
}

const TRIAL_DATA: { [turns: number]: number[] } = {
  20: [5, 6, 5],
  40: [10, 9, 10],
  60: [14, 15, 14],
};

const TRIAL_ORDER: TrialItem[] = [
  { turns: 20, trial: 0, value: 5 },
  { turns: 20, trial: 1, value: 6 },
  { turns: 20, trial: 2, value: 5 },
  { turns: 40, trial: 0, value: 10 },
  { turns: 40, trial: 1, value: 9 },
  { turns: 40, trial: 2, value: 10 },
  { turns: 60, trial: 0, value: 14 },
  { turns: 60, trial: 1, value: 15 },
  { turns: 60, trial: 2, value: 14 },
];

export function Challenge5FairTest({ onComplete, isCompleted }: Challenge5Props) {
  // Variables identification state
  const [ivChoice, setIvChoice] = useState<string>('');
  const [ivCorrect, setIvCorrect] = useState<boolean | null>(null);

  const [dvChoice, setDvChoice] = useState<string>('');
  const [dvCorrect, setDvCorrect] = useState<boolean | null>(null);

  const [ctrlInput, setCtrlInput] = useState<string>('');
  const [ctrlCorrect, setCtrlCorrect] = useState<boolean | null>(null);

  // Sequential Trials state
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [isRunningTrial, setIsRunningTrial] = useState<boolean>(false);
  const [trialResults, setTrialResults] = useState<{ [turns: number]: (number | null)[] }>({
    20: [null, null, null],
    40: [null, null, null],
    60: [null, null, null],
  });
  const [means, setMeans] = useState<{ [turns: number]: number }>({});

  // Mean check state
  const [meanUnlocked, setMeanUnlocked] = useState(false);
  const [userMeanInput, setUserMeanInput] = useState('');
  const [meanFeedback, setMeanFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // 3D Staples animation
  const [activeStaples, setActiveStaples] = useState<number>(0);
  const [staplesProgress, setStaplesProgress] = useState<number>(0);

  // CER reflection state
  const [cerClaim, setCerClaim] = useState('');
  const [cerEvidence, setCerEvidence] = useState('');
  const [cerReasoning, setCerReasoning] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isFinalComplete, setIsFinalComplete] = useState(isCompleted);

  // Ready to run trials
  const isVariablesReady = ivCorrect === true && dvCorrect === true && ctrlCorrect === true;

  // Check IV
  const handleCheckIv = () => {
    setIvCorrect(ivChoice === 'turns');
  };

  // Check DV
  const handleCheckDv = () => {
    setDvCorrect(dvChoice === 'staples');
  };

  // Check Controlled Variables
  const handleCheckCtrl = () => {
    const text = ctrlInput.toLowerCase();
    const keywords = ['current', 'core', 'battery', 'direction', 'contact', 'time', 'staple', 'wire', 'voltage'];
    const matches = keywords.filter((k) => text.includes(k));
    const uniqueGroups = new Set(matches.map((k) => (k === 'direction' ? 'battery' : k === 'time' ? 'contact' : k)));
    setCtrlCorrect(uniqueGroups.size >= 2);
  };

  // Run next single trial
  const handleRunTrial = async () => {
    if (trialIndex >= TRIAL_ORDER.length || isRunningTrial) return;
    setIsRunningTrial(true);

    const currentTrial = TRIAL_ORDER[trialIndex];
    setActiveStaples(currentTrial.value);

    // Animate staples in 3D
    let start = performance.now();
    const duration = 600;
    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      setStaplesProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);

    await new Promise((r) => setTimeout(r, 650));

    // Record result
    setTrialResults((prev) => {
      const copy = { ...prev };
      const arr = [...copy[currentTrial.turns]];
      arr[currentTrial.trial] = currentTrial.value;
      copy[currentTrial.turns] = arr;
      return copy;
    });

    const nextIdx = trialIndex + 1;
    setTrialIndex(nextIdx);

    // If finished 3 trials of 20 turns, pause for mean check
    if (nextIdx === 3 && !meanUnlocked) {
      setIsRunningTrial(false);
      return;
    }

    // If finished 40 turns (index 6), calculate mean automatically
    if (nextIdx === 6) {
      setMeans((prev) => ({ ...prev, 40: (10 + 9 + 10) / 3 }));
    }

    // If finished 60 turns (index 9), calculate mean automatically
    if (nextIdx === 9) {
      setMeans((prev) => ({ ...prev, 60: (14 + 15 + 14) / 3 }));
    }

    setIsRunningTrial(false);
  };

  // Validate student's mean calculation for 20 turns: (5 + 6 + 5) / 3 = 5.33
  const handleCheckMean = () => {
    const val = parseFloat(userMeanInput);
    if (!isNaN(val) && Math.abs(val - 5.3) < 0.15) {
      setMeanUnlocked(true);
      setMeans((prev) => ({ ...prev, 20: 5.3 }));
      setMeanFeedback({
        ok: true,
        msg: 'Correct! Mean = (5 + 6 + 5) ÷ 3 = 5.3 staples. Remaining means will calculate automatically as you test.',
      });
    } else {
      setMeanFeedback({
        ok: false,
        msg: 'Not quite. Add the three trial results: 5 + 6 + 5 = 16. Then divide by 3: 16 ÷ 3 = 5.3.',
      });
    }
  };

  const handleFinish = () => {
    setIsFinalComplete(true);
    onComplete();
  };

  // 3D Scene Config
  const activeTrialItem =
    trialIndex < TRIAL_ORDER.length ? TRIAL_ORDER[trialIndex] : TRIAL_ORDER[TRIAL_ORDER.length - 1];

  const config: SimulationConfig = {
    mode: 'electromagnet',
    current: 4.5,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: Math.max(6, Math.min(24, Math.round(activeTrialItem.turns / 3))),
    hasIronCore: true,
    ironCorePermeability: 80,
    fieldLinesCount: 22,
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

  const allTrialsComplete = trialIndex >= TRIAL_ORDER.length && meanUnlocked;
  const canShowCer = allTrialsComplete;
  const canRevealModelAnswer =
    cerClaim.trim().length > 3 && cerEvidence.trim().length > 3 && cerReasoning.trim().length > 3;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            5
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 5 — Fair Investigation
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isFinalComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : allTrialsComplete
              ? 'bg-purple-50 text-purple-700 border-purple-300'
              : isVariablesReady
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isFinalComplete
            ? 'Practical Complete! 🎓'
            : allTrialsComplete
            ? 'CER Synthesis'
            : isVariablesReady
            ? `Trials: ${trialIndex} / 9`
            : 'Variables Check'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Investigation Question Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-slate-800 text-sm">
          <strong>Investigation Question:</strong> How does the <strong>number of coil turns</strong> affect the magnetic lifting strength of an electromagnet when keeping all other variables constant?
        </div>

        {/* 1. Variable Identification Questions (3-Column Grid) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Identify Experimental Variables
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Independent Variable */}
            <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Independent Variable (Changed)
              </label>
              <select
                value={ivChoice}
                onChange={(e) => {
                  setIvChoice(e.target.value);
                  setIvCorrect(null);
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
              >
                <option value="">Choose variable...</option>
                <option value="turns">Number of turns (Loops)</option>
                <option value="staples">Staples lifted (Strength)</option>
                <option value="current">Current (Amperes)</option>
              </select>
              <button
                type="button"
                onClick={handleCheckIv}
                disabled={!ivChoice}
                className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-40"
              >
                CHECK
              </button>
              {ivCorrect !== null && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-medium ${
                    ivCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {ivCorrect
                    ? '✓ Correct! Number of turns is what we deliberately change.'
                    : '✗ Try again. The independent variable is the one factor you deliberately change.'}
                </div>
              )}
            </div>

            {/* Dependent Variable */}
            <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Dependent Variable (Measured)
              </label>
              <select
                value={dvChoice}
                onChange={(e) => {
                  setDvChoice(e.target.value);
                  setDvCorrect(null);
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
              >
                <option value="">Choose variable...</option>
                <option value="turns">Number of turns (Loops)</option>
                <option value="staples">Staples lifted (Strength)</option>
                <option value="core">Core material</option>
              </select>
              <button
                type="button"
                onClick={handleCheckDv}
                disabled={!dvChoice}
                className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-40"
              >
                CHECK
              </button>
              {dvCorrect !== null && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-medium ${
                    dvCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {dvCorrect
                    ? '✓ Correct! Staples lifted is the measured outcome.'
                    : '✗ Try again. The dependent variable is what you count or measure to find magnetic strength.'}
                </div>
              )}
            </div>

            {/* Controlled Variables */}
            <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Name Two Controlled Variables
              </label>
              <input
                type="text"
                placeholder="e.g. current, soft iron core..."
                value={ctrlInput}
                onChange={(e) => {
                  setCtrlInput(e.target.value);
                  setCtrlCorrect(null);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={handleCheckCtrl}
                disabled={!ctrlInput.trim()}
                className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-40"
              >
                CHECK
              </button>
              {ctrlCorrect !== null && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-medium ${
                    ctrlCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {ctrlCorrect
                    ? '✓ Well done! You named at least two valid controlled variables.'
                    : '✗ Name at least two controls: current (0.75 A), core (soft iron), battery direction, staple type, or contact time.'}
                </div>
              )}
            </div>
          </div>

          {/* Variables Summary Banner */}
          {isVariablesReady && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 animate-in fade-in duration-300">
              <strong>FAIR TEST PROTOCOL:</strong> Independent variable = <strong>Number of turns</strong> • Dependent variable = <strong>Staples lifted</strong> • Controlled = <strong>Current (0.75 A), soft iron core, battery direction, staple type, contact time</strong>.
            </div>
          )}
        </div>

        {/* 2. Interactive 3D Trial Execution & Apparatus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] sm:h-[420px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <ThreeCanvas
                config={config}
                staplesCount={activeStaples}
                staplesProgress={staplesProgress}
                showStaplesTray={true}
              />

              {/* 3D Trial Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow">
                <span className="font-semibold text-sky-400">Current Apparatus:</span>{' '}
                {activeTrialItem.turns} turns • Trial {activeTrialItem.trial + 1}
              </div>

              {/* Live HUD Callout */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 flex items-center justify-between text-xs text-slate-200 shadow">
                <div>
                  <span className="font-bold text-amber-400">3D Staples Lifted:</span>{' '}
                  <span className="text-base font-bold text-white font-mono ml-1">
                    {Math.round(activeStaples * staplesProgress)}
                  </span>{' '}
                  staples
                </div>
                <div className="text-[11px] text-slate-400">
                  Fixed 0.75 A • Soft-iron core • 3 trials per condition for reliability
                </div>
              </div>
            </div>

            {/* Apparatus footnote */}
            <div className="mt-2 px-3 py-2 bg-slate-900 rounded-lg text-[11px] text-slate-400 text-center">
              Constant controlled environment: Current 0.75 A • soft-iron core • normal battery direction • same contact time
            </div>
          </div>

          {/* Right: Trial Controls & Mean Calculation */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Next Trial</h3>

              <div className="bg-white border border-slate-300 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-500 block">Condition</span>
                <strong className="text-lg text-slate-900 font-mono">
                  {trialIndex < TRIAL_ORDER.length
                    ? `${TRIAL_ORDER[trialIndex].turns} turns — Trial ${TRIAL_ORDER[trialIndex].trial + 1}`
                    : 'All 9 Trials Completed!'}
                </strong>
              </div>

              {/* Run Trial Button */}
              <button
                type="button"
                disabled={!isVariablesReady || trialIndex >= TRIAL_ORDER.length || (trialIndex === 3 && !meanUnlocked) || isRunningTrial}
                onClick={handleRunTrial}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 transition-all ${
                  !isVariablesReady || trialIndex >= TRIAL_ORDER.length || (trialIndex === 3 && !meanUnlocked)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                <Play className="w-4 h-4" />
                {isRunningTrial ? 'RECORDING TRIAL IN 3D...' : 'RUN TRIAL'}
              </button>

              {/* Mean Calculation Prompt (triggers after 3 trials of 20 turns) */}
              {trialIndex >= 3 && !meanUnlocked && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-300">
                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Calculate the Mean for 20 Turns:
                  </div>
                  <p className="text-xs text-amber-800 leading-snug">
                    You recorded three trial values: <strong>5</strong>, <strong>6</strong>, and <strong>5</strong> staples. What is the mean?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.3"
                      value={userMeanInput}
                      onChange={(e) => setUserMeanInput(e.target.value)}
                      className="w-28 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-center"
                    />
                    <button
                      type="button"
                      onClick={handleCheckMean}
                      className="px-3 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                    >
                      CHECK MEAN
                    </button>
                  </div>
                  {meanFeedback && (
                    <div
                      className={`text-[11px] p-2 rounded-lg font-medium ${
                        meanFeedback.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {meanFeedback.msg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Results Table & Graph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Results Table */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Experimental Results Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 font-bold">
                    <th className="py-2 px-3 border border-slate-300">Turns (N)</th>
                    <th className="py-2 px-3 border border-slate-300">Trial 1</th>
                    <th className="py-2 px-3 border border-slate-300">Trial 2</th>
                    <th className="py-2 px-3 border border-slate-300">Trial 3</th>
                    <th className="py-2 px-3 border border-slate-300 bg-blue-100 text-blue-900">Mean</th>
                  </tr>
                </thead>
                <tbody>
                  {[20, 40, 60].map((turns) => {
                    const rowVals = trialResults[turns];
                    const meanVal = means[turns];
                    return (
                      <tr key={turns} className="bg-white">
                        <td className="py-2.5 px-3 border border-slate-300 font-bold text-slate-800">{turns}</td>
                        <td className="py-2.5 px-3 border border-slate-300 font-mono">
                          {rowVals[0] !== null ? rowVals[0] : '—'}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 font-mono">
                          {rowVals[1] !== null ? rowVals[1] : '—'}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 font-mono">
                          {rowVals[2] !== null ? rowVals[2] : '—'}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold bg-blue-50/70 text-blue-700">
                          {meanVal !== undefined ? meanVal.toFixed(1) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Graph */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Graph: Number of Turns vs. Mean Staples Lifted
            </h3>
            <TrialGraph means={means} />
          </div>
        </div>

        {/* 4. Claim–Evidence–Reasoning (CER) Reflection */}
        {canShowCer && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Claim – Evidence – Reasoning (CER) Task
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Summarize your scientific conclusions using evidence from the five challenges.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. CLAIM: State three ways an electromagnet can be made stronger.
                </label>
                <textarea
                  rows={2}
                  value={cerClaim}
                  onChange={(e) => setCerClaim(e.target.value)}
                  placeholder="e.g. An electromagnet can be made stronger by..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 resize-y"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. EVIDENCE: Cite specific observations or numerical results from your trials.
                </label>
                <textarea
                  rows={2}
                  value={cerEvidence}
                  onChange={(e) => setCerEvidence(e.target.value)}
                  placeholder="e.g. When turns increased from 20 to 60, the mean staples lifted increased from 5.3 to 14.3..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 resize-y"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  3. REASONING: Explain the scientific physics behind why each factor increases strength.
                </label>
                <textarea
                  rows={2}
                  value={cerReasoning}
                  onChange={(e) => setCerReasoning(e.target.value)}
                  placeholder="e.g. More turns mean more magnetic field contributions reinforce through the core..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 resize-y"
                />
              </div>
            </div>

            {/* Model Answer Button */}
            <div className="pt-1">
              <button
                type="button"
                disabled={!canRevealModelAnswer}
                onClick={() => setShowModelAnswer(true)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow transition ${
                  canRevealModelAnswer
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                SHOW MODEL ANSWER
              </button>
            </div>

            {/* Model Answer Reveal */}
            {showModelAnswer && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-950 space-y-2 animate-in fade-in duration-300">
                <strong className="text-emerald-900 font-bold block text-sm">
                  Model Scientific Answer (Year 8 Science):
                </strong>
                <p>
                  <strong>Claim:</strong> The three ways to make an electromagnet stronger are: (1) increase the electric current, (2) increase the number of coil turns, and (3) insert a soft iron core.
                </p>
                <p>
                  <strong>Evidence:</strong> In Challenge 4, increasing current from 0.50 A to 1.00 A increased staples lifted from 10 to 15. In Challenge 5, increasing turns from 20 to 60 increased mean staples lifted from 5.3 to 14.3. Adding a soft iron core increased staples from 10 to 16. Reversing the battery flipped the poles but did not alter lifting power.
                </p>
                <p>
                  <strong>Reasoning:</strong> Greater current produces more moving electrons per second, creating a denser magnetic field. More wire turns mean each turn&apos;s magnetic field reinforces the others through the center of the coil. The soft iron core contains magnetic domains that align with the coil&apos;s field, multiplying total magnetic flux.
                </p>
              </div>
            )}

            {/* Mark Practical Complete Button */}
            {showModelAnswer && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  MARK PRACTICAL COMPLETE
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final Celebration Banner */}
        {isFinalComplete && (
          <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg flex items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Practical Complete! Excellent Scientific Investigation.</h3>
              <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                You applied Ørsted&apos;s evidence, explored conductor geometries, built a soft-iron electromagnet, executed controlled comparisons, and calculated experimental means with a fair investigation!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
