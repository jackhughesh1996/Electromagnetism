import { useState } from 'react';
import { SimulationConfig, SimulationMode, FieldMeasurement, ActiveLesson } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ControlPanel } from './components/ControlPanel';
import { CompassProbeHud } from './components/CompassProbeHud';
import { PhysicsExplanation } from './components/PhysicsExplanation';
import { TheoryModal } from './components/TheoryModal';
import { Challenge1Oersted } from './components/challenges/Challenge1Oersted';
import { Challenge2Progression } from './components/challenges/Challenge2Progression';
import { Challenge3Core } from './components/challenges/Challenge3Core';
import { Challenge4Strength } from './components/challenges/Challenge4Strength';
import { Challenge5FairTest } from './components/challenges/Challenge5FairTest';
import { MotorExplorer } from './components/motor/MotorExplorer';
import { InductionExplorer } from './components/induction/InductionExplorer';
import {
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  FlaskConical,
  Compass,
  CheckCircle2,
  Zap,
  RotateCw,
} from 'lucide-react';
import { generateStandaloneHtml } from './utils/exportStandaloneHtml';
import { generateMotorStandaloneHtml } from './utils/exportMotorStandaloneHtml';

const STAGES: { mode: SimulationMode; title: string; subtitle: string; description: string }[] = [
  {
    mode: 'wire',
    title: '1. Straight Wire',
    subtitle: 'Circular magnetic field',
    description:
      'When electricity flows through a wire, an invisible magnetic field forms in circles around it. The field is strongest closest to the wire!',
  },
  {
    mode: 'coil',
    title: '2. Single Loop',
    subtitle: 'Focusing the field',
    description:
      'Bending the wire into a ring traps and focuses all the magnetic field lines right through the centre hole, making the field much stronger in the middle.',
  },
  {
    mode: 'solenoid',
    title: '3. Solenoid (Coil of Wire)',
    subtitle: 'Acts like a bar magnet!',
    description:
      'Coiling the wire with multiple loops makes a solenoid. The loops work together to create a North and South pole, looking just like a real bar magnet!',
  },
  {
    mode: 'electromagnet',
    title: '4. Electromagnet',
    subtitle: 'Soft iron core added!',
    description:
      'Placing a soft iron nail or core inside the coil creates an electromagnet! It multiplies the magnetic force so it can pick up heavy objects, and turns off when you cut the power.',
  },
];

const L3_CHALLENGE_TABS = [
  { id: 1, label: '1. Oersted', full: '1. Oersted’s Evidence' },
  { id: 2, label: '2. Progression', full: '2. Wire → Loop → Coil' },
  { id: 3, label: '3. Core', full: '3. Build an Electromagnet' },
  { id: 4, label: '4. Strength', full: '4. Make It Stronger' },
  { id: 5, label: '5. Fair Test', full: '5. Fair Investigation' },
];

