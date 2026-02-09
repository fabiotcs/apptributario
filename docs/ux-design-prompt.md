# Prompt para @ux-design-expert — Agente Tributário UX/UI Design

**De:** Morgan (PM)
**Para:** @ux-design-expert
**Data:** 2026-02-09
**Status:** PRD Aprovado — Pronto para Design

---

## Contexto

O **Agente Tributário** é uma plataforma SaaS que orienta empresários e contadores sobre a Reforma Tributária Brasileira. O PRD foi aprovado e agora precisamos de **wireframes e design system** para as principais interfaces antes do desenvolvimento começar.

Seu foco é nas **Stories 3.1-3.4** (Dashboards para Empresário e Contador), que são críticas para a experiência do usuário e retenção.

---

## O Que Você Precisa Entregar

### 1. Wireframes de Alta Fidelidade (Stories 3.1-3.4)

#### Story 3.1: Dashboard Empresário

**Objetivo:** Primeiro tela após login. Sumário completo do negócio + regime tributário + alertas.

**Seções Obrigatórias (conforme PRD):**

1. **Sumário da Empresa** (Header)
   - Razão social, CNPJ, UF, CNAE, regime tributário atual (destaque visual)
   - Botão "Editar Dados" (modal)
   - Botão "Consultar Agente de IA" (abre chat)

2. **KPI de Faturamento** (Card ou Widget)
   - Faturamento acumulado (YTD): R$ XXX.XXX
   - Projeção anual: R$ X.XXX.XXX
   - Comparação com período anterior: ↑ 15% (visual de trend)
   - Filtro de período (Últimos 30 dias, 3 meses, YTD)

3. **Análise Tributária Rápida** (Card com CTA)
   - "Seu regime atual: Simples Nacional"
   - "Economia potencial se mudasse para Presumido: R$ 12.500/ano"
   - Botão destacado "Ver Análise Completa" → Story 2.3 (Comparador)
   - Ícone de alerta se faturamento está próximo de limite

4. **Enquadramento Fiscal** (Gráfico)
   - Pie chart: % Serviço vs. % Produto
   - Labels com valores R$
   - Legenda interativa (clique para drill-down)

5. **Alertas & Ações** (Lista ou Timeline)
   - Notificações recentes (últimas 3-5)
   - "Nova legislação: ISS em São Paulo" (link para documento)
   - "Faturamento em 78% do limite Simples" (alerta)
   - "Contador enviou orientação" (mensagem)
   - Botão "Ver Todos os Alertas"

**Design Requirements:**
- Responsivo: Desktop, Tablet, Mobile
- Mobile: Seções colapsam em abas ou accordion
- Cores: Azul/Verde para confiança e conformidade
- Tipografia: Sans-serif moderna (Inter, Outfit)
- Icons: Sistema consistente (ex: Lucide Icons)
- Espaçamento: Padding/margin consistente (8px grid)

**Your Work:**
- Criar wireframe de alta fidelidade (Figma preferred)
- Mostrar layout para: Desktop (1920px), Tablet (768px), Mobile (375px)
- Indicar estados: loading, error, empty (sem dados)
- Documentar micro-interactions (hover, click, transitions)

---

#### Story 3.2: Dashboard Contador — Portfólio Multi-Empresa

**Objetivo:** Visão de todos os clientes. Status consolidado, alertas, oportunidades.

**Seções Obrigatórias (conforme PRD):**

1. **Header & Actions**
   - Título "Meu Portfólio"
   - Botão "+ Adicionar Cliente" (abre modal com CNPJ input)
   - Filtros rápidos: Por Regime, Por UF, Por Status, Por Alertas
   - Campo de busca (nome/CNPJ)

2. **KPI Consolidado** (Cards em linha)
   - Total de Clientes: 24
   - Faturamento Consolidado: R$ XXM/ano
   - Economia Tributária Gerada: R$ XXXk/ano (ou mês)
   - Alertas Pendentes: 5 (com badge)

3. **Lista de Empresas** (Tabela ou Grid)
   - Colunas: Nome | CNPJ | Regime | Faturamento (YTD) | Status | Última Ação | Alertas
   - Cada linha é clicável → Story 3.3 (drill-down)
   - Ações inline: Enviar Alerta, Gerar Relatório, Menu (...)
   - Ordenação: por coluna (clicar em header)
   - Paginação: 10/25/50 por página
   - Mobile: Converter tabela em cards (Regime | Faturamento | Status empilhados)

