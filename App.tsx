import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { ServiceStatusDisplay } from './components/ServiceStatusDisplay';
import { enhanceImageWithLocalAI, repairSpecificRegion } from './services/imageEnhancementService';
import type { OcrResult, EnhancementResult } from './types';
import { fileToBase64, cropImage, pasteImage } from './utils/imageUtils';
import { ErrorIcon } from './components/icons';
import { checkLocalServices, getServiceStatus } from './utils/apiKeyChecker';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [enhancementMethod, setEnhancementMethod] = useState<string>('');
  const [showServiceStatus, setShowServiceStatus] = useState<boolean>(false);

  const handleImageUpload = (file: File) => {
    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setRestoredImageUrl(null);
    setOcrResult(null);
    setError(null);
  };

  const handleRestore = useCallback(async () => {
    if (!originalImage) {
      setError('請先上傳圖片。');
      return;
    }

    // 檢查本地服務
    const serviceStatus = await checkLocalServices();
    if (!serviceStatus.allAvailable) {
      setError('本地 AI 服務未完全啟動。請點擊下方的 "檢查服務狀態" 查看詳細資訊。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRestoredImageUrl(null);
    setOcrResult(null);

    try {
      setLoadingMessage('準備圖片...');
      const { base64Data: initialBase64, mimeType } = await fileToBase64(originalImage);

      setLoadingMessage('步驟 1/3: 使用本地 AI 進行圖像增強和文字辨識...');
      const { result: enhancementResult, ocrResult: initialOcrResult } = await enhanceImageWithLocalAI(initialBase64);
      
      setEnhancementMethod(enhancementResult.method);
      setLoadingMessage(`步驟 2/3: 分析文字清晰度 (使用 ${enhancementResult.method})...`);
      let finalImageBase64 = enhancementResult.enhancedImageBase64 || initialBase64;
      
      // 如果有 OCR 結果，檢查是否需要進一步修復
      if (initialOcrResult && initialOcrResult.text_blocks.length > 0) {
        const lowConfidenceBlocks = initialOcrResult.text_blocks.filter(b => b.score < 0.7);
        const repairableBlocks = lowConfidenceBlocks.filter(b => 
          b.position && Array.isArray(b.position) && b.position.length === 4
        );

        if (repairableBlocks.length > 0) {
          const totalToRepair = repairableBlocks.length;
          for (let i = 0; i < totalToRepair; i++) {
            const block = repairableBlocks[i];
            setLoadingMessage(`步驟 3/3: 修復模糊文字 (${i + 1}/${totalToRepair})...`);

            const currentImageUrl = `data:image/jpeg;base64,${finalImageBase64}`;
            const { croppedBase64, croppedMimeType } = await cropImage(currentImageUrl, block.position);
            
            // 使用 Qwen 修復特定區域
            const repairResult = await repairSpecificRegion(
              croppedBase64,
              {
                x: block.position[0],
                y: block.position[1],
                width: block.position[2] - block.position[0],
                height: block.position[3] - block.position[1]
              }
            );

            if (repairResult.success && repairResult.enhancedImageBase64) {
              const repairedPatchUrl = `data:${croppedMimeType};base64,${repairResult.enhancedImageBase64}`;
              const newImageUrl = await pasteImage(currentImageUrl, repairedPatchUrl, block.position);
              finalImageBase64 = newImageUrl.split(',')[1];
            }
          }
        }
      }
      
      setLoadingMessage('處理完成！');
      setRestoredImageUrl(`data:image/jpeg;base64,${finalImageBase64}`);
      setOcrResult(initialOcrResult);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : '發生未知錯誤。';
      setError(`圖片處理失敗。${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [originalImage]);

  const handleClear = () => {
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setRestoredImageUrl(null);
    setOcrResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 md:p-8 font-sans">
      <Header />
      <main className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {isLoading ? (
          <Loader message={loadingMessage} />
        ) : (
          <div className="w-full">
            {!originalImageUrl ? (
                <ImageUploader onImageUpload={handleImageUpload} />
            ) : (
               <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-4xl bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md flex items-center justify-center space-x-4 mb-8 border border-slate-200">
                    <button
                        onClick={handleRestore}
                        disabled={isLoading}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {restoredImageUrl ? 'Restore Again' : 'Restore Image'}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-colors"
                    >
                        Clear Image
                    </button>
                    <button
                        onClick={() => setShowServiceStatus(!showServiceStatus)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                        檢查服務狀態
                    </button>
                </div>
                {error && (
                    <div className="mb-6 w-full max-w-4xl bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-lg flex items-center gap-3">
                        <ErrorIcon />
                        <span>{error}</span>
                    </div>
                )}
                {showServiceStatus && (
                    <ServiceStatusDisplay onClose={() => setShowServiceStatus(false)} />
                )}
                <ResultDisplay
                    originalImageUrl={originalImageUrl}
                    restoredImageUrl={restoredImageUrl}
                    ocrResult={ocrResult}
                    enhancementMethod={enhancementMethod}
                />
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
