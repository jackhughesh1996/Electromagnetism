import { useState } from 'react';
import { InductionChallenge1ChangingField } from './challenges/InductionChallenge1ChangingField';
import { InductionChallenge2ReverseCurrent } from './challenges/InductionChallenge2ReverseCurrent';
import { InductionChallenge3Strength } from './challenges/InductionChallenge3Strength';
import { InductionChallenge4Signal } from './challenges/InductionChallenge4Signal';
import { InductionChallenge5GuitarPickup } from './challenges/InductionChallenge5GuitarPickup';
import { InductionSandbox } from './InductionSandbox';
import {
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const L5_CHALLENGE_TABS = [
  { id: 1, label: '1. Change', full: '1. Changing Field' },
  { id: 2, label: '2. Reverse', full: '2. Reverse Current' },
  { id: 3, label: '3. Strength', full: '3. Make It Stronger' },
  { id: 4, label: '4. Signal', full: '4. Read the Signal' },
  { id: 5, label: '5. Pickup', full: '5. Guitar Pickup' },
];

export function InductionExplorer() {
  const [activeTab, setActiveTab] = useState<'practical' | 'sandbox'>('practical');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleCompleteStep = (stepNumber: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepNumber]));
    if (stepNumber < 5) {
      setActiveStep(stepNumber + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-0">
      {/* Sub-header Navigation for Lesson 5 */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-3">
        {/* Left: Mode toggle (Practical vs Sandbox) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('practical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'practical'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>5-Step Guided Practical</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3D Induction Free Sandbox</span>
          </button>
        </div>

        {/* Right: Step Indicator for Guided Practical */}
        {activeTab === 'practical' && (
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            {L5_CHALLENGE_TABS.map((tab) => {
              const isCurrent = activeStep === tab.id;
              const isDone = completedSteps.has(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStep(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
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

      {/* Main Content Area */}
      {activeTab === 'practical' ? (
        <div className="flex-1 p-3 sm:p-5 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeStep === 1 && (
            <InductionChallenge1ChangingField
              onComplete={() => handleCompleteStep(1)}
              isCompleted={completedSteps.has(1)}
            />
          )}
          {activeStep === 2 && (
            <InductionChallenge2ReverseCurrent
              onComplete={() => handleCompleteStep(2)}
              isCompleted={completedSteps.has(2)}
            />
          )}
          {activeStep === 3 && (
            <InductionChallenge3Strength
              onComplete={() => handleCompleteStep(3)}
              isCompleted={completedSteps.has(3)}
            />
          )}
          {activeStep === 4 && (
            <InductionChallenge4Signal
              onComplete={() => handleCompleteStep(4)}
              isCompleted={completedSteps.has(4)}
            />
          )}
          {activeStep === 5 && (
            <InductionChallenge5GuitarPickup
              onComplete={() => handleCompleteStep(5)}
              isCompleted={completedSteps.has(5)}
            />
          )}

          {/* Bottom Step Navigation Helper */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
            <button
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
              Lesson 5 • Challenge {activeStep} of 5
            </span>

            <button
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
      ) : (
        <InductionSandbox />
      )}
    </div>
  );
}
