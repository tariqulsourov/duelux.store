/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#fbf9f5',
          100: '#f5f0e8',
          200: '#ebdccf',
          800: '#2c2523',
          900: '#1a1615',
        },
      },
    },
  },
  plugins: [],
};
