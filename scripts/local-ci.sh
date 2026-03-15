#!/bin/bash

# 115 Skills 本地 CI 测试脚本
# 在推送前本地运行，确保 CI 会通过

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║          115 Skills 本地 CI 测试                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤计数
STEP=0
TOTAL=5

# 函数：运行步骤
run_step() {
    STEP=$((STEP + 1))
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "步骤 $STEP/$TOTAL: $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 函数：检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 错误：$1 未安装${NC}"
        echo "请运行：npm install -g $1"
        exit 1
    fi
}

# 检查依赖
run_step "检查依赖"
check_command node
check_command npm

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"

# 安装依赖
run_step "安装依赖"
echo "正在安装..."
npm ci --silent 2>/dev/null || npm install --silent
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 代码检查
run_step "代码质量检查 (ESLint)"
if npm run lint 2>&1 | tee /tmp/lint.log; then
    echo -e "${GREEN}✅ ESLint 检查通过${NC}"
else
    echo -e "${RED}❌ ESLint 检查失败${NC}"
    echo "请修复以下问题："
    grep "error" /tmp/lint.log | head -10
    exit 1
fi

# 运行测试
run_step "单元测试 (Jest)"
if npm test 2>&1 | tee /tmp/test.log; then
    echo -e "${GREEN}✅ 所有测试通过${NC}"
else
    echo -e "${RED}❌ 测试失败${NC}"
    echo "失败的测试："
    grep "●" /tmp/test.log | head -10
    exit 1
fi

# 检查覆盖率
run_step "检查测试覆盖率"
COVERAGE=$(grep "All files" /tmp/test.log | awk '{print $2}' | sed 's/%//')
if [ -z "$COVERAGE" ]; then
    COVERAGE=$(grep "All files" /tmp/test.log | awk '{print $3}' | sed 's/%//')
fi

if [ -n "$COVERAGE" ]; then
    echo "当前覆盖率：$COVERAGE%"
    if (( $(echo "$COVERAGE < 80" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}⚠️  覆盖率低于 80% (${COVERAGE}%)${NC}"
        echo "建议补充测试以提高覆盖率"
    else
        echo -e "${GREEN}✅ 覆盖率达标 (${COVERAGE}%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  无法解析覆盖率${NC}"
fi

# 格式化检查
run_step "代码格式化检查 (Prettier)"
if npx prettier --check 'lib/**/*.js' 'test/**/*.js' index.js 2>&1 | tee /tmp/prettier.log; then
    echo -e "${GREEN}✅ 代码格式化检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  代码格式需要调整${NC}"
    echo "运行以下命令自动修复："
    echo "  npm run format"
fi

# 总结
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    本地 CI 完成                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ 所有检查通过！可以安全推送代码${NC}"
echo ""
echo "下一步："
echo "  1. git add ."
echo "  2. git commit -m '你的提交信息'"
echo "  3. git push"
echo ""
echo "推送后，GitHub Actions 会自动运行相同的检查"
echo ""
