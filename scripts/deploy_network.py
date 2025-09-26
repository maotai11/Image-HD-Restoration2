#!/usr/bin/env python3
"""
網路部署腳本
啟動支援網路訪問的 AI 服務
"""

import subprocess
import sys
import time
import requests
import threading
import socket
from pathlib import Path

def get_local_ip():
    """獲取本機 IP 地址"""
    try:
        # 連接到外部地址來獲取本機 IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def check_service(url, name):
    """檢查服務是否運行"""
    try:
        response = requests.get(f"{url}/health", timeout=3)
        return response.status_code == 200
    except:
        return False

def start_paddle_ocr_network():
    """啟動支援網路訪問的 PaddleOCR 服務"""
    print("啟動網路版 PaddleOCR 服務...")
    try:
        paddle_server_code = '''
import json
from flask import Flask, request, jsonify, cors
from paddleocr import PaddleOCR
import base64
import cv2
import numpy as np

app = Flask(__name__)

# 啟用 CORS 支援跨域訪問
from flask_cors import CORS
CORS(app, origins="*")

ocr = PaddleOCR(use_angle_cls=True, lang='ch')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "2.7.0", "network": True})

@app.route('/ocr', methods=['POST', 'OPTIONS'])
def ocr_endpoint():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        image_data = data['image']
        
        # 解碼 base64 圖片
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 執行 OCR
        result = ocr.ocr(img, cls=True)
        
        # 轉換結果格式
        results = []
        if result and result[0]:
            for line in result[0]:
                bbox = line[0]  # 邊界框座標
                text = line[1][0]  # 文字內容
                confidence = line[1][1]  # 信心度
                
                results.append({
                    'text': text,
                    'bbox': bbox,
                    'confidence': confidence
                })
        
        return jsonify({
            'results': results,
            'image_width': img.shape[1],
            'image_height': img.shape[0]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=False)
'''
        
        # 寫入網路版服務器文件
        with open('paddle_server_network.py', 'w', encoding='utf-8') as f:
            f.write(paddle_server_code)
        
        # 啟動服務
        subprocess.Popen([sys.executable, 'paddle_server_network.py'])
        
    except Exception as e:
        print(f"啟動網路版 PaddleOCR 服務失敗: {e}")

def start_qwen_service_network():
    """啟動支援網路訪問的 Qwen-Image-Edit 服務"""
    print("啟動網路版 Qwen-Image-Edit 服務...")
    try:
        qwen_server_code = '''
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch

app = Flask(__name__)
CORS(app, origins="*")  # 啟用 CORS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0", "network": True})

@app.route('/enhance', methods=['POST', 'OPTIONS'])
def enhance_endpoint():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        image_data = data['image']
        prompt = data.get('prompt', '讓圖片中的文字更清晰')
        
        # 解碼 base64 圖片
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # 這裡應該使用 Qwen-Image-Edit 模型進行處理
        # 目前返回原圖作為示例
        print(f"處理圖片，提示詞: {prompt}")
        
        # 將圖片轉回 base64
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG')
        enhanced_image = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'enhanced_image': enhanced_image,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
'''
        
        # 寫入網路版服務器文件
        with open('qwen_server_network.py', 'w', encoding='utf-8') as f:
            f.write(qwen_server_code)
        
        # 啟動服務
        subprocess.Popen([sys.executable, 'qwen_server_network.py'])
        
    except Exception as e:
        print(f"啟動網路版 Qwen 服務失敗: {e}")

def main():
    local_ip = get_local_ip()
    print(f"正在啟動網路版 AI 服務...")
    print(f"本機 IP 地址: {local_ip}")
    
    # 啟動服務
    paddle_thread = threading.Thread(target=start_paddle_ocr_network)
    qwen_thread = threading.Thread(target=start_qwen_service_network)
    
    paddle_thread.start()
    qwen_thread.start()
    
    # 等待服務啟動
    print("等待服務啟動...")
    time.sleep(8)
    
    # 檢查服務狀態
    paddle_ok = check_service(f"http://{local_ip}:8001", "PaddleOCR")
    qwen_ok = check_service(f"http://{local_ip}:8000", "Qwen")
    
    print(f"\\nPaddleOCR 服務: {'✅ 運行中' if paddle_ok else '❌ 未啟動'}")
    print(f"Qwen 服務: {'✅ 運行中' if qwen_ok else '❌ 未啟動'}")
    
    if paddle_ok and qwen_ok:
        print(f"\\n🎉 所有網路服務已成功啟動！")
        print(f"\\n📱 其他裝置訪問方式：")
        print(f"1. 確保所有裝置在同一網路中")
        print(f"2. 在其他裝置瀏覽器中訪問: http://{local_ip}:5173")
        print(f"3. AI 服務端點:")
        print(f"   - PaddleOCR: http://{local_ip}:8001")
        print(f"   - Qwen: http://{local_ip}:8000")
        print(f"\\n🔧 如需外網訪問，請設定路由器端口轉發:")
        print(f"   - 前端: 5173 -> {local_ip}:5173")
        print(f"   - PaddleOCR: 8001 -> {local_ip}:8001")
        print(f"   - Qwen: 8000 -> {local_ip}:8000")
    else:
        print("\\n⚠️ 部分服務啟動失敗，請檢查錯誤訊息。")

if __name__ == "__main__":
    main()