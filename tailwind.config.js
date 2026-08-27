/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nhlblauw: "#005aa7",
        nhlteal: "#00a7a2",
        nhlrood: "#e52329",
        nhloranje: "#fa640a",
        nhlgroen: "#00784f",
        nhlroze: "#ff8cb2",
      },
    },
  },
  plugins: [],
};
