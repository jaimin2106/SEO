// src/pages/admin/AdminForbidden.tsx
// 403 page rendered when user is authenticated but lacks admin role.
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorIllustration } from '@/components/ui/ErrorIllustration';

const AdminForbidden: React.FC = () => (
  <div className="min-h-screen bg-[#f5f4ed] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="text-center max-w-sm">
      <div className="mb-6">
        <ErrorIllustration type="403" className="w-40 h-40" />
      </div>
      <h1
        className="text-[28px] text-[#141413] tracking-tight mb-2"
        style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}
      >
        Access Denied
      </h1>
      <p className="text-[14px] text-[#87867f] mb-6">
        You do not have the necessary permissions to access the admin console.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141413] text-white text-[13px] font-medium rounded-lg hover:bg-[#1f1e1a] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  </div>
);

export default AdminForbidden;
