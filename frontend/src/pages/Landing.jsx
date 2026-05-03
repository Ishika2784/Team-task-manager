import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckSquare, Zap, Shield, BarChart3, Users, LayoutDashboard,
  ArrowRight, Star, ChevronDown, Check,
  TrendingUp, Clock, Target, Globe
} from 'lucide-react';

/* ── mouse-tracking 3D tilt hook ── */
const useTilt = (strength = 15) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), { stiffness: 200, damping: 20 });

  const onMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const onMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
};

/* ── animated counter ── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let s = 0; const step = target / 60;
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [started, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── fade-up variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 } }),
};

/* ── Navbar ── */
const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute top-0 left-0 right-0 z-50 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotateY: 180, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40"
          >
            <CheckSquare size={18} className="text-white" />
          </motion.div>
          <span className="text-xl font-extrabold tracking-tight text-white">Taskflow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          {['Features', 'How it works'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2">Sign in</Link>
          <motion.div whileHover={{ scale: 1.05, rotateX: -5 }} whileTap={{ scale: 0.95, rotateX: 5 }} style={{ transformStyle: 'preserve-3d' }}>
            <Link to="/register" className="btn-3d px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold inline-block">
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

/* ── 3D floating card in hero ── */
const HeroMockup = () => {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(8);
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1200 }}
      initial={{ opacity: 0, y: 80, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* layered depth shadows */}
      <div className="absolute inset-0 translate-y-6 translate-x-4 rounded-2xl bg-indigo-600/20 blur-xl" />
      <div className="absolute inset-0 translate-y-12 translate-x-8 rounded-2xl bg-purple-600/10 blur-2xl" />

      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.35)] shimmer-3d">
        {/* browser chrome */}
        <div className="h-10 bg-slate-800/90 backdrop-blur flex items-center px-4 gap-1.5 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-4 text-xs text-slate-500 font-mono">taskflow.app/dashboard</span>
        </div>
        {/* mock dashboard */}
        <div className="bg-[#0B132B]/95 backdrop-blur-sm p-6 grid grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', val: '24', color: 'indigo', icon: <Target size={16} /> },
            { label: 'Tasks Done', val: '1,284', color: 'emerald', icon: <Check size={16} /> },
            { label: 'Team Members', val: '48', color: 'purple', icon: <Users size={16} /> },
            { label: 'On-time Rate', val: '94%', color: 'amber', icon: <TrendingUp size={16} /> },
          ].map(({ label, val, color, icon }, i) => (
            <motion.div key={label}
              style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 shadow-3d`}>
              <div className={`text-${color}-400 mb-2`}>{icon}</div>
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-[#0B132B]/80 px-6 pb-6 grid grid-cols-3 gap-4">
          {['Design System', 'API Integration', 'Mobile App'].map((name, i) => (
            <div key={name} className="bg-white/5 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : i === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {['Done', 'Active', 'Review'][i]}
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <motion.div className={`h-1.5 rounded-full ${['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500'][i]}`}
                  initial={{ width: 0 }} animate={{ width: `${[100, 68, 45][i]}%` }}
                  transition={{ delay: 1.2 + i * 0.2, duration: 0.8 }} />
              </div>
              <div className="text-xs text-slate-500 mt-2">{[100, 68, 45][i]}% complete</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Hero ── */
const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -100]);
  const y2 = useTransform(scrollY, [0, 600], [0, -50]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/task2.mp4"
      />
      {/* dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-indigo-950/70 to-slate-900/90" />

      {/* 3D grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(800px) rotateX(20deg)',
          transformOrigin: 'top center',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        }}
      />

      {/* orbs */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      <motion.div style={{ opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-24">
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] mb-6"
          style={{ textShadow: '0 0 80px rgba(99,102,241,0.4), 0 4px 24px rgba(0,0,0,0.5)' }}>
          Ship projects
          <br />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              10x faster
            </span>
            <motion.span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one project management platform built for high-performance teams. Real-time collaboration, smart analytics, and beautiful workflows.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <motion.div whileHover={{ scale: 1.05, rotateX: -5 }} whileTap={{ scale: 0.96 }} style={{ transformStyle: 'preserve-3d' }}>
            <Link to="/register" className="btn-3d flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg inline-flex">
              Get Started <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>


      </motion.div>

      <div className="relative z-10 mt-20 w-full max-w-6xl mx-auto px-6">
        <HeroMockup />
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
};

/* ── Stats ── */
const Stats = () => (
  <section className="py-20 bg-slate-950 border-y border-white/5">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { val: 50000, suffix: '+', label: 'Teams worldwide', icon: <Globe size={20} className="text-indigo-400" /> },
        { val: 2000000, suffix: '+', label: 'Tasks completed', icon: <Check size={20} className="text-emerald-400" /> },
        { val: 99, suffix: '.9%', label: 'Uptime SLA', icon: <Shield size={20} className="text-purple-400" /> },
        { val: 4, suffix: 'x', label: 'Faster delivery', icon: <Zap size={20} className="text-amber-400" /> },
      ].map(({ val, suffix, label, icon }, i) => (
        <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          style={{ transformStyle: 'preserve-3d', perspective: 600 }}
          className="text-center p-6 rounded-2xl bg-white/3 border border-white/5 shadow-3d cursor-default">
          <div className="flex justify-center mb-3">{icon}</div>
          <div className="text-4xl font-black text-white mb-1" style={{ textShadow: '0 0 20px rgba(165,180,252,0.5)' }}>
            <Counter target={val} suffix={suffix} />
          </div>
          <div className="text-sm text-slate-500 font-medium">{label}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ── Features ── */
const features = [
  { icon: <Zap size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', title: 'Kanban Boards', desc: 'Drag-and-drop task management with real-time sync across your entire team.' },
  { icon: <BarChart3 size={22} />, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', title: 'Smart Analytics', desc: 'Velocity tracking, burndown charts, and bottleneck detection — automated.' },
  { icon: <Shield size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', title: 'Audit Logs', desc: 'Full change history so you always know who did what and when.' },
  { icon: <Users size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', title: 'Team Roles', desc: 'Granular permissions and role-based access for every project.' },
  { icon: <LayoutDashboard size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', title: 'Custom Dashboards', desc: 'Build the workspace that fits your team, not the other way around.' },
  { icon: <Clock size={22} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)', title: 'Time Tracking', desc: 'Log hours, set estimates, and keep projects on budget effortlessly.' },
];

const FeatureCard3D = ({ icon, color, bg, border, title, desc, i }) => {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(12);
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800, background: 'rgba(15,20,40,0.8)', borderColor: border, backdropFilter: 'blur(12px)' }}
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
      className="relative p-8 rounded-2xl border cursor-default"
    >
      {/* inner glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 50% 0%, ${bg} 0%, transparent 70%)` }} />

      <div className="relative" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-3d"
          style={{ background: bg, border: `1px solid ${border}`, color }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const Features = () => (
  <section id="features" className="py-32 bg-gradient-to-b from-slate-900 to-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
        <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Features</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ textShadow: '0 0 40px rgba(99,102,241,0.3)' }}>
          Built for how teams actually work
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">Everything you need to plan, track, and deliver — without the bloat.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 1200 }}>
        {features.map((f, i) => <FeatureCard3D key={f.title} {...f} i={i} />)}
      </div>
    </div>
  </section>
);

