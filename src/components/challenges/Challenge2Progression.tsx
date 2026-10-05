import { useState } from 'react';
import { ThreeCanvas } from '../ThreeCanvas';
import { SimulationConfig } from '../../types';
import { CheckCircle2, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface Challenge2Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function Challenge2Progression({ onComplete, isCompleted }: Challenge2Props) {
  const [selectedShape, setSelectedShape] = useState<'wire' | 'coil' | 'solenoid'>('wire');
  const [exploredShapes, setExploredShapes] = useState<Set<string>>(new Set(['wire']));
  const [explanationAnswer, setExplanationAnswer] = useState<'reinforce' | 'charge' | null>(null);
  const [current, setCurrent] = useState<number>(6.0);
  const [particleType, setParticleType] = useState<'electrons' | 'conventional'>('electrons');

  const handleSelectShape = (shape: 'wire' | 'coil' | 'solenoid') => {
    setSelectedShape(shape);
    setExploredShapes((prev) => {
      const next = new Set(prev);
      next.add(shape);
      return next;
    });
  };

  const [isSwitchClosed, setIsSwitchClosed] = useState(true);

  const allExplored = exploredShapes.size >= 3;

  // Configure 3D scene based on selected geometry
  const config: SimulationConfig = {
    mode: selectedShape === 'solenoid' ? 'solenoid' : selectedShape === 'coil' ? 'coil' : 'wire',
    current: isSwitchClosed ? current : 0,
    wireRadius: 0.12,
    coilRadius: 1.5,
    solenoidLength: 3.5,
    solenoidTurns: 12,
    hasIronCore: false,
    ironCorePermeability: 80,
    fieldLinesCount: selectedShape === 'wire' ? 12 : selectedShape === 'coil' ? 16 : 20,
    showFieldLines: isSwitchClosed,
    showFilingsPlane: false,
    filingsPlaneAxis: 'xz',
    filingsPlaneOffset: 0,
    filingsDensity: 24,
    showCompassProbe: true,
    probePosition: selectedShape === 'wire' ? [1.4, 0, 0] : [0, 0, 0],
    showCurrentParticles: true,
    showRightHandRule: isSwitchClosed && selectedShape !== 'wire',
    showPoles: isSwitchClosed && selectedShape === 'solenoid',
    fieldLineSpeed: 1.0,
    sliceCutaway: false,
    particleType: particleType,
    switchClosed: isSwitchClosed,
    showCircuit: true,
  };

  const isStep2Done = allExplored && explanationAnswer === 'reinforce';

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Challenge 2 — Wire → Loop → Coil
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted || isStep2Done
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : allExplored
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}
        >
          {isCompleted || isStep2Done
            ? 'Concept Mastered'
            : allExplored
            ? 'Explain the Evidence'
            : `${exploredShapes.size} / 3 Explored`}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Instruction */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-slate-800 text-sm">
          Compare the same conductor as a <strong>straight wire</strong>, <strong>single loop</strong>, and <strong>multi-turn coil (solenoid)</strong>. Observe what happens to the magnetic field strength and shape through the centre.
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3D Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <ThreeCanvas
                config={config}
                onToggleSwitch={() => setIsSwitchClosed((s) => !s)}
                onToggleBatteryDirection={() => setCurrent((c) => -c)}
                onToggleParticleType={() =>
                  setParticleType((p) => (p === 'electrons' ? 'conventional' : 'electrons'))
                }
              />

              {/* 3D Title Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow">
                <span className="font-semibold text-sky-400">Geometry Mode:</span>{' '}
                {selectedShape === 'wire'
                  ? '1. Straight Wire'
                  : selectedShape === 'coil'
                  ? '2. Single Loop'
                  : '3. Multi-Turn Coil (Solenoid)'}
              </div>

              {/* Dynamic Overlay Callout */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 shadow space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedShape === 'wire' && 'Straight Wire: Spread-out circular field'}
                  {selectedShape === 'coil' && 'Single Loop: Field lines squeezed through the centre hole'}
                  {selectedShape === 'solenoid' && 'Solenoid: Multiple turns reinforce into a powerful uniform field!'}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedShape === 'wire' &&
                    'The circular field is weakest further away from the wire. There is no central focal point.'}
                  {selectedShape === 'coil' &&
                    'Bending the wire causes all the inner field lines to enter the same face and point in the same direction.'}
                  {selectedShape === 'solenoid' &&
                    'Every turn adds its own magnetic field. Inside the cylinder, all loops point together to create distinct North and South poles, matching a bar magnet!'}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-slate-900 rounded-lg text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-amber-600" /> Copper Conductor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky-400" /> Magnetic Field Lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">N</span> North Pole
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">S</span> South Pole
              </span>
            </div>
          </div>

          {/* Right: Shape selector and explanation question */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Exploration Buttons */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Conductor Shape
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    allExplored ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {exploredShapes.size} / 3 explored
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: 'wire',
                    num: '1',
                    title: 'Straight Wire',
                    desc: 'Circular field surrounding the straight line',
                  },
                  {
                    key: 'coil',
                    num: '2',
                    title: 'Single Loop',
                    desc: 'Traps and focuses field lines through the centre',
                  },
                  {
                    key: 'solenoid',
                    num: '3',
                    title: 'Multi-Turn Coil (Solenoid)',
                    desc: 'Loops combine to create a bar-magnet field',
                  },
                ].map((s) => {
                  const isCurrent = selectedShape === s.key;
                  const isExplored = exploredShapes.has(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleSelectShape(s.key as any)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-sm'
                          : 'bg-white border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isExplored
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isExplored ? '✓' : s.num}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{s.title}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{s.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Unlocks Once All 3 Explored */}
            {allExplored && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Question: Why is the magnetic field through the centre of a coil so much stronger than the field from a single turn carrying the same current?
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      key: 'reinforce',
                      label:
                        'Fields from different turns point in the same general direction through the centre and reinforce (add together).',
                      isCorrect: true,
                    },
                    {
                      key: 'charge',
                      label: 'The coil creates extra electric charge out of nowhere.',
                      isCorrect: false,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setExplanationAnswer(opt.key as any)}
                      className={`text-left text-xs sm:text-sm font-semibold p-3 rounded-xl border transition-all ${
                        explanationAnswer === opt.key
                          ? opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                            : 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-300'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {explanationAnswer === 'reinforce' && (
                  <div className="text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-3 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Correct Explanation!
                    </div>
                    <p>
                      Each individual turn of wire carries current that creates its own magnetic field. Because the turns are wound in the same direction, their magnetic field lines through the center point the same way and <strong>add together constructively (superposition)</strong>!
                    </p>
                  </div>
                )}

                {explanationAnswer === 'charge' && (
                  <div className="text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg p-3">
                    <strong>Not quite:</strong> Electric charge is conserved (it cannot be created or destroyed). The stronger central field comes from multiple loops adding their fields together!
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!isStep2Done}
                onClick={onComplete}
                className={`w-full font-bold text-sm px-5 py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 ${
                  isStep2Done
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE TO CHALLENGE 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
