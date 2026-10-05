import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CloudIcon,
  ServerIcon,
  DatabaseIcon,
  CpuIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
  LayersIcon,
  CodeIcon,
  DollarIcon,
  CopyIcon,
  DownloadIcon,
  RefreshCwIcon,
  PlusIcon,
  TrashIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '../components/icons.jsx'
import { getCurrentUser, logoutUser, getSavedCloudConfig, saveCloudConfig } from '../utils/auth.js'
import SettingsModal from '../components/SettingsModal.jsx'
import BillingModal from '../components/BillingModal.jsx'
import HelpModal from '../components/HelpModal.jsx'
import ConnectCloudModal from '../components/ConnectCloudModal.jsx'
import ImportIacModal from '../components/ImportIacModal.jsx'
import AiSidecar from '../components/AiSidecar.jsx'

// ─── Architecture Templates ──────────────────────────────────────────────────
const TEMPLATES = {
  ecommerce: {
    id: 'ecommerce',
    title: 'Global E-Commerce & Checkout Pipeline (AWS + K8s)',
    description: 'High-availability microservices with Kafka event bus and Aurora database.',
    nodes: [
      { id: 'cf',    name: 'Cloudflare Edge & WAF',        category: 'Gateway',   tier: 'Edge Layer',         specs: 'DDoS Shield • SSL Termination',           status: 'healthy',  x: 40,  y: 140, icon: 'cloud',    latency: '8ms'  },
      { id: 'gw',    name: 'Kong API Gateway',             category: 'Gateway',   tier: 'Ingress Tier',       specs: 'Rate Limiting • JWT Auth',                status: 'healthy',  x: 230, y: 140, icon: 'server',   latency: '14ms' },
      { id: 'auth',  name: 'Auth Service (Go)',            category: 'Compute',   tier: 'Core Microservice',  specs: 'Kubernetes Pods (3 Replicas)',             status: 'healthy',  x: 440, y: 60,  icon: 'cpu',      latency: '18ms' },
      { id: 'order', name: 'Order & Checkout (Node)',      category: 'Compute',   tier: 'Core Microservice',  specs: 'EKS Cluster • Auto-scale 2–10',           status: 'warning',  statusMsg: 'Payment stream unbuffered', x: 440, y: 220, icon: 'cpu', latency: '34ms' },
      { id: 'kafka', name: 'Apache Kafka (MSK)',           category: 'Streaming', tier: 'Event Spine',        specs: '3-Node Cluster • 48h Retention',          status: 'healthy',  x: 650, y: 220, icon: 'layers',   latency: '4ms'  },
      { id: 'redis', name: 'ElastiCache Redis 7',         category: 'Database',  tier: 'In-Memory Cache',    specs: 'Cluster Mode • 99.2% Hit Rate',           status: 'healthy',  x: 650, y: 60,  icon: 'database', latency: '2ms'  },
      { id: 'db',    name: 'AWS Aurora Postgres 16',      category: 'Database',  tier: 'Primary Data Store', specs: 'Multi-AZ Primary + 2 Read Replicas',      status: 'critical', statusMsg: 'Direct unpooled query risk', x: 860, y: 140, icon: 'database', latency: '22ms' },
    ],
    edges: [
      { from: 'cf',    to: 'gw',    label: 'HTTPS'        },
      { from: 'gw',    to: 'auth',  label: 'gRPC'         },
      { from: 'gw',    to: 'order', label: 'gRPC'         },
      { from: 'auth',  to: 'redis', label: 'Cache Lookup' },
      { from: 'order', to: 'kafka', label: 'Order Events' },
      { from: 'order', to: 'redis', label: 'Session'      },
      { from: 'order', to: 'db',    label: 'Direct SQL'   },
      { from: 'kafka', to: 'db',    label: 'Async Write'  },
    ],
  },
  rag: {
    id: 'rag',
    title: 'Generative AI Multi-Agent RAG Pipeline',
    description: 'Enterprise semantic search, vector embeddings, and real-time LLM streaming.',
    nodes: [
      { id: 'client',       name: 'Next.js App & Webhook',         category: 'Gateway', tier: 'Frontend Edge',    specs: 'Vercel Serverless • SSR',         status: 'healthy',  x: 50,  y: 140, icon: 'cloud',    latency: '12ms'  },
      { id: 'orchestrator', name: 'FastAPI Agent Orchestrator',    category: 'Compute', tier: 'Agent Core',       specs: 'LangGraph • Async Workers',       status: 'healthy',  x: 270, y: 140, icon: 'cpu',      latency: '45ms'  },
      { id: 'vector',       name: 'Qdrant / Milvus Cluster',       category: 'Database',tier: 'Vector Store',     specs: 'HNSW Index • 1536 dims',          status: 'healthy',  x: 520, y: 60,  icon: 'database', latency: '18ms'  },
      { id: 'llm',          name: 'Self-Hosted vLLM / Bedrock',    category: 'Compute', tier: 'Model Serving',    specs: 'NVIDIA H100 GPU Instance',        status: 'warning',  statusMsg: 'GPU utilization 92% under load', x: 520, y: 220, icon: 'server', latency: '180ms' },
      { id: 's3',           name: 'S3 Document Lake',              category: 'Database',tier: 'Raw Knowledge Base',specs: 'Encrypted KMS • Intelligent Tiering', status: 'healthy', x: 760, y: 140, icon: 'database', latency: '30ms' },
    ],
    edges: [
      { from: 'client',       to: 'orchestrator', label: 'WebSocket'    },
      { from: 'orchestrator', to: 'vector',        label: 'Embeddings'  },
      { from: 'orchestrator', to: 'llm',           label: 'Token Stream'},
      { from: 'vector',       to: 's3',            label: 'Chunk Ref'   },
    ],
  },
}

// ─── Diagnostics per template ─────────────────────────────────────────────────
const INITIAL_ISSUES = [
  {
    id: 'issue-1', severity: 'critical',
    title: 'Direct Database Access from Service Layer',
    nodeId: 'db',
    description: 'Order & Checkout issues unpooled raw SQL queries directly to Aurora Postgres. Under spike traffic this can exhaust DB connections.',
    impact: 'Database starvation, latency spikes (>1200ms) and potential outage during flash sales.',
    recommendation: 'Inject AWS RDS Proxy or PgBouncer connection pooler between application and database.',
    fixed: false,
  },
  {
    id: 'issue-2', severity: 'warning',
    title: 'Payment Event Stream Missing Dead-Letter Queue',
    nodeId: 'order',
    description: 'Order worker emits critical transaction events to Kafka without a retry or DLQ for dropped packets.',
    impact: 'Risk of unhandled transaction states in payment webhooks.',
    recommendation: 'Configure MSK dead-letter topic with automated SQS failover alarm.',
    fixed: false,
  },
  {
    id: 'issue-3', severity: 'info',
    title: 'Redis Cache Read Replicas Under-utilized',
    nodeId: 'redis',
    description: 'ElastiCache cluster has 99.2% hit rate. You can safely downgrade instance size.',
    impact: 'Estimated $240/month in cloud compute savings.',
    recommendation: 'Switch node type from cache.r6g.xlarge to cache.t4g.medium.',
    fixed: false,
  },
]

