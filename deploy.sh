#!/bin/bash

echo "========================================"
echo "   问卷系统一键部署脚本"
echo "========================================"
echo ""

echo "[步骤 1] 检查 Git 状态..."
git status
echo ""

echo "[步骤 2] 添加所有更改..."
git add .
echo ""

echo "[步骤 3] 提交更改..."
read -p "请输入提交说明（默认：Update configuration）: " commit_msg
commit_msg=${commit_msg:-Update configuration}
git commit -m "$commit_msg"
echo ""

echo "[步骤 4] 推送到 GitHub..."
git push origin main
echo ""

echo "========================================"
echo "   完成！"
echo "========================================"
echo ""
echo "代码已推送到 GitHub"
echo "Streamlit Cloud 将在 1-2 分钟内自动更新部署"
echo ""
echo "请访问：https://share.streamlit.io/"
echo "查看你的应用状态"
echo ""
