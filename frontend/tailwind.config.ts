import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        content: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        'selected-highlight': 'var(--color-selected-highlight-bg)',
        'unselected-highlight': 'var(--color-unselected-highlight-bg)',
        border: 'var(--color-border)',
        'action-primary': 'var(--color-action-primary)',
        'action-secondary': 'var(--color-action-secondary)',
        'action-hover': 'var(--color-action-hover)',
        'grey-shadow': 'var(--color-shadow)',
        contrast: 'rgba(var(--color-contrast-background))',
        hyperlink: 'var(--color-hyperlink)',
        'hyperlink-hover': 'var(--color-hyperlink-hover)',
        alert: 'var(--color-alert)',
        'alert-hover': 'var(--color-alert-hover)',
      },
    },
  },
  plugins: [],
} satisfies Config;
