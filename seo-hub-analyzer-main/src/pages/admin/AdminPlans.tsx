import React, { useState } from 'react';
import { useAdminFinance, Plan } from '@/hooks/admin/useAdminFinance';
import { Settings, Save, Check, Loader2 } from 'lucide-react';

const AdminPlans = () => {
  const { getPlans, updatePlan } = useAdminFinance();
  const { data: plans, isLoading } = getPlans;
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-8 text-[#87867f]">Loading plans...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Plan Configuration</h1>
          <p className="text-[13px] text-[#87867f] mt-1">Manage pricing, credits, and feature flags for all tiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            isEditing={editingId === plan.id}
            onEdit={() => setEditingId(plan.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updated) => {
              updatePlan.mutate(updated);
              setEditingId(null);
            }}
            saving={updatePlan.isPending}
          />
        ))}
      </div>
    </div>
  );
};

const PlanCard = ({ 
  plan, isEditing, onEdit, onCancel, onSave, saving 
}: { 
  plan: Plan; isEditing: boolean; onEdit: () => void; onCancel: () => void; 
  onSave: (p: Partial<Plan> & { id: string }) => void; saving: boolean;
}) => {
  const [formData, setFormData] = useState({
    price_monthly: plan.price_monthly,
    credits_per_month: plan.credits_per_month,
    features: { ...plan.features }
  });

  const handleFeatureToggle = (key: string) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  const handleFeatureNumber = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  return (
    <div className={`bg-white border ${isEditing ? 'border-[#c96442] shadow-[0_4px_20px_rgba(201,100,66,0.1)]' : 'border-[#e8e6dc] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'} rounded-2xl overflow-hidden flex flex-col transition-all`}>
      <div className="p-6 border-b border-[#e8e6dc] bg-[#faf9f5]">
        <h2 className="text-[16px] font-bold text-[#141413] uppercase tracking-wider">{plan.name}</h2>
        {isEditing ? (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[14px] text-gray-500">$</span>
            <input 
              type="number" 
              value={formData.price_monthly} 
              onChange={e => setFormData(prev => ({ ...prev, price_monthly: Number(e.target.value) }))}
              className="w-24 px-3 py-1.5 border border-[#e8e6dc] rounded-lg text-[16px] font-bold text-[#141413] outline-none focus:border-[#c96442]"
            />
            <span className="text-[12px] text-gray-500">/ mo</span>
          </div>
        ) : (
          <div className="mt-4">
            <span className="text-[32px] font-bold text-[#141413]">${plan.price_monthly}</span>
            <span className="text-[13px] text-[#87867f] ml-1">/ month</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 space-y-6">
        <div>
          <label className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider block mb-3">Core Allocation</label>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#141413]">Monthly Credits</span>
            {isEditing ? (
              <input 
                type="number" 
                value={formData.credits_per_month} 
                onChange={e => setFormData(prev => ({ ...prev, credits_per_month: Number(e.target.value) }))}
                className="w-20 px-2 py-1 text-right border border-[#e8e6dc] rounded-md text-[13px] font-medium"
              />
            ) : (
              <span className="text-[13px] font-bold text-[#141413]">{plan.credits_per_month}</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider block mb-3">Features</label>
          <div className="space-y-3">
            {Object.entries(plan.features).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[13px] text-[#4d4c48] capitalize">{key.replace('_', ' ')}</span>
                {isEditing ? (
                  typeof val === 'boolean' ? (
                    <button 
                      onClick={() => handleFeatureToggle(key)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${formData.features[key] ? 'bg-[#c96442]' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.features[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  ) : (
                    <input 
                      type="number" 
                      value={formData.features[key] as number}
                      onChange={e => handleFeatureNumber(key, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right border border-[#e8e6dc] rounded-md text-[13px] font-medium"
                    />
                  )
                ) : (
                  typeof val === 'boolean' ? (
                    val ? <Check className="h-4 w-4 text-emerald-500" /> : <span className="text-[12px] text-gray-300">—</span>
                  ) : (
                    <span className="text-[13px] font-bold text-[#141413]">{val}</span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#e8e6dc] bg-[#faf9f5] mt-auto">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSave({ id: plan.id, ...formData })}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#141413] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            <button 
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg text-[13px] font-medium text-[#4d4c48] hover:bg-[#e8e6dc] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[#e8e6dc] text-[#141413] px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#f5f4ed] transition-colors shadow-sm"
          >
            <Settings className="h-4 w-4 text-gray-400" />
            Configure Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminPlans;
