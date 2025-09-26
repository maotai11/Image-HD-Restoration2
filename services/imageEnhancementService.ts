import { enhanceImageWithQwen, repairTextWithQwen } from './qwenService';
import { extractTextWithPaddleOCR } from './paddleOcrService';
import { extractTextWithHuggingFace, enhanceImageWithHuggingFace } from './cloudApiService';
import type { OcrResult, EnhancementResult } from '../types';

export async function enhanceImageWithLocalAI(
  base64ImageData: string
): Promise<{ 
  result: EnhancementResult; 
  ocrResult: OcrResult | null; 
}> {
  let ocrResult: OcrResult | null = null;
  
  // 步驟 1: 嘗試本地 PaddleOCR，失敗則使用雲端 OCR
  try {
    console.log('使用 PaddleOCR 進行文字辨識...');
    ocrResult = await extractTextWithPaddleOCR(base64ImageData);
    
    if (!ocrResult || ocrResult.text_blocks.length === 0) {
      console.log('PaddleOCR 無結果，嘗試雲端 OCR...');
      ocrResult = await extractTextWithHuggingFace(base64ImageData);
    }
  } catch (error) {
    console.error('本地 OCR 失敗，嘗試雲端 OCR:', error);
    try {
      ocrResult = await extractTextWithHuggingFace(base64ImageData);
    } catch (cloudError) {
      console.error('雲端 OCR 也失敗:', cloudError);
    }
  }

  // 步驟 2: 嘗試本地 Qwen，失敗則使用雲端增強
  try {
    console.log('使用 Qwen 進行圖像增強...');
    const qwenResult = await enhanceImageWithQwen(base64ImageData);
    
    if (qwenResult) {
      return {
        result: {
          enhancedImageBase64: qwenResult,
          method: 'qwen-local',
          success: true
        },
        ocrResult
      };
    }
  } catch (error) {
    console.error('本地 Qwen 失敗:', error);
  }

  // 嘗試雲端圖像增強
  try {
    console.log('嘗試雲端圖像增強...');
    const cloudResult = await enhanceImageWithHuggingFace(base64ImageData);
    
    if (cloudResult) {
      return {
        result: {
          enhancedImageBase64: cloudResult,
          method: 'cloud',
          success: true
        },
        ocrResult
      };
    }
  } catch (error) {
    console.error('雲端增強失敗:', error);
  }

  // 所有方法都失敗，返回原圖
  console.log('所有增強方法失敗，使用原始圖像');
  return {
    result: {
      enhancedImageBase64: base64ImageData,
      method: 'fallback',
      success: false,
      error: '所有 AI 服務都不可用'
    },
    ocrResult
  };
}

export async function repairSpecificRegion(
  base64ImageData: string,
  textRegion?: { x: number; y: number; width: number; height: number }
): Promise<EnhancementResult> {
  try {
    console.log('使用 Qwen 修復特定區域...');
    const qwenResult = await repairTextWithQwen(base64ImageData, textRegion);
    
    if (qwenResult) {
      return {
        enhancedImageBase64: qwenResult,
        method: 'qwen',
        success: true
      };
    }
  } catch (error) {
    console.error('Qwen 區域修復失敗:', error);
  }

  // 修復失敗時返回原圖
  return {
    enhancedImageBase64: base64ImageData,
    method: 'fallback',
    success: false,
    error: 'Qwen 區域修復服務不可用'
  };
}

// 檢查所有本地服務狀態
export async function checkLocalServices(): Promise<{
  paddleOcr: { available: boolean; version?: string; error?: string };
  qwen: { available: boolean; version?: string; error?: string };
  allAvailable: boolean;
}> {
  const { checkPaddleOcrService } = await import('./paddleOcrService');
  const { checkQwenService } = await import('./qwenService');
  
  const [paddleOcrStatus, qwenStatus] = await Promise.all([
    checkPaddleOcrService(),
    checkQwenService()
  ]);
  
  return {
    paddleOcr: paddleOcrStatus,
    qwen: qwenStatus,
    allAvailable: paddleOcrStatus.available && qwenStatus.available
  };
}