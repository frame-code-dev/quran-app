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
        quran: {
          ivory: '#FAF9F5',
          surface: '#FFFFFF',
          border: '#E7E5E4',
          borderLight: '#F2EFE9',
          forest: '#1B4332',
          emerald: '#2D6A4F',
          emeraldHover: '#245640',
          mintLight: '#F0F7F4',
          mintBorder: '#A3CFBB',
          brass: '#B38F5C',
          brassLight: '#F9F6F0',
          charcoal: '#1C1917',
          muted: '#78716C',
          darkBg: '#121714',
          darkSurface: '#1A211D',
        }
      },
      fontFamily: {
        arabic: ['Amiri', '"Traditional Arabic"', 'Scheherazade', 'serif'],
      },
    },
  },
  plugins: [],
};
