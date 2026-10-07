import React, { useState, useEffect, useRef } from 'react';
import { InductionCanvas } from './InductionCanvas';
import { InductionMeter } from './InductionMeter';
import { InductionGraph } from './InductionGraph';
import { InductionConfig, InductionState } from '../../types';
import { calculateInductionPhysics } from '../../physics/inductionPhysics';
import {
  Play,
  Square,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Gauge,
  Sliders,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function InductionSandbox() {
  const [config, setConfig] = useState<InductionConfig>({
    magnetStrength: 'standard',
    magnetFlipped: false,
    coilTurns: 50,
    motionSpeed: 'medium',
    showFieldLines: true,
    showFieldDisc: true,
    showCurrentIndicator: true,
    showGraph: true,
    showMeter: true,
    autoMode: 'none',
  });

  // Apparatus spatial state
  const [magnetPos, setMagnetPos] = useState<number>(3.6); // Start outside coil on the right
  const [coilPos, setCoilPos] = useState<number>(0.0);
  const [magnetVel, setMagnetVel] = useState<number>(0.0);
  const [coilVel, setCoilVel] = useState<number>(0.0);

  // Live physics state
  const [physicsState, setPhysicsState] = useState<InductionState>(() =>
    calculateInductionPhysics(3.6, 0.0, 0.0, 0.0, {
      magnetStrength: 'standard',
      magnetFlipped: false,
      coilTurns: 50,
      motionSpeed: 'medium',
      showFieldLines: true,
      showFieldDisc: true,
      showCurrentIndicator: true,
      showGraph: true,
      showMeter: true,
      autoMode: 'none',
    })
  );

  // Signal history for oscilloscope graph (bounded array)
  const [signalHistory, setSignalHistory] = useState<number[]>(() => new Array(160).fill(0));

  // Controls UI state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Refs for animation loop
  const magnetPosRef = useRef(magnetPos);
  magnetPosRef.current = magnetPos;
  const coilPosRef = useRef(coilPos);
  coilPosRef.current = coilPos;
  const magnetVelRef = useRef(magnetVel);
  magnetVelRef.current = magnetVel;
  const coilVelRef = useRef(coilVel);
  coilVelRef.current = coilVel;
  const configRef = useRef(config);
  configRef.current = config;

  // Auto animation state
  const autoPhaseRef = useRef<number>(0);

  // Main simulation tick
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let sampleCounter = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const currentConfig = configRef.current;
      let targetMagnetVel = magnetVelRef.current;
      let targetCoilVel = coilVelRef.current;

      // Handle automatic motion modes
      if (currentConfig.autoMode === 'in_out') {
        const speedMultiplier =
          currentConfig.motionSpeed === 'slow' ? 1.6 : currentConfig.motionSpeed === 'fast' ? 4.8 : 3.0;
        autoPhaseRef.current += dt * speedMultiplier;
        // Oscillate magnet in and out between +3.6 and -1.0
        // Center = 1.3, Amplitude = 2.3
        const prevP = magnetPosRef.current;
        const newP = 1.3 + Math.cos(autoPhaseRef.current) * 2.4;
        targetMagnetVel = (newP - prevP) / dt;
        magnetPosRef.current = newP;
        targetCoilVel = 0;
        coilPosRef.current = 0;
      } else if (currentConfig.autoMode === 'move_both') {
        // Move magnet AND coil together at identical velocity!
        const speed = currentConfig.motionSpeed === 'slow' ? 1.4 : currentConfig.motionSpeed === 'fast' ? 3.6 : 2.4;
        autoPhaseRef.current += dt * speed;
        // Constant relative distance (e.g. separation = 3.2)
        const prevC = coilPosRef.current;
        const newC = Math.sin(autoPhaseRef.current) * 1.8;
        const v = (newC - prevC) / dt;
        coilPosRef.current = newC;
        magnetPosRef.current = newC + 3.2; // fixed separation
        targetCoilVel = v;
        targetMagnetVel = v; // EXACT same speed!
      } else {
        // Manual move / decaying impulse
        magnetPosRef.current = Math.max(-5.5, Math.min(5.5, magnetPosRef.current + targetMagnetVel * dt));
        coilPosRef.current = Math.max(-3.5, Math.min(3.5, coilPosRef.current + targetCoilVel * dt));

        // Smoothly bring manual velocity to 0 when key/button is released
        targetMagnetVel *= 0.82;
        if (Math.abs(targetMagnetVel) < 0.05) targetMagnetVel = 0;
        targetCoilVel *= 0.82;
        if (Math.abs(targetCoilVel) < 0.05) targetCoilVel = 0;
      }

      magnetVelRef.current = targetMagnetVel;
      coilVelRef.current = targetCoilVel;

      // Calculate pure physics
      const nextState = calculateInductionPhysics(
        magnetPosRef.current,
        coilPosRef.current,
        targetMagnetVel,
        targetCoilVel,
        currentConfig
      );

      // Throttled UI state updates to maintain pristine 60 FPS
      sampleCounter++;
      if (sampleCounter % 2 === 0) {
        setMagnetPos(magnetPosRef.current);
        setCoilPos(coilPosRef.current);
        setMagnetVel(targetMagnetVel);
        setCoilVel(targetCoilVel);
        setPhysicsState(nextState);

        // Update rolling history buffer (capped at 160 elements)
        setSignalHistory((prev) => {
          const next = [...prev.slice(1), nextState.inducedCurrent];
          return next;
        });
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Motion control triggers
  const moveMagnetIn = (fast = false) => {
    const speed = config.motionSpeed === 'slow' ? 2.5 : config.motionSpeed === 'fast' ? 6.5 : 4.5;
    magnetVelRef.current = -speed * (fast ? 1.4 : 1.0);
    setConfig((prev) => ({ ...prev, autoMode: 'none' }));
  };

  const moveMagnetOut = (fast = false) => {
    const speed = config.motionSpeed === 'slow' ? 2.5 : config.motionSpeed === 'fast' ? 6.5 : 4.5;
    magnetVelRef.current = speed * (fast ? 1.4 : 1.0);
    setConfig((prev) => ({ ...prev, autoMode: 'none' }));
  };

  const stopAllMotion = () => {
    magnetVelRef.current = 0;
    coilVelRef.current = 0;
    setConfig((prev) => ({ ...prev, autoMode: 'none' }));
  };

  const resetPositions = () => {
    stopAllMotion();
    setMagnetPos(3.6);
    magnetPosRef.current = 3.6;
    setCoilPos(0);
    coilPosRef.current = 0;
    autoPhaseRef.current = 0;
    setSignalHistory(new Array(160).fill(0));
  };

  const handleManualDrag = (newX: number) => {
    const dt = 0.016;
    const v = (newX - magnetPosRef.current) / dt;
    magnetVelRef.current = v;
    magnetPosRef.current = newX;
    setMagnetPos(newX);
    setConfig((prev) => ({ ...prev, autoMode: 'none' }));
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex flex-col">
      {/* 3D Viewport Canvas */}
      <div className="w-full flex-1 relative min-h-0">
        <InductionCanvas
          config={config}
          magnetPos={magnetPos}
          coilPos={coilPos}
          inductionState={physicsState}
          onDragMagnet={handleManualDrag}
        />

        {/* Top-Right Qualitative Measurement HUD */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 max-w-xs pointer-events-auto">
          {/* Key Induction Metric Readout */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Induction Readout
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  Math.abs(physicsState.inducedCurrent) > 1.5
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {Math.abs(physicsState.inducedCurrent) > 1.5 ? '⚡ Current Flowing' : 'No Current (0)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Field Through Coil</div>
                <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
                  <span>{physicsState.fieldStrengthDescriptor}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(Math.abs(physicsState.fieldThroughCoil))}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Field Change Rate</div>
                <div
                  className={`text-sm font-bold mt-0.5 flex items-center justify-between ${
                    physicsState.fieldChangeDescriptor === 'Fast'
                      ? 'text-amber-400'
                      : physicsState.fieldChangeDescriptor === 'Slow'
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  }`}
                >
                  <span>{physicsState.fieldChangeDescriptor}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(Math.abs(physicsState.rateOfChange))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Induced Direction</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  {physicsState.currentDirectionDescriptor === '←'
                    ? 'Deflecting Left (←)'
                    : physicsState.currentDirectionDescriptor === '→'
                    ? 'Deflecting Right (→)'
                    : 'Resting at Zero (0)'}
                </div>
              </div>
              <div
                className={`text-lg font-black px-3 py-0.5 rounded-lg border font-mono ${
                  physicsState.currentDirectionDescriptor === '←'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : physicsState.currentDirectionDescriptor === '→'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {physicsState.currentDirectionDescriptor}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-snug pt-0.5">
              💡 <em>Current is only produced while the magnetic field inside the coil is actively changing!</em>
            </div>
          </div>

          {/* Galvanometer Meter Visual */}
          {config.showMeter && (
            <InductionMeter
              deflection={physicsState.meterDeflection}
              value={physicsState.inducedCurrent}
              size="md"
            />
          )}

          {/* Oscilloscope Rolling Graph Visual */}
          {config.showGraph && <InductionGraph history={signalHistory} />}
        </div>

        {/* 3D Viewport Controls Hint */}
        <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md shadow-sm">
          <span>Click & drag magnet along axis</span>
          <span>•</span>
          <span>Orbit 3D: Left click drag</span>
          <span>•</span>
          <span>Zoom: Scroll</span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 shrink-0 z-20 shadow-2xl backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
          {/* Top Row: Primary Motion Controls & Modes */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Primary Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => moveMagnetIn()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                title="Move bar magnet into the coil"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Move In (←)</span>
              </button>

              <button
                onClick={() => moveMagnetOut()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                title="Move bar magnet out of the coil"
              >
                <span>Move Out (→)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={stopAllMotion}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  config.autoMode === 'none' && Math.abs(magnetVel) < 0.1
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/80 shadow'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Immediately stop all motion"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop (0)</span>
              </button>

              {/* Automatic Motion Toggle */}
              <button
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    autoMode: prev.autoMode === 'in_out' ? 'none' : 'in_out',
                  }))
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.autoMode === 'in_out'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Automatically move magnet in and out continuously"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Auto In/Out</span>
              </button>

              {/* Crucial Concept: Move Both Together */}
              <button
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    autoMode: prev.autoMode === 'move_both' ? 'none' : 'move_both',
                  }))
                }
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.autoMode === 'move_both'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700'
                }`}
                title="Move magnet and coil together at identical speed to prove zero relative change"
              >
                <span>Move Both Together</span>
              </button>

              <button
                onClick={resetPositions}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                title="Reset apparatus positions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Position Slider alternative to dragging */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Magnet Position:</span>
              <input
                type="range"
                min="-4.5"
                max="5.0"
                step="0.1"
                value={magnetPos}
                onChange={(e) => handleManualDrag(parseFloat(e.target.value))}
                className="w-32 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-sky-400 text-[11px] w-12 text-right">
                {magnetPos > 0 ? `+${magnetPos.toFixed(1)}` : magnetPos.toFixed(1)}
              </span>
            </div>

            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <span>{isPanelCollapsed ? 'Show Variables' : 'Hide Variables'}</span>
              {isPanelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Row: Variable Controls (Speed, Magnet, Turns, Toggles) */}
          {!isPanelCollapsed && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Motion Speed Selection */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 px-2">Speed:</span>
                {(['slow', 'medium', 'fast'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setConfig((prev) => ({ ...prev, motionSpeed: s }))}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                      config.motionSpeed === s
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Magnet Configuration */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 px-2">Magnet:</span>
                  {(['standard', 'strong'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setConfig((prev) => ({ ...prev, magnetStrength: m }))}
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                        config.magnetStrength === m
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setConfig((prev) => ({ ...prev, magnetFlipped: !prev.magnetFlipped }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                    config.magnetFlipped
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Flip North and South poles of the magnet"
                >
                  <span>Flip Poles ({config.magnetFlipped ? 'S ➔ N' : 'N ➔ S'})</span>
                </button>
              </div>

              {/* Coil Turns */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 px-2">Coil Turns:</span>
                {([25, 50, 100] as const).map((turns) => (
                  <button
                    key={turns}
                    onClick={() => setConfig((prev) => ({ ...prev, coilTurns: turns }))}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      config.coilTurns === turns
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {turns}
                  </button>
                ))}
              </div>

              {/* Visualization Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, showFieldLines: !prev.showFieldLines }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    config.showFieldLines
                      ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Field Lines
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, showFieldDisc: !prev.showFieldDisc }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    config.showFieldDisc
                      ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Coil Disc
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, showMeter: !prev.showMeter }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    config.showMeter
                      ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Meter
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, showGraph: !prev.showGraph }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    config.showGraph
                      ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Graph
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
