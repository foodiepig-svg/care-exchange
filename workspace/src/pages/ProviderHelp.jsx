import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, ChevronDown, ArrowRight, Search, BookOpen,
  CheckCircle2, ArrowUpRight, Inbox, FileText, UserCheck,
  BarChart3, MessageSquare, Bell, Settings, Link2, Users,
  LogIn, Plus, Download, Tag
} from 'lucide-react'

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="py-12 border-b border-slate-200 last:border-0">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
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
      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{num}</div>
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

function InfoBox({ children, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
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
  { id: 'your-dashboard', label: 'Provider Dashboard', icon: BarChart3 },
  { id: 'referrals', label: 'Managing Referrals', icon: Inbox },
  { id: 'updates', label: 'Submitting Updates', icon: FileText },
  { id: 'participants', label: 'Participant Records', icon: Users },
  { id: 'messages', label: 'Care Team Messaging', icon: MessageSquare },
  { id: 'ndis-categories', label: 'NDIS Categories', icon: Tag },
  { id: 'plan-reviews', label: 'Plan Review Exports', icon: Download },
  { id: 'settings', label: 'Account Settings', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: Search },
]

export default function ProviderHelp() {
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Care Exchange</span>
            </Link>
            <span className="text-slate-300">›</span>
            <span className="text-sm text-slate-500">Help Centre</span>
            <span className="text-slate-300">›</span>
            <span className="text-sm text-violet-600 font-semibold">Provider Guide</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">
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
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mt-4 bg-violet-50 rounded-2xl border border-violet-200 p-4">
                <div className="text-violet-700 font-semibold text-sm mb-2">Need more help?</div>
                <p className="text-violet-600 text-xs leading-relaxed mb-3">
                  Contact our provider support team. We typically respond within 1 business day.
                </p>
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900">
                  Contact support <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">

            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Provider Guide
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">Help Centre: Service Provider Guide</h1>
              <p className="text-slate-500 leading-relaxed">
                How to use Care Exchange as an NDIS service provider — from accepting referrals to submitting structured updates and coordinating with care teams.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-200 px-8">

              {/* Getting Started */}
              <Section id="getting-started" title="Getting Started" icon={LogIn}>
                <Step num={1} title="Register your organisation"
                  desc="Go to careexchange.com.au/provider and click 'Register your organisation'. Fill in your organisation details: name, ABN, service categories, and contact information. Choose which NDIS support categories your organisation delivers."
                  tip="Make sure your ABN matches your registered business name — providers are verified against ABN records."
                />
                <Step num={2} title="Add your team members"
                  desc="In Settings → Team, add staff members who will use Care Exchange. Each staff member gets their own login. You can assign roles: Admin (full access) or Provider (can manage referrals and updates)."
                />
                <Step num={3} title="Set your notification preferences"
                  desc="In Settings → Notifications, choose how you want to be notified about new referrals, messages, and consent changes — email, in-app, or both."
                />
                <Step num={4} title="You're ready to receive referrals"
                  desc="Once registered, participants can find your organisation and send you referrals. You'll be notified immediately when a referral arrives in your inbox."
                />
              </Section>

              {/* Provider Dashboard */}
              <Section id="your-dashboard" title="Provider Dashboard" icon={BarChart3}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your dashboard gives you a real-time overview of all your participants and referrals.
                </p>
                <Step num={1} title="Stat cards at a glance"
                  desc="The top of your dashboard shows key stats: Active Participants (how many participants you're currently delivering services to), Pending Referrals (awaiting your response), Updates Sent (this month), and Goals Met (milestones achieved)."
                />
                <Step num={2} title="Received Referrals list"
                  desc="Below the stats, see all incoming referrals sorted by date. Each shows the participant's name, service type, when the referral was sent, and current status."
                />
                <Step num={3} title="Participant roster"
                  desc="Click 'Participants' in the left sidebar to see every participant you've accepted. Sort by name, last update date, or goal status."
                />
                <Step num={4} title="Filter and search"
                  desc="Use the search bar to find specific participants by name. Use the status filter to show only Active, Paused, or Completed participants."
                />
              </Section>

              {/* Referrals */}
              <Section id="referrals" title="Managing Referrals" icon={Inbox}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  When a participant sends you a referral, you'll see it in your inbox. You can review their care summary and consent scope before deciding whether to accept.
                </p>
                <Step num={1} title="Review the referral"
                  desc="Open the referral from your inbox. You'll see the participant's name, care summary (goals, current providers, relevant history), and the consent categories they've approved for you."
                  tip="This is your chance to decide if the referral is appropriate for your services before accepting. You can decline referrals that don't fit your scope."
                />
                <Step num={2} title="Accept or decline"
                  desc="Click 'Accept' to add the participant to your roster. Click 'Decline' with an optional reason. You'll be asked to confirm before the decision is recorded. The participant is notified automatically."
                />
                <Step num={3} title="What happens when you accept"
                  desc="The participant is added to your active roster. Their care record becomes accessible through your dashboard, with the update templates ready to use."
                />
                <Step num={4} title="Track referral history"
                  desc="Go to Referrals → History to see all past referrals — accepted, declined, and pending. Each entry shows the participant name, date, and your response."
                />
                <InfoBox color="violet">
                  <strong>Consent is pre-granted:</strong> When you accept a referral, the participant has already consented to your involvement. You don't need to chase a separate consent form.
                </InfoBox>
              </Section>

              {/* Submitting Updates */}
              <Section id="updates" title="Submitting Updates" icon={FileText}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Updates are structured notes you submit to a participant's care record. They keep the participant, their coordinator, and their family informed about what happened in your sessions.
                </p>
                <Step num={1} title="Open a participant's record"
                  desc="From your dashboard, click on the participant's name. Then click 'Submit Update' in the top right of their record."
                />
                <Step num={2} title="Choose the update type"
                  desc="Select the type of update: Progress Note (general session update), Incident Report (something that went wrong), Medication Change, or Goal Update. Each type has a different template."
                />
                <Step num={3} title="Fill in the structured template"
                  desc="Each template has guided fields. For a Progress Note: session date, summary of what was worked on, observations, and next steps. For an Incident Report: date, description, action taken, and notify NDIS if required."
                  tip="The templates are designed to capture clinically useful information without requiring long free-text responses. Keep notes factual and objective."
                />
                <Step num={4} title="Tag to NDIS categories"
                  desc="Tag the update to one or more NDIS support categories (e.g., Core – Daily Living, Capacity Building – Social Skills). This helps participants see which funding categories are being used."
                />
                <Step num={5} title="Submit the update"
                  desc="Click 'Submit'. The update is immediately visible in the participant's care record. The participant, their coordinator, and their family members (if consented) are notified."
                />
                <Step num={6} title="Edit or remove an update"
                  desc="You can edit or remove an update within 24 hours of submitting it. After 24 hours, contact the participant or your support coordinator to request a correction."
                />
              </Section>

              {/* Participant Records */}
              <Section id="participants" title="Participant Records" icon={Users}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Each participant's record gives you a complete view of your involvement with them — your updates, their goals, and your care team messages.
                </p>
                <Step num={1} title="View consent scope"
                  desc="At the top of each participant record, you'll see the consent categories they've approved for you. Only access data within the consented categories."
                />
                <Step num={2} title="View goals"
                  desc="Click the Goals tab to see the participant's NDIS plan goals. You'll see which goals you're tagged as contributing to, and can log progress against each one."
                />
                <Step num={3} title="View update history"
                  desc="The Updates tab shows all updates you've submitted for this participant, sorted by date. You can filter by update type."
                />
                <Step num={4} title="Update participant details"
                  desc="The Details tab shows the participant's profile — their plan type, support categories, and contact information. This information was provided by the participant when they sent the referral."
                />
              </Section>

              {/* Messages */}
              <Section id="messages" title="Care Team Messaging" icon={MessageSquare}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Message the participant and their support coordinator directly — without needing external email or phone calls. All messages are attached to the referral thread.
                </p>
                <Step num={1} title="Start a message"
                  desc="Open a participant's record and click the 'Messages' tab. Type your message and click Send. The message is visible to the participant, their coordinator, and any other providers in the thread."
                />
                <Step num={2} title="Reply to existing threads"
                  desc="Messages are grouped by referral. If a participant has multiple active referrals (e.g., physio and OT), each referral has its own message thread."
                />
                <Step num={3} title="Message threading"
                  desc="Each conversation is threaded. Replies stay in context. The support coordinator can see all messages in a thread without needing to be CC'd."
                />
                <InfoBox color="teal">
                  <strong>Tip:</strong> Use messaging to communicate about scheduling, clarify session goals, or share resources — not for urgent clinical issues which should always go through direct phone contact.
                </InfoBox>
              </Section>

              {/* NDIS Categories */}
              <Section id="ndis-categories" title="NDIS Categories" icon={Tag}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  When submitting updates, you can tag them to NDIS support categories. This helps participants track which funding categories are being used and prepares them for plan reviews.
                </p>
                <Step num={1} title="How tagging works"
                  desc="When submitting an update, select one or more NDIS categories from the dropdown: Core (Daily Activities, Transport, etc.), Capacity Building (Skills, Employment, etc.), or Capital (Assistive Technology, Home Modifications)."
                />
                <Step num={2} title="Participant visibility"
                  desc="Participants can see which categories your updates relate to. This helps them understand how their plan funds are being used across providers."
                />
                <Step num={3} title="Category accuracy"
                  desc="Tag accurately — only use categories that genuinely relate to the support you're delivering. Incorrect tagging doesn't affect funding but may confuse participants during plan reviews."
                />
              </Section>

              {/* Plan Reviews */}
              <Section id="plan-reviews" title="Plan Review Exports" icon={Download}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  When a participant's NDIS plan is coming up for review, you can export a structured summary of all your updates and goal progress — ready for the participant to take to their review meeting.
                </p>
                <Step num={1} title="Open the participant's record"
                  desc="From your dashboard, open the participant whose plan review is approaching."
                />
                <Step num={2} title="Generate the export"
                  desc="Click 'Export Care Summary'. Choose the date range (e.g., the last 12 months of your involvement). The export includes all your updates, tagged NDIS categories, and goal notes."
                />
                <Step num={3} title="Review and deliver"
                  desc="The export opens as a downloadable document. Review it for accuracy. Send it to the participant via the care team messaging, or let the participant know it's ready to download from their record."
                />
                <InfoBox color="violet">
                  <strong>Note:</strong> The export only includes updates YOU submitted. The participant's coordinator can combine multiple providers' exports for a full picture.
                </InfoBox>
              </Section>

              {/* Settings */}
              <Section id="settings" title="Account Settings" icon={Settings}>
                <Step num={1} title="Update organisation profile"
                  desc="Settings → Organisation lets you update your organisation name, contact details, and service categories. Changes are reflected on your provider profile visible to participants."
                />
                <Step num={2} title="Manage team members"
                  desc="Settings → Team shows all staff members. You can add new staff, deactivate accounts, or change roles. Deactivated staff cannot log in but their historical data is preserved."
                />
                <Step num={3} title="Notification preferences"
                  desc="Settings → Notifications controls when and how you're contacted: new referral alerts, message notifications, and consent change alerts."
                />
                <Step num={4} title="Two-factor authentication"
                  desc="Settings → Security → Enable 2FA. We strongly recommend enabling two-factor authentication for all staff accounts. Supports authenticator app (TOTP)."
                />
              </Section>

              {/* FAQ */}
              <Section id="faq" title="Frequently Asked Questions" icon={Search}>
                <div className="space-y-0">
                  {[
                    { q: 'Can I use Care Exchange alongside my existing practice management software?', a: 'Yes — Care Exchange is coordination infrastructure, not clinical or billing software. It works alongside your existing practice management system. You\'ll still use your existing software for clinical notes, scheduling, and billing.' },
                    { q: 'What if a participant\'s consent scope doesn\'t cover what I need to know?', a: 'Contact the participant directly via care team messaging to discuss. They can adjust their consent scope at any time through their Settings → Consent page.' },
                    { q: 'How do I handle a complaint from a participant?', a: 'If a participant has a complaint, contact them directly via care team messaging or your own channels. If the complaint constitutes a reportable incident under NDIS legislation, follow your normal incident reporting process.' },
                    { q: 'Can I export data for my own records?', a: 'Yes — you can export data for participants you have an active relationship with, for your own record-keeping. See our Data Management Policy for details on your obligations under NDIS requirements.' },
                    { q: 'How do I deactivate a staff member\'s account?', a: 'Go to Settings → Team, find the staff member, and click Deactivate. Their login is immediately disabled. All their submitted updates and messages are retained.' },
                    { q: 'What NDIS categories are supported?', a: 'All NDIS support categories are supported — Core, Capacity Building, and Capital. If you\'re unsure which category to tag an update to, default to the participant\'s primary support category.' },
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
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Care Exchange</span>
          </div>
          <p className="text-xs text-slate-400">Service Provider Help Centre. Last updated April 2026.</p>
        </div>
      </footer>
    </div>
  )
}