4. **Gráficos de Portfólio** (Seção inferior ou sidebar)
   - Pie: Distribuição de clientes por regime (Simples: 12, Presumido: 8, Real: 4)
   - Bar: Evolução de faturamento consolidado (últimos 12 meses)
   - Indicador: Clientes "em risco" (próximos de limite de transição)

5. **Ações Rápidas** (Floating ou Bottom Bar em mobile)
   - Exportar Portfólio (CSV/PDF)
   - Gerar Relatório Consolidado
   - Configurações de Alertas (global)

**Design Requirements:**
- Densidade informacional alta (contador quer ver muitos clientes de uma vez)
- Mobile: Grid de cards ao invés de tabela
- Responsivo: Desktop, Tablet, Mobile
- Cores: Mesma paleta de Story 3.1 (consistência)
- Estados: Empty (0 clientes), Loading (busca), Normal, Error

**Your Work:**
- Criar wireframe para desktop (tabela) e mobile (cards)
- Documentar interações: click em linha, drag para reordenar (optional)
- Indicar states: loading table, no results, error
- Design de paginação/scroll

---

#### Story 3.3: Dashboard Contador — Visão Detalhada de Cliente Individual

**Objetivo:** Drill-down de um cliente. Detalhes completos, análise, histórico, ações.

**Seções Obrigatórias (conforme PRD):**

1. **Header** (Sticky top)
   - Botão Back (volta para Story 3.2)
   - Razão social + CNPJ
   - Botão Menu: Editar, Deletar, Mais ações

2. **Seção 1 - Regime Tributário** (Card ou Panel)
   - "Regime Atual: Simples Nacional"
   - "Data de Enquadramento: Jan 2023"
   - Link "Ver Histórico Completo" → expandir ou modal
   - Botão "Simular Transição de Regime"

3. **Seção 2 - Faturamento** (Gráfico)
   - Line chart: Evolução mensal (últimos 12 meses)
   - Valores: Jan: R$ 25k → Dec: R$ 35k
   - Projeção anual (linha tracejada)
   - Comparação com período anterior (% growth)
   - Mobile: Converter para bar chart se necessário

4. **Seção 3 - Análise Comparativa** (Resumo)
   - "Se estivesse em Presumido: economizaria R$ 8k/ano"
   - Tabela reduzida mostrando 3 regimes
   - Botão "Ver Análise Completa" → Story 2.3

5. **Seção 4 - Alertas Específicos** (Timeline ou List)
   - Histórico de alertas enviados a este cliente
   - "15 Jan 2026: ISS em SP mudou" (lido)
   - "10 Jan 2026: Faturamento em 75% do limite" (não lido)
   - "05 Jan 2026: Nova legislação de Lucro Real" (não lido)
   - Botão "Enviar Novo Alerta"

6. **Seção 5 - Ações do Contador** (Cards ou Buttons)
   - Botão "Enviar Alerta/Dica" (abre modal com templates)
   - Botão "Gerar Relatório" (PDF download)
   - Botão "Simular Transição" (abre Story 2.3 para este cliente)
   - Botão "Habilitar Referral" (ativa acesso para cliente)

**Design Requirements:**
- Layout vertical (scrollável em mobile e desktop)
- Mobile: Seções em abas ou accordion
- Responsivo
- Cores: Mesma paleta
- Breadcrumb ou back button clara

**Your Work:**
- Criar wireframe desktop (full page) e mobile (abas/accordion)
- Documentar transitions entre seções
- Design de gráficos (line chart para faturamento)
- Layout de alertas (timeline vs. list — qual é melhor?)

---

#### Story 3.4: Admin Panel — Gestão de Usuários, Empresas e Configurações

**Objetivo:** Painel administrativo. Gestão de dados, configurações, relatórios.

**Seções Obrigatórias (conforme PRD):**

1. **Sidebar Navigation** (Collapsible em mobile)
   - Logo (Agente Tributário)
   - Menu items: Usuários, Empresas, Regimes, Configurações, Relatórios, Logs, Sair
   - Ícones + labels

