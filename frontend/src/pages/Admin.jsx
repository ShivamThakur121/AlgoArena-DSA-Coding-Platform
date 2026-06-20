import { useState } from 'react';
import { Plus, Edit, Trash2, Video, Sparkles, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';
import { CosmicStyles, CosmicBackground, CursorSmoke } from '../components/CosmicTheme';
 
// Per-action color language. Each theme drives the card's gradient border,
// ambient glow, icon treatment, and button — so "delete" reads as risk (rose)
// the same way "create" reads as growth (emerald) at a glance.
const THEMES = {
  emerald: {
    border: 'from-emerald-400/50 via-emerald-500/15 to-cyan-400/30',
    glow: 'shadow-[0_0_60px_-22px_rgba(16,185,129,0.55)]',
    iconWrap: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
    button: 'border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 hover:border-emerald-400/70',
    eyebrow: 'text-emerald-400/70',
  },
  amber: {
    border: 'from-amber-400/50 via-amber-500/15 to-orange-400/30',
    glow: 'shadow-[0_0_60px_-22px_rgba(245,158,11,0.55)]',
    iconWrap: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
    button: 'border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 hover:border-amber-400/70',
    eyebrow: 'text-amber-400/70',
  },
  rose: {
    border: 'from-rose-400/50 via-rose-500/15 to-fuchsia-400/30',
    glow: 'shadow-[0_0_60px_-22px_rgba(244,63,94,0.55)]',
    iconWrap: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
    button: 'border border-rose-400/40 text-rose-300 hover:bg-rose-400/10 hover:border-rose-400/70',
    eyebrow: 'text-rose-400/70',
  },
  violet: {
    border: 'from-violet-400/50 via-blue-500/15 to-cyan-400/30',
    glow: 'shadow-[0_0_60px_-22px_rgba(139,92,246,0.55)]',
    iconWrap: 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30',
    button: 'border border-violet-400/40 text-violet-300 hover:bg-violet-400/10 hover:border-violet-400/70',
    eyebrow: 'text-violet-400/70',
  },
};

const adminOptions = [
  {
    id: 'create',
    title: 'Create Problem',
    description: 'Add a new coding problem to the platform',
    icon: Plus,
    theme: 'emerald',
    eyebrow: 'New',
    route: '/admin/create',
  },
  {
    id: 'update',
    title: 'Update Problem',
    description: 'Edit existing problems and their details',
    icon: Edit,
    theme: 'amber',
    eyebrow: 'Edit',
    route: '/admin/update',
  },
  {
    id: 'delete',
    title: 'Delete Problem',
    description: 'Remove problems from the platform',
    icon: Trash2,
    theme: 'rose',
    eyebrow: 'Danger zone',
    route: '/admin/delete',
  },
  {
    id: 'video',
    title: 'Video Problem',
    description: 'Upload and delete editorial videos',
    icon: Video,
    theme: 'violet',
    eyebrow: 'Media',
    route: '/admin/video',
  },
];

function Admin() {
  const [hoveredOption, setHoveredOption] = useState(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#06060b] text-slate-200 antialiased font-sans">
      <CosmicStyles />
      <CosmicBackground />
      <CursorSmoke />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-20">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-slate-400 font-data mb-5">
              <Sparkles size={13} className="text-violet-400" />
              Control center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
              Admin{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Panel
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
              Manage coding problems on your platform — create, update, retire, or attach editorial videos.
            </p>
          </div>

          {/* Admin Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {adminOptions.map((option) => {
              const IconComponent = option.icon;
              const theme = THEMES[option.theme];
              const isHovered = hoveredOption === option.id;

              return (
                <div
                  key={option.id}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`group rounded-2xl p-px bg-gradient-to-br ${theme.border} ${theme.glow} transition-transform duration-300 ease-out ${
                    isHovered ? '-translate-y-1.5' : ''
                  }`}
                >
                  <div className="h-full flex flex-col items-center text-center rounded-2xl bg-[#0b0a18]/85 backdrop-blur-xl border border-white/[0.06] p-7">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${theme.iconWrap} ${isHovered ? 'scale-105' : ''}`}>
                      <IconComponent size={26} />
                    </div>

                    {/* Eyebrow */}
                    <span className={`text-[11px] tracking-wide uppercase font-data mb-1.5 ${theme.eyebrow}`}>
                      {option.eyebrow}
                    </span>

                    {/* Title */}
                    <h2 className="text-lg font-bold font-display text-white mb-2">
                      {option.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      {option.description}
                    </p>

                    {/* Action Button */}
                    <NavLink
                      to={option.route}
                      className={`mt-auto inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium font-display transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${theme.button}`}
                    >
                      {option.title}
                      <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
