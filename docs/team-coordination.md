# Team Coordination Document — Agente Tributário

**Data:** 2026-02-09
**Project:** Agente Tributário (AI-powered tax guidance SaaS)
**Status:** ✅ Ready for Development Handoff
**Estimated Timeline:** 2-3 months (2-3 developers)

---

## Overview

This document coordinates work between **@architect**, **@ux-design-expert**, **@dev**, and future team members. It ensures alignment, identifies dependencies, and prevents bottlenecks.

---

## Team Roles & Responsibilities

### 1. @architect (Aria)
**Deliverables:**
- Entity-Relationship Diagram (ER) — database schema
- Component Architecture Diagram — services, integrations
- Data Flow Diagrams — critical user flows
- OpenAPI Specification — all REST endpoints
- Security & Compliance Design — auth, LGPD, encryption
- Deployment & Infrastructure — scalability, monitoring
- Risk Mitigation — identified technical risks

**Timeline:** 5-7 days
**Input:** `docs/architect-prompt.md`
**Output:** Architecture Document (20-30 pages) + diagrams
**Blockers:** None (can start immediately)
**Dependencies:** None

**Key Decisions to Make:**
- [ ] Express vs. Next.js API Routes for backend
- [ ] Pinecone vs. Weaviate for RAG vector database
- [ ] Stripe vs. PagSeguro for payments
- [ ] Database encryption strategy (at-rest, in-transit)
- [ ] Caching strategy (Redis TTL, patterns)
- [ ] Deployment platform finalization (Vercel + Railway/Heroku/Self-hosted)

---

### 2. @ux-design-expert (UX Designer)
**Deliverables:**
- Wireframes (Stories 3.1-3.4) — 4 major stories
- Design System / Style Guide
- Color Palette + Typography Specifications
- Component Library (Button, Card, Table, Modal, etc.)
- User Journey Maps (2-3)
- Figma High-Fidelity Mockups
- Accessibility Checklist (WCAG AA)

**Timeline:** 5-7 days
**Input:** `docs/ux-design-prompt.md` + `docs/prd.md` (section 6.3)
**Output:** Figma file + design system document + wireframe PDFs
**Blockers:** None (can start immediately)
**Dependencies:** None

**Key Decisions to Make:**
- [ ] Color palette finalization (which blue/green shades?)
- [ ] Typography choices (Inter vs. Outfit vs. other)
- [ ] Mobile strategy (responsive breakpoints)
- [ ] Component library structure (how to organize in Figma)
- [ ] Micro-interactions (hover, loading, error states)

---

### 3. @dev (Developer)
**Story 1.1 (First Story):**
- Repository setup (Turborepo monorepo)
- Next.js frontend configuration
- Express backend initialization
- ESLint, Prettier, Jest setup
- GitHub Actions CI/CD
- Docker Compose (optional)
- README documentation

**Timeline:** 2-3 days
**Input:** `docs/dev-story-1.1-prompt.md`
**Output:** Functional monorepo with dev environment ready
**Blockers:** None (can start immediately)
**Dependencies:** None

**After Story 1.1, can proceed with Stories 1.2-1.5 in parallel or sequence:**
- **Story 1.2:** Database Schema (depends on Architecture)
- **Story 1.3:** Authentication (depends on Architecture)
- **Story 1.4:** CNPJ Onboarding (depends on Story 1.1)
- **Story 1.5:** RAG Base (depends on Architecture)

---

## Dependency Matrix

