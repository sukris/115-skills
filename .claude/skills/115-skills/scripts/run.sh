#!/bin/bash

# 115 Cloud Master Skill 执行脚本
# 用法：./run.sh [action] [arguments]

set -e

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SKILL_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印帮助
print_help() {
    echo "115 Cloud Master Skill"
    echo ""
    echo "用法：./run.sh [action] [arguments]"
    echo ""
    echo "可用操作:"
    echo "  login           登录 115"
    echo "  files           查看文件列表"
    echo "  search <keyword> 搜索文件"
    echo "  capacity        查看容量"
    echo "  transfer <url>  转存分享"
    echo "  magnet <url>    离线下载"
    echo "  tasks           查看下载任务"
    echo "  organize        智能整理"
    echo "  cleanup         清理建议"
    echo "  help            显示帮助"
    echo ""
    echo "示例:"
    echo "  ./run.sh login"
    echo "  ./run.sh search 工作报告"
    echo "  ./run.sh transfer https://115.com/s/abc123"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误：需要 Node.js >= 18.0.0${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}错误：需要 Node.js >= 18.0.0，当前版本：$(node -v)${NC}"
        exit 1
    fi
}

# 检查依赖
check_deps() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装依赖...${NC}"
        npm install
    fi
}

# 主函数
main() {
    check_node
    check_deps
    
    ACTION="${1:-help}"
    shift || true
    
    case "$ACTION" in
        login)
            node -e "
const Skill115Master = require('./index');
const agent = {
    sendImage: async (img, cap) => console.log('二维码：' + cap),
    sendMessage: async (msg) => console.log(msg)
};
const skill = new Skill115Master(agent);
skill.handle('登录 115').then(console.log).catch(console.error);
"
            ;;
        files)
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('查看文件').then(console.log).catch(console.error);
"
            ;;
        search)
            KEYWORD="$*"
            if [ -z "$KEYWORD" ]; then
                echo -e "${RED}错误：请提供搜索关键词${NC}"
                exit 1
            fi
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('搜索 $KEYWORD').then(console.log).catch(console.error);
"
            ;;
        capacity)
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('容量').then(console.log).catch(console.error);
"
            ;;
        transfer)
            URL="$*"
            if [ -z "$URL" ]; then
                echo -e "${RED}错误：请提供分享链接${NC}"
                exit 1
            fi
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('$URL').then(console.log).catch(console.error);
"
            ;;
        magnet)
            URL="$*"
            if [ -z "$URL" ]; then
                echo -e "${RED}错误：请提供磁力链接${NC}"
                exit 1
            fi
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('$URL').then(console.log).catch(console.error);
"
            ;;
        tasks)
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('下载任务').then(console.log).catch(console.error);
"
            ;;
        organize)
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('整理文件').then(console.log).catch(console.error);
"
            ;;
        cleanup)
            node -e "
const Skill115Master = require('./index');
const agent = {};
const skill = new Skill115Master(agent);
skill.handle('清理建议').then(console.log).catch(console.error);
"
            ;;
        help|--help|-h)
            print_help
            ;;
        *)
            echo -e "${RED}未知操作：$ACTION${NC}"
            print_help
            exit 1
            ;;
    esac
}

main "$@"
