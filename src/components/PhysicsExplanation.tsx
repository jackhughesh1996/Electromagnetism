import { useState } from 'react';
import { BookOpen, X, Zap, Layers, Magnet, CheckCircle2, HelpCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SimulationMode } from '../types';

interface PhysicsExplanationProps {
  currentMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PhysicsExplanation({
  currentMode,
  onSelectMode,
  isOpen,
  onClose,
}: PhysicsExplanationProps) {
  const [activeTab, setActiveTab] = useState<'howItWorks' | 'threeWays' | 'polesRHR' | 'quiz'>('howItWorks');

  // Interactive Quiz state for Year 8 revision
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number | null }>({
    1: null,
    2: null,
    3: null,
  });

  const handleSelectQuiz = (qNum: number, choiceIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qNum]: choiceIdx }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        id="physics-explanation-modal"
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Year 8 Electromagnet Science Guide</h2>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold border border-sky-500/30">
                  KS3 Science
                </span>
              </div>
              <p className="text-xs text-slate-400">Learn how electricity makes a magnet and how to make it stronger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('howItWorks')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'howItWorks'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. How It Works (4 Steps)</span>
          </button>
          <button
            onClick={() => setActiveTab('threeWays')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'threeWays'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. The 3 Ways to Make It Stronger</span>
          </button>
          <button
            onClick={() => setActiveTab('polesRHR')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'polesRHR'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>3. Finding North & South Poles</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Quick Quiz & Everyday Uses</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: HOW IT WORKS (4 STEPS) */}
          {activeTab === 'howItWorks' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-slate-100 font-semibold block mb-0.5">What is an electromagnet?</strong>
                  An electromagnet is a magnet made using electricity. Unlike permanent fridge magnets, an electromagnet can be turned <span className="text-emerald-400 font-bold">ON</span> and <span className="text-rose-400 font-bold">OFF</span> with a switch, and its strength can be adjusted!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => onSelectMode('wire')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    currentMode === 'wire'
                      ? 'bg-sky-950/40 border-sky-500/70'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Step 1</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Wire</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Electric Current Makes a Magnetic Field</h4>
                  <p className="text-xs text-slate-400">
                    When electricity flows through any straight wire, it produces a circular magnetic field around it. The field is strongest right next to the wire.
                  </p>
                </div>

                <div
                  onClick={() => onSelectMode('coil')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    currentMode === 'coil'
                      ? 'bg-sky-950/40 border-sky-500/70'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Step 2</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Single Loop</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Bending the Wire Concentrates the Field</h4>
                  <p className="text-xs text-slate-400">
                    When you bend the wire into a circle, all the circular magnetic field lines enter through one side and come out the other. The magnetic force is concentrated right in the centre!
                  </p>
                </div>

                <div
                  onClick={() => onSelectMode('solenoid')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    currentMode === 'solenoid'
                      ? 'bg-sky-950/40 border-sky-500/70'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Step 3</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Coil (Solenoid)</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">A Solenoid Acts Like a Bar Magnet</h4>
                  <p className="text-xs text-slate-400">
                    A long coil of wire is called a <strong>solenoid</strong>. When many loops are stacked together, their magnetic fields join up. It creates a magnetic field with a <strong>North pole</strong> at one end and a <strong>South pole</strong> at the other!
                  </p>
                </div>

                <div
                  onClick={() => onSelectMode('electromagnet')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    currentMode === 'electromagnet'
                      ? 'bg-amber-950/40 border-amber-500/70'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 4 (Electromagnet)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">Supercharged!</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Add a Soft Iron Core</h4>
                  <p className="text-xs text-slate-400">
                    Pushing a soft iron rod or nail inside the solenoid creates an <strong>electromagnet</strong>. The iron becomes strongly magnetized, making the magnet hundreds of times stronger!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE 3 WAYS TO MAKE IT STRONGER */}
          {activeTab === 'threeWays' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wide mb-1">
                  ⭐ The Top Year 8 Exam Question:
                </h3>
                <p className="text-xs text-slate-200">
                  "Name the <strong>three ways</strong> to increase the strength of an electromagnet:"
                </p>
              </div>

              <div className="space-y-3">
                {/* Way 1 */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Increase the Electric Current (Amps)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      More current flowing through the wire means a stronger magnetic field. In the classroom lab, you do this by adding more batteries or turning up the power pack dial.
                    </p>
                    <div className="mt-2 text-[11px] bg-slate-900 px-2.5 py-1 rounded text-amber-300 font-mono inline-block">
                      More Current ➔ Stronger Magnet ➔ Picks up more paperclips
                    </div>
                  </div>
                </div>

                {/* Way 2 */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Increase the Number of Turns (Coils)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Winding more turns of wire around the core adds more loops. Since every loop contributes its own magnetic field, doubling the turns roughly doubles the total magnetic strength!
                    </p>
                    <div className="mt-2 text-[11px] bg-slate-900 px-2.5 py-1 rounded text-sky-300 font-mono inline-block">
                      More Coils ➔ Field loops add together ➔ Stronger Magnet
                    </div>
                  </div>
                </div>

                {/* Way 3 */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Add a Soft Iron Core</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Placing a core made of <strong>soft iron</strong> inside the coil concentrates and channels the magnetic field lines. It makes the magnet vastly stronger than an air coil alone!
                    </p>
                    <div className="mt-2 p-2 rounded bg-slate-900/90 text-xs text-slate-300 border border-slate-800">
                      <strong className="text-emerald-400">Why use Soft Iron instead of Steel?</strong><br />
                      Soft iron magnetises easily when the current is on, and <em>instantly demagnetises</em> when the power is switched off. Steel stays permanently magnetised, so you wouldn't be able to turn the magnet off!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINDING POLES & RIGHT-HAND RULE */}
          {activeTab === 'polesRHR' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">N</span>
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">S</span>
                    <h4 className="font-semibold text-slate-100 text-sm">Magnetic Field Rules</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span><strong>Direction:</strong> Magnetic field lines always run from <strong>North (N) to South (S)</strong> outside the magnet.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span><strong>Density:</strong> Where the lines are close together, the field is <strong>strongest</strong> (near the poles and inside the coil).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">•</span>
                      <span><strong>Attraction & Repulsion:</strong> Opposite poles attract (N attracts S). Like poles repel (N pushes N away).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-slate-100 text-sm mb-2 text-emerald-400 flex items-center gap-1.5">
                    <span>👍 Right-Hand Grip Rule</span>
                  </h4>
                  <p className="text-xs text-slate-300 mb-2">
                    How do you know which end of the coil is the North pole?
                  </p>
                  <ol className="space-y-1.5 text-xs text-slate-300 pl-4 list-decimal">
                    <li>Hold your <strong>right hand</strong> out.</li>
                    <li>Wrap your <strong>fingers</strong> around the coil in the direction the electric current is flowing.</li>
                    <li>Your <strong>thumb</strong> will point directly towards the <strong>North Pole</strong>!</li>
                  </ol>
                  <div className="mt-2 text-[11px] bg-slate-900/90 p-2 rounded text-slate-300 border border-slate-800">
                    💡 <em>Try it in the 3D lab! Click the "Right-Hand Grip Guide" toggle or click "Reverse Polarity" to watch the poles flip!</em>
                  </div>
                </div>
              </div>

              {/* What happens when you switch off or reverse current */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-slate-200">What happens when you change the circuit?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2.5 rounded bg-slate-900">
                    <strong className="text-rose-400 block mb-0.5">Switch Off the Current:</strong>
                    The magnetic field instantly vanishes! Any paperclips or scrap iron held by the magnet fall off.
                  </div>
                  <div className="p-2.5 rounded bg-slate-900">
                    <strong className="text-amber-400 block mb-0.5">Swap Battery Terminals (+ / -):</strong>
                    The current flows in the opposite direction. The magnetic field flips, swapping the North and South poles!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK QUIZ & USES */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {/* Everyday uses */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Everyday Uses of Electromagnets
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <div className="bg-slate-900 p-2 rounded">
                    <strong className="text-sky-300 block">🏗️ Scrapyard Cranes</strong>
                    Turn on to pick up scrap cars, turn off to release them into a shredder.
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <strong className="text-emerald-300 block">🔔 Electric Bells</strong>
                    The magnet pulls a hammer to strike the bell, breaking the circuit in a continuous loop.
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <strong className="text-amber-300 block">🚪 Mag Locks</strong>
                    Heavy security doors in schools held shut by an electromagnet until a card cuts power.
                  </div>
                </div>
              </div>

              {/* Interactive Quiz */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Test Yourself: Year 8 Quick Quiz
                </h4>

                {/* Question 1 */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-slate-200">
                    1. Which of the following will NOT make an electromagnet stronger?
                  </p>
                  <div className="space-y-1">
                    {[
                      'Adding more turns of wire to the coil',
                      'Increasing the electric current',
                      'Painting the wire a different colour',
                      'Inserting a soft iron core',
                    ].map((option, idx) => {
                      const isSelected = quizAnswers[1] === idx;
                      const isCorrect = idx === 2;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectQuiz(1, idx)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg border transition flex items-center justify-between ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                : 'bg-rose-950/60 border-rose-500 text-rose-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <span className="font-bold text-[11px]">
                              {isCorrect ? '✓ Correct!' : '✗ Not quite!'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-slate-200">
                    2. Why is soft iron used for the core instead of steel?
                  </p>
                  <div className="space-y-1">
                    {[
                      'Iron is cheaper than steel',
                      'Iron loses its magnetism when current is off; steel stays permanently magnetized',
                      'Steel conducts electricity better',
                      'Iron is lighter than steel',
                    ].map((option, idx) => {
                      const isSelected = quizAnswers[2] === idx;
                      const isCorrect = idx === 1;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectQuiz(2, idx)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg border transition flex items-center justify-between ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                : 'bg-rose-950/60 border-rose-500 text-rose-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <span className="font-bold text-[11px]">
                              {isCorrect ? '✓ Correct!' : '✗ Try again!'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 3 */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-slate-200">
                    3. Outside a magnet or solenoid, which direction do magnetic field lines point?
                  </p>
                  <div className="space-y-1">
                    {[
                      'From South to North',
                      'From North to South',
                      'In random directions',
                      'Only towards the centre',
                    ].map((option, idx) => {
                      const isSelected = quizAnswers[3] === idx;
                      const isCorrect = idx === 1;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectQuiz(3, idx)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg border transition flex items-center justify-between ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                : 'bg-rose-950/60 border-rose-500 text-rose-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <span className="font-bold text-[11px]">
                              {isCorrect ? '✓ Correct! (N to S)' : '✗ Not quite!'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Tip: Switch between the 4 steps at any time to explore the 3D field!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition"
          >
            Back to 3D Simulation
          </button>
        </div>
      </div>
    </div>
  );
}