```
ARCHITECT DELIVERABLES
    ↓
    ├─→ Database Schema → DEV (Story 1.2)
    ├─→ API Endpoints → DEV (Story 1.3+)
    ├─→ Security Design → DEV (all stories)
    └─→ Deployment Plan → DEV (final story)

UX DESIGN DELIVERABLES
    ↓
    ├─→ Wireframes → DEV (stories 3.1-3.4)
    ├─→ Design System → DEV (all UI implementation)
    └─→ Figma Mockups → DEV (visual reference)

DEV DELIVERABLES (Story 1.1)
    ↓
    ├─→ Monorepo Setup → DEV (all future stories)
    ├─→ CI/CD Pipeline → ARCHITECT (testing infrastructure)
    └─→ Dev Environment → ARCHITECT (testing designs)

TIMELINE DEPENDENCIES
    Day 1-3:   Story 1.1 (setup) — no blockers
    Day 3-10:  Architecture (ERD, APIs, design) — parallel with Story 1.1
    Day 3-10:  UX Design (wireframes, design system) — parallel with others
    Day 5+:    Story 1.2-1.5 (implementation starts) — depends on Architect
```

---

## Work Timeline & Milestones

### Week 1: Initialization & Design

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| 1-2 | Story 1.1 (Project Setup) | @dev | 🟢 Ready |
| 3-5 | Architecture Design | @architect | 🟢 Ready |
| 3-5 | UX Design (Wireframes) | @ux-design-expert | 🟢 Ready |
| 5 | Architecture Review | @architect + @dev | ⏳ Pending |
| 5 | Design Review | @ux-design-expert + @dev | ⏳ Pending |

### Week 2-3: Database & Auth

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| 6-8 | Story 1.2 (DB Schema) | @dev | ⏳ Depends on Architect |
| 6-8 | Story 1.3 (Auth) | @dev | ⏳ Depends on Architect |
| 9-10 | Story 1.4 (Onboarding) | @dev | ⏳ Depends on 1.2 |

### Week 3-4: Core Features

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| 11-14 | Story 2.1-2.4 (Tax Analysis) | @dev | ⏳ Depends on 1.2 |
| 11-14 | Stories 3.1-3.4 (Dashboards) | @dev | ⏳ Depends on UX design |
| 11-14 | Story 1.5 (RAG Base) | @dev | ⏳ Depends on Architecture |

### Weeks 5-8: Advanced Features

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| 15-20 | Epic 4 (AI Agent) | @dev | ⏳ Depends on RAG |
| 21-25 | Epic 5 (Payments) | @dev | ⏳ Depends on Core |
| 26-30 | Epic 6 (Automation) | @dev | ⏳ Depends on Core |

---

## Critical Path

**Critical Path = Longest sequence of dependent tasks**

```
Story 1.1 (2 days)
  ↓
Architecture (5 days) — bottleneck
  ↓
Story 1.2 (2 days)
  ↓
Epic 2-6 (35-40 days)
  ↓
Total: ~45-50 days minimum
```

**To accelerate:**
- Architect starts immediately and finishes in 5 days (non-negotiable)
- Dev can do Story 1.1 in parallel (finishes in 2-3 days)
- Dev starts Story 1.2 as soon as Architect delivers schema

---

## Communication Protocol

### Daily Standups (15 min)
**Time:** 10:00 AM (UTC-3 / São Paulo time)
**Attendees:** @architect, @ux-design-expert, @dev
**Format:**
- What I completed yesterday
- What I'm working on today
- Blockers or questions

### Weekly Sync (30 min)
**Time:** Friday 3:00 PM
**Attendees:** @architect, @ux-design-expert, @dev, Morgan (PM)
**Agenda:**
- Progress update
- Any deviations from plan
- Risk review
- Next week planning

### Async Communication
- **Slack/Discord:** Quick questions, blockers
- **GitHub:** Technical discussions in PRs/Issues
- **Email:** Formal decisions, documentation

### Document Reviews
- **Architecture Review:** @dev reviews and signs off
- **Design Review:** @dev reviews and signs off
- **Code Review:** @architect (code quality) and @ux-design-expert (implementation matches design)

---

## Decision Log

**Decisions Made (from PRD):**

