import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    // 로컬 개발(npm run dev)에서 /api 요청은 배포된 사이트의 Worker로 넘깁니다.
    // (로컬에 인증키를 두지 않아도 실거래가 조회 가능. 실제 사이트에 API가 배포되어 있어야 함)
    proxy: {
      '/api': { target: 'https://zipmoya.com', changeOrigin: true, secure: true },
    },
  },
});
