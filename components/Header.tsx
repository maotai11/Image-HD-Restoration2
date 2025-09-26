import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex items-center justify-center gap-3">
        <SparklesIcon />
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Image HD Restoration
        </h1>
      </div>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
        Upload a blurry or low-quality image. Our AI, powered by Gemini, will enhance its resolution, remove blur, and recognize any text it contains.
      </p>
    </header>
  );
};