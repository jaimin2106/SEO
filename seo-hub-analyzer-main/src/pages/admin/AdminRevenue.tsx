import React, { useState } from 'react';
import { useAdminFinance } from '@/hooks/admin/useAdminFinance';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  Activity, ArrowRight, DollarSign, Target 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const MOCK_REVENUE_DATA = [
  { month: 'Jan', mrr: 12000, churn: 400 },
  { month: 'Feb', mrr: 15000, churn: 300 },
  { month: 'Mar', mrr: 18500, churn: 450 },
  { month: 'Apr', mrr: 22000, churn: 200 },
  { month: 'May', mrr: 27500, churn: 100 },
  { month: 'Jun', mrr: 32000, churn: 150 }
];

const MOCK_FUNNEL_DATA = [
  { step: 'Visitors', count: 45000, conversion: '100%' },
  { step: 'Signups', count: 8500, conversion: '18.8%' },
  { step: 'First Scan', count: 6200, conversion: '72.9%' },
  { step: 'Upgrade', count: 450, conversion: '7.2%' }
];

const AdminRevenue = () => {
  const { getMetrics } = useAdminFinance();
  const { data: metrics, isLoading } = getMetrics;
  const [activeTab, setActiveTab] = useState<'analytics' | 'churn' | 'funnel'>('analytics');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Revenue Intelligence</h1>
          <p className="text-[13px] text-[#87867f] mt-1">Analytics for growth, retention, and funnel conversion.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#e8e6dc]">
        {[
          { id: 'analytics', label: 'Financial Analytics', icon: DollarSign },
          { id: 'churn', label: 'Churn Intelligence', icon: TrendingDown },
          { id: 'funnel', label: 'Funnel Conversion', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 text-[13px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id 
                ? 'border-[#c96442] text-[#c96442]' 
                : 'border-transparent text-gray-400 hover:text-[#141413]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top Line Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard title="Current MRR" value={`$${metrics?.mrr?.toLocaleString() ?? 0}`} loading={isLoading} trend="+12.5%" />
            <MetricCard title="Annual Run Rate" value={`$${metrics?.arr?.toLocaleString() ?? 0}`} loading={isLoading} trend="+12.5%" />
            <MetricCard title="LTV (Avg)" value="$425.00" loading={false} trend="+5.2%" />
            <MetricCard title="CAC (Avg)" value="$45.00" loading={false} trend="-2.1%" negativeGood />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border border-[#e8e6dc] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-bold text-[#141413] mb-6">MRR Growth (Trailing 6 Months)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c96442" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c96442" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#87867f' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#87867f' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <CartesianGrid vertical={false} stroke="#e8e6dc" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e8e6dc', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="#c96442" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Churn Tab */}
      {activeTab === 'churn' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Gross MRR Churn" value="3.2%" loading={false} trend="-0.5%" negativeGood />
            <MetricCard title="Lost Revenue (30d)" value="$850" loading={false} trend="+10%" negativeGood={false} />
            <MetricCard title="Reactivations" value="12" loading={false} trend="+2" />
          </div>

          <div className="bg-white border border-[#e8e6dc] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="px-5 py-4 border-b border-[#e8e6dc] bg-[#faf9f5]">
              <h3 className="text-[14px] font-bold text-[#141413]">Recent Cancellations</h3>
            </div>
            <div className="p-8 text-center">
              <Activity className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-[13px] text-gray-500">No recent cancellations recorded in the last 7 days.</p>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Tab */}
      {activeTab === 'funnel' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white border border-[#e8e6dc] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-bold text-[#141413] mb-8">Acquisition Funnel (30d)</h3>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              {MOCK_FUNNEL_DATA.map((step, idx) => {
                const max = MOCK_FUNNEL_DATA[0].count;
                const percentage = (step.count / max) * 100;
                
                return (
                  <div key={step.step} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#141413]">{step.step}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-medium text-gray-500">{step.count.toLocaleString()}</span>
                        <span className="text-[12px] font-bold text-[#c96442] w-12 text-right">{step.conversion}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-[#f5f4ed] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#141413] rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {idx < MOCK_FUNNEL_DATA.length - 1 && (
                      <div className="absolute -bottom-4 left-4">
                        <ArrowRight className="h-3 w-3 text-gray-300 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const MetricCard = ({ title, value, loading, trend, negativeGood = false }: any) => {
  const isPositive = trend?.startsWith('+');
  const trendColor = isPositive 
    ? (negativeGood ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50')
    : (negativeGood ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50');

  return (
    <div className="bg-white border border-[#e8e6dc] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[110px]">
      <div className="flex items-center justify-between text-[#87867f]">
        <span className="text-[12px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        {loading ? (
          <div className="h-8 w-24 bg-[#f5f4ed] animate-pulse rounded-md" />
        ) : (
          <div className="text-[28px] font-bold text-[#141413] tracking-tight">{value}</div>
        )}
        {trend && (
          <div className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-0.5 ${trendColor}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;
