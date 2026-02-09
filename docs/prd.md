# Agente Tributário — Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 2026-02-09
**Autor:** Morgan (PM)
**Status:** ✅ APROVADO

---

## Table of Contents

1. [Goals and Background Context](#1-goals-and-background-context)
2. [Requirements](#2-requirements)
3. [User Interface Design Goals](#3-user-interface-design-goals)
4. [Technical Assumptions](#4-technical-assumptions)
5. [Epic List](#5-epic-list)
6. [Epic Details](#6-epic-details)
7. [Next Steps](#7-next-steps)

---

## 1. Goals and Background Context

### Goals

- Criar uma plataforma SaaS **Agente Tributário** que traduza a complexidade da Reforma Tributária brasileira em orientações claras e acionáveis para empresários e contadores
- Atender dois segmentos distintos: **contadores** (gestão multi-empresa, classificação fiscal, alertas para clientes) e **empresários** (visão do seu negócio, enquadramento tributário, consultas inteligentes)
- Implementar onboarding inteligente via CNPJ, trazendo automaticamente atividades econômicas, códigos de serviço e regime tributário vigente
- Oferecer agente de IA (texto e voz) alimentado por base RAG com legislação atualizada semanalmente/mensalmente
- Gerar receita recorrente (MRR) através de modelo de monetização híbrido: venda direta a empresários + venda a contadores + modelo de referral (contador libera para seus clientes com valor diferenciado)
- Entregar dashboards diferenciados por perfil (Admin, Contador, Empresário) com informações específicas para cada público
- Possibilitar análise comparativa de regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real) com recomendações baseadas em dados reais do negócio
- Suportar gestão multi-empresa e multi-filial (inclusive em estados diferentes) para o perfil contador

### Background Context

O Brasil está atravessando a maior reforma tributária das últimas décadas, criando uma demanda massiva por orientação tanto entre profissionais contábeis quanto empresários de pequenas e médias empresas. A transição entre o sistema atual e o novo modelo gera incerteza e complexidade — muitos empresários ainda não têm clareza sobre o que mudará para seus negócios, e contadores precisam de ferramentas atualizadas para assessorar seus clientes.

O fundador é contador de formação, com experiência em construção civil e atendimento a PMEs de serviços. Possui domínio em finanças, contas a pagar/receber, e conduziu pesquisa aprofundada sobre a Reforma Tributária, acumulando material rico e consistente. A proposta combina esse conhecimento especializado com capacidades de IA (RAG + agente conversacional) para criar uma plataforma que se mantém sempre atualizada e entrega valor diferenciado — um gap que as soluções contábeis tradicionais não atendem.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-09 | 1.0 | Criação final do PRD aprovado | Morgan (PM) |

---

## 2. Requirements

### Functional Requirements (FR)

**FR1:** A plataforma deve permitir cadastro e autenticação de usuários com três tipos de perfil: Administrador, Contador e Empresário (usuário final)

**FR2:** O onboarding de novo usuário empresário deve funcionar através da inserção do CNPJ, trazendo automaticamente atividades econômicas, códigos de serviço e regime tributário atual da empresa

**FR3:** A plataforma deve manter uma base de dados RAG atualizada com legislação tributária brasileira vigente, com atualizações semanais/mensais de mudanças na Reforma Tributária

**FR4:** O sistema deve oferecer um agente de IA conversacional (texto e voz) que responde dúvidas dos usuários sobre tributação, consultando a base RAG legislativa de forma dinâmica

**FR5:** O painel do Contador deve suportar gerenciamento de múltiplas empresas clientes vinculadas, com visão consolidada e drill-down por empresa

**FR6:** O painel do Contador deve permitir liberação/ativação da plataforma para seus clientes empresários com modelo de precificação diferenciado (referral)

**FR7:** O painel do Contador deve gerar alertas e dicas automatizadas para seus clientes empresários baseados em mudanças legislativas e/ou dados da empresa

**FR8:** O painel do Empresário deve exibir dashboards que mostram: regime tributário atual, enquadramento fiscal por tipo de receita (serviço vs. produto), faturamento e indicadores de mudança de regime

**FR9:** A plataforma deve implementar análise comparativa de regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real), recomendando o mais adequado com base nos dados reais da empresa (atividade econômica, faturamento, CNAE)

**FR10:** O sistema deve permitir classificação fiscal manual de receitas/operações, com histórico de mudanças e comparação de impacto entre regimes

**FR11:** O painel do Empresário deve suportar posteiramento (lançamentos simples) dentro da plataforma para consulta e análise de dados

**FR12:** O painel Admin deve prover ferramentas de gestão: usuários, empresas, regimes tributários, configurações de monetização e relatórios operacionais

**FR13:** A plataforma deve suportar gestão de multi-filiais para contadores e suas empresas clientes, inclusive filiais em UFs diferentes

**FR14:** O sistema deve implementar modelo de monetização híbrido com três streams: assinatura direta de empresário, assinatura de contador (gerenciador multi-cliente), e modelo de referral (contador repassa cliente)

**FR15:** A plataforma deve registrar histórico completo de regime tributário de cada empresa, mostrando transições e motivos das mudanças

### Non-Functional Requirements (NFR)

**NFR1:** A aplicação deve ser responsiva e funcionar em navegadores modernos (Chrome, Firefox, Safari) em dispositivos desktop e móvel

**NFR2:** Latência de resposta para consultas (dashboard, pesquisa de legislação) não deve exceder 2 segundos em condições normais de uso

**NFR3:** A base RAG legislativa deve ser atualizada automaticamente com mínimo de latência para o usuário final (eventual consistency aceitável)

**NFR4:** O agente de IA deve suportar no mínimo 100 requisições simultâneas sem degradação de qualidade

**NFR5:** A aplicação deve implementar autenticação segura (OAuth2 ou equivalente) com controle de acesso granular por perfil/empresa

**NFR6:** Todos os dados sensíveis (CNPJ, dados financeiros) devem ser criptografados em repouso e em trânsito (TLS 1.3+)

**NFR7:** A plataforma deve atingir 99.5% de uptime em produção com SLA de recuperação em caso de falha

**NFR8:** A arquitetura deve ser escalável horizontalmente para suportar crescimento de até 10x em usuários nos próximos 12 meses

**NFR9:** O código deve ser testável com cobertura mínima de 80% de testes unitários + integração para funcionalidades críticas

**NFR10:** A interface deve seguir padrões de acessibilidade WCAG AA para garantir usabilidade para usuários com deficiências

**NFR11:** O sistema deve estar em conformidade com LGPD (Lei Geral de Proteção de Dados) para dados pessoais e empresariais

**NFR12:** Logs de todas as operações sensíveis (login, mudança de regime, acesso a dados) devem ser mantidos por mínimo de 2 anos para auditoria

---

## 3. User Interface Design Goals

### Overall UX Vision

A UX deve ser intuitiva e acessível para dois públicos distintos com necessidades diferentes:
- **Contador:** Ferramenta profissional, com densidade informacional alta, suportando análise comparativa rápida entre múltiplos clientes e regimes
- **Empresário:** Interface limpa e direta, focando em recomendações claras ("Qual regime é melhor para mim?") sem sobrecarga de complexidade técnica

O fluxo de entrada principal (via CNPJ) deve ser rápido e guiado, extraindo dados automaticamente para minimizar fricção no onboarding. A conversa com o agente de IA deve ser central e acessível desde qualquer tela.

### Key Interaction Paradigms

1. **Dashboard contextual:** Cada perfil vê dados relevantes ao seu papel (contador vê visão de portfólio; empresário vê apenas seu negócio)
2. **Busca + IA conversacional:** Usuários devem poder fazer perguntas em linguagem natural (texto/voz) e receber respostas apoiadas na legislação
3. **Onboarding guiado:** Formulário inteligente que carrega dados via CNPJ e reduz campos manuais
4. **Comparador visual:** Visão lado-a-lado de regimes tributários com cálculos de impacto
5. **Alertas proativos:** O sistema envia notificações quando há mudanças legislativas relevantes para a empresa do usuário

### Core Screens and Views

- **Login / Autenticação:** Tela de login com opção de cadastro rápido via CNPJ
- **Onboarding Post-Login:** Coleta de CNPJ, validação, preenchimento automático de dados, seleção de regime atual
- **Dashboard Principal (Contador):** Portfólio de empresas clientes, status de cada uma, alertas consolidados
- **Dashboard Principal (Empresário):** Sumário do negócio, regime tributário, enquadramento fiscal, últimas dúvidas resolvidas pelo agente
- **Detalhes da Empresa (Contador):** Visão drill-down de empresa específica, com todos os dados, alertas e opções de configuração
- **Análise Comparativa de Regimes:** Tabela comparativa (Simples vs. Presumido vs. Real) com recomendação
- **Chat com Agente de IA:** Interface conversacional (texto/voz) para dúvidas tributárias
- **Gestão de Clientes (Contador):** CRUD de empresas vinculadas, ativação/desativação, modelo de referral
- **Posteiramento (Empresário):** Interface simplificada para lançamento de receitas/despesas básicas
- **Configurações / Perfil:** Dados pessoais, preferências de notificação, integração com agente
- **Admin Panel:** Gestão de usuários, empresas, regimes, relatórios operacionais

### Accessibility

**Padrão:** WCAG AA
- Contraste de cores adequado
- Navegação por teclado completa
- Labels associadas a todos os inputs
- Texto alternativo para ícones
- Responsividade para leitores de tela

### Target Device and Platforms

**Web Responsive** (mobile, tablet, desktop) — SaaS contábil é principalmente acessado em desktop para análises complexas, mas mobile é importante para consultas rápidas e notificações.

---

## 4. Technical Assumptions

### Repository Structure

**Monorepo** (recomendado)

Justificativa:
- Código compartilhado entre Frontend e Backend (tipos TypeScript, utilitários, schemas de validação)
- Facilita sincronização de mudanças na base RAG entre serviços
- Ferramentas modernas (Turborepo, Nx) tornam monorepo escalável
- Estrutura esperada:
  ```
  agente-tributario/
  ├── apps/
  │   ├── web/          (Next.js frontend)
  │   └── api/          (Backend Node.js/Express ou Next.js API routes)
  ├── packages/
  │   ├── shared/       (tipos, utilitários, schemas)
  │   ├── rag/          (sistema RAG legislativo)
  │   └── ai-agent/     (agente de IA)
  ├── docs/             (documentação)
  └── turbo.json        (configuração Turborepo)
  ```

### Service Architecture

**Arquitetura Monolítica com Separação de Camadas** (evoluir para microserviços se necessário)

Justificativa:
- MVP começa monolítico para rapidez de iteração
- Camadas: Presentation (Next.js) → API (Controllers) → Business Logic → Data Access → Database
- Serviços especializados para:
  - **RAG / Legislação:** Job scheduler (cron) que atualiza base semanal/mensalmente
  - **Agente de IA:** Integração com OpenAI API (ou similar) com cache de respostas
  - **Processamento de CNPJ:** Integração com API externa (ex: BRData, Serpro) para trazer dados automaticamente
- Banco de dados: **PostgreSQL** (relacional, suporta JSON para dados semi-estruturados, escalável)
- Cache: **Redis** (respostas de IA, dados de legislação frequentemente acessados)

### Testing Requirements

**Full Testing Pyramid:**
- **Unit Tests:** 80% de cobertura (lógica de negócio, cálculos tributários, validações)
- **Integration Tests:** APIs integrando com banco de dados, RAG, serviço de IA
- **E2E Tests:** Fluxos críticos (onboarding via CNPJ, análise comparativa de regimes, chat com agente)
- **Manual Testing:** Conformidade LGPD, experiência de usuário em mobile/tablet

Ferramentas sugeridas:
- **Unit/Integration:** Jest + Testing Library (React)
- **E2E:** Playwright ou Cypress
- **Load Testing:** k6 ou Locust (validar NFR de 100 req/s)

### Additional Technical Assumptions and Requests

- **Autenticação:** NextAuth.js (integrado com Next.js, suporta OAuth2, email/senha)
- **Estado Frontend:** Zustand (recomendado no preset, leve e simples)
- **Styling:** Tailwind CSS + componentes customizados (ou shadcn/ui para acelerar)
- **Versionamento de API:** RESTful com versioning (`/api/v1/...`)
- **Rate Limiting:** Implementar rate limit no agente de IA (usuários free vs. premium)
- **Logging & Monitoring:** Winston (logs) + Sentry (error tracking) para garantir NFR12 (auditoria)
- **CI/CD:** GitHub Actions (simples, integrado com GitHub)
- **Deployment:** Vercel (frontend) + Railway/Heroku ou selbst-hosted Node.js (backend)
- **Banco de Dados em Nuvem:** Supabase (PostgreSQL gerenciado) ou AWS RDS
- **Armazenamento de Arquivos:** S3 ou Cloudinary (para documentos, certificados)

---

## 5. Epic List

### Epic 1: Foundation & Core Infrastructure
Estabelecer a fundação técnica e operacional do Agente Tributário: infraestrutura em nuvem, autenticação segura, banco de dados relacional, e primeira feature de valor ao usuário — onboarding via CNPJ que carrega automaticamente dados da empresa. Este epic também entrega a estrutura básica de API, validações e logging para futuras features.

### Epic 2: Análise Tributária & Comparador de Regimes
Implementar o core value do Agente Tributário — engine de análise tributária que compara três regimes (Simples Nacional, Lucro Presumido, Lucro Real) e recomenda o mais adequado baseado em dados reais da empresa (CNAE, faturamento, tipo de receita). Suportar dashboards analíticos e histórico de transições de regime.

### Epic 3: Dashboard Diferenciado por Perfil
Criar dashboards específicos para cada perfil de usuário (Empresário e Contador), exibindo dados relevantes e KPIs tailored. O Empresário vê visão consolidada do seu negócio (regime, enquadramento, recomendações); o Contador vê portfólio de múltiplos clientes com status e alertas consolidados. Dashboards são a porta de entrada após autenticação e guiam as próximas ações.

### Epic 4: Agente de IA Conversacional
Integrar um agente de IA (GPT-4 ou similar) com base RAG legislativa atualizada, permitindo usuários fazer perguntas sobre tributação em linguagem natural (texto e voz) e receber respostas contextualizadas e precisas. O agente é acessível desde qualquer tela (chat flutuante) e será atualizado com novos documentos legislativos automaticamente. Este epic é o diferencial competitivo do Agente Tributário.

### Epic 5: Modelo de Monetização & Gestão Multi-Empresa
Implementar o modelo de monetização híbrido do Agente Tributário: venda direta a empresários, venda a contadores, e modelo de referral (contador repassa cliente com valor diferenciado). Suportar gestão de múltiplas empresas/filiais para contadores, ativar/desativar clientes, e rastrear revenue por stream. Este epic conecta valor técnico com viabilidade comercial.

### Epic 6: Automação & Alertas Proativos
Implementar notificações de mudanças legislativas, alertas automáticos do Contador para seus clientes, e job scheduler para atualização periódica da base RAG legislativa. Este epic transforma o Agente Tributário de ferramenta passiva para sistema proativo que entrega valor continuamente, aumentando retenção e diferencial competitivo.

---

## 6. Epic Details

### Epic 1: Foundation & Core Infrastructure

#### Story 1.1: Project Setup, CI/CD, e Estrutura Base

**Como** Desenvolvedor,
**Quero** ter um projeto estruturado com CI/CD pronto,
**Para que** eu possa fazer deploy seguro e iterativo do Agente Tributário.

**Acceptance Criteria:**
1. Repositório monorepo criado no GitHub com Turborepo configurado
2. Estrutura de pastas implementada: `apps/web`, `apps/api`, `packages/shared`, `packages/rag`, `packages/ai-agent`
3. Next.js 16+ configurado em `apps/web` com TypeScript e Tailwind CSS
4. Node.js + Express (ou Next.js API routes) configurado em `apps/api`
5. GitHub Actions configurado com pipeline de: lint → type-check → test → deploy (staging)
6. Variáveis de ambiente configuradas (.env.example, .env.local, .env.production)
7. Docker Compose (opcional) para desenvolvimento local com PostgreSQL + Redis
8. README.md com instruções de setup e desenvolvimento
9. Linting (ESLint) e formatting (Prettier) configurados e rodando em CI/CD
10. Testes unitários básicos rodam com sucesso (Jest configurado)

---

#### Story 1.2: Banco de Dados PostgreSQL e Schema Base

**Como** Arquiteto/DBA,
**Quero** ter um banco de dados relacional estruturado com migrations,
**Para que** eu possa armazenar dados de usuários, empresas e configurações de forma segura e escalável.

**Acceptance Criteria:**
1. PostgreSQL 15+ provisionado (Supabase, AWS RDS, ou local via Docker)
2. Schema base criado com tabelas: `users`, `companies`, `company_users`, `audit_logs`
3. Migrations setup com Prisma ORM (ou Typeorm)
4. Relacionamentos definidos: User (1..N) Company, User (1..N) Audit Logs
5. Índices criados em campos frequentemente consultados (email, cnpj, user_id)
6. Política de backup automático ativada (se usar serviço gerenciado)
7. Criptografia em repouso configurada para campos sensíveis (CNPJ, dados financeiros)
8. Script de seed com dados de teste (usuários dummy, empresas de exemplo)
9. Migrations versionadas e testáveis (teste de up/down migration)
10. Documentação do schema gerada (ex: dbdocs.io ou equivalente)

---

#### Story 1.3: Autenticação e Autorização (NextAuth.js + RBAC)

**Como** Usuário,
**Quero** me autenticar via email/senha ou OAuth2,
**Para que** eu tenha acesso seguro à minha conta e dados.

**Acceptance Criteria:**
1. NextAuth.js integrado no Next.js com suporte a email/senha
2. Senha criptografada com bcrypt (ou equivalente) no banco
3. Sessão JWT ou cookie seguro (httpOnly, secure, sameSite)
4. Roles implementadas: `admin`, `contador`, `empresario`
5. Middleware de autorização (RBAC) — verificar role em rotas protegidas
6. Login page + Signup page com validações frontend/backend
7. Logout funcional com limpeza de sessão
8. "Forgot password" com reset via email (Resend ou SendGrid)
9. Testes unitários para autenticação (login, signup, logout, reset password)
10. Integração com Google OAuth2 (opcional para MVP, mas recomendado)
11. Rate limiting em endpoints de login/signup (máx 5 tentativas em 15 min)
12. Logging de acesso (quem, quando, IP) para auditoria LGPD

---

#### Story 1.4: Integração com API de CNPJ e Onboarding Inteligente

**Como** Empresário,
**Quero** criar minha conta inserindo apenas meu CNPJ,
**Para que** a plataforma carregue automaticamente dados da minha empresa (atividades, regime tributário, estado).

**Acceptance Criteria:**
1. Integração com API externa (BRData, Serpro, ou equivalente) para consultar dados de CNPJ
2. Após login, usuário empresário vê formulário de onboarding com campo CNPJ
3. Ao inserir CNPJ válido, sistema carrega: razão social, atividades econômicas (CNAE), UF, regime tributário atual
4. Validação de CNPJ (algoritmo de dígito verificador)
5. Dados carregados são pré-preenchidos em formulário (usuário pode editar antes de confirmar)
6. Após confirmação, empresa é criada e vinculada ao usuário
7. Usuário é redirecionado ao dashboard (Story 3.1)
8. Tratamento de erro: CNPJ inválido, API indisponível, CNPJ já existe na plataforma
9. Logs de cada integração com API externa (para auditoria, debugging, rate limiting)
10. Testes com múltiplos CNPJs reais (serviço, produto, construção civil)

---

#### Story 1.5: Base RAG Inicial e Data Pipeline

**Como** Admin/Sistema,
**Quero** ter uma base de dados RAG com legislação tributária brasileira,
**Para que** o agente de IA (Epic 4) possa consultar legislação atualizada.

**Acceptance Criteria:**
1. Base RAG (Retrieval-Augmented Generation) criada com textos de legislação tributária (Reforma Tributária, Simples Nacional, Lucro Presumido, Lucro Real)
2. Documentos armazenados em vector database (Pinecone, Weaviate, ou Milvus) com embeddings
3. Data pipeline criado: ingesta de textos legislativos → chunking → embedding → armazenamento
4. Script de atualização manual (para MVP) que permite adicionar novos documentos
5. Protótipo de job scheduler (cron) que fará atualizações semanais (implementação completa em Epic 6)
6. Busca por similaridade de texto implementada e testável
7. Documentos versionados (data de atualização, fonte da legislação)
8. Testes: validar que buscas semânticas retornam documentos relevantes
9. Documentação de como adicionar novos documentos à base
10. Base RAG populada com mínimo 50 documentos/seções de legislação tributária

---

### Epic 2: Análise Tributária & Comparador de Regimes

#### Story 2.1: Classificação Fiscal Automática por CNAE e Tipo de Receita

**Como** Empresário,
**Quero** que o sistema classifique automaticamente minhas receitas (serviço vs. produto) baseado no meu CNAE,
**Para que** eu tenha visibilidade clara de como cada tipo de receita impacta meu regime tributário.

**Acceptance Criteria:**
1. Tabela `receipt_classifications` criada com mapeamento CNAE → tipos de receita (serviço, produto, ambos)
2. Dados de receita empresário são classificados automaticamente ao serem lançados (ou ao editar empresa)
3. Interface permite reclassificação manual se empresa tiver exceções
4. Histórico de reclassificações mantido (auditoria)
5. Validação: duas empresas com mesmo CNAE têm mesma classificação padrão
6. Testes com múltiplos CNAEs (construção, consultoria, comércio, tecnologia)
7. API endpoint `GET /api/v1/companies/:id/receipt-classifications` retorna classificações atuais
8. Documentação de regras de classificação por CNAE
9. Relatório mostrando % de receita por tipo (serviço vs. produto)
10. Performance: classificação deve ser < 100ms mesmo com muitas receitas

---

#### Story 2.2a: Engine de Cálculo Tributário — Simples Nacional

**Como** Sistema,
**Quero** calcular impostos sob o regime Simples Nacional baseado em dados reais da empresa,
**Para que** eu possa oferecer cálculos precisos para comparação.

**Acceptance Criteria:**
1. Engine implementado em `packages/shared` com função `calculateSimples(faturamento, cnae, uf, tipo_receita)`
2. Cálculo de faixas de faturamento anual:
   - Faixa 1: até R$ 180k → alíquota X%
   - Faixa 2: R$ 180k - R$ 360k → alíquota Y%
   - Faixa 3: R$ 360k - R$ 540k → alíquota Z%
   - (Aplicar tabela atual de 2024-2026 com atualizações)
3. Impostos federais consolidados: IRPJ, CSLL, PIS, COFINS, INSS (tudo em uma alíquota unificada por faixa)
4. Cálculo de ISS (imposto municipal, varia por UF e tipo de serviço)
5. Validações:
   - Empresa deve ter faturamento < R$ 4,8M (limite legal)
   - Profissionais liberais são excluídos automaticamente
   - Tipo de receita (serviço vs. produto) influencia alíquota
6. Retorno: `{ base_calculo, irpj, csll, pis, cofins, inss, iss, total_impostos, aliquota_efetiva }`
7. Testes unitários com 10+ cenários (diferentes faixas, CNAEs, UFs)
8. Testes de regressão: mesma entrada sempre retorna mesmo resultado
9. Documentação de fórmulas e fontes (RFB, SEBRAE)
10. Performance: cálculo < 20ms

---

#### Story 2.2b: Engine de Cálculo Tributário — Lucro Presumido e Lucro Real

**Como** Sistema,
**Quero** calcular impostos sob Lucro Presumido e Lucro Real,
**Para que** eu tenha cálculos completos para os três regimes.

**Acceptance Criteria:**
1. Função `calculatePresumido(faturamento, cnae, uf, despesas_dedutiveis)`
   - Faturamento → lucro presumido por percentual (variam por CNAE: 8%, 16%, 32%)
   - Cálculo de IRPJ (15% sobre lucro presumido + adicional de 10% se > R$ 20k)
   - Cálculo de CSLL (9% sobre lucro presumido)
   - Cálculo de PIS, COFINS, ISS
   - Validação: faturamento < R$ 78M, empresa deve estar enquadrada
   - Retorno: estrutura idêntica à Simples (compatibilidade)

2. Função `calculateReal(faturamento, cnae, uf, custos, despesas_dedutiveis, adições_exclusões)`
   - Base: faturamento - custos - despesas dedutíveis + adições/exclusões tributárias
   - Cálculo de IRPJ (15% + 10% de adicional)
   - Cálculo de CSLL (9%)
   - Cálculo de PIS, COFINS, ISS
   - Aplicar regras de despesas não dedutíveis (padrão RFB)
   - Retorno: estrutura compatível

3. Validação de elegibilidade:
   - Presunção: faturamento < R$ 78M
   - Real: sem limite (obrigatório se faturamento > R$ 78M ou atividade específica)

4. Testes unitários: 10+ cenários por regime
5. Testes integrados: Simples vs. Presumido vs. Real com mesmo faturamento (valores devem fazer sentido)
6. Testes de edge cases: empresa em limiar de transição (R$ 78M), empresa com grandes despesas (Lucro Real é melhor)
7. Documentação detalhada de fórmulas
8. Performance: cálculo < 20ms cada

---

#### Story 2.3: Comparador Visual de Regimes com Recomendação

**Como** Empresário,
**Quero** ver lado-a-lado uma comparação de quanto pagaria em cada regime,
**Para que** eu possa entender qual regime é melhor para meu negócio.

**Acceptance Criteria:**
1. Tela "Análise Comparativa" implementada com tabela comparativa:
   - Colunas: Simples Nacional | Lucro Presumido | Lucro Real
   - Linhas: Base de cálculo, IRPJ, CSLL, PIS, COFINS, ISS, Total, Alíquota Efetiva
2. Dados são carregados da Story 2.2 (engine de cálculo)
3. Destaque visual da coluna com regime mais econômico
4. Mensagem de recomendação: "Regime X é R$ Y mais vantajoso"
5. Observações/warnings: ex. "Empresa não pode ser Simples (faturamento > 78M)"
6. Gráfico comparativo de custos (bar chart ou similar)
7. Simulador interativo: usuário pode ajustar faturamento/despesas e ver impacto em tempo real
8. Botão "Solicitar Troca de Regime" (prototipo para future story)
9. PDF download do relatório comparativo
10. Responsivo (mobile, tablet, desktop)
11. Testes E2E: usuário insere dados, vê comparação, interpreta recomendação

---

#### Story 2.4: Histórico de Transições de Regime e Análise de Impacto

**Como** Contador,
**Quero** ver histórico completo de regimes tributários de uma empresa (passado, presente, futuro simulado),
**Para que** eu possa aconselhar clientes sobre transições e impactos financeiros.

**Acceptance Criteria:**
1. Tabela `regime_history` criada: empresa_id, regime_anterior, regime_novo, data_transição, motivo, impacto_financeiro
2. Interface timeline mostrando: "Jan 2024: Simples → Lucro Presumido (economia R$ 15k/ano)"
3. Cada transição registra:
   - Data da mudança
   - Regime anterior e novo
   - Justificativa (entrada de novo sócio, mudança de faturamento, etc.)
   - Cálculo de impacto (quanto economizou ou perdeu)
4. Comparação período-a-período: "Em 2024, trocar de Simples para Presumido renderia R$ 50k"
5. Alertas: "Atenção: você se tornou obrigado a Lucro Real em 30 dias (faturamento > 78M)"
6. Dashboard contador mostra histórico de todos seus clientes (com filtros)
7. Exportar histórico em PDF/CSV
8. Testes: simular transição, validar cálculo de impacto
9. Auditoria: quem fez a transição, quando, por quê
10. Compliance: histórico mantido por mínimo 5 anos (LGPD)

---

### Epic 3: Dashboard Diferenciado por Perfil

#### Story 3.1: Dashboard Empresário — Visão do Negócio

**Como** Empresário,
**Quero** ver ao abrir a plataforma um dashboard que resume meu negócio e posição tributária,
**Para que** eu possa tomar decisões rápidas sobre meu regime tributário.

**Acceptance Criteria:**
1. Dashboard layout responsivo (mobile, tablet, desktop) com 4-5 seções principais:
   - **Seção 1 - Sumário da Empresa:** Razão social, CNPJ, UF, CNAE, regime tributário atual (destaque visual)
   - **Seção 2 - KPI de Faturamento:** Faturamento acumulado (YTD), projeção anual, comparação com período anterior
   - **Seção 3 - Análise Tributária Rápida:** Card mostrando economia/custo do regime atual vs. recomendado (chamada para ação "Ver Análise Completa")
   - **Seção 4 - Enquadramento Fiscal:** Breakdown % de receita por tipo (serviço vs. produto) com gráfico pie/donut
   - **Seção 5 - Alertas & Ações:** Notificações recentes (mudança legislativa, próximo vencimento, etc.)

2. Cards são interativos: clicar em "Regime Tributário" leva para Story 2.3 (Comparador)
3. Gráficos dinâmicos (Chart.js, Recharts ou similar) com dados em tempo real
4. Dados podem ser filtrados por período (últimos 30 dias, 3 meses, YTD)
5. Botão destacado "Consultar Agente de IA" leva para chat (Epic 4)
6. Responsivo: em mobile, seções colapsam em abas ou scroll vertical
7. Performance: dashboard carrega em < 2 segundos
8. Testes E2E: usuário faz login, vê dashboard, interage com cards
9. Testes de dados: validar que números de faturamento batem com dados reais
10. Accessibility: WCAG AA (alt text em gráficos, navegação por teclado)

---

#### Story 3.2: Dashboard Contador — Portfólio Multi-Empresa

**Como** Contador,
**Quero** ver ao abrir a plataforma um dashboard com visão consolidada de meus clientes,
**Para que** eu possa acompanhar portfólio e identificar clientes que precisam de ação.

**Acceptance Criteria:**
1. Dashboard layout com 2-3 seções principais:
   - **Seção 1 - Lista de Empresas:** Tabela/grid das empresas clientes com colunas: Nome, CNPJ, Regime, Faturamento (YTD), Status, Última Ação, Alertas
   - **Seção 2 - KPI Consolidado:** Total de clientes, faturamento consolidado, economia tributária gerada, alertas pendentes
   - **Seção 3 - Análise de Portfólio:** Breakdown de clientes por regime, risco (clientes próximos de transição), oportunidades (clientes que poderiam economizar)

2. Cada empresa é clicável → drill-down para visão detalhada (Story 3.3)
3. Filtros: por regime, por UF, por status (ativo/inativo), por alertas
4. Ordenação: por faturamento, por data de atualização, por alertas
5. Ações rápidas: botão "Enviar Alerta" ou "Gerar Relatório" para cliente específico
6. Gráficos: distribuição de clientes por regime, evolução de faturamento consolidado
7. Exportar relatório de portfólio (PDF/CSV)
8. Responsivo (mobile mostra versão simplificada com cards ao invés de tabela)
9. Performance: carrega < 2 segundos mesmo com 100+ clientes
10. Testes E2E: contador faz login, vê portfólio, clica em cliente, drill-down funciona
11. Testes de dados: validar soma consolidada de faturamentos

---

#### Story 3.3: Dashboard Contador — Visão Detalhada de Cliente Individual

**Como** Contador,
**Quero** clicar em um cliente e ver visão detalhada com todas as informações relevantes,
**Para que** eu possa assessorar cliente e identificar oportunidades de otimização tributária.

**Acceptance Criteria:**
1. Ao clicar em empresa na Story 3.2, abre página com:
   - **Cabeçalho:** Razão social, CNPJ, UF, CNAE, telefone, email (dados de contato)
   - **Seção 1 - Regime Tributário:** Regime atual, data de enquadramento, histórico de transições (link para Story 2.4)
   - **Seção 2 - Faturamento:** Gráfico de evolução mensal, projeção anual, comparação com período anterior
   - **Seção 3 - Análise Comparativa:** Resumo da análise de regimes (link para Story 2.3 completo)
   - **Seção 4 - Alertas Específicos:** Notificações diretas para este cliente (mudanças legislativas, vencimentos, etc.)
   - **Seção 5 - Ações do Contador:** Botões para enviar alerta/dica automatizada, gerar relatório, simular transição de regime

2. Dados vêm das mesmas fontes (Stories 2.2-2.4), apenas filtrados por empresa
3. Contador pode editar alguns dados (ex: regime reportado, ajustes manuais)
4. Auditoria: logs de quem editou o quê e quando
5. Integração com comunicação: contador pode disparar alerta direto para cliente (protótipo de Epic 6)
6. Responsivo: em mobile, seções em abas
7. Performance: < 2 segundos
8. Testes E2E: contador abre cliente, edita regime, vê auditoria

---

#### Story 3.4: Admin Panel — Gestão de Usuários, Empresas e Configurações

**Como** Administrador,
**Quero** ter acesso a um painel onde posso gerenciar usuários, empresas, regimes tributários e configurações,
**Para que** eu possa manter a plataforma operacional e segura.

**Acceptance Criteria:**
1. Admin Panel com menu lateral com seções:
   - **Usuários:** CRUD de usuários (criar, editar, desativar), visualizar últimos acessos, resetar senha, mudar role
   - **Empresas:** CRUD de empresas (forçar delete se necessário), visualizar histórico de mudanças
   - **Regimes Tributários:** Atualizar tabelas de Simples Nacional (faixas e alíquotas), Presumido (percentuais por CNAE), Real (parâmetros)
   - **Configurações:** Parametrização da plataforma (ISS por município, taxas de referral, limites de requisições IA, etc.)
   - **Relatórios Operacionais:** Dashboard de uso (MAU, DAU, requisições à IA, erros, performance)
   - **Logs de Auditoria:** Visualizar logs de todas as ações sensíveis (login, mudança de regime, edições)

2. Cada seção tem:
   - Listagem com filtros/busca
   - Paginação
   - Ações em bulk (ex: desativar múltiplos usuários)
   - Confirmação para ações destrutivas (delete)

3. Permissões: somente admin pode acessar
4. Auditoria completa: quem, o quê, quando para qualquer mudança
5. Backup automático antes de alterações críticas
6. Performance: listagens carregam em < 1 segundo mesmo com milhares de registros
7. Testes: admin cria usuário, edita regime, visualiza logs
8. Validações: não permitir criar usuário com email duplicado, regime com alíquota > 100%, etc.

---

### Epic 4: Agente de IA Conversacional

#### Story 4.1: Integração com OpenAI API e Chat Interface Básica

**Como** Usuário,
**Quero** abrir um chat e fazer perguntas sobre tributação,
**Para que** eu receba respostas imediatas sem deixar a plataforma.

**Acceptance Criteria:**
1. Integração com OpenAI API (GPT-4 ou GPT-4o):
   - API key armazenada seguramente em variáveis de ambiente
   - Função `callOpenAI(userMessage, context)` implementada em `packages/ai-agent`
   - Sistema de prompts: definir persona do agente ("Você é um especialista em tributação brasileira...")

2. Chat Interface:
   - Widget flutuante (canto inferior direito) ou página dedicada
   - Mensagens aparecem em tempo real (streaming de resposta)
   - Histórico de conversa mantido por sessão (até refresh da página)
   - Input box com botão "Enviar"
   - Indicador de "digitando..."

3. Rate Limiting:
   - Máx 10 mensagens/minuto por usuário (free tier)
   - Máx 100 mensagens/dia por usuário (free tier)
   - Premium users: sem limite (ou limite maior)

4. Error Handling:
   - Timeout na API (retornar "Desculpe, tente novamente")
   - Rate limit excedido (notificar usuário)
   - Mensagem muito longa (truncar ou avisar)

5. Logging:
   - Cada pergunta e resposta são logadas (auditoria, melhorias futuras)
   - Logs incluem: timestamp, user_id, empresa_id, mensagem, resposta, tokens usados

6. Testes:
   - Teste unitário: função `callOpenAI` retorna resposta válida
   - Teste E2E: usuário abre chat, faz pergunta, recebe resposta
   - Teste de rate limiting: verificar que limite é respeitado
   - Teste de timeout: simular API indisponível

7. Performance: resposta deve começar a aparecer em < 2 segundos

---

#### Story 4.2: Integração de Base RAG (Retrieval-Augmented Generation)

**Como** Agente de IA,
**Quero** consultar documentos legislativos relevantes antes de responder,
**Para que** minhas respostas sejam precisas e atualizadas com a legislação vigente.

**Acceptance Criteria:**
1. RAG Pipeline:
   - Função `retrieveRelevantDocs(userQuestion)` em `packages/ai-agent`
   - Busca semântica na vector database (Pinecone, Weaviate ou similar) por similaridade com pergunta
   - Retorna top 3-5 documentos mais relevantes com score de similaridade

2. Prompt Enhancement:
   - Documentos recuperados são concatenados no prompt da IA
   - Exemplo prompt: "Baseado nos seguintes documentos legislativos: [DOCS], responda a pergunta: [PERGUNTA]"
   - Instruir IA a citar fonte: "De acordo com a Lei X, artigo Y..."

3. Context Awareness:
   - RAG considera contexto da empresa (regime, CNAE, UF)
   - Ex: se usuário é de SP e pergunta sobre ISS, trazer documentação do ISS em SP
   - Se empresa está em Simples, trazer documentos sobre Simples e exceções

4. Quality Assurance:
   - Se nenhum documento relevante é encontrado (score < 0.5), avisar: "Não encontrei legislação específica sobre isso"
   - Limite de documentos incluídos no prompt (evitar exceder token limit da IA)

5. Versionamento de Documentos:
   - Rastrear versão de cada documento (data de atualização)
   - Avisar se documento é antigo: "Esta informação data de 2024, pode estar desatualizada"

6. Testes:
   - Teste de busca: pergunta sobre "Simples Nacional" retorna documentos sobre Simples
   - Teste de contexto: mesma pergunta com empresas diferentes retorna docs diferentes
   - Teste de relevância: score de similaridade é confiável
   - Teste de truncamento: resposta não excede token limit

7. Performance: busca no RAG < 500ms

---

#### Story 4.3: Suporte a Entrada por Voz (STT + TTS)

**Como** Usuário em movimento,
**Quero** fazer perguntas ao agente usando voz,
**Para que** eu não precise digitar e tenha respostas também em áudio.

**Acceptance Criteria:**
1. Speech-to-Text (STT):
   - Botão de microfone no chat interface
   - Clicar inicia gravação de áudio (máx 60 segundos)
   - Integração com Web Speech API (browser nativo) ou serviço pago (Google Cloud Speech-to-Text, Deepgram)
   - Transcrição em tempo real (ou ao terminar gravação)
   - Indicador visual: "Ouvindo..." → "Processando..." → texto transcrito

2. Text-to-Speech (TTS):
   - Resposta do agente é lida em voz (Web Audio API ou serviço pago)
   - Usuário pode ativar/desativar áudio (toggle)
   - Velocidade de fala ajustável (1x, 1.25x, 1.5x)
   - Suporte a português brasileiro

3. Integração:
   - Fluxo: usuário fala → STT transcreve → agente processa (Story 4.1-4.2) → resposta gerada → TTS lê em voz
   - Latência total: < 5 segundos de gravação para áudio de resposta

4. Error Handling:
   - Microfone não disponível (navegador não suporta): mostrar fallback (input de texto)
   - STT falhou (áudio muito ruim): pedir para repetir
   - TTS não disponível: continuar apenas com texto

5. Privacy:
   - Áudio gravado não é salvo no servidor (apenas texto transcrito)
   - Usuário pode optar por não coletar áudio

6. Accessibility:
   - Botão de voz é acessível por teclado
   - Transcrição é exibida (não apenas áudio)

7. Testes:
   - Teste STT: gravar áudio, validar transcrição correta
   - Teste TTS: resposta é lida em voz clara
   - Teste latência: medir tempo total
   - Teste em múltiplos navegadores (Chrome, Firefox, Safari)

8. Performance: gravação + transcrição + resposta + áudio < 5 segundos

---

#### Story 4.4: Histórico de Conversa Persistente e Contexto Multi-Turno

**Como** Usuário,
**Quero** que o agente lembre das minhas perguntas anteriores e mantenha contexto na conversa,
**Para que** eu possa ter diálogos naturais ("E se eu mudasse para Presumido?" sem repetir dados).

**Acceptance Criteria:**
1. Persistência:
   - Histórico de conversa é salvo em banco de dados (tabela `chat_history`)
   - Campos: user_id, empresa_id, mensagem_user, resposta_ai, timestamp, tokens_usados
   - Usuário pode acessar histórico anterior (filtrar por data, empresa, palavras-chave)

2. Contexto Multi-Turno:
   - Próximas 5-10 mensagens anteriores são incluídas no prompt da IA
   - IA compreende referências: "você estava perguntando sobre regime?" refere-se ao Simples
   - Trade-off: mais contexto = mais tokens = custo maior

3. Limpeza de Histórico:
   - Usuário pode deletar histórico (LGPD compliance)
   - Dados deletados são permanentemente removidos

4. Testes:
   - Teste E2E: usuário faz pergunta A, depois pergunta B referenciando A, IA responde corretamente
   - Teste de contexto: incluir histórico melhora qualidade de resposta
   - Teste de limpeza: deletar histórico remove dados do DB

---

#### Story 4.5: Integração com Dados da Empresa (Contexto Automático)

**Como** Agente de IA,
**Quero** acessar dados da empresa do usuário (regime, CNAE, faturamento),
**Para que** minhas respostas sejam personalizadas e precisas para o negócio específico.

**Acceptance Criteria:**
1. Context Injection:
   - Ao iniciar chat, carregamento automático de: regime_atual, cnae, uf, faturamento_ytd, tipo_receita
   - Contexto é passado ao agente na primeira mensagem (sistema prompt)
   - Exemplo: "Você está conversando com um empresário de consultoria em SP, regime Simples, faturamento R$ 300k YTD"

2. Referência Dinâmica:
   - IA pode sugerir ações baseadas em dados: "Você está próximo do limite de Simples (R$ 360k). Quer ver análise de Presumido?"
   - Se faturamento muda, contexto é atualizado automaticamente

3. Recomendações Contextualizadas:
   - "Para sua atividade (CNAE X) em Simples, você paga Y% de imposto"
   - Ofertar simulação automática: "Quer simular a mudança para Presumido?"

4. Testes:
   - Teste: empresário de Simples pergunta sobre ISS, recebe info sobre seu ISS específico
   - Teste: contador pergunta sobre Lucro Real (aplicável para grandes clientes), recebe info geral
   - Teste: mudança de regime atualiza contexto

---

#### Story 4.6: Feedback e Melhoria Contínua do Agente

**Como** Usuário,
**Quero** avaliar respostas do agente (polegar para cima/baixo),
**Para que** o sistema melhore e aprenda com erros.

**Acceptance Criteria:**
1. UI de Feedback:
   - Botões "👍 Útil" e "👎 Não útil" abaixo de cada resposta
   - Campo opcional: "Por quê?" (texto livre)

2. Coleta de Dados:
   - Feedback é salvo em tabela `chat_feedback` (pergunta, resposta, rating, comentário, user_id)
   - Não afeta diretamente a IA (não é fine-tuning automático em produção)

3. Análise:
   - Admin pode visualizar relatório de feedback (% útil vs. não útil, tópicos problemáticos)
   - Identificar padrões: "Respostas sobre ISS municipal têm taxa 20% de não útil"

4. Iteração Manual:
   - PM/Admin identifica gaps e ajusta prompt do agente ou adiciona documentos ao RAG
   - Feedback informa priorização de novos documentos legislativos

5. Testes:
   - Teste E2E: usuário avalia resposta, feedback é salvo
   - Teste de análise: relatório agrupa feedback por tópico corretamente

---

### Epic 5: Modelo de Monetização & Gestão Multi-Empresa

#### Story 5.1: Gestão Multi-Empresa e Multi-Filial para Contador

**Como** Contador,
**Quero** gerenciar múltiplas empresas clientes (meu próprio portfólio),
**Para que** eu possa atender a diversos clientes em uma única conta.

**Acceptance Criteria:**
1. Modelo de Dados:
   - Tabela `user_companies`: relação N-N entre usuários (tipo Contador) e empresas
   - Tabela `company_branches`: filial identificada por CNPJ raiz + sufixo (00, 01, 02...)
   - Campos: company_id, branch_name, cnpj_filial, uf_filial, ativo (bool)

2. Interface de Gestão:
   - Contador acessa seção "Meus Clientes" → lista de empresas vinculadas
   - Ação: Adicionar nova empresa (via CNPJ, integração Story 1.4)
   - Ação: Gerenciar filiais (adicionar, editar, desativar)
   - Ação: Remover cliente (se desvinculação)

3. Controle de Acesso:
   - Contador vê apenas empresas que ele gerencia (não acesso a outros clientes)
   - Validação: quando contador clica em empresa, verificar se tem permissão

4. Drill-Down por Filial:
   - Contador clica em empresa → vê lista de filiais
   - Clica em filial → drill-down para análise específica (regime, faturamento, alertas)
   - Filiais em UFs diferentes têm análises independentes (ISS varia por estado)

5. Sincronização de Dados:
   - Cada filial tem dados independentes (podem ter regimes diferentes)

6. Testes:
   - Teste E2E: contador adiciona empresa, adiciona filial, acessa drill-down
   - Teste de acesso: contador não consegue acessar empresa de outro contador
   - Teste com múltiplas filiais: análises por filial estão corretas

---

#### Story 5.2: Modelo de Referral (Contador Libera Cliente com Valor Diferenciado)

**Como** Contador,
**Quero** liberar acesso da plataforma para meus clientes empresários com um desconto especial,
**Para que** eu ganhe uma comissão e meus clientes tenham preço melhor.

**Acceptance Criteria:**
1. Fluxo de Referral:
   - Contador vai a "Meus Clientes" → clica em empresa → botão "Liberar para Cliente"
   - Sistema gera link de convite único (token com expiração 30 dias)
   - Contador copia link e envia para cliente
   - Cliente clica no link → é redirecionado a sign-up com empresa pré-preenchida
   - Cliente cria conta → plano de referral é ativado automaticamente

2. Modelo de Preço:
   - **Empresário Direto:** R$ 99/mês (ou valor definido)
   - **Empresário via Referral:** R$ 79/mês (desconto 20%)
   - **Contador (gerencia múltiplos):** R$ 299/mês (ou valor definido)
   - **Contador recebe comissão:** (99 - 79) = R$ 20/mês por cliente referenciado

3. Limite de Clientes:
   - Contador pode referenciar até N clientes (definir em Story 5.5)
   - Após limite, upgrade de plano oferecido

4. Rastreamento:
   - Tabela `referrals`: contador_id, empresa_id, data_referral, comissao_mensal, ativo
   - Dashboard contador mostra: "10 clientes diretos, comissão R$ 200/mês"

5. Cancelamento:
   - Se cliente cancela assinatura → referral é desativada
   - Se contador remove cliente → referral é desativada

6. Testes:
   - Teste E2E: contador libera cliente, cliente clica link, cria conta, é vinculado
   - Teste de preço: verificar que cliente referral paga valor menor
   - Teste de comissão: contador vê comissão correta no dashboard

---

#### Story 5.3: Sistema de Pagamento (Stripe/PagSeguro Integration)

**Como** Sistema,
**Quero** processar pagamentos de subscriptions,
**Para que** eu possa cobrar usuários e gerar receita.

**Acceptance Criteria:**
1. Integração com Gateway de Pagamento:
   - Escolha: Stripe (recomendado para SaaS) ou PagSeguro (se preferir BR)
   - Stripe será utilizado

2. Fluxo de Pagamento:
   - Usuário clica "Assinar" → redirecionado a Stripe Checkout
   - Stripe Checkout coleta dados de cartão
   - Após pagamento bem-sucedido → webhook notifica backend
   - Backend ativa subscription do usuário

3. Subscriptions:
   - Tabela `subscriptions`: user_id, plano (free/empresario/contador), status (active/canceled/overdue), data_inicio, data_proxima_cobranca
   - Cobrança recorrente: Stripe gerencia automaticamente (monthly)

4. Eventos:
   - `subscription.created` → ativar plano
   - `subscription.payment_succeeded` → log de sucesso
   - `subscription.payment_failed` → avisar usuário (retry automático Stripe)
   - `subscription.deleted` → desativar plano

5. Cancelamento:
   - Usuário clica "Cancelar Plano" → Stripe cancela imediatamente
   - Acesso é revogado (ou graceful period até fim do mês)

6. Invoice Management:
   - Usuário pode baixar invoices em PDF
   - Invoice inclui: período, valor, descritivo

7. Testes:
   - Teste: criar subscription com card de teste
   - Teste: simular pagamento bem-sucedido
   - Teste: simular falha de pagamento
   - Teste: cancelamento funciona

---

#### Story 5.4: Dashboard Financeiro (Receita, Comissões, Métricas)

**Como** Admin/PM,
**Quero** ver dashboards de receita, MRR, churn, comissões pagas,
**Para que** eu possa acompanhar saúde financeira da plataforma.

**Acceptance Criteria:**
1. Dashboard Admin → seção "Financeiro" com:
   - **MRR (Monthly Recurring Revenue):** Total de subscriptions ativas × valor médio
   - **ARR:** MRR × 12
   - **Churn Rate:** (canceladas no mês / total anterior) %
   - **ARPU (Average Revenue Per User):** receita total / usuários ativos
   - **Breakdown por modelo:** Direto empresário vs. Contador vs. Referral

2. Gráficos:
   - Evolução de MRR nos últimos 12 meses
   - Breakdown de receita por segmento (pizza)
   - Comissões pagas a contadores (por contador, por mês)

3. Alertas:
   - Churn rate acima de 10% → alerta
   - Taxa de falha de pagamento acima de 5% → alerta

4. Relatórios:
   - Exportar para CSV/PDF: receita mensal, comissões, métricas

5. Testes:
   - Teste: MRR é calculado corretamente (3 usuarios × R$ 99 = R$ 297)
   - Teste: churn rate reflete cancelamentos
   - Teste: comissão é atribuída a contador correto

---

#### Story 5.5: Limites de Plano e Upgrade Path

**Como** Sistema,
**Quero** aplicar limites de uso por plano (ex: contador free pode gerenciar até 3 clientes),
**Para que** eu incentive upgrades e gere mais receita.

**Acceptance Criteria:**
1. Definição de Planos:
   - **Free (Empresário):** 1 empresa, chat unlimited, sem exportação
   - **Pro (Empresário):** 3 empresas, chat unlimited, exportação de relatórios
   - **Premium (Empresário):** unlimited, chat prioritário, suporte 24h
   - **Free (Contador):** 5 clientes, sem referral
   - **Professional (Contador):** 50 clientes, referral ativado
   - **Enterprise (Contador):** unlimited, SLA, suporte dedicado

2. Enforcement de Limites:
   - Quando contador tenta adicionar cliente além do limite → "Upgrade necessário"
   - Oferta de upgrade aparece (modal com planos e preços)

3. Upgrade Flow:
   - Usuário clica "Upgrade" → Stripe Checkout com novo plano
   - Após pagamento → plano é atualizado, novos limites aplicados

4. Downgrade:
   - Se usuário faz downgrade com recursos em uso → aviso (ex: "Você tem 30 clientes, plano novo permite 5")
   - Opção: deletar/arquivar clientes ou manter até limite

5. Free Trial:
   - Novo usuário = 14 dias de trial Pro (full features)
   - Após: downgrade para Free automaticamente (ou convite de upgrade)

6. Testes:
   - Teste: contador free tenta adicionar 6º cliente → bloqueado
   - Teste: upgrade para Pro → limite atualizado
   - Teste: novo usuário recebe trial de 14 dias

---

### Epic 6: Automação & Alertas Proativos

#### Story 6.1: Job Scheduler para Atualização Automática da Base RAG

**Como** Sistema,
**Quero** atualizar automaticamente a base RAG com novas legislações periodicamente,
**Para que** o agente sempre tenha informações atualizadas sem intervenção manual.

**Acceptance Criteria:**
1. Job Scheduler Setup:
   - Ferramenta escolhida: Bull (Redis-backed)
   - Job: `updateRagBase` executado toda segunda-feira às 02:00 AM (horário BR)

2. Data Source de Legislação:
   - Fonte primária: API de legislação (ex: dados.gov.br, Portal da Legislação do Senado)
   - Fonte secundária: Web scraping de sites oficiais (RFB, Senado)
   - Fallback: manual upload de documentos por Admin

3. Pipeline de Atualização:
   - Detectar novos documentos desde última atualização
   - Download e parsing de documentos
   - Chunking (dividir em blocos de 500-1000 tokens)
   - Embedding com OpenAI API (ada-embedding)
   - Upsert na vector database (Pinecone, Weaviate)

4. Versionamento:
   - Cada documento tem timestamp de atualização
   - Histórico de versões mantido (não deletar, apenas marcar como "outdated")
   - Agente pode referir versão antiga se contexto exigir

5. Logging:
   - Job executa: log com quantidade de docs novos, quantidade de chunks, embedding time
   - Se erro: retry automático 3x (exponential backoff)
   - Notificar admin se job falha após retries

6. Notificação:
   - Admin recebe email: "RAG atualizada: 5 novos documentos adicionados"
   - Sumário: qual legislação foi adicionada

7. Testes:
   - Teste: job executa e adiciona documentos
   - Teste: retry funciona em caso de erro
   - Teste: versionamento mantém histórico

---

#### Story 6.2: Notificações de Mudanças Legislativas para Usuários

**Como** Usuário,
**Quero** ser notificado quando houver mudanças legislativas relevantes para meu negócio,
**Para que** eu saiba instantaneamente o que pode impactar meus impostos.

**Acceptance Criteria:**
1. Critério de Relevância:
   - Filtrar documentos novos por critério relacionado à empresa (CNAE, regime, UF)
   - Exemplo: novo documento sobre "ISS em SP" é relevante se empresa está em SP
   - Algoritmo: similaridade semântica (embedding comparison) + metadados (CNAE, UF, regime)

2. Tipos de Notificação:
   - **In-App:** Badge/notificação no dashboard ("3 atualizações legislativas")
   - **Email:** Resumo semanal ou imediato (configurável por usuário)

3. Conteúdo da Notificação:
   - Título: "Atualização Legislativa: ISS em São Paulo"
   - Resumo: 1-2 linhas do documento novo
   - Botão: "Ler Completo" (abre documento na plataforma)
   - Ação secundária: "Consultar Agente de IA" (abre chat com contexto)

4. Preferências de Notificação:
   - Usuário pode configurar: frequência (imediata, semanal, nunca)
   - Usuário pode silenciar notificações de certos tópicos (ex: legislação de Lucro Real se usa Simples)

5. Rastreamento:
   - Tabela `notifications`: user_id, documento_id, timestamp, read (bool), action_taken
   - Analytics: % de notificações lidas, cliques em "Ler Completo"

6. Testes:
   - Teste: novo documento sobre ISS SP gerado → usuário em SP recebe notificação
   - Teste: usuário em MG não recebe notificação sobre ISS SP
   - Teste: notificação marcada como lida
   - Teste E2E: usuário clica notificação → abre documento

---

#### Story 6.3: Alertas Automáticos do Contador para Clientes

**Como** Contador,
**Quero** enviar alertas e dicas automaticamente aos meus clientes baseado em mudanças legislativas ou dados,
**Para que** meus clientes recebam orientações sem eu ter que fazer tudo manualmente.

**Acceptance Criteria:**
1. Template de Alertas:
   - Admin/Contador define templates de mensagens (Contador pode customizar)
   - Exemplo template: "Atenção: Faixa de ISS para sua atividade mudou. Você pode estar pagando mais. Consulte o agente para análise."

2. Gatilhos de Alerta:
   - **Legislativo:** Novo documento sobre regime/CNAE/UF do cliente → alerta automático
   - **Financeiro:** Faturamento do cliente aproxima limite de transição de regime → alerta
   - **Temporal:** Próximo vencimento de declaração/obrigação fiscal → lembrete
   - **Manual:** Contador dispara alerta manual para cliente específico

3. Delivery:
   - In-App: notificação no dashboard do empresário
   - Email: com resumo do alerta
   - Opcional: SMS (se cliente optou in)

4. Personalization:
   - Alerta menciona dados específicos do cliente: "Seu faturamento YTD é R$ 350k (próximo ao limite de R$ 360k do Simples)"
   - Sugestão acionável: "Considere análise de Lucro Presumido"

5. Rastreamento:
   - Tabela `counter_alerts`: contador_id, empresa_id, template_id, data_enviado, status (sent/read/clicked)
   - Dashboard contador mostra: "15 alertas enviados, 10 lidos"

6. Compliance:
   - Usuário pode optar out de alertas automáticos
   - Deletar alerta = removido permanentemente
   - Logs de alertas mantidos para auditoria

7. Testes:
   - Teste: novo documento legislativo → contador recebe alerta para enviar
   - Teste: contador clica "Enviar" → cliente recebe notificação
   - Teste: cliente marca como lido → analytics atualizado
   - Teste E2E: contador cria alerta manual, cliente recebe

---

#### Story 6.4: Monitoramento de Mudanças de Faturamento e Alertas de Risco

**Como** Sistema,
**Quero** monitorar faturamento de empresas e alertar quando aproximar limites de transição de regime,
**Para que** contador e empresário sejam avisados antes de obrigações mudarem.

**Acceptance Criteria:**
1. Limites Críticos:
   - Simples: R$ 360k (limite atual, pode mudar)
   - Presumido: R$ 78M (obrigatoriedade de Lucro Real)
   - Definir em Admin Panel e versionáveis

2. Lógica de Monitoramento:
   - Job executado mensalmente: calcular faturamento YTD de cada empresa
   - Se faturamento > 80% do limite → gerar alerta "Atenção"
   - Se faturamento > 95% do limite → gerar alerta "Crítico"
   - Alertas são enviados ao contador e empresário

3. Conteúdo de Alerta:
   - Exemplo: "Sua empresa está em 85% do limite de Simples (R$ 306k de R$ 360k). Em X meses, você será obrigado a Lucro Presumido."
   - Incluir: análise de impacto (quanto economizaria/custaria na transição)
   - Incluir: link para simular transição

4. Histórico:
   - Rastrear cada alerta de risco (data, status, ação tomada)
   - Se contador fez transição em resposta → marcar como "resolvido"

5. Testes:
   - Teste: empresa em 85% do limite → alerta crítico gerado
   - Teste: empresa em 50% → sem alerta
   - Teste: empresa transiciona de regime → alertas antigos marcados como resolvidos

---

#### Story 6.5: Dashboard de Alertas e Ações Pendentes (Contador & Admin)

**Como** Contador/Admin,
**Quero** ter visão centralizada de todos os alertas que enviei, quem leu, quem não,
**Para que** eu possa acompanhar engajamento de clientes e priorizar ações.

**Acceptance Criteria:**
1. Dashboard Contador → seção "Alertas":
   - Tabela: Cliente, Tipo de Alerta, Data Envio, Status (Enviado/Lido/Acionado), Ação
   - Filtros: por cliente, por tipo (legislativo, financeiro, manual), por status
   - Ordenação: por data, por status, por prioridade

2. KPIs:
   - "15 alertas enviados esta semana"
   - "Taxa de leitura: 80%" (10 de 15 lidos)
   - "Ações tomadas: 3" (cliente fez transição, consultou agente, etc.)

3. Ações Rápidas:
   - "Reenviar alerta" (se cliente não leu)
   - "Resolver alerta" (marcar como resolvido manualmente)
   - "Criar alerta manual" (rápido jump to novo alerta)

4. Dashboard Admin → seção "Alertas Globais":
   - Agregação: total de alertas enviados, taxa de leitura média, alertas não lidos por contador
   - Identificar contadores com baixo engajamento de clientes

5. Testes:
   - Teste: contador vê lista de alertas enviados
   - Teste: KPIs são calculados corretamente
   - Teste: filtros funcionam

---

## 7. Next Steps

### Próximas Etapas

1. **Enviar PRD para @architect**
   - Arquiteto criará Architecture Document detalhando:
     - ER Diagram (banco de dados)
     - Component Architecture (Frontend, Backend, Services)
     - Sequência de tecnologias e integração com terceiros
     - Definição de APIs REST
     - Estratégia de error handling, logging, monitoring

2. **Paralelo: Enviar Stories 3.1-3.4 para @ux-design-expert**
   - UX Designer criará wireframes/mockups dos dashboards
   - Definirá design system (cores, tipografia, componentes)
   - Validará usabilidade WCAG AA

3. **Configurar Ambiente de Desenvolvimento (Story 1.1)**
   - Developer (ou @dev agent) executa Story 1.1
   - Monorepo, CI/CD, ambiente local são primeiro checkpoint

4. **Monitorar Riscos Técnicos Identificados**
   - RAG Relevancy (validar em Story 4.2)
   - OpenAI API Costs (implementar rate limiting em Story 4.1)
   - Escalabilidade de Notificações (validar em Epic 6)

---

## Glossário de Termos Tributários

- **Simples Nacional:** Regime tributário para PMEs com faturamento até R$ 4,8M/ano. Impostos consolidados em uma alíquota única por faixa de faturamento.
- **Lucro Presumido:** Regime onde o lucro é presumido por percentual do faturamento (varia por CNAE). Aplicável até R$ 78M de faturamento.
- **Lucro Real:** Regime baseado no lucro real da empresa (faturamento - custos - despesas). Obrigatório para empresas com faturamento > R$ 78M.
- **CNAE:** Classificação Nacional de Atividades Econômicas. Código que identifica a atividade econômica principal da empresa.
- **CNPJ:** Cadastro Nacional de Pessoa Jurídica. Registro que identifica uma empresa no Brasil.
- **ISS:** Imposto sobre Serviços. Imposto municipal cobrado sobre receitas de serviços prestados.
- **Reforma Tributária:** Mudanças na legislação tributária brasileira que está sendo implementada gradualmente (2024-2026).
- **RAG (Retrieval-Augmented Generation):** Sistema que recupera documentos relevantes da base de legislação antes de responder perguntas com IA.

---

## Histórico de Mudanças Finais

| Data | Versão | Descrição | Autor |
|------|---------|-----------|--------|
| 2026-02-09 | 1.0 | PRD Final Aprovado - Completo com 6 Epics e 30+ Stories | Morgan (PM) |

---

**Documento Pronto para Architecture Phase** ✅

Enviar para: @architect para criação do Architecture Document

---
