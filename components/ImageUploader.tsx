import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the <label> element.
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the <label> element.
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the <label> element.
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the <label> element.
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-4xl mt-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <label
        htmlFor="image-upload"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon />
          <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-slate-400">PNG, JPG, WEBP or other image formats</p>
        </div>
        <input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
    </div>
  );
};
