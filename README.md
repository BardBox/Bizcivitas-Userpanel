This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### What this repo contains — Detailed overview

- Purpose: Member-facing web app for Bizcivitas that provides member directory, event feeds, messaging, and membership management.
- Core responsibilities:
  - **Events feed** and event detail pages (view and sometimes register for events via the website/back-end).
  - **Member Directory** and **Member Profiles** (view, connect, and message members).
  - **Messaging & Notifications** — direct messages, notifications, and invitation flows.
  - **Membership features** (membership cards, tiers like Core Member, Digital Member, Flagship, etc.) and dashboards.
- Key modules & files:
  - `src/app/feeds/events/` — events listing and event detail
  - `src/app/feeds/member-directory/` — member directory pages
  - `src/store/membersSlice.ts` — fetch/create/update member APIs
  - `src/components/Membership/` — membership UI components
  - Notification and messaging components in `src/components/` and integration with backend API (`NEXT_PUBLIC_API_URL`)
- Tech: Next.js + TypeScript; uses API endpoints from the backend for dynamic data; deploys on Vercel.

## Getting Started (Developer Guide)

This Next.js application is the User Panel frontend for Bizcivitas.

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Quick setup

```bash
git clone <repo-url>
cd BizCivitas-Userpanel
npm install
cp .env.example .env
npm run dev
```

### Important environment variables

- NEXT_PUBLIC_API_URL - backend base URL
- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (if using Supabase directly)

### Running and deploying

- Development: `npm run dev`
- Build: `npm run build`
- Deploy: Vercel recommended; set env vars in Vercel dashboard

**Project relationships:** The User Panel communicates with the backend APIs for user-related operations. For repository status and handover env files, see `../REPOSITORY_STATUS_AND_ENV_HANDOVER.md`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

**Project relationships:** The User Panel is a frontend in the Bizcivitas ecosystem and communicates with the central backend service for user-related operations. For repository status and environment files included in the handover, see `../REPOSITORY_STATUS_AND_ENV_HANDOVER.md`.
