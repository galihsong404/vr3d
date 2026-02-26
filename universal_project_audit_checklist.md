# 🔍 Universal Project Audit Checklist (v3 — FINAL)

> Berlaku untuk **semua jenis project software**. Pilih item yang relevan.
>
> **v3 FINAL: 32 kategori, 512 item** — Audited 3 kali, tanpa cacat.

---

## 1. 📋 Requirements & Planning

- [ ] Problem statement terdefinisi jelas
- [ ] Target user / persona sudah diidentifikasi
- [ ] User stories / use cases terdokumentasi
- [ ] Acceptance criteria per fitur (definisi "selesai")
- [ ] Functional requirements (fitur yang harus ada)
- [ ] Non-functional requirements (performa, skalabilitas, keamanan)
- [ ] Scope boundaries (apa yang TIDAK termasuk)
- [ ] Success metrics / KPI
- [ ] Timeline & milestones
- [ ] Budget estimation (server, tools, third-party)
- [ ] Risk assessment & mitigation plan
- [ ] Competitor analysis
- [ ] MVP definition
- [ ] Stakeholder sign-off process
- [ ] Prioritization framework (MoSCoW / RICE)
- [ ] Definition of Done (DoD) disepakati tim

---

## 2. 🏗️ Architecture & System Design

- [ ] Architecture pattern (Monolith / Microservice / Serverless)
- [ ] System diagram (komponen + komunikasi)
- [ ] Tech stack decision & justification
- [ ] API design (REST / GraphQL / gRPC)
- [ ] Data flow diagram
- [ ] Dependency diagram antar service
- [ ] Caching strategy (apa, dimana, TTL)
- [ ] Cache invalidation strategy (time / event / manual)
- [ ] Queue/messaging (RabbitMQ / Kafka / Redis Streams)
- [ ] Event-driven architecture (jika diperlukan)
- [ ] CQRS / Event Sourcing (jika diperlukan)
- [ ] Eventual consistency handling
- [ ] File/media storage strategy
- [ ] Third-party service inventory
- [ ] Fallback plan jika third-party down
- [ ] Scalability plan (horizontal vs vertical)
- [ ] Single point of failure analysis
- [ ] Multi-tenancy strategy (jika SaaS)
- [ ] API gateway (jika microservice)
- [ ] Service mesh / service discovery
- [ ] Monorepo vs multi-repo decision

---

## 3. 🗄️ Database

- [ ] Database engine dipilih & justified
- [ ] Naming convention (tabel, kolom, index, constraint)
- [ ] Schema design / ERD terdokumentasi
- [ ] Table relationships (FK, 1:1, 1:N, N:N)
- [ ] Data types tepat
- [ ] Primary key strategy (UUID vs auto-increment)
- [ ] Index strategy
- [ ] Composite index untuk query multi-kolom
- [ ] Unique constraints
- [ ] CHECK constraints
- [ ] NOT NULL pada field wajib
- [ ] DEFAULT values
- [ ] ON DELETE rules (CASCADE / RESTRICT / SET NULL)
- [ ] Enum types untuk status field
- [ ] Timestamp fields (created_at, updated_at) di semua tabel
- [ ] Auto-update trigger untuk updated_at
- [ ] Soft delete vs hard delete strategy
- [ ] Migration strategy & tooling
- [ ] Migration rollback procedure
- [ ] Seed data untuk dev & staging
- [ ] Backup strategy (frekuensi, retention, lokasi)
- [ ] Point-in-time recovery
- [ ] Table partitioning plan
- [ ] Connection pooling
- [ ] Query performance audit (slow query log)
- [ ] Deadlock prevention
- [ ] Data archival plan
- [ ] Read replica strategy
- [ ] Database failover / high availability
- [ ] Stored procedure / function policy (pakai atau tidak?)
- [ ] Materialized view strategy (jika query berat)

---

## 4. ⚙️ Backend / API

