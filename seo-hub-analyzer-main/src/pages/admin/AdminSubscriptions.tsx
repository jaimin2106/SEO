import React from 'react';
import { useAdminFinance } from '@/hooks/admin/useAdminFinance';
import { 
  Users, CreditCard, Wallet, AlertCircle, 
  Search, MoreVertical, ShieldCheck, Clock 
} from 'lucide-react';
import { format } from 'date-fns';

const AdminSubscriptions = () => {
  const { getMetrics, getSubscriptions } = useAdminFinance();
  const { data: metrics, isLoading: metricsLoading } = getMetrics;
  const { data: subscriptions, isLoading: subsLoading } = getSubscriptions;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Subscriptions</h1>
          <p className="text-[13px] text-[#87867f] mt-1">Manage active plans, trials, and revenue metrics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Monthly Recurring Revenue" 
          value={`$${metrics?.mrr?.toLocaleString() ?? 0}`} 
          icon={<Wallet className="h-4 w-4 text-emerald-600" />} 
          loading={metricsLoading} 
        />
        <MetricCard 
          title="Active Subscribers" 
          value={metrics?.active_subscribers?.toLocaleString() ?? '0'} 
          icon={<Users className="h-4 w-4 text-[#c96442]" />} 
          loading={metricsLoading} 
        />
        <MetricCard 
          title="Trial Users" 
          value={metrics?.trial_users?.toLocaleString() ?? '0'} 
          icon={<Clock className="h-4 w-4 text-blue-600" />} 
          loading={metricsLoading} 
        />
        <MetricCard 
          title="Annual Run Rate" 
          value={`$${metrics?.arr?.toLocaleString() ?? 0}`} 
          icon={<CreditCard className="h-4 w-4 text-purple-600" />} 
          loading={metricsLoading} 
        />
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#e8e6dc] flex items-center justify-between bg-[#faf9f5]">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-bold text-[#141413]">All Subscriptions</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#e8e6dc] text-[11px] font-bold text-[#87867f]">{subscriptions?.length || 0}</span>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by email..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-white">
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">MRR</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Renewal Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6dc]">
              {subsLoading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">Loading subscriptions...</td></tr>
              ) : subscriptions?.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">No subscriptions found</td></tr>
              ) : subscriptions?.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#faf9f5] transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-[#141413]">{sub.users?.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#141413]">{sub.users?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-[#87867f]">{sub.users?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#f5f4ed] border border-[#e8e6dc] text-[11px] font-bold text-[#141413] uppercase tracking-wider">
                      {sub.plans?.name || sub.plan_id}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-5 py-3 text-[13px] font-medium text-[#141413]">
                    ${sub.monthly_value}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#87867f]">
                    {format(new Date(sub.current_period_end), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-[#141413] hover:bg-[#e8e6dc] transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) => (
  <div className="bg-white border border-[#e8e6dc] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[110px]">
    <div className="flex items-center justify-between text-[#87867f]">
      <span className="text-[12px] font-bold uppercase tracking-wider">{title}</span>
      {icon}
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-[#f5f4ed] animate-pulse rounded-md mt-2" />
    ) : (
      <div className="text-[28px] font-bold text-[#141413] tracking-tight">{value}</div>
    )}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-100 text-blue-700 border-blue-200',
    canceled: 'bg-red-100 text-red-700 border-red-200',
    past_due: 'bg-amber-100 text-amber-700 border-amber-200'
  };
  const base = "inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider";
  return (
    <span className={`${base} ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

export default AdminSubscriptions;
