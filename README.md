# ArchCritic — Auth UI

Login + signup frontend, styled as a frosted-glass "living blueprint" — an
animated architecture-graph background (pulsing nodes, drawn edges) sits
behind a glass auth card, tying the auth experience directly to the product
(a live system-architecture diagram tool).

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Routes:
- `/login`
- `/signup`

## What's included

- `src/components/BlueprintBackground.jsx` — the signature animated graph
  background (pure SVG + CSS, no canvas libs, mouse-parallax on desktop)
- `src/components/GlassCard.jsx` — reusable frosted glass container
- `src/components/Field.jsx` — glass input with icon, error state, and a
  show/hide toggle for password fields
- `src/components/Button.jsx` — primary/ghost buttons with a loading state
- `src/components/SocialButton.jsx` — GitHub/Google style OAuth buttons
- `src/components/AuthShell.jsx` — shared layout (logo, background, footer tagline)
- `src/pages/Login.jsx` — email/password + validation + social buttons
- `src/pages/Signup.jsx` — name/email/password + live password-strength meter

## Wiring to your backend

Both forms currently `setTimeout` to simulate a request. Replace the
`handleSubmit` body in each page with a real call, e.g.:

```js
const res = await api.post('/api/auth/login', { email, password })
```

Point `src/lib/api.js` (add this file) to your Express backend once it's
ready — the UI layer is fully decoupled from any backend assumptions.

## Design tokens (tailwind.config.js)

- `bg` `#090B0F` — near-black canvas background
- `mint` `#7CF5C4` — primary accent (glow, focus states, links)
- `blue` `#5B8CFF` — secondary accent (background graph edges)
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (labels/mono UI)

Respects `prefers-reduced-motion` and has visible keyboard focus states
throughout.