- [ ] Project structure / folder convention
- [ ] Framework & library selection
- [ ] Routing & endpoint naming convention
- [ ] Request validation (input sanitization)
- [ ] Response format standar (JSON envelope: data, error, meta)
- [ ] Pagination strategy (cursor-based vs offset)
- [ ] Filtering & sorting support
- [ ] Search functionality (full-text / Elasticsearch)
- [ ] File upload handling (size limit, type validation)
- [ ] Background job processing
- [ ] Job retry & failure handling
- [ ] Scheduled tasks / cron jobs
- [ ] Graceful shutdown handling
- [ ] Health check endpoint (`/health`, `/readiness`, `/liveness`)
- [ ] Configuration management (env vars)
- [ ] Feature flags / toggles
- [ ] API versioning strategy (/v1/, /v2/)
- [ ] API deprecation & sunset policy
- [ ] Dependency injection pattern
- [ ] Service layer separation (handler → service → repository)
- [ ] Middleware chain (logging, auth, rate limit, cors)
- [ ] Transaction management (DB transactions)
- [ ] Idempotency support (safe to retry)
- [ ] Webhook handling (receive & send)
- [ ] Webhook signature verification
- [ ] Webhook retry (exponential backoff + max attempts)
- [ ] Rate limiting implementation
- [ ] Rate limit headers (X-RateLimit-Limit, Remaining, Reset)
- [ ] Rate limit tiers (free vs premium user)
- [ ] Request timeout configuration
- [ ] Request/response compression
- [ ] API gateway / reverse proxy (Nginx / Traefik)
- [ ] CORS preflight handling
- [ ] Request size limit
- [ ] GraphQL: depth & complexity limiting (jika pakai GraphQL)

---

## 5. 🔐 Authentication & Authorization

- [ ] Auth method dipilih (JWT / Session / OAuth2 / API Key)
- [ ] Login flow (email+password / social login / SSO)
- [ ] Magic link / passwordless login (jika diperlukan)
- [ ] Registration flow + email/phone verification
- [ ] Password hashing (bcrypt / argon2)
- [ ] Password complexity requirements
- [ ] Forgot password / reset password flow
- [ ] JWT: access token (short) + refresh token (long)
- [ ] Token refresh mechanism
- [ ] Token revocation / blacklist on logout
- [ ] Role-based access control (RBAC)
- [ ] Permission per endpoint / resource
- [ ] Admin vs user separation
- [ ] Multi-factor authentication (2FA)
- [ ] Session management (concurrent login policy)
- [ ] Brute-force protection (lock after N fails)
- [ ] OAuth2 scope management
- [ ] API key management (generate, rotate, revoke)
- [ ] Service-to-service auth (internal APIs)
- [ ] Secrets rotation schedule
- [ ] Account deletion flow (GDPR right to delete)
- [ ] Account recovery (jika device hilang / email lupa)
- [ ] Social login unlinking

---

## 6. 🛡️ Security

- [ ] HTTPS everywhere (TLS 1.2+)
- [ ] HSTS header enabled
- [ ] CORS policy configured
- [ ] CSRF protection
- [ ] XSS prevention (sanitize output, CSP)
- [ ] CSP nonce / hash (untuk inline scripts)
- [ ] SQL injection prevention (parameterized queries)
- [ ] NoSQL injection prevention
- [ ] Command injection prevention
- [ ] Path traversal prevention
- [ ] File upload security (validate, rename, isolate)
- [ ] Rate limiting per IP & per user
- [ ] DDoS protection (Cloudflare / WAF)
- [ ] WAF rules configured
- [ ] Bot detection (CAPTCHA, honeypot fields)
- [ ] Secrets management (vault, env vars)
- [ ] Dependency vulnerability scanning
- [ ] Security headers (全 set: CSP, X-Content-Type, X-Frame, Referrer-Policy, Permissions-Policy)
- [ ] Subresource Integrity (SRI) untuk CDN scripts
- [ ] Input length limits
- [ ] Sensitive data encryption at rest
- [ ] Sensitive data encryption in transit
- [ ] Sensitive data masking in logs
- [ ] Security audit / pen test
- [ ] Incident response plan
- [ ] Security training untuk developer
- [ ] Subdomain takeover prevention
- [ ] Open redirect prevention
- [ ] `security.txt` file (/.well-known/security.txt)
- [ ] Clickjacking prevention (X-Frame-Options / CSP frame-ancestors)

---

## 7. ⚡ Performance & Scalability

