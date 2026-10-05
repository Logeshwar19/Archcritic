import { useState } from 'react'
import { updateUserProfile } from '../utils/auth.js'
import { CheckIcon } from './icons.jsx'

export default function SettingsModal({ user, onClose, onUserUpdated, cloudConfig, onDisconnectCloud }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [organization, setOrganization] = useState(user?.organization || 'Acme Cloud Labs')
  const [role, setRole] = useState(user?.role || 'Cloud Architect')
  const [savedNotice, setSavedNotice] = useState(false)

  // AI Critic Settings
  const [criticStrictness, setCriticStrictness] = useState('balanced')
  const [autoDlq, setAutoDlq] = useState(true)
  const [costAlerts, setCostAlerts] = useState(true)

  function handleSaveProfile(e) {
    e.preventDefault()
    const updated = updateUserProfile({ name, email, organization, role })
    onUserUpdated(updated)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative flex h-[580px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-[#0B0F19] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky/30 bg-sky/10 text-sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Workspace Settings</h2>
              <p className="text-xs text-muted">Manage your profile, cloud integrations, and AI audit rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-border bg-white/[0.01] px-6">
          {[
            { key: 'profile', label: 'User Profile' },
            { key: 'cloud',   label: 'Cloud Connection' },
            { key: 'ai',      label: 'AI Critic Engine' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`border-b-2 px-4 py-2.5 font-display text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'border-sky text-sky'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="flex items-center gap-4 pb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-blue-600 font-display text-xl font-black text-slate-950 shadow-glow">
                  {user?.avatarInitial || 'U'}
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">{user?.name}</h3>
                  <p className="font-mono text-xs text-muted">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full border border-sky/30 bg-sky/10 px-2 py-0.5 font-mono text-[10px] text-sky">
                    {user?.plan || 'Team Pro'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-display text-xs font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-display text-sm text-ink focus:border-sky focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block font-display text-xs font-medium text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-display text-sm text-ink focus:border-sky focus:outline-none"
                  placeholder="name@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-display text-xs font-medium text-muted mb-1">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-display text-sm text-ink focus:border-sky focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-display text-xs font-medium text-muted mb-1">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-display text-sm text-ink focus:border-sky focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-sky px-5 py-2 font-display text-xs font-bold text-slate-950 transition-all hover:bg-sky-dim shadow-glow"
                >
                  Save Profile Changes
                </button>
                {savedNotice && (
                  <span className="flex items-center gap-1 font-mono text-xs text-sky animate-fadeIn">
                    <CheckIcon className="h-4 w-4 text-sky" /> Saved successfully!
                  </span>
                )}
              </div>
            </form>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold text-xs">
                      AWS
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-ink">Amazon Web Services</h4>
                      <p className="text-xs text-muted">
                        {cloudConfig?.status === 'connected'
                          ? `Connected: ${cloudConfig.account} (${cloudConfig.region})`
                          : 'Not connected. Connect IAM Role for live scanning.'}
                      </p>
                    </div>
                  </div>
                  {cloudConfig?.status === 'connected' ? (
                    <button
                      onClick={onDisconnectCloud}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-display text-xs font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white/[0.02] p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold text-xs">
                      GCP
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-ink">Google Cloud Platform</h4>
                      <p className="text-xs text-muted">Service Account discovery (Available in Enterprise)</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">
                    Enterprise
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div>
                <label className="block font-display text-xs font-semibold text-ink mb-1.5">
                  Well-Architected Framework Strictness
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'strict', label: 'Strict Security', desc: 'Flags any unencrypted or direct access' },
                    { key: 'balanced', label: 'Balanced (Default)', desc: 'Security, HA, and Cost optimization' },
                    { key: 'relaxed', label: 'Fast Prototyping', desc: 'Allows direct connection shortcuts' },
                  ].map((lvl) => (
                    <button
                      type="button"
                      key={lvl.key}
                      onClick={() => setCriticStrictness(lvl.key)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        criticStrictness === lvl.key
                          ? 'border-sky bg-sky/10 text-ink shadow-sm'
                          : 'border-border bg-white/[0.02] text-muted hover:border-border/80 hover:text-ink'
                      }`}
                    >
                      <p className="font-display text-xs font-semibold">{lvl.label}</p>
                      <p className="text-[10px] text-muted mt-1">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDlq}
                    onChange={(e) => setAutoDlq(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-white/[0.04] text-sky focus:ring-sky"
                  />
                  <div>
                    <span className="font-display text-xs font-medium text-ink">Auto-suggest Dead Letter Queues (DLQ)</span>
                    <p className="text-[10px] text-muted">Alert when event producers lack buffering mechanisms</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={costAlerts}
                    onChange={(e) => setCostAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-white/[0.04] text-sky focus:ring-sky"
                  />
                  <div>
                    <span className="font-display text-xs font-medium text-ink">AWS Cost Anomaly & Downsizing Advisor</span>
                    <p className="text-[10px] text-muted">Highlight over-provisioned Aurora and Redis clusters</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-white/[0.01] px-6 py-3">
          <span className="font-mono text-[11px] text-muted">ArchCritic Engine v2.4 • Session Persistent</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-white/[0.04] px-4 py-1.5 font-display text-xs font-medium text-ink hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
