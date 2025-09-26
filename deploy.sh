#!/bin/bash

echo "🚀 開始部署到 GitHub Pages..."

# 檢查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 發現未提交的更改，正在提交..."
    git add .
    git commit -m "Update for GitHub Pages deployment $(date)"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 你的應用將在幾分鐘後可以通過以下網址訪問："
echo "   https://maotai11.github.io/Image-HD-Restoration2/"
echo ""
echo "📊 查看部署狀態："
echo "   https://github.com/maotai11/Image-HD-Restoration2/actions"