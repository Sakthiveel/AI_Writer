import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
// export default defineConfig({
//   modules: ["@wxt-dev/module-react"],
// });
export default defineConfig({
  runner: {
    startUrls: ["https://google.com"],
  },
  manifest: {
    action: {
      default_title: "Some Title",
    },
    web_accessible_resources: [
      {
        matches: ["*://*.google.com/*"],
        resources: ["icon/*.png"],
      },
    ],
  },
});
