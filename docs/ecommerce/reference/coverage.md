# Original brief coverage

This register maps all 25 sections of the [original Spanish brief](original-brief.es.txt) to the project guides.
The archived text preserves the original wording, including the first-task authorization, proposals, estimates and
reported observations. The English guides distinguish that baseline from the code evidence and later decisions.
An archival statement is dated context. New work still follows current owner authorization and repository instructions.

| Original section | Lines | Working reference and reconciliation |
| --- | --- | --- |
| 1. Mission | 4–33 | [Working agreement](../implementation.md#working-agreement) and [first block](../implementation.md#block-1-proposal--prove-the-public-catalog-boundary). Local preparation and later implementation remain separate. |
| 2. Business context | 34–55 | [Project guide](../README.md) and [architecture](../architecture.md). Store and ERP origins, reported item count, native reuse and commercial integrity. |
| 3. Repositories | 56–93 | [Local inventory](../implementation.md#local-inventory) and [repository ownership](../architecture.md#repository-ownership). Exact local revisions and responsibilities. |
| 4. Working instructions | 94–129 | [Working agreement](../implementation.md#working-agreement), [inventory](../implementation.md#local-inventory) and [ERP module](../module.md). UI metadata, localization, scoped hooks and data boundaries. |
| 5. Accepted decisions | 130–236 | [Decisions](../decisions.md#approved). Existing stack, ERP authority, launch exclusions, managed OTP, buyer/ERP user separation and private ERP. |
| 6. Proposed architecture | 237–279 | [Public boundary](../architecture.md#proposed-boundary). Browser, auth provider, TypeScript service, ERP, staff and provider routes. Hosting is open. |
| 7. Observed frontend | 280–327 | [Current local behavior](../architecture.md#current-local-behavior). Includes the extra attribute and Wiki calls, brand fallback, Vite and starter test. |
| 8. ERP module | 328–360 | [ERP module](../module.md). Proposed native views and links for products, buyers, commercial documents, payments, fulfillment, mail and settings. |
| 9. Buyer model | 361–410 | [Identity and ownership](../module.md#identity-and-ownership). Contact links, explicit enablement, trusted issuer/subject, reassignment and historical access. |
| 10. Store configuration | 411–451 | [ERP module](../module.md). Candidate store settings, payment/delivery options and deployment secrets. |
| 11. Python scope | 452–481 | [ERP module](../module.md) and [boundary](../architecture.md#proposed-boundary). Native pricing, tax, currency and mail behavior remain authoritative. |
| 12. ERPNext reuse | 482–509 | [Local source findings](../module.md#local-source-findings). Controller entry points, price side effects, native document lifecycle, mapping, stock and payment caveats. |
| 13. Public API | 510–550 | [Contracts](../contracts.md). Public, buyer and provider routes, allowlists, ownership and filtered responses. |
| 14. Checkout | 551–632 | [Quote and confirmation](../contracts.md#quote) and EC-040 through EC-043 in the [backlog](../backlog.md). Totals, replay ordering, durable one-order guarantee and stock policy. |
| 15. Payments | 633–662 | [Payment contract](../contracts.md#payments), [native source](../module.md#local-source-findings) and EC-050/EC-051 in the [backlog](../backlog.md). Authorization, capture deduplication, partial amounts and reconciliation. |
| 16. Email | 663–706 | [Communications](../operations.md#communications). Supabase OTP mail, native ERP notifications, recipients, event triggers and links. |
| 17. Legacy migration | 707–737 | [Legacy migration](../architecture.md#legacy-catalog-migration). Observed filters, pagination, caching, publication gap, cutover, wrappers and license decision. |
| 18. Ecommerce backlog | 738–847 | [Ecommerce backlog](../backlog.md). All 23 original IDs, dependency and verification fields, and current status. |
| 19. Estimates | 848–883 | [Initial effort estimate](../backlog.md#initial-effort-estimate). Preserves ranges, assumptions, exclusions and re-estimation gates. |
| 20. Infrastructure | 884–1056 | [Infrastructure backlog](../../infrastructure/backlog.md). All 11 original IDs plus six continuity tickets, with separate ERP, replica and mail gates. |
| 21. Open decisions | 1057–1083 | [Decisions by role](../decisions.md#open-decisions-by-role). Ownership, launch prerequisites, infrastructure and exact versions. |
| 22. Acceptance | 1084–1144 | [Acceptance criteria](../backlog.md), [checkout and payments](../contracts.md), [release gates](../operations.md) and [infrastructure acceptance](../../infrastructure/backlog.md). |
| 23. Documentation | 1145–1178 | [Project guide](../README.md). All nine proposed documents, with a single backlog per workstream and source provenance. |
| 24. Initial delivery | 1179–1194 | [Implementation inventory and first block](../implementation.md), [decisions](../decisions.md) and the two backlogs. Runtime results remain pending. |
| 25. Initial references | 1195–1221 | [Complete original reference list](original-brief.es.txt). Relevant official links also appear in the working guides. |
