/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat"],
        lato: ["Lato"],
        garamond: ["Garamond"],
      },
      colors: {
        primary: {
          50: "#FAEEE5",
          100: "#F6E3D3",
          200: "#F2D5BD",
          300: "#EEC8A8",
          400: "#E9BA92",
          500: "#E5AC7C",
          600: "#BF8F67",
          700: "#997353",
          800: "#72563E",
          900: "#4C3929",
        },
        secondary: {
          50: "#D5D6DB",
          100: "#B9BAC3",
          200: "#9597A5",
          300: "#727587",
          400: "#4F5269",
          500: "#2C304B",
          600: "#25283E",
          700: "#1D2032",
          800: "#161825",
          900: "#0F1019",
        },
        tertiary: {
          50: "#E0E1EA",
          100: "#CBCEDB",
          200: "#B1B5C9",
          300: "#989CB8",
          400: "#7E84A6",
          500: "#646B94",
          600: "#53597B",
          700: "#434763",
          800: "#32354A",
          900: "#212431",
        },
        quaternary: {
          50: "#DCDCDC",
          100: "#C5C5C5",
          200: "#A8A8A8",
          300: "#8C8C8C",
          400: "#6F6F6F",
          500: "#525252",
          600: "#444444",
          700: "#373737",
          800: "#292929",
          900: "#1B1B1B",
        },
      },
    },
  },
  plugins: [
    require("prettier-plugin-tailwindcss"),
    require("tailwind-scrollbar-hide"),
    require("tailwindcss-animated"),
    plugin(function ({ addUtilities }) {
    addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',

          /* Firefox */
          'scrollbar-width': 'none',

          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      )
    })
  ],
};
