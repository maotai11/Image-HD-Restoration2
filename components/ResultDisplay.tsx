import React, { useState, useRef, useEffect } from 'react';
import type { OcrResult, TextBlock } from '../types';
import { CopyIcon } from './icons';

interface ResultDisplayProps {
  originalImageUrl: string | null;
  restoredImageUrl: string | null;
  ocrResult: OcrResult | null;
  enhancementMethod?: string;
}

const BoundingBox: React.FC<{ block: TextBlock; scale: number; imageLoaded: boolean }> = ({ block, scale, imageLoaded }) => {
  const [x1, y1, x2, y2] = block.position;
  // Softer colors for the bounding boxes
  const confidenceColor = block.score > 0.9 ? 'border-emerald-400' : block.score > 0.7 ? 'border-amber-400' : 'border-rose-400';
  
  if (!imageLoaded || !scale) return null;

  return (
    <div
      className={`absolute border-2 ${confidenceColor} transition-opacity duration-300 opacity-80 hover:opacity-100 group`}
      style={{
        left: `${x1 * 100}%`,
        top: `${y1 * 100}%`,
        width: `${(x2 - x1) * 100}%`,
        height: `${(y2 - y1) * 100}%`,
      }}
      title={`Confidence: ${(block.score * 100).toFixed(1)}%`}
    >
        <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Conf: {(block.score * 100).toFixed(1)}%
        </div>
    </div>
  );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrl, restoredImageUrl, ocrResult, enhancementMethod }) => {
    const [showBoxes, setShowBoxes] = useState(true);
    const restoredImageRef = useRef<HTMLImageElement>(null);
    const [scale, setScale] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    useEffect(() => {
        const img = restoredImageRef.current;
        const handleResize = () => {
            if (img && img.naturalWidth > 0) {
                const newScale = img.offsetWidth / img.naturalWidth;
                setScale(newScale);
            }
        };

        if (img) {
            const handleLoad = () => {
                setImageLoaded(true);
                handleResize();
            };
            img.addEventListener('load', handleLoad);
            if (img.complete && img.naturalWidth > 0) {
              handleLoad();
            }
            window.addEventListener('resize', handleResize);
            return () => {
              img.removeEventListener('load', handleLoad);
              window.removeEventListener('resize', handleResize);
            }
        }
    }, [restoredImageUrl]);

    const handleCopyText = () => {
        if (!ocrResult || ocrResult.text_blocks.length === 0) return;
        const allText = ocrResult.text_blocks.map(block => block.content).join('\n\n');
        navigator.clipboard.writeText(allText);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

  return (
    <div className="w-full max-w-7xl mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-slate-700">Original Image</h2>
          <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
            {originalImageUrl && <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-xl font-bold text-slate-700">Restored Image</h2>
            {enhancementMethod && (
              <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                enhancementMethod === 'gemini' ? 'bg-blue-100 text-blue-700' :
                enhancementMethod === 'qwen' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                Enhanced with {enhancementMethod === 'gemini' ? 'Gemini' : enhancementMethod === 'qwen' ? 'Qwen' : 'Fallback'}
              </span>
            )}
          </div>
          <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
            {restoredImageUrl ? (
                <>
                <img ref={restoredImageRef} src={restoredImageUrl} alt="Restored" className="max-w-full max-h-full object-contain"/>
                {showBoxes && ocrResult && ocrResult.text_blocks
                    // FIX: Filter for blocks that have a valid position array to prevent crashes.
                    .filter(block => block.position && Array.isArray(block.position) && block.position.length === 4)
                    .map((block, index) => (
                        <BoundingBox key={index} block={block} scale={scale} imageLoaded={imageLoaded}/>
                ))}
                </>
            ) : (
                <div className="text-slate-500 animate-pulse">Awaiting restoration...</div>
            )}
          </div>
        </div>
      </div>
      
      {ocrResult && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                 <h2 className="text-2xl font-bold text-slate-700">Extracted Text</h2>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <label htmlFor="show-boxes" className="mr-3 text-sm font-medium text-slate-600">Show Boxes:</label>
                        <input
                            id="show-boxes"
                            type="checkbox"
                            checked={showBoxes}
                            onChange={() => setShowBoxes(!showBoxes)}
                            className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                        />
                    </div>
                    <button 
                        onClick={handleCopyText}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!ocrResult || ocrResult.text_blocks.length === 0}
                        >
                        <CopyIcon />
                        {copyStatus === 'copied' ? 'Copied!' : 'Copy All Text'}
                    </button>
                </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto space-y-4 border border-slate-200">
                {ocrResult.text_blocks.length > 0 ? (
                    ocrResult.text_blocks.map((block, index) => {
                        const confidenceColor = block.score > 0.9 ? 'text-emerald-600' : block.score > 0.7 ? 'text-amber-600' : 'text-rose-600';
                        return (
                            <div key={index} className="p-4 bg-white rounded-md border border-slate-200 shadow-sm">
                                <p className="text-slate-800 whitespace-pre-wrap text-base">{block.content}</p>
                                <p className={`text-xs mt-2 font-medium ${confidenceColor}`}>
                                    Confidence: {(block.score * 100).toFixed(1)}%
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-slate-500 text-center py-8">No text was detected in the image.</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
};