import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Link2, FileText, Users, Bell, HeartHandshake,
  CheckCircle2, ArrowRight, Lock, Clock, ChevronDown,
  Target, Eye, UserCheck, FileCheck, MessageSquare, Star, ArrowUpRight
} from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'Secure Referral Links',
    desc: 'Send time-limited, single-use referral links to providers. Cryptographically secure, delivered via email or SMS.',
    color: 'bg-teal-50 text-teal-600',
    accent: 'bg-teal-600',
    detail: 'Each link expires in 7 days and can only be used once. Before sending, you choose which providers can see which parts of your record.',
  },
  {
    icon: FileText,
    title: 'Structured Provider Updates',
    desc: 'No more chasing phone calls or PDFs. Providers submit short, categorized updates — progress notes, incidents, medications, goals.',
    color: 'bg-violet-50 text-violet-600',
    accent: 'bg-violet-600',
    detail: 'Updates are timestamped and organized by category. You see exactly what happened, when, without wading through lengthy reports.',
  },
  {
    icon: HeartHandshake,
    title: 'Granular Consent Control',
    desc: 'Grant and revoke consent per provider, per data category. Your care record stays yours.',
    color: 'bg-rose-50 text-rose-600',
    accent: 'bg-rose-600',
    detail: 'Consent is per-provider and per-category. A physio might see your mobility goals but not your financial information. Revoke anytime.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    desc: 'Set NDIS plan goals and track progress across all providers in one place.',
    color: 'bg-amber-50 text-amber-600',
    accent: 'bg-amber-600',
    detail: 'Each goal shows which providers are contributing, recent progress notes, and days since last update. No more spreadsheets.',
  },
  {
    icon: Users,
    title: 'Your Whole Care Team',
    desc: 'Everyone in one place — support coordinators, providers, family. Clear roles, clear responsibilities.',
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'bg-emerald-600',
    detail: 'See at a glance who is in your care team, their role, and when they last submitted an update or messaged you.',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    desc: 'Alerts for referrals, updates, consent requests, and goal milestones — via email and in-app.',
    color: 'bg-blue-50 text-blue-600',
    accent: 'bg-blue-600',
    detail: 'Get notified the moment a provider submits an update, a referral is accepted, or a goal milestone is reached.',
  },
]

const problems = [
  {
    emoji: '😩',
    problem: 'Chasing updates from multiple providers',
    solution: 'All provider updates arrive in one place — categorized and timestamped. No more phone calls, emails, or lost sticky notes.',
  },
  {
    emoji: '😰',
    problem: 'Managing who sees what across your care team',
    solution: 'Granular consent means you control exactly what each provider and coordinator can access — and you can revoke it anytime.',
  },
  {
    emoji: '📋',
    problem: 'Keeping track of NDIS goals across providers',
    solution: 'Your goal dashboard shows all active goals, which providers are contributing, and the latest progress — all in one view.',
  },
  {
    emoji: '🔗',
    problem: 'Getting providers connected quickly',
    solution: 'Send a secure referral link in seconds via email or SMS. The provider creates their account, reviews your summary, and accepts — all with your consent.',
  },
  {
    emoji: '👨‍👩‍👧',
    problem: 'Family members left out of the loop',
    solution: 'Invite family with view-only access so they can see updates and progress without interfering with clinical decisions.',
  },
  {
    emoji: '📑',
    problem: 'NDIS plan review prep is overwhelming',
    solution: 'Export your full care record — goals, updates, provider notes — as a structured document. Plan review prep takes minutes, not days.',
  },
]

const dashboardMockup = {
  stats: [
    { label: 'Active Referrals', value: '2', color: 'text-teal-600' },
    { label: 'Care Team', value: '4', color: 'text-violet-600' },
    { label: 'Goals Progress', value: '67%', color: 'text-amber-500' },
    { label: 'Updates', value: '12', color: 'text-blue-600' },
  ],
  referrals: [
    { name: 'PhysioCare Melbourne', type: 'Physiotherapy', status: 'Active', time: '2h ago' },
    { name: 'Mindful Psychology', type: 'Psychology', status: 'Pending', time: '1d ago' },
  ],
  goals: [
    { title: 'Improve mobility', progress: 67, updated: '3d ago' },
    { title: 'Build social connections', progress: 40, updated: '1w ago' },
    { title: 'Independent living skills', progress: 85, updated: '2d ago' },
  ],
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-slate-500 leading-relaxed text-sm">{a}</div>}
    </div>
  )
}

