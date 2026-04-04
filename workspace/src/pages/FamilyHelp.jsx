import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, ChevronDown, Search, BookOpen,
  ArrowUpRight, Users, Eye, Bell, MessageSquare,
  Settings, LogIn, HeartHandshake, Lock, AlertCircle
} from 'lucide-react'

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="py-12 border-b border-slate-200 last:border-0">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="pl-14 space-y-6">{children}</div>
    </section>
  )
}

function Step({ num, title, desc, tip }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{num}</div>
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        {tip && (
          <div className="mt-2 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
            <span className="font-semibold shrink-0">Tip:</span>
            <span>{tip}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoBox({ children, color = 'rose' }) {
  const colors = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
  }
  return (
    <div className={`border text-sm px-4 py-3 rounded-lg ${colors[color]}`}>{children}</div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 text-slate-500 text-sm leading-relaxed">{a}</div>}
    </div>
  )
}

const tableOfContents = [
  { id: 'getting-started', label: 'Getting Started', icon: LogIn },
  { id: 'your-view', label: 'What You Can See', icon: Eye },
  { id: 'updates', label: 'Provider Updates', icon: HeartHandshake },
  { id: 'goals', label: 'Goal Progress', icon: HeartHandshake },
  { id: 'messages', label: 'Messaging the Care Team', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Access Control', icon: Lock },
  { id: 'faq', label: 'FAQ', icon: Search },
]

export default function FamilyHelp() {
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
            </Link>
            <span className="text-slate-300">›</span>
            <span className="text-sm text-slate-500">Help Centre</span>
            <span className="text-slate-300">›</span>
            <span className="text-sm text-rose-500 font-semibold">Family Guide</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-rose-500 transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <BookOpen size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">On this page</span>
                </div>
                <nav className="space-y-1">
                  {tableOfContents.map(({ id, label, icon: Icon }) => (
                    <a key={id} href={`#${id}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mt-4 bg-rose-50 rounded-2xl border border-rose-200 p-4">
                <div className="text-rose-700 font-semibold text-sm mb-2">Need more help?</div>
                <p className="text-rose-600 text-xs leading-relaxed mb-3">
                  Contact our support team. We're here to help families and carers get the most out of Care Exchange.
                </p>
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900">
                  Contact support <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">

            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Family & Carer Guide
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Help Centre: Family & Carer Guide</h1>
              <p className="text-slate-500 leading-relaxed">
                How to use Care Exchange as a family member or carer — staying informed about your family member's care, messaging providers, and tracking goal progress.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-200 px-8">

              {/* Getting Started */}
              <Section id="getting-started" title="Getting Started" icon={LogIn}>
                <Step num={1} title="Get invited by your family member"
                  desc="Your family member (the participant) invites you to Care Exchange from their account — Settings → Family Access → Invite. You'll receive an email with a secure invitation link."
                  tip="If you haven't received an invitation email, check your spam folder. The email comes from noreply@careexchange.com.au."
                />
                <Step num={2} title="Create your account"
                  desc="Click the invitation link. You'll be asked to create a password for your account. After that, you're connected to your family member's care record automatically."
                />
                <Step num={3} title="Understand your access level"
                  desc="What you can see depends entirely on what your family member has consented to share. When you first log in, you'll see exactly what access you have. Your family member can change this at any time."
                />
                <Step num={4} title="Explore your dashboard"
                  desc="After logging in, your dashboard shows your family member's name, their current providers, recent updates, and goal progress at a glance."
                />
                <InfoBox color="rose">
                  <strong>Your access is always view-only.</strong> You can see everything your family member has consented to share, but you cannot submit updates, modify goals, or change any settings. Only the participant can do that.
                </InfoBox>
              </Section>

              {/* What You Can See */}
              <Section id="your-view" title="What You Can See" icon={Eye}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your view into a participant's care record is set by the participant — they decide exactly what you can and cannot see.
                </p>
                <Step num={1} title="Care record visibility"
                  desc="If consented, you can see the participant's full care record — all provider updates, goal progress, and care team messages. The participant controls this completely."
                />
                <Step num={2} title="What is typically shared"
                  desc="Most participants share: care update summaries, goal progress, provider names and service types, appointment or session notes. What you see is always up to the participant."
                />
                <Step num={3} title="What is typically NOT shared"
                  desc="Participants commonly keep private: financial information, detailed clinical notes, NDIS plan budget information, and personal information they don't want to disclose."
                />
                <Step num={4} title="Your access can change"
                  desc="The participant can upgrade or downgrade your access at any time. If they reduce what you can see, the change takes effect immediately the next time you log in."
                />
              </Section>

              {/* Provider Updates */}
              <Section id="updates" title="Provider Updates" icon={HeartHandshake}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  When a provider submits an update to the participant's care record, you'll see it in real time — without needing the provider to contact you separately.
                </p>
                <Step num={1} title="Viewing updates"
                  desc="Click 'Care Record' in the sidebar. You'll see a chronological feed of all updates from all providers — sorted by date, newest first."
                />
                <Step num={2} title="Understanding update types"
                  desc="Updates are categorized: Progress Notes (general session updates), Incident Reports (something that went wrong), Medication Changes, and Goal Updates. Each shows who submitted it and when."
                />
                <Step num={3} title="Filter by provider or category"
                  desc="Use the filter bar at the top of the care record to show only updates from a specific provider, or only a specific category (e.g., only Goal Updates)."
                />
                <Step num={4} title="Ask questions about an update"
                  desc="If something in an update raises a question, you can message the provider directly from the update — click 'Ask a question' on any update to open a message thread with that provider."
                />
                <InfoBox color="teal">
                  <strong>You're informed automatically.</strong> You don't need to call providers to find out what happened in a session — the update is there when it happens.
                </InfoBox>
              </Section>

              {/* Goal Progress */}
              <Section id="goals" title="Goal Progress" icon={HeartHandshake}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Track your family member's NDIS plan goals — see which ones are on track, which providers are contributing, and how close they are to completion.
                </p>
                <Step num={1} title="View active goals"
                  desc="Click 'Goals' in the sidebar. You'll see every active goal from the participant's NDIS plan, each with a progress indicator."
                />
                <Step num={2} title="See provider contributions"
                  desc="Click on any goal to see which providers are tagged as contributing to it, and read the history of updates related to that goal."
                />
                <Step num={3} title="Track goal milestones"
                  desc="When a goal milestone is reached — e.g., a goal is marked as achieved — you'll receive a notification. Celebrating these milestones is part of why family access is valuable."
                />
                <Step num={4} title="Goal history"
                  desc="Completed goals remain visible in the 'History' tab so you can see what has been achieved over time."
                />
              </Section>

              {/* Messaging */}
              <Section id="messages" title="Messaging the Care Team" icon={MessageSquare}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Ask questions, share observations, or pass on information to providers and coordinators — all in one place, without needing phone calls or emails.
                </p>
                <Step num={1} title="Message a provider"
                  desc="Open a participant's record and go to 'Messages'. Select the provider you want to contact, type your message, and send. The provider receives a notification."
                />
                <Step num={2} title="Message the support coordinator"
                  desc="If the participant has a support coordinator connected, you can message them directly from the Messages section — select the coordinator from the recipient dropdown."
                />
                <Step num={3} title="Reply in existing threads"
                  desc="Each conversation is threaded. Replies stay in context so the full history is always visible. Use threads to keep different topics organised."
                />
                <Step num={4} title="When to use messaging"
                  desc="Good uses: sharing observations about how your family member is responding to a support, asking clarifying questions about an update, coordinating scheduling. For urgent clinical issues, always call the provider directly."
                />
                <InfoBox color="rose">
                  <strong>Scope:</strong> You can message providers and coordinators, but not other family members or people outside the care team. Messages are only visible to the recipient and the participant.
                </InfoBox>
              </Section>

              {/* Notifications */}
              <Section id="notifications" title="Notifications" icon={Bell}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Care Exchange notifies you when important things happen — so you don't have to keep checking manually.
                </p>
                <Step num={1} title="What you're notified about"
                  desc="You can receive notifications when: a provider submits an update, a goal milestone is reached, your family member adjusts your access level, or you receive a message reply."
                />
                <Step num={2} title="Set your notification preferences"
                  desc="Go to Settings → Notifications. Toggle email and in-app notifications for each event type independently."
                />
                <Step num={3} title="In-app notifications"
                  desc="The bell icon at the top of your dashboard shows all your unread notifications. Click any notification to go directly to the relevant record or update."
                />
                <Step num={4} title="Notification email"
                  desc="If email notifications are enabled, you'll receive an email for each event type you've subscribed to. You can unsubscribe from individual event types without turning off all email notifications."
                />
              </Section>

              {/* Privacy */}
              <Section id="privacy" title="Privacy & Access Control" icon={Lock}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Privacy is a core principle of Care Exchange. The participant controls your access completely — not you, and not us.
                </p>
                <Step num={1} title="Your access is controlled by your family member"
                  desc="The participant decides what you can see. You cannot request more access — only the participant can grant it. If you feel you need more visibility, discuss it with your family member directly."
                />
                <Step num={2} title="The participant can remove your access"
                  desc="The participant can revoke your access at any time from their Settings → Family Access page. If access is revoked, you'll receive an email notification and your login will no longer show their care record."
                />
                <Step num={3} title="You cannot share your access"
                  desc="Your login is personal to you. You cannot share your login credentials with other family members. Each person who needs access should receive their own invitation from the participant."
                />
                <Step num={4} title="Your data is protected"
                  desc="Care Exchange uses bank-grade encryption for all data. We do not sell or share your personal information. Your family member's data is stored separately from your account data."
                />
                <InfoBox color="amber">
                  <strong>Disputes:</strong> If there is a dispute about your access — for example, the participant has limited your access and you believe it is harmful — please contact our support team. We can mediate but ultimately the participant's wishes take precedence.
                </InfoBox>
              </Section>

              {/* FAQ */}
              <Section id="faq" title="Frequently Asked Questions" icon={Search}>
                <div className="space-y-0">
                  {[
                    { q: 'What if I want more access than my family member has given me?', a: 'Only the participant can grant more access. Discuss it with your family member — explain why you feel you need more visibility to support them effectively.' },
                    { q: 'Can I use Care Exchange without my family member knowing?', a: 'No — your family member controls your access completely. They can see when you log in and what you view. There is no anonymous or hidden access.' },
                    { q: 'Can I make decisions about my family member\'s care?', a: 'No — your access is view-only. Clinical and support decisions are made by the participant and their providers. You can observe, ask questions, and advocate, but not direct care.' },
                    { q: 'What happens if my family member loses capacity?', a: 'Care Exchange does not currently support formal substitute decision-making. If your family member loses capacity, please contact our support team to discuss options.' },
                    { q: 'Can I add other family members to the care team?', a: 'No — only the participant can invite people to their care team. If you think another family member should be involved, speak with your family member about them sending an invitation.' },
                    { q: 'Is there a cost for family accounts?', a: 'No — family accounts are always free. The participant invites you at no cost.' },
                  ].map(faq => <FaqItem key={faq.q} {...faq} />)}
                </div>
              </Section>

            </div>
          </main>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Care Exchange</span>
          </div>
          <p className="text-xs text-slate-400">Family & Carer Help Centre. Last updated April 2026.</p>
        </div>
      </footer>
    </div>
  )
}
