import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:8080/techstore_db'

const proxyPaths = [
  '/products', '/categories', '/cart', '/orders',
  '/login', '/register', '/logout', '/session',
  '/admin', '/profile', '/uploads',
]

const proxy = Object.fromEntries(
  proxyPaths.map((path) => [
    path,
    { target: backend, changeOrigin: true },
  ])
)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy,
  },
})
