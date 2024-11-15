// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGreenDark: '#3C493F',
        customGreenGray: '#7E8D85',
        customGrayLight: '#B3BFB8',
        customWhiteGreen: '#F0F7F4',
        customMint: '#A2E3C4',
      },
      fontFamily: {
        product: ['ProductSans', 'sans-serif'], // Add custom font
        prodigy: ['ProdigySans', 'sans-serif'], // Add custom font
      },
    },
  },
  plugins: [],
}
