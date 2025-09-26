<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 本地 AI 圖像文字增強系統

這是一個完全本地化的 AI 圖像文字增強應用，使用 PaddleOCR 進行文字辨識，Qwen-Image-Edit 進行中文字還原。

## 特色功能

### 🔒 完全本地化
- **無需 API Keys**：所有 AI 處理都在本地進行
- **隱私保護**：圖片不會上傳到任何雲端服務
- **離線運行**：無需網路連接即可使用

### 🤖 雙 AI 系統
- **PaddleOCR**：高精度中文 OCR 文字辨識
- **Qwen-Image-Edit**：專門針對中文字的圖像增強

### 🎯 智能文字修復
- 自動檢測低信心度文字區域
- 針對性修復模糊或扭曲的文字
- 保持原始版面配置

## 安裝與設定

### 前置需求
- Node.js (建議 18+)
- Python 3.8+
- 至少 4GB RAM

### 1. 安裝前端依賴
```bash
npm install
```

### 2. 安裝 Python 依賴
```bash
pip install -r requirements.txt
```

### 3. 啟動 AI 服務

**本地服務:**
```bash
python scripts/start_services.py
```

**網路服務 (支援其他裝置訪問):**
```bash
npm run start:network
```

### 4. 啟動前端應用

**本地訪問:**
```bash
npm run dev
```

**網路訪問 (其他裝置可訪問):**
```bash
npm run dev:network
```

## 服務架構

### PaddleOCR 服務 (端口 8001)
- **功能**：OCR 文字辨識
- **支援語言**：中文、英文
- **API 端點**：
  - `GET /health` - 健康檢查
  - `POST /ocr` - 文字辨識

### Qwen-Image-Edit 服務 (端口 8000)
- **功能**：圖像增強和文字修復
- **專長**：中文字體還原
- **API 端點**：
  - `GET /health` - 健康檢查
  - `POST /enhance` - 圖像增強

## 使用方式

1. **上傳圖片**：拖拽或點擊上傳包含文字的圖片
2. **自動處理**：系統會自動進行 OCR 辨識和圖像增強
3. **查看結果**：
   - 左側顯示原始圖片
   - 右側顯示增強後的圖片
   - 下方顯示辨識出的文字內容
4. **文字修復**：系統會自動修復信心度低於 70% 的文字區域

## 進階設定

### 自定義服務端點
編輯 `.env.local` 文件：
```
PADDLE_OCR_URL=http://localhost:8001
QWEN_SERVICE_URL=http://localhost:8000
DEBUG_MODE=false
```

### 效能調整
- **GPU 加速**：如有 NVIDIA GPU，可安裝 `paddlepaddle-gpu`
- **記憶體優化**：調整批次大小以適應可用記憶體
- **並行處理**：可同時啟動多個服務實例

## 故障排除

### 常見問題

**Q: 服務啟動失敗**
A: 檢查端口 8000 和 8001 是否被佔用，或修改 `.env.local` 中的端口設定

**Q: OCR 辨識效果不佳**
A: 確保圖片清晰度足夠，文字大小適中，對比度良好

**Q: 記憶體不足**
A: 降低圖片解析度或關閉其他應用程式釋放記憶體

### 檢查服務狀態
在應用中點擊「檢查服務狀態」按鈕，查看各服務運行情況。

## 開發說明

### 專案結構
```
├── components/          # React 組件
├── services/           # AI 服務接口
├── utils/              # 工具函數
├── scripts/            # 啟動腳本
└── requirements.txt    # Python 依賴
```

### 自定義模型
可以替換為其他 OCR 或圖像增強模型，只需實現相同的 API 接口。

## 授權
MIT License

## 貢獻
歡迎提交 Issue 和 Pull Request！
## 🌐
 網路部署

### 快速網路部署
```bash
# 1. 啟動網路版 AI 服務
npm run start:network

# 2. 啟動網路版前端 (新終端)
npm run dev:network

# 3. 在其他裝置訪問 http://YOUR_IP:5173
```

### 詳細部署說明
請參考 [DEPLOYMENT.md](DEPLOYMENT.md) 獲取完整的網路部署指南，包括：
- 本地網路訪問設定
- 外網訪問配置
- Docker 部署
- 雲端平台部署
- 故障排除

### 支援的訪問方式
- ✅ 本機訪問 (localhost)
- ✅ 區域網路訪問 (同一 WiFi)
- ✅ 外網訪問 (需路由器設定)
- ✅ 行動裝置訪問
- ✅ 雲端部署