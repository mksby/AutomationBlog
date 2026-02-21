# Automation Blog

A blog about automation processes, tools, and best practices.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 5 (SSG) |
| CMS | Strapi 5 |
| Database | PostgreSQL 16 |
| Reverse Proxy | Traefik 3 + Let's Encrypt |
| Containers | Docker / OrbStack (local) |
| Infrastructure | Terraform → Hetzner Cloud VPS |
| CI/CD | GitHub Actions → GHCR |
| Design | Figma Make |
| AI Tracking | entire.io |

## Project Structure

```
apps/
  cms/          Strapi 5 — headless CMS
  web/          Astro 5 — static frontend
docker/
  docker-compose.dev.yml    Local development (PostgreSQL)
  docker-compose.prod.yml   Production (Traefik + all services)
  traefik/                  Traefik configuration
  nginx/                    Nginx for Astro static files
  backup/                   PostgreSQL backup scripts
infra/
  main.tf         Hetzner VPS, firewall, SSH
  variables.tf    Infrastructure variables
  scripts/        Cloud-init for provisioning
.github/
  workflows/
    ci.yml              Lint + type-check on PR
    deploy.yml          Build → GHCR → deploy on push to main
    rebuild-web.yml     Astro rebuild on content publish
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker / OrbStack
- Terraform (for deployment)

### Setup

```bash
# Clone the repository
git clone <repo-url> && cd AutomationBlog

# Install dependencies
corepack enable
pnpm install

# Start PostgreSQL
docker compose -f docker/docker-compose.dev.yml up -d

# Start Strapi
pnpm dev:cms
# → http://localhost:1337/admin

# In a separate terminal — start Astro
pnpm dev:web
# → http://localhost:4321
```

Or with a single command:

```bash
./scripts/setup-local.sh
```

### First Strapi Launch

On first launch, Strapi will prompt you to create an admin account. After that:

1. Create content types via Content-Type Builder (Article, Page, Project, Tutorial, Code Snippet, Author, Category, Tag)
2. Settings → Roles → Public → enable `find` and `findOne` for all content types
3. Settings → API Tokens → create a token and add it to `apps/web/.env` as `STRAPI_API_TOKEN`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:cms` | Start Strapi in development mode |
| `pnpm dev:web` | Start Astro dev server |
| `pnpm build:cms` | Build Strapi |
| `pnpm build:web` | Build Astro (static output) |
| `pnpm docker:dev` | Start PostgreSQL via Docker |
| `pnpm docker:dev:down` | Stop Docker dev services |
| `pnpm docker:prod` | Start production stack |
| `pnpm infra:plan` | Terraform plan |
| `pnpm infra:apply` | Terraform apply |

## Environment Variables

Copy `.env.example` to the appropriate locations:

```bash
cp .env.example apps/cms/.env
cp .env.example apps/web/.env
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

### Key Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_*` | `apps/cms/.env` | PostgreSQL connection |
| `APP_KEYS`, `JWT_SECRET`, `ADMIN_JWT_SECRET` | `apps/cms/.env` | Strapi secrets |
| `PUBLIC_STRAPI_URL` | `apps/web/.env` | Strapi API URL |
| `STRAPI_API_TOKEN` | `apps/web/.env` | API token for Astro |
| `HCLOUD_TOKEN` | `infra/terraform.tfvars` | Hetzner Cloud API |
| `DOMAIN` | `.env`, GitHub vars | Site domain |

### GitHub Secrets (for CI/CD)

Configure in Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `SERVER_IP` | Hetzner VPS IPv4 |
| `SSH_PRIVATE_KEY` | ed25519 deploy key |
| `DATABASE_PASSWORD` | Production PostgreSQL password |

| Variable | Description |
|----------|-------------|
| `DOMAIN` | Domain name (example.com) |

## Deployment

### 1. Provision Hetzner VPS

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Fill in terraform.tfvars

terraform init
terraform plan
terraform apply
```

Terraform creates a VPS with Ubuntu 24.04, Docker, fail2ban, and ufw.

### 2. Configure DNS

Add A records:
- `yourdomain.com` → server IP
- `cms.yourdomain.com` → server IP

### 3. First Deploy

```bash
# Copy .env.strapi to the server
scp docker/.env.strapi root@SERVER_IP:/opt/automation-blog/docker/

# Or configure GitHub Secrets and push to main —
# CI/CD will automatically build and deploy
git push origin main
```

### Automatic Deployment

On push to `main`:
1. GitHub Actions builds Docker images (Strapi + Astro)
2. Pushes to GitHub Container Registry
3. Connects to the server via SSH
4. Updates containers via `docker compose pull && up -d`

### Content Publish Rebuild

A Strapi lifecycle hook automatically triggers a GitHub Actions workflow when:
- An article, page, project, tutorial, or code snippet is published/updated/deleted
- The webhook calls `repository_dispatch` → Astro rebuild → deploy new static site

## Backups

PostgreSQL is backed up automatically via `kartoza/pg-backup`:
- Schedule: daily at 02:00 UTC
- Retention: 14 days

Manual backup/restore:

```bash
./docker/backup/backup.sh
./docker/backup/restore.sh <backup_file.sql.gz>
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Hetzner VPS                     │
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌─────────────┐ │
│  │ Traefik  │──▶│ Astro    │   │ PostgreSQL  │ │
│  │ :80/:443 │   │ (nginx)  │   │ :5432       │ │
│  │ SSL auto │──▶│ :80      │   └──────▲──────┘ │
│  └──────────┘   └──────────┘          │         │
│       │                          ┌────┴───────┐ │
│       └─────────────────────────▶│ Strapi     │ │
│         cms.domain.com           │ :1337      │ │
│                                  └────────────┘ │
│                                                  │
│  ┌────────────┐                                  │
│  │ pg-backup  │  Daily backups                   │
│  └────────────┘                                  │
└─────────────────────────────────────────────────┘

      ▲ GitHub Actions
      │ build → GHCR → SSH deploy
      │
┌─────┴──────┐
│   GitHub   │◀── Strapi webhook (repository_dispatch)
│   Actions  │
└────────────┘
```

## Content Types

| Type | Description | URL |
|------|-------------|-----|
| Article | Blog posts | `/blog/[slug]` |
| Tutorial | Step-by-step tutorials | `/tutorials/[slug]` |
| Project | Automation project portfolio | `/projects/[slug]` |
| Code Snippet | Reusable code examples | `/snippets/[slug]` |
| Page | Static pages (About, Contact) | `/[slug]` |
| Category | Content grouping | `/categories/[slug]` |
| Tag | Content filtering | `/tags/[slug]` |

## Local Development

```
Astro dev (host)     →  http://localhost:4321
Strapi (Docker)      →  http://localhost:1337
Strapi Admin         →  http://localhost:1337/admin
PostgreSQL (Docker)  →  localhost:5432
```

Astro runs natively on the host for fast HMR. Strapi and PostgreSQL run in Docker via OrbStack.