2. **Usuários** (CRUD Table)
   - Tabela: Email | Role | Cadastro | Último Acesso | Ações
   - Botão "+ Novo Usuário" → form modal
   - Ações inline: Editar, Resetar Senha, Desativar
   - Filtros: Por role (Admin, Contador, Empresário), Por status (Ativo/Inativo)

3. **Empresas** (CRUD Table)
   - Tabela: Razão Social | CNPJ | Regime | Contador | Cadastro | Ações
   - Botão "+ Nova Empresa" → form
   - Ações: Editar, Deletar, Visualizar Histórico
   - Filtros: Por regime, Por contador

4. **Regimes Tributários** (Config Panel)
   - Seção: "Simples Nacional"
     - Tabela de faixas (até R$ 180k: X%, até R$ 360k: Y%, etc.)
     - Botão Editar por faixa
   - Seção: "Lucro Presumido"
     - % por CNAE (Consultoria: 32%, Comércio: 8%, etc.)
     - Botão Editar
   - Seção: "Lucro Real"
     - Configurações gerais (IRPJ, CSLL, etc.)
   - Sistema de versionamento: "Última atualização: Jan 2026"

5. **Configurações** (Form)
   - ISS por Município (tabela editável)
   - Taxas de Referral (% para contador)
   - Limites de Plano (N clientes por plano)
   - Limites de IA (requisições por minuto, por dia)
   - Botão Salvar

6. **Relatórios Operacionais** (Dashboard)
   - KPIs: MAU, DAU, Novos Usuários (semana), Requisições à IA
   - Gráficos: Crescimento de usuários (line), Distribuição por role (pie), Erros por tipo (bar)

7. **Logs de Auditoria** (Table)
   - Colunas: Data | Usuário | Ação | Recurso | Detalhes
   - Filtros: Por tipo de ação, Por usuário, Por data
   - Search: Buscar por ID ou CNPJ

**Design Requirements:**
- Admin-friendly (densidade informacional alta, sem decoração excessiva)
- Responsive: Desktop-first (admin geralmente usa desktop)
- Cores: Paleta neutra ou com avisos em vermelho para ações destrutivas
- Confirmação para ações perigosas (delete, reset)

**Your Work:**
- Criar wireframes de cada seção (Usuários, Empresas, Regimes, etc.)
- Documentar modals (novo usuário, editar regime, etc.)
- Design de confirmação dialog para ações destrutivas
- Design de forms (layouts, validações visuais)

---

### 2. Design System / Style Guide

**Objetivo:** Documento que guia implementação consistente do design.

**Seções Obrigatórias:**

