import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  ShieldCheck, Users, FileText, Link2, Bell, Globe, HeartHandshake,
  Database, Layers, Lock, Zap, CheckCircle2, ArrowRight, ChevronDown,
  ChevronRight, Menu, X
} from 'lucide-react'

const CONTENT_SECTIONS = [
  { id: 'overview',   label: 'Overview',     color: 'bg-teal-600' },
  { id: 'personas',   label: 'Personas',     color: 'bg-violet-600' },
  { id: 'use-cases',  label: 'Use Cases',    color: 'bg-blue-600' },
  { id: 'go-to-market', label: 'Go-to-Market', color: 'bg-amber-600' },
  { id: 'team',       label: 'Team',         color: 'bg-rose-600' },
  { id: 'diagrams',  label: 'Diagrams',     color: 'bg-emerald-600' },
]

// ── Overview content (inline, always fast) ─────────────────────────────────────

const features = [
  {
    icon: Link2,
    title: 'Secure Referral Links',
    desc: 'Time-limited, single-use referral links with cryptographic tokens. Providers receive secure invitations via email or SMS.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: FileText,
    title: 'Structured Provider Updates',
    desc: 'Short, structured updates instead of lengthy reports. Categorized notes: progress, incidents, medications, goals.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: HeartHandshake,
    title: 'Consent-Driven Sharing',
    desc: 'Participants control exactly which providers see which data. Per-category, per-provider consent with expiry.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Users,
    title: 'Central Care Record',
    desc: 'A single source of truth for goals, care plans, progress notes, and documents — controlled by the participant.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Email + in-app alerts for referrals, updates, consent requests, goal deadlines, and new messages.',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const roles = [
  { name: 'Participant', color: 'bg-teal-600', desc: 'Controls their care record, grants consent, sends referrals, tracks goals.' },
  { name: 'Family',       color: 'bg-violet-600', desc: 'Delegated read access to a participant\'s care record and updates.' },
  { name: 'Provider',    color: 'bg-blue-600', desc: 'Receives referrals, submits structured updates, communicates with care team.' },
  { name: 'Coordinator', color: 'bg-amber-600', desc: 'Manages participant caseload, coordinates referrals, monitors progress.' },
]

const techStack = [
  { label: 'React 18',        category: 'Frontend' },
  { label: 'Vite',            category: 'Frontend' },
  { label: 'Tailwind CSS',   category: 'Frontend' },
  { label: 'React Router v6',category: 'Frontend' },
  { label: 'Flask',          category: 'Backend' },
  { label: 'SQLAlchemy',     category: 'Backend' },
  { label: 'PostgreSQL',     category: 'Database' },
  { label: 'JWT Auth',       category: 'Backend' },
  { label: 'Docker',         category: 'DevOps' },
  { label: 'Gunicorn',       category: 'DevOps' },
  { label: 'Nginx',          category: 'DevOps' },
  { label: 'Flask-Migrate',  category: 'Backend' },
]

const referralFlow = [
  { step: '1', title: 'Create', desc: 'Participant selects provider from directory' },
  { step: '2', title: 'Send',   desc: 'Secure link generated and delivered via email/SMS' },
  { step: '3', title: 'Respond',desc: 'Provider reviews and accepts or declines' },
  { step: '4', title: 'Active', desc: 'Care relationship established, updates flow in' },
]

const statusColors = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-50 text-blue-600',
  viewed: 'bg-amber-50 text-amber-600',
  accepted: 'bg-emerald-50 text-emerald-600',
  declined: 'bg-red-50 text-red-600',
  active: 'bg-teal-50 text-teal-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-slate-100 text-slate-600',
}

// ── Markdown renderer component ───────────────────────────────────────────────

function MarkdownContent({ content }) {
  return (
    <div className="prose prose-slate max-w-none
      prose-headings:font-bold prose-headings:text-slate-900
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:text-slate-600 prose-p:leading-relaxed
      prose-li:text-slate-600
      prose-strong:text-slate-900 prose-strong:font-semibold
      prose-code:text-rose-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-slate-900 prose-pre:rounded-xl prose-pre:overflow-x-auto
      prose-pre:text-slate-300 prose-pre:text-sm
      prose-table:text-sm prose-th:bg-slate-100 prose-th:font-semibold
      prose-tr:border-slate-200 prose-td:px-3 prose-td:py-2
      prose-a:text-teal-600 prose-a:underline
      [&>pre]:bg-slate-900 [&>pre]:rounded-xl [&>pre]:p-5 [&>pre]:text-sm [&>pre]:text-slate-300 [&>pre]:overflow-x-auto
    ">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      {[100, 80, 60, 90, 70, 85, 100, 55].map((w, i) => (
        <div key={i} className={`h-4 bg-slate-200 rounded w-[${w}%]`} style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [content, setContent]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  // Load content from API when section changes
  useEffect(() => {
    if (activeSection === 'overview') {
      setContent('')
      return
    }

    setLoading(true)
    setError(null)
    fetch(`/api/v1/content/${activeSection}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => setContent(d.content))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeSection])

  const isApiSection = activeSection !== 'overview'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Sticky top nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">Care Exchange</span>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">v0.1.0</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {CONTENT_SECTIONS.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === id
                    ? `${color} text-white shadow-sm`
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Live app link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Live App <ArrowRight size={14} />
          </a>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1">
            {CONTENT_SECTIONS.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setMobileMenuOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? `${color} text-white`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium mt-2"
            >
              Live App <ArrowRight size={14} />
            </a>
          </div>
        )}
      </header>

      {/* ── Page body ──────────────────────────────────────────────────── */}
      <main className="flex-1">

        {/* OVERVIEW ──────────────────────────────────────────────────── */}
        {!isApiSection && (
          <>
            {/* Hero */}
            <section className="bg-white border-b border-slate-200">
              <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                    <Globe size={12} />
                    Participant-Controlled NDIS Coordination Platform
                  </div>
                  <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-4">
                    Care that connects.<br />
                    <span className="text-teal-600">Outcomes that matter.</span>
                  </h1>
                  <p className="text-xl text-slate-500 leading-relaxed mb-8">
                    A shared digital infrastructure for the NDIS ecosystem — connecting people with disabilities, families, support coordinators, and providers through secure referrals, structured updates, and consent-driven information sharing.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                      View Live App <ArrowRight size={16} />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                    >
                      View Source
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats bar */}
            <section className="bg-teal-600">
              <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-4 gap-8">
                  {[
                    { label: 'User Roles',      value: '4' },
                    { label: 'API Endpoints',   value: '15+' },
                    { label: 'Data Models',     value: '8' },
                    { label: 'Tech Stack Items',value: '12' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className="text-3xl font-bold text-white">{value}</div>
                      <div className="text-teal-200 text-sm mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="py-20">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Platform Features</h2>
                  <p className="text-slate-500 text-lg">Everything a modern NDIS coordination platform needs</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                        <Icon size={22} />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Referral system */}
            <section className="py-20 bg-white border-t border-slate-200">
              <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Secure Referral System</h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                      Time-limited, cryptographically secure referral links. Every referral flows through a defined status lifecycle with full audit trail.
                    </p>
                    <div className="space-y-4">
                      {referralFlow.map(({ step, title, desc }) => (
                        <div key={step} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                            {step}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{title}</div>
                            <div className="text-slate-500 text-sm">{desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-6 text-left">
                    <div className="text-xs text-slate-400 font-mono mb-4">REFERRAL STATUS LIFECYCLE</div>
                    <div className="space-y-3">
                      {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-3">
                          <div className={`w-24 text-xs font-mono px-2 py-1 rounded ${color}`}>
                            {status.replace('_', ' ')}
                          </div>
                          <ArrowRight size={12} className="text-slate-600" />
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Roles */}
            <section className="py-20">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Four Roles, One Platform</h2>
                  <p className="text-slate-500 text-lg">Every user has a clear purpose and appropriate access</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roles.map(({ name, color, desc }) => (
                    <div key={name} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div className={`${color} px-5 py-4`}>
                        <div className="font-semibold text-white">{name}</div>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tech stack */}
            <section className="py-20 bg-white border-t border-slate-200">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Technology Stack</h2>
                  <p className="text-slate-500 text-lg">Built with modern, production-ready tools</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {techStack.map(({ label, category }) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="font-medium text-slate-800 text-sm">{label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        category === 'Frontend' ? 'bg-blue-50 text-blue-600' :
                        category === 'Backend' ? 'bg-violet-50 text-violet-600' :
                        category === 'Database' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Architecture diagram */}
            <section className="py-20">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">System Architecture</h2>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        title: 'Frontend', icon: Globe, color: 'blue',
                        items: ['Login / Register', 'Dashboard', 'Care Record', 'Referrals', 'Messages'],
                        bg: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600'
                      },
                      {
                        title: 'API Layer', icon: Layers, color: 'violet',
                        items: ['/auth/*', '/participants/*', '/referrals/*', '/updates/*', '/messages/*', '/content/*'],
                        bg: 'bg-violet-50 border-violet-200', textColor: 'text-violet-600'
                      },
                      {
                        title: 'Data Layer', icon: Database, color: 'emerald',
                        items: ['Users', 'Participants', 'Providers', 'Referrals', 'Updates', 'Messages', 'Consents'],
                        bg: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-600'
                      },
                    ].map(({ title, icon: Icon, color, items, bg, textColor }) => (
                      <div key={title} className="text-center">
                        <div className={`${bg} border-2 rounded-2xl p-5 mb-3`}>
                          <Icon size={26} className={`${textColor} mx-auto mb-2`} />
                          <div className="font-semibold text-slate-900 text-sm">{title}</div>
                        </div>
                        <div className="space-y-2">
                          {items.map(label => (
                            <div key={label} className={`text-xs ${color === 'violet' ? 'font-mono text-slate-500 bg-slate-50' : 'text-slate-500 bg-slate-50'} rounded-lg px-3 py-1.5`}>
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Lock size={12} /> JWT Auth</span>
                    <span className="flex items-center gap-1.5"><Zap size={12} /> Gunicorn WSGI</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Docker Containerized</span>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-teal-600">
              <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to explore?</h2>
                <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
                  The app is running locally. Jump in and create an account as a Participant, Provider, or Coordinator.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold hover:bg-teal-50 transition-colors"
                  >
                    Open App <ArrowRight size={16} />
                  </a>
                  <a
                    href="http://localhost:5000/api/v1/health"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-400 transition-colors"
                  >
                    API Health Check
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

        {/* API-DRIVEN CONTENT SECTIONS ─────────────────────────────────── */}
        {isApiSection && (
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {/* Section header */}
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <button onClick={() => setActiveSection('overview')} className="hover:text-teal-600 transition-colors">
                  Overview
                </button>
                <ChevronRight size={14} />
                <span className="text-slate-700 font-medium">
                  {CONTENT_SECTIONS.find(s => s.id === activeSection)?.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${CONTENT_SECTIONS.find(s => s.id === activeSection)?.color}`} />
                <h1 className="text-3xl font-bold text-slate-900 capitalize">
                  {CONTENT_SECTIONS.find(s => s.id === activeSection)?.label}
                </h1>
              </div>
              <p className="text-slate-400 text-sm">
                Loaded from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">/api/v1/content/{activeSection}</code>
              </p>
            </div>
          </div>
        )}

        {isApiSection && (
          <div className="max-w-6xl mx-auto px-6 py-10">
            {loading && <ContentSkeleton />}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <strong>Failed to load content:</strong> {error}
                <div className="text-sm mt-1">Make sure the backend is running at localhost:5000</div>
              </div>
            )}
            {!loading && !error && content && <MarkdownContent content={content} />}
            {!loading && !error && !content && (
              <div className="text-center py-20 text-slate-400">
                No content available for this section.
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Care Exchange</span>
          </div>
          <div className="text-slate-500 text-sm">
            Built with Flask + React + Docker
          </div>
        </div>
      </footer>
    </div>
  )
}
