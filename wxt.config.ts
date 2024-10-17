import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    action: {
      default_title: 'Some Title',
    },
    web_accessible_resources: [
      {
        matches: ['*://*.google.com/*'],
        resources: ['icon/*.png'],
      },
    ],
  },
  modules: ['@wxt-dev/module-react'],
});
