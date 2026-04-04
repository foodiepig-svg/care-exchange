import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Link2, FileText, Bell, HeartHandshake,
  CheckCircle2, ArrowRight, Lock, Clock, ChevronDown,
  Inbox, Clock3, UserCheck, BarChart3, FileStack, MessageSquare, Star
} from 'lucide-react'

const features = [
  {
    icon: Inbox,
    title: 'Digital Referral Inbox',
    desc: 'Receive secure referral links directly in your dashboard. Review the participant summary, goals, and consent scope before accepting.',
    color: 'bg-teal-50 text-teal-600',
    detail: 'Every referral includes the participant\'s care summary — their goals, current providers, and what they\'re consenting to share. No more phone calls asking for basics.',
  },
  {
    icon: FileText,
    title: 'Structured Update Templates',
    desc: 'Submit progress notes, incident reports, medication changes, and goal updates using pre-built templates. Consistent format, less time writing.',
    color: 'bg-violet-50 text-violet-600',
    detail: 'Templates guide you through what to include. Updates go directly to the participant\'s care record — timestamped, categorized, and easy to find.',
  },
  {
    icon: UserCheck,
    title: 'Pre-Cleared Consent',
    desc: 'When you receive a referral, the participant has already consented to your involvement and defined the scope. No chasing paperwork.',
    color: 'bg-emerald-50 text-emerald-600',
    detail: 'Consent is granular — you see exactly what categories the participant has approved for you. Their financial or personal details remain protected.',
  },
  {
    icon: BarChart3,
    title: 'Participant Overview Dashboard',
    desc: 'See all your participants in one view — active goals, recent updates, consent status, and upcoming plan review dates.',
    color: 'bg-blue-50 text-blue-600',
    detail: 'Sort by update frequency, goal progress, or plan review date. Get alerts when a participant hasn\'t had an update in a while.',
  },
  {
    icon: MessageSquare,
    title: 'Care Team Messaging',
    desc: 'Message the participant and their coordinator directly. Everything is in the same thread — no lost emails.',
    color: 'bg-amber-50 text-amber-600',
    detail: 'Threaded by referral. The participant\'s support coordinator can see messages without needing a separate email chain.',
  },
  {
    icon: FileStack,
    title: 'NDIS Category Mapping',
    desc: 'Tag updates to NDIS support categories. Participants see which funding categories their updates relate to.',
    color: 'bg-rose-50 text-rose-600',
    detail: 'Makes plan review prep easier — participants can see exactly which NDIS categories have been active during the plan period.',
  },
]

const problems = [
  {
    emoji: '📋',
    problem: 'Paper-based referrals take weeks to process',
    solution: 'Digital referral links arrive instantly. Accept or decline in one click. The participant\'s care summary is already there — no requesting files.',
  },
  {
    emoji: '📝',
    problem: 'Writing the same update format for every patient',
    solution: 'Structured templates mean you fill in the blanks rather than starting from scratch. Consistent, fast, and clinically useful for participants.',
  },
  {
    emoji: '🔒',
    problem: 'Chasing consent signatures before every session',
    solution: 'Participants grant consent through the platform before you\'re even involved. Consent scope is visible in your dashboard — always up to date.',
  },
  {
    emoji: '📊',
    problem: 'No overview of your entire participant roster',
    solution: 'Your provider dashboard shows every participant, their goal status, when they last had an update, and upcoming review dates — all in one view.',
  },
  {
    emoji: '💬',
    problem: 'Coordinator and family are on different email threads',
    solution: 'Care team messaging keeps everyone in the same conversation. The coordinator can see messages without being CC\'d.',
  },
  {
    emoji: '📅',
    problem: 'Plan reviews require pulling records from everywhere',
    solution: 'Export a structured care summary with all updates, goals, and provider notes in one document. Plan review prep takes minutes.',
  },
]

const dashboardMockup = {
  stats: [
    { label: 'Active Participants', value: '18', color: 'text-teal-600' },
    { label: 'Pending Referrals', value: '3', color: 'text-amber-500' },
    { label: 'Updates Sent', value: '47', color: 'text-violet-600' },
    { label: 'Goals Met', value: '9', color: 'text-emerald-600' },
  ],
  referrals: [
    { name: 'Alex Thompson', type: 'Physiotherapy', status: 'Active', time: '2d ago' },
    { name: 'Sarah Mitchell', type: 'Occupational Therapy', status: 'Pending', time: '4h ago' },
    { name: 'John Park', type: 'Psychology', status: 'Active', time: '1w ago' },
  ],
}

