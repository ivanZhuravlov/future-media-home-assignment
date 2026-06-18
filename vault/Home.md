---
tags:
  - moc
  - index
---

# Micro-Messaging Board — Knowledge Vault

Welcome to the project knowledge base for the **Micro-Messaging Board** full-stack application (NestJS + Next.js + PostgreSQL).

## Quick links

| Topic | Note |
|-------|------|
| **How to log in** | [[Getting Started/Login and Credentials]] |
| **Run the app locally** | [[Getting Started/Running Locally]] |
| **How the app was built** | [[How It Was Built/Development Phases]] |
| **Architecture decisions** | [[How It Was Built/Architecture Decisions]] |
| **API endpoints** | [[Backend/API Reference]] |

## Vault structure

```
vault/
├── Home.md                          ← you are here
├── Overview/
│   ├── Project Overview.md
│   └── Tech Stack.md
├── Getting Started/
│   ├── Running Locally.md
│   ├── Environment Variables.md
│   └── Login and Credentials.md
├── How It Was Built/
│   ├── Development Phases.md
│   └── Architecture Decisions.md
├── Backend/
│   ├── NestJS Structure.md
│   ├── API Reference.md
│   ├── Authentication.md
│   └── Messages Module.md
├── Frontend/
│   ├── Next.js Structure.md
│   └── Components and Hooks.md
├── Database/
│   ├── Schema and Migrations.md
│   └── Indexes.md
└── Operations/
    ├── Docker.md
    └── Testing.md
```

## What is this app?

A micro-messaging board where authenticated users can post short messages (max 240 characters), tag them, filter the feed, and edit or delete their own posts.

## Source of truth in the repo

- `Project_Plan.md` — requirements, phases, and architectural intent
- `backend/` — NestJS API
- `frontend/` — Next.js 14 App Router UI
- `docker-compose.yml` — PostgreSQL service
