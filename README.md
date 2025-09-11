# Coforma Studio

**Domain:** [coforma.studio](https://coforma.studio)
**Developer:** Aureo Labs ([aureolabs.dev](https://aureolabs.dev))
**Parent Company:** Innovaciones MADFAM S.A.S. de C.V. ([madfam.io](https://madfam.io))

---

## Overview

Coforma Studio is a **multi-tenant SaaS platform** designed to help companies create, manage, and scale **Customer Advisory Boards (CABs)**. By combining structured feedback loops, engagement hubs, and incentive mechanisms, it transforms CABs into **growth engines** that accelerate product-market fit, strengthen loyalty, and reduce customer acquisition costs.

Built with a **LATAM-first ethos** and designed for **global scalability**, Coforma Studio introduces a new category: **Advisory-as-a-Service (AaaS)**.

---

## Key Features

* **Recruitment & CRM:** Manage CAB candidate pipelines, contracts, and onboarding.
* **Engagement Hub:** Schedule sessions, share agendas/minutes, and collect structured feedback.
* **Roadmap Linkage:** Tie customer feedback directly to Jira, Asana, or ClickUp tasks.
* **Incentives & Recognition:** Discounts, referral programs, badges, and spotlight features.
* **Analytics & ROI:** Engagement dashboards, revenue influence tracking, and executive-ready reports.

---

## Architecture

* **Frontend:** Next.js (React + TailwindCSS) on **Vercel**.
* **Backend/API:** Node.js (NestJS) on **Railway**.
* **Database:** PostgreSQL (RLS enforced multi-tenancy) on **Railway**.
* **Cache/Queue:** Redis (Railway) with BullMQ for background jobs.
* **Search:** Meilisearch (Railway).
* **Storage & CDN:** Cloudflare R2 + Cloudflare CDN for file storage and delivery.
* **Integrations:** Zoom, Slack, Jira, Asana, ClickUp, HubSpot, Stripe.
* **Authentication:** NextAuth.js (OAuth2.0, OIDC, SSO).

---

## Monetization

* **Starter (\$500–1k/mo):** Up to 25 CAB members, basic CRM, event management.
* **Growth (\$2–3k/mo):** Up to 100 members, integrations, advanced analytics.
* **Enterprise (\$5k+/mo):** Unlimited members, full white-label, API access, and custom SLAs.

**Add-ons:** facilitation training, managed services, insights packages.

---

## Roadmap

* **Phase 1 (0–6 months):** Internal pilot with MADFAM CABs; MVP with recruitment, engagement, and dashboards.
* **Phase 2 (6–12 months):** SaaS MVP launch; 1–2 pilot external clients; billing via Stripe.
* **Phase 3 (12–24 months):** Productization with white-labeling, integrations, and advanced analytics.
* **Phase 4 (24+ months):** AI-assisted facilitation, facilitator marketplace, enterprise/gov adoption.

---

## Success Metrics

* Internal CAB adoption at MADFAM.
* Retention rates beyond discount phases.
* SaaS revenue growth from external tenants.
* Referral-attributed pipeline generation.
* Net Promoter Score (NPS) and PMF fit score.

---

## Strategic Advantage

By building Coforma Studio, MADFAM both **improves its own product development cycle** and **creates a monetizable SaaS platform** for the wider market. The result is dual leverage: stronger internal innovation and recurring external revenues. This positions MADFAM as a **pioneer of Advisory-as-a-Service** and a **solarpunk innovation leader** in LATAM with global reach.
