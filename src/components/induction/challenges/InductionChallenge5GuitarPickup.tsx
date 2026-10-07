import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Volume2,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
  isCompleted: boolean;
}

export function InductionChallenge5GuitarPickup({ onComplete, isCompleted }: Props) {
  // Guitar Pluck State
  const [isVibrating, setIsVibrating] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(() => new Array(120).fill(0));

  // Sequence ordering question state
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [finalQuestionAns, setFinalQuestionAns] = useState<string | null>(null);

  const phaseRef = useRef(0);
  const ampRef = useRef(0);

  // Pluck function
  const pluckString = () => {
    ampRef.current = 100;
    setAmplitude(100);
    setIsVibrating(true);
    phaseRef.current = 0;
  };

  // Vibration and induction tick
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (ampRef.current > 0.5) {
        // High frequency vibration (~24 Hz visual proxy)
        phaseRef.current += dt * 32;
        // Gradual exponential decay of vibration
        ampRef.current *= Math.exp(-dt * 0.95);

        // Sine wave string displacement
        const stringDisplacement = Math.sin(phaseRef.current) * ampRef.current;
        // Velocity (derivative) generates induced electrical signal!
        const inducedSignal = Math.cos(phaseRef.current) * ampRef.current;

        setAmplitude(ampRef.current);
        setWaveform((prev) => [...prev.slice(1), inducedSignal]);
      } else {
        ampRef.current = 0;
        setAmplitude(0);
        setIsVibrating(false);
        setWaveform((prev) => [...prev.slice(1), 0]);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const stepsList = [
    { id: 1, text: 'A permanent magnet magnetises the nearby steel guitar string.' },
    { id: 2, text: 'The string is plucked and vibrates rapidly back and forth.' },
    { id: 3, text: 'The vibrating steel string changes the magnetic field passing through the coil.' },
    { id: 4, text: 'The changing magnetic field induces an alternating electrical signal in the coil.' },
    { id: 5, text: 'The electrical signal travels down the guitar lead to the amplifier.' },
  ];

  const handleFinalQuestion = (ans: string) => {
    setFinalQuestionAns(ans);
    if (ans === 'field_not_changing') {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            5
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Challenge 5 — From a Vibrating String to an Electrical Signal
            </h2>
            <p className="text-xs text-slate-400">
              Apply electromagnetic induction to a real device: the electric guitar pickup!
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
        {/* Left: Electric Guitar Pickup 2.5D/3D Model Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative w-full h-[340px] sm:h-[370px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center p-6">
            {/* Visual Title in Viewport */}
            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-md">
              <span className="text-sky-400 font-bold">Electric Guitar Pickup:</span> Cross-section
            </div>

            {/* Pluck Action Button */}
            <button
              onClick={pluckString}
              className={`absolute top-3 right-3 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
                isVibrating
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>🎸 PLUCK STRING</span>
            </button>

            {/* Schematic Apparatus Visualization */}
            <div className="w-full max-w-md flex flex-col items-center relative py-6">
              {/* 1. Steel String (Vibrating) */}
              <div className="w-full relative h-12 flex items-center justify-center">
                <span className="absolute -left-2 text-[10px] text-slate-400 font-bold uppercase">
                  Steel String
                </span>
                {/* String shadow */}
                <div
                  className="w-full h-1 bg-slate-300 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                  style={{
                    transform: `translateY(${Math.sin(phaseRef.current) * (amplitude / 8)}px)`,
                    transition: 'transform 0.02s linear',
                  }}
                />
                {/* Vibration ghosting rays */}
                {amplitude > 5 && (
                  <div
                    className="absolute w-full h-8 border-y border-dashed border-sky-400/30 pointer-events-none rounded-full"
                    style={{ height: `${amplitude / 3}px` }}
                  />
                )}
              </div>

              {/* Magnetic field flux bridging string and pickup */}
              <div className="h-10 flex flex-col items-center justify-center relative w-full">
                <div
                  className="text-[10px] font-mono font-bold transition-colors"
                  style={{
                    color: amplitude > 5 ? '#38bdf8' : '#64748b',
                  }}
                >
                  {amplitude > 5 ? '⚡ Changing Magnetic Flux Lines ⚡' : 'Static Magnetic Field (No change)'}
                </div>
                <div className="flex gap-4 opacity-75">
                  <span className="text-sky-400 text-xs">↕</span>
                  <span className="text-sky-400 text-xs">↕</span>
                  <span className="text-sky-400 text-xs">↕</span>
                </div>
              </div>

              {/* 2. Copper Wire Coil wrapped around permanent pole magnet */}
              <div className="relative flex items-center justify-center">
                {/* Copper Coil outer winding */}
                <div className="w-36 h-20 rounded-xl bg-amber-700 border-2 border-amber-500 shadow-md flex items-center justify-center relative overflow-hidden">
                  {/* Coiled lines texture */}
                  <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,#b45309_0px,#b45309_4px,#78350f_4px,#78350f_8px)]" />
                  <span className="relative z-10 text-[10px] text-white font-extrabold uppercase px-1.5 py-0.5 bg-black/60 rounded">
                    Pickup Coil (~5000 turns)
                  </span>

                  {/* Central Alnico Pole Magnet inside coil */}
                  <div className="absolute w-12 h-24 bg-gradient-to-b from-red-600 via-slate-400 to-blue-600 rounded-sm border border-slate-700 shadow flex flex-col justify-between py-1 items-center text-[9px] font-black text-white">
                    <span>N</span>
                    <span>S</span>
                  </div>
                </div>

                {/* Lead wire output */}
                <div className="absolute -bottom-6 flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-slate-300">
                  <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                  <span>To Guitar Amplifier ➔</span>
                </div>
              </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>
                String Vibration: <strong>{isVibrating ? `${Math.round(amplitude)}% (Active)` : 'Damped / Stopped'}</strong>
              </span>
              <span className={isVibrating ? 'text-sky-400 font-bold' : 'text-slate-500'}>
                {isVibrating ? '⚡ Inducing Electrical Waveform' : '0 V Signal'}
              </span>
            </div>
          </div>

          {/* Live Waveform from Guitar Output */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Induced Audio Signal Output Waveform
              </span>
              <span className="font-mono text-slate-400 text-[10px]">
                {amplitude > 2 ? 'Signal Active' : 'Zero Signal (0 mV)'}
              </span>
            </div>

            {/* Waveform SVG */}
            <div className="w-full h-16 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden">
              <svg viewBox="0 0 240 60" className="w-full h-full block" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="240" y2="30" stroke="#334155" strokeWidth="1" />
                <path
                  d={`M ${waveform
                    .map((val, idx) => `${(idx / (waveform.length - 1)) * 240},${30 - (val / 100) * 26}`)
                    .join(' L ')}`}
                  fill="none"
                  stroke={amplitude > 2 ? '#38bdf8' : '#475569'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: The Complete Causal Sequence & Final Question */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              The Scientific Chain of Events
            </h3>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal pl-4">
              {stepsList.map((st) => (
                <li key={st.id} className="leading-relaxed">
                  {st.text}
                </li>
              ))}
            </ol>
          </div>

          {/* Core Understanding Question */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Why does the electrical signal fade to zero when the guitar string stops vibrating?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleFinalQuestion('lost_magnetism')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  finalQuestionAns === 'lost_magnetism'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                The permanent magnet runs out of magnetic energy.
              </button>

              <button
                onClick={() => handleFinalQuestion('field_not_changing')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  finalQuestionAns === 'field_not_changing'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                The magnetic field through the coil is no longer changing.
              </button>

              <button
                onClick={() => handleFinalQuestion('electricity_leaked')}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  finalQuestionAns === 'electricity_leaked'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                The electrical charge has leaked out through the guitar wood.
              </button>
            </div>

            {finalQuestionAns === 'lost_magnetism' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Permanent magnets do not lose magnetism when a string stops! The magnet is still completely active.
                </span>
              </div>
            )}

            {finalQuestionAns === 'field_not_changing' && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>Mastery achieved!</strong> A resting string sits in a static field (zero change ➔ zero current). Only the <em>physical vibration</em> changes the field through the coil, generating the electrical sound signal!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
