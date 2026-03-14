#!/bin/bash

# 115 Cloud Master 发布脚本
# 版本：v1.0.0

set -e

echo "🚀 开始发布 115 Cloud Master..."

# 1. 运行测试
echo "📊 运行测试..."
npm test

# 2. 代码检查
echo "🔍 代码检查..."
npm run lint

# 3. 构建（如果有）
echo "🔨 构建..."
npm run build || echo "无需构建"

# 4. 版本号
VERSION="1.0.0"
echo "📦 发布版本：v$VERSION"

# 5. 创建 Git 标签
echo "🏷️  创建 Git 标签..."
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"

# 6. 发布到 ClawHub
echo "📤 发布到 ClawHub..."
npx clawhub --workdir ~/.openclaw --dir skills publish . || echo "ClawHub 发布失败，请手动发布"

# 7. 生成发布说明
echo "📝 生成发布说明..."
cat > releases/v$VERSION.md << EOF
# Release v$VERSION

## 🎉 发布信息

- **版本**: v$VERSION
- **日期**: $(date +%Y-%m-%d)
- **提交**: $(git rev-parse --short HEAD)

## ✨ 新功能

- 🔐 扫码登录（聊天内完成）
- 📁 文件管理（浏览/搜索/操作）
- 🤖 智能整理（AI 分类/重复检测）
- 🔄 分享转存（一键转存/批量操作）
- ⬇️ 离线下载（磁力/种子/HTTP）

## 📦 技术栈

- Node.js >= 18.0.0
- Axios (HTTP 客户端)
- Jest (测试框架)
- ESLint + Prettier (代码质量)

## 📊 统计

- 代码行数：$(find lib -name "*.js" -exec cat {} \; | wc -l)
- 测试文件：$(find test -name "*.test.js" | wc -l)
- 文档文件：$(find docs -name "*.md" | wc -l)

## 🔗 链接

- GitHub: https://github.com/sukris/115-skills
- ClawHub: https://clawhub.ai/skills/115-skills

## 📝 更新日志

初始版本发布！

EOF

echo "✅ 发布完成！"
echo ""
echo "📦 版本：v$VERSION"
echo "🌐 GitHub: https://github.com/sukris/115-skills"
echo "📤 ClawHub: 请手动发布或检查上方输出"
