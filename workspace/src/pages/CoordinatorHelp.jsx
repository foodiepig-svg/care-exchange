import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowLeft, ChevronDown, Search, BookOpen,
  ArrowUpRight, Users, BarChart3, Bell, Eye, MessageSquare,
  Settings, LogIn, Download, AlertCircle, TrendingUp, Link2, FolderOpen, FileText
} from 'lucide-react'

function Section({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="py-12 border-b border-slate-200 last:border-0">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{num}</div>
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

function InfoBox({ children, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
  { id: 'participant-roster', label: 'Participant Roster', icon: Users },
  { id: 'cross-provider', label: 'Cross-Provider Visibility', icon: Eye },
  { id: 'goals', label: 'Goal Tracking', icon: TrendingUp },
  { id: 'care-plans', label: 'Care Plans', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'referrals', label: 'Referral Coordination', icon: Link2 },
  { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
  { id: 'messages', label: 'Care Team Messaging', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: Search },
]

export default function CoordinatorHelp() {
  return (
    <div className="min-h-screen bg-slate-50">


      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>

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
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mt-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                <div className="text-emerald-700 font-semibold text-sm mb-2">Need more help?</div>
                <p className="text-emerald-600 text-xs leading-relaxed mb-3">
                  Contact our coordinator support team. We typically respond within 1 business day.
                </p>
                <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                  Contact support <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">

            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Support Coordinator Guide
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">How to Guide: Coordinator</h1>
              <p className="text-slate-500 leading-relaxed">
                How to use Care Exchange as a support coordinator — managing your participant roster, tracking cross-provider updates, monitoring care plans, and preparing plan review exports.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-200 px-8">

              {/* Getting Started */}
              <Section id="getting-started" title="Getting Started" icon={LogIn}>
                <Step num={1} title="Create your coordinator account"
                  desc="Go to careexchange.com.au/coordinator and click 'Create coordinator account'. Register with your name, email, Organisation name, and contact details."
                />
                <Step num={2} title="Participants invite you"
                  desc="You don't add participants yourself — participants invite you to their care team. When a participant invites you, you'll receive an email notification. Accept the invitation to connect."
                  tip="If you're working with a participant who hasn't used Care Exchange, you can suggest they register and invite you. They'll find the registration process straightforward."
                />
                <Step num={3} title="Set notification preferences"
                  desc="In Settings → Notifications, configure how you want to be alerted: when a participant invites you, when new updates are submitted, when goals change status, or when a plan review date is approaching."
                />
                <Step num={4} title="Explore your dashboard"
                  desc="Your coordinator dashboard shows your full participant roster at a glance — all participants, their care team status, recent updates, goal progress, and alerts. You can return here any time after logging in."
                />
              </Section>

              {/* Participant Roster */}
              <Section id="participant-roster" title="Participant Roster" icon={Users}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your participant roster is your primary view for managing all your participants in one place.
                </p>
                <Step num={1} title="View all your participants"
                  desc="Click 'Participants' in the sidebar. You'll see every participant who has invited you to their care team, with their current status, number of providers, and last update date."
                />
                <Step num={2} title="Sort and filter"
                  desc="Sort by name, last update date, number of active providers, or goal status. Use the status filter to show: All, On Track (goals progressing), Needs Review (no update in 14+ days), or Plan Review Due."
                />
                <Step num={3} title="Open a participant's full record"
                  desc="Click on any participant to open their full care record. You'll see all providers, all updates, all goals, and all messages — your read-only window into their complete care situation."
                />
                <Step num={4} title="Flag participants needing attention"
                  desc="Participants with no provider update in 14+ days are flagged as 'Needs Review'. Set your own threshold in Settings → Alerts. These flags help you prioritise follow-ups."
                />
                <InfoBox color="emerald">
                  <strong>Read-only access:</strong> You can see everything in a participant's record, but you cannot submit updates, modify goals, or change consent settings. Those are always between the participant and their providers.
                </InfoBox>
              </Section>

              {/* Cross-Provider Visibility */}
              <Section id="cross-provider" title="Cross-Provider Visibility" icon={Eye}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Care Exchange gives you visibility across all providers working with each participant — not just one at a time.
                </p>
                <Step num={1} title="See all providers at once"
                  desc="Open any participant's record and go to the 'Care Team' tab. You'll see every provider involved — their name, service type, and when they last submitted an update."
                />
                <Step num={2} title="View updates from all providers"
                  desc="The 'Updates' tab shows a chronological feed of ALL provider updates, regardless of which provider submitted them. Filter by provider name or update type to narrow results."
                />
                <Step num={3} title="Identify gaps"
                  desc="If you notice a provider hasn't submitted updates for a while while others are active, you can follow up directly with that provider — either through care team messaging or your own channels."
                />
                <Step num={4} title="Understand provider contribution"
                  desc="Each provider's contribution is tagged to NDIS categories. This helps you see which support categories are being actively used versus which plan funds remain untouched."
                />
              </Section>

              {/* Goal Tracking */}
              <Section id="goals" title="Goal Tracking" icon={TrendingUp}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Track NDIS plan goals across all providers — see which are on track, which need attention, and which providers are contributing to each one.
                </p>
                <Step num={1} title="View all goals for a participant"
                  desc="Open a participant's record and click 'Goals'. You'll see every active goal from their NDIS plan — each showing a progress bar, contributing providers, and the most recent update."
                />
                <Step num={2} title="Identify goals needing attention"
                  desc="Goals with no updates in 30+ days show an amber flag. Goals where the target date has passed without completion show a red flag. Use these to prompt conversations with the participant and providers."
                />
                <Step num={3} title="Provider contribution per goal"
                  desc="Click on a specific goal to see which providers are tagged as contributing to it, and read the history of updates related to that goal from each provider."
                />
                <Step num={4} title="Goal progress export"
                  desc="When a participant's plan review is approaching, go to Goals → Export. You'll get a structured document of all goals, their progress, and contributing providers — ready to take to the plan review meeting."
                />
              </Section>

              {/* Care Plans */}
              <Section id="care-plans" title="Care Plans" icon={FileText}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  View and monitor the structured care plans your participants have in place. Care Plans give you a clear picture of the supports a participant is receiving across all providers.
                </p>
                <Step num={1} title="View care plans for any participant"
                  desc="Open a participant's record and click 'Care Plans'. You'll see all the care plans they have created — with title, status (Draft, Active, On Hold, or Completed), and date range."
                />
                <Step num={2} title="See support items"
                  desc="Click on any care plan to expand it and see the full detail: support categories (Medical, Therapy, Home Care, Transport, Social), descriptions, and frequencies for each support item."
                />
                <Step num={3} title="Use care plans to identify gaps"
                  desc="Reviewing a participant's care plans alongside their goal progress helps you identify where supports may be missing or where providers haven't been submitting updates against planned supports."
                />
                <Step num={4} title="Prep for plan reviews"
                  desc="Before an NDIS plan review, review the participant's care plans alongside their goal history. Use this to identify what has been working, what hasn't, and what supports should be continued or added."
                />
                <InfoBox color="emerald">
                  <strong>View-only:</strong> Coordinators can view but not create or edit care plans. Only the participant can manage their own care plans.
                </InfoBox>
              </Section>

              {/* Documents */}
              <Section id="documents" title="Documents" icon={FolderOpen}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Access and download documents participants have shared with you — including assessments, reports, NDIS plans, and ID documents.
                </p>
                <Step num={1} title="Access shared documents"
                  desc="Open a participant's record and click 'Documents'. If the participant has consented to share documents with you, you'll see their uploaded files here."
                />
                <Step num={2} title="Filter by category"
                  desc="Documents are organised into categories: Assessment, Report, Plan, ID Document, or Other. Use the category tabs to find the document type you need."
                />
                <Step num={3} title="Download documents"
                  desc="Click the download icon on any document to open or save it. This is useful when preparing for plan reviews or when you need to review a participant's supporting documentation."
                />
                <Step num={4} title="Your own documents"
                  desc="You can upload and manage your own documents (e.g., coordination notes, reports) which are stored separately and are only visible to you."
                />
                <InfoBox color="teal">
                  <strong>Privacy:</strong> You can only see documents the participant has explicitly consented to share with you. Documents they keep private are not accessible.
                </InfoBox>
              </Section>

              {/* Referral Coordination */}
              <Section id="referrals" title="Referral Coordination" icon={Link2}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  See the status of all referrals sent by participants in your roster — without having to ask each provider individually.
                </p>
                <Step num={1} title="View referral status for any participant"
                  desc="Open a participant's record and click 'Referrals'. You'll see every referral the participant has sent, the provider name, date sent, and current status."
                />
                <Step num={2} title="Identify pending referrals"
                  desc="Referrals marked 'Pending' mean the provider hasn't responded. If a referral has been pending for more than 5 business days, consider following up with the provider to check if they received it."
                />
                <Step num={3} title="Track referral history"
                  desc="The full referral history for each participant shows every referral ever sent — accepted, declined, or pending — giving you a complete picture of their care team over time."
                />
                <InfoBox color="amber">
                  <strong>Note:</strong> You cannot send referrals on behalf of a participant. Only the participant can initiate referrals. If a participant wants to engage a new provider, guide them through the process and they can send the referral themselves.
                </InfoBox>
              </Section>

              {/* Alerts */}
              <Section id="alerts" title="Alerts & Notifications" icon={Bell}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Custom alerts help you stay on top of your roster without manually checking every participant every day.
                </p>
                <Step num={1} title="Set up alerts per participant"
                  desc="Open a participant's record and click 'Alerts'. Set a 'No update alert' — e.g., notify me if no update in 14 days. Set a 'Goal milestone alert' — notify me when a goal is achieved or goes off track."
                />
                <Step num={2} title="Set global roster alerts"
                  desc="Settings → Alerts lets you set defaults for all participants: minimum update frequency alert, plan review reminder (e.g., alert 60 days before plan end), and referral response alert (alert if pending > 5 days)."
                />
                <Step num={3} title="Notification delivery"
                  desc="Alerts are delivered via email and appear in-app (bell icon). In-app alerts persist until dismissed. Email alerts include a direct link to the relevant participant record."
                />
                <Step num={4} title="Snooze or dismiss"
                  desc="If you're already aware of a flagged issue and working on it, click 'Snooze' on the alert. It will be hidden for a period you choose (e.g., 7 days) and then reappear if the issue isn't resolved."
                />
              </Section>

              {/* Messages */}
              <Section id="messages" title="Care Team Messaging" icon={MessageSquare}>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Message providers and participants directly — all messages are attached to the relevant referral thread.
                </p>
                <Step num={1} title="Open a message thread"
                  desc="Open a participant's record and click 'Messages'. Each referral has its own thread. Select the relevant provider or the participant to open the conversation."
                />
                <Step num={2} title="Send a message"
                  desc="Type your message and send. The message appears in the thread and the recipient receives a notification. All messages in the thread are visible to everyone in the conversation."
                />
                <Step num={3} title="Message the full care team"
                  desc="If you need to message all providers at once (e.g., ahead of a plan review), open the participant's record and use 'Message All Providers' to send one message to every provider in the care team."
                />
                <InfoBox color="teal">
                  <strong>Scope of messaging:</strong> Use care team messaging for coordination questions — scheduling, plan review prep, update requests. For urgent clinical issues, always use direct phone contact.
                </InfoBox>
              </Section>

              {/* Settings */}
              <Section id="settings" title="Settings" icon={Settings}>
                <Step num={1} title="Update your profile"
                  desc="Settings → Profile lets you update your name, email, Organisation name, and contact details. This is what participants see when they invite you."
                />
                <Step num={2} title="Notification preferences"
                  desc="Settings → Notifications controls how and when you're alerted: new participant invitations, update notifications, goal alerts, and referral follow-up reminders."
                />
                <Step num={3} title="Default alert thresholds"
                  desc="Settings → Alerts sets your default alert thresholds for all participants: minimum update frequency, plan review reminder period, and referral pending threshold."
                />
                <Step num={4} title="Two-factor authentication"
                  desc="Settings → Security → Enable 2FA. We strongly recommend enabling 2FA. Supports authenticator app (TOTP)."
                />
              </Section>

              {/* FAQ */}
              <Section id="faq" title="Frequently Asked Questions" icon={Search}>
                <div className="space-y-0">
                  {[
                    { q: 'How is my coordinator access different from a provider?', a: 'As a coordinator, you have read-only access to each participant\'s care record. You can see updates, goals, care plans, and messages but cannot modify anything. Providers submit updates and manage the clinical side. You have oversight, not control.' },
                    { q: 'Can I send a referral on behalf of a participant?', a: 'No — only the participant can initiate a referral. You can guide them through the process and encourage them to send a referral to a specific provider, but the action must be taken by the participant.' },
                    { q: 'What if a participant hasn\'t updated their goals?', a: 'You can prompt the participant via care team messaging to review and update their goals. Goals belong to the participant — you can encourage and remind, but you cannot set or modify them yourself.' },
                    { q: 'Can I export data for my own reporting?', a: 'Yes — coordinator accounts can export participant data for NDIS reporting and plan review preparation. See our Data Management Policy for your obligations around data handling.' },
                    { q: 'How do I know if my access to a participant has been revoked?', a: 'You\'ll receive an email notification if a participant removes you from their care team. The participant will also disappear from your roster.' },
                    { q: 'Is there a limit on how many participants I can manage?', a: 'No — there is no limit on the number of participants in your roster. Free during beta; pricing for large coordination organisations will be announced at launch.' },
                  ].map(faq => <FaqItem key={faq.q} {...faq} />)}
                </div>
              </Section>

            </div>
          </main>
        </div>
      </div>

    </div>
  )
}
