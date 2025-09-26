# 網路部署指南

## 🌐 網路訪問設定

### 本地網路訪問 (同一 WiFi/區域網路)

#### 1. 安裝依賴
```bash
# 安裝 Python 依賴
pip install -r requirements.txt

# 安裝前端依賴
npm install
```

#### 2. 啟動網路版服務
```bash
# 啟動支援網路訪問的 AI 服務
npm run start:network

# 或直接執行
python scripts/deploy_network.py
```

#### 3. 啟動前端應用
```bash
# 啟動支援網路訪問的前端
npm run dev:network
```

#### 4. 訪問應用
- **主機訪問**: http://localhost:5173
- **其他裝置**: http://YOUR_IP:5173 (將 YOUR_IP 替換為主機 IP)

### 🔍 獲取主機 IP 地址

**Windows:**
```cmd
ipconfig
```
找到 "IPv4 地址" (通常是 192.168.x.x)

**macOS/Linux:**
```bash
ifconfig | grep inet
```

**或使用腳本自動顯示:**
```bash
python scripts/deploy_network.py
```

## 🌍 外網訪問設定

### 方法 1: 路由器端口轉發

1. **登入路由器管理介面** (通常是 192.168.1.1 或 192.168.0.1)

2. **設定端口轉發規則:**
   - 前端應用: 外部端口 5173 → 內部 IP:5173
   - PaddleOCR: 外部端口 8001 → 內部 IP:8001
   - Qwen 服務: 外部端口 8000 → 內部 IP:8000

3. **更新環境變數:**
   編輯 `.env.production`:
   ```
   PADDLE_OCR_URL=http://YOUR_PUBLIC_IP:8001
   QWEN_SERVICE_URL=http://YOUR_PUBLIC_IP:8000
   ```

4. **建置生產版本:**
   ```bash
   npm run build
   npm run preview:network
   ```

### 方法 2: 雲端部署

#### Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.9-slim
WORKDIR /app

# 安裝 Python 依賴
COPY requirements.txt .
RUN pip install -r requirements.txt

# 複製前端建置結果
COPY --from=frontend /app/dist ./static

# 複製 Python 服務
COPY scripts/ ./scripts/

# 暴露端口
EXPOSE 5173 8000 8001

# 啟動腳本
CMD ["python", "scripts/deploy_network.py"]
```

#### 使用 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  ai-image-enhancer:
    build: .
    ports:
      - "5173:5173"
      - "8000:8000" 
      - "8001:8001"
    environment:
      - PADDLE_OCR_URL=http://localhost:8001
      - QWEN_SERVICE_URL=http://localhost:8000
```

### 方法 3: 雲端平台部署

#### Vercel (前端)
1. 連接 GitHub 倉庫
2. 設定環境變數指向你的 AI 服務
3. 自動部署

#### Railway/Heroku (全端)
1. 上傳專案到 GitHub
2. 連接到 Railway/Heroku
3. 設定 Dockerfile 部署

## 🔧 故障排除

### 常見問題

**Q: 其他裝置無法訪問**
A: 
- 檢查防火牆設定，允許端口 5173, 8000, 8001
- 確保所有裝置在同一網路中
- 檢查路由器是否阻擋內網通訊

**Q: AI 服務連接失敗**
A:
- 確認 AI 服務已啟動並監聽 0.0.0.0
- 檢查環境變數中的 URL 設定
- 測試服務端點: curl http://YOUR_IP:8001/health

**Q: CORS 錯誤**
A:
- 確認 Flask 服務已啟用 CORS
- 檢查瀏覽器開發者工具的錯誤訊息
- 重新啟動服務

### 網路測試命令

```bash
# 測試 AI 服務
curl http://YOUR_IP:8001/health
curl http://YOUR_IP:8000/health

# 測試前端
curl http://YOUR_IP:5173

# 檢查端口是否開放
netstat -an | grep :5173
netstat -an | grep :8001
netstat -an | grep :8000
```

## 📱 行動裝置訪問

1. 確保手機/平板與電腦在同一 WiFi 網路
2. 在行動裝置瀏覽器輸入: `http://電腦IP:5173`
3. 建議使用 Chrome 或 Safari 瀏覽器
4. 如需更好的行動體驗，可考慮建立 PWA (Progressive Web App)

## 🔒 安全注意事項

- 僅在信任的網路環境中開放外部訪問
- 考慮添加基本認證或 IP 白名單
- 定期更新依賴套件
- 監控服務資源使用情況