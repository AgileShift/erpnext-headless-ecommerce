# Frontend structure and page coverage

The frontend is organized by feature, using Vue single-file components, Pinia stores and Vue Router.
This is a project convention, not a framework-mandated directory standard.

```text
src/
  features/
    catalog/       pages, components, stores, types and catalog-only utilities
    cart/          cart page and existing persisted selection store
    account/       email access, profile, address and account navigation
    checkout/      delivery, review and simulated result
    orders/        history, detail and explicitly named example data
    content/       contact and legal document pages
    tools/         URL builder
  shared/
    components/    navigation, footer, consent, help and preview notice
    pages/         not found
    utils/         metadata, contact links and consent
  router/          public routes, legal routes and development preview routes
  assets/          shared styles
  app/layouts/     shared storefront shell
  sites/           site profiles, hostname resolver and themes
  config.ts        active site configuration
  App.vue          application shell
  main.ts          bootstrap
```

Keep feature-specific components and types in their feature. Move code to shared only when it serves
multiple features. Use absolute `@/` imports across features; relative imports within a feature are fine.
Preserve cart storage keys and existing public URLs when reorganizing code. Preview data must never be
used as a production fallback. Do not add backend dependencies to render a preview.

## Site identity and themes

Site profiles live under `src/sites/clothing-center` and `src/sites/fortech`. Each has a typed
`config.ts` for identity, contacts, catalog connections and capabilities, plus a `theme.css` for
visual tokens. Catalog routes are defined in the catalog stores and shared by both sites. `src/config.ts` matches the hostname against the public website URL in each profile. Unrecognized hosts and localhost
continue to use Clothing Center. Both sites use the same cart flow.

The app sets `data-site` on the document before mounting Vue. The shared theme maps site tokens to
Tailwind and Storefront UI colors. Set the accent and its text color in the brand theme. The shared
theme derives lighter shades and the hover and pressed backgrounds. Keep page structure
in `StoreLayout.vue` and site-specific UI choices in the site profile.

## Pages

Clothing Center catalog cards show available attributes as information. “Agregar al carrito” loads product detail and
opens a selector for the required variant options; a unique variant without attributes is added directly. The separate
WhatsApp action opens a product inquiry; the cart can also be sent as an inquiry. Neither action confirms an order or
reserves stock.

The catalog distinguishes loading, empty results and failed requests. Shoppers can clear category, size and color
filters after an empty result, or retry a failed request. If a later page fails, existing cards stay visible and the
retry requests that page again. A load-more button also supports navigation without automatic scrolling.

Clothing Center presents size, category and color filters through the shared `CatalogFilters.vue` component, with
selected values summarized in Storefront UI `SfAccordionItem` sections. Sizes and colors use `SfChip`; categories use
`SfListItem` with `SfCheckbox` so longer names remain readable and the complete row is selectable. On mobile,
`SfDrawer` provides close, clear and show-products actions; the semantic `aside` stays beside the catalog on wider
screens. Category and color searches filter visible options locally without changing selected values or catalog
requests. Filter values and application remain unchanged; filter-option loading feedback is still pending. Each site
configures the initially expanded sections with `catalog.filters.initiallyOpen`, using `size`, `category` and `color`.
Clothing Center opens size initially; ForTech opens all three. Shoppers can change the expanded sections.

| Route | Status | Backlog |
| --- | --- | --- |
| `/`, `/sale`, `/category/:category`, `/product/:id` | Existing catalog | EC-030 |
| `/cart` (`/selection` compatibility alias) | Existing local cart and WhatsApp handoff | Storefront pages |
| `/account` | Email/code simulation | EC-011 |
| `/account/profile` | Profile form, in-memory changes only | EC-011 / buyer profile |
| `/account/addresses` | One delivery address, in-memory changes only | EC-040 |
| `/checkout` | Delivery/pickup, contact, review and simulated result; empty-cart state | EC-043 |
| `/account/orders` | Empty history and opt-in example | EC-052 |
| `/account/orders/:id` | Example detail and unknown-order state | EC-052 |
| Unmatched routes | 404 with catalog link | Navigation |

Account, checkout and order routes are development-only for both brands, through
`router/previewRoutes.ts`. The account icon opens email access, which links to the account preview.
A nonempty cart links to the checkout preview. Reloading discards account edits; the existing cart remains
in localStorage. The checkout does not create orders, clear the cart, reserve stock or charge payments.
Checkout uses a reduced header and keeps the legal footer. The summary shows product thumbnails and attributes,
with an estimated NIO subtotal and a secondary USD reference. Address fields and the pending shipping-cost note
appear only for delivery. Delivery costs, pickup location/hours and payment providers are intentionally not fabricated.

These are UI previews, not completed commerce tickets. Real authentication, ownership checks, address
persistence, authoritative quotes, changed-price/stock recovery, order confirmation, documents and payments
remain dependent on the backend tickets. No production private-routing work is included.

## UI references and verification

Checked installed `@storefront-ui/vue` 3.1.4 exports for `SfButton` and `SfInput`. Forms and summary follow
patterns from the official [Checkout](https://docs.storefrontui.io/v2/vue/blocks/checkout) and
[Order Summary](https://docs.storefrontui.io/v2/vue/blocks/ordersummary) blocks. Account and history layouts
are project-specific compositions of these components.

Component tests cover empty checkout, delivery fields, dual currency subtotal, simulated completion without
cart deletion and missing order IDs. Production build and type checking verify the feature moves.
No development server was started and no ERP requests were made for this change. Browser visual acceptance
remains pending with the user's local server.
