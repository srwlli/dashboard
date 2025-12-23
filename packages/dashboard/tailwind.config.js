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
        'ind-bg': '#0c0c0e',
        'ind-panel': '#141416',
        'ind-border': '#3f3f46',
        'ind-accent': '#ff6b00', // Industrial Orange
        'ind-accent-hover': '#e65100',
        'ind-text': '#f4f4f5',
        'ind-text-muted': '#71717a',
      },
      fontFamily: {
        'display': ['Chakra Petch', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hazard': 'repeating-linear-gradient(45deg, #141416, #141416 10px, #1f1f22 10px, #1f1f22 20px)',
        'grid-pattern': `
          linear-gradient(#27272a 1px, transparent 1px),
          linear-gradient(90deg, #27272a 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
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
