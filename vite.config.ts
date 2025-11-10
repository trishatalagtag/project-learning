import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      'target': "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/pages",
      generatedRouteTree: "./src/routes.ts"
    }),
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@\/convex\/(.+)$/,
        replacement: path.resolve(__dirname, './convex/$1'),
      },
      {
        find: /^convex\/_generated\/(.+)$/,
        replacement: path.resolve(__dirname, './convex/_generated/$1'),
      },
      {
        find: /^@\/(.+)$/,
        replacement: path.resolve(__dirname, './src/$1'),
      },
      {
        find: '^api$',
        replacement: fileURLToPath(new URL('./convex/_generated/api', import.meta.url)),
      },
    ],
  }
})