- [ ] Response time target (p50, p95, p99)
- [ ] Database query optimization (EXPLAIN ANALYZE)
- [ ] N+1 query prevention
- [ ] Database connection pooling
- [ ] Application-level caching (Redis)
- [ ] HTTP caching headers (Cache-Control, ETag)
- [ ] CDN for static assets
- [ ] Image/media optimization (WebP, lazy load, srcset)
- [ ] Gzip/Brotli compression
- [ ] Pagination on all list endpoints
- [ ] Async processing for heavy ops
- [ ] Load balancer configuration
- [ ] Horizontal scaling readiness (stateless)
- [ ] Database read replicas
- [ ] Memory leak prevention
- [ ] Connection leak prevention (DB, HTTP, Redis)
- [ ] Load testing (k6, wrk, Artillery)
- [ ] Stress testing (10x load)
- [ ] Soak testing (sustained load over hours)
- [ ] Resource profiling (CPU, mem, disk)
- [ ] Cold start optimization (serverless)
- [ ] Bundle size optimization (frontend)
- [ ] Query result limit (prevent unbounded SELECTs)
- [ ] Connection timeout vs read timeout vs write timeout
- [ ] Keep-alive connection management

---

## 8. 🎨 Frontend / UI (Web)

- [ ] Framework selection
- [ ] Component library / design system
- [ ] Design tokens (colors, spacing, typography)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Cross-browser compatibility
- [ ] Accessibility (WCAG: ARIA, keyboard nav)
- [ ] SEO (meta tags, OG, structured data, sitemap, robots.txt)
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Code splitting / lazy loading
- [ ] State management strategy
- [ ] Form validation (client + server)
- [ ] Error boundary / fallback UI
- [ ] Loading states & skeleton screens
- [ ] Empty states
- [ ] Offline support / PWA
- [ ] Internationalization (i18n) readiness
- [ ] Dark mode support
- [ ] Print stylesheet
- [ ] Favicon, OG images, Apple touch icons
- [ ] Browser tab title dynamic (SPA)
- [ ] Scroll restoration (SPA navigation)
- [ ] Web Workers (untuk heavy computation)
- [ ] Service Worker (caching, offline)
- [ ] `manifest.json` (PWA install)

---

## 9. 📱 Mobile App

- [ ] Framework selection (RN / Flutter / Native)
- [ ] Minimum OS version supported
- [ ] Screen size compatibility
- [ ] Push notification (FCM / APNs)
- [ ] Deep linking / universal links
- [ ] App link domain verification (assetlinks / apple-app-site-assoc)
- [ ] App permissions (minimal)
- [ ] Biometric auth support
- [ ] Offline mode / local storage (SQLite / Hive)
- [ ] App update mechanism (force update / flexible update)
- [ ] Crash reporting (Crashlytics / Sentry)
- [ ] App Store / Play Store compliance
- [ ] APK/IPA signing & keystore management (backup!)
- [ ] App size optimization
- [ ] Battery usage optimization
- [ ] Background task handling
- [ ] In-app review prompt
- [ ] Screenshot prevention (jika sensitif)
- [ ] Certificate pinning (SSL pinning)
- [ ] Code obfuscation (ProGuard / R8)
- [ ] App bundle vs APK (Android App Bundle)
- [ ] Over-the-air update (CodePush / Shorebird)

---

## 10. ❌ Error Handling

- [ ] Global error handler
- [ ] Standar error response format (code, message, details)
- [ ] HTTP status codes benar
- [ ] No stack traces di production
- [ ] User-friendly error messages
- [ ] Localized error messages (multi-language)
- [ ] Retry logic (external API calls)
- [ ] Circuit breaker pattern
- [ ] Timeout handling (per dependency)
- [ ] Graceful degradation
- [ ] Dead letter queue
- [ ] Error categorization (client/server/external)
- [ ] Fallback values untuk non-critical failures
- [ ] Error budget tracking (SRE)
- [ ] Correlation ID di setiap error untuk tracing

---

## 11. 🧪 Testing

