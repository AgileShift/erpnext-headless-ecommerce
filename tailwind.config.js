import { tailwindConfig } from '@storefront-ui/vue/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tailwindConfig],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@storefront-ui/vue/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {},
      },
    },
  },
  plugins: [],
}
