// 使用本地 Qwen-Image-Edit 模型進行中文字還原
// 這個服務將通過 API 端點調用模型

const QWEN_LOCAL_API = process.env.QWEN_SERVICE_URL || 'http://localhost:8000';

export async function enhanceImageWithQwen(
    base64ImageData: string,
    prompt: string = "請讓這張圖片中的中文字更清晰易讀。增強解析度並修復任何模糊的文字。"
): Promise<string | null> {
    try {
        // 檢查本地服務是否可用
        const healthCheck = await fetch(`${QWEN_LOCAL_API}/health`).catch(() => null);
        if (!healthCheck || !healthCheck.ok) {
            console.warn("Qwen 本地服務不可用，請確保服務已啟動");
            return null;
        }

        // 準備請求數據
        const requestData = {
            image: base64ImageData,
            prompt: prompt,
            task: "image_enhancement"
        };

        const response = await fetch(`${QWEN_LOCAL_API}/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Qwen API 錯誤: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result.enhanced_image || null;

    } catch (error) {
        console.error('調用 Qwen API 時發生錯誤:', error);
        return null;
    }
}

export async function repairTextWithQwen(
    base64ImageData: string,
    textRegion?: { x: number; y: number; width: number; height: number }
): Promise<string | null> {
    const prompt = textRegion
        ? `專注於座標 (${textRegion.x}, ${textRegion.y}) 大小 ${textRegion.width}x${textRegion.height} 的文字區域。讓這個特定區域的中文字更清晰、銳利且易讀。修復任何模糊或扭曲的字符。`
        : "讓這張圖片中的所有中文字更清晰、銳利且易讀。修復任何模糊、扭曲或低解析度的文字，同時保持原始內容和版面配置。";

    return enhanceImageWithQwen(base64ImageData, prompt);
}

// 檢查本地 Qwen 服務狀態
export async function checkQwenService(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
        const response = await fetch(`${QWEN_LOCAL_API}/health`, {
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