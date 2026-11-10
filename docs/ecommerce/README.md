# Clothing Center ecommerce

Clothing Center, Nicaragua, plans to turn its Vue catalog into a transactional store backed by ERPNext. The catalog,
selection and WhatsApp handoff exist in the local frontend. The buyer account, checkout and private ERP boundary are
design work. The owner reports roughly 1,600 items. No production inventory was inspected.
The owner identified the public catalog as `clothingcenterni.com` and the ERP as `erp.clothingcenterni.com`.

| Guide                                                  | Purpose                                                               |
|--------------------------------------------------------|-----------------------------------------------------------------------|
| [Decisions](decisions.md)                              | Approved scope and decisions by owner                                 |
| [Architecture](architecture.md)                        | Current dependencies, proposed trust boundaries and catalog migration |
| [ERP module](module.md)                                | Native documents, proposed metadata and source findings               |
| [API contracts](contracts.md)                          | Proposed routes, ownership, checkout and payment guarantees           |
| [Operations](operations.md)                            | Staging, communications, cutover and rollback                         |
| [Implementation](implementation.md)                    | Local source inventory, first block and acceptance procedure          |
| [Ecommerce backlog](backlog.md)                        | Delivery sequence and evidence                                        |
| [Original brief and coverage](reference/coverage.md) | Exact Spanish source and traceability for all 25 sections |
| [Infrastructure backlog](../infrastructure/backlog.md) | Server, continuity and mail workstreams                               |

The existing [trust and legal checklist](../trust-and-legal-checklist.md) is a separate working document. Use the current
source inventory to assess behavior. Confirm deployed revisions and site configuration with the operator before
applying any site changes.
