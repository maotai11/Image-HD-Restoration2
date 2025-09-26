export async function checkLocalServices(): Promise<{
  paddleOcr: { available: boolean; version?: string; error?: string };
  qwen: { available: boolean; version?: string; error?: string };
  allAvailable: boolean;
}> {
  // 從環境變數獲取服務 URL
  const paddleOcrUrl = process.env.PADDLE_OCR_URL || 'http://localhost:8001';
  const qwenUrl = process.env.QWEN_SERVICE_URL || 'http://localhost:8000';

  // 檢查 PaddleOCR 服務
  let paddleOcrStatus = { available: false, error: '未檢查' };
  try {
    const response = await fetch(`${paddleOcrUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      const data = await response.json();
      paddleOcrStatus = { available: true, version: data.version || 'unknown' };
    } else {
      paddleOcrStatus = { available: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    paddleOcrStatus = { 
      available: false, 
      error: error instanceof Error ? error.message : '連接失敗' 
    };
  }

  // 檢查 Qwen 服務
  let qwenStatus = { available: false, error: '未檢查' };
  try {
    const response = await fetch(`${qwenUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      const data = await response.json();
      qwenStatus = { available: true, version: data.version || 'unknown' };
    } else {
      qwenStatus = { available: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    qwenStatus = { 
      available: false, 
      error: error instanceof Error ? error.message : '連接失敗' 
    };
  }

  return {
    paddleOcr: paddleOcrStatus,
    qwen: qwenStatus,
    allAvailable: paddleOcrStatus.available && qwenStatus.available
  };
}

export async function getServiceStatus(): Promise<string> {
  const status = await checkLocalServices();
  
  if (!status.allAvailable) {
    const messages = [];
    
    if (!status.paddleOcr.available) {
      messages.push(`❌ PaddleOCR 服務 (localhost:8001): ${status.paddleOcr.error}`);
    } else {
      messages.push(`✅ PaddleOCR 服務 (localhost:8001): 運行中 v${status.paddleOcr.version}`);
    }
    
    if (!status.qwen.available) {
      messages.push(`❌ Qwen 服務 (localhost:8000): ${status.qwen.error}`);
    } else {
      messages.push(`✅ Qwen 服務 (localhost:8000): 運行中 v${status.qwen.version}`);
    }
    
    return messages.join('\n');
  }
  
  return `✅ 所有本地 AI 服務運行正常\n✅ PaddleOCR (localhost:8001): v${status.paddleOcr.version}\n✅ Qwen (localhost:8000): v${status.qwen.version}`;
}