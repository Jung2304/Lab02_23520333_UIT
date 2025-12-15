import { defineConfig } from "vite";

// Vite Configuration for Custom JSX Framework
export default defineConfig({
  // Source directory
  root: "src",

  // Build configuration
  build: {
    outDir: "../dist",
    
    // Enable minification for production
    minify: "esbuild",
    
    // Target modern browsers for smaller bundle
    target: "es2020",
    
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate vendor code (jsx runtime)
          if (id.includes('jsx-runtime')) {
            return 'vendor';
          }
          // Component library
          if (id.includes('component')) {
            return 'components';
          }
          // Chart and dashboard
          if (id.includes('chart') || id.includes('dashboard')) {
            return 'charts';
          }
        },
      },
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true, // Auto-open browser
    strictPort: false, // Try next port if busy
  },

  // Preview server (for production build preview)
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },

  // Enable CSS preprocessing if needed
  css: {
    devSourcemap: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [], // Add any third-party dependencies here
  },

  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
  },
});
