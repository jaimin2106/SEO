// src/pages/admin/AdminSupport.tsx
import React, { useState } from 'react';
import {
  Headphones, TicketCheck, MessageSquare, Star, BookOpen,
  Search, Plus, ChevronRight, Clock, AlertTriangle, CheckCircle2,
  XCircle, Loader2, User, CreditCard, Activity, MoreVertical,
  Send, Lock, ChevronDown, ArrowRight, Zap
} from 'lucide-react';
import {
  useTickets, useTicketDetail, useTicketMessages,
  useTicketMutations, useTicketStats,
  SupportTicket, TicketStatus, TicketType, TicketPriority, NoteType
} from '@/hooks/admin/useAdminSupport';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type View = 'dashboard' | 'tickets' | 'ticket_detail' | 'user_search';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700 border-amber-200' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'text-gray-400' },
  normal: { label: 'Normal', color: 'text-blue-500' },
  high:   { label: 'High',   color: 'text-amber-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
};

const TYPE_LABELS: Record<TicketType, string> = {
  billing: 'Billing', technical: 'Technical', seo_report: 'SEO Report',
  scan_failure: 'Scan Failure', pdf_export: 'PDF Export', account: 'Account',
  feature_request: 'Feature Request', bug_report: 'Bug Report', general: 'General',
};

