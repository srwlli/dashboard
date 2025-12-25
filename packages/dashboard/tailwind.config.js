/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include widget packages for Tailwind to scan
    '../widgets/**/*.{js,ts,jsx,tsx}',
    '../core/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode (default)
        'ind-bg': '#0c0c0e',
        'ind-panel': '#141416',
        'ind-border': '#3f3f46',
        'ind-accent': 'var(--color-ind-accent)', // Uses CSS variable for dynamic theming
        'ind-accent-hover': 'var(--color-ind-accent-hover)',
        'ind-text': '#f4f4f5',
        'ind-text-muted': '#71717a',
      },
      fontFamily: {
        'display': ['Chakra Petch', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hazard': 'repeating-linear-gradient(45deg, #141416, #141416 10px, #1f1f22 10px, #1f1f22 20px)',
      },
      boxShadow: {
        'industrial': '0 4px 20px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
