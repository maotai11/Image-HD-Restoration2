# GitHub 部署指南

## 🚀 快速部署到 GitHub Pages

### 方法 1: 自動部署 (推薦)

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "準備 GitHub 部署"
   git push origin main
   ```

2. **啟用 GitHub Pages**
   - 前往 GitHub 倉庫 → Settings → Pages
   - Source 選擇 "GitHub Actions"
   - 推送後會自動部署

3. **設定 Hugging Face API Key (可選)**
   - 前往 GitHub 倉庫 → Settings → Secrets and variables → Actions
   - 新增 Secret: `HUGGINGFACE_API_KEY`
   - 值為你的 Hugging Face API Token

### 方法 2: 手動部署

1. **安裝 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **建置並部署**
   ```bash
   npm run deploy:github
   ```

## 🔧 配置說明

### 更新倉庫名稱
編輯 `vite.config.github.ts` 中的 `base` 路徑：
```typescript
base: '/你的倉庫名稱/',
```

### API 服務配置

**GitHub Pages 部署會自動使用:**
- Hugging Face Inference API (免費額度)
- 雲端 OCR 服務
- 備用圖像增強服務

**本地開發仍使用:**
- PaddleOCR (本地)
- Qwen-Image-Edit (本地)

## 📱 部署後的功能

### ✅ 可用功能
- 圖片上傳和顯示
- 基本 OCR 文字辨識 (英文為主)
- 簡單圖像增強
- 響應式設計
- 跨平台訪問

### ⚠️ 限制
- OCR 精度可能不如本地 PaddleOCR
- 中文辨識效果有限
- 依賴 Hugging Face API 額度
- 圖像增強效果可能較簡單

## 🌐 訪問你的應用

部署成功後，可通過以下 URL 訪問：
```
https://maotai11.github.io/Image-HD-Restoration2/
```

## 🔄 更新部署

每次推送到 `main` 分支都會自動重新部署，或手動執行：
```bash
npm run deploy:github
```

## 🛠️ 故障排除

### 常見問題

**Q: 部署後頁面空白**
A: 檢查 `vite.config.github.ts` 中的 `base` 路徑是否正確

**Q: API 調用失敗**
A: 
- 檢查 Hugging Face API Key 是否設定
- 確認網路連接正常
- 查看瀏覽器開發者工具的錯誤訊息

**Q: 圖片處理效果不佳**
A: 
- GitHub Pages 版本使用簡化的雲端 API
- 如需完整功能，建議使用本地部署
- 可考慮升級到付費的 Hugging Face Pro

### 檢查部署狀態
- GitHub Actions 頁面查看建置日誌
- GitHub Pages 設定頁面查看部署狀態
- 瀏覽器開發者工具查看錯誤訊息

## 💡 進階配置

### 自定義域名
1. 在倉庫根目錄創建 `CNAME` 文件
2. 內容為你的域名，如 `ai-enhancer.example.com`
3. 在域名提供商設定 CNAME 記錄指向 `你的用戶名.github.io`

### 環境變數
在 GitHub Secrets 中可設定：
- `HUGGINGFACE_API_KEY`: Hugging Face API 金鑰
- `CUSTOM_API_ENDPOINT`: 自定義 API 端點

### PWA 支援
可添加 Service Worker 和 Web App Manifest 來創建 PWA 版本。