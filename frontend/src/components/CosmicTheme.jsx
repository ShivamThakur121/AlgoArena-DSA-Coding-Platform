import { useEffect, useMemo, useRef } from 'react';

// Shared visual language for the cosmic/nebula theme used across pages.
// Mount all three near the root of a page, inside a `relative` container:
//
//   <div className="relative min-h-screen ...">
//     <CosmicStyles />
//     <CosmicBackground />
//     <CursorSmoke />
//     <div className="relative z-10 ...">page content</div>
//   </div>

export const CosmicStyles = () => (
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
);

export const CosmicBackground = () => {
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

  return (
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
};

// Chain of blurred, colored blobs that ease toward the pointer, each one
// chasing the blob before it — that lag reads as smoke trailing the cursor.
const CURSOR_SMOKE_CONFIG = [
  { size: 90, blur: 35, opacity: 0.55, color: 'rgba(34,211,238,0.9)' },   // cyan core
  { size: 130, blur: 50, opacity: 0.45, color: 'rgba(167,139,250,0.85)' }, // violet
  { size: 165, blur: 65, opacity: 0.38, color: 'rgba(232,121,249,0.8)' },  // fuchsia
  { size: 195, blur: 80, opacity: 0.3, color: 'rgba(236,72,153,0.75)' },   // pink
  { size: 220, blur: 95, opacity: 0.22, color: 'rgba(251,146,60,0.65)' },  // orange tail
];

export const CursorSmoke = () => {
  const followerRefs = useRef([]);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const trail = useRef(CURSOR_SMOKE_CONFIG.map(() => ({ x: -9999, y: -9999 })));

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
