// src/components/admin/ui/DeleteUserModal.tsx
// Danger confirmation modal for user deletion (soft delete)

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface DeleteUserModalProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    credits_remaining: number;
    report_count: number;
  };
  onClose: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const CONFIRM_PHRASE = 'delete';

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
    setIsDeleting(true);

    const { error } = await supabase.rpc('admin_soft_delete_user', { p_user_id: user.id });
    if (error) {
      toast.error(`Deletion failed: ${error.message}`);
      setIsDeleting(false);
      return;
    }

    logAdminAction({
      action: 'USER_DELETED',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { email: user.email, credits: user.credits_remaining, reports: user.report_count },
    });

    toast.success(`User ${user.email} has been deleted.`);
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    onClose();
    navigate('/admin/users');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-[#faf9f5] rounded-2xl border border-red-200 shadow-[0_24px_80px_rgba(20,20,19,0.16)]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={2} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#141413]">Delete User Account</h2>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#f0eee6] text-[#87867f] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[13px] text-[#5e5d59]">
            This is a <strong className="text-[#141413]">soft delete</strong>. The user account will be suspended and marked as deleted. Their data is preserved for audit purposes.
          </p>

          {/* User summary */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#87867f]">User</span>
              <span className="font-medium text-[#141413]">{user.email}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#87867f]">Reports</span>
              <span className="font-medium text-[#141413]">{user.report_count}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#87867f]">Credits remaining</span>
              <span className="font-medium text-[#141413]">{user.credits_remaining}</span>
            </div>
          </div>

          {/* Confirm input */}
          <div>
            <label className="block text-[12px] font-semibold text-[#141413] mb-1.5">
              Type <span className="text-red-600 font-mono">{CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-3.5 py-2.5 bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg text-[14px] text-[#141413] placeholder:text-[#87867f] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

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
              onClick={handleDelete}
              disabled={confirmText.toLowerCase() !== CONFIRM_PHRASE || isDeleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting…' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
