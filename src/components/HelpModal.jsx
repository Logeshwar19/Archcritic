export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative flex h-[540px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-[#0B0F19] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky/30 bg-sky/10 text-sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Help & Documentation</h2>
              <p className="text-xs text-muted">How ArchCritic evaluates and validates cloud architectures</p>
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
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-sky">
              Workflow Guide
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  step: '01',
                  title: 'Connect or Create Architecture',
                  desc: 'Either connect your live AWS account to auto-discover running resources, import Terraform IaC, or draw nodes manually.',
                },
                {
                  step: '02',
                  title: 'Run AI Critic Audit',
                  desc: 'Click "Run AI Critic" at any time. Our model audits for AWS Well-Architected Framework: Reliability, Security, Cost, and Performance.',
                },
                {
                  step: '03',
                  title: 'One-Click Auto-Remediation',
                  desc: 'When an architectural flaw is discovered (e.g. unpooled direct DB queries), click "Auto-Fix" to inject proxy layers automatically.',
                },
                {
                  step: '04',
                  title: 'Export Terraform HCL',
                  desc: 'Switch to the "Terraform IaC" tab to copy ready-to-deploy Infrastructure-as-Code for your current canvas.',
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-3.5 rounded-xl border border-border bg-white/[0.02] p-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky/10 font-mono text-xs font-bold text-sky">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold text-ink">{s.title}</h4>
                    <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-sky mb-2">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.01] p-2">
                <span className="text-muted">Run AI Audit</span>
                <kbd className="rounded border border-border bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-ink">Ctrl + R</kbd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.01] p-2">
                <span className="text-muted">Add New Node</span>
                <kbd className="rounded border border-border bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-ink">N</kbd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.01] p-2">
                <span className="text-muted">Deselect Node</span>
                <kbd className="rounded border border-border bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-ink">Esc</kbd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.01] p-2">
                <span className="text-muted">Delete Selected</span>
                <kbd className="rounded border border-border bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-ink">Del / Backspace</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-white/[0.01] px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-white/[0.04] px-4 py-1.5 font-display text-xs font-medium text-ink hover:bg-white/[0.08]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
