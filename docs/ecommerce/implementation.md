# Implementation baseline and first block

## Local inventory

Inspected 2026-11-09. The backend roots below are inside
`/Users/jeansreal/Development/PyCharmProjects/bench/apps`. The storefront is under
`/Users/jeansreal/Development/WebStormProjects`. Branch comparisons refer to local tracking refs.

| Checkout | Remote | Branch and exact HEAD | Working tree at intake |
| --- | --- | --- | --- |
| erpnext-headless-ecommerce | AgileShift/erpnext-headless-ecommerce (origin) | main, `0fe9420b1f0035dd3a04c73893a8eb53b367bb7b` | Three untracked trust checklist/audit files |
| grupo_real_tools | AgileShift/grupo_real_tools (origin) | main, `8cd36c01aaa42e85b4d9453fa8830e97327f3bc9` | One commit ahead. Existing app docs, hooks, localization, Payment Settlement and Procurement changes |
| gr_tools | AgileShift/gr_tools (upstream) | develop, `2bc608b6b1b697752481588d8ff27eb99afb14b7` | Existing staged deletions and unstaged Procurement deletions, hooks and settings fixture changes. Catalog source had no reported edits |
| frappe | frappe/frappe (upstream) | version-16, `3d1284c5fdb52207a516a49bbf2fd186cb43b3ab` | Clean. Source version 16.55.2 |
| erpnext | frappe/erpnext (upstream) | version-16, `495380b59c8701629f25089bd3807e6ddf7f26c6` | Clean. Source version 16.54.0 |

The bench's `sites/apps.txt` lists both custom apps, Frappe, ERPNext, payments, cargo_management, erpnext_powertranz,
erpnext_nicaragua and frappe_v16_standard. This file describes locally available apps. Per-site installation, production
versions, hosting, staging and MariaDB version remain unverified. The local PowerTranz checkout is on `version-16`
at `4bb0dac` with active work. Its working-tree `PowerTranzSettings.get_payment_url` returns a placeholder ERP URL.
Treat it as an evaluation candidate for EC-051 and verify the real checkout, callback and reconciliation in sandbox.

Read the target app's root instructions and README, the legacy README and the normalization reference linked by
the target AGENTS. The reference exists at `bench/frappe-app-standards/skills/frappe-app-docs-normalize/SKILL.md`.
This is transverse project documentation in the frontend. App and module guide alignment would be a separate scope.
The original frontend trust files are `docs/trust-and-legal-checklist.md`, `scripts/audit-live-trust.mjs` and
`scripts/audit-trust-readiness.mjs`. The architecture and module guides record deltas from the handoff.

## Working agreement

Before each phase, locate the actual checkouts, read the applicable AGENTS, README and CONTRIBUTING instructions,
and record Git status, remotes, branches and commits. Preserve unrelated work. Use English in code and documentation,
Spanish with the owner, and localizable product messages. Keep changes small and avoid incidental dependency upgrades
and unrelated refactors. Separate observed behavior, approved decisions, proposals and open questions.

The initial handoff authorized local code and document review, repository inventory, documentation, backlog and
proposed contracts, acceptance criteria and local branch preparation. Later implementation requires authorization
for its concrete phase. Carry that authorization forward within its scope. Production changes, access/DNS/firewall
changes, service purchases or provisioning, destructive migrations and operations on real commercial or accounting
documents require separate authorization. Inspect production business data only when explicitly authorized.
Apply the target app's UI metadata rules and specific approval requirements for hooks and overrides.

## Block 1 proposal — prove the public catalog boundary

**State:** Ready for implementation authorization as a local experiment. This is part of EC-012 and EC-031.
Those tickets remain open until their actual integration gates pass.

**Scope:** Once authorized, create a small TypeScript HTTP entry point in the storefront checkout for the public
catalog routes in [the contract](contracts.md). Use local synthetic fixtures and a thin catalog adapter so the
transport contract can be checked without resolving deployment or publication policy. Use a local Clothing Center
configuration that opts into that path for the test. Preserve the current default and ForTech paths. Leave production
hosting and the final TypeScript package/runtime decision open. A fixture adapter never points at a live ERP.

**Minimum fixture:** One standalone item and one template with two variant SKUs and distinct colors/sizes, a category
parent/child, one excluded item, one image and one legal document slug. Use synthetic currency amounts as strings.
Define a deterministic fixture page and continuation. Fixture prices and availability only describe the local test.

**Acceptance evidence to record in the PR or local review:**

1. Start the fixture backend on loopback and use the documented local storefront entry point. Verify list, detail,
   filters and pagination, including bounded/invalid inputs, empty results and excluded items.
2. Verify allowed media and legal content routes, safe 404s for unknown IDs/slugs and no arbitrary source URL
   parameters. Verify backend failures return a stable sanitized error.
3. Capture browser requests for the opt-in Clothing Center test and confirm no request or returned link points at
   an ERP origin. Run a ForTech config/route regression check, including unchanged default catalog behavior.
4. Record the exact commands, build/type-check results and focused browser/HTTP results. Confirm no network calls to
   ERP, auth or payment providers during the fixture run.

Use a read-only scope for this block. Staging integration follows EC-001/EC-002/EC-003 and the hosting, access and
publication decisions. Supabase setup and identity verification are separate slices. Follow the
[official JWT guidance](https://supabase.com/docs/guides/auth/jwts) for the later auth slice.

## Evidence still required for launch

Use the acceptance criteria in [the backlog](backlog.md) as release gates. In particular, prove real OTP session and
ownership isolation, an ERP-priced quote and full order in isolated staging, concurrent order/retry behavior,
native payment reconciliation if applicable, transactional mail and ERP privacy. No live or staging behavior was
executed during this documentation pass.
