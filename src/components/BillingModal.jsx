export default function BillingModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative flex h-[520px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-[#0B0F19] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky/30 bg-sky/10 text-sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Plan & Billing</h2>
              <p className="text-xs text-muted">Manage your subscription, node quotas, and team seats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Plan Card */}
          <div className="rounded-xl border border-sky/40 bg-gradient-to-br from-sky/10 via-white/[0.02] to-transparent p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-sky/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-sky uppercase">
                  Active Subscription
                </span>
                <h3 className="font-display text-xl font-bold text-ink mt-1.5">ArchCritic Pro Team</h3>
                <p className="text-xs text-muted">Billed annually • Renews in 312 days</p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-ink">$49</span>
                <span className="text-xs text-muted">/mo</span>
              </div>
            </div>

            {/* Quotas */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/80">
              <div>
                <p className="font-mono text-[10px] text-muted">Cloud Nodes</p>
                <p className="font-display text-sm font-bold text-ink">7 / 100</p>
                <div className="h-1 w-full bg-white/[0.08] rounded-full mt-1.5">
                  <div className="h-full bg-sky rounded-full w-[7%]" />
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] text-muted">AI Critic Scans</p>
                <p className="font-display text-sm font-bold text-ink">Unlimited</p>
                <div className="h-1 w-full bg-white/[0.08] rounded-full mt-1.5">
                  <div className="h-full bg-sky rounded-full w-full" />
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] text-muted">Team Seats</p>
                <p className="font-display text-sm font-bold text-ink">3 / 5</p>
                <div className="h-1 w-full bg-white/[0.08] rounded-full mt-1.5">
                  <div className="h-full bg-sky rounded-full w-[60%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border border-border bg-white/[0.02] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-border bg-black/40 font-mono text-xs font-bold text-ink">
                VISA
              </div>
              <div>
                <p className="font-display text-xs font-semibold text-ink">Visa ending in •••• 4242</p>
                <p className="text-[11px] text-muted">Expires 12/28 • Default payment method</p>
              </div>
            </div>
            <button className="rounded-lg border border-border bg-white/[0.04] px-3 py-1 font-display text-xs text-sky hover:bg-white/[0.08]">
              Update
            </button>
          </div>

          {/* Invoices */}
          <div>
            <h4 className="font-display text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Recent Invoices
            </h4>
            <div className="divide-y divide-border rounded-xl border border-border bg-white/[0.01]">
              {[
                { date: 'Oct 01, 2026', amount: '$49.00', id: 'INV-2026-009', status: 'Paid' },
                { date: 'Sep 01, 2026', amount: '$49.00', id: 'INV-2026-008', status: 'Paid' },
              ].map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 text-xs">
                  <div>
                    <span className="font-mono font-medium text-ink">{inv.id}</span>
                    <span className="text-muted ml-2">({inv.date})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-ink">{inv.amount}</span>
                    <span className="rounded-full bg-sky/10 px-2 py-0.5 font-mono text-[10px] text-sky">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-white/[0.01] px-6 py-3">
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
