import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowLeft, ChevronDown, ArrowRight, Search, BookOpen,
  CheckCircle2, ArrowUpRight, Plus, Users, FileText, Bell,
  HeartHandshake, Settings, Link2, Eye, LogIn, Home, Lock
} from 'lucide-react'

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="py-12 border-b border-slate-200 last:border-0">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
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
      <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{num}</div>
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

function InfoBox({ children, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
  { id: 'your-care-record', label: 'Your Care Record', icon: FileText },
  { id: 'consent', label: 'Managing Consent', icon: Lock },
  { id: 'referrals', label: 'Sending Referrals', icon: Link2 },
  { id: 'goals', label: 'Tracking Goals', icon: HeartHandshake },
  { id: 'family-access', label: 'Family Access', icon: Users },
  { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
  { id: 'faq', label: 'FAQ', icon: Search },
]

export default function ParticipantHelp() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────── */}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* ── Sidebar ────────────────────────────────────────── */}
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
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mt-4 bg-teal-50 rounded-2xl border border-teal-200 p-4">
                <div className="text-teal-700 font-semibold text-sm mb-2">Need more help?</div>
                <p className="text-teal-600 text-xs leading-relaxed mb-3">
                  Contact our support team and we'll get back to you within 1 business day.
                </p>
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900">
                  Contact support <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ───────────────────────────────────── */}
          <main className="lg:col-span-3">

            {/* Page header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Participant Guide
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">How to Guide: Participant</h1>
              <p className="text-slate-500 leading-relaxed">
                Everything you need to know about using Care Exchange as a participant. From setting up your account to managing consent and sending referrals.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-200 px-8">

              {/* ── Getting Started ───────────────────────────────── */}
              <Section id="getting-started" title="Getting Started" icon={LogIn}>
                <Step num={1} title="Create your account"
                  desc="Go to careexchange.com.au and click 'Create your account'. Enter your name, email, and a secure password. You'll receive a verification email — click the link inside to activate your account."
                />
                <Step num={2} title="Set up your profile"
                  desc="Once logged in, complete your profile — add your NDIS plan details, support categories, and contact information. This helps coordinators and providers understand your care needs."
                  tip="Your profile information is only shared with providers you've sent a referral to, and with your consent."
                />
                <Step num={3} title="Explore your dashboard"
                  desc="Your participant dashboard shows your care record at a glance — active providers, recent updates, goal progress, and any pending referrals. You can always return here by clicking 'Dashboard' after logging in."
                />
                <InfoBox color="teal">
                  <strong>Important:</strong> As a participant, you are always in control. Nothing is shared with your care team unless you explicitly grant consent.
                </InfoBox>
              </Section>

              {/* ── Your Care Record ──────────────────────────────── */}
              <Section id="your-care-record" title="Your Care Record" icon={FileText}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your care record is the central place where all information about your NDIS supports is stored. Only you — and people you invite — can see it.
                </p>
                <Step num={1} title="View your care record"
                  desc="Click 'Care Record' in the left sidebar after logging in. You'll see a timeline of updates from your providers, grouped by date and category."
                />
                <Step num={2} title="Understand update categories"
                  desc="Provider updates are filed into categories: Progress Notes (general session updates), Incident Reports (something that went wrong), Medication Changes, and Goal Updates. Each update shows who submitted it and when."
                  tip="You can filter your care record by category using the tabs at the top of the record view."
                />
                <Step num={3} title="Search your care record"
                  desc="Use the search bar at the top of your care record to find specific updates, providers, or topics. Results are instant and cover all historical entries."
                />
                <Step num={4} title="Export your care record"
                  desc="Click 'Export' to download a summary of your care record as a document — useful for NDIS plan reviews, your support coordinator, or your own reference."
                />
              </Section>

              {/* ── Consent ───────────────────────────────────────── */}
              <Section id="consent" title="Managing Consent" icon={Lock}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Consent is how you control who sees what. You grant consent separately for each provider and family member — and you can change or revoke it at any time.
                </p>
                <Step num={1} title="Understand your consent options"
                  desc="When you invite a provider or family member, you choose what they can see. Options typically include: care record updates, goal progress, personal details, and financial/plan information. You're in control of each category."
                  tip="You don't have to share everything. Choose exactly what each person needs to support you effectively."
                />
                <Step num={2} title="Grant consent to a provider"
                  desc="When you send a referral to a provider, you'll be asked to review and grant consent. You'll see exactly what the provider will be able to see once they accept your referral. Review each category and confirm."
                />
                <Step num={3} title="Change consent at any time"
                  desc="Go to Settings → Consent. Find the person whose access you want to adjust. Toggle categories on or off. Changes take effect immediately — the person will see updated access the next time they log in."
                />
                <Step num={4} title="Revoke access completely"
                  desc="In Settings → Consent, click 'Revoke Access' next to any provider or family member. They will immediately lose access to your care record. You can re-invite them at any time."
                />
                <InfoBox color="amber">
                  <strong>Note:</strong> Revoking consent does not notify the person automatically. If you want them to know, send them a message first.
                </InfoBox>
              </Section>

              {/* ── Referrals ──────────────────────────────────────── */}
              <Section id="referrals" title="Sending Referrals" icon={Link2}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  A referral is how you connect with a new service provider. You send them a secure link to your care record — they review it and decide whether to accept.
                </p>
                <Step num={1} title="Start a new referral"
                  desc="Click 'Send Referral' from your dashboard or the Referrals section. Search for the provider by name or browse by NDIS support category (e.g., Physiotherapy, Psychology, Occupational Therapy)."
                />
                <Step num={2} title="Review your consent scope"
                  desc="Before sending, you'll see what information the provider will receive. Adjust your consent settings here if needed — you can choose to share more or less than your default settings."
                />
                <Step num={3} title="Add a personal note (optional)"
                  desc="You can add a brief note to the referral explaining your goals, what you're hoping to achieve, or anything specific you want the provider to know before they accept."
                />
                <Step num={4} title="Send the referral"
                  desc="Click 'Send'. The provider receives an email notification with a secure link to your care summary. They review it and accept or decline within their dashboard."
                  tip="If a provider declines, you'll be notified and can send a referral to a different provider. Declined referrals are not shared with anyone."
                />
                <Step num={5} title="Track referral status"
                  desc="Go to Referrals → Sent. You'll see each referral's status: Pending (waiting for provider response), Accepted (provider is now in your care team), or Declined. If pending for more than a few days, you can follow up with the provider directly."
                />
              </Section>

              {/* ── Goals ─────────────────────────────────────────── */}
              <Section id="goals" title="Tracking Goals" icon={HeartHandshake}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your NDIS plan goals are tracked in Care Exchange. Providers can log progress against goals, and you can see how each goal is tracking over time.
                </p>
                <Step num={1} title="View your goals"
                  desc="Click 'Goals' in your dashboard. You'll see all your active NDIS plan goals, each with a progress indicator showing how much has been achieved."
                />
                <Step num={2} title="See which providers are contributing"
                  desc="Click on any goal to see which providers are contributing to it, and view recent progress notes or updates that relate to this goal."
                />
                <Step num={3} title="Add or update a goal"
                  desc="Go to Goals → Add Goal. Enter the goal title, description, target date, and NDIS support category. You can update goals at any time."
                />
                <Step num={4} title="Goal milestones"
                  desc="When a milestone is reached (e.g., a goal is achieved), you'll receive a notification. Achieved goals are marked as complete but remain visible in your history."
                />
              </Section>

              {/* ── Family Access ─────────────────────────────────── */}
              <Section id="family-access" title="Family & Carer Access" icon={Users}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You can invite family members or trusted carers to view your care record. You control exactly what they can see — and you can revoke access at any time.
                </p>
                <Step num={1} title="Invite a family member"
                  desc="Go to Settings → Family Access → Invite. Enter their name and email address. Choose what access to grant them — you can let them see care updates, goal progress, or limit to summary information only."
                />
                <Step num={2} title="They create their account"
                  desc="Your family member will receive an email with a secure invitation link. They click it, create a password, and are automatically connected to your care record."
                />
                <Step num={3} title="They see your updates in real time"
                  desc="Once connected, your family member can log in and see your care updates, goal progress, and messages — exactly what you've consented to share. They cannot modify anything."
                />
                <Step num={4} title="Revoke or adjust access"
                  desc="Go to Settings → Family Access. Find the person and adjust their access categories or click 'Remove Access' to disconnect them entirely."
                />
                <InfoBox color="teal">
                  <strong>Your control:</strong> Family members have view-only access. They cannot make clinical decisions, submit updates, or change your goals — only you and your providers can do that.
                </InfoBox>
              </Section>

              {/* ── Alerts ────────────────────────────────────────── */}
              <Section id="alerts" title="Alerts & Notifications" icon={Bell}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Care Exchange can notify you when important things happen in your care record — so you're always informed without having to check manually.
                </p>
                <Step num={1} title="Set up notification preferences"
                  desc="Go to Settings → Notifications. Choose what you want to be notified about: new provider updates, goal progress, referral responses, consent changes, or family access."
                />
                <Step num={2} title="Email vs. in-app notifications"
                  desc="Toggle email notifications on or off for each event type. In-app notifications appear in the bell icon at the top of your dashboard and are always available regardless of email settings."
                />
                <Step num={3} title="When you're notified"
                  desc="You'll receive a notification when: a provider submits an update, a referral is accepted or declined, a goal milestone is reached, a family member joins your care team, or your consent is changed."
                />
                <InfoBox color="violet">
                  <strong>Quiet hours:</strong> If you need to silence notifications for a period, use the Do Not Disturb toggle in Settings → Notifications.
                </InfoBox>
              </Section>

              {/* ── FAQ ────────────────────────────────────────────── */}
              <Section id="faq" title="Frequently Asked Questions" icon={Search}>
                <div className="space-y-0">
                  {[
                    { q: 'Who can see my care record?', a: 'Only you, people you invite (with your consent), and your approved providers. Care Exchange staff cannot view your data. Your data is encrypted at rest and in transit.' },
                    { q: 'Can I use Care Exchange without an NDIS plan?', a: 'Yes — Care Exchange is open to anyone receiving disability support services, not just NDIS participants. Your coordinator or provider can help you get set up.' },
                    { q: 'What happens if a provider declines my referral?', a: 'You\'ll receive a notification. The provider\'s reason (if any) will be shown. You can then send a referral to a different provider.' },
                    { q: 'Can I have more than one support coordinator?', a: 'Yes — you can invite multiple coordinators. Each one will have the same view-only access you grant them. You control each coordinator\'s access independently.' },
                    { q: 'How do I delete my account?', a: 'Go to Settings → Account → Delete Account. This permanently removes your account and all associated data. Provider records retained by providers are governed by their own retention policies.' },
                    { q: 'Is my data secure?', a: 'Yes. Care Exchange uses bank-grade encryption for all data at rest and in transit. We do not sell or share your personal information with third parties. See our Privacy Policy for full details.' },
                  ].map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
                </div>
              </Section>

            </div>
          </main>
        </div>
      </div>

    </div>
  )
}
