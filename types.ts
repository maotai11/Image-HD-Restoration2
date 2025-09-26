
export interface TextBlock {
  content: string;
  position: [number, number, number, number]; // [x1, y1, x2, y2]
  score: number;
}

export interface OcrResult {
  text_blocks: TextBlock[];
}

export interface GeminiResponse {
  restoredImageBase64: string | null;
  ocrResult: OcrResult | null;
}

export interface EnhancementResult {
  enhancedImageBase64: string | null;
  method: 'gemini' | 'qwen' | 'fallback';
  success: boolean;
  error?: string;
}
