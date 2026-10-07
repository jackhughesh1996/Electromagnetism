import { useState } from 'react';
import { InductionCanvas } from '../InductionCanvas';
import { InductionMeter } from '../InductionMeter';
import { InductionConfig, InductionState } from '../../../types';
import { calculateInductionPhysics } from '../../../physics/inductionPhysics';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function InductionChallenge2ReverseCurrent({ onComplete, isCompleted }: Props) {
  const [magnetFlipped, setMagnetFlipped] = useState(false);
  const [magnetPos, setMagnetPos] = useState(3.6);
  const [testStage, setTestStage] = useState<1 | 2 | 3 | 4>(1);

  // Predictions before reveal: 'left' | 'zero' | 'right'
  const [pred, setPred] = useState<'left' | 'zero' | 'right' | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [conclusionAns, setConclusionAns] = useState<string | null>(null);

  const config: InductionConfig = {
    magnetStrength: 'standard',
    magnetFlipped: magnetFlipped,
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

  const stageDescriptions = {
    1: {
      title: 'Step 1: North Pole Enters Coil',
      sub: 'The magnet (North pole facing left) moves into the coil.',
      targetX: 0.0,
      vel: -4.5,
      actualDeflection: 'left' as const,
    },
    2: {
      title: 'Step 2: North Pole Exits Coil',
      sub: 'The magnet moves back out of the coil.',
      targetX: 3.6,
      vel: 4.5,
      actualDeflection: 'right' as const,
    },
    3: {
      title: 'Step 3: South Pole Enters Coil',
      sub: 'Poles are flipped! South pole facing left moves into the coil.',
      targetX: 0.0,
      vel: -4.5,
      actualDeflection: 'right' as const,
    },
    4: {
      title: 'Step 4: South Pole Exits Coil',
      sub: 'South pole moves back out of the coil.',
      targetX: 3.6,
      vel: 4.5,
      actualDeflection: 'left' as const,
    },
  };

  const runTestMotion = () => {
    setHasRevealed(true);
    const curr = stageDescriptions[testStage];
    let currentX = magnetPos;
    const targetX = curr.targetX;
    const vel = curr.vel;

    const interval = setInterval(() => {
      currentX += vel * 0.02;
      const finished = vel < 0 ? currentX <= targetX : currentX >= targetX;
      if (finished) {
        currentX = targetX;
        clearInterval(interval);
        setMagnetPos(targetX);
        setState(calculateInductionPhysics(targetX, 0, 0, 0, config));
      } else {
        setMagnetPos(currentX);
        setState(calculateInductionPhysics(currentX, 0, vel, 0, config));
      }
    }, 20);
  };

  const nextStep = () => {
    setHasRevealed(false);
    setPred(null);
    if (testStage === 1) {
      setTestStage(2);
    } else if (testStage === 2) {
      setMagnetFlipped(true);
      setTestStage(3);
    } else if (testStage === 3) {
      setTestStage(4);
    }
  };

  const handleSelectConclusion = (choice: string) => {
    setConclusionAns(choice);
    if (choice === 'both_reverse') {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            2
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Challenge 2 — What Makes the Current Reverse?
            </h2>
            <p className="text-xs text-slate-400">
              Predict and observe how reversing direction or flipping magnetic poles alters the current.
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
        {/* Left: 3D Stage & Meter */}
        <div className="lg:col-span-7 flex flex-col gap-3">
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

            {/* Pole orientation indicator */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 shadow flex items-center gap-2">
              <span className="font-semibold text-slate-200">Magnet Facing Coil:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  config.magnetFlipped ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {config.magnetFlipped ? 'South Pole (S)' : 'North Pole (N)'}
              </span>
            </div>
          </div>

          {/* Test Stage Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {stageDescriptions[testStage].title}
              </span>
              <span className="text-[11px] text-slate-500">Step {testStage} of 4</span>
            </div>
            <p className="text-xs text-slate-600">{stageDescriptions[testStage].sub}</p>

            {/* Prediction Selection */}
            {!hasRevealed ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Predict: In which direction will the galvanometer deflect?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPred('left')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      pred === 'left'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ← Deflect Left
                  </button>
                  <button
                    onClick={() => setPred('zero')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      pred === 'zero'
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    0 Stay Zero
                  </button>
                  <button
                    onClick={() => setPred('right')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      pred === 'right'
                        ? 'bg-sky-600 text-white border-sky-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Deflect Right →
                  </button>
                </div>

                <button
                  onClick={runTestMotion}
                  disabled={!pred}
                  className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                    pred
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Prediction & Run Motion
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
                  <span>
                    Your prediction was:{' '}
                    <strong>{pred === 'left' ? '← Left' : pred === 'right' ? 'Right →' : 'Zero 0'}</strong>
                  </span>
                  <span>
                    Actual Result:{' '}
                    <strong className="text-blue-600">
                      {stageDescriptions[testStage].actualDeflection === 'left' ? '← Left' : 'Right →'}
                    </strong>
                  </span>
                </div>

                {testStage < 4 ? (
                  <button
                    onClick={nextStep}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Step {testStage + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold block text-center py-1">
                    ✓ All 4 motion and pole combinations tested!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scientific Deduction */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reversal Rule Summary
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>1. Motion Direction:</strong> Moving into the coil deflects the needle one way; moving out of the coil deflects it the opposite way!
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>2. Pole Orientation:</strong> Inserting a North pole deflects left; inserting a South pole flips the current and deflects right!
              </div>
            </div>
          </div>

          {/* Final Conclusion Question */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Which changes can reverse the direction of induced current?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleSelectConclusion('motion_only')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusionAns === 'motion_only'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Only reversing the direction of motion.
              </button>

              <button
                onClick={() => handleSelectConclusion('both_reverse')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusionAns === 'both_reverse'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Either reversing the direction of motion OR flipping the magnet's poles.
              </button>

              <button
                onClick={() => handleSelectConclusion('speed_only')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  conclusionAns === 'speed_only'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Moving the magnet faster reverses the direction.
              </button>
            </div>

            {conclusionAns === 'motion_only' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Look back at Step 3! Simply flipping from North to South also reversed the current, even when moving in the same direction.
                </span>
              </div>
            )}

            {conclusionAns === 'speed_only' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Speed affects how large the current is, not which direction it flows!
                </span>
              </div>
            )}

            {conclusionAns === 'both_reverse' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>Spot on!</strong> Reversing either the physical motion (in vs out) OR the magnetic pole (N vs S) reverses the direction of the induced electrical current!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