1. **Color Palette**
   - Primary: Azul (ex: #0066CC)
   - Secondary: Verde (ex: #00AA44)
   - Neutral: Grays (ex: #F5F5F5, #333333)
   - Semantic: Verde para sucesso, Vermelho para erro, Laranja para aviso
   - Exemplo: "Use azul para CTAs principais, verde para sucesso, vermelho para perigos"

2. **Typography**
   - Font Family: Inter, Outfit (ou similar sans-serif)
   - Heading 1: 32px, Bold, line-height 1.2
   - Heading 2: 24px, Bold
   - Body: 16px, Regular
   - Caption: 12px, Regular, Gray
   - Guideline: "Manter consistência em tamanhos"

3. **Components**
   - Button (primary, secondary, tertiary, danger)
   - Card (com/sem shadow, com/sem border)
   - Input (text, email, number, select)
   - Table (com alternating rows, sticky header)
   - Modal / Dialog (header, body, footer)
   - Badge / Pill (para status)
   - Alert / Notification
   - Breadcrumb
   - Pagination
   - Exemplos e specs de cada

4. **Layout & Spacing**
   - Grid: 8px base unit
   - Padding: 8px, 16px, 24px, 32px
   - Margin: Similar
   - Breakpoints: Desktop (1920px), Tablet (768px), Mobile (375px)
   - Guideline: "Usar 8px multiples para espaçamento"

5. **Icons**
   - Set: Lucide Icons ou similar
   - Size: 16px, 20px, 24px, 32px
   - Color: Match text color (inherit)
   - Guideline: "Usar ícones consistentes, ex: sempre Lucide"

6. **Interactions**
   - Hover states (ex: button background lighten 10%)
   - Focus states (ex: blue outline)
   - Loading states (spinner, skeleton)
   - Error states (red border, error message)
   - Transitions: 200ms ease-in-out

7. **Accessibility**
   - WCAG AA compliance
   - Color contrast: 4.5:1 para texto
   - Focus indicators: visíveis em todos os elementos interativos
   - Alt text: em todas as imagens
   - ARIA labels: em componentes complexos

**Your Work:**
- Criar documento (Markdown ou Figma) detalhando design system
- Incluir screenshots/exemplos de cada componente
- Documentar implementação (CSS classes, Tailwind utilities)
- Guideline de quando usar cada componente

---

### 3. User Journey Maps (Optional but Recommended)

**Objetivo:** Mapear fluxos de usuário de ponta a ponta.

**Journey 1: Empresário Novo**
- Arrive → Sign Up (email/Google) → Enter CNPJ → Review Auto-Filled Data → Create Account → See Dashboard → Explore Analysis → Ask Agent → Exit
- Pain points, opportunities, emotional moments

**Journey 2: Contador Novo**
- Sign Up → Plan Selection → Add First Client (CNPJ) → See Client Dashboard → Send Alert → Check Engagement → Exit
- Pain points, opportunities

**Your Work:**
- Criar 2-3 user journey maps
- Incluir emoticon (happy, neutral, frustrated) em cada ponto
- Identificar friction points
- Sugerir melhorias

---

### 4. Mockups / High-Fidelity Prototypes (Figma)

**Objetivo:** Visual e interativo que desenvolvedores podem usar como referência.

**Your Work:**
- Criar Figma file com wireframes de todas as stories
- Componentizar (reusable components)
- Documentar design tokens (colors, spacing, etc.)
- Exporter como PNG/PDF para compartilhamento

---

## Informações do PRD (Para Referência)

**Key Requirements:**
- Two distinct user types: Empresário (simple, focused) vs. Contador (dense, multi-client)
- WCAG AA accessibility (mandatório)
- Responsive: Desktop, Tablet, Mobile
- Performance: < 2s load time (design implicações)
- Integrações: Chat IA widget deve ser sempre acessível
- Alertas: Notificações in-app proeminentes

**Design Constraints:**
- Profissional (não gamification excessiva)
- Intuitivo (usuarios podem ser menos tech-savvy)
- Confiável (finanças são sensíveis)
- Rápido (não pode ter animações pesadas)

**Brand Elements (TBD):**
- Azul/Verde (confiança, conformidade)
- Sans-serif moderna
- Ícones simples e claros

---

## Deliverables Checklist

- [ ] Wireframes de Story 3.1 (Desktop, Tablet, Mobile)
- [ ] Wireframes de Story 3.2 (Desktop, Tablet, Mobile)
- [ ] Wireframes de Story 3.3 (Desktop, Tablet, Mobile)
- [ ] Wireframes de Story 3.4 (Desktop, Tablet, Mobile)
- [ ] Design System / Style Guide
- [ ] Color Palette + Typography specs
- [ ] Component Library (Button, Card, Table, etc.)
- [ ] User Journey Maps (2-3)
- [ ] Figma file com mockups high-fidelity
- [ ] Accessibility checklist (WCAG AA)
- [ ] Mobile responsiveness validation

---

## Timeline & Next Steps

1. **Review PRD** (`docs/prd.md`) — Focus on Stories 3.1-3.4
2. **Ask Questions** — Se algo for ambíguo
3. **Create Wireframes** — Comece por Story 3.1 (Dashboard Empresário)
4. **Design System** — Paralelo ou depois dos wireframes
5. **Mockups** — Criar high-fidelity em Figma
6. **Validate** — com PM (você pode chamar)
7. **Handoff** — Para Dev

**Estimated Timeline:** 5-7 days (wireframes + design system + mockups)

---

## Design Inspiration & Reference

**Similar Products (para inspiração, não cópia):**
- Contábil cloud (Brasil)
- Docket (compliance)
- Notion (clean UI)
- Stripe Dashboard (admin patterns)

**Key Takeaway:** Foco em clareza e confiança, não em decoração. Usuários estão gerenciando finanças sérias.

---

## Contato & Questions

**PM:** Morgan (disponível para alignment)
**PRD:** `docs/prd.md`
**Stories Details:** Section 6 do PRD (Epic Details)

---

**Próximo Passo:** @ux-design-expert cria Wireframes + Design System

Status: ✅ PRD aprovado, pronto para UX/UI design.

