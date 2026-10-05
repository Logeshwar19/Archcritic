import { useState, useRef, useEffect } from 'react'
import { SparklesIcon, SendIcon, CheckIcon, CpuIcon, DatabaseIcon, CloudIcon, LayersIcon } from './icons.jsx'
import { getStoredAiConfig, saveAiConfig, callRealAiModel } from '../utils/ai.js'

export default function AiSidecar({
  isOpen,
  onClose,
  nodes,
  setNodes,
  edges,
  setEdges,
  issues,
  setIssues,
  healthScore,
  setHealthScore,
  onAutoFix,
  showToast,
  user,
}) {
  const [aiConfig, setAiConfig] = useState(() => getStoredAiConfig())
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [tempKey, setTempKey] = useState('')
  const [tempProvider, setTempProvider] = useState('gemini')

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Architect'}! I am your **Autonomous Cloud Copilot**.\n\nYou can ask me any question in English or Tanglish, or directly order me to automate changes on your canvas:\n- ⚡ *"Fix database connection bottleneck"*\n- 🚀 *"Add Redis cache layer"*\n- 📦 *"Add S3 document storage lake"*\n- 🛡️ *"Scale Auth service to 5 replicas"*\n- 💰 *"How to optimize cloud costs?"*\n\n💡 *Tip: Click "Connect Real AI" above to add your free Google Gemini API key for unlimited live reasoning!*`,
      timestamp: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

  const SUGGESTED_PROMPTS = [
    '⚡ Auto-fix database connection risk',
    '🚀 Add Redis Cache layer',
    '📦 Add S3 Bucket Storage',
    '🛡️ Scale Auth service to 5 pods',
    '❓ Why is Aurora marked critical?',
    '💰 How to reduce monthly AWS cost?',
  ]

  function handleSaveKey(e) {
    e.preventDefault()
    saveAiConfig({ apiKey: tempKey, provider: tempProvider })
    setAiConfig({ apiKey: tempKey, provider: tempProvider })
    setShowKeyModal(false)
    showToast?.(`Connected to ${tempProvider === 'gemini' ? 'Google Gemini 1.5' : tempProvider}!`)
    setMessages((prev) => [
      ...prev,
      {
        id: 'key-set-' + Date.now(),
        sender: 'ai',
        text: `🎉 **Real AI Engine Connected (${tempProvider === 'gemini' ? 'Google Gemini 1.5 Flash' : tempProvider})!**\n\nYou can now ask me any complex question, ask for architecture trade-offs, speak in Tanglish/Tamil, or request custom canvas automations!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  async function handleSend(textToSend) {
    let query = (textToSend || input).trim()
    if (!query || isProcessing) return

    // Resolve number shortcuts (e.g. user types "1", "2")
    if (query === '1') query = 'Auto-fix database connection risk'
    else if (query === '2') query = 'Add Redis Cache layer'
    else if (query === '3') query = 'Add S3 Bucket Storage'
    else if (query === '4') query = 'Scale Auth service to 5 pods'
    else if (query === '5') query = 'Why is Aurora marked critical?'
    else if (query === '6') query = 'How to reduce monthly AWS cost?'

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsProcessing(true)

    // ─── OPTION A: If Real AI API Key is Configured ───────────────────────────
    if (aiConfig.apiKey) {
      try {
        setProcessStep(`🧠 Thinking with ${aiConfig.provider === 'gemini' ? 'Gemini 1.5 Flash' : aiConfig.provider}...`)
        const responseText = await callRealAiModel({
          prompt: query,
          currentNodes: nodes,
          issues,
          healthScore,
          user,
          history: messages,
        })

        // Check if real AI generated an action
        let actionExecuted = null
        if (responseText && responseText.includes('ACTION:')) {
          setProcessStep('⚡ Executing live architecture transformation...')
          const actionMatch = responseText.match(/ACTION:\s*(\{.*?\})/s)
          if (actionMatch) {
            try {
              const act = JSON.parse(actionMatch[1])
              if (act.tool === 'auto_fix_db' || act.tool === 'fix_database') {
                const proxyId = 'rds-proxy-' + Date.now().toString(36)
                const proxyNode = {
                  id: proxyId, name: 'AWS RDS Proxy (Pooler)', category: 'Database',
                  tier: 'Connection Management', specs: 'Max 10,000 Pooled Conns',
                  status: 'healthy', x: 600, y: 150, icon: 'database', latency: '3ms',
                }
                setNodes((prev) => [
                  ...prev.map((n) => (n.id === 'db' || n.id === 'aws-aurora') ? { ...n, status: 'healthy', statusMsg: 'Protected by AWS RDS Proxy' } : n),
                  proxyNode,
                ])
                setEdges((prev) => [
                  ...prev.filter((e) => !(e.to === 'db' || e.to === 'aws-aurora')),
                  { from: 'order', to: proxyId, label: 'Pool Socket' },
                  { from: 'aws-api', to: proxyId, label: 'Pool Socket' },
                  { from: proxyId, to: 'db', label: 'Pooled SQL' },
                ])
                setIssues((prev) => prev.map((i) => (i.nodeId === 'db' || i.nodeId === 'aws-aurora' ? { ...i, fixed: true } : i)))
                setHealthScore((h) => Math.min(99, h + 7))
                actionExecuted = { tool: 'architect.inject_rds_proxy', target: 'Aurora Database', healthBoost: '+7 Health' }
              } else if (act.tool === 'add_node') {
                const id = 'custom-' + Date.now().toString(36)
                const newNode = {
                  id, name: act.name || 'Cloud Service',
                  category: act.category || 'Compute',
                  tier: 'Managed Tier', specs: act.specs || 'Auto-scaled Cloud Resource',
                  status: 'healthy', x: 340 + Math.floor(Math.random() * 120), y: 120 + Math.floor(Math.random() * 120),
                  icon: act.category === 'Database' ? 'database' : act.category === 'Gateway' ? 'server' : 'cpu',
                  latency: '8ms',
                }
                setNodes((prev) => [...prev, newNode])
                if (nodes.length > 0) setEdges((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: id, label: 'Route' }])
                actionExecuted = { tool: 'architect.provision_node', target: act.name, healthBoost: '+2 Health' }
              } else if (act.tool === 'add_s3') {
                const s3Id = 's3-' + Date.now().toString(36)
                const s3Node = {
                  id: s3Id, name: 'Amazon S3 Lake', category: 'Database', tier: 'Object Storage Tier',
                  specs: 'KMS Encrypted • Multi-AZ', status: 'healthy', x: 740, y: 130, icon: 'database', latency: '22ms',
                }
                setNodes((prev) => [...prev, s3Node])
                actionExecuted = { tool: 'architect.create_s3_bucket', target: 'Amazon S3', healthBoost: '+3 Health' }
              }
            } catch (err) {
              console.error('Action parse error', err)
            }
          }
        }

        // Clean out ACTION block from user display
        const cleanedText = responseText.replace(/ACTION:\s*\{.*?\}/gs, '').trim()

        setMessages((prev) => [
          ...prev,
          {
            id: 'ai-' + Date.now(),
            sender: 'ai',
            action: actionExecuted,
            text: cleanedText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsProcessing(false)
        setProcessStep('')
        return
      } catch (err) {
        console.error('Real AI call failed', err)
        showToast?.('API Key Error: ' + err.message)
      }
    }

    // ─── OPTION B: Smart Local Engine (if no API Key or offline) ────────────
    const lower = query.toLowerCase()

    // 1. Auto-Fix Database / Critical Vulnerability
    if (
      lower.includes('fix db') ||
      lower.includes('fix database') ||
      lower.includes('aurora') && lower.includes('fix') ||
      lower.includes('bottleneck') ||
      lower.includes('vulnerability') ||
      lower.includes('auto-fix') ||
      lower.includes('solve critical') ||
      lower.includes('problem fix') ||
      lower.includes('pooler')
    ) {
      setProcessStep('🧠 Analyzing topology & database query patterns...')
      await new Promise((r) => setTimeout(r, 600))
      setProcessStep('⚡ Injecting AWS RDS Proxy connection pooler...')
      await new Promise((r) => setTimeout(r, 600))

      const proxyId = 'rds-proxy-' + Date.now().toString(36)
      const proxyNode = {
        id: proxyId,
        name: 'AWS RDS Proxy (Pooler)',
        category: 'Database',
        tier: 'Connection Management',
        specs: 'Max 10,000 Pooled Conns • Sub-millisecond',
        status: 'healthy',
        x: 600,
        y: 150,
        icon: 'database',
        latency: '3ms',
      }

      setNodes((prev) => [
        ...prev.map((n) =>
          n.id === 'db' || n.id === 'aws-aurora'
            ? { ...n, status: 'healthy', statusMsg: 'Protected by AWS RDS Proxy' }
            : n
        ),
        proxyNode,
      ])

      setEdges((prev) => [
        ...prev.filter((e) => !(e.to === 'db' || e.to === 'aws-aurora')),
        { from: 'order', to: proxyId, label: 'Pool Socket' },
        { from: 'aws-api', to: proxyId, label: 'Pool Socket' },
        { from: proxyId, to: 'db', label: 'Pooled SQL' },
        { from: proxyId, to: 'aws-aurora', label: 'Pooled SQL' },
      ])

      setIssues((prev) => prev.map((i) => (i.nodeId === 'db' || i.nodeId === 'aws-aurora' ? { ...i, fixed: true } : i)))
      setHealthScore((h) => Math.min(99, h + 7))
      showToast?.('✨ AI Copilot automated: Injected RDS Proxy. Health +7!')

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          action: {
            tool: 'architect.inject_connection_pooler',
            target: 'Aurora PostgreSQL 16',
            status: 'Applied to Canvas',
            healthBoost: '+7 Health',
          },
          text: `✅ **Automated Action Completed!**\n\nI have automatically refactored your architecture:\n1. **Injected \`AWS RDS Proxy\`** between your microservices and Aurora Database.\n2. **Eliminated Connection Starvation**: Direct queries are now multiplexed across persistent warm connection pools.\n3. **Health Score updated**: +7 pts (Database vulnerability cleared).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 2. Add Redis Cache
    else if (lower.includes('redis') || lower.includes('cache')) {
      setProcessStep('🧠 Identifying read-heavy data access paths...')
      await new Promise((r) => setTimeout(r, 600))
      setProcessStep('⚡ Provisioning ElastiCache Redis cluster...')
      await new Promise((r) => setTimeout(r, 600))

      const redisId = 'redis-' + Date.now().toString(36)
      const redisNode = {
        id: redisId,
        name: 'ElastiCache Redis 7',
        category: 'Database',
        tier: 'In-Memory Cache',
        specs: 'Cluster Mode • 99.4% Hit Rate • Sub-2ms',
        status: 'healthy',
        x: 520,
        y: 60,
        icon: 'database',
        latency: '2ms',
      }

      setNodes((prev) => [...prev, redisNode])
      if (nodes.length > 0) {
        const computeNode = nodes.find((n) => n.category === 'Compute') || nodes[0]
        setEdges((prev) => [...prev, { from: computeNode.id, to: redisId, label: 'Cache Lookup' }])
      }
      setHealthScore((h) => Math.min(100, h + 3))
      showToast?.('✨ AI Copilot automated: Added ElastiCache Redis!')

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          action: {
            tool: 'architect.provision_cache_layer',
            target: 'ElastiCache Redis 7',
            status: 'Active on Canvas',
            healthBoost: '+3 Health',
          },
          text: `🚀 **ElastiCache Redis Provisioned!**\n\nI added a Multi-AZ **Redis 7 In-Memory Cache** and connected it to your compute layer.\n- **P99 Read Latency:** Dropped from 30ms to **2ms**\n- **Database Load Reduction:** ~70% of reads offloaded from primary DB.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 3. Add S3 Storage
    else if (lower.includes('s3') || lower.includes('bucket') || lower.includes('storage') || lower.includes('lake')) {
      setProcessStep('🧠 Designing secure object storage tier...')
      await new Promise((r) => setTimeout(r, 600))
      setProcessStep('⚡ Provisioning S3 Bucket with KMS Encryption...')
      await new Promise((r) => setTimeout(r, 600))

      const s3Id = 's3-' + Date.now().toString(36)
      const s3Node = {
        id: s3Id,
        name: 'Amazon S3 Document Lake',
        category: 'Database',
        tier: 'Object Storage Tier',
        specs: 'SSE-KMS Encrypted • Intelligent Tiering',
        status: 'healthy',
        x: 740,
        y: 130,
        icon: 'database',
        latency: '22ms',
      }

      setNodes((prev) => [...prev, s3Node])
      if (nodes.length > 0) {
        setEdges((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: s3Id, label: 'Blob Upload' }])
      }
      showToast?.('✨ AI Copilot automated: Added Amazon S3 Bucket!')

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          action: {
            tool: 'architect.create_s3_bucket',
            target: 'S3 Document Lake',
            status: 'Created & Linked',
          },
          text: `📦 **Amazon S3 Object Storage Created!**\n\n- **Security:** Default Server-Side Encryption (AWS KMS)\n- **Lifecycle Rule:** Moves objects to S3 Glacier Flexible Retrieval after 90 days.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 4. Scale Auth Service Replicas
    else if (lower.includes('scale') || lower.includes('replica') || lower.includes('pod')) {
      setProcessStep('🧠 Calculating container capacity & HPA scaling target...')
      await new Promise((r) => setTimeout(r, 600))
      setProcessStep('⚡ Re-configuring Horizontal Pod Autoscaler (HPA)...')
      await new Promise((r) => setTimeout(r, 600))

      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'auth' || n.name.toLowerCase().includes('auth')
            ? { ...n, specs: 'Kubernetes Pods (5 Replicas • Auto-scale 2-10)', latency: '10ms', status: 'healthy' }
            : n
        )
      )
      setHealthScore((h) => Math.min(100, h + 2))
      showToast?.('✨ AI Copilot automated: Scaled Auth Service to 5 Replicas!')

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          action: {
            tool: 'architect.scale_hpa_replicas',
            target: 'Auth Service (Go)',
            status: '5 Pods Configured',
            healthBoost: '+2 Health',
          },
          text: `🛡️ **Horizontal Scaling Applied!**\n\n- Desired Pod Replicas: **5 Pods** (up from 3)\n- Max Concurrency: 15,000 requests/sec\n- Average Latency: Improved to **10ms**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 5. Cost Optimization
    else if (lower.includes('cost') || lower.includes('save') || lower.includes('bill') || lower.includes('reduce')) {
      setProcessStep('🧠 Auditing AWS instance types and reservation tiers...')
      await new Promise((r) => setTimeout(r, 700))

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `💰 **Cloud Cost Optimization Audit Report:**\n\nBased on your current canvas topology of ${nodes.length} components:\n\n1. **AWS Graviton 3 Migration:**\n   - Switch compute instances and ElastiCache to ARM-based \`r7g\` instances.\n   - **Monthly Savings:** ~$240 / month (20% lower price for 25% higher throughput).\n2. **Aurora Auto-Pause / Serverless v2:**\n   - Enable Aurora Serverless v2 scaling down to 0.5 ACU during off-peak hours.\n   - **Monthly Savings:** ~$100 / month.\n3. **Total Savings Potential:** **$340 / month ($4,080 / year)**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 6. Why is Aurora Critical
    else if (lower.includes('why') && (lower.includes('aurora') || lower.includes('critical') || lower.includes('db'))) {
      setProcessStep('🧠 Inspecting Well-Architected Framework Reliability Pillar...')
      await new Promise((r) => setTimeout(r, 600))

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `🔍 **Why Aurora PostgreSQL is Flagged as Critical:**\n\n- **Issue:** Your service layer opens direct, unpooled TCP database connections.\n- **Risk:** Under spike traffic (e.g. 5,000 concurrent users), Aurora memory will be exhausted with connection overhead, causing **HTTP 503 Outages**.\n- **Solution:** Inject **AWS RDS Proxy** to reuse warm connection pools.\n\n*Type "Fix it" and I will automate this change for you!*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 7. Friendly greetings
    else if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.includes('vanakkam')) {
      await new Promise((r) => setTimeout(r, 400))
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `Hello ${user?.name || 'Architect'}! 👋 How can I help you with your cloud architecture today?\n\nYou can:\n- Type **1** to Auto-fix the database connection risk\n- Type **2** to Add a Redis Cache layer\n- Type **3** to Add an S3 Bucket\n- Or click **"Connect Real AI"** above to paste a free Google Gemini key for real-time natural language answers!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 8. Custom Add
    else if (lower.startsWith('add ') || lower.startsWith('create ')) {
      const rawName = query.replace(/^(add|create)\s+/i, '').trim()
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
      const id = 'custom-' + Date.now().toString(36)
      const isDb = lower.includes('db') || lower.includes('database')
      const node = {
        id, name: formattedName, category: isDb ? 'Database' : 'Compute',
        tier: 'Custom Service', specs: 'Auto-scaled Cloud Microservice',
        status: 'healthy', x: 320 + Math.floor(Math.random() * 150), y: 100 + Math.floor(Math.random() * 140),
        icon: isDb ? 'database' : 'cpu', latency: '12ms',
      }
      setNodes((prev) => [...prev, node])
      if (nodes.length > 0) setEdges((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: id, label: 'Route' }])
      showToast?.(`Added "${formattedName}" to canvas!`)

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          action: { tool: 'architect.add_resource', target: formattedName, status: 'Added to Canvas' },
          text: `✅ **Added "${formattedName}" to your canvas!**\n\nI have wired it into your active architecture topology.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    // 9. Intelligent fallback
    else {
      await new Promise((r) => setTimeout(r, 600))
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `I understood your message: **"${query}"**.\n\nCurrently, I am in **Simulated Offline Mode**. To have me think dynamically and converse freely like a live LLM, please click **"Connect Real AI"** above and paste your **Free Google Gemini API Key** (or Groq/OpenAI).\n\nIn the meantime, you can try these instant commands:\n- **"Fix database"** → Injects RDS Proxy\n- **"Add Redis"** → Adds Cache layer\n- **"Add S3"** → Adds Object Storage\n- **"Scale Auth"** → Scales container replicas`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    setIsProcessing(false)
    setProcessStep('')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-sky/30 bg-[#080C14]/95 shadow-2xl backdrop-blur-2xl animate-slideLeft">
        {/* ── Sidecar Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border bg-[#0B0F19]/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-sky/40 bg-sky/10 text-sky shadow-glow">
              <SparklesIcon className="h-4 w-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-sm font-bold text-ink">AI Copilot</h3>
                <button
                  onClick={() => {
                    setTempKey(aiConfig.apiKey)
                    setTempProvider(aiConfig.provider)
                    setShowKeyModal(true)
                  }}
                  className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold transition-all hover:scale-105 ${
                    aiConfig.apiKey
                      ? 'bg-sky/20 text-sky border border-sky/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                  title="Click to configure Real AI API Key"
                >
                  {aiConfig.apiKey
                    ? `🟢 ${aiConfig.provider === 'gemini' ? 'Gemini 1.5' : aiConfig.provider}`
                    : '⚡ Connect Real AI'}
                </button>
              </div>
              <p className="font-mono text-[10px] text-muted">Autonomous Architecture Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setTempKey(aiConfig.apiKey)
                setTempProvider(aiConfig.provider)
                setShowKeyModal(true)
              }}
              className="rounded-lg p-1.5 text-muted hover:bg-white/[0.05] hover:text-sky transition-colors"
              title="AI Settings & API Key"
            >
              ⚙️
            </button>
            <button
              onClick={() => setMessages([])}
              className="rounded-lg p-1.5 font-mono text-[10px] text-muted hover:bg-white/[0.05] hover:text-ink transition-colors"
              title="Clear Chat"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:bg-white/[0.05] hover:text-ink transition-colors"
              title="Close Copilot"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Chat Messages Stream ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Sender tag */}
              <div className="mb-1 flex items-center gap-1.5 px-1 font-mono text-[10px] text-muted">
                {m.sender === 'user' ? (
                  <>
                    <span>{user?.name || 'You'}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sky font-semibold">✨ AI Architect</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky text-slate-950 font-bold shadow-sm rounded-tr-sm'
                    : 'border border-border bg-[#0E1422] text-ink/90 rounded-tl-sm shadow-md'
                }`}
              >
                {/* If AI executed an automated tool action */}
                {m.action && (
                  <div className="mb-2.5 rounded-xl border border-sky/30 bg-sky/10 p-2.5 font-mono text-[11px] text-sky">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <CheckIcon className="h-3.5 w-3.5" /> {m.action.tool}
                      </span>
                      {m.action.healthBoost && (
                        <span className="rounded bg-sky text-slate-950 px-1.5 py-0.5 text-[9px] font-black">
                          {m.action.healthBoost}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[10px] text-sky/80">
                      Target: <strong className="text-ink">{m.action.target}</strong>
                    </div>
                  </div>
                )}

                {/* Text content with markdown formatting */}
                <div className="whitespace-pre-wrap font-sans">
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {/* Live Thinking Indicator */}
          {isProcessing && (
            <div className="flex flex-col items-start animate-fadeIn">
              <div className="mb-1 px-1 font-mono text-[10px] text-sky">✨ AI Architect • Working</div>
              <div className="rounded-2xl rounded-tl-sm border border-sky/30 bg-[#0E1422] p-3 shadow-glow max-w-[85%]">
                <div className="flex items-center gap-2 text-sky">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky" />
                  </span>
                  <span className="font-mono text-xs animate-pulse">{processStep}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Prompt Chips ────────────────────────────────────────────── */}
        <div className="border-t border-border/80 bg-white/[0.01] p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted mb-2">Instant Automations</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p}
                disabled={isProcessing}
                onClick={() => handleSend(p)}
                className="rounded-lg border border-border/80 bg-white/[0.06] px-2.5 py-1 font-display text-[11px] font-semibold text-ink hover:border-sky hover:bg-sky/15 hover:text-sky transition-all disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input Box ─────────────────────────────────────────────────────── */}
        <div className="border-t border-border bg-[#0B0F19] p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              placeholder="Tell AI to automate canvas or ask a doubt..."
              className="flex-1 rounded-xl border border-border bg-black/40 px-3.5 py-2 font-display text-xs text-ink placeholder:text-muted/60 focus:border-sky focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky text-slate-950 font-bold transition-all hover:bg-sky-dim shadow-glow disabled:opacity-30 disabled:shadow-none"
              title="Send"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted font-mono">
            <span>Enter ↵ to execute</span>
            <span className="text-sky">
              {aiConfig.apiKey ? '🟢 Real LLM Active' : '🟡 Simulated Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Provider & API Key Modal ─────────────────────────────────────── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sky/40 bg-[#0B0F19] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky/40 bg-sky/10 text-sky">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">Connect Real AI Engine</h3>
                  <p className="text-xs text-muted">Use Google Gemini, Groq, or OpenAI for live intelligence</p>
                </div>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveKey} className="p-5 space-y-4">
              <div>
                <label className="block font-display text-xs font-semibold text-ink mb-1.5">
                  AI Model Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gemini', name: 'Google Gemini', sub: '100% Free', badge: 'Recommended' },
                    { id: 'groq', name: 'Groq (Llama 3)', sub: 'Fast & Free', badge: 'Ultra-fast' },
                    { id: 'openai', name: 'OpenAI', sub: 'GPT-4o mini', badge: 'Paid' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setTempProvider(p.id)}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                        tempProvider === p.id
                          ? 'border-sky bg-sky/10 text-ink shadow-sm'
                          : 'border-border bg-white/[0.02] text-muted hover:border-border/80'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-ink">{p.name}</span>
                      <span className="font-mono text-[10px] text-sky">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-display text-xs font-semibold text-ink">
                    {tempProvider === 'gemini' ? 'Google Gemini API Key' : `${tempProvider.toUpperCase()} API Key`}
                  </label>
                  {tempProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky underline hover:text-sky/80 font-display"
                    >
                      Get Free Gemini Key ↗
                    </a>
                  )}
                  {tempProvider === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky underline hover:text-sky/80 font-display"
                    >
                      Get Free Groq Key ↗
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full rounded-xl border border-border bg-black/50 px-3.5 py-2 font-mono text-xs text-ink focus:border-sky focus:outline-none"
                />
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  {tempProvider === 'gemini'
                    ? '✨ Google Gemini API is 100% free with any Google account. No credit card required.'
                    : 'Your API key is stored securely in your browser localStorage and never sent to our servers.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                {aiConfig.apiKey ? (
                  <button
                    type="button"
                    onClick={() => {
                      saveAiConfig({ apiKey: '', provider: 'gemini' })
                      setAiConfig({ apiKey: '', provider: 'gemini' })
                      setTempKey('')
                      setShowKeyModal(false)
                      showToast?.('API Key cleared. Switched to offline mode.')
                    }}
                    className="text-xs text-red-400 hover:underline font-display"
                  >
                    Disconnect Key
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="rounded-xl border border-border px-3.5 py-1.5 text-xs text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-sky px-4 py-1.5 font-display text-xs font-bold text-slate-950 shadow-glow hover:bg-sky-dim transition-all"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
