/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#112138",
        sky: "#dceeff",
        accent: "#0f766e",
        warm: "#f59e0b"
      },
      boxShadow: {
        soft: "0 22px 55px rgba(17, 33, 56, 0.12)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(15,118,110,0.16), transparent 35%), radial-gradient(circle at top right, rgba(14,165,233,0.14), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%)"
      }
    },
  },
  plugins: [],
};