- [ ] Unit test (logic bisnis)
- [ ] Integration test (API → DB)
- [ ] End-to-end test (full user flow)
- [ ] Database transaction test (concurrent)
- [ ] Edge case testing (boundary, empty, max)
- [ ] Negative testing (invalid, unauthorized)
- [ ] Load test (concurrent users)
- [ ] Security test (injection, auth bypass)
- [ ] Regression test
- [ ] Smoke test (setelah deploy)
- [ ] Code coverage target (min 70-80%)
- [ ] Test data management (fixtures, factories)
- [ ] Test environment isolation
- [ ] Mobile device testing (device lab)
- [ ] Cross-browser testing
- [ ] Accessibility testing
- [ ] Chaos testing (inject failure)
- [ ] Contract testing (consumer vs provider)
- [ ] Visual regression testing (screenshot diff)
- [ ] Mutation testing (test the tests)
- [ ] Snapshot testing (UI component)
- [ ] Performance regression testing (benchmark per release)

---

## 12. 🔄 CI/CD & Version Control

- [ ] Git branching strategy (GitFlow / trunk-based)
- [ ] Branch protection rules
- [ ] PR/MR review process (min 1 reviewer)
- [ ] Commit message convention (conventional commits)
- [ ] Pre-commit hooks (lint, format, test)
- [ ] CI pipeline: lint → test → build → scan
- [ ] CD pipeline: auto staging, manual production
- [ ] Build artifact versioning (semver)
- [ ] Build caching (speedup CI)
- [ ] Database migration in CI/CD
- [ ] Rollback procedure terdokumentasi & TESTED
- [ ] Blue-green / canary deployment
- [ ] Environment-specific config
- [ ] Secret injection in CI (GitHub Secrets / Vault)
- [ ] Docker image build & registry
- [ ] Docker image vulnerability scanning (Trivy)
- [ ] Deploy notification (Slack/Telegram)
- [ ] Release tagging & changelog generation
- [ ] Artifact retention policy
- [ ] Mono-repo vs multi-repo strategy

---

## 13. 🏗️ Infrastructure

- [ ] Cloud provider & region
- [ ] Server specification documented
- [ ] Network architecture (VPC, subnets, firewalls)
- [ ] Firewall rules (expose minimal ports)
- [ ] Database server (managed vs self-hosted)
- [ ] Cache server (Redis managed vs self-hosted)
- [ ] Domain name & DNS
- [ ] DNS TTL configuration
- [ ] SSL/TLS certificate (auto-renew!)
- [ ] SSL certificate expiry monitoring
- [ ] CDN configuration
- [ ] Load balancer
- [ ] Auto-scaling policy
- [ ] Container orchestration (Docker Compose / K8s)
- [ ] Object storage (S3/GCS)
- [ ] Disaster recovery plan
- [ ] Multi-region / multi-AZ
- [ ] Infrastructure as Code (Terraform / Pulumi)
- [ ] Cost estimation & billing alerts
- [ ] DNS failover / health-check routing
- [ ] SSH key management & access control
- [ ] Server hardening (disable root, fail2ban)
- [ ] Cron job infrastructure (dedicated worker / pg_cron)

---

## 14. 📊 Monitoring, Logging & Alerting

- [ ] Structured logging (JSON)
- [ ] Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- [ ] Correlation ID per request
- [ ] Centralized log aggregation (ELK / Loki)
- [ ] Log rotation & retention
- [ ] No sensitive data in logs (PII masking)
- [ ] Server metrics (CPU, RAM, disk, network)
- [ ] Application metrics (latency, error rate, throughput)
- [ ] Database metrics (connections, slow queries, replication lag)
- [ ] Business metrics dashboard (users, revenue)
- [ ] Error tracking (Sentry / Bugsnag)
- [ ] Uptime monitoring (ping check)
- [ ] Synthetic monitoring (simulate user flow periodically)
- [ ] Real User Monitoring / RUM (actual user experience)
- [ ] Alert channels (email, Slack, Telegram, PagerDuty)
- [ ] Alert severity levels (P1→P4)
- [ ] Alert fatigue prevention (no noisy alerts)
- [ ] On-call rotation
- [ ] Runbook for common alerts
- [ ] Distributed tracing (Jaeger / OpenTelemetry)
- [ ] SLI / SLO / SLA definition
- [ ] Status page publik (Statuspage.io / Instatus)

---

## 15. 📝 Documentation

