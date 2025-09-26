// PaddleOCR 服務 - 用於 OCR 文字辨識
import type { OcrResult, TextBlock } from '../types';

const PADDLE_OCR_API = process.env.PADDLE_OCR_URL || 'http://localhost:8001';

export async function extractTextWithPaddleOCR(base64ImageData: string): Promise<OcrResult | null> {
    try {
        // 檢查本地服務是否可用
        const healthCheck = await fetch(`${PADDLE_OCR_API}/health`).catch(() => null);
        if (!healthCheck || !healthCheck.ok) {
            console.warn("PaddleOCR 本地服務不可用，請確保服務已啟動");
            return null;
        }

        // 準備請求數據
        const requestData = {
            image: base64ImageData,
            use_angle_cls: true,  // 使用角度分類器
            use_dilation: true,   // 使用膨脹操作
            lang: 'ch'           // 中文辨識
        };

        const response = await fetch(`${PADDLE_OCR_API}/ocr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`PaddleOCR API 錯誤: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // 轉換 PaddleOCR 結果格式為我們的格式
        const textBlocks: TextBlock[] = [];
        
        if (result.results && Array.isArray(result.results)) {
            for (const item of result.results) {
                if (item.text && item.bbox && item.confidence) {
                    // PaddleOCR 返回的 bbox 格式: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                    // 轉換為我們的格式: [x1, y1, x2, y2] (相對座標 0-1)
                    const bbox = item.bbox;
                    const x1 = Math.min(...bbox.map((p: number[]) => p[0])) / (result.image_width || 1);
                    const y1 = Math.min(...bbox.map((p: number[]) => p[1])) / (result.image_height || 1);
                    const x2 = Math.max(...bbox.map((p: number[]) => p[0])) / (result.image_width || 1);
                    const y2 = Math.max(...bbox.map((p: number[]) => p[1])) / (result.image_height || 1);
                    
                    textBlocks.push({
                        content: item.text,
                        position: [x1, y1, x2, y2],
                        score: item.confidence
                    });
                }
            }
        }

        return { text_blocks: textBlocks };

    } catch (error) {
        console.error('調用 PaddleOCR API 時發生錯誤:', error);
        return null;
    }
}

// 檢查本地 PaddleOCR 服務狀態
export async function checkPaddleOcrService(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
        const response = await fetch(`${PADDLE_OCR_API}/health`, {
            method: 'GET',
            timeout: 5000
        } as RequestInit);
        
        if (response.ok) {
            const data = await response.json();
            return {
                available: true,
                version: data.version || 'unknown'
            };
        } else {
            return {
                available: false,
                error: `服務回應錯誤: ${response.status}`
            };
        }
    } catch (error) {
        return {
            available: false,
            error: error instanceof Error ? error.message : '連接失敗'
        };
    }
}