# Proposed public API

Base path is `/api/store/v1`. Endpoint names, types and examples are proposals. Use JSON with explicit field
allowlists. Public identifiers are opaque where they refer to a private record. Currency amounts are decimal strings
with ERP precision. The API should return a stable error code, safe localized message or message key and request
ID. Suggested statuses are 400 for malformed input, 401 for missing/invalid auth, 404 for missing or foreign private
objects, 409 for conflicts or changed quotes, 429 for throttling and 503 for upstream unavailability. Suppress raw
ERP messages and credentials. Use bounded pagination and default private responses to `Cache-Control: no-store`.

| Access | Method and path | Contract |
| --- | --- | --- |
| Public | GET /catalog/products | Validated sale, category, size, color and bounded page parameters. Return published cards and continuation. |
| Public | GET /catalog/products/{id} | Public product and available variants, with SKU, allowed attributes, price display and media IDs. |
| Public | GET /catalog/categories | Published category tree. |
| Public | GET /catalog/attributes | Approved filter attributes and ordered values. |
| Public | GET /media/{id} | Validated public image mapping and content type. |
| Public | GET /content/{slug} | Approved, sanitized content with safe links. |
| Buyer | POST /me/bootstrap | Resolve verified identity and return store profile state. Enforce the approved linking and provisioning rules. |
| Buyer | GET /me, PATCH /me | Read or edit permitted profile fields. External identity, email verification and Customer mapping remain server controlled. |
| Buyer | GET /me/addresses, POST /me/addresses, PATCH /me/addresses/{id} | List or edit owned addresses with approved fields. |
| Buyer | POST /checkout/quote | Validate lines, owned address and allowed choices. Return an authoritative quote. |
| Buyer | POST /checkout/confirm | Confirm the accepted quote and create at most one complete order. |
| Buyer | GET /me/orders, GET /me/orders/{id} | List or retrieve orders scoped to buyer ownership. |
| Buyer | GET /me/orders/{id}/documents/{document_id} | Check order ownership, document type and relationship before streaming. |
| Buyer | POST /me/orders/{id}/payment | Start or resume the approved payment option for the owned order. |
| Verified provider | POST /webhooks/payments/{provider} | Verify provider evidence, reconcile and process idempotently. |

Use the server-derived buyer context and enforce ownership on each lookup, mutation, download and payment.
A shared technical user's `doc.owner` or matching Customer alone cannot authorize any buyer operation. Keep paths
explicit and reject client-selected ERP methods, DocTypes, upstream URLs and file paths.

## Quote

Accept actual variant SKUs and quantities, an owned address ID or approved new address fields, and delivery/payment
option IDs. Derive Customer, Company, Warehouse, Price List, currency/conversion, rates, discounts, taxes, shipping
and totals in ERP. Return `quote_id`, `version`, `expires_at`, `currency`, line prices and quantities, subtotal,
discounts, taxes, shipping, total and availability/options. Capture the actual authority and precision used.

## Confirmation and recovery

Accept `quote_id`, `version`, accepted currency and total as comparison guards, and an `Idempotency-Key` header.

1. Authenticate and resolve the buyer. Lookup the operation in the buyer's scope.
2. Return a recorded outcome for the same key and canonical payload before evaluating expiry or prices. Return 409
   when an existing key is reused with another payload.
3. For a new attempt, serialize on a durable logical checkout ID that survives quote version changes. If that checkout
   already produced an order, prevent a second order even with a new key. Persist the key/payload relationship and
   order outcome with the ERP transaction using an approved uniqueness mechanism.
4. Revalidate quote version, totals, expiry, ownership and stock under the approved policy. For a material change,
   return an updated quote or actionable unavailable state, with explicit reconfirmation before creating an order.
5. Submit Quotation, map all expected rows and confirm final totals, insert and submit Sales Order. Commit the checkout
   link and result with the ERP changes. Roll back incomplete work. Return success after commit, then allow independent
   payment initiation.

The idempotency and ownership metadata remain proposals. Test same-key replay, payload conflict, new-key replay,
concurrent attempts, failure before commit and a lost response followed by replay after quote expiry. Test the last
unit across distinct checkouts and prove the agreed reservation and release behavior.

## Payments

Publish only enabled payment options applicable to the current order. Use native payment documents where supported. Manual payments remain pending until the authorized collection event.
Online payments require verified provider events or confirmed lookup, matched merchant/order/amount/currency and
two levels of deduplication (event ID and semantic capture identity). Keep payment initiation separate from order
creation. Record partial amounts and failures, reconcile ambiguous provider timeouts before retrying, and verify
allocated entries. A browser return only shows status from the authoritative state. The public store accepts callbacks
and payment returns. Determine provider submission side effects and recovery before selecting the integration.