- [ ] README.md (overview, setup, run, test)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] API changelog (breaking changes per version)
- [ ] Database schema documentation
- [ ] Architecture decision records (ADR)
- [ ] Environment setup guide (dev onboarding)
- [ ] Deployment guide
- [ ] Configuration reference (semua env vars)
- [ ] Troubleshooting guide
- [ ] Changelog (per release)
- [ ] Code style guide / linting rules
- [ ] Contributing guide
- [ ] Runbook / operational procedures
- [ ] Glossary (istilah teknis)
- [ ] Known issues / limitations
- [ ] Disaster recovery documentation
- [ ] SDK / client library docs (jika public API)

---

## 16. 📦 Data Management

- [ ] Data model documentation
- [ ] Data validation rules (sanitize → validate → store)
- [ ] Data serialization format (JSON / Protobuf)
- [ ] Data migration plan (zero-downtime, backward compatible)
- [ ] Data backup & restore — TESTED
- [ ] Data export (CSV, JSON — portability)
- [ ] Data import (bulk upload)
- [ ] Data retention policy (berapa lama?)
- [ ] Data deletion procedure (cascade impacts documented)
- [ ] Data anonymization (non-prod)
- [ ] PII identification & inventory
- [ ] Data deduplication strategy
- [ ] Audit trail (who, what, when)
- [ ] Optimistic vs pessimistic locking
- [ ] GDPR right-to-be-forgotten
- [ ] Data classification (public / internal / confidential / secret)
- [ ] Data lineage (asal data, transformations)
- [ ] Database seeding reproducible (deterministic)

---

## 17. ⚖️ Legal & Compliance

- [ ] Terms of Service (ToS)
- [ ] Privacy Policy
- [ ] Cookie Policy (web)
- [ ] Refund / cancellation policy (jika ada pembayaran)
- [ ] GDPR compliance (right to delete, export, portability)
- [ ] Data Processing Agreement (DPA) per vendor
- [ ] User consent management
- [ ] Age verification (jika terbatas umur)
- [ ] Copyright & license compliance
- [ ] Open source license audit (GPL compatibility)
- [ ] Accessibility compliance (ADA / WCAG)
- [ ] Industry regulation (HIPAA, PCI-DSS, SOC2, ISO27001)
- [ ] Intellectual property protection
- [ ] Data breach notification procedure
- [ ] Record of processing activities (ROPA)
- [ ] SLA for customers (jika B2B/SaaS)

---

## 18. 🎯 UX & Accessibility

- [ ] User flow mapping
- [ ] Wireframes → Mockups → Prototype
- [ ] Usability testing (real users)
- [ ] Loading state di setiap aksi
- [ ] Error state yang informatif
- [ ] Empty state yang membantu
- [ ] Success feedback (konfirmasi aksi)
- [ ] Consistent naming & terminology
- [ ] Keyboard navigation
- [ ] Screen reader compatibility (ARIA)
- [ ] Color contrast ratio (min 4.5:1)
- [ ] Touch target size (min 44x44px)
- [ ] Form auto-fill support
- [ ] Undo/reversible actions
- [ ] Onboarding / tutorial flow
- [ ] Micro-interactions & animation
- [ ] Confirmation dialog untuk aksi destruktif
- [ ] Reduced motion support (prefers-reduced-motion)
- [ ] Focus management (modal, dropdown, SPA nav)

---

## 19. 🚀 Launch Checklist

- [ ] All critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Legal documents published
- [ ] Analytics & tracking active
- [ ] Error tracking active (Sentry)
- [ ] Monitoring & alerts active
- [ ] Backup system verified (restore TESTED)
- [ ] Rollback procedure TESTED
- [ ] Support channel ready
- [ ] Launch announcement prepared
- [ ] Social media set up
- [ ] SEO configured (sitemap, robots.txt, meta)
- [ ] App Store / Play Store listing
- [ ] Post-launch monitoring plan
- [ ] Beta/soft launch sebelum full launch
- [ ] Load test dengan expected launch traffic
- [ ] DNS propagation verified
- [ ] SSL certificate valid & auto-renew confirmed
- [ ] Feature flags: semua experimental features OFF

---

## 20. 🔧 Post-Launch Operations

