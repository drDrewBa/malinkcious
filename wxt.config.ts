import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      manifest_version: 3,
      name: "Malinkcious",
      version: "1.0.0",
      description: "A browser extension to check if a link is malicious",
      permissions: [
        "tabs",
        "storage",
        "activeTab",
        "scripting"
      ],
    };
  },
});
