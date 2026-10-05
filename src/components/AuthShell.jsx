import { Link } from 'react-router-dom'
import BlueprintBackground from './BlueprintBackground.jsx'

export default function AuthShell({ children }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
      <BlueprintBackground />

      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <Link to="/login" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <LogoMark />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              ArchCritic
            </span>
            <span className="text-[11px] font-mono text-sky/80 tracking-widest uppercase">
              Studio
            </span>
          </div>
        </Link>

        {children}

        <p className="relative z-10 max-w-[340px] text-center text-[11px] leading-relaxed text-muted/60">
          Live architecture review, built into the canvas.
        </p>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="1" y="1" width="26" height="26" rx="8" stroke="#38BDF8" strokeWidth="1.4" />
      <circle cx="9" cy="10" r="2.2" fill="#38BDF8" />
      <circle cx="20" cy="9" r="1.8" fill="#818CF8" />
      <circle cx="10" cy="20" r="1.8" fill="#818CF8" />
      <circle cx="20" cy="19" r="2.2" fill="#38BDF8" />
      <line x1="9" y1="10" x2="20" y2="9" stroke="#38BDF8" strokeWidth="0.9" opacity="0.6" />
      <line x1="9" y1="10" x2="10" y2="20" stroke="#38BDF8" strokeWidth="0.9" opacity="0.6" />
      <line x1="20" y1="19" x2="20" y2="9" stroke="#818CF8" strokeWidth="0.9" opacity="0.6" />
      <line x1="20" y1="19" x2="10" y2="20" stroke="#818CF8" strokeWidth="0.9" opacity="0.6" />
    </svg>
  )
}