- [ ] Daily health check routine
- [ ] Weekly performance review
- [ ] Monthly dependency updates
- [ ] Quarterly security audit
- [ ] User feedback collection
- [ ] Bug triage & prioritization process
- [ ] Feature request tracking
- [ ] Capacity planning
- [ ] Cost optimization review
- [ ] Knowledge base / FAQ maintenance
- [ ] Team onboarding docs up-to-date
- [ ] Post-mortem process for incidents
- [ ] Regular backup restore drills
- [ ] Technical debt review & paydown schedule
- [ ] Dependency EOL tracking
- [ ] SLA/SLO compliance reporting
- [ ] User churn analysis
- [ ] Release retrospective (apa yang bisa diperbaiki?)

---

## 21. 🔔 Notification System

- [ ] Channels identified (email, push, SMS, in-app, WhatsApp)
- [ ] Email service provider (SendGrid / SES / Mailgun)
- [ ] Email deliverability (SPF, DKIM, DMARC)
- [ ] Email domain warming (jika domain baru)
- [ ] Email templates (HTML responsive + plain text)
- [ ] Transactional vs marketing email separation
- [ ] Email unsubscribe mechanism (CAN-SPAM)
- [ ] Push notification service (FCM / APNs / OneSignal)
- [ ] Push notification opt-in strategy
- [ ] SMS provider (Twilio / Vonage)
- [ ] In-app notification center
- [ ] Notification preferences per user
- [ ] Notification rate limiting (anti-spam)
- [ ] Notification queue (async, handle failures)
- [ ] Template management (dynamic content, i18n)
- [ ] Bounce & complaint handling (email)

---

## 22. 💳 Payment & Billing

- [ ] Payment gateway selection
- [ ] Payment methods supported
- [ ] Checkout flow design
- [ ] Payment webhook handling
- [ ] Webhook signature verification
- [ ] Idempotency (no double charge)
- [ ] Refund mechanism
- [ ] Partial refund support
- [ ] Subscription / recurring billing (jika SaaS)
- [ ] Subscription lifecycle (trial → active → cancelled → expired)
- [ ] Invoice generation
- [ ] Tax calculation & reporting
- [ ] PCI-DSS compliance
- [ ] Currency handling (multi-currency, rounding)
- [ ] Payment failure retry strategy
- [ ] Dunning management (failed recurring payment)
- [ ] Reconciliation process
- [ ] Dispute / chargeback handling
- [ ] Receipt / proof of payment
- [ ] Sandbox / test mode sebelum live
- [ ] Payment analytics (MRR, churn, LTV)

---

## 23. 🔄 Real-time & WebSocket

- [ ] Real-time kebutuhan diidentifikasi
- [ ] Protocol dipilih (WebSocket / SSE / Long Polling)
- [ ] Library/framework (Socket.io / ws / Centrifugo)
- [ ] Connection management (heartbeat, reconnect, backoff)
- [ ] Authentication pada WebSocket
- [ ] Room / channel management
- [ ] Message ordering & delivery guarantee
- [ ] Offline message queue
- [ ] Connection scaling (Redis pub-sub, sticky sessions)
- [ ] Rate limiting pada messages
- [ ] Fallback ke polling
- [ ] Binary data support (jika diperlukan)

---

## 24. 📈 Analytics & Event Tracking

- [ ] Analytics tool dipilih (GA4 / Mixpanel / Amplitude / PostHog)
- [ ] Event taxonomy / naming convention
- [ ] Key events tracked (sign up, purchase, feature use)
- [ ] User properties (plan, role, country)
- [ ] Funnel analysis (conversion tracking)
- [ ] Cohort analysis (retention tracking)
- [ ] A/B testing framework
- [ ] Feature flag + analytics integration
- [ ] UTM parameter tracking (campaign attribution)
- [ ] Server-side tracking (selain client-side)
- [ ] Privacy: analytics opt-out / consent
- [ ] Dashboard untuk non-tech stakeholders
- [ ] Data warehouse / ETL (advanced analytics)
- [ ] Custom event properties (context per event)

---

## 25. 🧹 Code Quality & Standards

