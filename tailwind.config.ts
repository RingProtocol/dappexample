import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#667eea",
          dark: "#764ba2",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          dark: "#e5e7eb",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
      },
      boxShadow: {
        card: "0 10px 40px rgba(0, 0, 0, 0.2)",
        button: "0 5px 20px rgba(102, 126, 234, 0.4)",
      },
      borderRadius: {
        lg: "16px",
        xl: "12px",
      },
      maxWidth: {
        container: "600px",
      },
    },
  },
  plugins: [],
};

export default config;
