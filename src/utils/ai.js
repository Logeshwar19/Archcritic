// AI API Client (Google Gemini, OpenAI, Groq)
const AI_KEY_STORAGE = 'archcritic_api_key'
const AI_PROVIDER_STORAGE = 'archcritic_ai_provider'

export function getStoredAiConfig() {
  try {
    return {
      apiKey: localStorage.getItem(AI_KEY_STORAGE) || '',
      provider: localStorage.getItem(AI_PROVIDER_STORAGE) || 'gemini',
    }
  } catch (e) {
    return { apiKey: '', provider: 'gemini' }
  }
}

export function saveAiConfig({ apiKey, provider }) {
  try {
    if (apiKey) localStorage.setItem(AI_KEY_STORAGE, apiKey.trim())
    else localStorage.removeItem(AI_KEY_STORAGE)
    if (provider) localStorage.setItem(AI_PROVIDER_STORAGE, provider)
  } catch (e) {
    console.error('Failed to save AI config', e)
  }
}

// ─── Call Real AI Model ───────────────────────────────────────────────────────
export async function callRealAiModel({ prompt, currentNodes, issues, healthScore, user, history = [] }) {
  const { apiKey, provider } = getStoredAiConfig()
  if (!apiKey) return null // fallback to local smart engine

  const systemPrompt = `You are ArchCritic AI Copilot, a Principal Cloud Solutions Architect operating inside an interactive Cloud Architecture Studio.
You are assisting ${user?.name || 'the user'}.

CURRENT LIVE CANVAS ARCHITECTURE STATE:
- Total Components: ${currentNodes.length}
- Current Nodes: ${JSON.stringify(currentNodes.map((n) => ({ id: n.id, name: n.name, category: n.category, status: n.status, specs: n.specs })))}
- Current Health Score: ${healthScore}/100
- Active Issues: ${JSON.stringify(issues.filter((i) => !i.fixed).map((i) => ({ id: i.id, title: i.title, severity: i.severity })))}

CAPABILITIES:
1. Answer ANY doubt or question about Cloud, AWS, DevOps, Microservices, Databases, Well-Architected Framework, etc.
2. If the user asks in Tamil or Tanglish, understand and respond naturally in friendly, clear Tanglish or English as appropriate.
3. If the user wants to make a change to the canvas (e.g. "add redis", "fix db", "scale auth", "add s3", "remove node"), you can include an automated action block at the END of your reply using this exact JSON format:
ACTION: {"tool": "add_node", "name": "Node Name", "category": "Database|Compute|Gateway|Streaming", "specs": "Specs details"}
or
ACTION: {"tool": "auto_fix_db"}
or
ACTION: {"tool": "scale_service", "target": "auth", "replicas": 5}
or
ACTION: {"tool": "add_s3"}

Keep your responses structured, professional, crisp, and helpful.`

  // 1. Google Gemini API
  if (provider === 'gemini') {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }],
      },
    ]

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API error: ${res.statusText}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return text || 'No response generated from Gemini.'
  }

  // 2. Groq API (Llama 3.3)
  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-4).map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Groq API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || 'No response from Groq.'
  }

  // 3. OpenAI API (gpt-4o-mini)
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-4).map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `OpenAI API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || 'No response from OpenAI.'
  }

  return null
}
