/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import {defineConfig} from 'vitest/config'
import preact from '@preact/preset-vite'
import {VitePWA} from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    test: {
        environment: "jsdom",
    },
    plugins: [
        svgr({
            svgrOptions: {
                ref: true,
                dimensions: false,
            },
        }),
        preact(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*"],
            },
            manifest: {
                name: "bcb",
                short_name: "bcb",
                description: "bcb",
                theme_color: "#FFFFE0",
                icons: [{
                    src: "pwa-64x64.png",
                    sizes: "64x64",
                    type: "image/png",
                }, {
                    src: "pwa-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                }, {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                }, {
                    src: "maskable-icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                }],
            },
        }),
    ],
})