import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type Plan = {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  credits_per_month: number;
  features: Record<string, any>;
  is_active: boolean;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  monthly_value?: number;   // computed/optional — not stored in DB
  billing_interval: string;
  current_period_end: string;
  created_at?: string;
  users?: { email: string; name?: string };
  plans?: { name: string };
};

export function useAdminFinance() {
  const qc = useQueryClient();

  const getMetrics = useQuery({
    queryKey: ['admin', 'finance', 'metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_financial_metrics');
      if (error) throw error;
      return data as {
        mrr: number;
        arr: number;
        active_subscribers: number;
        trial_users: number;
        canceled_subscribers: number;
      };
    }
  });

  const getSubscriptions = useQuery({
    queryKey: ['admin', 'finance', 'subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, status, billing_interval, current_period_end, created_at, users:user_id(email), plans:plan_id(name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data as unknown) as Subscription[];
    }
  });

  const getPlans = useQuery({
    queryKey: ['admin', 'finance', 'plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name, price_monthly, price_yearly, credits_per_month, features, is_active')
        .order('price_monthly', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    }
  });

  const getCreditLedger = useQuery({
    queryKey: ['admin', 'finance', 'credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('id, user_id, delta, reason, created_at, users:user_id(email)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    }
  });

  const updatePlan = useMutation({
    mutationFn: async (plan: Partial<Plan> & { id: string }) => {
      const { error } = await supabase
        .from('plans')
        .update(plan)
        .eq('id', plan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Plan updated successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'finance', 'plans'] });
    },
    onError: (err) => toast.error(err.message)
  });

  const grantCredits = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      // Typically we would use an RPC to do this atomically, but for admin overrides:
      const { data: user } = await supabase.from('users').select('credits_remaining').eq('id', userId).single();
      if (!user) throw new Error('User not found');
      
      const newBalance = (user.credits_remaining || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits_remaining: newBalance })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      const { error: logError } = await supabase
        .from('credit_transactions')
        .insert({ user_id: userId, delta: amount, reason, balance_after: newBalance });
        
      if (logError) throw logError;
    },
    onSuccess: () => {
      toast.success('Credits granted successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'finance', 'credits'] });
    },
    onError: (err) => toast.error(err.message)
  });

  return {
    getMetrics,
    getSubscriptions,
    getPlans,
    getCreditLedger,
    updatePlan,
    grantCredits
  };
}
