// src/hooks/admin/useAdminSupport.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketType = 'billing' | 'technical' | 'seo_report' | 'scan_failure' | 'pdf_export' | 'account' | 'feature_request' | 'bug_report' | 'general';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NoteType = 'reply' | 'internal_note' | 'escalation_note' | 'engineering_note';

export interface SupportTicket {
  id: string;
  user_id: string | null;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  page_url: string | null;
  browser_info: string | null;
  assigned_admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  users?: { email: string; full_name: string | null };
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string | null;
  is_admin: boolean;
  content: string;
  note_type: NoteType;
  created_at: string;
  users?: { email: string; full_name: string | null };
}

export function useTickets(filters?: { status?: TicketStatus; type?: TicketType }) {
  return useQuery({
    queryKey: ['admin', 'support', 'tickets', filters],
    queryFn: async () => {
      let q = supabase
        .from('support_tickets')
        .select('id, user_id, type, status, priority, subject, description, reporter_name, reporter_email, page_url, browser_info, assigned_admin_id, resolved_at, created_at, updated_at, users:user_id(email, full_name)')
        .order('created_at', { ascending: false });
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.type)   q = q.eq('type',   filters.type);
      const { data, error } = await q;
      if (error) throw error;
      return data as SupportTicket[];
    },
  });
}

export function useTicketDetail(ticketId: string | null) {
  return useQuery({
    queryKey: ['admin', 'support', 'ticket', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, user_id, type, status, priority, subject, description, reporter_name, reporter_email, page_url, browser_info, assigned_admin_id, resolved_at, created_at, updated_at, users:user_id(email, full_name)')
        .eq('id', ticketId!)
        .single();
      if (error) throw error;
      return data as SupportTicket;
    },
  });
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: ['admin', 'support', 'messages', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*, users:author_id(email, full_name)')
        .eq('ticket_id', ticketId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as TicketMessage[];
    },
  });
}

export function useTicketMutations() {
  const qc = useQueryClient();

  const createTicket = useMutation({
    mutationFn: async (payload: { subject: string; description: string; type: TicketType; priority: TicketPriority; user_id?: string }) => {
      const { data, error } = await supabase.from('support_tickets').insert(payload).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      toast.success('Ticket created');
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'tickets'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<SupportTicket> & { id: string }) => {
      const { error } = await supabase.from('support_tickets').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success('Ticket updated');
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'tickets'] });
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'ticket', vars.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addMessage = useMutation({
    mutationFn: async (payload: { ticket_id: string; content: string; note_type: NoteType; is_admin: boolean }) => {
      const { error } = await supabase.from('support_ticket_messages').insert(payload);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'messages', vars.ticket_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { createTicket, updateTicket, addMessage };
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['admin', 'support', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, type');
      if (error) throw error;

      const stats = {
        open: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0,
        bug_report: 0, feature_request: 0, billing: 0, technical: 0,
      };
      for (const t of data ?? []) {
        if (t.status in stats) (stats as any)[t.status]++;
        if (t.type === 'bug_report') stats.bug_report++;
        if (t.type === 'feature_request') stats.feature_request++;
        if (t.type === 'billing') stats.billing++;
        if (t.type === 'technical') stats.technical++;
      }
      return stats;
    },
  });
}