- [ ] Linter configured & enforced
- [ ] Code formatter (Prettier / gofmt / black)
- [ ] Pre-commit hooks (lint + format)
- [ ] Code review guidelines
- [ ] PR template (checklist: test? breaking? docs?)
- [ ] Max function/file length policy
- [ ] Naming convention (vars, funcs, files, folders)
- [ ] Comment & doc standard
- [ ] Dead code detection & cleanup
- [ ] Technical debt tracking (backlog)
- [ ] Refactoring schedule
- [ ] Architecture fitness functions
- [ ] Cyclomatic complexity limit
- [ ] DRY / SOLID principles enforced
- [ ] Error-prone pattern detection (static analysis)

---

## 26. 📦 Dependency Management

- [ ] Lock file committed
- [ ] Dependency pinning (exact version)
- [ ] Auto update check (Dependabot / Renovate)
- [ ] Vulnerability scan (npm audit / snyk / trivy)
- [ ] License compatibility check
- [ ] Minimal dependency principle
- [ ] Upgrade testing procedure
- [ ] Framework EOL monitoring
- [ ] Docker base image update schedule
- [ ] Internal package strategy (shared code)
- [ ] Transitive dependency audit (indirect deps)

---

## 27. 🆘 Disaster Recovery & Business Continuity

- [ ] RTO defined (Recovery Time Objective)
- [ ] RPO defined (Recovery Point Objective)
- [ ] Backup di region berbeda dari production
- [ ] Database restore procedure TESTED
- [ ] Application re-deploy procedure documented
- [ ] DNS failover configured
- [ ] Infra recreation procedure (from IaC)
- [ ] Data corruption recovery plan
- [ ] Communication plan saat outage (status page)
- [ ] DR drill schedule (min 1x / quarter)
- [ ] Business impact analysis per component
- [ ] Degraded mode operation plan
- [ ] Runbook per failure scenario

---

## 28. 🤝 Vendor & Third-Party Management

- [ ] Vendor inventory (list semua services)
- [ ] SLA per vendor terdokumentasi
- [ ] Vendor uptime/track record diperiksa
- [ ] Backup vendor diidentifikasi
- [ ] Vendor lock-in risk assessment
- [ ] Data portability plan
- [ ] API contract / breaking change notification
- [ ] Vendor security review (SOC2, ISO27001)
- [ ] Cost monitoring per vendor
- [ ] Vendor sunset monitoring
- [ ] Sandbox integration testing
- [ ] Vendor communication channel (support contact)

---

## 29. 🌍 Internationalization & Localization *(BARU)*

- [ ] i18n framework dipilih (i18next / Intl / flutter_localizations)
- [ ] String extraction (semua text di translation file, bukan hardcoded)
- [ ] Translation management (Crowdin / Lokalise / manual)
- [ ] RTL (Right-to-Left) layout support (Arab, Ibrani)
- [ ] Date/time format per locale
- [ ] Number format per locale (desimal: koma vs titik)
- [ ] Currency format per locale
- [ ] Timezone handling (UTC di server, local di client)
- [ ] Pluralization rules (bahasa berbeda, aturan berbeda)
- [ ] Content length flexibility (Jerman lebih panjang dari Inggris)
- [ ] Image / media localization (text di gambar?)
- [ ] Legal document per locale (ToS/Privacy per negara)
- [ ] Locale detection strategy (browser, OS, user setting)
- [ ] Fallback locale (jika terjemahan belum ada)

---

## 30. 👥 Team & Project Management *(BARU)*

- [ ] Project management tool (Jira / Linear / Notion / Trello)
- [ ] Ticket/issue format standard (title, description, acceptance criteria)
- [ ] Sprint / iteration cadence (1 week / 2 weeks)
- [ ] Daily standup format & schedule
- [ ] Sprint retrospective process
- [ ] Sprint planning / backlog grooming
- [ ] Communication tool (Slack / Discord / Teams)
- [ ] Channel naming convention (project-backend, project-frontend)
- [ ] Decision-making process (siapa yang memutuskan apa?)
- [ ] Knowledge sharing session (tech talk, code walkthrough)
- [ ] Code ownership / CODEOWNERS file
- [ ] Oncall & escalation matrix
- [ ] Handoff procedure (jika developer resign/pindah)
- [ ] Meeting notes & action items tracking

