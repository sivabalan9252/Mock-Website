/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e53935',
        'primary-dark': '#c62828',
        'primary-light': '#ef5350',
      },
    },
  },
  plugins: [],
};
