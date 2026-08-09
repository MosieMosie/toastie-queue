import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import {defineConfig, Plugin} from "vite";
import solidPlugin from "vite-plugin-solid";

import {handleApi} from "./server/api.ts";

// in dev the API runs inside the Vite server: one `pnpm dev`, one port
const apiPlugin = (): Plugin => ({
  name: "toastie-api",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!handleApi(req, res)) {
        next();
      }
    });
  },
});

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss(), apiPlugin()],
  server: {
    port: 3000,
    // listen on every interface so phones and tablets on the same wifi can reach it
    host: true,
  },
  build: {
    target: "esnext",
  },
});
