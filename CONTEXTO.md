# CONTEXTO — FutboLink (handoff a otra PC)

> Archivo temporal para continuar el proyecto en otra máquina. **Borrar antes de mergear a main.**

---

## 0. Quién es quién

- **Owner / cliente final:** Isma (FutboLink)
- **Dev:** Martín Aguayo (`martineduardoaguayo@gmail.com`)
- **Email para commits que deployan Vercel:** `linkfutbo@gmail.com` (ver §3)

---

## 1. Contrato 2026 — Módulo 1 (USD $1.530)

| Sub-módulo | Descripción | Estado | Notas |
|---|---|---|---|
| **1A** | Migración de data — consolidar roles legacy a `Representante` (`Empresario`, `Otro`, etc.) | Frontend ✅ en main · **Backend pendiente** | Migración `1776991896000-MigrateLegacyPuestos...` ya creada y aplicada en local. Falta correrla en prod. |
| **1B** | Perfiles unificados + datos nuevos (2da nacionalidad, videos multi, photo gallery) | ✅ mergeado (PR #25) | Entrega del 2026-05-05, USD $350 |
| **1C** | Rediseño visual del perfil público | Pendiente | No arrancado |
| **1D** | Editar Perfil UX — barra de progreso + tips + trayectoria | ✅ mergeado (PR #25) | Entrega del 2026-05-05, USD $200 |
| **1E** | Navbar — avatar + dropdown + zoom fix | ✅ mergeado | Cluster a la derecha, idiomas a la izquierda |
| **1F** | Crear Página (nueva entidad `organization_pages`) | **Branch lista** → `feature/1F-crear-pagina` | Ver §5 |

**Entregas hechas:** USD $550 (1B + 1D)
**Pendientes:** 1A backend + 1C + 1F (sin precio acordado per sub-módulo, salir del total de $1.530)

---

## 2. Repo y stack

- **Repo:** `git@github.com:FutboLink/futboLink.git`
- **Backend:** NestJS 10 + TypeORM 0.3 + PostgreSQL 18 → Railway
- **Frontend:** Next.js 15.1.4 + React 19 + Tailwind → Vercel
- **Auth:** JWT (`jsonwebtoken`)
- **Storage de imágenes:** Cloudflare R2 (con fallback local cuando faltan las env vars de R2)

---

## 3. Workflow y reglas críticas (NO ROMPER)

### 3.1 Vercel — Hobby plan author constraint

El plan Hobby de Vercel **valida el `commit.author.email` contra el email del GitHub Login conectado al proyecto** (`linkfutbo@gmail.com`). Si pusheás a `main` con otro email, el deploy queda en `Blocked` con mensaje:

> "The Deployment was blocked because the commit author does not have contributing access to the project on Vercel"

**Solución:** todo commit que va a `main` debe usar `--author="Martín Aguayo <linkfutbo@gmail.com>"`.

Si por error mergeás con el author equivocado (típicamente un merge commit con `martineduardoaguayo@gmail.com`), hacer un **empty commit trigger** después:

```bash
git commit --allow-empty -m "chore: trigger Vercel redeploy" --author="Martín Aguayo <linkfutbo@gmail.com>"
git push origin main
```

### 3.2 SSH multi-cuenta

La clave SSH con permisos para este repo es **`~/.ssh/id_mertein`**. En la otra PC, después de clonar:

```bash
git config --local core.sshCommand "ssh -i ~/.ssh/id_mertein -o IdentitiesOnly=yes"
```

Esto solo afecta este repo, no toca otros proyectos. Para pushear sin el config local:

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_mertein -o IdentitiesOnly=yes' git push origin <branch>
```

### 3.3 Reglas duras de commit/push

1. **NUNCA pushear a `main` sin autorización explícita del owner.** "subí", "mergea", "metelo a main" = ok. Nada de inferir.
2. **NO commitear cada fix.** Agrupar en commits temáticos. Esperar señal del usuario antes de commitear.
3. **Conventional commits.** Nada de `Co-Authored-By` ni atribución a IA.
4. **NUNCA `--no-verify` ni saltarse pre-commit hooks** sin pedirlo explícitamente.
5. **NUNCA force-push a main.** Force-push solo en feature branches con `--force-with-lease`.

---

## 4. Estado actual de `main` (al `2026-05-16`)

HEAD: `39d77c5 chore: trigger Vercel redeploy`

Lo último mergeado:
- `fix/agente-perfil-unificado` (commit `08d6ca2`): perfil del agente unificado con los demás, tab `Portafolio` extra en `/user-viewer/[id]`, sidebar redirige a tabs nuevas, `ProfileProgressBar` al final de la columna izquierda, Google Ads gtag (`AW-17160740489`) en `layout.tsx`.

---

## 5. Branch `feature/1F-crear-pagina` — lista para mergear

**Origen:** `main` (HEAD `39d77c5`)
**Comits:** 8 cherry-picks ordenados desde `feature/modulo-1`:

```
0acbba0 feat(organization-pages): add backend CRUD + migration (1F)
9afbd04 feat(organization-pages): add create wizard and public view (1F)
4b7fd95 feat(1F): polish wizard UX, cropper, public view styling
2746eed feat(1F): edit page, mis páginas listing, contract cards
c11da0c feat(1F): add pg_trgm + duplicate detection on org pages
a06422b feat(1F): admin moderation endpoints + check-duplicates
4196792 feat(1F): admin moderation flow + rejection reason + emails
047ffab feat(1F): admin panels + duplicate detection UI + republish flow
```

### 5.1 Migraciones SQL (correr en orden al deployar)

1. `back/src/database/migrations/1776977352371-CreateOrganizationPagesTable.ts`
2. `back/src/database/migrations/1777000000000-AddTrigramAndPendingStatusToOrgPages.ts` (requiere extensión `pg_trgm` — la migración la crea)
3. `back/src/database/migrations/1777100000000-AddRejectionReasonToOrgPages.ts`

**Verificadas en local contra dump prod del 2026-04-23 (PG 18.3).** Regla obligatoria del proyecto: **toda migración se prueba primero contra copia local del schema de prod**, nunca aplicar directo en prod.

### 5.2 Conflictos resueltos durante el cherry-pick

| File | Resolución | Por qué |
|---|---|---|
| `front/src/messages/{en,es,it}.json` (hunks 1–4 de commits 2 y 3) | `ours` (main) | Main ya era superset — el merge del 1D arrastró claves 1F sin querer |
| `front/src/messages/{en,es,it}.json` (commit 8, hunk 1) | `theirs` (1F) — agregar `createPage`, `pagesMenu`, `pendingPages`, `allPages`, `edit` | Claves nuevas que main no tenía |
| `front/src/messages/{en,es,it}.json` (commit 8, hunk 2) | `ours` (main) — mantener `profileCompleteness` | 1F operaba sobre estado sin 1D mergeado |
| `front/src/components/Cloudinary/ImageUploadWithCrop.tsx` | `theirs` (1F) | Versión generalizada superset backward-compatible (aspect, previewShape, sizing classes) |
| `front/src/components/Panel/Manager/manager.tsx` | Unión de imports | `import { FaChevronDown, FaChevronRight, FaChevronUp, FaGlobe, FaPlus } from "react-icons/fa";` |
| `front/src/components/layout/SidebarLayout.tsx` | Auto-merge limpio | Quedó con items del agente (Editar Perfil/Mis Ofertas/Portafolio) + acordeón "Páginas" de 1F |
| `back/src/modules/Mailing/email.service.ts` | Auto-merge limpio | — |

### 5.3 Verificación post cherry-pick

Diff vs `feature/modulo-1` para los archivos puramente 1F: **0 líneas en todos**.
- `back/src/modules/OrganizationPages/*` → 0
- `back/src/database/migrations/177697*`, `177700*`, `177710*` → 0
- `back/src/modules/auth/optional-auth.guard.ts` → 0
- `front/src/app/pages/*`, `front/src/app/admin/pages/*` → 0
- `front/src/components/OrganizationPages/*` → 0
- `front/src/types/organizationPage.ts` → 0

### 5.4 Features incluidas (resumen de 1F)

- Wizard 4 pasos en `/pages/create` (tipo → info → detalles → review) con anti-duplicados (pg_trgm)
- Vista pública `/pages/[slug]` (logo redondo, banner 3:1, contact card, redes, card Liga si CLUB, card Portafolio si AGENCY)
- Editar página `/pages/[slug]/edit` (reusa wizard, hidden type step, owner-only)
- Mis páginas `/pages/mine` con badges por status (PUBLISHED, DRAFT, PENDING, REJECTED, DEACTIVATED)
- Panel admin `/admin/pages/pending` (aprobar/rechazar con motivo + email al dueño)
- Panel admin `/admin/pages/all` (filtros: tipo, status, search, paginación)
- Flujo de republish: si admin rechaza, el dueño puede editar y mandar a revisión de nuevo
- Cropper reusable (`ImageUploadWithCrop`) generalizado para logo (1:1 round) y banner (3:1 rect)
- Sidebar: menú "Páginas" colapsable (acordeón) con items según rol (no-PLAYER, admin)
- Decisión confirmada por Isma (2026-04-22): un user puede administrar **múltiples páginas** sin límite

---

## 6. Branches relevantes en remote

| Branch | Estado | Notas |
|---|---|---|
| `main` | Producción (Vercel + Railway) | HEAD `39d77c5` |
| `feature/1F-crear-pagina` | **Lista para mergear** | Esta misma branch |
| `feature/modulo-1` | Archivo de referencia | 18 commits adelante de main, no mergear directo |
| `fix/agente-perfil-unificado` | Ya mergeada | Puede borrarse |

---

## 7. Setup en la otra PC

```bash
# 1. Clonar con la cuenta correcta
git clone git@github.com:FutboLink/futboLink.git
cd futboLink

# 2. Configurar SSH local solo para este repo
git config --local core.sshCommand "ssh -i ~/.ssh/id_mertein -o IdentitiesOnly=yes"

# 3. Identidad git
git config --local user.name "Martín Aguayo"
git config --local user.email "linkfutbo@gmail.com"  # para que matchee Vercel

# 4. Pull de la branch 1F
git fetch
git checkout feature/1F-crear-pagina

# 5. Backend
cd back
cp .env.example .env  # completar DB_HOST/USER/PASS/PORT, JWT_SECRET, R2_*, SMTP_*
npm install
npm run typeorm:run-migrations  # corre las 3 migraciones del 1F (si DB limpia)

# 6. Frontend
cd ../front
cp .env.local.example .env.local  # completar NEXT_PUBLIC_API_URL
npm install
npm run dev  # arranca en :4100
```

---

## 8. Pendientes inmediatos

1. **QA del 1F** en la otra PC (smoke test del wizard, vista pública, edit, mis páginas, admin pending, admin all, republish)
2. **Mergear 1F a main** cuando Isma dé OK (usar `--author=linkfutbo@gmail.com` o un trigger empty commit después)
3. **1A backend**: correr migración `1776991896000` en prod (consolidar puestos legacy a `Representante`). Ya está aplicada en local desde el 2026-04-23.
4. **1C**: arrancar (no diseñado todavía — pedir specs a Isma)
5. **GDPR / cookies para gtag AW-17160740489**: pendiente discutir con Isma
6. **Eventualmente**: drop column `secondNationalityEuPassport` legacy

---

## 9. Cosas que parecen bug pero NO lo son

- **Tab "Portafolio" en user-viewer puede mostrar lista vacía**: el endpoint backend a veces devuelve 404, el frontend usa `fetch` (no axios) para no disparar el overlay de Next dev. La lista vacía es esperada hasta que el backend de portafolio esté firme.
- **Sidebar del agente arrastra al user-viewer en vez del panel manager.tsx legacy**: decisión del 2026-05-XX para unificar UX. Los items extra del agente (Mis Ofertas / Crear Oferta) ahora son tabs dentro de `/user-viewer/[id]`.
- **"Mis Ofertas Publicadas" en panel Manager legacy puede mostrar vacío** aunque haya jobs en DB: bug viejo del componente `appliedOffers` que hace `GET /jobs` sin filtros y el filtro frontend falla. No tocar — la versión nueva en user-viewer/[id] funciona.

---

**Última actualización:** 2026-05-16 18:00 ART