function DashboardMockup({ stats, referrals, goals }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden font-sans">
      {/* Mock browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400 text-center">
          careexchange.com.au/dashboard
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-44 bg-slate-900 text-white p-4 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
            <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
              <ShieldCheck size={12} className="text-white" />
            </div>
            <span className="font-semibold text-white text-xs">Care Exchange</span>
          </div>
          {['Dashboard', 'Referrals', 'Care Team', 'Messages', 'Goals', 'Documents', 'Consent'].map((item, i) => (
            <div key={item} className={`px-3 py-1.5 rounded-md ${i === 0 ? 'bg-teal-600/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-slate-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">A</div>
            <div>
              <div className="text-white text-xs font-medium">Alex T.</div>
              <div className="text-slate-500 text-xs">Participant</div>
            </div>
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-5 bg-slate-50">
          <div className="text-slate-900 text-base font-bold mb-4">Welcome back, Alex</div>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Referrals */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-slate-700 text-xs font-semibold mb-2">Active Referrals</div>
              {referrals.map(r => (
                <div key={r.name} className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-slate-800 text-xs font-medium">{r.name}</div>
                    <div className="text-slate-400 text-xs">{r.type}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${r.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
            {/* Goals */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-slate-700 text-xs font-semibold mb-2">Goals</div>
              {goals.map(g => (
                <div key={g.title} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">{g.title}</span>
                    <span className="text-slate-500">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParticipantLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">How It Works</a>
            <a href="#problems" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Problems We Solve</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">FAQ</a>
            <Link to="/help/participant" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Help</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-50 rounded-full opacity-60 blur-3xl" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-violet-50 rounded-full opacity-60 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                  For Participants
                </div>
                <h1 className="text-5xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                  Your care.<br />
                  <span className="text-teal-600">Your control.</span>
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed mb-8">
                  Care Exchange puts you at the centre of your NDIS journey. Build your care team, track your goals, and receive structured updates — all with complete consent control.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-teal-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
                    Create your account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 text-base font-medium px-6 py-4 hover:text-teal-600 transition-colors border border-slate-200 rounded-xl">
                    Sign in
                  </Link>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Lock size={13} className="text-teal-500" /> End-to-end encrypted</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-teal-500" /> 7-day referral links</span>
                  <span className="flex items-center gap-1.5"><UserCheck size={13} className="text-teal-500" /> You control consent</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <DashboardMockup {...dashboardMockup} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Dashboard Preview Banner ─────────────────────────────── */}
        <section className="bg-slate-900 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Link2, stat: '7 days', label: 'Referral link expiry', desc: 'Single-use, time-limited' },
                { icon: FileText, stat: '4 types', label: 'Structured updates', desc: 'Notes, incidents, goals, meds' },
                { icon: UserCheck, stat: '100%', label: 'Consent control', desc: 'Per provider, per category' },
                { icon: Eye, stat: 'Zero', label: 'Data sharing', desc: 'Never sold or shared' },
              ].map(({ icon: Icon, stat, label, desc }) => (
                <div key={label} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600/20 mb-3">
                    <Icon size={20} className="text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat}</div>
                  <div className="text-slate-300 text-sm font-semibold mb-1">{label}</div>
                  <div className="text-slate-500 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problems We Solve ────────────────────────────────────── */}
        <section id="problems" className="py-24 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Why Care Exchange
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                The problems NDIS participants face — and how we solve them
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                We built Care Exchange after hearing the same frustrations from participants, families, and coordinators — over and over again.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map(({ emoji, problem, solution }) => (
                <div key={problem} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="text-3xl mb-4">{emoji}</div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{problem}</h3>
                  <div className="h-0.5 w-8 bg-slate-200 rounded mb-3" />
                  <p className="text-slate-500 text-sm leading-relaxed">{solution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section id="features" className="py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                What You Get
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything you need to manage your NDIS care
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Purpose-built for participants — not adapted from a generic system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {features.map(({ icon: Icon, title, desc, detail, color, accent }) => (
                <div key={title} className="flex gap-5">
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-2">{desc}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Getting Started
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Up and running in minutes
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                No complex setup. No training required. Just your care, organized.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { num: '01', title: 'Create your account', desc: 'Sign up as a participant. Add your NDIS plan details and set your goals.' },
                { num: '02', title: 'Build your care team', desc: 'Send referral links to your providers. They create an account and accept — with your consent.' },
                { num: '03', title: 'Receive updates', desc: 'Providers submit structured updates. They appear in your care record, organized and timestamped.' },
                { num: '04', title: 'Track and review', desc: 'Monitor goal progress, review consent settings, and export your record anytime.' },
              ].map(({ num, title, desc }) => (
                <div key={num} className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {num}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to take control of your care?
                </h2>
                <p className="text-teal-100 text-lg max-w-lg mx-auto mb-8">
                  Join thousands of NDIS participants who use Care Exchange to manage their care team, track their goals, and stay informed.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-teal-700 text-base font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
                    Create free account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-white text-base font-semibold px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">
                    Sign in to your account
                  </Link>
                </div>
                <p className="text-teal-200 text-sm mt-4">Free during beta. No credit card required.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                FAQ
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Questions participants ask
              </h2>
            </div>
            <div>
              {[
                { q: 'Is my health information secure?', a: 'Yes. All data is encrypted in transit (TLS) and at rest. Referral links use cryptographic tokens that expire after 7 days and can only be used once. We never sell or share your data with third parties.' },
                { q: 'Who can see my NDIS plan number?', a: 'Only providers and coordinators you have explicitly granted consent to. Your plan number is never shared without your explicit permission.' },
                { q: 'Can I remove a provider from my care team?', a: 'Absolutely. You can revoke a provider\'s consent at any time, which removes their access to your record. You can also re-invite them with new consent settings.' },
                { q: 'What happens to my data if I close my account?', a: 'You can export all your data at any time as a structured file. If you close your account, we delete your personal data within 30 days in accordance with Australian privacy law.' },
                { q: 'Can family members see my care record?', a: 'Yes, if you invite them. You control their access level — view-only or more. They cannot modify clinical information or consent settings.' },
                { q: 'Is Care Exchange free?', a: 'Yes — free for participants and families during the beta period. Provider and coordinator accounts are also free during beta.' },
              ].map(faq => <FaqItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-200 text-lg">Care Exchange</span>
          </div>
          <p className="text-sm">© 2026 Care Exchange. Participant-controlled NDIS coordination.</p>
        </div>
      </footer>
    </div>
  )
}
