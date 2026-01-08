import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        signup: resolve(__dirname, 'src/pages/signup.html'),
        index: resolve(__dirname, 'src/index.html'),
        forgotPassword: resolve(__dirname, 'src/pages/forgotPasswordPage.html'),
        otp: resolve(__dirname, 'src/pages/verifyOtpPage.html'),
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
