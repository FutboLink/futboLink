# Skill Registry — futboLink

Generated: 2026-05-21
Project: futboLink

---

## User Skills

| Skill | Trigger |
|-------|---------|
| `go-testing` | Writing Go tests, Bubbletea TUI testing, teatest |
| `skill-creator` | Creating new AI skills, documenting agent patterns |
| `skill-registry` | "update skills", "skill registry", "actualizar skills", after installing/removing skills |
| `branch-pr` | Creating a pull request, opening a PR, preparing changes for review |
| `issue-creation` | Creating a GitHub issue, reporting a bug, requesting a feature |
| `judgment-day` | "judgment day", "judgment-day", "dual review", "doble review", "juzgar" |
| `sdd-init` | "sdd init", "iniciar sdd", "openspec init" |
| `sdd-explore` | Investigating a feature or idea before committing |
| `sdd-propose` | Formalizing an explored idea into a proposal |
| `sdd-spec` | Writing specs (delta specs) for a change |
| `sdd-design` | Creating the technical design for a change |
| `sdd-tasks` | Breaking a change into an implementation task checklist |
| `sdd-apply` | Implementing tasks from the change |
| `sdd-verify` | Validating implementation against specs and tasks |
| `sdd-archive` | Closing a completed change, syncing delta specs |
| `sdd-onboard` | Guided SDD walkthrough |

---

## Project Conventions

### Backend (back/)
- **Framework**: NestJS 10 + TypeORM 0.3 + PostgreSQL
- **Language**: TypeScript 5
- **Test runner**: Jest 29 + ts-jest (command: `npm test` from `back/`)
- **Linter**: ESLint + @typescript-eslint
- **Formatter**: Prettier
- **Architecture**: Modular NestJS — each domain lives in `src/modules/<domain>/`

### Frontend (front/)
- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5
- **Linter + Formatter**: Biome 2
- **Styling**: Tailwind CSS 3
- **No test runner** — frontend tests are not available

### Root
- **Payments**: Stripe
- **Email**: Nodemailer + Resend
- **Storage**: AWS S3 + Cloudinary

---

## Compact Rules (auto-inject into sub-agents)

### Backend development
- NestJS modules at `back/src/modules/<domain>/`. Each module has `*.service.ts`, `*.controller.ts`, `*.module.ts`.
- TypeORM entities in `<module>/entities/`. DTOs in `<module>/dto/`.
- Test files co-located: `*.spec.ts` alongside the source file.
- Jest config in `back/package.json` under `"jest"` key. `ts-jest` transform with `diagnostics.warnOnly: true` (pre-existing TS errors in controller).
- Run tests: `cd back && npm test` (from repo root: `cd back && npx jest`).
- DO NOT mock the database in integration tests — use real DB or unit-test pure helpers only.

### Frontend development
- Next.js App Router in `front/src/app/`. Pages under `front/src/app/<route>/page.tsx`.
- Components in `front/src/components/`. Services in `front/src/services/`. Utils in `front/src/utils/`.
- Biome for lint + format (no ESLint, no Prettier on front/).
- No frontend test runner — UI changes must be manually verified.

### SDD
- Artifact store: `engram` (default). No `openspec/` directory.
- Strict TDD Mode: **enabled** (backend only — Jest available).
- TDD applies to `back/` only; frontend has no runner.
