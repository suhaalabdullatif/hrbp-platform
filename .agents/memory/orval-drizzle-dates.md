---
name: Orval/Drizzle date serialization
description: Why API routes must convert Drizzle timestamp values before Zod parse
---

Generated Zod schemas (from the OpenAPI spec via Orval) type `createdAt`/`updatedAt`
as `zod.string()`. Drizzle `timestamp` columns return JS `Date` objects, so passing a
row straight into `Response.parse()` throws.

**Rule:** Convert `Date` → ISO string before parsing responses. Use the `iso()` /
`isoOrNull()` helpers in `artifacts/api-server/src/lib/serialize.ts`.

**Why:** `date`-mode columns (e.g. `hireDate`) already return strings and need no
conversion — only `timestamp` columns (`createdAt`/`updatedAt`) are `Date`. Easy to
miss because some date fields pass through fine.

**How to apply:** In every entity route mapper, spread the row then override
`createdAt`/`updatedAt` with `iso(...)`. zod.object strips unknown keys, so adding
joined fields like `businessUnitName` is safe.