/* ── How it works ── */
const steps = [
  { num: '01', title: 'Create your workspace', desc: 'Sign up in seconds and invite your team. No setup headaches.' },
  { num: '02', title: 'Build your projects', desc: 'Add tasks, set priorities, assign owners, and define deadlines.' },
  { num: '03', title: 'Track & collaborate', desc: 'Real-time updates keep everyone aligned, wherever they are.' },
  { num: '04', title: 'Ship with confidence', desc: 'Analytics and audit logs give you full visibility at every step.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 bg-slate-950">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
        <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">How it works</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Up and running in minutes</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">Four simple steps to transform how your team delivers work.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative" style={{ perspective: 1000 }}>
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30" />
        {steps.map(({ num, title, desc }, i) => (
          <motion.div key={num} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
            whileHover={{ rotateY: -8, rotateX: -4, translateZ: 20, scale: 1.03 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative text-center p-6 rounded-2xl bg-white/3 border border-white/5 cursor-default">
            <motion.div
              whileHover={{ rotateY: 360 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-3d-indigo relative z-10">
              <span className="text-2xl font-black text-white">{num}</span>
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Testimonials ── */
const testimonials = [
  { name: 'Sarah Chen', role: 'Engineering Lead @ Stripe', avatar: 'SC', rating: 5, text: 'Taskflow cut our sprint planning time in half. The kanban boards are buttery smooth and the analytics actually surface useful insights.' },
  { name: 'Marcus Rivera', role: 'CTO @ Vercel', avatar: 'MR', rating: 5, text: "We've tried every PM tool out there. Taskflow is the first one our engineers actually enjoy using. The audit logs alone saved us during a compliance review." },
  { name: 'Priya Patel', role: 'Product Manager @ Figma', avatar: 'PP', rating: 5, text: 'The dashboard is gorgeous and the real-time collaboration is flawless. Our remote team finally feels in sync.' },
];

const Testimonials = () => (
  <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
        <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Testimonials</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Loved by teams everywhere</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">Don't take our word for it.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ perspective: 1200 }}>
        {testimonials.map(({ name, role, avatar, rating, text }, i) => {
          const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(10);
          return (
            <motion.div key={name} ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="relative p-8 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-3d-indigo">{avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{name}</div>
                    <div className="text-xs text-slate-500">{role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ── CTA ── */
const CTA = () => {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <section className="py-32 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6" style={{ perspective: 1200 }}>
        <motion.div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[2.5rem] py-24 px-8 text-center overflow-hidden shadow-3d-indigo">
          <div className="absolute inset-0 shimmer-3d" />
          <motion.div className="absolute -top-32 -left-32 w-80 h-80 bg-white/5 rounded-full"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }} transition={{ duration: 12, repeat: Infinity }} />
          <motion.div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }} transition={{ duration: 10, repeat: Infinity }} />
          <div className="relative z-10" style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              Ready to move faster?
            </h2>
            <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
              Join 50,000+ teams already using Taskflow to deliver their best work.
            </p>
            <motion.div whileHover={{ scale: 1.06, rotateX: -5 }} whileTap={{ scale: 0.97 }} style={{ transformStyle: 'preserve-3d' }} className="inline-block">
              <Link to="/register" className="flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-3d hover:shadow-xl transition-shadow mx-auto">
                Get started  <ArrowRight size={20} />
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Footer ── */
const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-3d-indigo">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">Taskflow</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">The project management platform built for teams that ship.</p>
        </div>
        {[
          { heading: 'Product', links: ['Features', 'Changelog', 'Roadmap'] },
          { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
          { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <h4 className="text-white font-bold text-sm mb-4">{heading}</h4>
            <ul className="space-y-2">
              {links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p>© 2026 Taskflow Inc. All rights reserved.</p>
        <p>Made with ♥ for high-performance teams</p>
      </div>
    </div>
  </footer>
);

/* ── Main export ── */
const Landing = () => (
  <div className="overflow-x-hidden bg-slate-950">
    <Navbar />
    <Hero />
    <Stats />
    <Features />
    <HowItWorks />
    <Testimonials />
    <CTA />
    <Footer />
  </div>
);

export default Landing;
