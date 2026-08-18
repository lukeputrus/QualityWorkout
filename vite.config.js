import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path only needs to change for the GitHub Pages build (project site
// lives at /QualityWorkout/). Local dev and `vite preview` stay at "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/QualityWorkout/' : '/',
})
