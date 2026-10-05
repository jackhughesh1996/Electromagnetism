import React from 'react';
import {
  SimulationConfig,
  SimulationMode,
} from '../types';
import {
  Zap,
  RotateCcw,
  Download,
  BookOpen,
  Layers,
  Compass,
  Magnet,
  Eye,
  Sliders,
  ChevronDown,
  Sparkles,
  Power,
  Paperclip,
  Battery,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { generateStandaloneHtml } from '../utils/exportStandaloneHtml';

interface ControlPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  onOpenExplanation: () => void;
}

export function ControlPanel({
  config,
  onChangeConfig,
  onOpenExplanation,
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleModeChange = (mode: SimulationMode) => {
    onChangeConfig({
      ...config,
      mode,
      hasIronCore: mode === 'electromagnet' ? true : mode === 'solenoid' ? config.hasIronCore : false,
    });
  };

  const handleDownloadStandalone = () => {
    const htmlContent = generateStandaloneHtml(config);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-8-electromagnet-${config.mode}-lab.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate Year 8 friendly relative strength and paperclip estimate
  const isPowerOn = Math.abs(config.current) > 0.05;
  let strengthScore = 0;
  let paperclipsEstimate = 0;
  let strengthLabel = 'Magnet is OFF';
  let strengthColor = 'text-slate-500 bg-slate-800';

  if (isPowerOn) {
    const currentMag = Math.abs(config.current);
    if (config.mode === 'wire') {
      strengthScore = currentMag * 1.5;
      paperclipsEstimate = Math.max(1, Math.round(currentMag * 0.4));
      strengthLabel = 'Low (Single Wire)';
      strengthColor = 'text-sky-300 bg-sky-950/60 border-sky-500/40';
    } else if (config.mode === 'coil') {
      strengthScore = currentMag * 4;
      paperclipsEstimate = Math.max(2, Math.round(currentMag * 1.2));
      strengthLabel = 'Medium (Single Loop)';
      strengthColor = 'text-sky-300 bg-sky-950/60 border-sky-500/40';
    } else if (config.mode === 'solenoid' && !config.hasIronCore) {
      strengthScore = currentMag * (config.solenoidTurns / 12) * 12;
      paperclipsEstimate = Math.max(4, Math.round(currentMag * (config.solenoidTurns / 12) * 3));
      strengthLabel = 'Strong (Solenoid Coil)';
      strengthColor = 'text-amber-300 bg-amber-950/60 border-amber-500/40';
    } else {
      // Electromagnet with iron core
      strengthScore = currentMag * (config.solenoidTurns / 12) * 80;
      paperclipsEstimate = Math.max(20, Math.round(currentMag * (config.solenoidTurns / 12) * 22));
      strengthLabel = 'Super Strong (Iron Core Electromagnet!)';
      strengthColor = 'text-amber-400 bg-amber-500/20 border-amber-500/50';
    }
  }

  return (
    <div
      id="control-panel-container"
      className="fixed top-4 left-4 z-20 w-84 max-h-[calc(100vh-2rem)] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
            <Magnet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold text-slate-100 tracking-wide">ELECTROMAGNET LAB</h1>
              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold border border-sky-500/30">
                Year 8
              </span>
            </div>
            <span className="text-[10px] text-sky-400 font-medium">How Electricity Makes a Magnet</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="btn-toggle-panel"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isOpen ? 'Collapse panel' : 'Expand panel'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-200 text-xs scrollbar-thin">
          {/* Step-by-Step Geometry Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" /> Progression Steps
              </span>
              <button
                onClick={onOpenExplanation}
                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3 h-3" /> Science Guide
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="btn-mode-wire"
                onClick={() => handleModeChange('wire')}
                className={`px-2.5 py-2 rounded-xl text-left border font-medium transition ${
                  config.mode === 'wire'
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[9px] text-slate-500 block">Step 1</span>
                <span className="text-xs font-semibold">Straight Wire</span>
              </button>

              <button
                id="btn-mode-coil"
                onClick={() => handleModeChange('coil')}
                className={`px-2.5 py-2 rounded-xl text-left border font-medium transition ${
                  config.mode === 'coil'
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[9px] text-slate-500 block">Step 2</span>
                <span className="text-xs font-semibold">Single Loop</span>
              </button>

              <button
                id="btn-mode-solenoid"
                onClick={() => handleModeChange('solenoid')}
                className={`px-2.5 py-2 rounded-xl text-left border font-medium transition ${
                  config.mode === 'solenoid' && !config.hasIronCore
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[9px] text-slate-500 block">Step 3</span>
                <span className="text-xs font-semibold">Solenoid (Coil)</span>
              </button>

              <button
                id="btn-mode-electromagnet"
                onClick={() => handleModeChange('electromagnet')}
                className={`px-2.5 py-2 rounded-xl text-left border font-medium transition ${
                  config.mode === 'electromagnet' || (config.mode === 'solenoid' && config.hasIronCore)
                    ? 'bg-amber-950/50 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[9px] text-amber-500/80 block">Step 4 (Final)</span>
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Electromagnet
                </span>
              </button>
            </div>
          </div>

          {/* Strength Level Meter (Paperclip Estimator) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-amber-400" /> Magnet Strength
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${strengthColor}`}>
                {isPowerOn ? `~${paperclipsEstimate} Paperclips` : '0 Paperclips'}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-200">{strengthLabel}</div>
            {/* Visual strength bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  !isPowerOn
                    ? 'w-0'
                    : config.mode === 'electromagnet' || config.hasIronCore
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-400 w-full'
                    : config.mode === 'solenoid'
                    ? 'bg-sky-400 w-3/5'
                    : config.mode === 'coil'
                    ? 'bg-sky-500 w-2/5'
                    : 'bg-sky-600 w-1/5'
                }`}
              />
            </div>
          </div>

          {/* THE 3 WAYS TO MAKE AN ELECTROMAGNET STRONGER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> The 3 Ways to Make It Stronger:
              </span>
            </div>

            {/* Way 1: Electric Current & Power Switch */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Electric Current (Amps)
                </span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {config.current > 0 ? `+${config.current.toFixed(1)}` : config.current.toFixed(1)} A
                </span>
              </div>

              {/* Classroom Circuit Power Switch */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-zero-current"
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      switchClosed: !(config.switchClosed ?? true),
                      current: (config.switchClosed ?? true) ? 0 : config.current === 0 ? 6.0 : config.current,
                    })
                  }
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isPowerOn && (config.switchClosed ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                  title="Toggle Knife Switch Blade"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Switch: {(config.switchClosed ?? true) && isPowerOn ? 'CLOSED' : 'OPEN'}</span>
                </button>

                <button
                  id="btn-cell-count"
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      cellCount: (config.cellCount ?? 1) === 1 ? 2 : 1,
                      current:
                        (config.cellCount ?? 1) === 1
                          ? config.current * 1.5 || 6.0
                          : config.current / 1.5 || 4.0,
                    })
                  }
                  className="py-2 px-2 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-200 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  title="Add or remove D-Cell batteries in series"
                >
                  <Battery className="w-3.5 h-3.5 text-amber-400" />
                  <span>{(config.cellCount ?? 1) > 1 ? '2 Cells (3V)' : '1 Cell (1.5V)'}</span>
                </button>
              </div>

              <input
                id="slider-current"
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={config.current}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    current: parseFloat(e.target.value),
                    switchClosed: Math.abs(parseFloat(e.target.value)) > 0.05,
                  })
                }
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>-10A (Reverse)</span>
                <span>0A (Off)</span>
                <span>+10A (Forward)</span>
              </div>

              {/* Polarity Reversal & Particle Flow Mode */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-reverse-current"
                  onClick={() => onChangeConfig({ ...config, current: -config.current })}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition flex items-center justify-center gap-1.5"
                  title="Swap battery terminals: this reverses the current and flips North & South poles!"
                >
                  <RotateCcw className="w-3 h-3 text-sky-400" />
                  <span>Swap (+ / -)</span>
                </button>

                <button
                  id="btn-particle-type"
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      particleType:
                        config.particleType === 'conventional' ? 'electrons' : 'conventional',
                    })
                  }
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-mono transition flex items-center justify-center gap-1"
                  title="Toggle Electron Flow (e⁻) vs Conventional Current (I)"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      config.particleType === 'conventional' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                  />
                  <span>
                    {config.particleType === 'conventional' ? 'I (Pos➔Neg)' : 'e⁻ (Neg➔Pos)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Way 2: Solenoid Turns (Loops) */}
            <div className={`bg-slate-950/60 border rounded-xl p-3 space-y-2.5 transition ${
              config.mode === 'solenoid' || config.mode === 'electromagnet'
                ? 'border-slate-800/80'
                : 'border-slate-850 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Number of Turns (Loops)
                </span>
                <span className="font-mono text-xs font-bold text-sky-400">{config.solenoidTurns} turns</span>
              </div>
              <input
                id="slider-turns"
                type="range"
                min="4"
                max="24"
                step="1"
                value={config.solenoidTurns}
                onChange={(e) => {
                  const turns = parseInt(e.target.value);
                  onChangeConfig({
                    ...config,
                    solenoidTurns: turns,
                    mode: config.mode === 'wire' || config.mode === 'coil' ? 'solenoid' : config.mode,
                  });
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                More wire loops = stronger magnetic field (Try 24 turns!)
              </span>
            </div>

            {/* Way 3: Soft Iron Core */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Soft Iron Core
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Multiplies magnetic strength hundreds of times!
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="checkbox-iron-core"
                  type="checkbox"
                  checked={config.hasIronCore || config.mode === 'electromagnet'}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      hasIronCore: e.target.checked,
                      mode: e.target.checked ? 'electromagnet' : config.mode === 'electromagnet' ? 'solenoid' : config.mode,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Visual Toggles */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Lab View Toggles
            </span>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> Magnetic Field Lines (N ➔ S)
                </span>
                <input
                  type="checkbox"
                  checked={config.showFieldLines}
                  onChange={(e) => onChangeConfig({ ...config, showFieldLines: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-sky-500 accent-sky-500"
                />
              </label>

              <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Electricity Flow Particles
                </span>
                <input
                  type="checkbox"
                  checked={config.showCurrentParticles}
                  onChange={(e) => onChangeConfig({ ...config, showCurrentParticles: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Plotting Compass Needle
                </span>
                <input
                  type="checkbox"
                  checked={config.showCompassProbe}
                  onChange={(e) => onChangeConfig({ ...config, showCompassProbe: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[9px]">N</span>
                  North & South Poles (N / S)
                </span>
                <input
                  type="checkbox"
                  checked={config.showPoles}
                  onChange={(e) => onChangeConfig({ ...config, showPoles: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-red-500 accent-red-500"
                />
              </label>

              <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[9px]">👍</span>
                  Right-Hand Grip Guide
                </span>
                <input
                  type="checkbox"
                  checked={config.showRightHandRule}
                  onChange={(e) => onChangeConfig({ ...config, showRightHandRule: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-sky-500 accent-sky-500"
                />
              </label>

              {/* Iron Filings Slice Card */}
              <div className="pt-1">
                <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/60 cursor-pointer">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Iron Filings on Card
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showFilingsPlane}
                    onChange={(e) => onChangeConfig({ ...config, showFilingsPlane: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-slate-400 accent-slate-400"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Standalone HTML Exporter */}
          <div className="pt-2 border-t border-slate-800">
            <button
              id="btn-download-standalone-html"
              onClick={handleDownloadStandalone}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download Lab (Standalone HTML)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Save offline single-file app for school or homework use
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

