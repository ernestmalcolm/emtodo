/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B132B",
          800: "#1F2A44",
          700: "#253155"
        },
        text: {
          primary: "#EAEFF7",
          secondary: "#AAB6CF"
        },
        quadrant: {
          doNow: "#FF6B6B",
          schedule: "#5BC0BE",
          delegate: "#F2C94C",
          eliminate: "#6C7A89"
        }
      },
      borderRadius: {
        xl: "12px"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};


