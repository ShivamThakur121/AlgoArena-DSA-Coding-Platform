import { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import {
  FileText, BookOpen, Zap, History, Sparkles, Code2, ListChecks, MessageSquare,
  Bookmark, ThumbsUp, Star, ChevronDown, Sun, Moon, Settings, Maximize2, Minimize2,
  Play, Send, Braces, Copy, Check,
} from 'lucide-react';

// ---- Static config (module scope, no need to recompute per render) ----

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
};

const langDisplayMap = {
  javascript: 'JavaScript (Node.js)',
  java: 'Java',
  cpp: 'C++',
};

const difficultyStyles = {
  easy: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5',
  medium: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
  hard: 'text-rose-400 border-rose-500/40 bg-rose-500/5',
};

const leftTabs = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'editorial', label: 'Editorial', icon: BookOpen },
  { id: 'solutions', label: 'Solutions', icon: Zap },
  { id: 'submissions', label: 'Submissions', icon: History },
  { id: 'chatAI', label: 'ChatAI', icon: Sparkles },
];

const rightTabs = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'testcase', label: 'Testcase', icon: ListChecks },
  { id: 'result', label: 'Test Result', icon: MessageSquare },
];

const getLanguageForMonaco = (lang) => {
  switch (lang) {
    case 'javascript': return 'javascript';
    case 'java': return 'java';
    case 'cpp': return 'cpp';
    default: return 'javascript';
  }
};

const formatCount = (n) => {
  if (n == null) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

// ---- Background decoration ----

const BackgroundLayer = ({ stars }) => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06060b]">
    <div className="absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star absolute rounded-full bg-white"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, opacity: 0.6, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
    <div className="nebula-blob-a absolute top-[-15%] left-[28%] w-[36rem] h-[36rem] rounded-full bg-purple-600/25 blur-[110px] mix-blend-screen" />
    <div className="nebula-blob-b absolute top-[12%] left-[54%] w-[32rem] h-[32rem] rounded-full bg-pink-500/20 blur-[120px] mix-blend-screen" />
    <div className="nebula-blob-c absolute bottom-[-18%] left-[40%] w-[34rem] h-[34rem] rounded-full bg-cyan-400/18 blur-[130px] mix-blend-screen" />
    <div className="absolute top-[38%] left-[46%] w-[20rem] h-[20rem] rounded-full bg-orange-400/10 blur-[100px] mix-blend-screen" />
  </div>
);

// ---- Cursor-following smoke trail ----
// A chain of blurred, colored blobs that ease toward the pointer, each one
// chasing the blob before it. That lag is what reads as "smoke" trailing
// the cursor rather than a dot glued to it.

const CURSOR_SMOKE_CONFIG = [
  { size: 90, blur: 35, opacity: 0.55, color: 'rgba(34,211,238,0.9)' },   // cyan core
  { size: 130, blur: 50, opacity: 0.45, color: 'rgba(167,139,250,0.85)' }, // violet
  { size: 165, blur: 65, opacity: 0.38, color: 'rgba(232,121,249,0.8)' },  // fuchsia
  { size: 195, blur: 80, opacity: 0.3, color: 'rgba(236,72,153,0.75)' },   // pink
  { size: 220, blur: 95, opacity: 0.22, color: 'rgba(251,146,60,0.65)' },  // orange tail
];

