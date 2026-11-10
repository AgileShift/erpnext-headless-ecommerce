# Store operations and release

## Environment gates

- Inventory checkout versions and apps per approved staging/deployed site through the operator. Record runtime,
  MariaDB version, workers/scheduler, intended public/private routes, least-privilege roles and restore ownership.
  Validate isolated staging and test fixtures. Disable real outbound mail, webhooks, jobs and payments in fixtures or
  route them to controlled sinks.
- Confirm provider access and SMTP independently of the broader mail platform migration. Keep test and production
  projects, credentials and data isolated. Record environment and configuration evidence without secrets.
- Validate browser requests, headers and public resources, including redirects and legal HTML. Test authorized staff
  access and direct unauthorized ERP access separately. Do not rely on CSP or CORS to restrict ERP at the network.
- During planned ERP maintenance, verify published catalog behavior against the agreed freshness bound. Checkout
  should report unavailability without claiming order success and preserve the buyer's selection for recovery. When an
  attempt might have committed, replay with its original key or recover its outcome before another attempt.

## Communications

Use [Supabase email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless) with the code template, explicit
expiration and limits, controlled return URLs and a [production SMTP sender](https://supabase.com/docs/guides/auth/auth-smtp).
Test valid, invalid, expired and reused codes, resend limits, session renewal and logout.

Use [Frappe Notification](https://docs.frappe.io/framework/notifications), Email Template, Print Format, Email Account and
Email Queue for transactional mail. Proposed triggers are Sales Order Submit for confirmation, Payment Request for
collection instructions, Payment Entry Submit for receipts, Sales Invoice Submit for the invoice and Delivery Note
Submit for dispatch when that event matches operations. Define applicable cancellation events. Confirm each business
trigger with the owner. Filter by store channel and resolve the buyer recipient. Test partial and complete payment,
queue delivery, failed sends, overlapping events, and omission of internal sales. Check every public link and PDF.

## Cutover and rollback

In staging, replay representative variants/filters/legal content, run authenticated ownership and concurrency tests,
reconcile native documents/payments, and check the browser network for both brands. Validate outage and retry behavior.
Record the release revisions, configuration and test evidence. Define who can approve release, pause checkout, toggle
routing and reconcile operations. Require separate authorization to change production.

Sequence the new public catalog, media and content routes before restricting ERP access. Confirm every supported
consumer, staff access and provider callback, then restrict the origin per the approved topology. Preserve working
callback routing and idempotency records during rollback. Plan rollback to a store-controlled catalog or paused
checkout without reopening buyer access to ERP. Reconcile pending quotes, orders, payments, reservations and outbound
notifications before restoring checkout. Keep infrastructure and mail cutovers separately approved.
