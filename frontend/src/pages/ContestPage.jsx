import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';

// ─── Canvas smoke cursor ──────────────────────────────────────────────────────
function SmokeCanvas() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);
  const COLORS = [[34,211,238],[168,85,247],[236,72,153],[251,146,60],[99,179,237],[52,211,153]];

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
        const [r,g,b] = COLORS[Math.floor(Math.random()*COLORS.length)];
        particles.current.push({ x:x+(Math.random()-.5)*12, y:y+(Math.random()-.5)*12, vx:(Math.random()-.5)*1.5, vy:-Math.random()*1.8-.5, r,g,b, radius:Math.random()*12+6, alpha:.2+Math.random()*.12, decay:.028+Math.random()*.02 });
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive:true });

    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.current = particles.current.filter(p => p.alpha > 0.01);
      for (const p of particles.current) {
        p.x+=p.vx; p.y+=p.vy; p.vx*=.97; p.vy*=.97; p.radius*=1.018; p.alpha-=p.decay;
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.radius);
        g.addColorStop(0,`rgba(${p.r},${p.g},${p.b},${p.alpha})`);
        g.addColorStop(.4,`rgba(${p.r},${p.g},${p.b},${p.alpha*.5})`);
        g.addColorStop(1,`rgba(${p.r},${p.g},${p.b},0)`);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener('resize',resize); window.removeEventListener('mousemove',onMove); window.removeEventListener('touchmove',onMove); cancelAnimationFrame(raf.current); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" style={{ mixBlendMode:'screen', opacity: 0.55 }} />;
}

// ─── Nebula decoration ────────────────────────────────────────────────────────
function NebulaDeco() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute" style={{ width:480, height:700, top:'10%', left:'50%', transform:'translateX(-20%)', background:'radial-gradient(ellipse at 50% 60%,#f97316 0%,#a855f7 30%,#22d3ee 60%,transparent 80%)', filter:'blur(60px)', opacity:.28, animation:'nebulaFloat 8s ease-in-out infinite alternate' }} />
      <div className="absolute" style={{ width:700, height:900, top:'5%', left:'45%', transform:'translateX(-20%)', background:'radial-gradient(ellipse at 50% 50%,#ec4899 0%,#6366f1 40%,transparent 70%)', filter:'blur(90px)', opacity:.15, animation:'nebulaFloat 12s ease-in-out infinite alternate-reverse' }} />
      <style>{`@keyframes nebulaFloat{from{transform:translateX(-20%) scaleY(1) rotate(-2deg)}to{transform:translateX(-20%) scaleY(1.08) rotate(2deg)}}`}</style>
    </div>
  );
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d:0, h:0, m:0, s:0 };
    return { d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => { const id = setInterval(() => setTime(calc()), 1000); return () => clearInterval(id); }, [targetDate]);
  return time;
}

// ─── Shared nav links ─────────────────────────────────────────────────────────
const NAV_LINKS = [{ to:'/', label:'Problems' }, { to:'/contest', label:'Contest' }];

