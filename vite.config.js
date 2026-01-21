import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - split large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'vendor-charts'
            }
            if (id.includes('react-toastify')) {
              return 'vendor-ui'
            }
          }

          // Feature chunks - group related components
          if (id.includes('/components/BieuMau/')) {
            return 'feature-bieumau'
          }
          if (id.includes('/pages/Calculator') || id.includes('/calculator/')) {
            return 'feature-calculator'
          }
          if (id.includes('/pages/QuanLyKhachHang') || id.includes('/khachhang/')) {
            return 'feature-customers'
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})
