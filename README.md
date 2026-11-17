# erpnext-headless-ecommerce

Vue storefront shared by Clothing Center and ForTech, with a private ERPNext integration boundary.

## Local development

Install dependencies:

```sh
npm install
```

Start the development server only when authorized for the current task:

```sh
npm run dev
```

## Verification

```sh
npm run type-check
npm run test:unit -- --run
npm run build
```

Run ESLint without `--fix` when using it only for verification:

```sh
npx eslint src
```

## Project documentation

See the [ecommerce project guide](docs/ecommerce/README.md) for the local source inventory, proposed contracts,
first implementation block and delivery backlogs.