// ─── Main Component ──────────────────────────────────────────────
const AdminSupport: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: Headphones },
    { id: 'tickets' as View, label: 'Tickets', icon: TicketCheck },
    { id: 'user_search' as View, label: 'User Lookup', icon: Search },
  ];

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    setView('ticket_detail');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Support Center</h1>
          <p className="text-[13px] text-[#87867f] mt-1">Manage tickets, troubleshoot users, and monitor feedback.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#141413] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-[#e8e6dc]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              view === tab.id || (view === 'ticket_detail' && tab.id === 'tickets')
                ? 'border-[#c96442] text-[#c96442]'
                : 'border-transparent text-gray-400 hover:text-[#141413]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === 'dashboard' && <DashboardView onOpenTickets={() => setView('tickets')} />}
      {view === 'tickets' && (
        <TicketListView
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          onOpenTicket={openTicket}
        />
      )}
      {view === 'ticket_detail' && selectedTicketId && (
        <TicketDetailView
          ticketId={selectedTicketId}
          onBack={() => setView('tickets')}
        />
      )}
      {view === 'user_search' && <UserSearchView />}

      {showCreateModal && (
        <CreateTicketModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// ─── Dashboard View ───────────────────────────────────────────────
const DashboardView: React.FC<{ onOpenTickets: () => void }> = ({ onOpenTickets }) => {
  const { data: stats, isLoading } = useTicketStats();

  const kpis = [
    { label: 'Open',        value: stats?.open ?? 0,        color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Pending',     value: stats?.pending ?? 0,     color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'In Progress', value: stats?.in_progress ?? 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Resolved',    value: stats?.resolved ?? 0,    color: 'text-emerald-600',bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-[#e8e6dc] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <p className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider">{k.label}</p>
            {isLoading
              ? <div className="mt-2 h-8 w-16 bg-[#f5f4ed] animate-pulse rounded" />
              : <p className={`text-[32px] font-bold tracking-tight mt-1 ${k.color}`}>{k.value}</p>
            }
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStatCard label="Bug Reports" value={stats?.bug_report ?? 0} icon={<AlertTriangle className="h-4 w-4 text-red-500" />} loading={isLoading} />
        <QuickStatCard label="Feature Requests" value={stats?.feature_request ?? 0} icon={<Zap className="h-4 w-4 text-purple-500" />} loading={isLoading} />
        <QuickStatCard label="Billing Issues" value={stats?.billing ?? 0} icon={<CreditCard className="h-4 w-4 text-amber-500" />} loading={isLoading} />
      </div>

      <div className="bg-white border border-[#e8e6dc] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[#141413]">Recent Open Tickets</h3>
          <button onClick={onOpenTickets} className="text-[12px] font-medium text-[#c96442] hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <RecentTicketsTable />
      </div>
    </div>
  );
};

const QuickStatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; loading: boolean }> = ({ label, value, icon, loading }) => (
  <div className="bg-white border border-[#e8e6dc] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
    <div className="h-10 w-10 rounded-xl bg-[#f5f4ed] flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider">{label}</p>
      {loading
        ? <div className="mt-1 h-6 w-10 bg-[#f5f4ed] animate-pulse rounded" />
        : <p className="text-[22px] font-bold text-[#141413]">{value}</p>
      }
    </div>
  </div>
);

const RecentTicketsTable: React.FC = () => {
  const { data: tickets, isLoading } = useTickets({ status: 'open' });
  const recent = tickets?.slice(0, 5) ?? [];

  if (isLoading) return <p className="text-[13px] text-gray-400 py-4 text-center">Loading...</p>;
  if (!recent.length) return <p className="text-[13px] text-gray-400 py-4 text-center">No open tickets.</p>;

  return (
    <div className="space-y-2">
      {recent.map(t => (
        <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-[#f5f4ed] last:border-0">
          <div className="flex items-center gap-3">
            <StatusBadge status={t.status} />
            <div>
              <p className="text-[13px] font-medium text-[#141413]">{t.subject}</p>
              <p className="text-[11px] text-[#87867f]">{t.users?.email ?? 'Unknown'} · {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          <PriorityDot priority={t.priority} />
        </div>
      ))}
    </div>
  );
};

// ─── Ticket List View ─────────────────────────────────────────────
const TicketListView: React.FC<{
  statusFilter: TicketStatus | undefined;
  onStatusFilter: (s: TicketStatus | undefined) => void;
  onOpenTicket: (id: string) => void;
}> = ({ statusFilter, onStatusFilter, onOpenTicket }) => {
  const { data: tickets, isLoading } = useTickets(statusFilter ? { status: statusFilter } : undefined);
  const [search, setSearch] = useState('');

  const filtered = (tickets ?? []).filter(t =>
    !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.users?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statuses: (TicketStatus | undefined)[] = [undefined, 'open', 'pending', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map(s => (
          <button
            key={s ?? 'all'}
            onClick={() => onStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${
              statusFilter === s ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#e8e6dc] text-[#87867f] hover:border-[#141413] hover:text-[#141413]'
            }`}
          >
            {s ? STATUS_CONFIG[s].label : 'All'}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="pl-9 pr-3 py-2 bg-white border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] w-56 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e8e6dc] bg-[#faf9f5]">
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Subject</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Priority</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">User</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Created</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e6dc]">
            {isLoading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">Loading tickets...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">No tickets found.</td></tr>
            ) : filtered.map(ticket => (
              <tr
                key={ticket.id}
                onClick={() => onOpenTicket(ticket.id)}
                className="hover:bg-[#faf9f5] transition-colors cursor-pointer group"
              >
                <td className="px-5 py-3">
                  <p className="text-[13px] font-medium text-[#141413] group-hover:text-[#c96442] transition-colors">{ticket.subject}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-medium text-[#87867f] bg-[#f5f4ed] px-2 py-1 rounded">{TYPE_LABELS[ticket.type]}</span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={ticket.status} /></td>
                <td className="px-5 py-3"><PriorityDot priority={ticket.priority} showLabel /></td>
                <td className="px-5 py-3 text-[13px] text-[#87867f]">{ticket.users?.email ?? '—'}</td>
                <td className="px-5 py-3 text-[12px] text-[#87867f]">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</td>
                <td className="px-5 py-3 text-right">
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#c96442] transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Ticket Detail View ───────────────────────────────────────────
const TicketDetailView: React.FC<{ ticketId: string; onBack: () => void }> = ({ ticketId, onBack }) => {
  const { data: ticket, isLoading: ticketLoading } = useTicketDetail(ticketId);
  const { data: messages, isLoading: msgsLoading } = useTicketMessages(ticketId);
  const { updateTicket, addMessage } = useTicketMutations();
  const [reply, setReply] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('reply');

  const handleSendMessage = async () => {
    if (!reply.trim()) return;
    await addMessage.mutateAsync({ ticket_id: ticketId, content: reply, note_type: noteType, is_admin: true });
    setReply('');
  };

  if (ticketLoading) return <div className="p-8 text-[#87867f]">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium text-[#87867f] hover:text-[#141413] transition-colors">
        ← Back to tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Thread */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="p-5 border-b border-[#e8e6dc]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[#141413]">{ticket.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={ticket.status} />
                    <PriorityDot priority={ticket.priority} showLabel />
                    <span className="text-[11px] text-[#87867f]">{TYPE_LABELS[ticket.type]}</span>
                  </div>
                </div>
                <select
                  value={ticket.status}
                  onChange={e => updateTicket.mutate({ id: ticketId, status: e.target.value as TicketStatus })}
                  className="px-3 py-1.5 text-[12px] border border-[#e8e6dc] rounded-lg bg-white outline-none focus:border-[#c96442]"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              {ticket.description && (
                <p className="mt-3 text-[13px] text-[#4d4c48] leading-relaxed">{ticket.description}</p>
              )}
            </div>

            {/* Messages */}
            <div className="divide-y divide-[#f5f4ed]">
              {msgsLoading
                ? <p className="px-5 py-4 text-[13px] text-gray-400">Loading messages...</p>
                : messages?.map(msg => (
                  <div key={msg.id} className={`p-5 ${msg.note_type !== 'reply' ? 'bg-amber-50/50' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {msg.note_type !== 'reply' && <Lock className="h-3 w-3 text-amber-500" />}
                      <span className="text-[12px] font-bold text-[#141413]">{msg.users?.email ?? (msg.is_admin ? 'Admin' : 'User')}</span>
                      {msg.note_type !== 'reply' && (
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          {msg.note_type.replace('_', ' ')}
                        </span>
                      )}
                      <span className="text-[11px] text-[#87867f] ml-auto">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-[13px] text-[#4d4c48] leading-relaxed">{msg.content}</p>
                  </div>
                ))}
            </div>

            {/* Reply Box */}
            <div className="p-5 border-t border-[#e8e6dc] space-y-3">
              <div className="flex gap-2">
                {(['reply', 'internal_note', 'escalation_note'] as NoteType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setNoteType(t)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                      noteType === t ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#e8e6dc] text-[#87867f]'
                    }`}
                  >
                    {t === 'reply' ? 'Reply' : t === 'internal_note' ? '🔒 Internal Note' : '⚡ Escalation'}
                  </button>
                ))}
              </div>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                placeholder={noteType === 'reply' ? 'Write a reply to the user...' : 'Add an internal note (not visible to user)...'}
                className={`w-full px-4 py-3 border rounded-xl text-[13px] outline-none leading-relaxed resize-none transition-all ${
                  noteType !== 'reply' ? 'border-amber-200 bg-amber-50/50 focus:border-amber-400' : 'border-[#e8e6dc] focus:border-[#c96442]'
                }`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={addMessage.isPending || !reply.trim()}
                  className="flex items-center gap-2 bg-[#141413] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] disabled:opacity-50 transition-all"
                >
                  {addMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Panel */}
        <div className="space-y-4">
          <UserInspectionPanel
            userId={ticket.user_id}
            userEmail={ticket.users?.email}
            reporterName={ticket.reporter_name}
            reporterEmail={ticket.reporter_email}
            pageUrl={ticket.page_url}
            browserInfo={ticket.browser_info}
          />
        </div>
      </div>
    </div>
  );
};

// ─── User Inspection Panel ────────────────────────────────────────
const UserInspectionPanel: React.FC<{
  userId: string | null;
  userEmail?: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  pageUrl?: string | null;
  browserInfo?: string | null;
}> = ({ userId, userEmail, reporterName, reporterEmail, pageUrl, browserInfo }) => {
  const [userData, setUserData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase.from('users').select('id, email, full_name, tier, credits_remaining, created_at, status').eq('id', userId).single()
      .then(({ data }) => { setUserData(data); setLoading(false); });
  }, [userId]);

  // Derive display email/name — prefer linked account, fall back to reporter fields
  const displayEmail = userEmail || reporterEmail || '—';
  const displayName  = userData?.full_name || reporterName || displayEmail.split('@')[0];

  return (
    <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="px-5 py-4 border-b border-[#e8e6dc] bg-[#faf9f5] rounded-t-xl">
        <h3 className="text-[13px] font-bold text-[#141413] flex items-center gap-2">
          <User className="h-4 w-4 text-[#87867f]" />
          Reporter
        </h3>
      </div>
      <div className="p-5 space-y-4">
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-4 bg-[#f5f4ed] animate-pulse rounded" />)}</div>
        ) : (
          <>
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center shrink-0">
                <span className="text-[13px] font-bold text-[#141413]">{displayEmail[0]?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#141413] truncate">{displayName}</p>
                <p className="text-[11px] text-[#87867f] truncate">{displayEmail}</p>
              </div>
            </div>

            {/* Account status */}
            {userData ? (
              <div className="space-y-2.5 pt-1">
                <InfoRow label="Plan"    value={<span className="capitalize font-bold text-[#c96442]">{userData.tier}</span>} />
                <InfoRow label="Credits" value={userData.credits_remaining} />
                <InfoRow label="Status"  value={userData.status} />
                <InfoRow label="Since"   value={format(new Date(userData.created_at), 'MMM d, yyyy')} />
              </div>
            ) : (
              <div className="py-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f4ed] text-[11px] font-bold text-[#87867f] uppercase tracking-wider">
                  Anonymous / No Account
                </span>
              </div>
            )}

            {/* Reporter fields always shown */}
            {(reporterEmail || reporterName) && (
              <div className="space-y-1.5 pt-1 border-t border-[#e8e6dc]">
                <p className="text-[10px] font-bold text-[#87867f] uppercase tracking-wider pt-1">Submitted By</p>
                {reporterName  && <InfoRow label="Name"  value={reporterName} />}
                {reporterEmail && <InfoRow label="Email" value={
                  <a href={`mailto:${reporterEmail}`} className="text-[#c96442] hover:underline">{reporterEmail}</a>
                } />}
              </div>
            )}

            {/* Technical context */}
            {(pageUrl || browserInfo) && (
              <div className="space-y-1.5 pt-1 border-t border-[#e8e6dc]">
                <p className="text-[10px] font-bold text-[#87867f] uppercase tracking-wider pt-1">Debug Context</p>
                {pageUrl && (
                  <div>
                    <p className="text-[11px] text-[#87867f] mb-0.5">Page URL</p>
                    <a href={pageUrl} target="_blank" rel="noopener noreferrer"
                       className="text-[11px] text-[#c96442] hover:underline break-all font-mono">{pageUrl}</a>
                  </div>
                )}
                {browserInfo && (
                  <div>
                    <p className="text-[11px] text-[#87867f] mb-0.5">Browser</p>
                    <p className="text-[10px] text-[#87867f] font-mono break-all leading-relaxed bg-[#f5f4ed] px-2 py-1.5 rounded-lg">
                      {browserInfo.split(' | ')[0]?.slice(0, 80)}…
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions — only for linked accounts */}
            {userData && (
              <div className="pt-1 space-y-2 border-t border-[#e8e6dc]">
                <p className="text-[10px] font-bold text-[#87867f] uppercase tracking-wider pt-1">Quick Actions</p>
                <button className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-[#141413] hover:bg-[#f5f4ed] border border-[#e8e6dc] transition-colors">Grant Credits</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-[#141413] hover:bg-[#f5f4ed] border border-[#e8e6dc] transition-colors">View Reports</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-colors">Force Logout</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── User Search View ─────────────────────────────────────────────
const UserSearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from('users')
      .select('id, email, full_name, tier, credits_remaining, status, created_at')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);
    setResults(data ?? []);
    setSearching(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white border border-[#e8e6dc] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h3 className="text-[14px] font-bold text-[#141413] mb-4">User Lookup</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search by email, name, or domain..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] transition-all"
            />
          </div>
          <button
            onClick={doSearch}
            disabled={searching}
            className="flex items-center gap-2 bg-[#141413] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e8e6dc] bg-[#faf9f5]">
              <p className="text-[12px] font-bold text-[#87867f]">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-[#f5f4ed]">
              {results.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left px-5 py-3 transition-colors flex items-center gap-3 hover:bg-[#faf9f5] ${selectedUser?.id === u.id ? 'bg-[#f5f4ed]' : ''}`}
                >
                  <div className="h-8 w-8 rounded-full bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[#141413]">{u.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#141413] truncate">{u.full_name || u.email}</p>
                    <p className="text-[11px] text-[#87867f] truncate">{u.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold uppercase text-[#c96442] shrink-0">{u.tier}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedUser && (
            <UserInspectionPanel userId={selectedUser.id} userEmail={selectedUser.email} />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Create Ticket Modal ──────────────────────────────────────────
const CreateTicketModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createTicket } = useTicketMutations();
  const [form, setForm] = useState({ subject: '', description: '', type: 'general' as TicketType, priority: 'normal' as TicketPriority });

  const handleSubmit = async () => {
    if (!form.subject.trim()) return toast.error('Subject is required');
    await createTicket.mutateAsync(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#e8e6dc]">
          <h2 className="text-[16px] font-bold text-[#141413]">Create Support Ticket</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[12px] font-bold text-[#141413] block mb-1.5">Subject</label>
            <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}
              className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#141413] block mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value as TicketType}))}
                className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] bg-white outline-none focus:border-[#c96442]">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#141413] block mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value as TicketPriority}))}
                className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] bg-white outline-none focus:border-[#c96442]">
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#141413] block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={4} className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] resize-none" />
          </div>
        </div>
        <div className="p-4 border-t border-[#e8e6dc] bg-[#faf9f5] flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#87867f] hover:bg-[#e8e6dc]">Cancel</button>
          <button onClick={handleSubmit} disabled={createTicket.isPending}
            className="flex items-center gap-2 bg-[#c96442] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#b05638] disabled:opacity-50">
            {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shared Micro-components ──────────────────────────────────────
const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const PriorityDot: React.FC<{ priority: TicketPriority; showLabel?: boolean }> = ({ priority, showLabel }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`flex items-center gap-1.5 text-[12px] font-bold ${cfg.color}`}>
      <span className={`h-2 w-2 rounded-full bg-current`} />
      {showLabel && cfg.label}
    </span>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-[#87867f]">{label}</span>
    <span className="text-[12px] font-medium text-[#141413]">{value}</span>
  </div>
);

export default AdminSupport;
