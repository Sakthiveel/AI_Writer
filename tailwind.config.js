/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
export default {
  content: ["assets/**", "entrypoints/**", "components/**"],
  theme: {
    colors: {
      white: "#FFFFFF",
      primary: {
        default: "#666D80",
        blue: "#3B82F6",
        border: "#C1C7D0",
      },
      chat: {
        sender: "#DFE1E7",
        receiver: "#DBEAFE",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
