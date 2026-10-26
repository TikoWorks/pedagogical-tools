import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '1fe5ku',
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
});
