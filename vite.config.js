import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  // Use relative asset URLs so static hosts (S3/serve) work under any path.
  base: './',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        signup: resolve(__dirname, 'src/pages/signup.html'),
        index: resolve(__dirname, 'src/index.html'),
        forgotPassword: resolve(__dirname, 'src/pages/forgotPasswordPage.html'),
        otp: resolve(__dirname, 'src/pages/verifyOtpPage.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        editProfile: resolve(__dirname, 'src/pages/editProfile.html'),
      },
    },
  },
  // server: {
  //   port: 5173,
  //   open: '/pages/signup.html',
  // },
  plugins: [tailwindcss()],
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       silenceDeprecations: [
  //         'import',
  //         'mixed-decls',
  //         'color-functions',
  //         'global-builtin',
  //       ],
  //     },
  //   },
  // },
};
