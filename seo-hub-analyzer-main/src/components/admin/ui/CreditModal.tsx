// src/components/admin/ui/CreditModal.tsx
// Modal for granting, deducting, setting, or resetting user credits

import React, { useState } from 'react';
import { X, Coins, AlertCircle } from 'lucide-react';
import { useAdminCreditMutation, CreditAction } from '@/hooks/admin/useAdminCredits';
import { toast } from 'sonner';

interface CreditModalProps {
  userId: string;
  userEmail: string;
  currentCredits: number;
  defaultAction?: CreditAction;
  onClose: () => void;
}

const ACTION_CONFIG: Record<CreditAction, { label: string; color: string; description: string; needsAmount: boolean }> = {
  grant:  { label: 'Grant Credits',  color: 'bg-emerald-600 hover:bg-emerald-700', description: 'Add credits to user balance', needsAmount: true },
  deduct: { label: 'Deduct Credits', color: 'bg-amber-600 hover:bg-amber-700',    description: 'Remove credits from user balance', needsAmount: true },
  set:    { label: 'Set Credits',    color: 'bg-blue-600 hover:bg-blue-700',       description: 'Set exact credit balance', needsAmount: true },
  reset:  { label: 'Reset Credits',  color: 'bg-red-600 hover:bg-red-700',         description: 'Set balance to zero', needsAmount: false },
};

export const CreditModal: React.FC<CreditModalProps> = ({
  userId, userEmail, currentCredits, defaultAction = 'grant', onClose,
}) => {
  const [action, setAction] = useState<CreditAction>(defaultAction);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const mutation = useAdminCreditMutation();
  const config = ACTION_CONFIG[action];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount || '0', 10);
    if (config.needsAmount && (!amt || amt <= 0)) return;

    mutation.mutate(
      { userId, action, amount: config.needsAmount ? amt : 0, reason, currentCredits },
      {
        onSuccess: ({ newCredits }) => {
          toast.success(`Credits updated → ${newCredits}`);
          onClose();
        },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      },
    );
  };

  const preview = (() => {
    const amt = parseInt(amount || '0', 10);
    switch (action) {
      case 'grant':  return currentCredits + amt;
      case 'deduct': return Math.max(0, currentCredits - amt);
      case 'set':    return amt;
      case 'reset':  return 0;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] shadow-[0_24px_80px_rgba(20,20,19,0.16)]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e6dc]">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#c96442]" strokeWidth={1.75} />
            <h2 className="text-[15px] font-semibold text-[#141413]">Manage Credits</h2>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#f0eee6] text-[#87867f] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User info */}
          <div className="bg-[#f5f4ed] rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#87867f]">User</p>
              <p className="text-[13px] font-medium text-[#141413]">{userEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#87867f]">Current balance</p>
              <p className="text-[18px] font-bold text-[#141413]">{currentCredits}</p>
            </div>
          </div>

          {/* Action tabs */}
          <div className="grid grid-cols-4 gap-1 bg-[#f5f4ed] rounded-lg p-1">
            {(Object.keys(ACTION_CONFIG) as CreditAction[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAction(a)}
                className={`py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${
                  action === a
                    ? 'bg-white text-[#141413] shadow-sm'
                    : 'text-[#87867f] hover:text-[#141413]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <p className="text-[12px] text-[#87867f]">{config.description}</p>

          {/* Amount input */}
          {config.needsAmount && (
            <div>
              <label className="block text-[12px] font-semibold text-[#141413] mb-1.5">Amount</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3.5 py-2.5 bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg text-[14px] text-[#141413] placeholder:text-[#87867f] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/10 transition-all"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[12px] font-semibold text-[#141413] mb-1.5">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for failed scan"
              className="w-full px-3.5 py-2.5 bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg text-[14px] text-[#141413] placeholder:text-[#87867f] outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/10 transition-all"
            />
          </div>

          {/* Preview */}
          <div className="bg-[#f5f4ed] rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-[#87867f]">New balance after action</span>
            <span className="text-[18px] font-bold text-[#141413]">{preview ?? '—'}</span>
          </div>

          {action === 'reset' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600">This will set the balance to 0. This action is logged.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#e8e6dc] rounded-lg text-[13px] font-medium text-[#87867f] hover:text-[#141413] hover:border-[#141413] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50 ${config.color}`}
            >
              {mutation.isPending ? 'Saving…' : config.label}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
