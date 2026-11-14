# Proposed ERP administration

The local target app lists Payment Settlement, Procurement and Layaway in `grupo_real_tools/modules.txt`.
The Python package `grupo_real_tools/ecommerce/` contains the migrated internal catalog service.
A Frappe Ecommerce Module Def and Workspace remain proposed. Use native navigation and links where they fit.

| Area | Native records |
| --- | --- |
| Products | Item, Item Group, Item Price, Pricing Rule |
| Buyers | Contact, Customer, Address |
| Quotes and orders | Quotation, Sales Order |
| Payment, billing and fulfillment | Payment Request, Payment Entry, Sales Invoice, Delivery Note |
| Transactional communications | Notification, Email Template, Email Account, Email Queue, Print Format |

Evaluate a Single Ecommerce Settings only if existing settings cannot express store scope. Candidate references include
store enabled, company, warehouse, selling price list, publication, currencies, trusted issuer, public URLs,
and options for payments and delivery. Proposed payment fields include enabled, display name, order, instructions,
Mode of Payment and Payment Gateway Account when applicable. Delivery options specify delivery or pickup, approved
conditions and Shipping Rule when it fits.
Keep accounting configuration on native records and deployment secrets in the secret store. An enabled payment option
requires an independently verified integration.

## Identity and ownership

Evaluate Contact first. It already has email, telephone and dynamic links to Customer. The proposed external identity
is immutable and unique per trusted issuer and subject, with an explicit store-enabled state and a controlled Customer
association. `Contact.status` and `Contact.user` do not express store access. Local Frappe's `set_user` can associate
an existing User by email, and `invite_user` inserts a Website User. Exclude both from authorization decisions and
exclude the invite endpoint from the flow.

Define an immutable ownership key on store operations and attach it through quotes, orders and authorized document
relationships. Verify address ownership separately. Reject ambiguous links. Resolve existing customers only through
an approved workflow. A matching email alone cannot link or merge customers. A candidate Contact design allows one
Supabase identity per Contact and keeps the identity binding immutable except through a reviewed migration.
Test shared customers, multiple links, contact rename, merge, deletion and reassignment. If
Contact metadata cannot enforce the lifecycle or integrity guarantees, propose a dedicated association with a reviewed
migration and retention policy. Document history must survive controlled contact changes without implicit transfer.

## Local source findings

Paths are relative to the Frappe or ERPNext checkout listed in [the source inventory](implementation.md).

| Source | Finding and implementation consequence |
| --- | --- |
| `frappe/contacts/doctype/contact/contact.py` | `set_user`, dynamic links and `invite_user` confirm the buyer/ERP user distinction above. |
| `erpnext/stock/get_item_details.py` | `get_item_details` accepts `ctx: ItemDetailsCtx`. It validates context and checks warehouse permissions. `insert_item_price` can write based on stock settings and permissions. Test quote pricing with the actual role/settings and verify Item Price stays unchanged. |
| `erpnext/controllers/selling_controller.py` and `accounts_controller.py` | Reuse document validations and totals. `apply_shipping_rule` delegates to `ShippingRule.apply` in `accounts/doctype/shipping_rule/shipping_rule.py`. Fit depends on the approved fulfillment model. |
| `erpnext/selling/doctype/quotation/quotation.py` | `make_sales_order` checks expiry, maps submitted Quotation and returns a document. Mapping can omit or partially map lines. Confirm full mapping, totals, insert and submit in the same operation. |
| `erpnext/selling/doctype/sales_order/sales_order.py` | Submission updates reserved quantity. Stock Reservation Entries are conditional on `reserve_stock` and the order type. Test actual competing orders and release behavior. |
| `erpnext/accounts/doctype/payment_request/payment_request.py` and `payment_entry/payment_entry.py` | Before-submit processing can call a gateway to generate a URL. Separate request issuance from confirmed receipts. Use native Payment Entry validation, allocation and submission with provider-specific reconciliation. |
| `frappe/email/doctype/notification/notification.py`, `frappe/printing/doctype/print_format/print_format.py`, `frappe/utils/print_format.py` | Use standard Notification events and Print Format/print permission paths. A technical user's print permission still requires a separate buyer ownership check at the store boundary. |

Python scope is limited to published ERP data, identity resolution, ownership, quote preparation, order confirmation
and necessary native payment integration. Validate schema and permissions in the Frappe UI on approved staging.
Use the UI for structure and fields and inspect generated output. Manual edits to generated JSON and schema
changes through SQL, scripts, patches or fixtures are prohibited by the target app's rules. If the UI cannot express a needed unique constraint or
lifecycle, surface the gap for design review. Specific hooks and overrides require their own authorization.
