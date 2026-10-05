import React, { useState } from 'react';
import { MotorExplorer } from './components/motor/MotorExplorer';
import { TheoryModal } from './components/TheoryModal';
import { BookOpen } from 'lucide-react';

export function Lesson4App() {
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Master Top Navigation Bar without L3/L4 switcher */}
      <header className="z-30 h-14 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
            🔄
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white leading-none">
                3D Electric Motor Explorer
              </h1>
              <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 border border-sky-800 px-1.5 py-0.5 rounded-md hidden md:inline">
                Lesson 4 • Year 8 KS3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              Investigate the Motor Effect, Fleming's Left-Hand Rule, force pairs & split-ring commutator rotation
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTheoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded-xl transition border border-sky-900/60"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory Guide</span>
          </button>
        </div>
      </header>

      {/* Main View: Lesson 4 3D Electric Motor Explorer */}
      <MotorExplorer />

      {/* KS3 Science Theory & Revision Guide Modal */}
      <TheoryModal isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
    </main>
  );
}
export default Lesson4App;
