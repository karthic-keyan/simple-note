/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        upnote: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
          accentDark: '#3b82f6',
          gold: '#f59e0b',
        },
        sidebar: {
          light: '#f7f8fa',
          dark: '#181a1f',
          hoverLight: '#eaedf1',
          hoverDark: '#22252c',
          activeLight: '#dfe4ea',
          activeDark: '#2c313a',
          borderLight: '#e5e7eb',
          borderDark: '#282c34',
        },
        notesList: {
          light: '#ffffff',
          dark: '#1f2229',
          hoverLight: '#f3f4f6',
          hoverDark: '#272b34',
          activeLight: '#eef2ff',
          activeDark: '#26334d',
          borderLight: '#e5e7eb',
          borderDark: '#2b303b',
        },
        editor: {
          light: '#ffffff',
          dark: '#1a1c23',
          borderLight: '#e5e7eb',
          borderDark: '#2e3440',
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"Cascadia Code"', 'Consolas', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
