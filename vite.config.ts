import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        host: '0.0.0.0', // 允許外部訪問
        port: 5173,
        cors: true
      },
      preview: {
        host: '0.0.0.0', // 生產預覽也允許外部訪問
        port: 4173,
        cors: true
      },
      define: {
        'process.env.PADDLE_OCR_URL': JSON.stringify(env.PADDLE_OCR_URL || 'http://localhost:8001'),
        'process.env.QWEN_SERVICE_URL': JSON.stringify(env.QWEN_SERVICE_URL || 'http://localhost:8000'),
        'process.env.DEBUG_MODE': JSON.stringify(env.DEBUG_MODE || 'false')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
