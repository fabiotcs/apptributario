# Agente Tributário — User Journey Maps

**Date:** 2026-02-09
**Status:** 🎯 Complete
**Methodology:** Empathy mapping + pain point analysis

---

## Table of Contents

1. [Journey 1: Empresário Novo](#journey-1-empresário-novo)
2. [Journey 2: Contador Novo](#journey-2-contador-novo)
3. [Journey 3: Contador Gerenciando Portfólio](#journey-3-contador-gerenciando-portfólio)
4. [Opportunity Map](#opportunity-map)

---

## Journey 1: Empresário Novo

### Persona: João Silva
**Role:** Empresário (construção civil)
**Goal:** Entender seu enquadramento tributário e possíveis economias
**Timeline:** 15 minutos

```
STAGE 1: DISCOVERY
│
├─ Trigger: "Estou pagando demais em impostos?"
├─ Emotion: 😐 Curious but skeptical
├─ Action: Google "Reforma Tributária 2026"
└─ Pain Point: Information overload, not sure if applies to my business

        ↓

STAGE 2: SIGN UP & ONBOARDING
│
├─ Trigger: Find Agente Tributário ad on LinkedIn
├─ Emotion: 😊 Hopeful
├─ Actions:
│   1. Click "Cadastrar Grátis"
│   2. Email: joao@construcaosil.com.br
│   3. Password: secure setup
├─ Pain Point: "Will my data be safe?" (sensitive business info)
│              "How many steps?" (wants quick wins)
└─ Opportunity: Show security badge immediately, clear progress bar

        ↓

STAGE 3: ENTER CNPJ (AUTO-FILL MAGIC)
│
├─ Trigger: System asks for CNPJ
├─ Emotion: 😊 Impressed
├─ Actions:
│   1. Enter: 12.345.678/0001-99
│   2. System fetches: Razão Social, CNAE, Current Regime
│   3. Review & approve data
├─ Pain Point: "Is the CNAE correct?" (may be wrong classification)
│              "What's this technical term?"
└─ Opportunity: Inline explanation + "Report incorrect data" link

        ↓

STAGE 4: REVIEW AUTO-FILLED DATA
│
├─ Emotion: 😐 Cautious
├─ Data shown:
│   Razão Social: João Silva Construções LTDA ✓
│   CNAE: 41.20-7-01 (Construção de edifícios) [Correct? ✓]
│   Current Regime: Simples Nacional (since Jan 2023)
│   Revenue (last 12mo): R$ 425.500
├─ Pain Point: "What if my revenue is higher than I said?" (risk awareness)
└─ Opportunity: "You can update this anytime in Settings"

        ↓

STAGE 5: ACCOUNT CREATED → DASHBOARD
│
├─ Emotion: 😊 Excited
├─ First screen:
│   "Bem-vindo, João! 👋"
│   Hero section: "Your regime: Simples Nacional"
│   CTA: "See if you could save money" (primary button)
├─ Pain Point: "Too much information at once?" (cognitive overload)
│              "Where do I go next?"
└─ Opportunity: Smart onboarding tour, highlight key metrics

        ↓

STAGE 6: EXPLORE DASHBOARD
│
├─ Emotion: 😊 Engaged
├─ User explores:
│   1. KPI Faturamento (YTD: R$ 425.500)
│   2. Enquadramento fiscal (pie chart: serviço vs. produto)
│   3. Alert: "You're at 85% of Simples limit"
│   4. CTA: "Simule transição para Presumido"
├─ Pain Point: "Is this calculation correct?" (trust in data)
│              "What exactly changes if I move regimes?"
└─ Opportunity: Explainer tooltips, link to FAQ

        ↓

STAGE 7: RUN REGIME COMPARISON
│
├─ Emotion: 😊 Interested
├─ Action: Click "Ver Análise Completa"
├─ See: Side-by-side comparison
│   - Simples Nacional: R$ 25.530/ano (current)
│   - Lucro Presumido: R$ 13.030/ano (potential)
│   - Lucro Real: R$ 20.450/ano
├─ Potential Saving: R$ 12.500/year
├─ Pain Point: "Should I really change?" (risky decision)
│              "What about downsides?"
└─ Opportunity: "Talk to an accountant" CTA, link to legal implications

        ↓

STAGE 8: CHAT WITH AI AGENT
│
├─ Emotion: 😊 Curious
├─ Question: "What changes in my day-to-day if I move to Presumido?"
├─ AI Response: Explains simplified accounting, quarterly estimates, less paperwork
├─ Pain Point: "Is the AI giving accurate advice?" (trust)
│              "How current is this legislation?"
└─ Opportunity: Show "Updated: Jan 15, 2026" on AI responses

        ↓

STAGE 9: DECIDE & TAKE ACTION
│
├─ Emotion: 😊 Confident
├─ Actions (pick one):
│   A) "I'll talk to my accountant" → Share report as PDF
│   B) "Let me enable referral for my accountant" → Activate dashboard for contador
│   C) "I'll monitor this" → Set alerts for regime limits
├─ Pain Point: "How do I implement this?" (action paralysis)
└─ Opportunity: "Next steps" wizard, checklist for regime change

        ↓

STAGE 10: EXIT → EMAIL FOLLOW-UP
│
├─ Emotion: 😊 Happy, informed
└─ Email: "João, we found R$ 12.5k/year in potential savings"
   CTA: "Share with your accountant" + link

---

## Journey 2: Contador Novo

### Persona: Maria Oliveira
**Role:** Accountant (5-person firm, ~24 clients)
**Goal:** Manage multiple clients more efficiently, provide better guidance
**Timeline:** 30 minutes

```
STAGE 1: DISCOVERY
│
├─ Trigger: Client asks "Will I be affected by Reforma Tributária?"
├─ Emotion: 😐 Overwhelmed
├─ Action: Search for "Plataforma gestão tributária Brasil"
└─ Pain Point: "I'm explaining the same thing to 24 clients" (repetition)
              "Manual tracking is error-prone" (scalability issue)

        ↓

STAGE 2: SIGN UP & PLAN SELECTION
│
├─ Trigger: Agente Tributário landing page
├─ Emotion: 😐 Skeptical about price
├─ Actions:
│   1. Click "Começar Gratuito"
│   2. Email: maria@oliveiraconsult.br
│   3. See plan options: Básico (5 clients), Pro (50 clients), Enterprise
├─ Pain Point: "What's the ROI?" (budget approval)
│              "Does it integrate with my tax software?" (workflow fit)
└─ Opportunity: Free tier for 5 clients, no credit card needed, integration roadmap

        ↓

STAGE 3: ADD FIRST CLIENT
│
├─ Trigger: Click "+ Adicionar Cliente"
├─ Emotion: 😐 Cautious
├─ Actions:
│   1. Enter CNPJ: 98.765.432/0001-99 (John's company)
│   2. System fetches: Razão Social, CNAE, regime
│   3. Approve & save
├─ Pain Point: "Will this sync with client's actual data?" (data integrity)
│              "How often does it update?"
└─ Opportunity: "Connected to official CNPJ database (daily sync)"

        ↓

STAGE 4: EXPLORE CLIENT DASHBOARD
│
├─ Emotion: 😊 Impressed
├─ Sees:
│   - Client: João Silva Construções
│   - Regime: Simples (since Jan 2023)
│   - Faturamento YTD: R$ 425.500
│   - Status: At 85% of limit (alert)
│   - Potential savings: R$ 12.5k/year if moved to Presumido
├─ Pain Point: "Is this insight new?" (novelty of recommendations)
└─ Opportunity: "This analysis took 5 minutes manually before"

        ↓

STAGE 5: SEND ALERT TO CLIENT
│
├─ Emotion: 😊 Proactive
├─ Actions:
│   1. Click "Enviar Alerta/Dica"
│   2. Choose template: "Approaching regime limit"
│   3. Customize: "João, your regime limit is next month..."
│   4. Send
├─ Pain Point: "Will the client understand this?" (literacy concern)
│              "Can I add my firm's contact?"
└─ Opportunity: "Add signature block", template language in plain Portuguese

        ↓

STAGE 6: GENERATE REPORT FOR CLIENT
│
├─ Emotion: 😊 Efficient
├─ Actions:
│   1. Click "Gerar Relatório"
│   2. Choose type: "Regime Comparison" or "Monthly Analysis"
│   3. System generates professional PDF
│   4. Download or email to client
├─ Pain Point: "Is this branded with my firm?" (white-label)
└─ Opportunity: Add firm logo + contact on report

        ↓

STAGE 7: ENABLE REFERRAL ACCESS
│
├─ Emotion: 😐 Cautious about commission
├─ Actions:
│   1. Click "Habilitar Referral para João"
│   2. Set custom discount (e.g., 10% off normal price)
│   3. Send unique link to client
│   4. Client signs up under your referral
├─ Pain Point: "Will I lose control of client data?" (trust)
│              "How do I track commissions?"
└─ Opportunity: "You earn 15% commission per month client stays active"
              Real-time dashboard: "Your referrals: R$ 1.2k/month"

        ↓

STAGE 8: BUILD PORTFOLIO VIEW
│
├─ Emotion: 😊 Organized
├─ Actions:
│   1. Add remaining 23 clients (batch import or one-by-one)
│   2. View portfolio summary:
│      - Total clients: 24
│      - Consolidated revenue: R$ 45.8M/year
│      - Total tax savings opportunity: R$ 3.2M/year
│      - Alerts pending: 5
├─ Pain Point: "Is batch import available?" (efficiency)
│              "Can I export to my billing system?"
└─ Opportunity: CSV upload for bulk client import, Zapier integration

        ↓

STAGE 9: RUN PORTFOLIO ANALYSIS
│
├─ Emotion: 😊 Data-driven
├─ Views:
│   - Pie chart: Distribution by regime (Simples: 50%, Presumido: 33%, Real: 17%)
│   - Bar chart: Revenue growth over 12 months
│   - Risk indicator: 3 clients close to regime limit
├─ Pain Point: "What do I do with this data?" (action items unclear)
└─ Opportunity: "Recommended actions" section with smart alerts

        ↓

STAGE 10: CONFIGURE ALERTS & SETTINGS
│
├─ Emotion: 😐 Administrative
├─ Actions:
│   1. Set global alert rules:
│      - "Alert when client hits 80% of regime limit"
│      - "Alert for new legislation affecting my clients"
│      - "Weekly portfolio summary email"
│   2. Customize commission terms
│   3. Set up integrations (Zapier, webhook)
├─ Pain Point: "Too many settings?" (configuration overload)
└─ Opportunity: Pre-configured defaults, guided setup wizard

        ↓

STAGE 11: FIRST MONTH → SUCCESS
│
├─ Emotion: 😊 Happy, productive
├─ Metrics:
│   - Saved 10 hours/month on analysis
│   - 5 clients moved to better regimes
│   - Generated R$ 1.2k/month in referral commissions
│   - 3 new leads from client referrals
└─ Email: "Maria, you've helped 5 clients save R$ 62.5k this month"

        ↓

STAGE 12: UPGRADE TO PRO PLAN
│
├─ Emotion: 😊 Growing
├─ Trigger: "You've reached 50 clients, upgrade to Pro"
├─ Action: Upgrade to Pro plan (R$ 299/month)
└─ New features: Advanced reporting, API access, white-label options

---

## Journey 3: Contador Gerenciando Portfólio

### Persona: Carlos (experienced accountant with 50+ clients)
**Goal:** Detect risks early, automate client communication, grow referral income
**Timeline:** Ongoing (weekly usage)

```
WEEKLY ROUTINE:
│
├─ 15 mins: Check portfolio alerts
│  ├─ Alerts: 3 clients approaching regime limits
│  ├─ 1 new legislation (ISS in São Paulo)
│  └─ Action: Send pre-drafted alerts to affected clients
│
├─ 15 mins: Review regime recommendations
│  ├─ Clients who should transition:
│  │  - Silva Constructions: R$ 12.5k/year savings
│  │  - Tech Solutions: R$ 8k/year savings
│  └─ Action: Generate comparison reports, send to clients
│
├─ 10 mins: Track referral commissions
│  ├─ Active referrals: 8 clients (R$ 2.4k/month)
│  ├─ New referrals this week: 2
│  └─ Churn risk: 1 client (not accessed in 30 days)
│
└─ 10 mins: Bulk email campaign
   ├─ Template: "Quarterly tax planning check-in"
   ├─ Recipients: All clients in Simples Nacional
   ├─ CTA: "Schedule call to review regime"
   └─ Track opens/clicks

MONTHLY REPORTING:
│
├─ Generate consolidated report:
│  ├─ Clients at risk: 3 (close to regime limits)
│  ├─ Recommended actions: 5
│  ├─ Total client revenue: R$ 125M (vs last month: +8%)
│  ├─ Your commission: R$ 8k/month (from referrals)
│  └─ Potential savings for clients: R$ 15M/year
│
└─ Share report with firm partners (if multi-user)

PAIN POINTS IN THIS JOURNEY:
├─ "The alerts feel generic" (customization)
├─ "I wish I could see who's at risk of churning" (retention insights)
├─ "Can I bulk-email from here?" (efficiency)
└─ "How do I prove ROI to my billing clients?" (justification)

OPPORTUNITIES:
├─ AI-powered alert prioritization
├─ Churn risk scoring
├─ Native email integration
└─ ROI calculator for your services

```

---

## Opportunity Map

### High-Impact Improvements

| Stage | Pain Point | Opportunity | Impact | Effort |
|-------|---|---|---|---|
| Onboarding | "Is my data safe?" | Security badge + brief explanation | 🔴 High | 🟢 Low |
| Onboarding | "How many steps?" | Progress bar (3 of 5) | 🔴 High | 🟢 Low |
| CNPJ Entry | "Is CNAE correct?" | Inline help + correction link | 🟡 Medium | 🟡 Medium |
| Dashboard | "Too much info" | Smart onboarding tour | 🔴 High | 🟡 Medium |
| Regime Change | "Should I really?" | Link to accountant + FAQ | 🔴 High | 🟢 Low |
| AI Chat | "Is this accurate?" | Show "Updated: Jan 15" | 🔴 High | 🟢 Low |
| Client Add | "Will this sync?" | "Connected to official DB (daily sync)" | 🟡 Medium | 🟢 Low |
| Report Gen | "Is this branded?" | Add firm logo automatically | 🟡 Medium | 🟡 Medium |
| Referral Setup | "How track?" | Real-time commission dashboard | 🔴 High | 🔴 High |
| Portfolio View | "What do I do?" | "Recommended actions" section | 🔴 High | 🔴 High |
| Settings | "Too many?" | Pre-configured defaults | 🟡 Medium | 🟡 Medium |
| Weekly Use | "Alerts generic?" | Smart prioritization | 🟡 Medium | 🔴 High |

### Quick Wins (Low Effort, High Impact)

1. **Security Badge** (Onboarding) — Shows SSL cert, LGPD compliance, data encryption
2. **Progress Bar** (Onboarding) — "Step 2 of 5: Confirm your data"
3. **"Updated: Jan 15" Label** (AI Chat) — Builds trust in responses
4. **Regime Limit Alert** (Dashboard) — "85% of limit (R$ XX remaining)"
5. **"Ask an accountant" CTA** (Regime Change) — Risk mitigation

### Medium Effort, High Impact

1. **Intelligent Onboarding Tour** (Dashboard) — Highlights key KPIs, first time only
2. **"Recommended Actions"** (Portfolio View) — AI-powered suggestions
3. **Firm Logo on Reports** (Report Gen) — White-label customization
4. **Email Integration** (Bulk Communication) — Native send from platform

### Strategic Features (Higher Effort)

1. **Commission Dashboard** (Referral Tracking) — Real-time revenue tracking
2. **Smart Alert Prioritization** (Weekly Use) — ML-based ranking
3. **Churn Risk Scoring** (Portfolio Management) — Predict client dropout
4. **API Access** (Enterprise) — Connect to accounting software

---

## Emotional Journey

### Empresário Path
```
😐 Skeptical → 😊 Hopeful → 😊 Impressed → 😊 Engaged → 😊 Confident → 😊 Happy
```

**Key emotional moments:**
- ✨ **Auto-fill CNPJ data** — "Wow, it worked!"
- ✨ **See potential savings** — "Maybe I am paying too much"
- ✨ **AI explains the change** — "OK, I understand what happens"
- ✨ **Share report with accountant** — "Now I can decide"

### Contador Path
```
😐 Overwhelmed → 😐 Skeptical → 😊 Impressed → 😊 Proactive → 😊 Organized → 😊 Growing
```

**Key emotional moments:**
- ✨ **Portfolio summary appears** — "45.8M under management visualized!"
- ✨ **Send alert to client in 2 clicks** — "No more manual emails"
- ✨ **See referral commission accruing** — "R$ 1.2k/month!"
- ✨ **Risk indicators highlight** — "Proactive vs reactive"

---

## Accessibility Notes in Journeys

**Empresário:**
- CNPJ input: Provide masked format (00.000.000/0000-00)
- Data review: Use clear language, avoid jargon
- Chart: Provide data table alternative (ARIA)
- AI Chat: Transcript of responses (for reference)

**Contador:**
- Client list: Keyboard navigation (arrow keys to switch clients)
- Reports: Download as accessible PDF (proper headings, alt text)
- Alerts: Email copy has same content as in-app (no design dependency)
- Bulk upload: Clear error messages for invalid CNPJs

---

**User Journey Maps Complete**
Ready for feature prioritization and development. 🎯

---

*These journeys inform wireframe design, feature prioritization, and customer support training. Use emoticon ratings to guide investment decisions.*
