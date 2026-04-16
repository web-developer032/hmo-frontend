# HMO Frontend

Next.js (App Router) + TypeScript + Tailwind CSS v4.

## Stack (initial)

- **UI:** Design tokens in `app/theme-tokens.css` + `app/globals.css` (paper/ink, forest accent), **DM Sans** + **DM Serif Display** + **JetBrains Mono**, primitives in `components/ui/` (`PageHeader`, `StatusBadge`, etc.).
- **State & API:** Redux Toolkit + **RTK Query** (`lib/store.ts`, `lib/api/hmo-api.ts`).
- **Auth (aligned with `Docs/Authentication-Guide.md`):**
  - **Refresh token** (+ optional expiry ms) in `localStorage` only — not the access token.
  - **Access token** + **user** in Redux; `Authorization` header from `getState().auth.accessToken`.
  - **Bootstrap:** `POST /auth/refresh` then `GET /users/me` on load when a refresh token exists.
  - **401:** Mutex-protected refresh + retry; on failure clear session.
  - **Logout:** `POST /auth/logout` with refresh token, then clear storage, cookie, Redux, RTK cache.
  - **Logout all devices:** `POST /auth/logout-all` with JWT (same header as other calls); landlord/tenant UI exposes **All devices** next to **Sign out**.
  - **Route hints:** `hmo_authenticated=1` cookie for `proxy.ts` (Next.js 16+; UX only; API still validates JWT).
- **Guards:** `GuestRouteGuard` on `(auth)` routes; `ProtectedRouteGuard` on `dashboard`; root `proxy` enforces the same rules on full navigation.
- **Tables:** `@tanstack/react-table` via [`components/table/data-table.tsx`](components/table/data-table.tsx) (`DataTable`, `DataTableHeader`).
- **Toasts:** Sonner (`theme-aware-toaster.tsx`).
- **Theme:** `next-themes` with `attribute="data-theme"` on `<html>`.
- **Forms:** Formik + Yup (`lib/forms/`, `components/formik/`).

## Run

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000/api/v1`).
2. Run the **Nest API** on the matching host/port.
3. `pnpm dev` — default Next port from your setup (use a different port than the API if both are local).

## Routes

| Path | Access |
|------|--------|
| `/` | Public; shows dashboard CTA when signed in |
| `/login`, `/register` | Guests only (signed-in users redirected) |
| `/dashboard` | Signed-in only (`?next=` preserved when redirected from login) |

## Docs

`Docs/Authentication-Guide.md`, `Docs/Authentication.md`, `Docs/Backend-API.md`, `Docs/App - Architecture.md`.
