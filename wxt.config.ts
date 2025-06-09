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
        "scripting",
        "identity"
      ],
      oauth2: {
        client_id: "334481723630-b6nip23r9omib34inmogbvg0kck9nk2b.apps.googleusercontent.com",
        scopes: [
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile"
        ]
      }
    };
  },
});
