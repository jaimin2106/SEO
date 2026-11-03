// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, ScanSearch, Cpu, Sparkles, ToggleLeft,
  Mail, Shield, Bell, Save, Check, Loader2, RefreshCw
} from 'lucide-react';
import {
  usePlatformSettings, useUpdateSetting,
  useFeatureFlags, useUpdateFeatureFlag,
  settingsToMap, PlatformSetting
} from '@/hooks/admin/useAdminSettings';

type SettingsTab = 'general' | 'seo_engine' | 'scan_engine' | 'ai' | 'feature_flags' | 'email' | 'security' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
  { id: 'general',       label: 'General',       icon: Globe },
  { id: 'seo_engine',    label: 'SEO Engine',    icon: ScanSearch },
  { id: 'scan_engine',   label: 'Scan Engine',   icon: Cpu },
  { id: 'ai',            label: 'AI Providers',  icon: Sparkles },
  { id: 'feature_flags', label: 'Feature Flags', icon: ToggleLeft },
  { id: 'email',         label: 'Email',         icon: Mail },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const AI_PROVIDERS = [
  { id: 'openai',    label: 'OpenAI',    logo: '⚡' },
  { id: 'anthropic', label: 'Anthropic', logo: '🔮' },
  { id: 'google',    label: 'Google Gemini', logo: '✨' },
  { id: 'deepseek',  label: 'DeepSeek',  logo: '🔍' },
];

const EMAIL_TEMPLATES = [
  { key: 'welcome_email',         label: 'Welcome Email',        desc: 'Sent to new users on signup' },
  { key: 'verification_email',    label: 'Email Verification',   desc: 'Sent on account confirmation' },
  { key: 'report_ready',          label: 'Report Ready',         desc: 'Sent when a scan report is generated' },
  { key: 'pdf_ready',             label: 'PDF Ready',            desc: 'Sent when PDF export completes' },
  { key: 'credits_refilled',      label: 'Credits Refilled',     desc: 'Monthly credit reset notification' },
  { key: 'upgrade_success',       label: 'Upgrade Confirmation', desc: 'Sent after plan upgrade' },
  { key: 'subscription_renewal',  label: 'Subscription Renewal', desc: 'Upcoming renewal reminder' },
  { key: 'password_reset',        label: 'Password Reset',       desc: 'Sent on password reset request' },
];

// ─── Main Component ──────────────────────────────────────────────
const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Platform Settings</h1>
        <p className="text-[13px] text-[#87867f] mt-1">Configure platform behaviour, AI providers, and feature availability.</p>
      </div>

      <div className="flex gap-8">
        {/* Vertical Tab Nav */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 text-left ${
                  activeTab === tab.id
                    ? 'bg-[#f5f4ed] text-[#141413] border border-[#e8e6dc]'
                    : 'text-[#87867f] hover:text-[#141413] hover:bg-[#f5f4ed]'
                }`}
              >
                <tab.icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? 'text-[#c96442]' : ''}`} strokeWidth={1.75} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general'       && <GeneralSettings />}
          {activeTab === 'seo_engine'    && <CategorySettings category="seo_engine" title="SEO Engine" description="Control how the scan engine crawls and analyses websites." />}
          {activeTab === 'scan_engine'   && <CategorySettings category="scan_engine" title="Scan Engine" description="Configure job queue, retry logic, and caching behaviour." />}
          {activeTab === 'ai'            && <AISettings />}
          {activeTab === 'feature_flags' && <FeatureFlagsSettings />}
          {activeTab === 'email'         && <EmailSettings />}
          {activeTab === 'security'      && <CategorySettings category="security" title="Security" description="Session timeouts, password policies, and access controls." />}
          {activeTab === 'notifications' && <NotificationsSettings />}
        </div>
      </div>
    </div>
  );
};

