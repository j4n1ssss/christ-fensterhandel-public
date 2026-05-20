import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS 4 uses CSS-based configuration (@theme in globals.css).
 * This file exists for Shadcn UI compatibility and tooling support.
 * Primary configuration is in src/app/globals.css via @theme directive.
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
