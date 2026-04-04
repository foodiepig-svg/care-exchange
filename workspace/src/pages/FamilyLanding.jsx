import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, HeartHandshake, Bell, Users, Eye, EyeOff,
  CheckCircle2, ArrowRight, Lock, Clock, ChevronDown,
  UserCheck, FileText, MessageSquare, Heart, Star, ArrowUpRight
} from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: 'Real-Time Visibility',
    desc: 'See provider updates, goal progress, and care team activity in real time — without calling anyone.',
    color: 'bg-teal-50 text-teal-600',
    detail: 'Updates from physiotherapists, psychologists, occupational therapists — all visible as they happen. No more waiting for phone calls to find out what happened in a session.',
  },
  {
    icon: Bell,
    title: 'Custom Alerts',
    desc: 'Get notified when an update is submitted, a goal milestone is reached, or something needs your attention.',
    color: 'bg-amber-50 text-amber-600',
    detail: 'Choose what you want to be notified about — new updates, goal changes, consent requests. Notifications via email and in-app.',
  },
  {
    icon: HeartHandshake,
    title: 'Support the Participant',
    desc: 'View-only access means you stay informed without interfering with clinical decisions or provider workflows.',
    color: 'bg-rose-50 text-rose-600',
    detail: 'Your access is always view-only. You can see what\'s happening but can\'t modify clinical information. The participant controls your access.',
  },
  {
    icon: MessageSquare,
    title: 'Message the Care Team',
    desc: 'Ask questions, share observations, and communicate with providers and coordinators — all in one place.',
    color: 'bg-violet-50 text-violet-600',
    detail: 'Message providers and coordinators directly from the care record. Keep everyone informed without hunting for email addresses.',
  },
  {
    icon: FileText,
    title: 'Care Record Access',
    desc: 'Access the participant\'s care record — goals, updates, provider notes — in one organized place.',
    color: 'bg-emerald-50 text-emerald-600',
    detail: 'No more chasing providers for notes or trying to piece together what happened. The full care record is here, organized by date and category.',
  },
  {
    icon: Lock,
    title: 'Privacy Protected',
    desc: 'Your family member controls what you can see. They can revoke access at any time.',
    color: 'bg-blue-50 text-blue-600',
    detail: 'The participant sets your access level. You might see care updates but not financial information. They\'re always in control.',
  },
]

const problems = [
  {
    emoji: '😰',
    problem: 'Never knowing what happened at appointments',
    solution: 'Provider updates appear in real time. See exactly what happened in each session — progress notes, incidents, medication changes — as soon as they\'re submitted.',
  },
  {
    emoji: '📞',
    problem: 'Repeating the same information to every provider',
    solution: 'The participant\'s care record is shared with their providers. Everyone sees the same information — no more being the messenger between providers.',
  },
  {
    emoji: '📋',
    problem: 'Managing NDIS plan goals across multiple providers',
    solution: 'Goal tracking shows all active goals and which providers are contributing. See progress at a glance — no more chasing each provider for an update.',
  },
  {
    emoji: '🤝',
    problem: 'Feeling excluded from care decisions',
    solution: 'With family access, you can see what\'s happening, ask questions, and contribute — without overriding the participant\'s or provider\'s decisions.',
  },
  {
    emoji: '📅',
    problem: 'Plan reviews are chaotic to prepare',
    solution: 'Export the full care record — all updates, goals, provider notes — as a structured document. Plan review prep takes minutes, not days.',
  },
  {
    emoji: '🔒',
    problem: 'Privacy concerns about who sees what',
    solution: 'The participant controls exactly what you can see. They can revoke access at any time. You only see what they want you to see.',
  },
]

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

