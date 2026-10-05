import { useState } from 'react'

const SAMPLE_TERRAFORM = `# Terraform AWS Architecture Definition
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_apigatewayv2_api" "gateway" {
  name          = "Production-Edge-Gateway"
  protocol_type = "HTTP"
}

resource "aws_ecs_service" "auth_service" {
  name          = "auth-microservice"
  desired_count = 3
  launch_type   = "FARGATE"
}

resource "aws_ecs_service" "order_service" {
  name          = "checkout-processor"
  desired_count = 4
  launch_type   = "FARGATE"
}

resource "aws_rds_cluster" "aurora_db" {
  cluster_identifier = "aurora-pg-primary"
  engine             = "aurora-postgresql"
  engine_version     = "16.1"
}
`

export default function ImportIacModal({ onClose, onImportSuccess }) {
  const [format, setFormat] = useState('terraform')
  const [code, setCode] = useState(SAMPLE_TERRAFORM)

  function handleParse(e) {
    e.preventDefault()
    // Parse resources from code or load structured nodes
    const importedNodes = [
      { id: 'gw',    name: 'Production Edge Gateway', category: 'Gateway', tier: 'Edge Tier', specs: 'AWS API Gateway HTTP', status: 'healthy', x: 80, y: 150, icon: 'cloud', latency: '12ms' },
      { id: 'auth',  name: 'Auth Microservice',       category: 'Compute', tier: 'Service Tier', specs: 'ECS Fargate (3 Tasks)', status: 'healthy', x: 340, y: 80, icon: 'cpu', latency: '15ms' },
      { id: 'order', name: 'Checkout Processor',      category: 'Compute', tier: 'Service Tier', specs: 'ECS Fargate (4 Tasks)', status: 'warning', statusMsg: 'Unbuffered write pipeline', x: 340, y: 230, icon: 'cpu', latency: '28ms' },
      { id: 'db',    name: 'Aurora PG Primary',       category: 'Database', tier: 'Storage Tier', specs: 'Aurora PostgreSQL 16.1', status: 'critical', statusMsg: 'Direct database access without pooler', x: 620, y: 150, icon: 'database', latency: '19ms' },
    ]
    const importedEdges = [
      { from: 'gw', to: 'auth', label: 'Route: /auth' },
      { from: 'gw', to: 'order', label: 'Route: /checkout' },
      { from: 'auth', to: 'db', label: 'Pooled SQL' },
      { from: 'order', to: 'db', label: 'Raw SQL' },
    ]

    onImportSuccess({
      title: 'Imported Terraform Architecture (' + format.toUpperCase() + ')',
      nodes: importedNodes,
      edges: importedEdges,
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky/40 bg-sky/10 text-sky">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Import Architecture (IaC)</h2>
              <p className="text-xs text-muted">Paste your Terraform HCL or CloudFormation to visualize</p>
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
        <form onSubmit={handleParse} className="flex flex-1 flex-col overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['terraform', 'cloudformation'].map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg px-3 py-1 font-display text-xs font-semibold uppercase ${
                    format === f
                      ? 'bg-sky/20 text-sky border border-sky/40'
                      : 'border border-border text-muted hover:text-ink'
                  }`}
                >
                  {f === 'terraform' ? 'Terraform (.tf)' : 'CloudFormation (.yaml)'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCode(SAMPLE_TERRAFORM)}
              className="text-xs text-sky hover:underline font-display"
            >
              Load Example
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              rows={12}
              className="w-full flex-1 rounded-xl border border-border bg-black/50 p-3.5 font-mono text-xs text-sky/90 focus:border-sky focus:outline-none resize-none"
              placeholder="# Paste Terraform code here..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 font-display text-xs text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky px-5 py-2 font-display text-xs font-bold text-slate-950 hover:bg-sky-dim shadow-glow transition-all"
            >
              Parse & Generate Canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
