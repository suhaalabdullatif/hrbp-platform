---
name: React Query auth cache on persona switch
description: Why logout/login must clear the React Query cache in the HRBP web app, or role-gated UI shows stale entries.
---

On any auth state change (logout, persona switch) the web app MUST clear the React Query cache (`queryClient.clear()` in the logout `onSuccess`).

**Why:** The current user comes from a cached `useGetCurrentUser` query (QueryClient is configured with `retry:false`, so 401s settle immediately and the result is cached). If logout does not clear the cache, the stale user persists. The login page has a redirect effect (`if (user) setLocation("/")`), so it immediately bounces back into the app authenticated as the *previous* persona — role-gated nav/CTAs (e.g. global-only Benchmarking) then render for the wrong role. The footer name and nav role both read the same query object, so any mismatch means the cache was never refreshed.

**How to apply:** When adding auth flows or role-gated UI, clear the query cache on logout. Frontend role gating is defense-in-depth only — the API still enforces RBAC (benchmarking is global-only, returns 403), so gate both the sidebar nav item and any in-page CTA/link by `user.role`.
