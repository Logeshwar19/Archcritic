import { useState } from 'react'

export default function ConnectCloudModal({ onClose, onConnectSuccess }) {
  const [provider, setProvider] = useState('aws')
  const [accountId, setAccountId] = useState('8492-0193-4921')
  const [region, setRegion] = useState('us-east-1')
  const [roleArn, setRoleArn] = useState('arn:aws:iam::849201934921:role/ArchCriticReadOnly')
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)

  const steps = [
    'Validating IAM Role permissions with AWS STS...',
    'Discovering VPCs and Subnets in ' + region + '...',
    'Cataloging 6 Compute services & 2 Aurora databases...',
    'Synthesizing live network topology onto canvas...',
  ]

  async function handleStartScan(e) {
    e.preventDefault()
    setIsScanning(true)
    for (let i = 0; i < steps.length; i++) {
      setScanStep(i)
      await new Promise((r) => setTimeout(r, 650))
    }
    setIsScanning(false)
    onConnectSuccess({
      provider: 'AWS',
      accountId,
      region,
      roleArn,
      status: 'connected',
      connectedAt: 'Just now',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative flex h-[580px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-sky/30 bg-[#0B0F19] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky/40 bg-sky/10 text-sky shadow-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Connect Live Cloud Provider</h2>
              <p className="text-xs text-muted">Auto-discover your live architecture via read-only IAM access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isScanning}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/[0.05] hover:text-ink disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Provider selector */}
          <div>
            <label className="block font-display text-xs font-semibold text-ink mb-2">
              Select Cloud Provider
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'aws', name: 'AWS Cloud', icon: 'AWS', active: true, tag: 'Supported' },
                { id: 'gcp', name: 'Google Cloud', icon: 'GCP', active: false, tag: 'Coming Soon' },
                { id: 'azure', name: 'MS Azure', icon: 'AZ', active: false, tag: 'Coming Soon' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => p.active && setProvider(p.id)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    provider === p.id
                      ? 'border-sky bg-sky/10 text-ink shadow-sm'
                      : 'border-border bg-white/[0.02] text-muted opacity-70'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-sky">{p.icon}</span>
                  <span className="font-display text-xs font-semibold mt-1">{p.name}</span>
                  <span className="font-mono text-[9px] text-muted/80">{p.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-sky/20" />
                <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-sky" />
                <span className="font-mono text-xs font-bold text-sky">{scanStep + 1}/4</span>
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-bold text-ink">Scanning AWS Live Infrastructure</p>
                <p className="font-mono text-xs text-sky mt-1 animate-pulse">{steps[scanStep]}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStartScan} className="space-y-4">
              <div>
                <label className="block font-display text-xs font-medium text-muted mb-1">
                  AWS Account ID
                </label>
                <input
                  type="text"
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-display text-xs font-medium text-muted mb-1">
                  Primary AWS Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#0B0F19] px-3.5 py-2 font-display text-sm text-ink focus:border-sky focus:outline-none"
                >
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  <option value="us-west-2">us-west-2 (Oregon)</option>
                </select>
              </div>

              <div>
                <label className="block font-display text-xs font-medium text-muted mb-1">
                  Read-Only IAM Role ARN
                </label>
                <input
                  type="text"
                  required
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  placeholder="arn:aws:iam::account:role/..."
                  className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2 font-mono text-xs text-ink focus:border-sky focus:outline-none"
                />
                <p className="text-[10px] text-muted mt-1">
                  ArchCritic only requires SecurityAudit and ViewOnlyAccess policies. Zero write permissions needed.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky px-4 py-2.5 font-display text-sm font-bold text-slate-950 transition-all hover:bg-sky-dim shadow-glow"
                >
                  Connect & Discover Live Architecture
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-white/[0.01] px-6 py-3 text-[11px] text-muted">
          <span>🔒 Read-only TLS 1.3 encrypted connection</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
