import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ethers: ['ethers'],
                    charts: ['recharts'],
                    leaflet: ['leaflet', 'react-leaflet'],
                    icons: ['react-icons', 'lucide-react'],
                    animation: ['framer-motion', 'gsap']
                }
            }
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://hydrofi-hackout.onrender.com',
                changeOrigin: true
            }
        }
    }
})
