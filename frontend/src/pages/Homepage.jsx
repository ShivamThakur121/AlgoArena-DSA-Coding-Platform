import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { CosmicStyles, CosmicBackground, CursorSmoke } from '../components/CosmicTheme';
import { Plus, Edit, Trash2, Video, Sparkles, ChevronRight } from 'lucide-react';

// ─── Canvas smoke cursor ──────────────────────────────────────────────────────
function SmokeCanvas() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);

  const COLORS = [
    [34, 211, 238], [168, 85, 247], [236, 72, 153],
    [251, 146, 60], [99, 179, 237], [52, 211, 153],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      for (let i = 0; i < 2; i++) {
        const [r, g, b] = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.current.push({
          x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.8 - 0.5,
          r, g, b,
          radius: Math.random() * 12 + 6,
          alpha: 0.2 + Math.random() * 0.12,
          decay: 0.028 + Math.random() * 0.02,
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.alpha > 0.01);
      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97;
        p.radius *= 1.018; p.alpha -= p.decay;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${p.alpha})`);
        grad.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.5})`);
        grad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" style={{ mixBlendMode: 'screen', opacity: 0.55 }} />;
}

// ─── Nebula decoration ────────────────────────────────────────────────────────
function NebulaDeco() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute" style={{ width:480, height:700, top:'10%', left:'50%', transform:'translateX(-20%)', background:'radial-gradient(ellipse at 50% 60%,#f97316 0%,#a855f7 30%,#22d3ee 60%,transparent 80%)', filter:'blur(60px)', opacity:0.28, animation:'nebulaFloat 8s ease-in-out infinite alternate' }} />
      <div className="absolute" style={{ width:700, height:900, top:'5%', left:'45%', transform:'translateX(-20%)', background:'radial-gradient(ellipse at 50% 50%,#ec4899 0%,#6366f1 40%,transparent 70%)', filter:'blur(90px)', opacity:0.15, animation:'nebulaFloat 12s ease-in-out infinite alternate-reverse' }} />
      <style>{`@keyframes nebulaFloat { from{transform:translateX(-20%) scaleY(1) rotate(-2deg)} to{transform:translateX(-20%) scaleY(1.08) rotate(2deg)} }`}</style>
    </div>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────
