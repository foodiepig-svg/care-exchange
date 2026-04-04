import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Link2, FileText, Users, Bell, HeartHandshake,
  ChevronDown, Menu, X, CheckCircle2, ArrowRight, Lock,
  Clock, Star, ArrowUpRight
} from 'lucide-react'

// ── Feature data ───────────────────────────────────────────────────────────────

const features = [
  {
    icon: Link2,
    title: 'Secure Referral Links',
    desc: 'Send time-limited, single-use referral links to providers. Cryptographically secure, delivered via email or SMS.',
    color: 'bg-teal-50 text-teal-600',
    accent: 'bg-teal-600',
  },
  {
    icon: FileText,
    title: 'Structured Provider Updates',
    desc: 'No more lengthy reports. Providers submit short, categorized updates — progress notes, incidents, medications, goals.',
    color: 'bg-violet-50 text-violet-600',
    accent: 'bg-violet-600',
  },
  {
    icon: HeartHandshake,
    title: 'You Control Your Data',
    desc: 'Grant and revoke consent per provider, per data category. Your care record stays yours.',
    color: 'bg-rose-50 text-rose-600',
    accent: 'bg-rose-600',
  },
  {
    icon: Users,
    title: 'Your Whole Care Team',
    desc: 'Everyone in one place — support coordinators, providers, family members. Clear roles, clear responsibilities.',
    color: 'bg-amber-50 text-amber-600',
    accent: 'bg-amber-600',
  },
  {
    icon: Bell,
    title: 'Stay Informed',
    desc: 'Real-time alerts for referrals, updates, consent requests, and goal deadlines — via email and in-app.',
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'bg-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'NDIS-Native Design',
    desc: 'Built for the NDIS ecosystem — plan numbers, funding categories, support coordinators, and provider workflows out of the box.',
    color: 'bg-blue-50 text-blue-600',
    accent: 'bg-blue-600',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your care record',
    desc: 'Sign up as a participant and set up your care profile — goals, supports, plan details. Everything in one secure place.',
    detail: 'Add your NDIS plan details, set your goals, and upload any existing documents or care plans.',
  },
  {
    number: '02',
    title: 'Build your care team',
    desc: 'Invite your support coordinator, providers, and family members. Each gets exactly the access you choose.',
    detail: 'Send secure referral links to providers. They create their account, review your summary, and accept — all with your consent.',
  },
  {
    number: '03',
    title: 'Receive structured updates',
    desc: 'When providers submit updates, they go directly into your care record — categorized, timestamped, and easy to read.',
    detail: 'Progress notes, incident reports, goal updates — all in one timeline. No more chasing phone calls or PDFs.',
  },
  {
    number: '04',
    title: 'Stay in control',
    desc: 'Review consent settings anytime. Revoke access when a provider relationship ends. Your data follows your rules.',
    detail: 'Consent is per-provider, per-category, and time-limited. You can update it anytime from your dashboard.',
  },
]

const roles = [
  {
    emoji: '🧑',
    name: 'Participants',
    desc: 'People with disabilities who control their own care record, grants consent, sends referrals, and tracks goals.',
    cta: 'Create your account',
    href: '/register',
    learnMoreHref: '/participant',
    highlight: true,
  },
  {
    emoji: '👨‍👩‍👧',
    name: 'Families',
    desc: 'Family members with delegated access to view updates, track progress, and stay connected with the care team.',
    cta: 'Join a participant',
    href: '/register',
    learnMoreHref: '/family',
    highlight: false,
  },
  {
    emoji: '🏥',
    name: 'Providers',
    desc: 'Service providers who receive referrals, submit structured updates, and coordinate with the care team.',
    cta: 'Register your organisation',
    href: '/register',
    learnMoreHref: '/provider',
    highlight: false,
  },
  {
    emoji: '📋',
    name: 'Coordinators',
    desc: 'Support Coordinators managing multiple participants — track referrals, monitor progress, and coordinate care.',
    cta: 'Create coordinator account',
    href: '/register',
    learnMoreHref: '/coordinator',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Is Care Exchange an approved NDIS platform?',
    a: "Care Exchange is not a registered NDIS provider itself — it's coordination infrastructure. It helps participants and their chosen providers communicate more effectively. The platform is designed to work alongside existing NDIS systems, not replace them.",
  },
  {
    q: 'How does consent work?',
    a: "As a participant, you grant consent separately to each provider and coordinator — for specific data categories (e.g., goals, progress notes, documents). You can revoke consent at any time. No provider can see your record without your explicit consent.",
  },
  {
    q: 'Is my health information secure?',
    a: "Yes. All data is encrypted in transit (TLS) and at rest. Referral links use cryptographic tokens that expire after 7 days and can only be used once. We never sell or share your data with third parties.",
  },
  {
    q: 'How much does it cost?',
    a: "Care Exchange is free for participants and families. Provider and coordinator accounts are also free during the beta period. Pricing for larger organisations will be announced at launch.",
  },
  {
    q: 'Who can see my NDIS plan number?',
    a: "Only providers and coordinators you have granted consent to. Your plan number is part of your care record and is never shared without your explicit permission.",
  },
  {
    q: 'What happens to my data if I stop using the platform?',
    a: "You can export all your data at any time as a PDF or structured file. If you close your account, we delete your personal data within 30 days in accordance with privacy laws.",
  },
]