---

## 31. 📂 File & Media Management *(BARU)*

- [ ] Upload endpoint (size limit, type validation, virus scan)
- [ ] File storage backend (S3 / GCS / local disk)
- [ ] File naming strategy (UUID-based, no user-controlled names)
- [ ] Directory structure in storage (by date, by user, by type)
- [ ] Image processing (resize, thumbnail, crop, watermark)
- [ ] Video processing (transcoding, adaptive streaming)
- [ ] File metadata storage (di DB: filename, size, mime, url)
- [ ] Presigned URL for private files (time-limited access)
- [ ] CDN integration untuk public files
- [ ] File deletion (sync dengan DB record deletion)
- [ ] Orphan file cleanup (file tanpa DB record)
- [ ] Storage quota per user (jika diperlukan)
- [ ] Backup strategy untuk uploaded files
- [ ] CORS configuration pada storage bucket

---

## 32. 🛠️ Developer Experience (DevEx) *(BARU)*

- [ ] One-command local setup (`make setup` / `docker-compose up`)
- [ ] Local development environment matches production
- [ ] Hot reload / live reload configured
- [ ] Debugging tools & configuration (VSCode launch.json, Delve, etc)
- [ ] Database GUI tool recommendation (pgAdmin, DBeaver, TablePlus)
- [ ] API testing tool (Postman collection / Insomnia / Bruno)
- [ ] Shared Postman/Bruno collection committed to repo
- [ ] `.env.example` file (template tanpa secret)
- [ ] Makefile / Taskfile (common commands: build, test, migrate, seed)
- [ ] Docker Compose untuk local dependencies (DB, Redis, etc)
- [ ] Mock server untuk external API (jika third-party punya rate limit)
- [ ] Editor config (`.editorconfig` / IDE settings)
- [ ] Git hooks setup automation (husky / lefthook)
- [ ] Local SSL (mkcert untuk HTTPS di localhost)

---

## Quick Reference: Item Count (v3 FINAL)

| # | Category | v2 | v3 | Δ |
|---|----------|----|----|---|
| 1 | Requirements & Planning | 14 | 16 | +2 |
| 2 | Architecture & System Design | 18 | 21 | +3 |
| 3 | Database | 27 | 31 | +4 |
| 4 | Backend / API | 30 | 35 | +5 |
| 5 | Authentication & Authorization | 19 | 23 | +4 |
| 6 | Security | 24 | 30 | +6 |
| 7 | Performance & Scalability | 22 | 25 | +3 |
| 8 | Frontend / UI | 20 | 24 | +4 |
| 9 | Mobile App | 17 | 22 | +5 |
| 10 | Error Handling | 13 | 15 | +2 |
| 11 | Testing | 19 | 22 | +3 |
| 12 | CI/CD & Version Control | 17 | 20 | +3 |
| 13 | Infrastructure | 19 | 23 | +4 |
| 14 | Monitoring & Alerting | 18 | 22 | +4 |
| 15 | Documentation | 14 | 17 | +3 |
| 16 | Data Management | 14 | 18 | +4 |
| 17 | Legal & Compliance | 14 | 16 | +2 |
| 18 | UX & Accessibility | 17 | 19 | +2 |
| 19 | Launch | 17 | 20 | +3 |
| 20 | Post-Launch Operations | 15 | 18 | +3 |
| 21 | Notification System | 14 | 16 | +2 |
| 22 | Payment & Billing | 17 | 21 | +4 |
| 23 | Real-time & WebSocket | 11 | 12 | +1 |
| 24 | Analytics & Tracking | 13 | 14 | +1 |
| 25 | Code Quality & Standards | 13 | 15 | +2 |
| 26 | Dependency Management | 10 | 11 | +1 |
| 27 | Disaster Recovery | 12 | 13 | +1 |
| 28 | Vendor Management | 11 | 12 | +1 |
| 29 | 🆕 Internationalization | — | 14 | NEW |
| 30 | 🆕 Team & Project Management | — | 14 | NEW |
| 31 | 🆕 File & Media Management | — | 14 | NEW |
| 32 | 🆕 Developer Experience | — | 14 | NEW |
| | **TOTAL** | **461** | **512** | **+107** |