| # | Decision | Owner | Date | Status |
|---|----------|-------|------|--------|
| D1 | Tech Stack: Next.js, Express, PostgreSQL, Redis | @architect | 2026-02-09 | ✅ Done |
| D2 | Monorepo: Turborepo | @dev | 2026-02-09 | ✅ Done |
| D3 | Testing: Jest + Testing Library | @dev | 2026-02-09 | ✅ Done |
| D4 | Deployment: Vercel + Railway/Heroku | @architect | 2026-02-09 | ⏳ TBD |
| D5 | Vector DB: Pinecone or Weaviate | @architect | 2026-02-09 | ⏳ TBD |
| D6 | Payment: Stripe vs. PagSeguro | @architect | 2026-02-09 | ⏳ TBD |
| D7 | Color Palette: Azul/Verde | @ux-design-expert | 2026-02-09 | ⏳ TBD |
| D8 | Typography: Sans-serif modern | @ux-design-expert | 2026-02-09 | ⏳ TBD |

**Decisions Needed (During Architecture):**
- [ ] Express vs. Next.js API Routes (likely Express)
- [ ] PostgreSQL encryption at-rest (pgcrypto vs. app-level)
- [ ] Caching strategy (Redis patterns, TTL)
- [ ] Specific Azure/AWS/Railway deployment (TBD)
- [ ] Vector DB indexing strategy (CNAE + regime + UF)
- [ ] Specific design tokens (spacing, shadows, etc.)

---

## Risk Management

### High Risks (Must mitigate early)

| # | Risk | Impact | Mitigation | Owner | Status |
|---|------|--------|-----------|-------|--------|
| R1 | RAG relevancy (wrong docs returned) | High | Implement thresholds, user feedback in Story 4.2 | @dev | ⏳ In Progress |
| R2 | OpenAI API costs escalate | High | Rate limiting (Story 4.1), caching (Epic 6) | @dev | ⏳ In Progress |
| R3 | CNPJ API unavailable (onboarding fails) | High | Fallback to manual input, retry logic (Story 1.4) | @dev | ⏳ In Progress |
| R4 | Performance at scale (100+ req/s) | High | Load testing, Redis caching, DB optimization | @architect | ⏳ To Plan |

### Medium Risks (Monitor)

| # | Risk | Impact | Mitigation | Owner | Status |
|---|------|--------|-----------|-------|--------|
| R5 | Notification system overload | Medium | Queue-based delivery (Bull), batching (Epic 6) | @dev | ⏳ To Design |
| R6 | Database migration complexity | Medium | Use Prisma migrations, test rollback (Story 1.2) | @dev | ⏳ To Design |
| R7 | UX misalignment (design vs. implementation) | Medium | Figma specs + component library + code review | @ux-design-expert + @dev | ⏳ To Design |

---

## Testing Strategy

### Unit Tests
- Shared types/utils (packages/shared)
- API controllers and services
- React components

**Owner:** @dev
**Target:** 80% coverage minimum
**Timeline:** Ongoing (each story must include tests)

### Integration Tests
- API endpoints + database
- Authentication flow
- CNPJ API integration

**Owner:** @dev
**Timeline:** Story 1.3+

### E2E Tests
- Onboarding (CNPJ → Dashboard)
- Tax analysis (input → comparison)
- Chat with AI (question → answer)

**Owner:** @dev
**Timeline:** Stories 1.4, 2.3, 4.1

### Load Testing
- 100 req/s simultaneously
- Measure latency, throughput
- Identify bottlenecks

**Owner:** @architect + @dev
**Timeline:** Week 8 (pre-production)

### Design Review Testing
- Visual consistency vs. Figma
- Responsive breakpoints (desktop, tablet, mobile)
- Accessibility (WCAG AA)

**Owner:** @ux-design-expert + @dev
**Timeline:** Each story with UI changes

---

## Quality Gates

### Before Merging to `main` branch:

1. ✅ All tests pass (unit, integration, E2E)
2. ✅ Linter passes (ESLint, Prettier)
3. ✅ Type checking passes (TypeScript)
4. ✅ Code review approved (@dev + @architect)
5. ✅ If UI changes: Design review approved (@ux-design-expert)
6. ✅ No console errors/warnings
7. ✅ Performance budgets met (< 2s dashboard load)

