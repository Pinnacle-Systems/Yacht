/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    // fontFamily: {
    //   'times': ['Times-Roman', 'serif'],
    //   'times-bold': ['Times-Bold', 'serif'],
    // },
      fontFamily: {
        sans: ['"Segoe UI"'], // Override default sans
      },

    extend: {
      fontFamily: {
        sans: ['"Segoe UI"'], // Override default sans
      },
    },
  },
  plugins: [],
};
