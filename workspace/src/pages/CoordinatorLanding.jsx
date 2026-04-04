import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Link2, Users, BarChart3, Bell, HeartHandshake,
  CheckCircle2, ArrowRight, Lock, Clock, ChevronDown,
  UserCog, Eye, FileText, UserCheck, TrendingUp, AlertCircle, Star, ArrowUpRight
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Participant Roster',
    desc: 'Manage all your participants in one view. See their care teams, active referrals, goal progress, and recent updates at a glance.',
    color: 'bg-teal-50 text-teal-600',
    detail: 'Filter by status, update frequency, plan review date, or NDIS plan type. Get flags when a participant hasn\'t had a provider update in 30+ days.',
  },
  {
    icon: BarChart3,
    title: 'Cross-Provider Visibility',
    desc: 'See all provider updates for each participant in one timeline — regardless of which provider submitted them.',
    color: 'bg-violet-50 text-violet-600',
    detail: 'Instead of chasing each provider separately, you see all updates in the participant\'s care record. Filter by provider, category, or date range.',
  },
  {
    icon: TrendingUp,
    title: 'Goal Progress Tracking',
    desc: 'Monitor NDIS plan goals across all providers. See which goals are on track, which need attention, and which are complete.',
    color: 'bg-emerald-50 text-emerald-600',
    detail: 'Each goal shows contributing providers, recent progress notes, and percentage complete. Export a goal progress report for plan reviews in one click.',
  },
  {
    icon: Link2,
    title: 'Coordinate Referrals',
    desc: 'Track referral status across your entire participant roster. See who has sent referrals, who\'s pending, and who\'s been accepted.',
    color: 'bg-amber-50 text-amber-600',
    detail: 'When a participant sends a referral, you can see its status in your coordinator dashboard. Follow up with providers who haven\'t responded.',
  },
  {
    icon: Bell,
    title: 'Alerts and Notifications',
    desc: 'Get notified when a referral is sent, a goal milestone is reached, or a participant hasn\'t received an update in a set period.',
    color: 'bg-blue-50 text-blue-600',
    detail: 'Set custom alerts — e.g., notify me if no update for 14 days, or when a new referral is sent. Email and in-app notifications.',
  },
  {
    icon: Eye,
    title: 'Read-Only Care Team Access',
    desc: 'View the full care record for each participant — updates, goals, documents, messages — without interfering with clinical decisions.',
    color: 'bg-rose-50 text-rose-600',
    detail: 'Your access is always read-only. You can see what\'s happening but can\'t modify clinical data. Participants can revoke your access anytime.',
  },
]

const problems = [
  {
    emoji: '📋',
    problem: 'Tracking 20+ participants across multiple providers',
    solution: 'Your coordinator dashboard shows every participant and their full care team status — updates, goals, referrals — in one view. No more spreadsheets.',
  },
  {
    emoji: '📞',
    problem: 'Chasing providers for progress updates',
    solution: 'Provider updates appear directly in the participant\'s care record. You see them in real time — no phone calls, no emails, no waiting.',
  },
  {
    emoji: '🎯',
    problem: 'Monitoring NDIS plan goal progress across providers',
    solution: 'Goal tracking shows all goals and which providers are contributing. See progress bars, recent notes, and days since last update — across every provider.',
  },
  {
    emoji: '📅',
    problem: 'Plan review prep takes days to compile',
    solution: 'Export a full care summary — all updates, goals, provider notes — in one structured document. Plan review prep goes from days to minutes.',
  },
  {
    emoji: '🚨',
    problem: 'Only finding out about issues when they escalate',
    solution: 'Custom alerts notify you when a participant hasn\'t had an update in a set period, a referral goes unanswered, or a goal goes off track.',
  },
  {
    emoji: '👥',
    problem: 'Managing family communication alongside providers',
    solution: 'Care team messaging lets you communicate with the participant, family members, and providers — all in one thread per referral.',
  },
]

const dashboardMockup = {
  stats: [
    { label: 'My Participants', value: '24', color: 'text-teal-600' },
    { label: 'Pending Referrals', value: '7', color: 'text-amber-500' },
    { label: 'Goals On Track', value: '31', color: 'text-emerald-600' },
    { label: 'Alerts', value: '5', color: 'text-red-500' },
  ],
  participants: [
    { name: 'Alex Thompson', providers: 4, status: 'On Track', updated: '2d ago' },
    { name: 'Sarah Mitchell', providers: 6, status: 'Needs Review', updated: '6d ago' },
    { name: 'John Park', providers: 3, status: 'On Track', updated: '1d ago' },
  ],
}

