#!/usr/bin/env python3
"""
本地 AI 服務啟動腳本
啟動 PaddleOCR 和 Qwen-Image-Edit 服務
"""

import subprocess
import sys
import time
import requests
import threading
from pathlib import Path

def check_service(url, name):
    """檢查服務是否運行"""
    try:
        response = requests.get(f"{url}/health", timeout=3)
        return response.status_code == 200
    except:
        return False

def start_paddle_ocr():
    """啟動 PaddleOCR 服務"""
    print("啟動 PaddleOCR 服務...")
    try:
        # 創建簡單的 PaddleOCR API 服務器
        paddle_server_code = '''
import json
from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import base64
import cv2
import numpy as np

app = Flask(__name__)
ocr = PaddleOCR(use_angle_cls=True, lang='ch')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "2.7.0"})

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
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
        
        # 寫入臨時服務器文件
        with open('paddle_server.py', 'w', encoding='utf-8') as f:
            f.write(paddle_server_code)
        
        # 啟動服務
        subprocess.Popen([sys.executable, 'paddle_server.py'])
        
    except Exception as e:
        print(f"啟動 PaddleOCR 服務失敗: {e}")

def start_qwen_service():
    """啟動 Qwen-Image-Edit 服務"""
    print("啟動 Qwen-Image-Edit 服務...")
    try:
        qwen_server_code = '''
import json
import base64
from flask import Flask, request, jsonify
from PIL import Image
import io
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq

app = Flask(__name__)

# 載入模型 (這裡使用簡化版本，實際使用時需要下載完整模型)
print("載入 Qwen-Image-Edit 模型...")
# model = AutoModelForVision2Seq.from_pretrained("Qwen/Qwen-Image-Edit")
# processor = AutoProcessor.from_pretrained("Qwen/Qwen-Image-Edit")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})

@app.route('/enhance', methods=['POST'])
def enhance_endpoint():
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
        
        # 寫入臨時服務器文件
        with open('qwen_server.py', 'w', encoding='utf-8') as f:
            f.write(qwen_server_code)
        
        # 啟動服務
        subprocess.Popen([sys.executable, 'qwen_server.py'])
        
    except Exception as e:
        print(f"啟動 Qwen 服務失敗: {e}")

def main():
    print("正在啟動本地 AI 服務...")
    
    # 啟動服務
    paddle_thread = threading.Thread(target=start_paddle_ocr)
    qwen_thread = threading.Thread(target=start_qwen_service)
    
    paddle_thread.start()
    qwen_thread.start()
    
    # 等待服務啟動
    print("等待服務啟動...")
    time.sleep(5)
    
    # 檢查服務狀態
    paddle_ok = check_service("http://localhost:8001", "PaddleOCR")
    qwen_ok = check_service("http://localhost:8000", "Qwen")
    
    print(f"PaddleOCR 服務: {'✅ 運行中' if paddle_ok else '❌ 未啟動'}")
    print(f"Qwen 服務: {'✅ 運行中' if qwen_ok else '❌ 未啟動'}")
    
    if paddle_ok and qwen_ok:
        print("\n🎉 所有服務已成功啟動！")
        print("現在可以使用圖像增強應用了。")
    else:
        print("\n⚠️ 部分服務啟動失敗，請檢查錯誤訊息。")

if __name__ == "__main__":
    main()