function DashboardMockup({ stats, referrals }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden font-sans">
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400 text-center">
          careexchange.com.au/provider
        </div>
      </div>
      <div className="flex">
        <div className="w-44 bg-slate-900 text-white p-4 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <ShieldCheck size={12} className="text-white" />
            </div>
            <span className="font-semibold text-white text-xs">Care Exchange</span>
          </div>
          {['Dashboard', 'Referrals', 'Participants', 'Messages', 'Updates', 'Settings'].map((item, i) => (
            <div key={item} className={`px-3 py-1.5 rounded-md ${i === 0 ? 'bg-violet-600/20 text-violet-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-slate-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">J</div>
            <div>
              <div className="text-white text-xs font-medium">James T.</div>
              <div className="text-slate-500 text-xs">Provider</div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-5 bg-slate-50">
          <div className="text-slate-900 text-base font-bold mb-4">Provider Dashboard</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-slate-700 text-xs font-semibold mb-3">Received Referrals</div>
            {referrals.map(r => (
              <div key={r.name} className="flex items-center justify-between mb-2 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                <div>
                  <div className="text-slate-800 text-xs font-medium">{r.name}</div>
                  <div className="text-slate-400 text-xs">{r.type}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${r.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                  {r.status}
                </span>
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

export default function ProviderLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
            <span className="hidden md:inline-flex items-center bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">For Providers</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">How It Works</a>
            <a href="#problems" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">Why Providers Choose Us</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
              Register your organisation <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-50 rounded-full opacity-60 blur-3xl" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-50 rounded-full opacity-60 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20">
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                  For NDIS Service Providers
                </div>
                <h1 className="text-5xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                  Less paperwork.<br />
                  <span className="text-violet-600">More time with clients.</span>
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed mb-8">
                  Receive digital referrals, submit structured updates, and coordinate with care teams — all from one dashboard built for NDIS providers.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-violet-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
                    Register your organisation <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 text-base font-medium px-6 py-4 hover:text-violet-600 transition-colors border border-slate-200 rounded-xl">
                    Sign in
                  </Link>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Lock size={13} className="text-violet-500" /> Encrypted data</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-violet-500" /> Digital referrals</span>
                  <span className="flex items-center gap-1.5"><UserCheck size={13} className="text-violet-500" /> Pre-cleared consent</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <DashboardMockup {...dashboardMockup} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────── */}
        <section className="bg-violet-900 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '< 2 min', label: 'To accept a referral', desc: 'Digital inbox, no paperwork' },
                { stat: '4 types', label: 'Of structured updates', desc: 'Notes, incidents, goals, meds' },
                { stat: '0', label: 'Consent forms to chase', desc: 'Participant grants before you arrive' },
                { stat: '100%', label: 'NDIS-native', desc: 'Support categories, plan mapping' },
              ].map(({ stat, label, desc }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white mb-1">{stat}</div>
                  <div className="text-violet-200 text-sm font-semibold mb-1">{label}</div>
                  <div className="text-violet-400 text-xs">{desc}</div>
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
                Why Providers Choose Us
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                The referral and update workflow problems we solve
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Built by people who have worked in NDIS provider services — we know the daily pain points.
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
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Provider Features
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything you need to manage your NDIS participants
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                From referral to update to plan review — all in one workflow.
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
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Getting Started
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Get started in under 5 minutes
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Register your organisation, connect your first referral, submit your first update.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { num: '01', title: 'Register your organisation', desc: 'Create a provider account. Add your service categories, ABN, and Organisation contact details.' },
                { num: '02', title: 'Receive your first referral', desc: 'A participant sends you a secure referral link. Review their summary and consent scope.' },
                { num: '03', title: 'Accept and start delivering', desc: 'Accept the referral. The participant\'s care record opens with your update templates ready.' },
                { num: '04', title: 'Submit structured updates', desc: 'Log updates using templates. The participant sees them instantly in their care record.' },
              ].map(({ num, title, desc }) => (
                <div key={num} className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
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
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to go digital with your referrals?
                </h2>
                <p className="text-violet-100 text-lg max-w-lg mx-auto mb-8">
                  Join hundreds of NDIS providers who have replaced paper-based referrals with Care Exchange.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-violet-700 text-base font-bold px-8 py-4 rounded-xl hover:bg-violet-50 transition-colors shadow-lg">
                    Register your organisation <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-white text-base font-semibold px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">
                    Sign in
                  </Link>
                </div>
                <p className="text-violet-200 text-sm mt-4">Free during beta. No setup fees.</p>
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
                Questions providers ask
              </h2>
            </div>
            <div>
              {[
                { q: 'Does Care Exchange replace my practice management software?', a: 'No — Care Exchange is coordination infrastructure, not clinical or billing software. It sits alongside your existing practice management system to handle referrals, consent, and care coordination.' },
                { q: 'How does consent work for providers?', a: 'The participant grants consent through the platform before you receive the referral. You\'ll see exactly which data categories they\'ve approved for you. If they revoke consent, you\'re notified immediately.' },
                { q: 'What NDIS support categories are supported?', a: 'We support all NDIS Core, Capacity Building, and Capital support categories. Updates can be tagged to specific categories to help with plan budget tracking.' },
                { q: 'Can I message the participant\'s support coordinator?', a: 'Yes. Care team messaging lets you communicate with both the participant and their support coordinator in the same thread, without needing to CC external email addresses.' },
                { q: 'How do plan reviews work?', a: 'You can export a structured care summary for any participant — all updates, goals, and provider notes in one document. Participants can download this for their NDIS plan review.' },
                { q: 'Is there a cost for providers?', a: 'Free during the beta period. Pricing for larger organisations will be announced at launch.' },
              ].map(faq => <FaqItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-200 text-lg">Care Exchange</span>
          </div>
          <p className="text-sm">© 2026 Care Exchange. NDIS Provider Coordination Platform.</p>
        </div>
      </footer>
    </div>
  )
}