// ── Accordion item ────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-slate-500 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">How it Works</a>
          <a href="#who-its-for" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Who It's For</a>
          <a href="#faq" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-500" onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-slate-600 py-2">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm text-slate-600 py-2">How it Works</a>
          <a href="#who-its-for" onClick={() => setOpen(false)} className="block text-sm text-slate-600 py-2">Who It's For</a>
          <a href="#faq" onClick={() => setOpen(false)} className="block text-sm text-slate-600 py-2">FAQ</a>
          <div className="pt-2 border-t border-slate-100 flex gap-3">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-medium text-slate-600 border border-slate-200 rounded-lg py-2">
              Sign in
            </Link>
            <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-semibold text-white bg-teal-600 rounded-lg py-2">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <Nav />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-50 rounded-full opacity-60 blur-3xl" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-violet-50 rounded-full opacity-60 blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                Now in open beta — free during launch
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Care that connects.{' '}
                <span className="text-teal-600">Outcomes that matter.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl">
                The participant-controlled coordination platform for the NDIS ecosystem.
                Connect your care team, share information securely, and keep everyone —
                from support coordinators to providers — in the loop.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Create free account <ArrowRight size={16} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-slate-600 text-base font-medium px-6 py-4 hover:text-teal-600 transition-colors"
                >
                  See how it works <ChevronDown size={16} />
                </a>
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-6 mt-10 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-teal-500" /> End-to-end encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-teal-500" /> 7-day referral links
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-teal-500" /> NDIS-native design
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof bar ─────────────────────────────────────────── */}
        <section className="bg-slate-900 py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-400 text-sm">
              {[
                'Participant-controlled data',
                'Secure referral links',
                'Structured provider updates',
                'Full consent management',
                'Built for NDIS',
              ].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Platform Features
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything your care team needs
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                From secure referrals to real-time updates — built specifically for the NDIS coordination workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc, color, accent }) => (
                <div
                  key={title}
                  className="group bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-white border-t border-slate-200 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                How It Works
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Four steps to better coordination
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Care Exchange fits into your existing workflow — no overhaul required.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Steps */}
              <div className="space-y-8">
                {steps.map(({ number, title, desc, detail }, i) => (
                  <div key={number} className="flex gap-5">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                        {number}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-0.5 h-12 bg-teal-100 ml-[23px] mt-2" />
                      )}
                    </div>
                    <div className="pb-8">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
                      <p className="text-slate-600 text-sm mb-2">{desc}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual — referral link card */}
              <div className="flex items-center">
                <div className="bg-slate-900 rounded-2xl p-8 w-full shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                      <Link2 size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Secure Referral Link</div>
                      <div className="text-slate-400 text-xs">Time-limited · Single-use</div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5 mb-5">
                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase tracking-wider">Participant Summary</div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Name</span>
                        <span className="text-white text-sm font-medium">Alex T.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">NDIS Plan</span>
                        <span className="text-white text-sm font-mono">Plan 2 · $48,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Primary Goals</span>
                        <span className="text-white text-sm">3 active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Providers</span>
                        <span className="text-white text-sm">4 in care team</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
                      Referral reason: Occupational therapy assessment + ongoing support
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Expires in <span className="text-amber-400 font-semibold">6 days</span>
                    </div>
                    <div className="flex items-center gap-2 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                      <CheckCircle2 size={13} /> Accept Referral
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who it's for ──────────────────────────────────────────────── */}
        <section id="who-its-for" className="py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Who It's For
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Built for the whole NDIS ecosystem
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Four roles, each with exactly the access they need — and nothing more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {roles.map(({ emoji, name, desc, cta, href, highlight, learnMoreHref }) => (
                <div
                  key={name}
                  className={`rounded-2xl p-7 border-2 transition-all ${
                    highlight
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        highlight ? 'bg-teal-100' : 'bg-slate-100'
                      }`}>
                        {emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{name}</h3>
                        {highlight && (
                          <span className="text-xs bg-teal-200 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                            Most popular
                          </span>
                        )}
                      </div>
                    </div>
                    {highlight && (
                      <div className="flex items-center gap-1 text-teal-600 text-xs font-semibold">
                        <Star size={12} fill="currentColor" /> Recommended
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{desc}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={href}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                        highlight
                          ? 'text-teal-700 hover:text-teal-900'
                          : 'text-slate-600 hover:text-teal-600'
                      }`}
                    >
                      {cta} <ArrowUpRight size={14} />
                    </Link>
                    <Link
                      to={learnMoreHref}
                      className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  FAQ
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                  Questions we hear often
                </h2>
                <p className="text-slate-500">
                  Can't find the answer you're looking for?{' '}
                  <a href="mailto:hello@careexchange.com.au" className="text-teal-600 hover:underline">
                    Reach out to us
                  </a>
                  .
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 px-6">
                {faqs.map(({ q, a }) => (
                  <FaqItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-teal-600">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to take control of your care?
            </h2>
            <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">
              Join the beta — free for participants, families, providers, and coordinators during launch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-teal-600 text-base font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
              >
                Create free account <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-teal-500 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-teal-400 transition-colors"
              >
                Sign in to existing account
              </Link>
            </div>
            <p className="text-teal-200 text-sm mt-8">
              No credit card required · Free during beta · Cancel anytime
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Care Exchange</div>
                <div className="text-slate-500 text-xs">Care that connects, Outcomes that matter.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-200 transition-colors">How it Works</a>
              <a href="#who-its-for" className="hover:text-slate-200 transition-colors">Who It's For</a>
              <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
              <a href="mailto:hello@careexchange.com.au" className="hover:text-slate-200 transition-colors">Contact</a>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© 2026 Care Exchange Pty Ltd. Built for the NDIS community.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <span className="flex items-center gap-1"><Lock size={10} /> Secure by design</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