export default function FamilyLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
            <span className="hidden md:inline-flex items-center bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">For Families</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">How It Works</a>
            <a href="#problems" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">Why Families</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">FAQ</a>
            <Link to="/help/family" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">Help</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors">
              Join a participant <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-50 rounded-full opacity-60 blur-3xl" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-amber-50 rounded-full opacity-60 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                For Families and Carers
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Stay informed.<br />
                <span className="text-rose-500">Stay involved.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-8">
                See provider updates, track care goals, and stay connected with your family member's care team — with access your loved one controls.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 bg-rose-500 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-rose-600 transition-colors shadow-sm">
                  Join a participant <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 text-base font-medium px-6 py-4 hover:text-rose-500 transition-colors border border-slate-200 rounded-xl">
                  Sign in
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Eye size={13} className="text-rose-400" /> View-only access</span>
                <span className="flex items-center gap-1.5"><Bell size={13} className="text-rose-400" /> Real-time updates</span>
                <span className="flex items-center gap-1.5"><HeartHandshake size={13} className="text-rose-400" /> Participant controls access</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────── */}
        <section className="bg-slate-900 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: '100%', label: 'Visibility', desc: 'See all provider updates' },
                { stat: '0', label: 'Phone calls needed', desc: 'Updates arrive automatically' },
                { stat: '1', label: 'Place for everything', desc: 'Goals, updates, messages' },
                { stat: '∞', label: 'Revocable', desc: 'Access can be revoked anytime' },
              ].map(({ stat, label, desc }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white mb-1">{stat}</div>
                  <div className="text-slate-300 text-sm font-semibold mb-1">{label}</div>
                  <div className="text-slate-500 text-xs">{desc}</div>
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
                Why Families Choose Us
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                The challenges families and carers face — and how we help
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Caring for someone with a disability means coordinating across many providers. We help you stay informed without the chaos.
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
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Family Features
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                What family access gives you
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Stay connected to your family member's care — with exactly the access they want you to have.
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
                Getting connected takes minutes
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Your family member invites you. You create an account. You're in.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'Your family member invites you', desc: 'From their Care Exchange account, they send you an invitation. You\'ll receive it by email.' },
                { num: '02', title: 'Create your account', desc: 'Sign up with your email and set a password. Your family member chooses what you can see.' },
                { num: '03', title: 'See their care updates', desc: 'Once connected, you\'ll see provider updates, goal progress, and care team activity in real time.' },
              ].map(({ num, title, desc }) => (
                <div key={num} className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
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
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Want to stay in the loop?
                </h2>
                <p className="text-rose-100 text-lg max-w-lg mx-auto mb-8">
                  Ask your family member to invite you to Care Exchange. You'll see their care updates in real time — with their permission.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white text-rose-600 text-base font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg">
                    Create family account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 text-white text-base font-semibold px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">
                    Sign in
                  </Link>
                </div>
                <p className="text-rose-200 text-sm mt-4">Free for families. Your family member controls your access.</p>
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
                Questions families ask
              </h2>
            </div>
            <div>
              {[
                { q: 'What can I see as a family member?', a: 'Your family member controls exactly what you can see. They might let you see care updates and goals but not financial or personal information. You can only see what they grant you access to.' },
                { q: 'Can I make decisions about care?', a: 'No — your access is view-only. Clinical decisions remain between the participant and their providers. Your role is to stay informed and support, not to direct care.' },
                { q: 'Can the participant remove my access?', a: 'Yes, immediately and at any time. The participant is always in control. They can revoke your access from their consent settings page.' },
                { q: 'Can I message providers?', a: 'Yes. Care team messaging lets you ask questions and communicate with providers and coordinators directly — all in one place, without needing email addresses.' },
                { q: 'Is there a cost for families?', a: 'No — family accounts are always free. The participant invites you at no cost to either of you.' },
                { q: 'How is this different from just being CC\'d on emails?', a: 'Unlike emails, everything is organized and searchable. Updates are categorized (progress notes, incidents, goals) and timestamped. You see the full care record, not just fragments.' },
              ].map(faq => <FaqItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-200 text-lg">Care Exchange</span>
          </div>
          <p className="text-sm">© 2026 Care Exchange. Family and Carer Coordination Platform.</p>
        </div>
      </footer>
    </div>
  )
}