### Before Release to Staging:

1. ✅ All quality gates passed
2. ✅ Load testing completed (100 req/s)
3. ✅ Security review (@architect)
4. ✅ LGPD compliance check (@architect)
5. ✅ Accessibility audit (WCAG AA)

---

## Parallel Work Strategy

**To maximize velocity, do these in parallel:**

### Phase 1 (Days 1-5):
- **@dev:** Story 1.1 (project setup)
- **@architect:** Architecture design (ER, APIs, security)
- **@ux-design-expert:** UX design (wireframes, design system)

### Phase 2 (Days 6-10):
- **@dev:** Story 1.2 (database) — depends on Architect ✓
- **@architect:** Complete architecture review, finalize APIs
- **@ux-design-expert:** High-fidelity mockups, Figma components

### Phase 3 (Days 11-15):
- **@dev:** Stories 1.3-1.5 (auth, onboarding, RAG)
- **@ux-design-expert:** Design system finalized, ready for implementation

### Phase 4 (Days 16+):
- **@dev:** Epic 2-6 (all features)
- **Parallel:** Each story is independent (can scale to 2-3 devs)

---

## Handoff Procedures

### Architect → Dev

**When:** After Architecture Document is complete (Day 5)

**Checklist:**
- [ ] ER diagram reviewed and approved by @dev
- [ ] API spec (OpenAPI) is complete and testable
- [ ] Database migration scripts provided
- [ ] Security requirements documented
- [ ] Deployment strategy finalized
- [ ] Q&A session (30 min) to clarify any points

**Dev Responsibility:**
- Review architecture thoroughly
- Ask clarifying questions
- Implement according to spec (Story 1.2+)
- Report discrepancies/issues

---

### UX Design → Dev

**When:** After Wireframes + Design System complete (Day 5)

**Checklist:**
- [ ] Wireframes for Stories 3.1-3.4 delivered (PNG + Figma)
- [ ] Design System (colors, typography, components) documented
- [ ] Figma file shared with dev access
- [ ] Accessibility checklist provided (WCAG AA)
- [ ] Component library ready to use
- [ ] Q&A session (30 min) to clarify design decisions

**Dev Responsibility:**
- Review designs in Figma
- Implement pixel-perfect (or close)
- Ask questions if unclear
- Report technical constraints that affect design

---

### Dev → Stakeholders

**When:** Story 1.1 complete, Staging deployment ready

**Deliverables:**
- [ ] Code repository with all commits
- [ ] CI/CD pipeline working
- [ ] README documentation
- [ ] Known issues and roadmap
- [ ] Performance baseline metrics

---

## Resource Allocation

### @architect (Full-time, Days 1-5, then part-time)
- Days 1-5: Architecture Design (40 hours)
- Days 6+: Code review, technical guidance (5-10 hours/week)

### @ux-design-expert (Full-time, Days 1-5, then part-time)
- Days 1-5: Wireframes + Design System (40 hours)
- Days 6+: Design review, component refinement (5-10 hours/week)

### @dev (Full-time, Days 1+)
- Days 1-3: Story 1.1 (40 hours)
- Days 4+: Stories 1.2-1.5, Epic 2-6 (ongoing)

**Future Scaling:**
- Can add 2nd developer after Story 1.1 (Day 3)
- 2nd dev takes parallel stories (e.g., Epic 2 while first dev does Epic 3)
- Architect + UX available for code/design review

---

## Success Metrics

### By End of Week 1
- [ ] Story 1.1 complete and deployed to staging
- [ ] Architecture document approved by @dev
- [ ] UX wireframes approved by @dev
- [ ] All team members aligned on decisions

### By End of Week 2
- [ ] Story 1.2 (Database) complete
- [ ] Story 1.3 (Auth) complete
- [ ] PR workflow established
- [ ] CI/CD running successfully