// ─── Shared form components ───────────────────────────────────────
const SettingsSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-white border border-[#e8e6dc] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden mb-6">
    <div className="px-6 py-5 border-b border-[#e8e6dc] bg-[#faf9f5]">
      <h3 className="text-[14px] font-bold text-[#141413]">{title}</h3>
      {description && <p className="text-[12px] text-[#87867f] mt-0.5">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SettingRow: React.FC<{
  setting: PlatformSetting;
  onSave: (key: string, value: any) => void;
  saving: boolean;
}> = ({ setting, onSave, saving }) => {
  const [localVal, setLocalVal] = useState(setting.value);
  const [dirty, setDirty] = useState(false);
  const isBool = typeof setting.value === 'boolean';

  useEffect(() => { setLocalVal(setting.value); setDirty(false); }, [setting.value]);

  const handleChange = (v: any) => { setLocalVal(v); setDirty(true); };

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#f5f4ed] last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#141413]">{setting.label}</p>
        {setting.description && <p className="text-[11px] text-[#87867f] mt-0.5">{setting.description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isBool ? (
          <button
            onClick={() => { const n = !localVal; handleChange(n); onSave(setting.key, n); }}
            className={`w-10 h-5 rounded-full relative transition-colors ${localVal ? 'bg-[#c96442]' : 'bg-[#e8e6dc]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localVal ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        ) : (
          <>
            <input
              type={typeof localVal === 'number' ? 'number' : 'text'}
              value={localVal}
              onChange={e => handleChange(typeof setting.value === 'number' ? Number(e.target.value) : e.target.value)}
              className="w-32 px-3 py-1.5 text-right border border-[#e8e6dc] rounded-lg text-[13px] font-medium outline-none focus:border-[#c96442] transition-all"
            />
            {dirty && (
              <button
                onClick={() => { onSave(setting.key, localVal); setDirty(false); }}
                disabled={saving}
                className="flex items-center gap-1 bg-[#141413] text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#2a2926] transition-colors"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── General Settings ─────────────────────────────────────────────
const GeneralSettings: React.FC = () => {
  const { data: settings, isLoading } = usePlatformSettings('general');
  const updateSetting = useUpdateSetting();

  if (isLoading) return <LoadingState />;

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      <SettingsSection title="Platform Identity" description="Core branding and contact information shown across the platform.">
        {settings?.map(s => (
          <SettingRow key={s.key} setting={s} onSave={(k, v) => updateSetting.mutate({ key: k, value: v })} saving={updateSetting.isPending} />
        ))}
      </SettingsSection>
    </div>
  );
};

// ─── Category Settings (SEO / Scan / Security) ───────────────────
const CategorySettings: React.FC<{ category: string; title: string; description: string }> = ({ category, title, description }) => {
  const { data: settings, isLoading } = usePlatformSettings(category);
  const updateSetting = useUpdateSetting();

  if (isLoading) return <LoadingState />;

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      <SettingsSection title={title} description={description}>
        {settings?.map(s => (
          <SettingRow key={s.key} setting={s} onSave={(k, v) => updateSetting.mutate({ key: k, value: v })} saving={updateSetting.isPending} />
        ))}
      </SettingsSection>
    </div>
  );
};

// ─── AI Settings ─────────────────────────────────────────────────
const AISettings: React.FC = () => {
  const { data: settings, isLoading } = usePlatformSettings('ai');
  const updateSetting = useUpdateSetting();
  const map = settingsToMap(settings ?? []);

  if (isLoading) return <LoadingState />;

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-6">
      <SettingsSection title="Provider Selection" description="Choose which AI provider powers analysis and recommendations.">
        <div className="grid grid-cols-2 gap-3">
          {AI_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => updateSetting.mutate({ key: 'ai_provider', value: p.id })}
              className={`flex items-center gap-3 p-4 border rounded-xl text-left transition-all ${
                map.ai_provider === p.id
                  ? 'border-[#c96442] bg-[#c96442]/5 shadow-[0_0_0_1px_#c96442]'
                  : 'border-[#e8e6dc] hover:border-[#c96442]/50 hover:bg-[#faf9f5]'
              }`}
            >
              <span className="text-2xl">{p.logo}</span>
              <div>
                <p className="text-[13px] font-bold text-[#141413]">{p.label}</p>
                {map.ai_provider === p.id && (
                  <p className="text-[11px] text-[#c96442] font-medium">Active</p>
                )}
              </div>
              {map.ai_provider === p.id && <Check className="h-4 w-4 text-[#c96442] ml-auto" />}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Model Configuration" description="Model names, temperature, and token limits.">
        {settings?.filter(s => s.key !== 'ai_provider').map(s => (
          <SettingRow key={s.key} setting={s} onSave={(k, v) => updateSetting.mutate({ key: k, value: v })} saving={updateSetting.isPending} />
        ))}
      </SettingsSection>
    </div>
  );
};

// ─── Feature Flags ────────────────────────────────────────────────
const FeatureFlagsSettings: React.FC = () => {
  const { data: flags, isLoading } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();

  if (isLoading) return <LoadingState />;

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      <SettingsSection title="Feature Flags" description="Instantly enable or disable platform features without a deployment.">
        <div className="space-y-0">
          {flags?.map(flag => (
            <div key={flag.id} className="flex items-center justify-between py-4 border-b border-[#f5f4ed] last:border-0">
              <div>
                <p className="text-[13px] font-medium text-[#141413]">{flag.label}</p>
                {flag.description && <p className="text-[11px] text-[#87867f] mt-0.5">{flag.description}</p>}
                <div className="flex gap-1 mt-1.5">
                  {flag.target_plans.map((plan: string) => (
                    <span key={plan} className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase text-[#c96442] bg-[#c96442]/10">
                      {plan}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => updateFlag.mutate({ id: flag.id, enabled: !flag.enabled })}
                disabled={updateFlag.isPending}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${flag.enabled ? 'bg-[#c96442]' : 'bg-[#e8e6dc]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
};

// ─── Email Settings ───────────────────────────────────────────────
const EmailSettings: React.FC = () => (
  <div className="animate-in fade-in slide-in-from-right-2 duration-200">
    <SettingsSection title="Email Templates" description="Configure subject lines and content for transactional emails.">
      <div className="space-y-0">
        {EMAIL_TEMPLATES.map(template => (
          <div key={template.key} className="flex items-center justify-between py-4 border-b border-[#f5f4ed] last:border-0">
            <div>
              <p className="text-[13px] font-medium text-[#141413]">{template.label}</p>
              <p className="text-[11px] text-[#87867f] mt-0.5">{template.desc}</p>
            </div>
            <button className="px-3 py-1.5 border border-[#e8e6dc] rounded-lg text-[12px] font-medium text-[#4d4c48] hover:bg-[#f5f4ed] hover:border-[#c96442] transition-all">
              Edit Template
            </button>
          </div>
        ))}
      </div>
    </SettingsSection>
  </div>
);

// ─── Notifications Settings ───────────────────────────────────────
const NotificationsSettings: React.FC = () => {
  const [banners, setBanners] = useState<{ id: number; message: string; type: string; active: boolean }[]>([]);
  const [newBanner, setNewBanner] = useState({ message: '', type: 'info' });

  const addBanner = () => {
    if (!newBanner.message.trim()) return;
    setBanners(prev => [...prev, { id: Date.now(), ...newBanner, active: true }]);
    setNewBanner({ message: '', type: 'info' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-6">
      <SettingsSection title="Announcement Banners" description="Show platform-wide notices to users on the dashboard.">
        <div className="space-y-3 mb-5">
          {banners.length === 0 && (
            <p className="text-[13px] text-[#87867f] py-2">No active banners. Create one below.</p>
          )}
          {banners.map(b => (
            <div key={b.id} className={`flex items-start gap-3 p-3 rounded-lg border ${b.type === 'warning' ? 'bg-amber-50 border-amber-200' : b.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#141413]">{b.message}</p>
                <span className="text-[10px] font-bold uppercase text-gray-500">{b.type}</span>
              </div>
              <button onClick={() => setBanners(prev => prev.filter(x => x.id !== b.id))} className="text-gray-400 hover:text-red-500 text-[12px]">Remove</button>
            </div>
          ))}
        </div>

        <div className="border border-[#e8e6dc] rounded-xl p-4 space-y-3">
          <p className="text-[12px] font-bold text-[#141413]">Create Banner</p>
          <textarea
            value={newBanner.message}
            onChange={e => setNewBanner(p => ({...p, message: e.target.value}))}
            placeholder="Banner message..."
            rows={2}
            className="w-full px-3 py-2 border border-[#e8e6dc] rounded-lg text-[13px] outline-none focus:border-[#c96442] resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={newBanner.type}
              onChange={e => setNewBanner(p => ({...p, type: e.target.value}))}
              className="px-3 py-1.5 border border-[#e8e6dc] rounded-lg text-[13px] bg-white outline-none focus:border-[#c96442]"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
            <button
              onClick={addBanner}
              className="flex items-center gap-2 bg-[#141413] text-white px-4 py-1.5 rounded-lg text-[13px] font-medium hover:bg-[#2a2926] transition-colors"
            >
              <Bell className="h-4 w-4" />
              Add Banner
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="space-y-4">
    {[1,2,3,4].map(i => (
      <div key={i} className="bg-white border border-[#e8e6dc] rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-36 bg-[#f5f4ed] animate-pulse rounded" />
            <div className="h-3 w-52 bg-[#f5f4ed] animate-pulse rounded" />
          </div>
          <div className="h-8 w-24 bg-[#f5f4ed] animate-pulse rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default AdminSettings;
