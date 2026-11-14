# Agent Instructions — erpnext-headless-ecommerce

This guide applies to the Vue storefront for Clothing Center and ForTech. It adapts the
[root AGENTS template](../../PyCharmProjects/bench/frappe-app-standards/skills/frappe-app-docs-normalize/references/agents-templates.md#root-agents-template)
to this repository. Work in the ERPNext repository follows its own instructions and requires its own scope.

## Working agreement

- Read the root README and any instructions that apply to the feature before editing. Read CONTRIBUTING.md when
  present before preparing a commit or pull request. Follow applicable local rules and explicit owner decisions.
  Report conflicting instructions before proceeding. Ask before installing a missing skill.
- Explain the objective, affected files, expected behavior, material risks and verification plan before editing.
  Honor authorization already given. Keep changes small and within the approved scope. Preserve unrelated
  worktree changes and seek approval before changing an agreed direction or deploying.
- Use current code and dependencies as evidence. Distinguish implemented behavior, approved designs,
  external documentation, inferences and open decisions. Report discrepancies in scope and confirm conflicting
  business rules with the owner. Fixtures and UI controls alone do not establish that a flow works.
- When asked to audit documentation, verify its technical claims against current evidence within the selected scope.
  When asked to evaluate a design, give a score out of 10 and explain the criteria.
- Update affected documentation alongside authorized behavior changes. Keep detailed explanations in the relevant
  guide and working rules in AGENTS.md. Track outstanding work in the existing backlog or near the relevant code.
  For documentation-only edits, limit edits to the files requested.
- Use English for code and documentation and Spanish for storefront copy, including accessible labels and errors.
  Reuse established UI wording where it fits. Keep Markdown lines around 120 characters at natural breaks and
  preserve complete links. Follow the repository's formatting, lint and dependency configuration.

## Required reading

- [Root README](README.md) for project commands.
- [Frontend guide](docs/ecommerce/frontend.md) for feature structure and preview routes.
- [Ecommerce guide](docs/ecommerce/README.md), [decisions](docs/ecommerce/decisions.md),
  [architecture](docs/ecommerce/architecture.md) and [backlog](docs/ecommerce/backlog.md) for relevant work.
- [API contracts](docs/ecommerce/contracts.md) before changing integration behavior.

## Vue frontend

- Keep pages, components, stores, types and utilities close to their business feature in `src/features`.
  Put reusable UI and helpers in `src/shared` and compose routes in `src/router`. Prefer focused Vue components
  with typed props and events. Use component state for local interactions and Pinia for shared state.
- Reuse existing components, stores and helpers when they fit. Add abstractions only to solve a concrete need.
  Use [package.json](package.json), its lockfile and the tool configuration for versions and commands.
- Preserve public URLs, brand behavior and persisted cart keys. Update imports, audit scripts and documentation
  links when moving files.

### Storefront UI

- Before building or redesigning an interface, check existing components and the
  [official Storefront UI documentation for Vue](https://docs.storefrontui.io/v2/vue/getting-started).
  Verify component availability in the installed `@storefront-ui/vue` version.
- Reuse a component or adapt a documented block when it fits. For cart work, check ProductCard Horizontal,
  QuantitySelector and Order Summary. Keep branding, responsive layout, accessible labels and keyboard behavior.
  Use custom markup or behavior for needs the existing components and blocks do not cover.

## Previews and ERPNext integration

- Keep account, checkout and order previews available only in development until the real backend flows are verified.
  Label fixtures and simulated outcomes clearly. A simulated checkout must preserve the real cart.
- Keep ERPNext private. The approved design routes browser requests through the public store API, which accesses
  ERPNext over a private, authenticated connection. Keep this design distinct from the current catalog integration.
  Do not expose ERP credentials or origins in browser configuration or introduce another commerce backend as part
  of unrelated work.
- Treat frontend totals and availability as display data. ERPNext remains authoritative for quotes, inventory,
  orders and payments. When changing checkout interactions, account for errors and retries without relying on the
  browser to enforce ownership, inventory or payment rules.
- Use controlled test data. Access production business data or create, submit, cancel or modify real business
  records only with explicit authorization. Keep credentials, tokens, sensitive payloads and unnecessary personal
  data out of source, examples, logs and test output.

## Verification

- Review the scoped diff, preserve unrelated work and run `git diff --check`. For documentation-only edits,
  verify Markdown links, headings and scope.
- For frontend changes, choose focused checks as appropriate: `npm run type-check`, `npm run build`,
  ESLint on affected source without `--fix` for verification, and Vitest for logic and component interactions.
  Use fixtures or mock external services when needed.
- For UI changes, check navigation, keyboard and focus behavior, accessible names and layout at relevant viewport
  widths. Use Playwright when a browser flow needs coverage. Its configuration can start a server automatically.
  Leave server startup to the owner unless explicitly authorized for the current task and avoid repeated localhost
  probes or browser polling.
- Report what changed, what was verified and any remaining limitations. A successful local check does not
  authorize deployment or production changes.