### By End of Week 4
- [ ] Epic 1 complete (all 5 stories)
- [ ] Epic 2 complete (all 4 stories)
- [ ] Core database + API working
- [ ] 50+ unit tests passing

### By End of Month 2
- [ ] Epics 1-4 complete (19 stories)
- [ ] Core features + AI working
- [ ] 80% test coverage
- [ ] Staging environment stable

### By End of Month 3
- [ ] Epics 1-6 complete (all 30+ stories)
- [ ] Production-ready
- [ ] Load testing passed
- [ ] Security audit passed

---

## Escalation Path

### Blockers
If blocked, escalate in this order:
1. **Same team:** Ask directly (Slack/GitHub)
2. **Cross-team:** Standup meeting
3. **Architectural:** Review together (Architect + Dev)
4. **Product:** Contact Morgan (PM)

### Conflicts
- **Design vs. Implementation:** Discuss with both, find compromise, escalate to PM if needed
- **Architecture vs. Timeline:** Discuss, prioritize, escalate to PM if needed
- **Quality vs. Speed:** Maintain quality gates, adjust timeline if needed

---

## Tools & Repositories

### GitHub
- **Repository:** https://github.com/yourusername/agente-tributario
- **Branches:** `main` (production), `develop` (staging), `feature/*` (features)
- **Issues:** For bugs, questions, documentation
- **PRs:** Code reviews, design reviews

### Figma
- **Design File:** (to be shared)
- **Permissions:** Edit for @ux-design-expert, comment for @dev, view for others

### Documentation
- **Location:** `docs/` folder in repo
- **Files:**
  - `prd.md` — Product requirements
  - `architect-prompt.md` — Architecture guidance
  - `ux-design-prompt.md` — Design guidance
  - `dev-story-1.1-prompt.md` — First story task
  - `team-coordination.md` — This file
  - `ARCHITECTURE.md` (to be created by @architect)
  - `DESIGN_SYSTEM.md` (to be created by @ux-design-expert)

### Communication
- **Daily Standup:** 10:00 AM (UTC-3)
- **Weekly Sync:** Friday 3:00 PM
- **Slack:** Quick questions, updates
- **GitHub:** Technical discussions

---

## FAQ

**Q: Can @dev start before Architect finishes?**
A: Yes! Story 1.1 (project setup) is independent. Start immediately. Stories 1.2+ depend on architecture.

**Q: What if we find issues during implementation?**
A: Document in GitHub issue, discuss in standup, adjust architecture/design if needed.

**Q: How do we handle scope creep?**
A: All changes go through PM (Morgan). PRD is locked. New ideas → future epics.

**Q: Can we skip tests?**
A: No. 80% coverage minimum. Tests are part of quality gates.

**Q: What's the contingency if a team member gets sick?**
A: Document everything in GitHub/Figma. Other team member can pick up.

**Q: Timeline realistic?**
A: 2-3 months with 2 devs, working in parallel. With 1 dev, ~3-4 months. With 3 devs, ~2 months.

---

## Sign-Off

This document is approved and all team members agree to follow this coordination plan.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| PM | Morgan | 2026-02-09 | ✅ |
| Architect | Aria | TBD | ⏳ |
| UX Designer | (TBD) | TBD | ⏳ |
| Developer | (TBD) | TBD | ⏳ |

---

## Next Steps

1. **Share this document** with all team members
2. **Architect:** Start working on `docs/architect-prompt.md`
3. **UX Designer:** Start working on `docs/ux-design-prompt.md`
4. **Dev:** Start working on `docs/dev-story-1.1-prompt.md`
5. **Daily Standup:** Schedule for tomorrow at 10:00 AM (UTC-3)
6. **Weekly Sync:** Schedule for Friday at 3:00 PM

---

**Document Version:** 1.0
**Last Updated:** 2026-02-09
**Next Review:** After Week 1 (2026-02-16)

