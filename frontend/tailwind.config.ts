import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './cypress/**/*.{js,ts,jsx,tsx,mdx}',

  ],
  theme: {
    extend: {
      colors: {
        'mono-primary': 'var(--mono-primary)',
        'mono-secondary': 'var(--mono-secondary)',
        'mono-ascent': 'var(--mono-ascent)',
        'mono-contrast': 'var(--mono-contrast)',
        'mono-contrast-light': 'var(--mono-contrast-light)',
        'mono-light': 'var(--mono-light)',

        'main-primary': 'var(--main-primary)',
        'main-secondary': 'var(--main-secondary)',
        'main-ascent': 'var(--main-ascent)',
        'main-light': 'var(--main-light)',

        'alert-primary': 'var(--alert-primary)',
        'alert-secondary': 'var(--alert-secondary)',
        'alert-ascent': 'var(--alert-ascent)',
        'alert-light': 'var(--alert-light)',

        'hyperlink-primary': 'var(--hyperlink-primary)',
        'hyperlink-secondary': 'var(--hyperlink-secondary)',
        'hyperlink-ascent': 'var(--hyperlink-ascent)',
        'hyperlink-light': 'var(--hyperlink-light)',
      },
    },
  },
  plugins: [],
} satisfies Config;