function DashboardMockup({ stats, participants }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden font-sans">
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400 text-center">
          careexchange.com.au/coordinator
        </div>
      </div>
      <div className="flex">
        <div className="w-44 bg-slate-900 text-white p-4 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
              <ShieldCheck size={12} className="text-white" />
            </div>
            <span className="font-semibold text-white text-xs">Care Exchange</span>
          </div>
          {['Dashboard', 'Participants', 'Referrals', 'Goals', 'Messages', 'Alerts', 'Settings'].map((item, i) => (
            <div key={item} className={`px-3 py-1.5 rounded-md ${i === 0 ? 'bg-emerald-600/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-slate-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">E</div>
            <div>
              <div className="text-white text-xs font-medium">Emily R.</div>
              <div className="text-slate-500 text-xs">Coordinator</div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-5 bg-slate-50">
          <div className="text-slate-900 text-base font-bold mb-4">Coordinator Dashboard</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-slate-700 text-xs font-semibold mb-3">Participant Roster</div>
            {participants.map(p => (
              <div key={p.name} className="flex items-center justify-between mb-2 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                <div>
                  <div className="text-slate-800 text-xs font-medium">{p.name}</div>
                  <div className="text-slate-400 text-xs">{p.providers} providers</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${p.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.status}
                  </span>
                  <div className="text-slate-400 text-xs mt-0.5">{p.updated}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-slate-500 leading-relaxed text-sm">{a}</div>}
    </div>
  )
}

export default function CoordinatorLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
            <span className="hidden md:inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">For Coordinators</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#problems" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Why Coordinators</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">FAQ</a>
            <Link to="/help/coordinator" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Help</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Create coordinator account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-50 rounded-full opacity-60 blur-3xl" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-50 rounded-full opacity-60 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  For Support Coordinators
                </div>
                <h1 className="text-5xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                  See everything.<br />
                  <span className="text-emerald-600">Miss nothing.</span>
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed mb-8">
                  Manage your entire participant roster from one dashboard. Track goals, monitor provider updates, and coordinate care — without chasing phone calls.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-emerald-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                    Create coordinator account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 text-base font-medium px-6 py-4 hover:text-emerald-600 transition-colors border border-slate-200 rounded-xl">
                    Sign in
                  </Link>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Lock size={13} className="text-emerald-500" /> Read-only participant access</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-emerald-500" /> Real-time provider updates</span>
                  <span className="flex items-center gap-1.5"><Bell size={13} className="text-emerald-500" /> Custom alerts</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <DashboardMockup {...dashboardMockup} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────── */}
        <section className="bg-emerald-900 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '∞', label: 'Participants in one view', desc: 'Unlimited — no per-participant pricing' },
                { stat: '100%', label: 'Provider visibility', desc: 'See all updates, all providers' },
                { stat: '1-click', label: 'Plan review export', desc: 'All goals, updates, notes in one doc' },
                { stat: '0', label: 'Spreadsheets needed', desc: 'Everything tracked in the platform' },
              ].map(({ stat, label, desc }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white mb-1">{stat}</div>
                  <div className="text-emerald-200 text-sm font-semibold mb-1">{label}</div>
                  <div className="text-emerald-400 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problems ────────────────────────────────────────────── */}
        <section id="problems" className="py-24 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Why Coordinators Choose Us
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                The coordination pain points we solve
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Built by support coordinators who know what it\'s like to manage 20+ participants across 5+ providers with nothing but phone calls and spreadsheets.
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
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Coordinator Features
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything you need to coordinate better
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Purpose-built for support coordinators managing complex, multi-provider NDIS care.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {features.map(({ icon: Icon, title, desc, detail, color }) => (
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
                No complex onboarding. Just connect your participants and start coordinating.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { num: '01', title: 'Create your account', desc: 'Register as a support coordinator. Add your Organisation details and contact information.' },
                { num: '02', title: 'Connect your participants', desc: 'Participants invite you to their care team. You\'ll see their full care record with read-only access.' },
                { num: '03', title: 'Monitor and coordinate', desc: 'Track goal progress, provider updates, and referral status across all your participants from one dashboard.' },
                { num: '04', title: 'Export for plan reviews', desc: 'Generate a full care summary for any participant in one click — ready for their NDIS plan review.' },
              ].map(({ num, title, desc }) => (
                <div key={num} className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
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
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to coordinate with clarity?
                </h2>
                <p className="text-emerald-100 text-lg max-w-lg mx-auto mb-8">
                  Join support coordinators who manage their entire roster from Care Exchange — no more missing updates or outdated spreadsheets.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-emerald-700 text-base font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
                    Create coordinator account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-white text-base font-semibold px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">
                    Sign in
                  </Link>
                </div>
                <p className="text-emerald-200 text-sm mt-4">Free during beta.</p>
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
                Questions coordinators ask
              </h2>
            </div>
            <div>
              {[
                { q: 'How is my coordinator access different from a provider?', a: 'As a coordinator, you have read-only access to each participant\'s care record. You can see updates, goals, and messages but cannot modify clinical data. Providers have write access for updates; coordinators have oversight.' },
                { q: 'How do I get connected to my participants?', a: 'Participants invite you to their care team through the platform. You\'ll receive a notification and can then see their full record. Participants control your access and can revoke it at any time.' },
                { q: 'Can I message providers directly?', a: 'Yes. Care team messaging lets you communicate with providers and the participant in threaded conversations per referral. No need for external email.' },
                { q: 'Can I set alerts for my participants?', a: 'Yes. Set custom alerts per participant — e.g., notify me if no update in 14 days, or when a goal milestone is reached. Alerts come via email and in-app.' },
                { q: 'How does plan review export work?', a: 'For any participant, you can generate a full care summary — all goals, provider updates, consent records, and messages — in one structured PDF or digital document. Ready for the NDIS plan review meeting.' },
                { q: 'Is there a cost for coordinators?', a: 'Free during beta. We\'ll announce pricing for larger coordination organisations at launch.' },
              ].map(faq => <FaqItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-200 text-lg">Care Exchange</span>
          </div>
          <p className="text-sm">© 2026 Care Exchange. Support Coordinator Coordination Platform.</p>
        </div>
      </footer>
    </div>
  )
}