function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems]         = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({ difficulty: 'all', tag: 'all', status: 'all' });

  useEffect(() => {
    const fetchProblems = async () => {
      try { const { data } = await axiosClient.get('/problem/getAllProblem'); setProblems(data); }
      catch (err) { console.error(err); }
    };
    const fetchSolved = async () => {
      try { const { data } = await axiosClient.get('/problem/problemSolvedByUser'); setSolvedProblems(data); }
      catch (err) { console.error(err); }
    };
    fetchProblems();
    if (user) fetchSolved();
  }, [user]);

  const handleLogout = () => { dispatch(logoutUser()); setSolvedProblems([]); };

  const filteredProblems = problems.filter(p => {
    const d = filters.difficulty === 'all' || p.difficulty === filters.difficulty;
    const t = filters.tag        === 'all' || p.tags       === filters.tag;
    const s = filters.status     === 'all' || solvedProblems.some(sp => sp._id === p._id);
    return d && t && s;
  });

  const NAV_LINKS = [
    { to: '/',        label: 'Problems' },
    { to: '/contest', label: 'Contest'  },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden"
         style={{ background:'linear-gradient(135deg,#020617 0%,#0d1224 50%,#130b2e 100%)' }}>

      <CosmicStyles />
      <CosmicBackground />
      <CursorSmoke />

      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(180)].map((_, i) => (
          <span key={i} className="absolute rounded-full bg-white"
                style={{ width:`${Math.random()*2.5+0.5}px`, height:`${Math.random()*2.5+0.5}px`,
                         top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
                         opacity: Math.random()*0.7+0.1,
                         animation:`pulse ${Math.random()*4+2}s ease-in-out infinite`,
                         animationDelay:`${Math.random()*4}s` }} />
        ))}
      </div>

      {/* Aurora glows */}
      <div className="fixed -top-60 -left-60 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
           style={{ background:'radial-gradient(circle,rgba(34,211,238,0.12),transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed -bottom-60 -right-60 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
           style={{ background:'radial-gradient(circle,rgba(168,85,247,0.12),transparent 70%)', filter:'blur(80px)' }} />

      {/* ── Navbar ── */}
      <nav className="relative z-20 border-b"
           style={{ background:'rgba(2,6,23,0.6)', backdropFilter:'blur(24px)', borderColor:'rgba(34,211,238,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* Logo */}
            <NavLink to="/" style={{ lineHeight:1, flexShrink:0 }}>
              <span style={{ fontSize:'1.5rem', fontWeight:900,
                background:'linear-gradient(90deg,#22d3ee,#818cf8,#a855f7)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                filter:'drop-shadow(0 0 14px rgba(34,211,238,0.6))', letterSpacing:'-0.5px' }}>
                &lt;/&gt; LeetCode
              </span>
            </NavLink>

            {/* Nav links */}
            <div className="flex items-center gap-1 flex-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to}
                  style={({ isActive }) => ({
                    padding:'6px 14px', borderRadius:10, fontSize:'0.9rem', fontWeight:600,
                    color: isActive ? '#22d3ee' : '#94a3b8',
                    background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent',
                    textDecoration:'none', transition:'all .2s',
                    border: isActive ? '1px solid rgba(34,211,238,0.25)' : '1px solid transparent',
                  })}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* User dropdown */}
            <div className="dropdown dropdown-end flex-shrink-0">
              <div tabIndex={0}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer select-none"
                   style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#e2e8f0', transition:'all .2s' }}
                   onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                   onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#22d3ee,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                  {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span style={{ fontSize:'0.9rem', fontWeight:500 }}>{user?.firstName ?? 'Guest'}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>

              <ul tabIndex={0} className="dropdown-content menu mt-2 p-2 rounded-2xl shadow-2xl"
                  style={{ width:200, background:'rgba(10,12,28,0.95)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <li>
                  <button onClick={handleLogout} className="rounded-xl text-sm font-medium"
                          style={{ color:'#f87171', background:'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    🚪 Logout
                  </button>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="rounded-xl text-sm font-medium" style={{ color:'#22d3ee' }}>
                      ⚙️ Admin Panel
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Hero heading */}
        <div className="mb-10">
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:12, padding:'4px 14px', borderRadius:999, background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', fontSize:'0.78rem', fontWeight:600, color:'#67e8f9', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22d3ee', display:'inline-block', boxShadow:'0 0 8px #22d3ee' }} />
            {filteredProblems.length} problems available
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1, background:'linear-gradient(120deg,#f0f9ff 0%,#22d3ee 40%,#a855f7 70%,#ec4899 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 40px rgba(34,211,238,0.3))', marginBottom:10 }}>
            Coding Problems
          </h1>
          <p style={{ color:'#94a3b8', fontSize:'1.05rem' }}>Practice. Learn. Master.</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { key:'status',     options:[['all','All Problems'],['solved','Solved']] },
            { key:'difficulty', options:[['all','All Levels'],['easy','Easy'],['medium','Medium'],['hard','Hard']] },
            { key:'tag',        options:[['all','All Tags'],['array','Array'],['linkedList','Linked List'],['graph','Graph'],['dp','DP']] },
          ].map(({ key, options }) => (
            <select key={key} value={filters[key]} onChange={e => setFilters({...filters,[key]:e.target.value})}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, color:'#e2e8f0', padding:'10px 16px', fontSize:'0.9rem', cursor:'pointer', outline:'none', appearance:'none', backdropFilter:'blur(12px)', minWidth:140, transition:'border-color .2s' }}
                    onFocus={e => e.target.style.borderColor='rgba(34,211,238,0.5)'}
                    onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.12)'}>
              {options.map(([v, label]) => <option key={v} value={v} style={{ background:'#0d1224' }}>{label}</option>)}
            </select>
          ))}
        </div>

        {/* Problem list */}
        <div className="grid gap-4">
          {filteredProblems.map((problem, idx) => {
            const solved = solvedProblems.some(sp => sp._id === problem._id);
            const diffColor = { easy:['#4ade80','rgba(74,222,128,0.12)'], medium:['#fbbf24','rgba(251,191,36,0.12)'], hard:['#f87171','rgba(248,113,113,0.12)'] }[problem.difficulty] ?? ['#94a3b8','rgba(148,163,184,0.1)'];

            return (
              <div key={problem._id}
                   style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'20px 28px', transition:'all .3s cubic-bezier(.4,0,.2,1)', position:'relative', overflow:'hidden' }}
                   onMouseEnter={e => { e.currentTarget.style.background='rgba(34,211,238,0.06)'; e.currentTarget.style.borderColor='rgba(34,211,238,0.25)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 50px rgba(34,211,238,0.12)'; }}
                   onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>

                <div style={{ position:'absolute', top:0, left:0, bottom:0, width:4, borderRadius:'20px 0 0 20px', background: solved ? 'linear-gradient(180deg,#22d3ee,#4ade80)' : 'linear-gradient(180deg,rgba(168,85,247,0.4),rgba(34,211,238,0.4))' }} />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <span style={{ color:'#475569', fontSize:'0.85rem', fontWeight:700, minWidth:28 }}>{String(idx+1).padStart(2,'0')}</span>
                    <div className="min-w-0">
                      <NavLink to={`/problem/${problem._id}`}
                               style={{ fontSize:'1.05rem', fontWeight:700, color:'#e2e8f0', display:'block', textDecoration:'none', transition:'color .2s' }}
                               onMouseEnter={e => e.target.style.color='#22d3ee'}
                               onMouseLeave={e => e.target.style.color='#e2e8f0'}>
                        {problem.title}
                      </NavLink>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span style={{ padding:'2px 12px', borderRadius:999, fontSize:'0.75rem', fontWeight:700, color:diffColor[0], background:diffColor[1], textTransform:'capitalize' }}>{problem.difficulty}</span>
                        <span style={{ padding:'2px 12px', borderRadius:999, fontSize:'0.75rem', fontWeight:600, color:'#67e8f9', background:'rgba(34,211,238,0.1)' }}>{problem.tags}</span>
                      </div>
                    </div>
                  </div>
                  {solved && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)', color:'#4ade80', fontSize:'0.8rem', fontWeight:700, flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Solved
                    </div>
                  )}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink:0, opacity:.3 }}>
                    <path d="M6.5 4.5l5 4.5-5 4.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="text-center py-20" style={{ color:'#475569' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🔍</div>
              <p style={{ fontSize:'1.1rem', fontWeight:600 }}>No problems match your filters</p>
              <p style={{ fontSize:'0.9rem', marginTop:4 }}>Try adjusting the difficulty, tag, or status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;
