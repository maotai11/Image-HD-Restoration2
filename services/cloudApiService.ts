// 雲端 API 服務適配器
// 當本地服務不可用時，使用雲端 API 作為備用

import type { OcrResult, TextBlock } from '../types';

// Hugging Face Inference API
const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

// 使用 Hugging Face 的 OCR 模型
export async function extractTextWithHuggingFace(base64ImageData: string): Promise<OcrResult | null> {
  try {
    if (!HF_API_KEY) {
      console.warn('Hugging Face API key not available');
      return null;
    }

    // 轉換 base64 為 blob
    const byteCharacters = atob(base64ImageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

    const response = await fetch(`${HF_API_BASE}/microsoft/trocr-base-printed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: imageBlob
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.json();
    
    // 轉換為我們的格式 (簡化版本，因為 TrOCR 不提供位置信息)
    const textBlocks: TextBlock[] = [];
    if (result && result.generated_text) {
      textBlocks.push({
        content: result.generated_text,
        position: [0, 0, 1, 1], // 全圖範圍
        score: 0.8 // 假設信心度
      });
    }

    return { text_blocks: textBlocks };

  } catch (error) {
    console.error('Hugging Face OCR 失敗:', error);
    return null;
  }
}

// 使用 Hugging Face 的圖像增強模型
export async function enhanceImageWithHuggingFace(
  base64ImageData: string,
  prompt: string = "enhance image quality and make text clearer"
): Promise<string | null> {
  try {
    if (!HF_API_KEY) {
      console.warn('Hugging Face API key not available');
      return null;
    }

    const byteCharacters = atob(base64ImageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

    const response = await fetch(`${HF_API_BASE}/stabilityai/stable-diffusion-xl-base-1.0`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          image: base64ImageData
      })
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.blob();
    const arrayBuffer = await result.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    const enhancedBase64 = btoa(binaryString);

    return enhancedBase64;

  } catch (error) {
    console.error('Hugging Face 圖像增強失敗:', error);
    return null;
  }
}

// 檢查雲端服務可用性
export async function checkCloudServices(): Promise<{
  huggingface: { available: boolean; error?: string };
}> {
  try {
    const response = await fetch(`${HF_API_BASE}/microsoft/trocr-base-printed`, {
      method: 'GET',
      headers: HF_API_KEY ? { 'Authorization': `Bearer ${HF_API_KEY}` } : {}
    });
    
    return {
      huggingface: { 
        available: response.status !== 401, // 401 表示需要 API key，但服務可用
        error: response.status === 401 ? 'API key required' : undefined
      }
    };
  } catch (error) {
    return {
      huggingface: { 
        available: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    };
  }
}