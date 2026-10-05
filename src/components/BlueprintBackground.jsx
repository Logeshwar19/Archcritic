import { useEffect, useRef } from 'react'

const NODES = [
  { id: 'a', x: 12, y: 18, r: 5, delay: '0s' },
  { id: 'b', x: 30, y: 8, r: 4, delay: '0.4s' },
  { id: 'c', x: 8, y: 55, r: 6, delay: '0.9s' },
  { id: 'd', x: 22, y: 72, r: 4, delay: '1.3s' },
  { id: 'e', x: 88, y: 22, r: 5, delay: '0.6s' },
  { id: 'f', x: 78, y: 45, r: 4, delay: '1.1s' },
  { id: 'g', x: 92, y: 68, r: 6, delay: '0.2s' },
  { id: 'h', x: 68, y: 82, r: 4, delay: '1.6s' },
  { id: 'i', x: 50, y: 12, r: 3, delay: '0.8s' },
  { id: 'j', x: 46, y: 90, r: 3, delay: '1.9s' },
  { id: 'k', x: 62, y: 35, r: 3.5, delay: '1.2s' },
  { id: 'l', x: 35, y: 50, r: 4, delay: '0.5s' },
]

const EDGES = [
  ['a', 'b'], ['a', 'c'], ['c', 'd'],
  ['b', 'i'], ['e', 'f'], ['f', 'g'],
  ['g', 'h'], ['e', 'i'], ['d', 'j'],
  ['h', 'j'], ['k', 'f'], ['k', 'l'],
  ['l', 'c'], ['i', 'k'],
]

const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]))

export default function BlueprintBackground() {
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    function handleMove(e) {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 12
      const y = (e.clientY / innerHeight - 0.5) * 12
      el.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial sky-blue ambient glow behind the auth card */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)',
        }}
      />

      <div
        ref={wrapRef}
        className="absolute inset-[-5%] transition-transform duration-500 ease-out"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id="fade" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#0a0f1c" stopOpacity="0" />
              <stop offset="100%" stopColor="#070A12" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          {EDGES.map(([from, to], i) => {
            const a = nodeById[from]
            const b = nodeById[to]
            return (
              <line
                key={i}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke="url(#edgeGradient)"
                strokeWidth="0.18"
                strokeDasharray="1 1.4"
                opacity="0.3"
              />
            )
          })}

          {NODES.map((n) => (
            <g key={n.id} className="animate-drift" style={{ animationDelay: n.delay }}>
              <circle
                cx={n.x} cy={n.y}
                r={n.r * 0.55}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="0.15"
                opacity="0.4"
              />
              <circle
                cx={n.x} cy={n.y}
                r={n.r * 0.22}
                fill="#38BDF8"
                className="animate-pulseNode"
                style={{ animationDelay: n.delay, transformOrigin: `${n.x}px ${n.y}px` }}
              />
            </g>
          ))}

          <rect x="0" y="0" width="100" height="100" fill="url(#fade)" />
        </svg>
      </div>

      {/* Subtle graph-paper grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
