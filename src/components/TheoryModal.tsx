import { useState } from 'react';
import { X, BookOpen, CheckCircle2, AlertCircle, HelpCircle, Zap, RotateCw } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TheoryModal({ isOpen, onClose }: TheoryModalProps) {
  const [activeTab, setActiveTab] = useState<'l3' | 'l4' | 'quiz'>('l4');
  const [quizAnswers, setQuizAnswers] = useState<{ [q: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const QUIZ_QUESTIONS = [
    {
      q: '1. What happens to a soft-iron electromagnet when the electric circuit is opened?',
      options: [
        'It stays magnetized forever',
        'It loses almost all of its magnetism immediately',
        'Its poles flip backwards',
      ],
      correct: 1,
      explanation:
        'Soft iron has high magnetic permeability but low retentivity; as soon as current stops, magnetic domains scramble back into random disorder.',
    },
    {
      q: '2. What is the essential function of the split-ring commutator in a DC electric motor?',
      options: [
        'It increases the battery voltage',
        'It reverses current in the coil every half-turn to keep torque in the same direction',
        'It stops the motor from spinning too fast',
      ],
      correct: 1,
      explanation:
        'Without a split-ring commutator, the coil would rotate 90° to vertical and stop or oscillate. The commutator reverses the coil connections every 180° so the forces continue driving rotation.',
    },
    {
      q: '3. In conventional 2D diagrams, what do the • and × symbols represent?',
      options: [
        '• = Magnetic North, × = Magnetic South',
        '• = Current towards you (out of page), × = Current away from you (into page)',
        '• = Positive charge, × = Negative charge',
      ],
      correct: 1,
      explanation:
        'Imagine an arrow: the point coming at you looks like a dot (•), while the flight feathers moving away look like a cross (×).',
    },
    {
      q: '4. Which 3 changes will make an electric motor rotate with greater turning force?',
      options: [
        'Fewer turns, lower current, wider magnet gap',
        'More turns, higher current, stronger magnets with a narrow gap',
        'Reversing the battery only',
      ],
      correct: 1,
      explanation:
        'Turning effect (torque) is directly proportional to coil turns (N), electric current (I), and magnetic field strength (B).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Year 8 KS3 Science: Electromagnetism & Motors Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('l4')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'l4'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Lesson 4: Electric Motors
          </button>
          <button
            onClick={() => setActiveTab('l3')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'l3'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Lesson 3: Electromagnets
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Quick Check Quiz
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700 leading-relaxed">
          {activeTab === 'l4' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-blue-600" />
                  How Does a DC Electric Motor Work?
                </h3>
                <p className="text-xs text-blue-950 leading-relaxed">
                  An electric motor converts electrical energy into kinetic (rotational) energy using magnetic interactions. It combines two magnetic fields: a permanent magnetic field ($N \rightarrow S$) and the magnetic field of a current-carrying rectangular coil.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">1. The Motor Effect & Forces</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    Current flows away along one side of the coil and towards you along the other. The external field pushes one side DOWN and the other side UP, creating a turning torque.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">2. Split-Ring Commutator</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    As the coil crosses vertical ($90^\circ$), the brushes swap split-ring segments, reversing the current in the coil so the forces continue pushing in the same direction of rotation!
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">3. 2D Diagram Symbols</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    <strong>• (Dot):</strong> Current coming out of the page towards you.<br />
                    <strong>× (Cross):</strong> Current going into the page away from you.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">4. Increasing Motor Strength</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    • Increase the current ($I$)<br />
                    • Increase number of coil turns ($N$)<br />
                    • Use stronger permanent magnets with a smaller gap ($B$).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'l3' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  What is an Electromagnet?
                </h3>
                <p className="text-xs text-blue-950 leading-relaxed">
                  An electromagnet is a temporary magnet formed by passing electric current through a coil of insulated wire wrapped around a soft iron core. Unlike permanent bar magnets, electromagnets can be switched on and off instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">1. Oersted’s Discovery (1820)</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    Hans Christian Oersted noticed that an electric current in a wire caused a nearby compass needle to deflect, proving that moving electric charges create magnetic fields.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">2. Wire → Loop → Solenoid</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    Coiling a straight wire concentrates the circular fields through the center. Multiple turns add together, creating North and South poles identical to a bar magnet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((item, qIdx) => (
                <div key={qIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">{item.q}</h4>
                  <div className="space-y-1.5">
                    {item.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = item.correct === oIdx;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            showResults
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                : isSelected
                                ? 'bg-red-50 border-red-400 text-red-900'
                                : 'bg-white border-slate-200 text-slate-600'
                              : isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showResults && (
                    <p className="text-[11px] text-slate-600 pt-1 font-sans italic">
                      {item.explanation}
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  {showResults ? 'Hide Explanations' : 'Check Answers & Show Explanations'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
