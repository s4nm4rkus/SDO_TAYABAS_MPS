/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        "dark-bg": "#242424",
        "light-bg": "#ffffff",
        "innerHeader-bg": "#0097b2",
        "textHeader-color": "#004385",
        whiteBg: "#f8f8ff",
      },
      textShadow: {
        sm: "1px 1px 2px rgba(0,0,0,0.25)",
        DEFAULT: "2px 2px 4px rgba(0,0,0,0.35)",
        lg: "3px 3px 6px rgba(0,0,0,0.45)",
        xl: "4px 4px 10px rgba(0,0,0,0.6)",
      },
      spacing: {
        "logo-sm": "4rem", // small logo
        "logo-md": "5rem", // medium logo
        "logo-mlg": "5.5rem", // large logo
        "logo-lg": "6rem", // large logo
        "logo-xl": "7rem", // large logo
        "btn-sm": "0.5rem 1rem", // small button padding
        "btn-md": "0.75rem 1.5rem", // medium button padding
        "btn-lg": "1rem 2rem", // large button padding
      },
      fontSize: {
        "logo-xs": "1.5rem",
        "logo-sm": "2rem",
        "logo-md": "3rem",
        "logo-lg": "4rem",
        "btn-sm": "0.875rem",
        "btn-md": "1rem",
        "btn-lg": "1.25rem",
        "header-xl": "5rem",
        "header-xxl": "6rem",
      },
      borderRadius: {
        btn: "30px",
        card: "16px",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const shadows = theme("textShadow");
      const utilities = Object.entries(shadows).map(([key, value]) => ({
        [`.text-shadow${key === "DEFAULT" ? "" : `-${key}`}`]: {
          textShadow: value,
        },
      }));
      addUtilities(utilities);
    },
  ],
};
