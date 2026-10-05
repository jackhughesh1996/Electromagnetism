import { useState } from 'react';
import { MotorCanvas } from './MotorCanvas';
import { MotorConfig, MotorState } from '../../types';
import {
  Play,
  Pause,
  StepForward,
  RotateCw,
  RefreshCw,
  Layers,
  Magnet,
  Zap,
  Power,
  Eye,
  Sliders,
  Gauge,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function MotorSandbox() {
  const [config, setConfig] = useState<MotorConfig>({
    mode: 'motor',
    current: 5.0,
    switchClosed: true,
    batteryReversed: false,
    magnetStrength: 'standard',
    magnetGap: 'normal',
    coilTurns: 40,
    hasCommutator: true,
    showPermanentField: true,
    showCoilField: false,
    showForceArrows: true,
    showSymbols: true,
    showElectronFlow: true,
    particleType: 'electrons',
    speedMultiplier: 0.5,
    frozenAngle: null,
    isPlaying: true,
    highlightSides: true,
    viewMode: 'forces',
  });

  const [motorState, setMotorState] = useState<MotorState | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleStep45 = () => {
    const currentAngle = motorState ? motorState.angleDeg : 0;
    const nextAngle = Math.round(((currentAngle + 45) % 360) / 45) * 45;
    setConfig((prev) => ({
      ...prev,
      frozenAngle: nextAngle,
      isPlaying: false,
    }));
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex flex-col">
      {/* 3D Canvas Stage */}
      <div className="flex-1 w-full h-full relative">
        <MotorCanvas config={config} onStateUpdate={setMotorState} height="100%" />

        {/* Floating Top-Left Status Banner */}
        <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-slate-200 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                config.switchClosed && config.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold">
              Angle: {motorState ? Math.round(motorState.angleDeg) : 0}°
            </span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span>Turning Effect: {motorState?.relativeTurningEffect ?? 0}%</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-slate-400">
            {config.hasCommutator ? 'Split-Ring Active' : 'Commutator Disabled'}
          </span>
        </div>

        {/* Floating Bottom Playback & Stepper Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              if (!config.switchClosed) {
                setConfig((prev) => ({ ...prev, switchClosed: true, frozenAngle: null, isPlaying: true }));
              } else {
                setConfig((prev) => ({
                  ...prev,
                  frozenAngle: null,
                  isPlaying: !prev.isPlaying,
                }));
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              config.isPlaying && config.switchClosed
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {config.isPlaying && config.switchClosed ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Motor
              </>
            )}
          </button>

          {/* Step 45° Button */}
          <button
            onClick={handleStep45}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <StepForward className="w-4 h-4" /> Step 45°
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, speedMultiplier: 0.25 }))}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                config.speedMultiplier === 0.25
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0.25× Slow
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, speedMultiplier: 0.5 }))}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                config.speedMultiplier === 0.5
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0.5× Med
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, speedMultiplier: 1.0 }))}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                config.speedMultiplier === 1.0
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1.0× Fast
            </button>
          </div>
        </div>

        {/* Floating Right Control Drawer */}
        <div
          className={`absolute top-4 right-4 z-20 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isPanelCollapsed ? 'h-12 overflow-hidden' : 'max-h-[calc(100vh-6rem)] overflow-y-auto'
          }`}
        >
          {/* Header */}
          <div
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-3.5 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-100">Motor Lab Controls</span>
            </div>
            {isPanelCollapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {!isPanelCollapsed && (
            <div className="p-4 space-y-4 text-xs text-slate-200">
              {/* Circuit Switch */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Power & Polarity
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, switchClosed: !prev.switchClosed }))}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      config.switchClosed
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-red-950/80 text-red-300 border-red-700/60'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {config.switchClosed ? 'Switch Closed' : 'Switch Open'}
                  </button>

                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, batteryReversed: !prev.batteryReversed }))}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {config.batteryReversed ? 'Batt: Reversed' : 'Batt: Normal'}
                  </button>
                </div>
              </div>

              {/* Commutator Toggle */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Commutator Mechanism
                </span>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, hasCommutator: !prev.hasCommutator }))}
                  className={`w-full py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    config.hasCommutator
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                      : 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {config.hasCommutator ? 'Split-Ring Commutator ON' : 'Commutator Disabled (Slip Ring)'}
                </button>
              </div>

              {/* Current Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Current (I)</span>
                  <span className="font-mono text-sky-400">{config.current.toFixed(1)} A</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={config.current}
                  onChange={(e) => setConfig((prev) => ({ ...prev, current: parseFloat(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Coil Turns */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Coil Turns (N)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {([20, 40, 60] as const).map((turns) => (
                    <button
                      key={turns}
                      onClick={() => setConfig((prev) => ({ ...prev, coilTurns: turns }))}
                      className={`py-1.5 rounded-lg font-bold border transition-all ${
                        config.coilTurns === turns
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {turns} Turns
                    </button>
                  ))}
                </div>
              </div>

              {/* Magnet Gap */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Permanent Magnet Gap</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['narrow', 'normal', 'wide'] as const).map((gap) => (
                    <button
                      key={gap}
                      onClick={() => setConfig((prev) => ({ ...prev, magnetGap: gap }))}
                      className={`py-1.5 rounded-lg font-bold capitalize border transition-all ${
                        config.magnetGap === gap
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {gap}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display & Physics Overlays */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  3D Overlays & Vectors
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">3D Force Vectors (Green Arrows)</span>
                    <input
                      type="checkbox"
                      checked={config.showForceArrows}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showForceArrows: e.target.checked }))}
                      className="rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">2D Current Symbols (• and ×)</span>
                    <input
                      type="checkbox"
                      checked={config.showSymbols}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showSymbols: e.target.checked }))}
                      className="rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Permanent Field (N→S Streamlines)</span>
                    <input
                      type="checkbox"
                      checked={config.showPermanentField}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showPermanentField: e.target.checked }))
                      }
                      className="rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Coil Dipole Magnetic Field</span>
                    <input
                      type="checkbox"
                      checked={config.showCoilField}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showCoilField: e.target.checked }))}
                      className="rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Particle Drift Flow</span>
                    <input
                      type="checkbox"
                      checked={config.showElectronFlow}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showElectronFlow: e.target.checked }))}
                      className="rounded accent-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
