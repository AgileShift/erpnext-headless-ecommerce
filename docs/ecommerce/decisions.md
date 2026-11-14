# Ecommerce decisions

## Approved

- Preserve Vue 3, Pinia, Storefront UI and the existing catalog experience. Preserve ForTech's configuration and behavior.
- Use managed Supabase Auth with email OTP. Supabase owns authentication, identity and sessions. Buyers must authenticate
  before buying. Google, Facebook, WhatsApp and SMS authentication are outside launch scope.
  Supabase buyer accounts live outside the ERP database. Store-owned passwords, OTP generation, password recovery
  and token issuance are outside scope.
- Keep buyers out of ERPNext's User DocType, including Website Users. Keep the ERP inaccessible to buyers and keep its
  origin out of the store browser's dependencies, including media, files, PDFs, legal content and payment routes.
  ERP signup, Social Login and Contact invitations that create Users are excluded from buyer flows.
- ERPNext is authoritative for products, prices, discounts, taxes, currencies, stock, parties and transaction documents.
  Reuse native validation, permissions and document lifecycles. Frappe Shop, Webshop, Website Item population, a second
  ERP, a replacement commerce engine and a React rewrite are outside scope.
- Retain MariaDB in the infrastructure workstream. The owner's reported ERP version is v16.50 or above. Exact deployed
  revisions and the database version are open.
- The owner confirmed ownership of the legacy catalog code and authorized its migration into the MIT target app.
  The first slice is the internal Python catalog package.
- Publish every product and variant with positive available stock in the store's single warehouse, configured through
  `Company.default_warehouse`. The listing and detail use the same rule. Publication is automatic.

- Use the selling price list configured in ERPNext under Selling Settings for catalog prices.
- Display catalog prices in both USD and NIO. The current USD list is displayed with its NIO equivalent at
  36.6243 NIO per USD, the [official BCN rate for 2026](https://bcn.gob.ni/node/10376).
- Use NIO as Clothing Center's primary store and transaction currency for quotations and sales orders. The selling
  price list may remain in USD; ERPNext determines the conversion and rounding used on the document. A buyer's
  preferred display currency, if added later, defaults to the store currency and does not change the transaction.
  Preserve ForTech's currency behavior.
- Launch with normal sales, without temporary stock holds or layaway. Preserve native ERPNext stock commitments
  for confirmed orders and validate concurrent purchases against the available stock.
- The first pilot is cart, email OTP, store pickup and a `Quotation` in NIO, without online payment. It validates
  the integration and is not the final checkout flow. Defer persistent favorites until after the initial launch.

## Proposals

The TypeScript store backend, route prefix, contact association, Ecommerce module and settings, release sequence and
checkout persistence model are proposed. Review [architecture](architecture.md), [ERP module](module.md) and
[contracts](contracts.md) for the details and evidence.

## Open decisions by role

| Role | Decision or evidence to supply | Needed by |
| --- | --- | --- |
| Store owner and sales | Company, warehouse, currency and conversion policy, approved pagination semantics, acceptable catalog staleness | EC-002, EC-030 |
| Store owner and customer service | Existing customer linking, when to create Customer, explicit customer selection for multi-link contacts, guest-to-OTP account creation policy, safe reassignment and recovery | EC-010, EC-020 |
| Store owner and fulfillment | Final delivery options, charges and eligibility, backorders and cancel handling | EC-040, EC-042 |
| Store owner and finance | Initial payment methods, provider if any, currency and partial payment rules, collection, invoicing, cancellation and refunds | EC-050, EC-051, EC-053 |
| Site operator | Deployed commits, apps per site, staging and sample data, Node runtime and hosting, public origin, private route and staff access | EC-001, EC-012, EC-060 |
| Auth and mail operator | Supabase project/region, trusted issuer and signing mode, allowed URLs, SMTP and sender, expiry/rates and deliverability | EC-010, EC-053 |
| ERP maintainer and owner | Minimum metadata, channel and durable checkout identity, UI-expressible constraints, permissions and setup/rollback | EC-003, EC-020, EC-021, EC-041 |
| Infrastructure owner | MariaDB version, target runtime, network, topology, continuity objectives and MIAB/Suite decision | INF-001 through INF-025 |

The first local fixture block requires the implementation authorization described in [the plan](implementation.md).
Production launch choices can be resolved as their tickets approach.
