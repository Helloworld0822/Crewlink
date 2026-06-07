import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // Listen on 0.0.0.0 so the container is reachable from the docker
    // network (and from the host when ports are published).
    host: true,
    // Vite picks 5173 by default; pin it so the nginx upstream is stable.
    port: 5173,
    strictPort: true,
    // HMR is required for a productive dev loop. With host networking
    // (or with the proxy passing through the right Host header) Vite
    // figures out the URL, but setting allowedHosts is safer when the
    // site is reached via a different hostname (e.g. localhost vs an
    // internal docker DNS name).
    allowedHosts: true,
    watch: {
      // The dev server runs inside a container with the source mounted
      // from the host. Use polling so file events survive across the
      // bind mount on macOS/Windows hosts; on Linux native inotify also
      // works but polling is a safe default.
      usePolling: true,
      interval: 300,
    },
  },
})
