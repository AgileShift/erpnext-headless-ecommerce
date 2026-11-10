# Ecommerce backlog

**Priority:** P0 is a launch gate. P1 is conditional on launch scope. Dependencies refer to ticket completion unless
a narrower gate is stated. **Status:** Planned, Ready, In progress, Waiting, Done, Not applicable. Ready means the
next bounded action can be assigned. Future implementation still requires authorization. Use Not applicable only
after an explicit scope decision.

For each ticket, append actual effort, verification artifacts, branch/commit/PR and UI configuration evidence when
available. Those fields are pending for all rows. EC-001 has partial source evidence in the
[local inventory](implementation.md). No implementation tickets are complete.

| ID | Priority / status | Scope and dependencies | Acceptance evidence |
| --- | --- | --- | --- |
| EC-001 | P0 / In progress | Inventory code, site versions/apps and staging. Coordinate INF-001. | Exact source and site matrix, approved staging path, private routing and runtime readiness. Local findings are recorded in the inventory. |
| EC-002 | P0 / Ready | Resolve launch inputs with each owner as gates approach. See [decisions](decisions.md). | Signed-off or explicitly deferred values for company/warehouse, catalog, price, currency, customer, payment, fulfillment and stock. |
| EC-003 | P0 / Ready | Confirm UI metadata process and catalog licensing with code owners. | Recorded rights/reimplementation decision, approved UI staging path and review of generated diff and constraint gaps. |
| EC-010 | P0 / Planned | Managed Supabase OTP and SMTP. Needs project, sender, sign-up policy and approved environment. | Correct OTP succeeds. Wrong/expired/used OTP fails. Verify limits, sender, session refresh, logout and permitted URLs in test environment. |
| EC-011 | P0 / Planned | Vue email/code and session screens. EC-010 and auth contract. | OTP flow works through normal UI, errors/resend are understandable, expiry and logout recover correctly, ForTech unaffected. |
| EC-012 | P0 / Ready | Small TypeScript store API and trusted ERP client. [Fixture slice](implementation.md) is independent. Integration needs EC-001, EC-010 and hosting/private route decisions. | Fixture evidence first. Then reject forged, expired, anonymous, unverified and wrong issuer/audience tokens. Verify explicit operations, secret isolation and least-privilege connectivity. |
| EC-020 | P0 / Planned | Resolve Contact/Customer lifecycle and ownership. EC-002 buyer policy, EC-001 staging. | UI model review and case matrix for duplicate email, multiple links, shared Customer, merge, rename, deletion and reassignment. |
| EC-021 | P0 / Planned | Create approved module/navigation/settings/fields via UI. EC-003, EC-020 and relevant EC-002 decisions. | Authorized staging UI and generated diff match reviewed design, least-privilege access and rollback documented. |
| EC-022 | P0 / Planned | Buyer binding and authorization. EC-010, EC-012, EC-020, EC-021. | Bootstrap replay resolves one identity, no buyer User or invite, mismatched identity/Customer cannot gain access. |
| EC-030 | P0 / Planned | Migrate published catalog from legacy behavior. EC-002 publication/pricing, EC-003, EC-021 where settings required. | Synthetic regression fixtures preserve approved variants, filters, sizes, colors and pagination. Disabled/unpublished products excluded; no Website Item dependency. |
| EC-031 | P0 / Ready | Public catalog, media and content API. [Fixture slice](implementation.md) can start independently. Integration needs EC-012, EC-030 and approved content/media sources. | Approved contract and browser trace cover listing, detail, categories, attributes, media, legal content and safe errors. No origin exposure. |
| EC-032 | P0 / Planned | Brand configuration, CSP and store routing. EC-031 and public origin decision. | Both brands verified, Clothing Center browser has only approved destinations and ForTech endpoints/config are preserved. |
| EC-040 | P0 / Planned | Buyer addresses and native quote. EC-002 quote decisions, EC-021, EC-022, EC-030. | Reject foreign address and manipulated price/currency/discount/tax/shipping. Verify native totals and Item Price side effects, version and expiry. |
| EC-041 | P0 / Planned | Atomic full-order confirmation. EC-040, EC-042 and EC-021 durable uniqueness. | Same and different keys, concurrent confirmation, changed totals, lost response after expiry and rollback all meet the [contract](contracts.md). |
| EC-042 | P0 / Planned | Reservation, release, expiry and cancellation. EC-002 stock policy, EC-021 and staged quote fixture. Can be developed with EC-040 before full checkout confirmation. | Competing checkouts for last unit, abandoned/expired flows and cancel/release honor policy under realistic concurrency. |
| EC-043 | P0 / Planned | Vue checkout states. EC-011, EC-032, EC-040, EC-041. | Buyer can quote and confirm, accept changed totals explicitly, retry safely, and recover from network/ERP outages. |
| EC-050 | P0 / Planned | Approved payment initiation. EC-002 payment/finance decision, EC-041. | Owned order only. Payment Request and collection remain distinct. Pending, partial, approved, failed and retry states verified as applicable. |
| EC-051 | P1 / Waiting | Online gateway verification and recovery. Depends on provider selection, sandbox and EC-050. | Reject invalid callbacks and mismatched amount/currency/order; duplicate events/captures create no duplicate entries; reconcile timeouts, partials and refunds per approved rules. |
| EC-052 | P0 / Planned | Buyer history and documents. EC-022, EC-041, approved native document/PDF rules. | A cannot view, pay or download B's documents by swapping IDs or using the same Customer. Links and redirects stay at approved origins. |
| EC-053 | P0 / Planned | Native transactional notifications. EC-041, EC-050 and operational SMTP and event decisions. | Correct recipient, channel and trigger; no unrelated sales or duplicate notices; successful queue delivery and store-safe links/PDFs. |
| EC-060 | P0 / Planned | Prove private ERP, authorized staff and public routing. EC-012, EC-032, EC-052, EC-053 and EC-051 if in scope. Coordinate INF-006 and INF-023. | External probe and browser trace demonstrate isolation, content/media/PDF and callbacks work, and staff access still works. |
| EC-061 | P0 / Planned | Integrated staging acceptance. EC-060 and all applicable launch tickets. | Run acceptance cases across auth, ownership, catalog, totals, retries, stock, payment, mail and outages. Record evidence and resolve launch defects. |
| EC-062 | P0 / Planned | Approve and execute cutover. EC-061 and owner approval. | Versioned release plan, rollback rehearsal and in-flight reconciliation, written production authorization and post-cutover verification. |

## Initial effort estimate

Effective days for one experienced implementer assisted by an agent, with owner review, existing catalog reuse and
available staging. Planning estimate only. External waits, server migration and mail platform migration are excluded.

| Slice | Effective days |
| --- | --- |
| Preparation | 0.5–1 |
| Auth and backend | 1–2 |
| Module and buyer association | 1–2 |
| Catalog and media | 1–2 |
| Checkout, orders and stock | 2–4 |
| Manual payment scenario, history and mail | 1–2 |
| Verification and cutover | 1–2 |

Base estimate is roughly 8–15 effective days. An already compatible online gateway adds roughly 2–5 days, for about
10–20 working days total. Manual payment is an estimation scenario. Re-estimate after inventory and the first staged
checkout, and estimate any new gateway separately after source and sandbox review.