// ─── Terraform HCL generator ──────────────────────────────────────────────────
function generateTerraformHCL(nodes) {
  if (!nodes || nodes.length === 0) {
    return `# ArchCritic: Canvas is empty. Connect cloud or add resources to generate Terraform.`
  }
  return `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "production"
      ManagedBy   = "ArchCritic"
      Project     = "Core-Platform"
    }
  }
}

# --- VPC & Networking ---
resource "aws_vpc" "primary" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "archcritic-vpc" }
}

# --- Canvas Provisioned Resources (${nodes.length} components) ---
${nodes.map((node) => {
  const safe = node.id.replace(/[^a-zA-Z0-9_]/g, '_')
  if (node.category === 'Database') return `resource "aws_rds_cluster" "${safe}" {
  cluster_identifier          = "archcritic-${safe}"
  engine                      = "aurora-postgresql"
  engine_version              = "16.1"
  database_name               = "appdb"
  master_username             = "critic_admin"
  manage_master_user_password = true
  backup_retention_period     = 14
  storage_encrypted           = true
}`
  if (node.category === 'Streaming') return `resource "aws_msk_cluster" "${safe}" {
  cluster_name           = "archcritic-${safe}"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3
  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.kafka.id]
  }
}`
  if (node.category === 'Gateway') return `resource "aws_apigatewayv2_api" "${safe}" {
  name          = "${node.name}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://app.archcritic.io"]
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
  }
}`
  return `resource "aws_ecs_service" "${safe}" {
  name            = "${safe}-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.${safe}.arn
  desired_count   = 3
  launch_type     = "FARGATE"
}`
}).join('\n\n')}
`
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  // Dynamic user state loaded from localStorage or auth utility
  const [user, setUser] = useState(() => {
    const saved = getCurrentUser()
    if (saved) return saved
    return {
      name: 'Loki',
      email: 'loki@gmail.com',
      avatarInitial: 'L',
      role: 'Cloud Architect',
      organization: 'Personal Workspace',
      plan: 'Team Pro',
    }
  })

  // Cloud connection state
  const [cloudConfig, setCloudConfig] = useState(() => getSavedCloudConfig())

  // Architecture state - starts with Onboarding / Launchpad if no active project chosen
  const [activeProjectTitle, setActiveProjectTitle] = useState('')
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  // Tabs: canvas | critic | terraform | cost
  const [activeTab, setActiveTab] = useState('canvas')

  const [isScanning, setIsScanning]   = useState(false)
  const [scanNotice, setScanNotice]   = useState('')
  const [healthScore, setHealthScore] = useState(100)
  const [zoomLevel, setZoomLevel]     = useState(1)
  const [issues, setIssues]           = useState([])

  const [showAddModal, setShowAddModal]         = useState(false)
  const [newNodeName, setNewNodeName]           = useState('')
  const [newNodeCategory, setNewNodeCategory]   = useState('Compute')
  const [copyFeedback, setCopyFeedback]         = useState(false)

  // Top header modals & dropdown
  const [showProfile, setShowProfile]           = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showBillingModal, setShowBillingModal]   = useState(false)
  const [showHelpModal, setShowHelpModal]         = useState(false)
  const [showConnectModal, setShowConnectModal]   = useState(false)
  const [showImportModal, setShowImportModal]     = useState(false)
  const [showAiSidecar, setShowAiSidecar]         = useState(false)

  function showToast(msg) {
    setScanNotice(msg)
    setTimeout(() => setScanNotice(''), 4000)
  }

  // Load a demo template
  function handleSelectTemplate(key) {
    if (!TEMPLATES[key]) return
    const tmpl = TEMPLATES[key]
    setActiveProjectTitle(`Demo: ${tmpl.title}`)
    setNodes(tmpl.nodes)
    setEdges(tmpl.edges)
    setSelectedNodeId(tmpl.nodes[0]?.id || null)
    setHealthScore(key === 'ecommerce' ? 92 : 96)
    setIssues(key === 'ecommerce' ? INITIAL_ISSUES : [])
    setActiveTab('canvas')
    showToast(`Loaded "${tmpl.title}"`)
  }

  // Connect live AWS
  function handleConnectCloudSuccess(config) {
    saveCloudConfig(config)
    setCloudConfig(config)

    // Synthesize live discovered architecture
    const liveNodes = [
      { id: 'aws-waf',    name: 'AWS WAF & CloudFront Edge', category: 'Gateway', tier: 'Global Edge', specs: 'DDoS Shield • SSL Termination', status: 'healthy', x: 50, y: 150, icon: 'cloud', latency: '6ms' },
      { id: 'aws-alb',    name: 'Application Load Balancer', category: 'Gateway', tier: 'VPC Ingress', specs: 'Multi-AZ Public Subnet', status: 'healthy', x: 260, y: 150, icon: 'server', latency: '11ms' },
      { id: 'aws-auth',   name: 'ECS: Auth Service (Go)',   category: 'Compute', tier: 'Private Subnet', specs: 'Fargate v1.4 (3 Tasks)', status: 'healthy', x: 480, y: 70, icon: 'cpu', latency: '15ms' },
      { id: 'aws-api',    name: 'ECS: Core API Service',     category: 'Compute', tier: 'Private Subnet', specs: 'Fargate v1.4 (6 Tasks)', status: 'warning', statusMsg: 'Unpooled connection spike risk', x: 480, y: 230, icon: 'cpu', latency: '32ms' },
      { id: 'aws-redis',  name: 'ElastiCache Redis 7',       category: 'Database', tier: 'Cache Tier', specs: 'cache.r6g.large (Multi-AZ)', status: 'healthy', x: 720, y: 70, icon: 'database', latency: '2ms' },
      { id: 'aws-aurora', name: 'Aurora PostgreSQL 16',      category: 'Database', tier: 'Primary DB', specs: 'db.r6g.xlarge (1 Primary + 1 Replica)', status: 'critical', statusMsg: 'Direct connection starvation risk', x: 720, y: 230, icon: 'database', latency: '24ms' },
    ]
    const liveEdges = [
      { from: 'aws-waf', to: 'aws-alb', label: 'HTTPS' },
      { from: 'aws-alb', to: 'aws-auth', label: '/auth' },
      { from: 'aws-alb', to: 'aws-api', label: '/api' },
      { from: 'aws-auth', to: 'aws-redis', label: 'Tokens' },
      { from: 'aws-api', to: 'aws-redis', label: 'Cache' },
      { from: 'aws-api', to: 'aws-aurora', label: 'Direct SQL' },
    ]

    setActiveProjectTitle(`Live AWS (${config.region}) — ${config.accountId}`)
    setNodes(liveNodes)
    setEdges(liveEdges)
    setSelectedNodeId('aws-aurora')
    setHealthScore(89)
    setIssues([
      {
        id: 'live-issue-1', severity: 'critical',
        title: 'Direct Database Access from ECS Service',
        nodeId: 'aws-aurora',
        description: 'Core API communicates with Aurora without connection pooling. Under traffic spikes this will exhaust max DB connections.',
        impact: 'Connection timeouts, potential downtime.',
        recommendation: 'Inject AWS RDS Proxy between ECS tasks and Aurora PostgreSQL.',
        fixed: false,
      },
    ])
    setActiveTab('canvas')
    showToast(`✓ Connected to AWS (${config.region})! Discovered 6 cloud resources.`)
  }

  function handleDisconnectCloud() {
    saveCloudConfig(null)
    setCloudConfig(null)
    showToast('AWS Cloud disconnected.')
  }

  // Import IaC
  function handleImportSuccess({ title, nodes: importedNodes, edges: importedEdges }) {
    setActiveProjectTitle(title)
    setNodes(importedNodes)
    setEdges(importedEdges)
    setSelectedNodeId(importedNodes[0]?.id || null)
    setHealthScore(94)
    setIssues(INITIAL_ISSUES.slice(0, 2))
    setActiveTab('canvas')
    showToast(`Imported ${importedNodes.length} resources from Terraform!`)
  }

  // Blank canvas
  function handleStartBlankCanvas() {
    setActiveProjectTitle('Custom Architecture (Blank Canvas)')
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
    setHealthScore(100)
    setIssues([])
    setActiveTab('canvas')
    showToast('Started blank canvas. Click "+ Add" to create your first node.')
  }

  function handleAutoFix(issueId) {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, fixed: true } : i)))
    
    // Auto-fix for database pooler
    if (issueId === 'issue-1' || issueId === 'live-issue-1') {
      const proxy = {
        id: 'proxy', name: 'AWS RDS Proxy (Pooler)', category: 'Database',
        tier: 'Connection Management', specs: 'Max 10,000 Pooled Conns',
        status: 'healthy', x: 600, y: 150, icon: 'database', latency: '3ms',
      }
      setNodes((prev) => [
        ...prev.map((n) => (n.id === 'db' || n.id === 'aws-aurora') ? { ...n, status: 'healthy', statusMsg: 'Protected by RDS Proxy' } : n),
        proxy,
      ])
      setEdges((prev) => [
        ...prev.filter((e) => !(e.to === 'db' || e.to === 'aws-aurora')),
        { from: 'order', to: 'proxy', label: 'Pool Socket' },
        { from: 'aws-api', to: 'proxy', label: 'Pool Socket' },
        { from: 'proxy', to: (nodes.some((n) => n.id === 'aws-aurora') ? 'aws-aurora' : 'db'), label: 'Pooled SQL' },
      ])
      setHealthScore((s) => Math.min(99, s + 7))
      showToast('✨ Auto-Fix: Injected RDS Connection Pooler. Health +7!')
    } else if (issueId === 'issue-2') {
      setNodes((prev) => prev.map((n) => n.id === 'order' ? { ...n, status: 'healthy', statusMsg: 'DLQ retry policy active' } : n))
      setHealthScore((s) => Math.min(99, s + 3))
      showToast('✨ Auto-Fix: Kafka DLQ retry policy wired!')
    }
  }

  function handleRunCriticScan() {
    setIsScanning(true)
    showToast('AI Critic scanning architecture against Well-Architected Framework...')
    setTimeout(() => {
      setIsScanning(false)
      const openCount = issues.filter((i) => !i.fixed).length
      showToast(`✓ Scan complete: ${openCount} architectural recommendations identified.`)
    }, 1600)
  }

  function handleAddCustomNode() {
    if (!newNodeName.trim()) return
    const id = 'custom-' + Date.now().toString(36)
    const node = {
      id, name: newNodeName, category: newNodeCategory,
      tier: 'Custom Tier', specs: 'Auto-scaled Cloud Resource',
      status: 'healthy',
      x: 350 + Math.floor(Math.random() * 120),
      y: 100 + Math.floor(Math.random() * 150),
      icon: newNodeCategory === 'Database' ? 'database' : newNodeCategory === 'Compute' ? 'cpu' : 'server',
      latency: '10ms',
    }
    setNodes((prev) => [...prev, node])
    if (nodes.length > 0) {
      setEdges((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: id, label: 'TCP/TLS' }])
    }
    setSelectedNodeId(id)
    setNewNodeName('')
    setShowAddModal(false)
    showToast(`Added component "${newNodeName}"`)
  }

  function handleDeleteNode(id) {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id))
    if (selectedNodeId === id) setSelectedNodeId(null)
  }

  function handleSignOut() {
    logoutUser()
    navigate('/login')
  }

  const selectedNode  = nodes.find((n) => n.id === selectedNodeId)
  const openIssueCount = issues.filter((i) => !i.fixed).length

  const iconFor = (icon) => {
    if (icon === 'database') return <DatabaseIcon className="h-3.5 w-3.5" />
    if (icon === 'cpu')      return <CpuIcon      className="h-3.5 w-3.5" />
    if (icon === 'cloud')    return <CloudIcon     className="h-3.5 w-3.5" />
    if (icon === 'layers')   return <LayersIcon    className="h-3.5 w-3.5" />
    if (icon === 'zap')      return <ZapIcon       className="h-3.5 w-3.5" />
    return <ServerIcon className="h-3.5 w-3.5" />
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-ink selection:bg-sky/20">

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-[#0B0F1A]/90 px-5 backdrop-blur-md">

        {/* Left: Brand + Cloud Status + Architecture Switcher */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky/40 bg-sky/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
                <rect x="1" y="1" width="24" height="24" rx="7" stroke="#38BDF8" strokeWidth="1.6" />
                <circle cx="8.5" cy="9"   r="2.2" fill="#38BDF8" />
                <circle cx="18"  cy="8"   r="1.8" fill="#818CF8" />
                <circle cx="9"   cy="18"  r="1.8" fill="#818CF8" />
                <circle cx="18"  cy="17.5" r="2.2" fill="#38BDF8" />
                <line x1="8.5" y1="9"   x2="18" y2="8"    stroke="#38BDF8" strokeWidth="1"   opacity="0.7" />
                <line x1="8.5" y1="9"   x2="9"  y2="18"   stroke="#38BDF8" strokeWidth="1"   opacity="0.7" />
                <line x1="18"  y1="17.5" x2="18" y2="8"   stroke="#818CF8" strokeWidth="1"   opacity="0.7" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-tight text-ink">ArchCritic</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-sky">Studio v2.4</span>
            </div>
          </Link>

          <div className="h-4 w-px bg-border" />

          {/* Cloud Connection Badge */}
          {cloudConfig?.status === 'connected' ? (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 rounded-lg border border-sky/30 bg-sky/10 px-2.5 py-1 text-xs text-sky transition-colors hover:bg-sky/20"
              title="Click to view AWS connection details"
            >
              <span className="h-2 w-2 rounded-full bg-sky animate-pulse" />
              <span className="font-mono text-[11px] font-semibold">AWS {cloudConfig.region}</span>
              <span className="hidden md:inline font-mono text-[10px] text-sky/70">({cloudConfig.accountId})</span>
            </button>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="font-display text-[11px] font-semibold">Cloud Disconnected</span>
              <span className="hidden md:inline font-mono text-[10px] text-amber-300/80">• Connect</span>
            </button>
          )}

          {/* Architecture Switcher */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[11px] text-muted">Architecture:</span>
            <select
              value={
                activeProjectTitle.includes('E-Commerce') ? 'ecommerce' :
                activeProjectTitle.includes('RAG') ? 'rag' :
                activeProjectTitle.includes('Blank') ? 'blank' :
                activeProjectTitle.includes('Live AWS') ? 'live' : ''
              }
              onChange={(e) => {
                const val = e.target.value
                if (val === 'ecommerce') handleSelectTemplate('ecommerce')
                else if (val === 'rag') handleSelectTemplate('rag')
                else if (val === 'blank') handleStartBlankCanvas()
                else if (val === 'connect') setShowConnectModal(true)
                else if (val === 'import') setShowImportModal(true)
              }}
              className="rounded-lg border border-border bg-white/[0.04] px-2.5 py-1 font-display text-xs font-medium text-ink transition-colors hover:bg-white/[0.07] focus:border-sky/40 focus:outline-none"
            >
              <option value="" disabled className="bg-[#0B0F1A] text-muted">
                {activeProjectTitle || 'Choose Architecture...'}
              </option>
              <option value="ecommerce" className="bg-[#0B0F1A] text-ink">Demo: E-Commerce (AWS + K8s)</option>
              <option value="rag" className="bg-[#0B0F1A] text-ink">Demo: Generative AI RAG Pipeline</option>
              {cloudConfig?.status === 'connected' && (
                <option value="live" className="bg-[#0B0F1A] text-ink">Live: AWS Discovered Stack</option>
              )}
              <option value="blank" className="bg-[#0B0F1A] text-ink">Custom: Blank Canvas</option>
              <option value="connect" className="bg-[#0B0F1A] text-sky">+ Connect AWS Cloud...</option>
              <option value="import" className="bg-[#0B0F1A] text-sky">+ Import Terraform / IaC...</option>
            </select>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="hidden items-center gap-1 rounded-xl border border-border bg-white/[0.02] p-1 md:flex">
          {[
            { key: 'canvas',    label: 'Canvas Studio',    icon: <LayersIcon    className="h-3.5 w-3.5" /> },
            { key: 'critic',    label: 'AI Critic',        icon: <ShieldCheckIcon className="h-3.5 w-3.5" />, badge: openIssueCount },
            { key: 'terraform', label: 'Terraform IaC',    icon: <CodeIcon      className="h-3.5 w-3.5" /> },
            { key: 'cost',      label: 'Cost & Sizing',    icon: <DollarIcon    className="h-3.5 w-3.5" /> },
          ].map(({ key, label, icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                activeTab === key
                  ? 'bg-sky text-slate-950 font-bold shadow-sm'
                  : 'text-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              {icon}
              {label}
              {badge > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === key ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-red-500/20 text-red-400'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-sky/30 bg-sky/5 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky" />
            </span>
            <span className="font-mono text-xs font-bold text-sky">{healthScore}/100</span>
            <span className="hidden text-[11px] text-muted sm:inline">Health</span>
          </div>

          {/* AI Copilot Sidecar Button (Antigravity Mode) */}
          <button
            onClick={() => setShowAiSidecar((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-display text-xs font-bold transition-all ${
              showAiSidecar
                ? 'border-sky bg-sky text-slate-950 shadow-glow scale-105'
                : 'border-sky/50 bg-sky/15 text-sky-200 hover:bg-sky hover:text-slate-950 hover:shadow-glow'
            }`}
            title="Toggle Antigravity AI Copilot"
          >
            <SparklesIcon className={`h-3.5 w-3.5 ${showAiSidecar ? 'animate-pulse' : ''}`} />
            <span>AI Copilot</span>
            <span className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold ${
              showAiSidecar ? 'bg-slate-950 text-sky' : 'bg-black/40 text-sky-200 border border-sky/30'
            }`}>
              Sidecar
            </span>
          </button>

          {/* AI Scan button */}
          <button
            onClick={handleRunCriticScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 rounded-xl border border-sky/40 bg-sky/15 px-3 py-1.5 font-display text-xs font-bold text-sky-200 transition-all hover:bg-sky hover:text-slate-950 hover:shadow-glow active:scale-95 disabled:opacity-50"
          >
            <SparklesIcon className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Auditing...' : 'Run AI Critic'}
          </button>

          {/* Real User Profile Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfile((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky to-blue-600 text-xs font-black text-slate-950 shadow-glow hover:opacity-90 transition-opacity"
              title={`${user?.name} (${user?.email})`}
            >
              {user?.avatarInitial || 'U'}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div
                className="absolute right-0 top-10 z-50 w-56 animate-slideUp rounded-2xl border border-border bg-[#0E131E] p-2 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-border px-3 py-2.5 mb-1">
                  <p className="font-display text-sm font-semibold text-ink">{user?.name}</p>
                  <p className="font-mono text-[10px] text-muted truncate">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-sky/10 border border-sky/20 px-2 py-0.5 font-mono text-[9px] text-sky">
                    {user?.plan || 'Team Pro'}
                  </span>
                </div>

                <button
                  onClick={() => { setShowProfile(false); setShowSettingsModal(true) }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-display text-xs text-muted hover:bg-white/[0.05] hover:text-ink transition-colors"
                >
                  <span>Settings</span>
                  <span className="font-mono text-[10px] text-sky">Profile & Cloud</span>
                </button>

                <button
                  onClick={() => { setShowProfile(false); setShowBillingModal(true) }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-display text-xs text-muted hover:bg-white/[0.05] hover:text-ink transition-colors"
                >
                  <span>Billing</span>
                  <span className="font-mono text-[10px] text-muted/70">Plan & Usage</span>
                </button>

                <button
                  onClick={() => { setShowProfile(false); setShowHelpModal(true) }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-display text-xs text-muted hover:bg-white/[0.05] hover:text-ink transition-colors"
                >
                  <span>Help & Docs</span>
                  <span className="font-mono text-[10px] text-muted/70">Guide</span>
                </button>

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-3 py-2 text-left font-display text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Toast notification ────────────────────────────────────────────── */}
      {scanNotice && (
        <div className="absolute top-16 left-1/2 z-50 -translate-x-1/2 animate-slideUp rounded-full border border-sky/40 bg-[#0E131E]/95 px-5 py-2 shadow-glow backdrop-blur-md">
          <p className="flex items-center gap-2 font-mono text-xs text-sky">
            <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
            {scanNotice}
          </p>
        </div>
      )}

      {/* ── Main Body ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden" onClick={() => setShowProfile(false)}>

        {/* ── Left Palette ──────────────────────────────────────────────── */}
        <aside className="z-20 flex w-64 shrink-0 flex-col border-r border-border bg-[#090D15]/95">
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted">
              Architecture Nodes
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded-lg border border-sky/40 bg-sky/10 px-2.5 py-1 font-mono text-[11px] font-bold text-sky-300 transition-all hover:bg-sky hover:text-slate-950"
            >
              <PlusIcon className="h-3 w-3" /> Add
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Node list */}
            {nodes.length > 0 ? (
              <div className="space-y-1.5">
                {nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId
                  return (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNodeId(node.id); setActiveTab('canvas') }}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                        isSelected
                          ? 'border-sky bg-sky/10 shadow-[0_0_12px_rgba(56,189,248,0.12)]'
                          : 'border-border/60 bg-white/[0.02] hover:border-border hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className={`shrink-0 rounded-lg p-1.5 ${
                          node.status === 'critical' ? 'bg-red-500/10 text-red-400' :
                          node.status === 'warning'  ? 'bg-amber-500/10 text-amber-400' :
                          'bg-sky/10 text-sky'
                        }`}>
                          {iconFor(node.icon)}
                        </span>
                        <div className="overflow-hidden">
                          <p className="truncate font-display text-xs font-semibold text-ink">{node.name}</p>
                          <p className="truncate font-mono text-[10px] text-muted">{node.tier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {node.status === 'critical' && <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />}
                        {node.status === 'warning'  && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-400 transition-opacity"
                          title="Delete"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-center">
                <p className="font-display text-xs font-medium text-ink">No components yet</p>
                <p className="text-[10px] text-muted mt-1 leading-relaxed">
                  Connect cloud, load a template, or click "+ Add" above.
                </p>
              </div>
            )}

            {/* Cloud Catalog quick-add */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted/60">Cloud Catalog</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Redis Cache',  cat: 'Database', icon: 'database' },
                  { name: 'AWS Lambda',   cat: 'Compute',  icon: 'cpu'      },
                  { name: 'RabbitMQ',     cat: 'Streaming',icon: 'layers'   },
                  { name: 'Envoy Proxy',  cat: 'Gateway',  icon: 'server'   },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const id = 'catalog-' + Date.now().toString(36)
                      const n = {
                        id, name: item.name, category: item.cat,
                        tier: 'Managed Cloud', specs: 'Auto-scaled Cluster',
                        status: 'healthy',
                        x: 250 + (nodes.length * 40) % 300,
                        y: 100 + (nodes.length * 30) % 200,
                        icon: item.icon, latency: '5ms',
                      }
                      setNodes((prev) => [...prev, n])
                      if (nodes.length > 0) setEdges((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: id, label: 'Internal' }])
                      setSelectedNodeId(id)
                      if (!activeProjectTitle) setActiveProjectTitle('Custom Architecture')
                    }}
                    className="flex flex-col items-start gap-1 rounded-xl border border-border/60 bg-white/[0.02] p-2 text-left transition-all hover:border-sky/40 hover:bg-sky/5"
                  >
                    <span className="font-display text-[11px] font-semibold text-ink">+ {item.name}</span>
                    <span className="font-mono text-[9px] text-muted">{item.cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky/40 bg-sky/15 px-3 py-2 font-display text-xs font-bold text-sky-200 hover:bg-sky hover:text-slate-950 transition-all shadow-sm"
              >
                <CloudIcon className="h-3.5 w-3.5" /> Connect AWS Account
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.04] px-3 py-2 font-display text-xs font-semibold text-ink hover:text-sky hover:border-sky/40 transition-colors"
              >
                <CodeIcon className="h-3.5 w-3.5" /> Import Terraform (.tf)
              </button>
            </div>
          </div>
        </aside>

        {/* ── Central Viewport ──────────────────────────────────────────── */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-bg">

          {/* Tab: Canvas Studio */}
          {activeTab === 'canvas' && (
            <div className="relative flex-1 overflow-hidden">
              {/* Blueprint grid */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* IF NODES IS EMPTY: Display the Workspace Launchpad */}
              {nodes.length === 0 ? (
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-center overflow-y-auto">
                  <div className="max-w-3xl space-y-6 animate-fadeIn py-8">
                    {/* Welcome Header */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-3.5 py-1 text-xs text-sky font-mono">
                        <SparklesIcon className="h-3.5 w-3.5" /> Ready to review cloud architecture
                      </div>
                      <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                        Welcome to ArchCritic, {user?.name}!
                      </h2>
                      <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
                        Nothing is loaded yet. Connect your live AWS infrastructure, import an existing Terraform script, or explore a pre-built reference architecture below.
                      </p>
                    </div>

                    {/* 4 Logical Setup Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      {/* Option 1: Live AWS Connect */}
                      <div
                        onClick={() => setShowConnectModal(true)}
                        className="group cursor-pointer rounded-2xl border border-sky/40 bg-gradient-to-br from-sky/10 via-white/[0.02] to-transparent p-5 transition-all hover:border-sky hover:shadow-glow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/20 text-sky">
                            <CloudIcon className="h-5 w-5" />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-sky uppercase tracking-wider bg-sky/10 px-2 py-0.5 rounded-full border border-sky/30">
                            Recommended
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-ink mt-3 group-hover:text-sky transition-colors">
                          1. Connect Live Cloud (AWS)
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Scan your AWS account in real-time. Discovers VPCs, ECS/EKS microservices, Aurora databases, and routes directly onto your canvas.
                        </p>
                        <div className="mt-4 flex items-center gap-1 font-display text-xs font-semibold text-sky">
                          Connect AWS Account →
                        </div>
                      </div>

                      {/* Option 2: Import IaC */}
                      <div
                        onClick={() => setShowImportModal(true)}
                        className="group cursor-pointer rounded-2xl border border-border bg-white/[0.02] p-5 transition-all hover:border-sky/40 hover:bg-white/[0.04]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <CodeIcon className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-base font-bold text-ink mt-3 group-hover:text-sky transition-colors">
                          2. Import Terraform / IaC
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Paste your existing Terraform (.tf) or CloudFormation code. ArchCritic parses resource dependencies and builds the interactive topology.
                        </p>
                        <div className="mt-4 flex items-center gap-1 font-display text-xs font-semibold text-purple-400 group-hover:text-sky">
                          Import Architecture Code →
                        </div>
                      </div>

                      {/* Option 3: Pre-built Demos */}
                      <div className="rounded-2xl border border-border bg-white/[0.02] p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <LayersIcon className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-base font-bold text-ink mt-3">
                          3. Explore Sample Architectures
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Test AI Critic audits, auto-fix remediations, and cost projections using ready-made enterprise stacks.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSelectTemplate('ecommerce')}
                            className="rounded-lg border border-border bg-white/[0.04] px-2.5 py-1 text-xs font-display font-medium text-ink hover:border-sky/40 hover:text-sky transition-colors"
                          >
                            E-Commerce (AWS+K8s)
                          </button>
                          <button
                            onClick={() => handleSelectTemplate('rag')}
                            className="rounded-lg border border-border bg-white/[0.04] px-2.5 py-1 text-xs font-display font-medium text-ink hover:border-sky/40 hover:text-sky transition-colors"
                          >
                            GenAI RAG Pipeline
                          </button>
                        </div>
                      </div>

                      {/* Option 4: Blank Canvas */}
                      <div
                        onClick={handleStartBlankCanvas}
                        className="group cursor-pointer rounded-2xl border border-border bg-white/[0.02] p-5 transition-all hover:border-sky/40 hover:bg-white/[0.04]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <PlusIcon className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-base font-bold text-ink mt-3 group-hover:text-sky transition-colors">
                          4. Start from Blank Canvas
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Design custom microservices from scratch. Add Gateways, Compute, Databases, and Streaming queues manually.
                        </p>
                        <div className="mt-4 flex items-center gap-1 font-display text-xs font-semibold text-amber-400 group-hover:text-sky">
                          Open Clean Canvas →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Scalable canvas when nodes exist */
                <>
                  {/* Zoom controls */}
                  <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 rounded-xl border border-border bg-[#0B0F1A]/90 p-1.5 backdrop-blur-md">
                    <button onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))} className="rounded-lg p-1.5 text-muted hover:bg-white/[0.06] hover:text-ink" title="Zoom In"><ZoomInIcon className="h-4 w-4" /></button>
                    <span className="font-mono text-xs text-muted px-1">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))} className="rounded-lg p-1.5 text-muted hover:bg-white/[0.06] hover:text-ink" title="Zoom Out"><ZoomOutIcon className="h-4 w-4" /></button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <button onClick={() => setZoomLevel(1)} className="rounded-lg px-2 py-1 font-mono text-[10px] text-muted hover:bg-white/[0.06] hover:text-ink">Reset</button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <button onClick={() => { setNodes([]); setEdges([]); setSelectedNodeId(null); setActiveProjectTitle('') }} className="rounded-lg px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/10">Clear Canvas</button>
                  </div>

                  <div
                    className="absolute inset-0 transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: '20% 30%' }}
                  >
                    {/* SVG edges */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none">
                      <defs>
                        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%"   stopColor="#38BDF8" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.85" />
                        </linearGradient>
                      </defs>
                      {edges.map((edge, idx) => {
                        const from = nodes.find((n) => n.id === edge.from)
                        const to   = nodes.find((n) => n.id === edge.to)
                        if (!from || !to) return null
                        const x1 = from.x + 95, y1 = from.y + 45
                        const x2 = to.x   + 95, y2 = to.y   + 45
                        const midX = (x1 + x2) / 2
                        const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
                        return (
                          <g key={idx}>
                            <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                            <path d={d} fill="none" stroke="url(#flowGrad)" strokeWidth="2" strokeDasharray="6 10" className="animate-pulse" />
                          </g>
                        )
                      })}
                    </svg>

                    {/* Node cards */}
                    {nodes.map((node) => {
                      const isSel      = node.id === selectedNodeId
                      const isCritical = node.status === 'critical'
                      const isWarning  = node.status === 'warning'
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          style={{ left: `${node.x}px`, top: `${node.y}px` }}
                          className={`absolute w-48 cursor-pointer select-none rounded-2xl border p-3.5 transition-all duration-150 ${
                            isSel      ? 'border-sky bg-[#0D1525] shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-sky' :
                            isCritical ? 'border-red-500/50 bg-[#160D12] shadow-[0_0_18px_rgba(239,68,68,0.18)]' :
                            isWarning  ? 'border-amber-500/40 bg-[#16130B]' :
                            'border-border/80 bg-[#0C1017]/90 hover:border-border hover:bg-[#10141D]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted">{node.category}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[9px] text-sky">{node.latency}</span>
                              <span className={`h-2 w-2 rounded-full ${
                                isCritical ? 'bg-red-400 animate-ping' :
                                isWarning  ? 'bg-amber-400' :
                                'bg-sky'
                              }`} />
                            </div>
                          </div>
                          <div className="mt-2">
                            <h4 className="font-display text-xs font-bold text-ink leading-tight">{node.name}</h4>
                            <p className="mt-1 text-[10px] text-muted line-clamp-1">{node.specs}</p>
                          </div>
                          {node.statusMsg && (
                            <div className={`mt-2.5 rounded-lg px-2 py-1 font-mono text-[9px] leading-tight border ${
                              isCritical
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              ⚠ {node.statusMsg}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: AI Critic */}
          {activeTab === 'critic' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2.5">
                    <ShieldCheckIcon className="h-6 w-6 text-sky" />
                    AI Architecture Critic
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Automated review against AWS Well-Architected Framework: Reliability, Security, Cost, Performance.
                  </p>
                </div>
                <button
                  onClick={handleRunCriticScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-display text-xs font-bold text-slate-950 transition-all hover:bg-sky-dim shadow-glow active:scale-95 disabled:opacity-60"
                >
                  <RefreshCwIcon className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                  Re-evaluate
                </button>
              </div>

              {/* Pillar scorecards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Security & Auth',    score: '96%', grade: 'Optimal',   color: 'text-sky'       },
                  { label: 'Resilience & HA',    score: '88%', grade: '1 Action',  color: 'text-amber-400' },
                  { label: 'Cost Optimization',  score: '92%', grade: 'Optimal',   color: 'text-sky'       },
                  { label: 'Latency (P99)',       score: '95%', grade: '18ms P99',  color: 'text-accent'    },
                ].map((stat, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="font-mono text-xs text-muted">{stat.label}</p>
                    <p className={`mt-2 font-display text-3xl font-bold ${stat.color}`}>{stat.score}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted">{stat.grade}</p>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-ink">Diagnostic Findings ({issues.length})</h3>
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        issue.fixed          ? 'border-sky/30 bg-sky/5 opacity-70' :
                        issue.severity === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                        'border-amber-500/40 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold tracking-wider ${
                              issue.fixed ? 'bg-sky/20 text-sky' :
                              issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {issue.fixed ? 'Resolved' : issue.severity}
                            </span>
                            <h4 className="font-display text-sm font-semibold text-ink">{issue.title}</h4>
                          </div>
                          <p className="text-sm text-ink/80 leading-relaxed">{issue.description}</p>
                          <div className="rounded-xl border border-border/60 bg-black/30 p-3 font-mono text-xs text-muted">
                            <strong className="text-ink">Impact: </strong>{issue.impact}
                          </div>
                          <p className="text-xs text-sky"><strong>Recommendation:</strong> {issue.recommendation}</p>
                        </div>
                        <div className="shrink-0">
                          {issue.fixed ? (
                            <div className="flex items-center gap-1.5 rounded-xl border border-sky/40 bg-sky/10 px-3.5 py-2 font-mono text-xs text-sky">
                              <CheckIcon className="h-4 w-4" /> Auto-Fixed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAutoFix(issue.id)}
                              className="flex items-center gap-2 rounded-xl bg-sky px-4 py-2 font-display text-xs font-bold text-slate-950 shadow-glow transition-all hover:bg-sky-dim active:scale-95"
                            >
                              <SparklesIcon className="h-3.5 w-3.5" /> 1-Click Auto-Fix
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-sky/30 bg-sky/5 p-8 text-center">
                    <CheckIcon className="h-8 w-8 text-sky mx-auto" />
                    <h4 className="font-display text-base font-bold text-ink mt-2">Zero Vulnerabilities Detected</h4>
                    <p className="text-xs text-muted mt-1">Current architecture complies with all standard security and reliability policies.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Terraform IaC */}
          {activeTab === 'terraform' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2.5">
                    <CodeIcon className="h-6 w-6 text-sky" /> Generated Terraform Blueprint
                  </h2>
                  <p className="mt-1 text-sm text-muted">Production-grade HCL synced with your {nodes.length} canvas components.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => { navigator.clipboard.writeText(generateTerraformHCL(nodes)); setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000) }}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-white/[0.04] px-4 py-2 font-display text-xs font-medium text-ink hover:bg-white/[0.08]"
                  >
                    {copyFeedback ? <><CheckIcon className="h-3.5 w-3.5 text-sky" /><span className="text-sky">Copied!</span></> : <><CopyIcon className="h-3.5 w-3.5 text-muted" />Copy</>}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([generateTerraformHCL(nodes)], { type: 'text/plain' })
                      const url  = URL.createObjectURL(blob)
                      const a = document.createElement('a'); a.href = url; a.download = 'main.tf'; a.click()
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-sky px-4 py-2 font-display text-xs font-bold text-slate-950 hover:bg-sky-dim hover:shadow-glow transition-all"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" /> Download main.tf
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-[#05070A] p-5 shadow-2xl overflow-x-auto">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4 font-mono text-xs text-muted">
                  <span>main.tf — Terraform AWS Provider v5.0</span>
                  <span className="text-sky">Synced with {nodes.length} canvas nodes</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-ink/90">
                  <code>{generateTerraformHCL(nodes)}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Tab: Cost & Sizing */}
          {activeTab === 'cost' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="border-b border-border pb-5">
                <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2.5">
                  <DollarIcon className="h-6 w-6 text-sky" /> Monthly Cloud Cost & Sizing
                </h2>
                <p className="mt-1 text-sm text-muted">AWS on-demand vs. 1-year Savings Plans projection for all canvas components.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: 'On-Demand Cost',           value: `$${(nodes.length * 190) || 0} / mo`, sub: 'Standard on-demand rate', accent: false },
                  { label: 'With Critic Optimization', value: `$${Math.round(nodes.length * 145) || 0} / mo`, sub: `Save ~$${nodes.length * 45}/mo with Graviton 3`, accent: true },
                  { label: 'Annual Cloud Run-rate',     value: `$${Math.round(nodes.length * 145 * 12) || 0} / yr`, sub: 'Approved budget band', accent: false },
                ].map((c, i) => (
                  <div key={i} className={`rounded-2xl border p-5 ${c.accent ? 'border-sky/40 bg-sky/5' : 'border-border bg-surface'}`}>
                    <p className={`font-mono text-xs ${c.accent ? 'text-sky' : 'text-muted'}`}>{c.label}</p>
                    <p className={`mt-2 font-display text-3xl font-bold ${c.accent ? 'text-sky' : 'text-ink'}`}>{c.value}</p>
                    <p className={`mt-1 font-mono text-[10px] ${c.accent ? 'text-sky/70' : 'text-muted'}`}>{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-[#05070A] overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-border bg-white/[0.02] text-muted">
                    <tr>
                      <th className="p-3.5">Component</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Sizing</th>
                      <th className="p-3.5 text-right">Est. Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-ink/80">
                    {nodes.map((n) => (
                      <tr key={n.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-semibold text-ink">{n.name}</td>
                        <td className="p-3.5 text-muted">{n.category}</td>
                        <td className="p-3.5">{n.specs}</td>
                        <td className="p-3.5 text-right font-semibold text-sky">
                          {n.category === 'Database' ? '$380 / mo' :
                           n.category === 'Streaming' ? '$310 / mo' :
                           n.category === 'Compute'   ? '$240 / mo' : '$65 / mo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* ── Right Inspector ────────────────────────────────────────────── */}
        <aside className="z-20 flex w-80 shrink-0 flex-col border-l border-border bg-[#090D15]/95">
          <div className="border-b border-border/80 px-4 py-3">
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted">Node Inspector</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {selectedNode ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky/10 border border-sky/20 px-2 py-0.5 font-mono text-[10px] text-sky">{selectedNode.category}</span>
                    <span className="font-mono text-xs text-muted">ID: {selectedNode.id}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink mt-2">{selectedNode.name}</h3>
                  <p className="font-mono text-xs text-muted">{selectedNode.tier}</p>
                </div>

                <div className="space-y-2.5 rounded-xl border border-border bg-white/[0.02] p-3.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Configuration:</span>
                    <span className="text-ink font-medium text-right max-w-[55%]">{selectedNode.specs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Avg Latency:</span>
                    <span className="font-semibold text-sky">{selectedNode.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Health Status:</span>
                    <span className={`font-semibold capitalize ${
                      selectedNode.status === 'critical' ? 'text-red-400' :
                      selectedNode.status === 'warning'  ? 'text-amber-400' :
                      'text-sky'
                    }`}>{selectedNode.status}</span>
                  </div>
                </div>

                {/* AI assessment */}
                <div className="rounded-xl border border-sky/20 bg-sky/5 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-sky font-display text-xs font-semibold">
                    <SparklesIcon className="h-3.5 w-3.5" /> AI Analysis
                  </div>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    {selectedNode.status === 'critical'
                      ? 'Direct database calls detected — lack of connection pooling. High risk under 1,000+ rps.'
                      : selectedNode.status === 'warning'
                      ? 'Requires retry policy or DLQ to safeguard transaction durability across partitions.'
                      : 'Resource is configured per AWS Well-Architected Framework guidelines. No critical issues found.'}
                  </p>
                </div>

                {/* Issues related to this node */}
                {issues.filter((i) => i.nodeId === selectedNode.id && !i.fixed).length > 0 && (
                  <div className="space-y-2">
                    <p className="font-display text-[11px] font-semibold text-muted uppercase tracking-wider">Related Issues</p>
                    {issues.filter((i) => i.nodeId === selectedNode.id && !i.fixed).map((issue) => (
                      <div key={issue.id} className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                        <p className="font-display text-xs font-semibold text-red-400">{issue.title}</p>
                        <button
                          onClick={() => { handleAutoFix(issue.id); setActiveTab('critic') }}
                          className="flex items-center gap-1.5 rounded-lg bg-sky px-3 py-1.5 font-display text-[11px] font-bold text-slate-950 hover:bg-sky-dim hover:shadow-glow transition-all"
                        >
                          <SparklesIcon className="h-3 w-3" /> Auto-Fix
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertTriangleIcon className="h-8 w-8 text-border" />
                <p className="text-xs text-muted">Select a node on the canvas to inspect its telemetry and AI recommendations.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Add Node Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md animate-slideUp rounded-2xl border border-border bg-[#0E131E] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-ink">Add Architecture Component</h3>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-muted block mb-1">Component Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe Webhook Listener (Go)"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/[0.04] px-3.5 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-sky/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted block mb-1">Category Tier</label>
                <select
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#0B0F1A] px-3.5 py-2 text-sm text-ink focus:border-sky/40 focus:outline-none"
                >
                  <option value="Compute">Compute (ECS / Lambda / K8s)</option>
                  <option value="Gateway">Gateway & Ingress</option>
                  <option value="Database">Database & Cache</option>
                  <option value="Streaming">Event Streaming (Kafka / SQS)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setShowAddModal(false)} className="rounded-xl border border-border px-4 py-2 font-display text-xs text-muted hover:text-ink hover:bg-white/[0.04]">Cancel</button>
              <button onClick={handleAddCustomNode} className="rounded-xl bg-sky px-4 py-2 font-display text-xs font-bold text-slate-950 hover:bg-sky-dim hover:shadow-glow transition-all">Create Node</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ──────────────────────────────────────────────── */}
      {showSettingsModal && (
        <SettingsModal
          user={user}
          cloudConfig={cloudConfig}
          onClose={() => setShowSettingsModal(false)}
          onUserUpdated={(updated) => setUser(updated)}
          onDisconnectCloud={handleDisconnectCloud}
        />
      )}

      {/* ── Billing Modal ───────────────────────────────────────────────── */}
      {showBillingModal && (
        <BillingModal
          user={user}
          onClose={() => setShowBillingModal(false)}
        />
      )}

      {/* ── Help & Documentation Modal ──────────────────────────────────── */}
      {showHelpModal && (
        <HelpModal
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {/* ── Connect Cloud Modal ─────────────────────────────────────────── */}
      {showConnectModal && (
        <ConnectCloudModal
          onClose={() => setShowConnectModal(false)}
          onConnectSuccess={handleConnectCloudSuccess}
        />
      )}

      {/* ── Floating Copilot Trigger ────────────────────────────────────── */}
      {!showAiSidecar && (
        <button
          onClick={() => setShowAiSidecar(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl border border-sky/50 bg-[#0C121E]/95 px-4 py-2.5 font-display text-xs font-bold text-sky-200 shadow-glow backdrop-blur-md transition-all hover:scale-105 hover:bg-sky hover:text-slate-950 hover:border-sky group"
        >
          <SparklesIcon className="h-4 w-4 animate-spin text-sky group-hover:text-slate-950" />
          <span>Ask AI Architect</span>
          <span className="rounded-full bg-sky/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky group-hover:bg-slate-950/20 group-hover:text-slate-950">
            Copilot ↵
          </span>
        </button>
      )}

      {/* ── Antigravity AI Copilot Sidecar Panel ───────────────────────── */}
      <AiSidecar
        isOpen={showAiSidecar}
        onClose={() => setShowAiSidecar(false)}
        nodes={nodes}
        setNodes={setNodes}
        edges={edges}
        setEdges={setEdges}
        issues={issues}
        setIssues={setIssues}
        healthScore={healthScore}
        setHealthScore={setHealthScore}
        onAutoFix={handleAutoFix}
        showToast={showToast}
        user={user}
      />

    </div>
  )
}