const CursorSmoke = () => {
  const followerRefs = useRef([]);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const trail = useRef(
    CURSOR_SMOKE_CONFIG.map(() => ({ x: -9999, y: -9999 }))
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const handleMove = (e) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.active = true;
    };
    const handleLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave);

    let rafId;
    const animate = () => {
      let target = pointer.current;
      trail.current.forEach((pos, i) => {
        const ease = Math.max(0.16 - i * 0.018, 0.05);
        pos.x += (target.x - pos.x) * ease;
        pos.y += (target.y - pos.y) * ease;
        target = pos;

        const el = followerRefs.current[i];
        if (el) {
          const targetOpacity = pointer.current.active ? CURSOR_SMOKE_CONFIG[i].opacity : 0;
          el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
          el.style.opacity = targetOpacity;
        }
      });
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {CURSOR_SMOKE_CONFIG.map((c, i) => (
        <div
          key={i}
          ref={(el) => (followerRefs.current[i] = el)}
          className="absolute rounded-full mix-blend-screen transition-opacity duration-300 ease-out"
          style={{
            left: 0,
            top: 0,
            width: c.size,
            height: c.size,
            background: c.color,
            filter: `blur(${c.blur}px)`,
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

const ProblemPage = () => {
  const { problemId } = useParams();

  // --- data state ---
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // --- ui state ---
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);
  const [cursorPos, setCursorPos] = useState({ lineNumber: 1, column: 1 });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const editorRef = useRef(null);
  const langMenuRef = useRef(null);
  const submitMenuRef = useRef(null);

  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.8 ? 1 : 2,
        delay: Math.random() * 3,
      })),
    []
  );

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(
          (sc) => sc.language === langMap[selectedLanguage]
        ).initialCode;

        setProblem(response.data);
        setCode(initialCode);
        setSelectedCaseIndex(0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(
        (sc) => sc.language === langMap[selectedLanguage]
      ).initialCode;
      setCode(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, problem]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
      if (submitMenuRef.current && !submitMenuRef.current.contains(e.target)) setSubmitMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ lineNumber: e.position.lineNumber, column: e.position.column });
    });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleResetCode = () => {
    if (!problem) return;
    const initialCode = problem.startCode.find(
      (sc) => sc.language === langMap[selectedLanguage]
    ).initialCode;
    setCode(initialCode);
  };

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text ?? '');
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error',
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage,
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const tagList = problem
    ? Array.isArray(problem.tags)
      ? problem.tags
      : String(problem.tags || '').split(',').filter(Boolean)
    : [];

  const likesDisplay = problem?.likes != null ? formatCount(problem.likes) : null;

  const CopyButton = ({ text, id }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="p-1.5 rounded-md text-slate-500 hover:text-cyan-300 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      aria-label="Copy to clipboard"
      type="button"
    >
      {copiedKey === id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );

  if (loading && !problem) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-[#06060b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-slate-500 font-data">Loading problem…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#06060b] text-slate-200 antialiased font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-data { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; }

        @keyframes drift-a { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
        @keyframes drift-b { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-35px,25px) scale(1.05); } }
        @keyframes drift-c { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,35px) scale(1.1); } }
        @keyframes twinkle { 0%, 100% { opacity: .25; } 50% { opacity: .9; } }

        @media (prefers-reduced-motion: no-preference) {
          .nebula-blob-a { animation: drift-a 22s ease-in-out infinite; }
          .nebula-blob-b { animation: drift-b 26s ease-in-out infinite; }
          .nebula-blob-c { animation: drift-c 19s ease-in-out infinite; }
          .star { animation: twinkle 3s ease-in-out infinite; }
        }

        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.55); }
      `}</style>

      <BackgroundLayer stars={stars} />
      <CursorSmoke />

      <div className="relative z-10 h-full flex flex-col lg:flex-row gap-4 p-3 lg:p-4">
        {/* LEFT PANEL */}
        {!isFullscreen && (
          <div className="w-full lg:w-1/2 h-[46vh] lg:h-full shrink-0 min-h-0">
            <div className="h-full rounded-2xl p-px bg-gradient-to-br from-violet-500/50 via-indigo-500/25 to-cyan-400/40 shadow-[0_0_70px_-20px_rgba(139,92,246,0.5)]">
              <div className="h-full flex flex-col rounded-2xl bg-[#0b0a18]/85 backdrop-blur-xl overflow-hidden border border-white/[0.06]">
                {/* Left tabs */}
                <div className="flex items-center gap-1 px-3 border-b border-white/[0.07] overflow-x-auto scrollbar-none shrink-0">
                  {leftTabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeLeftTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveLeftTab(tab.id)}
                        className={`relative flex items-center gap-1.5 px-3.5 py-3.5 text-[13px] font-medium font-display whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-t-md ${
                          active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Icon size={15} className={active ? 'text-cyan-400' : ''} />
                        {tab.label}
                        {active && (
                          <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Left content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  {problem && (
                    <>
                      {activeLeftTab === 'description' && (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-2xl font-bold font-display text-white">{problem.title}</h1>
                            <button
                              type="button"
                              onClick={() => setIsBookmarked((b) => !b)}
                              className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
                              aria-label="Bookmark problem"
                            >
                              <Bookmark size={18} className={isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''} />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 mb-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold font-display ${
                                difficultyStyles[problem.difficulty] ||
                                'text-slate-400 border-slate-500/40 bg-slate-500/5'
                              }`}
                            >
                              {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                            </span>

                            {tagList.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium"
                              >
                                {String(tag).trim()}
                              </span>
                            ))}

                            {likesDisplay && (
                              <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs ml-1">
                                <ThumbsUp size={14} /> {likesDisplay}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setIsSaved((s) => !s)}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded px-1 py-0.5"
                            >
                              <Star size={14} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
                              {isSaved ? 'Saved' : 'Add to List'}
                            </button>
                          </div>

                          <div className="text-[14px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                            {problem.description}
                          </div>

                          <div className="mt-8">
                            <h3 className="text-base font-semibold font-display text-white mb-3">Examples</h3>
                            <div className="space-y-3">
                              {problem.visibleTestCases.map((example, index) => (
                                <div
                                  key={index}
                                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                                >
                                  <div className="flex items-center justify-between mb-2.5">
                                    <h4 className="text-sm font-semibold text-slate-200">Example {index + 1}</h4>
                                    <CopyButton text={example.input} id={`ex-${index}`} />
                                  </div>
                                  <div className="space-y-1.5 text-[13px] font-data text-slate-300">
                                    <div><span className="text-slate-500">Input: </span>{example.input}</div>
                                    <div><span className="text-slate-500">Output: </span>{example.output}</div>
                                    {example.explanation && (
                                      <div><span className="text-slate-500">Explanation: </span>{example.explanation}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeLeftTab === 'editorial' && (
                        <div>
                          <h2 className="text-lg font-bold font-display text-white mb-4">Editorial</h2>
                          <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] p-1">
                            <Editorial
                              secureUrl={problem.secureUrl}
                              thumbnailUrl={problem.thumbnailUrl}
                              duration={problem.duration}
                            />
                          </div>
                        </div>
                      )}

                      {activeLeftTab === 'solutions' && (
                        <div>
                          <h2 className="text-lg font-bold font-display text-white mb-4">Solutions</h2>
                          {problem.referenceSolution?.length ? (
                            <div className="space-y-4">
                              {problem.referenceSolution.map((solution, index) => (
                                <div key={index} className="rounded-xl border border-white/[0.08] overflow-hidden">
                                  <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2.5 border-b border-white/[0.08]">
                                    <h3 className="text-sm font-semibold text-slate-200">
                                      {problem.title} — {solution.language}
                                    </h3>
                                    <CopyButton text={solution.completeCode} id={`sol-${index}`} />
                                  </div>
                                  <pre className="bg-[#08070f] p-4 text-[13px] font-data text-slate-300 overflow-x-auto leading-relaxed">
                                    <code>{solution.completeCode}</code>
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-sm">
                              Solutions will be available after you solve the problem.
                            </p>
                          )}
                        </div>
                      )}

                      {activeLeftTab === 'submissions' && (
                        <div>
                          <h2 className="text-lg font-bold font-display text-white mb-4">My Submissions</h2>
                          <SubmissionHistory problemId={problemId} />
                        </div>
                      )}

                      {activeLeftTab === 'chatAI' && (
                        <div className="h-full flex flex-col">
                          <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-violet-400" /> Chat with AI
                          </h2>
                          <ChatAi problem={problem} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANEL */}
        <div className={`${isFullscreen ? 'w-full' : 'w-full lg:w-1/2'} h-[50vh] lg:h-full flex-1 min-h-0`}>
          <div className="h-full rounded-2xl p-px bg-gradient-to-br from-cyan-400/40 via-blue-500/25 to-violet-500/50 shadow-[0_0_70px_-20px_rgba(56,189,248,0.4)]">
            <div className="h-full flex flex-col rounded-2xl bg-[#0b0a18]/85 backdrop-blur-xl overflow-hidden border border-white/[0.06]">
              {/* Right tabs */}
              <div className="flex items-center gap-1 px-3 border-b border-white/[0.07] overflow-x-auto scrollbar-none shrink-0">
                {rightTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeRightTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveRightTab(tab.id)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-3.5 text-[13px] font-medium font-display whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-t-md ${
                        active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-cyan-400' : ''} />
                      {tab.label}
                      {active && (
                        <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right content */}
              <div className="flex-1 flex flex-col min-h-0">
                {activeRightTab === 'code' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/[0.07] shrink-0">
                      <div className="relative" ref={langMenuRef}>
                        <button
                          type="button"
                          onClick={() => setLangMenuOpen((o) => !o)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] text-sm text-slate-200 hover:border-cyan-400/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                        >
                          {langDisplayMap[selectedLanguage]}
                          <ChevronDown size={14} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {langMenuOpen && (
                          <div className="absolute z-20 mt-1.5 w-44 rounded-lg border border-white/10 bg-[#100f1f] shadow-xl shadow-black/50 overflow-hidden">
                            {['javascript', 'java', 'cpp'].map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  handleLanguageChange(lang);
                                  setLangMenuOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                                  selectedLanguage === lang ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                {langDisplayMap[lang]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Auto-save on
                      </div>

                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => setEditorTheme((t) => (t === 'vs-dark' ? 'vs' : 'vs-dark'))}
                          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                          aria-label="Toggle editor theme"
                          title="Toggle editor theme"
                        >
                          {editorTheme === 'vs-dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                          aria-label="Editor settings"
                          title="Editor settings"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFullscreen((f) => !f)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                          aria-label="Toggle fullscreen"
                          title="Toggle fullscreen"
                        >
                          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Monaco editor */}
                    <div className="flex-1 min-h-0">
                      <Editor
                        height="100%"
                        language={getLanguageForMonaco(selectedLanguage)}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme={editorTheme}
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          wordWrap: 'on',
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          renderLineHighlight: 'line',
                          selectOnLineNumbers: true,
                          roundedSelection: false,
                          readOnly: false,
                          cursorStyle: 'line',
                          mouseWheelZoom: true,
                        }}
                      />
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/[0.07] text-[11px] text-slate-500 font-data shrink-0">
                      <div className="flex items-center gap-3">
                        <span>Ln {cursorPos.lineNumber}, Col {cursorPos.column}</span>
                        <span className="hidden sm:inline">Spaces: 2</span>
                        <span className="hidden sm:inline">UTF-8</span>
                        <span className="hidden sm:inline">LF</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{getLanguageForMonaco(selectedLanguage)}</span>
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.07] shrink-0">
                      <button
                        type="button"
                        onClick={handleResetCode}
                        className="p-2 rounded-lg border border-white/[0.1] text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                        aria-label="Reset to starter code"
                        title="Reset to starter code"
                      >
                        <Braces size={16} />
                      </button>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleRun}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cyan-400/40 text-cyan-300 text-sm font-medium font-display hover:bg-cyan-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                        >
                          <Play size={14} /> Run
                        </button>

                        <div className="relative flex" ref={submitMenuRef}>
                          <button
                            type="button"
                            onClick={handleSubmitCode}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 pl-4 pr-3 py-2 rounded-l-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 text-white text-sm font-medium font-display hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                          >
                            <Send size={14} /> Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmitMenuOpen((o) => !o)}
                            className="px-2 rounded-r-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white border-l border-white/20 hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                            aria-label="More submit options"
                          >
                            <ChevronDown size={14} />
                          </button>
                          {submitMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg border border-white/10 bg-[#100f1f] shadow-xl shadow-black/50 overflow-hidden z-20">
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmitMenuOpen(false);
                                  handleSubmitCode();
                                }}
                                className="w-full text-left px-3.5 py-2 text-sm text-slate-300 hover:bg-white/5"
                              >
                                Submit solution
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmitMenuOpen(false);
                                  handleRun();
                                }}
                                className="w-full text-left px-3.5 py-2 text-sm text-slate-300 hover:bg-white/5"
                              >
                                Run sample tests
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Embedded testcase preview */}
                    {problem?.visibleTestCases?.length > 0 && (
                      <div className="border-t border-white/[0.07] max-h-[230px] overflow-y-auto shrink-0">
                        <div className="flex items-center gap-2 px-4 pt-3 pb-2 text-sm font-semibold font-display text-slate-200">
                          <ListChecks size={15} className="text-cyan-400" /> Testcase
                        </div>
                        <div className="flex gap-4 px-4 pb-4">
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {problem.visibleTestCases.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedCaseIndex(i)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                                  selectedCaseIndex === i
                                    ? 'border-cyan-400/60 text-cyan-300 bg-cyan-400/5'
                                    : 'border-white/10 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full border ${
                                    selectedCaseIndex === i ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
                                  }`}
                                />
                                Case {i + 1}
                              </button>
                            ))}
                          </div>
                          <div className="flex-1 space-y-3 min-w-0">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Input</p>
                              <div className="rounded-md border border-white/[0.08] bg-[#08070f] px-3 py-2 text-[13px] font-data text-slate-300 break-all">
                                {problem.visibleTestCases[selectedCaseIndex]?.input}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Output</p>
                              <div className="rounded-md border border-white/[0.08] bg-[#08070f] px-3 py-2 text-[13px] font-data text-slate-300 break-all">
                                {problem.visibleTestCases[selectedCaseIndex]?.output}
                              </div>
                            </div>
                            {problem.visibleTestCases[selectedCaseIndex]?.explanation && (
                              <div>
                                <p className="text-xs text-emerald-400/80 mb-1">Expected</p>
                                <div className="rounded-md border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 text-[13px] font-data text-slate-300 break-all">
                                  {problem.visibleTestCases[selectedCaseIndex]?.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeRightTab === 'testcase' && (
                  <div className="flex-1 overflow-y-auto p-5">
                    <h3 className="text-sm font-semibold font-display text-slate-200 mb-4">Run Results</h3>
                    {runResult ? (
                      <div
                        className={`rounded-xl border p-4 ${
                          runResult.success ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-rose-500/30 bg-rose-500/[0.04]'
                        }`}
                      >
                        {runResult.success ? (
                          <div>
                            <h4 className="font-bold text-emerald-400">✅ All test cases passed!</h4>
                            <p className="text-sm mt-2 text-slate-400">Runtime: {runResult.runtime + ' sec'}</p>
                            <p className="text-sm text-slate-400">Memory: {runResult.memory + ' KB'}</p>

                            <div className="mt-4 space-y-2">
                              {runResult.testCases.map((tc, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-lg text-xs font-data">
                                  <div className="space-y-1 text-slate-300">
                                    <div><strong className="text-slate-500">Input:</strong> {tc.stdin}</div>
                                    <div><strong className="text-slate-500">Expected:</strong> {tc.expected_output}</div>
                                    <div><strong className="text-slate-500">Output:</strong> {tc.stdout}</div>
                                    <div className="text-emerald-400">✓ Passed</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-rose-400">❌ Error</h4>
                            <div className="mt-4 space-y-2">
                              {runResult.testCases?.map((tc, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-lg text-xs font-data">
                                  <div className="space-y-1 text-slate-300">
                                    <div><strong className="text-slate-500">Input:</strong> {tc.stdin}</div>
                                    <div><strong className="text-slate-500">Expected:</strong> {tc.expected_output}</div>
                                    <div><strong className="text-slate-500">Output:</strong> {tc.stdout}</div>
                                    <div className={tc.status_id == 3 ? 'text-emerald-400' : 'text-rose-400'}>
                                      {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm flex items-center gap-2">
                        <Play size={14} /> Click "Run" to test your code with the example test cases.
                      </div>
                    )}
                  </div>
                )}

                {activeRightTab === 'result' && (
                  <div className="flex-1 overflow-y-auto p-5">
                    <h3 className="text-sm font-semibold font-display text-slate-200 mb-4">Submission Result</h3>
                    {submitResult ? (
                      <div
                        className={`rounded-xl border p-4 ${
                          submitResult.accepted ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-rose-500/30 bg-rose-500/[0.04]'
                        }`}
                      >
                        {submitResult.accepted ? (
                          <div>
                            <h4 className="font-bold text-lg text-emerald-400">🎉 Accepted</h4>
                            <div className="mt-3 space-y-1.5 text-sm text-slate-400">
                              <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                              <p>Runtime: {submitResult.runtime + ' sec'}</p>
                              <p>Memory: {submitResult.memory + 'KB'}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-lg text-rose-400">❌ {submitResult.error}</h4>
                            <div className="mt-3 space-y-1.5 text-sm text-slate-400">
                              <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm flex items-center gap-2">
                        <Send size={14} /> Click "Submit" to submit your solution for evaluation.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
