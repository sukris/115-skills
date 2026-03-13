# 115 Cloud Master

> 115 网盘智能管理 Skill - 让聊天成为管理网盘的最优雅方式

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-org/115-cloud-master)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 简介

**115 Cloud Master** 是一个功能强大的 OpenClaw Skill，让你在聊天中轻松管理 115 网盘。无需浏览器，无需复杂操作，一切都在对话中完成。

## ✨ 核心功能

### 🔐 免浏览器登录
- 聊天内扫码登录
- Cookie 自动管理
- 会话持久化

### 📁 文件管理
- 浏览文件列表
- 上传/下载文件
- 移动/复制/删除/重命名
- 多条件搜索

### 🤖 智能整理
- 按类型自动分类
- 按时间自动整理
- AI 智能分类
- 重复文件检测
- 清理建议

### 🔄 分享转存
- 分享码解析（支持多种格式）
- 一键转存全部
- 批量转存
- 创建分享链接

### ⬇️ 离线下载
- 磁力链接下载
- 种子文件下载
- HTTP 下载
- 任务管理

## 🚀 快速开始

### 安装

```bash
# 通过 ClawHub 安装
npx clawhub --workdir ~/.openclaw --dir skills install 115-cloud-master
```

### 使用

```
# 登录
你：登录 115
助手：[发送二维码] 请扫码登录...

# 查看文件
你：查看我的文件
助手：[列出文件列表]

# 转存
你：https://115.com/s/abc123 密码：xyzw
助手：[解析分享] 确认转存？

# 离线下载
你：magnet:?xt=urn:btih:...
助手：[添加下载任务]

# 整理
你：整理文件
助手：[智能分类完成]
```

## 📚 文档

- [用户手册](docs/user/USER_GUIDE.md)
- [API 文档](docs/api/SKILL_API.md)
- [技能规范](.claude/skills/115-cloud-master/SKILL.md)
- [使用示例](.claude/skills/115-cloud-master/examples.md)
- [评审报告](docs/COMPLETE_REVIEW.md)

## 🛠️ 开发

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
npm run format
```

## 📋 项目结构

```
115-cloud-master/
├── index.js                  # Skill 主入口
├── package.json              # 项目配置
├── .claude/skills/           # Skill 规范目录
│   └── 115-cloud-master/
│       ├── SKILL.md          # Skill 主入口
│       ├── reference.md      # API 参考
│       ├── examples.md       # 使用示例
│       └── scripts/run.sh    # 执行脚本
├── lib/                      # 核心代码
│   ├── auth.js               # 扫码登录
│   ├── session.js            # 会话管理
│   ├── utils/
│   │   └── helpers.js        # 通用工具
│   ├── storage/
│   │   └── cookie-store.js   # Cookie 加密存储
│   ├── client/
│   │   └── http-client.js    # HTTP 请求封装
│   ├── files/
│   │   ├── browser.js        # 文件浏览
│   │   ├── operations.js     # 文件操作
│   │   └── transfer.js       # 上传下载
│   ├── share/
│   │   └── transfer.js       # 分享转存
│   ├── lixian/
│   │   └── download.js       # 离线下载
│   └── organizer/
│       ├── classifier.js     # 文件分类
│       └── smart-organizer.js # 智能整理
├── test/                     # 测试文件
│   ├── auth.test.js
│   ├── session.test.js
│   ├── client/
│   │   └── http-client.test.js
│   ├── organizer/
│   │   └── classifier.test.js
│   └── storage/
│       └── cookie-store.test.js
└── docs/                     # 文档
    ├── COMPLETE_REVIEW.md    # 完整评审报告
    ├── CODE_REVIEW.md        # 代码评审
    ├── SKILL_SPEC_GUIDE.md   # Skill 规范
    ├── user/
    │   └── USER_GUIDE.md     # 用户手册
    └── api/
        └── SKILL_API.md      # API 文档
```

## 🤝 贡献

欢迎贡献代码！请提交 Issue 或 Pull Request。

## 📄 许可证

MIT License

## 🔗 链接

- [GitHub 仓库](https://github.com/your-org/115-cloud-master)
- [问题反馈](https://github.com/your-org/115-cloud-master/issues)
- [ClawHub 页面](https://clawhub.ai/skills/115-cloud-master)

---

**Made with ❤️ by 115 Cloud Master Team**
