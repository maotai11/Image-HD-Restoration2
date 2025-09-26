import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-6">
          🎉 AI 圖像文字增強系統
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          GitHub Pages 部署成功！
        </p>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">系統狀態</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-semibold">✅ 前端應用</div>
              <div className="text-green-600">正常運行</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-semibold">🌐 GitHub Pages</div>
              <div className="text-blue-600">部署成功</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ 注意事項
          </h3>
          <p className="text-yellow-700">
            GitHub Pages 版本使用簡化的雲端 API。<br/>
            完整功能請使用本地部署版本。
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            onClick={() => alert('功能開發中...')}
          >
            開始使用 (開發中)
          </button>
          
          <div className="text-sm text-slate-500">
            <a 
              href="https://github.com/maotai11/Image-HD-Restoration2" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看 GitHub 源碼
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;