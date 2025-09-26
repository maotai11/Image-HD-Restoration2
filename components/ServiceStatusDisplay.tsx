import React, { useState, useEffect } from 'react';
import { getServiceStatus } from '../utils/apiKeyChecker';

interface ServiceStatusDisplayProps {
  onClose: () => void;
}

export const ServiceStatusDisplay: React.FC<ServiceStatusDisplayProps> = ({ onClose }) => {
  const [status, setStatus] = useState<string>('檢查中...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const statusText = await getServiceStatus();
        setStatus(statusText);
      } catch (error) {
        setStatus('檢查服務狀態時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const statusText = await getServiceStatus();
      setStatus(statusText);
    } catch (error) {
      setStatus('檢查服務狀態時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 w-full max-w-4xl bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">本地 AI 服務狀態：</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? '檢查中...' : '重新檢查'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
      
      <pre className="text-sm whitespace-pre-line mb-3">{status}</pre>
      
      <div className="mt-3 text-sm bg-blue-100 p-3 rounded">
        <p><strong>本地服務設定說明：</strong></p>
        <div className="mt-2 space-y-1">
          <p><strong>1. PaddleOCR 服務 (端口 8001)：</strong></p>
          <p className="ml-4">• 安裝：<code>pip install paddlepaddle paddleocr</code></p>
          <p className="ml-4">• 啟動：<code>python -m paddleocr --use_angle_cls=True --use_gpu=False --port=8001</code></p>
          
          <p className="mt-2"><strong>2. Qwen-Image-Edit 服務 (端口 8000)：</strong></p>
          <p className="ml-4">• 下載模型：<code>git clone https://huggingface.co/Qwen/Qwen-Image-Edit</code></p>
          <p className="ml-4">• 安裝依賴：<code>pip install transformers torch torchvision</code></p>
          <p className="ml-4">• 啟動服務：<code>python qwen_server.py --port=8000</code></p>
        </div>
      </div>
    </div>
  );
};