export default function App() {
  const [activeLesson, setActiveLesson] = useState<ActiveLesson>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lessonParam = params.get('lesson');
      if (lessonParam === 'L3' || lessonParam === 'l3') return 'L3';
      if (lessonParam === 'L4' || lessonParam === 'l4') return 'L4';
      if (lessonParam === 'L5' || lessonParam === 'l5') return 'L5';
    }
    return 'L4';
  });
  const [activeTab, setActiveTab] = useState<'practical' | 'sandbox'>('practical');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  // Sandbox simulation config for L3
  const [config, setConfig] = useState<SimulationConfig>({
    mode: 'solenoid',
    current: 6.0,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: 12,
    hasIronCore: false,
    ironCorePermeability: 80,
    fieldLinesCount: 16,
    showFieldLines: true,
    showFilingsPlane: false,
    filingsPlaneAxis: 'xz',
    filingsPlaneOffset: 0,
    filingsDensity: 24,
    showCompassProbe: true,
    probePosition: [1.4, 0.6, 1.4],
    showCurrentParticles: true,
    showRightHandRule: true,
    showPoles: true,
    fieldLineSpeed: 1.0,
    sliceCutaway: false,
    switchClosed: true,
    showCircuit: true,
    particleType: 'electrons',
  });

  const [measurement, setMeasurement] = useState<FieldMeasurement | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isCompassHudOpen, setIsCompassHudOpen] = useState(true);

  const currentStageIndex = STAGES.findIndex((s) => s.mode === config.mode);
  const currentStage = STAGES[currentStageIndex >= 0 ? currentStageIndex : 0];

  const handleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNum);
      return next;
    });
    if (stepNum < 5) {
      setActiveStep(stepNum + 1);
    }
  };

  const goToNextStage = () => {
    if (currentStageIndex < STAGES.length - 1) {
      const nextMode = STAGES[currentStageIndex + 1].mode;
      setConfig((prev) => ({
        ...prev,
        mode: nextMode,
        hasIronCore: nextMode === 'electromagnet',
      }));
    }
  };

  const goToPrevStage = () => {
    if (currentStageIndex > 0) {
      const prevMode = STAGES[currentStageIndex - 1].mode;
      setConfig((prev) => ({
        ...prev,
        mode: prevMode,
        hasIronCore: prevMode === 'electromagnet',
      }));
    }
  };

  const handleDownloadStandalone = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}lesson-3-electromagnet.html`);
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lesson-3-electromagnet.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Fallback to generator
    }
    const htmlContent = generateStandaloneHtml(config);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-3-electromagnet.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMotorStandalone = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}lesson-4-electric-motor.html`);
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lesson-4-electric-motor.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Fallback to generator
    }
    const htmlContent = generateMotorStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-4-electric-motor.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isStandalone = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('lesson');

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Master Top Navigation Bar */}
      <header className="z-30 h-14 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-md">
        {/* Brand & Sequence Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
            {activeLesson === 'L5' ? '⚡' : activeLesson === 'L4' ? '🔄' : '🧲'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white leading-none">
                {activeLesson === 'L5'
                  ? '3D Electromagnetic Induction Lab'
                  : activeLesson === 'L4'
                  ? '3D Electric Motor Explorer'
                  : 'Electromagnet Virtual Lab'}
              </h1>
              <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 border border-sky-800 px-1.5 py-0.5 rounded-md hidden md:inline">
                {activeLesson === 'L5'
                  ? 'Lesson 5 • Year 8 Science'
                  : isStandalone
                  ? (activeLesson === 'L4' ? 'Lesson 4 • Year 8 KS3' : 'Lesson 3 • Year 8 KS3')
                  : 'Year 8 KS3'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              {activeLesson === 'L5'
                ? 'Lesson 5: How changing magnetic fields produce electric current'
                : activeLesson === 'L4'
                ? 'Lesson 4: How interacting magnetic fields create rotation'
                : 'Lesson 3: How electric current creates magnetic fields'}
            </p>
          </div>
        </div>

        {/* Master Lesson Switcher Pill (Hidden if viewing standalone lesson page) */}
        {!isStandalone && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveLesson('L3')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeLesson === 'L3'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>L3: Electromagnet</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLesson('L4')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeLesson === 'L4'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>L4: Electric Motor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLesson('L5')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeLesson === 'L5'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>L5: Induction</span>
            </button>
          </div>
        )}

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {activeLesson !== 'L5' && (
            <button
              type="button"
              onClick={() => setIsTheoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded-xl transition border border-sky-900/60"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Theory Guide</span>
            </button>
          )}

          {activeLesson === 'L4' && (
            <>
              {!isStandalone && (
                <a
                  href={`${import.meta.env.BASE_URL}lesson-4-electric-motor.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded-xl transition border border-sky-900/60"
                  title="Open Lesson 4 Motor Standalone HTML in new window"
                >
                  <span>Open L4 HTML</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleDownloadMotorStandalone}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition border border-slate-700 shadow-sm"
                title="Download Lesson 4 Motor as a single standalone offline HTML file"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Download L4 HTML</span>
              </button>
            </>
          )}

          {activeLesson === 'L3' && (
            <>
              {!isStandalone && (
                <a
                  href={`${import.meta.env.BASE_URL}lesson-3-electromagnet.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded-xl transition border border-sky-900/60"
                  title="Open Lesson 3 Electromagnet Standalone HTML in new window"
                >
                  <span>Open L3 HTML</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleDownloadStandalone}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition border border-slate-700 shadow-sm"
                title="Download Lesson 3 Electromagnet as a single standalone offline HTML file"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Download L3 HTML</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main View: Lesson 4 vs Lesson 5 vs Lesson 3 */}
      {activeLesson === 'L4' && <MotorExplorer />}
      {activeLesson === 'L5' && <InductionExplorer />}
      {activeLesson === 'L3' && (
        /* Lesson 3 Electromagnet Simulation */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sub-header for L3 Mode Toggle */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('practical')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'practical'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>5-Step Guided Practical</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'sandbox'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D Electromagnet Sandbox</span>
              </button>
            </div>

            {activeTab === 'practical' && (
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
                {L3_CHALLENGE_TABS.map((tab) => {
                  const isCurrent = activeStep === tab.id;
                  const isDone = completedSteps.has(tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveStep(tab.id)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            isCurrent ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.id}
                        </span>
                      )}
                      <span className="hidden md:inline">{tab.full}</span>
                      <span className="md:hidden">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeTab === 'practical' ? (
            <div className="flex-1 w-full overflow-y-auto bg-slate-100 text-slate-900 p-3 sm:p-5">
              <div className="max-w-6xl mx-auto space-y-4">
                {activeStep === 1 && (
                  <Challenge1Oersted
                    onComplete={() => handleStepComplete(1)}
                    isCompleted={completedSteps.has(1)}
                  />
                )}
                {activeStep === 2 && (
                  <Challenge2Progression
                    onComplete={() => handleStepComplete(2)}
                    isCompleted={completedSteps.has(2)}
                  />
                )}
                {activeStep === 3 && (
                  <Challenge3Core
                    onComplete={() => handleStepComplete(3)}
                    isCompleted={completedSteps.has(3)}
                  />
                )}
                {activeStep === 4 && (
                  <Challenge4Strength
                    onComplete={() => handleStepComplete(4)}
                    isCompleted={completedSteps.has(4)}
                  />
                )}
                {activeStep === 5 && (
                  <Challenge5FairTest
                    onComplete={() => handleStepComplete(5)}
                    isCompleted={completedSteps.has(5)}
                  />
                )}

                {/* Practical Step Bottom Navigation Controls */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${
                      activeStep === 1
                        ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'text-slate-700 border-slate-300 bg-white hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Challenge
                  </button>

                  <span className="font-semibold text-slate-600">
                    Lesson 3 • Challenge {activeStep} of 5
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                    disabled={activeStep === 5}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${
                      activeStep === 5
                        ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'text-slate-700 border-slate-300 bg-white hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    Next Challenge <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Lesson 3 3D Solenoid Sandbox View */
            <div className="flex-1 w-full relative bg-slate-950 overflow-hidden">
              <ThreeCanvas
                config={config}
                onProbeUpdate={setMeasurement}
              />

              {/* Stage Info Card at Bottom Center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md pointer-events-auto">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        config.mode === 'electromagnet'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      }`}
                    >
                      {config.mode === 'electromagnet' ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-slate-100">{currentStage.title}</h2>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({currentStage.subtitle})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                        {currentStage.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Viewport Controls Hint */}
              <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md shadow-sm">
                <span>Left click: Orbit</span>
                <span>•</span>
                <span>Right click: Pan</span>
                <span>•</span>
                <span>Scroll: Zoom</span>
              </div>

              {/* Control Panel (Top Left) */}
              <ControlPanel
                config={config}
                onChangeConfig={setConfig}
                onOpenExplanation={() => setIsExplanationOpen(true)}
              />

              {/* Compass Probe HUD (Bottom Right) */}
              <CompassProbeHud
                measurement={measurement}
                probePos={config.probePosition}
                onPosChange={(pos) => setConfig((prev) => ({ ...prev, probePosition: pos }))}
                isOpen={isCompassHudOpen}
                onToggle={() => setIsCompassHudOpen(!isCompassHudOpen)}
              />
            </div>
          )}
        </div>
      )}

      {/* Physics Explanation Dialog */}
      <PhysicsExplanation
        currentMode={config.mode}
        onSelectMode={(mode) => {
          setConfig((prev) => ({
            ...prev,
            mode,
            hasIronCore: mode === 'electromagnet',
          }));
          setIsExplanationOpen(false);
        }}
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
      />

      {/* KS3 Science Theory & Revision Guide Modal */}
      <TheoryModal isOpen={isTheoryOpen && activeLesson !== 'L5'} onClose={() => setIsTheoryOpen(false)} />
    </main>
  );
}
