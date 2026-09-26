import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// テスト用の設定（ビルド設定 vite.config.js を引き継ぐ）
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
  },
}))