// ─── Shared Navbar ────────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  return (
    <nav className="relative z-20 border-b"
         style={{ background:'rgba(2,6,23,0.6)', backdropFilter:'blur(24px)', borderColor:'rgba(34,211,238,0.15)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-6">
          <NavLink to="/" style={{ lineHeight:1, flexShrink:0 }}>
            <span style={{ fontSize:'1.5rem', fontWeight:900, background:'linear-gradient(90deg,#22d3ee,#818cf8,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:'drop-shadow(0 0 14px rgba(34,211,238,0.6))', letterSpacing:'-0.5px' }}>
              &lt;/&gt; LeetCode
            </span>
          </NavLink>

          <div className="flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to}
                style={({ isActive }) => ({ padding:'6px 14px', borderRadius:10, fontSize:'0.9rem', fontWeight:600, color:isActive?'#22d3ee':'#94a3b8', background:isActive?'rgba(34,211,238,0.1)':'transparent', textDecoration:'none', transition:'all .2s', border:isActive?'1px solid rgba(34,211,238,0.25)':'1px solid transparent' })}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="dropdown dropdown-end flex-shrink-0">
            <div tabIndex={0} className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer select-none"
                 style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#e2e8f0', transition:'all .2s' }}
                 onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                 onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#22d3ee,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                {user?.firstName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span style={{ fontSize:'0.9rem', fontWeight:500 }}>{user?.firstName ?? 'Guest'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu mt-2 p-2 rounded-2xl shadow-2xl"
                style={{ width:200, background:'rgba(10,12,28,0.95)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <li>
                <button onClick={onLogout} className="rounded-xl text-sm font-medium"
                        style={{ color:'#f87171', background:'transparent' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  🚪 Logout
                </button>
              </li>
              {user?.role === 'admin' && (
                <li><NavLink to="/admin" className="rounded-xl text-sm font-medium" style={{ color:'#22d3ee' }}>⚙️ Admin Panel</NavLink></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Countdown Block ──────────────────────────────────────────────────────────
function CountdownBlock({ targetDate }) {
  const { d, h, m, s } = useCountdown(targetDate);
  const pads = (n) => String(n).padStart(2,'0');
  const unit = (val, label) => (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'#e2e8f0', lineHeight:1, fontVariantNumeric:'tabular-nums', fontFamily:'monospace', background:'linear-gradient(180deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        {pads(val)}
      </div>
      <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{label}</div>
    </div>
  );
  const sep = <span style={{ fontSize:'2rem', fontWeight:900, color:'#334155', lineHeight:1, paddingBottom:16 }}>:</span>;
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:16 }}>
      {unit(d,'Days')} {sep} {unit(h,'Hrs')} {sep} {unit(m,'Min')} {sep} {unit(s,'Sec')}
    </div>
  );
}

// ─── Contest data ─────────────────────────────────────────────────────────────
const now = Date.now();
const DAY  = 86400000;

const UPCOMING_WEEKLY = [
  { id:'weekly-452', title:'Weekly Contest 452', date: new Date(now + 2*DAY + 3*3600000), duration:'1 hour 30 minutes', registered: false  },
  { id:'weekly-453', title:'Weekly Contest 453', date: new Date(now + 9*DAY + 3*3600000), duration:'1 hour 30 minutes', registered: false },
];
const UPCOMING_BIWEEKLY = [
  { id:'biweekly-178', title:'Biweekly Contest 178', date: new Date(now + 5*DAY + 3*3600000), duration:'1 hour 30 minutes', registered: false },
  { id:'biweekly-179', title:'Biweekly Contest 179', date: new Date(now + 19*DAY + 3*3600000), duration:'1 hour 30 minutes', registered: false },
];

const PAST_CONTESTS = [
  { id:'weekly-451',    title:'Weekly Contest 451',    date:'Jun 15, 2026 8:00 AM IST',  participants:22_480, type:'weekly'    },
  { id:'biweekly-177', title:'Biweekly Contest 177',  date:'Jun 14, 2026 8:00 PM IST',  participants:18_320, type:'biweekly'  },
  { id:'weekly-450',    title:'Weekly Contest 450',    date:'Jun 8, 2026 8:00 AM IST',   participants:23_100, type:'weekly'    },
  { id:'biweekly-176', title:'Biweekly Contest 176',  date:'May 31, 2026 8:00 PM IST',  participants:17_890, type:'biweekly'  },
  { id:'weekly-449',    title:'Weekly Contest 449',    date:'May 25, 2026 8:00 AM IST',  participants:21_740, type:'weekly'    },
  { id:'biweekly-175', title:'Biweekly Contest 175',  date:'May 17, 2026 8:00 PM IST',  participants:16_530, type:'biweekly'  },
  { id:'weekly-448',    title:'Weekly Contest 448',    date:'May 11, 2026 8:00 AM IST',  participants:24_020, type:'weekly'    },
  { id:'biweekly-174', title:'Biweekly Contest 174',  date:'May 3, 2026 8:00 PM IST',   participants:19_100, type:'biweekly'  },
];

// ─── Contest card ─────────────────────────────────────────────────────────────
function UpcomingCard({ contest, isNext }) {
  const { d, h, m, s } = useCountdown(contest.date);
  const pads = n => String(n).padStart(2,'0');
  const [reg, setReg] = useState(contest.registered);
  const fmt = contest.date.toLocaleString('en-IN',{ weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZoneName:'short' });

  return (
    <div style={{ position:'relative', borderRadius:24, overflow:'hidden', background: isNext ? 'linear-gradient(135deg,rgba(34,211,238,0.07),rgba(168,85,247,0.07))' : 'rgba(255,255,255,0.03)', border: isNext ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(255,255,255,0.08)', padding:'28px 32px', transition:'all .3s' }}
         onMouseEnter={e=>{ if(!isNext){ e.currentTarget.style.borderColor='rgba(34,211,238,0.2)'; e.currentTarget.style.background='rgba(34,211,238,0.04)'; }}}
         onMouseLeave={e=>{ if(!isNext){ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}}>

      {isNext && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#22d3ee,#a855f7,#ec4899)' }} />}
      {isNext && <div style={{ position:'absolute', top:16, right:20, padding:'4px 12px', borderRadius:999, background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.3)', color:'#67e8f9', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Next Up</div>}

      <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#e2e8f0', marginBottom:6 }}>{contest.title}</div>
      <div style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:4 }}>🗓 {fmt}</div>
      <div style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:isNext?24:20 }}>⏱ Duration: {contest.duration}</div>

      {isNext && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Starts In</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12 }}>
            {[{v:d,l:'Days'},{v:h,l:'Hrs'},{v:m,l:'Min'},{v:s,l:'Sec'}].map(({v,l},i,arr)=>(
              <div key={l} style={{ display:'flex', alignItems:'flex-end', gap:12 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'2.2rem', fontWeight:900, color:'#e2e8f0', lineHeight:1, fontFamily:'monospace', background:'linear-gradient(180deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{pads(v)}</div>
                  <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 }}>{l}</div>
                </div>
                {i < arr.length-1 && <span style={{ fontSize:'1.8rem', color:'#334155', fontWeight:900, paddingBottom:14 }}>:</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={()=>setReg(r=>!r)}
              style={{ padding:'10px 28px', borderRadius:12, fontWeight:700, fontSize:'0.9rem', cursor:'pointer', transition:'all .2s',
                background: reg ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg,#22d3ee,#a855f7)',
                border: reg ? '1px solid rgba(74,222,128,0.4)' : 'none',
                color: reg ? '#4ade80' : '#fff',
                boxShadow: reg ? 'none' : '0 0 30px rgba(34,211,238,0.35)' }}>
        {reg ? '✓ Registered' : 'Register'}
      </button>
    </div>
  );
}

// ─── Past contest row ─────────────────────────────────────────────────────────
function PastRow({ c, idx }) {
  const isWeekly = c.type === 'weekly';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderRadius:16, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', transition:'all .25s', cursor:'pointer' }}
         onMouseEnter={e=>{ e.currentTarget.style.background='rgba(34,211,238,0.04)'; e.currentTarget.style.borderColor='rgba(34,211,238,0.15)'; }}
         onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; }}>
      <span style={{ color:'#334155', fontSize:'0.8rem', fontWeight:700, minWidth:28 }}>#{idx+1}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.95rem' }}>{c.title}</div>
        <div style={{ color:'#475569', fontSize:'0.8rem', marginTop:2 }}>{c.date}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <span style={{ padding:'3px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color: isWeekly?'#67e8f9':'#c084fc', background: isWeekly?'rgba(34,211,238,0.1)':'rgba(168,85,247,0.1)' }}>
          {isWeekly ? 'Weekly' : 'Biweekly'}
        </span>
        <span style={{ color:'#475569', fontSize:'0.82rem' }}>👥 {c.participants.toLocaleString()}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, opacity:.3 }}>
        <path d="M5.5 4l4 4-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── ContestPage ──────────────────────────────────────────────────────────────
function ContestPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('weekly'); // 'weekly' | 'biweekly'
  const [pastFilter, setPastFilter] = useState('all');

  const handleLogout = () => dispatch(logoutUser());

  const upcomingList = tab === 'weekly' ? UPCOMING_WEEKLY : UPCOMING_BIWEEKLY;
  const filteredPast = pastFilter === 'all' ? PAST_CONTESTS : PAST_CONTESTS.filter(c => c.type === pastFilter);

  return (
    <div className="min-h-screen relative overflow-x-hidden"
         style={{ background:'linear-gradient(135deg,#020617 0%,#0d1224 50%,#130b2e 100%)' }}>

      <SmokeCanvas />
      <NebulaDeco />

      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(180)].map((_,i)=>(
          <span key={i} className="absolute rounded-full bg-white"
                style={{ width:`${Math.random()*2.5+0.5}px`, height:`${Math.random()*2.5+0.5}px`, top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity:Math.random()*.7+.1, animation:`pulse ${Math.random()*4+2}s ease-in-out infinite`, animationDelay:`${Math.random()*4}s` }} />
        ))}
      </div>
      <div className="fixed -top-60 -left-60 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background:'radial-gradient(circle,rgba(34,211,238,0.12),transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed -bottom-60 -right-60 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background:'radial-gradient(circle,rgba(168,85,247,0.12),transparent 70%)', filter:'blur(80px)' }} />

      <Navbar user={user} onLogout={handleLogout} />

      {/* ══ Hero Banner ══════════════════════════════════════════════════════ */}
      <div style={{ position:'relative', zIndex:10, overflow:'hidden', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(34,211,238,0.06) 0%,rgba(168,85,247,0.06) 50%,rgba(236,72,153,0.04) 100%)' }} />
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(34,211,238,0.4),rgba(168,85,247,0.4),transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:14, padding:'5px 14px', borderRadius:999, background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', fontSize:'0.75rem', fontWeight:700, color:'#c084fc', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                🏆 Live Contests
              </div>
              <h1 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, lineHeight:1.1, background:'linear-gradient(120deg,#f0f9ff 0%,#22d3ee 35%,#a855f7 70%,#ec4899 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:12 }}>
                Contest Arena
              </h1>
              <p style={{ color:'#64748b', fontSize:'1rem', maxWidth:460, lineHeight:1.6 }}>
                Sharpen your skills. Compete with coders worldwide. Win up to <span style={{ color:'#fbbf24', fontWeight:700 }}>5000 LeetCoins</span> per contest plus bonus prizes.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[{ label:'Weekly Contests', val:'450+', color:'#22d3ee' },{ label:'Biweekly Contests', val:'177+', color:'#a855f7' },{ label:'Global Participants', val:'50K+', color:'#ec4899' }].map(s=>(
                  <div key={s.label}>
                    <div style={{ fontSize:'1.6rem', fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:'0.75rem', color:'#475569', marginTop:3, fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next contest countdown */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:24, padding:'28px 36px', backdropFilter:'blur(20px)', minWidth:300, flexShrink:0, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#22d3ee,#a855f7,#ec4899)' }} />
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Next Weekly Contest</div>
              <div style={{ fontWeight:800, color:'#e2e8f0', fontSize:'1.05rem', marginBottom:4 }}>{UPCOMING_WEEKLY[0].title}</div>
              <div style={{ color:'#475569', fontSize:'0.8rem', marginBottom:20 }}>
                {UPCOMING_WEEKLY[0].date.toLocaleString('en-IN',{ weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZoneName:'short' })}
              </div>
              <CountdownBlock targetDate={UPCOMING_WEEKLY[0].date} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ Main Content ═════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ── Upcoming Contests ── */}
        <section className="mb-14">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
            <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0' }}>Upcoming Contests</h2>
            {/* Tab switcher */}
            <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:4 }}>
              {[{ key:'weekly', label:'Weekly' },{ key:'biweekly', label:'Biweekly' }].map(t=>(
                <button key={t.key} onClick={()=>setTab(t.key)}
                        style={{ padding:'7px 18px', borderRadius:9, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', transition:'all .2s', border:'none',
                          background: tab===t.key ? 'linear-gradient(135deg,rgba(34,211,238,0.2),rgba(168,85,247,0.2))' : 'transparent',
                          color: tab===t.key ? '#e2e8f0' : '#64748b',
                          boxShadow: tab===t.key ? '0 0 20px rgba(34,211,238,0.1)' : 'none' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingList.map((c, i) => <UpcomingCard key={c.id} contest={c} isNext={i===0} />)}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-14">
          <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:20 }}>How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon:'📝', step:'01', title:'Register', desc:'Sign up for upcoming weekly or biweekly contests before they start.' },
              { icon:'⏰', step:'02', title:'Compete', desc:'Solve 4 problems in 90 minutes. Faster, correct solutions score higher.' },
              { icon:'📊', step:'03', title:'Get Ranked', desc:'Your rating updates live based on performance across participants.' },
              { icon:'🏆', step:'04', title:'Win Prizes', desc:'Top finishers earn LeetCoins and exclusive sponsor bonuses.' },
            ].map(({ icon, step, title, desc })=>(
              <div key={step} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'24px 22px', transition:'all .3s' }}
                   onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(34,211,238,0.2)'; e.currentTarget.style.background='rgba(34,211,238,0.04)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                   onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='none'; }}>
                <div style={{ fontSize:'1.8rem', marginBottom:12 }}>{icon}</div>
                <div style={{ fontSize:'0.68rem', fontWeight:800, color:'#334155', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Step {step}</div>
                <div style={{ fontWeight:800, color:'#e2e8f0', fontSize:'1rem', marginBottom:8 }}>{title}</div>
                <div style={{ color:'#64748b', fontSize:'0.85rem', lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Rating tiers ── */}
        <section className="mb-14">
          <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:20 }}>Rating Tiers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { tier:'Guardian', range:'≥ 2500', pct:'Top 1%',  color:'#f59e0b', icon:'👑' },
              { tier:'Knight',   range:'≥ 1850', pct:'Top 5%',  color:'#a855f7', icon:'⚔️' },
              { tier:'Expert',   range:'≥ 1600', pct:'Top 20%', color:'#22d3ee', icon:'💎' },
              { tier:'Specialist', range:'≥ 1400', pct:'Top 40%', color:'#4ade80', icon:'🌿' },
              { tier:'Pupil',    range:'≥ 1200', pct:'Top 60%', color:'#94a3b8', icon:'📘' },
              { tier:'Newbie',   range:'< 1200', pct:'Others',  color:'#64748b', icon:'🌱' },
            ].map(({ tier, range, pct, color, icon })=>(
              <div key={tier} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', borderRadius:16, background:'rgba(255,255,255,0.02)', border:`1px solid ${color}25`, transition:'all .2s' }}
                   onMouseEnter={e=>{ e.currentTarget.style.background=`${color}08`; e.currentTarget.style.borderColor=`${color}50`; }}
                   onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor=`${color}25`; }}>
                <div style={{ fontSize:'1.8rem', flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight:800, color, fontSize:'0.95rem' }}>{tier}</div>
                  <div style={{ color:'#64748b', fontSize:'0.8rem', marginTop:2 }}>{range} rating · {pct}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Past Contests ── */}
        <section>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
            <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0' }}>Past Contests</h2>
            <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:4 }}>
              {[{ k:'all', l:'All' },{ k:'weekly', l:'Weekly' },{ k:'biweekly', l:'Biweekly' }].map(f=>(
                <button key={f.k} onClick={()=>setPastFilter(f.k)}
                        style={{ padding:'6px 14px', borderRadius:8, fontSize:'0.82rem', fontWeight:700, cursor:'pointer', transition:'all .2s', border:'none', background: pastFilter===f.k ? 'rgba(255,255,255,0.08)' : 'transparent', color: pastFilter===f.k ? '#e2e8f0' : '#64748b' }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredPast.map((c, i) => <PastRow key={c.id} c={c} idx={i} />)}
          </div>

          <div style={{ textAlign:'center', marginTop:24 }}>
            <button style={{ padding:'10px 28px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:'0.9rem', fontWeight:600, cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#e2e8f0'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#94a3b8'; }}>
              Load More Contests
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default ContestPage;
