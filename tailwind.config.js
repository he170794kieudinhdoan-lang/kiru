/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF9',
          yellow: '#FFE600',
          pink: '#FF6B8B',
          cyan: '#22D3EE',
          lime: '#4ADE80',
          purple: '#A855F7',
          orange: '#FB923C',
          blue: '#38BDF8',
          dark: '#18181B',
          gray: '#F4F4F5',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-2xl': '12px 12px 0px 0px #000000',
        'neo-inset': 'inset 3px 3px 0px 0px #000000',
      },
      fontFamily: {
        mono: ['var(--font-space-mono)', 'monospace'],
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
