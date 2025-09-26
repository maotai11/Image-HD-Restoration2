import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/Image-HD-Restoration2/', // 你的 GitHub 倉庫名稱
      server: {
        host: '0.0.0.0',
        port: 5173,
        cors: true
      },
      preview: {
        host: '0.0.0.0',
        port: 4173,
        cors: true
      },
      define: {
        // GitHub Pages 部署時使用雲端 API
        'process.env.PADDLE_OCR_URL': JSON.stringify('https://api-inference.huggingface.co/models/microsoft/trocr-base-printed'),
        'process.env.QWEN_SERVICE_URL': JSON.stringify('https://api-inference.huggingface.co/models/Qwen/Qwen-Image-Edit'),
        'process.env.HUGGINGFACE_API_KEY': JSON.stringify(env.HUGGINGFACE_API_KEY || ''),
        'process.env.DEBUG_MODE': JSON.stringify('false'),
        'process.env.DEPLOYMENT_MODE': JSON.stringify('github')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});