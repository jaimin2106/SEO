import React, { useState } from 'react';
import { useAdminFinance } from '@/hooks/admin/useAdminFinance';
import { Sparkles, ArrowUpRight, ArrowDownRight, Search, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

const AdminCredits = () => {
  const { getCreditLedger, grantCredits } = useAdminFinance();
  const { data: ledger, isLoading } = getCreditLedger;
  const [showGrantModal, setShowGrantModal] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Credit Operations Center</h1>
          <p className="text-[13px] text-[#87867f] mt-1">Audit trail for all credit transactions across the platform.</p>
        </div>
        <button 
          onClick={() => setShowGrantModal(true)}
          className="flex items-center gap-2 bg-[#141413] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Issue Credits
        </button>
      </div>

      <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#e8e6dc] flex items-center justify-between bg-[#faf9f5]">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search user or transaction..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e6dc] rounded-lg text-[13px] font-medium text-[#4d4c48] hover:bg-[#f5f4ed]">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-white">
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">User ID / Email</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Action</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Delta</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#87867f] uppercase tracking-wider">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6dc]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-gray-400">Loading ledger...</td></tr>
              ) : ledger?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-[#faf9f5] transition-colors">
                  <td className="px-5 py-3 text-[13px] text-[#87867f]">
                    {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-[13px] font-medium text-[#141413]">{tx.users?.email || tx.user_id}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#f5f4ed] border border-[#e8e6dc] text-[11px] font-medium text-[#4d4c48]">
                      {tx.reason || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className={`flex items-center gap-1.5 text-[13px] font-bold ${tx.delta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.delta > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {tx.delta > 0 ? '+' : ''}{tx.delta}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-bold text-[#141413]">
                    {tx.balance_after ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal Implementation for demo purposes */}
      {showGrantModal && (
        <GrantModal 
          onClose={() => setShowGrantModal(false)}
          onSubmit={(payload) => {
            grantCredits.mutate(payload);
            setShowGrantModal(false);
          }}
          saving={grantCredits.isPending}
        />
      )}
    </div>
  );
};

const GrantModal = ({ onClose, onSubmit, saving }: { onClose: () => void, onSubmit: (d: any) => void, saving: boolean }) => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState('Admin Grant');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#e8e6dc]">
          <h2 className="text-[16px] font-bold text-[#141413]">Issue Credits</h2>
          <p className="text-[12px] text-[#87867f] mt-1">Manually deposit credits to a specific user.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[12px] font-bold text-[#141413] mb-1.5 block">User ID</label>
            <input 
              type="text" 
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="uuid"
              className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442]"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#141413] mb-1.5 block">Credit Amount</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442]"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#141413] mb-1.5 block">Reason / Note</label>
            <input 
              type="text" 
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442]"
            />
          </div>
        </div>
        <div className="p-4 border-t border-[#e8e6dc] bg-[#faf9f5] flex items-center justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#4d4c48] hover:bg-[#e8e6dc]">
            Cancel
          </button>
          <button 
            onClick={() => onSubmit({ userId, amount, reason })}
            disabled={saving || !userId}
            className="flex items-center gap-2 bg-[#c96442] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#b05638] disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Issue Credits'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCredits;
