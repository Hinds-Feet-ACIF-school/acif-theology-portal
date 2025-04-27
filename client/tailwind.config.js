module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theology-deep': '#2A0F0F',
        'theology-mid': '#4A1F1F',
        'theology-cream': '#FFF8F0',
        'theology-tan': '#E0D6C3',
        'theology-gold': '#C5A467',
        'theology-gold-hover': '#B08F55',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}



