# Infrastructure and mail backlog

This workstream tracks the ERP platform, continuity and email migration separately from the
[ecommerce backlog](../ecommerce/backlog.md). Preserve MariaDB and shared app versions across the initial multisite
bench design. Each site keeps its own database and domain. Shared code, assets, dependencies and processes create a
shared maintenance impact.

The owner reports bare-metal Bench on Ubuntu 20.04 LTS, multiple sites and a Mail-in-a-Box installation. Ubuntu
26.04 LTS is a target to validate. Versions, topology, capacity, data sizes, app installations and actual mail/ERP
colocation remain open. The [local inventory](../ecommerce/implementation.md) covers source checkouts only.

**Priority:** P0 gates the relevant workstream's release. P1 is evaluation or conditional. **Status:** Ready,
Planned and Waiting use the [ecommerce workflow](../ecommerce/backlog.md). Estimated and actual effort, exact
version, execution evidence and associated branch/commit/PR or configuration are pending until recorded.

| ID | Priority / status | Scope and dependencies | Acceptance evidence |
| --- | --- | --- | --- |
| INF-001 | P0 / Ready | Inventory operating systems, MariaDB, app versions per site, runtimes, services, sizes and topology. Coordinate EC-001. | Redacted environment matrix from operator-approved evidence, dependencies and resource measurements. |
| INF-002 | P0 / Planned | Compare Pilot and Frappe Docker with traditional Bench. INF-001. | Pin candidate versions and assess Ubuntu 26.04, MariaDB, custom apps, TLS/domains, multisite, backup/restore, updates and private access. Evaluate Press only if a platform/fleet requirement warrants it. |
| INF-003 | P0 / Planned | Define sizing, OS, storage, provider, network and budget. INF-001, INF-002. | Reviewed capacity/cost and operational constraints, owner decision and separate provisioning authorization. |
| INF-004 | P0 / Planned | Restore ERP into an isolated authorized environment. INF-001, staging access. | Restore DB/files/configuration with keys preserved, block live mail/jobs/callbacks, record integrity and restore time. |
| INF-005 | P0 / Planned | Validate runtime, app versions, upgrade and maintenance on the restored staging environment. INF-002, INF-004. | Pinned requirements, assets, TLS, maintenance commands, background jobs and recovery work across representative sites. |
| INF-006 | P0 / Planned | Prepare ERP cutover, routes, backup, rollback and owner runbook. INF-003 through INF-005, EC-060 coordination. | Rehearsed switch and restore with timing, staff access and in-flight reconciliation. |
| INF-007 | P0 / Waiting | Execute ERP migration. INF-006 and separate owner authorization. | Approved window and plan, verification across sites and recorded rollback decision. |
| INF-010 | P0 / Ready | Inventory mail topology, domains, mailboxes, aliases, clients, DNS and volumes. | Redacted inventory covering folders, flags, credentials lifecycle, calendars/contacts, backups and SMTP usage. |
| INF-011 | P0 / Planned | Compare keeping MIAB with Suite/JMAP and Stalwart, including whether Suite Cloud provisioning is needed. INF-010. | Version-pinned fit, compatibility, operations, sender reputation and migration/rollback matrix. |
| INF-012 | P0 / Planned | Test mail migration and delivery in isolation. INF-011 and selected candidate. | Sample data preserves folders and flags; separately prove contacts/calendar, aliases, auth, deliverability and restore. |
| INF-013 | P0 / Waiting | Prepare and execute mail cutover with separate authorization. INF-012. | Validate MX/SPF/DKIM/DMARC, PTR, ports, sync and sender reputation. Rehearse rollback and obtain release approval. |
| INF-020 | P1 / Planned | Evaluate and, if authorized, rehearse MariaDB read replication. INF-001, INF-004 and recovery objectives. | Pin source/replica versions, access controls, backup and rebuild procedures, replication health and lag measurements. |
| INF-021 | P1 / Planned | Design selected read routing. INF-020 and approved freshness policy. | Identify safe read paths, route authoritative reads/writes to primary, and specify fallback on stale or broken replica. |
| INF-022 | P0 / Planned | Validate independent catalog continuity. INF-001 and EC-031. | Published catalog, media and legal data meet approved freshness/degradation behavior while ERP processes are unavailable. |
| INF-023 | P0 / Planned | Validate checkout behavior during maintenance. EC-041, EC-043 and INF-022. | Preserve selection, show unavailability, recover in-flight order outcomes and resume without duplicate orders. |
| INF-024 | P1 / Planned | Exercise lag, rebuild, schema changes and failure. INF-020, INF-021, INF-022. | Report measured delays, stale read behavior, migration compatibility and recovery under simulated outages. |
| INF-025 | P1 / Waiting | Evaluate true checkout availability during deploys if required. INF-023 and owner availability objective. | Compare active ERP service options and schema compatibility, prove intended recovery and document cost and operational tradeoffs. |

## Evaluation notes

A read replica can serve selected catalog reads. ERP process outages require an independent serving path for
cached/published data. Keep checkout tied to the authoritative writer. Backups, replication and failover have
separate evidence and recovery goals.

For Pilot, verify `setup requirements`, `setup letsencrypt`, `build`, `build --force`, `restart`, site
`clear-cache`, and the supported `trim-database` and `trim-tables` dry-run flags with the pinned version's help.
Use the `pilot -b NAME` bench selector and check the site-scoped `frappe --site SITE` invocation before testing.
Real trim runs change database structure. Evaluate from dry-run output and an approved backup only. Pin compatible
versions throughout. [Pilot](https://github.com/frappe/pilot) · [Frappe Docker](https://github.com/frappe/frappe_docker)

Suite provides productivity apps and can use an existing JMAP mail service. Stalwart provides mail service and
Suite Cloud can handle provisioning. Test any migration as a separate project, including SMTP relay for the store.
The store's SMTP readiness does not depend on completing a mail platform migration.
[Suite](https://github.com/frappe/suite) · [Suite Cloud](https://github.com/frappe/suite_cloud) ·
[Mail-in-a-Box](https://mailinabox.email/) · [Stalwart migration](https://stalw.art/docs/migration/)
