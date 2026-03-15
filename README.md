# 115 Skills

> 115 网盘智能管理 Skill - 让聊天成为管理网盘的最优雅方式

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/sukris/115-skills)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 📖 简介

**115 Skills** 是一个功能强大的 OpenClaw Skill，让你在聊天中轻松管理 115 网盘。无需浏览器，无需复杂操作，一切都在对话中完成。

## 📜 规范标准

本项目遵循以下开放标准：

- **[Claude Code Skills](https://code.claude.com/docs/zh-CN/skills)** - Claude Code 的 Skill 扩展规范
- **[Agent Skills](https://agentskills.io)** - 跨 AI 工具的开放 Skill 标准

### 兼容性

| 平台 | 状态 | 说明 |
|------|------|------|
| Claude Code | ✅ 完全兼容 | 遵循 Skills 规范 |
| Gemini CLI | ✅ 兼容 | 遵循 Agent Skills 标准 |
| Cursor | ✅ 兼容 | 遵循 Agent Skills 标准 |
| OpenHands | ✅ 兼容 | 遵循 Agent Skills 标准 |
| 其他支持 Agent Skills 的平台 | ✅ 兼容 | 跨平台可用 |

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

### 安装方式

#### 方式 1：ClawHub 安装（推荐）⭐

```bash
# 通过 ClawHub 一键安装
npx clawhub --workdir ~/.openclaw --dir skills install 115-skills
```

#### 方式 2：Git 克隆安装

```bash
# 克隆仓库
git clone https://github.com/sukris/115-skills.git ~/.openclaw/skills/115-skills

# 进入目录安装依赖
cd ~/.openclaw/skills/115-skills
npm install --production
```

#### 方式 3：手动下载安装

```bash
# 下载 ZIP 包
curl -L https://github.com/sukris/115-skills/archive/refs/heads/main.zip -o 115-skills.zip

# 解压到 Skills 目录
unzip 115-skills.zip -d ~/.openclaw/skills/
mv ~/.openclaw/skills/115-skills-main ~/.openclaw/skills/115-skills

# 安装依赖
cd ~/.openclaw/skills/115-skills
npm install --production
```

#### 方式 4：npm 全局安装

```bash
# 全局安装（如支持）
npm install -g 115-skills

# 链接到 OpenClaw
ln -s $(npm root -g)/115-skills ~/.openclaw/skills/115-skills
```

#### 方式 5：Docker 安装（隔离环境）

```bash
# 拉取镜像
docker pull sukris/115-skills:latest

# 运行容器
docker run -d \
  --name 115-skills \
  -v ~/.openclaw:/app/data \
  sukris/115-skills:latest
```

---

### 各平台安装指南

#### 🤖 Claude Code

```bash
# 1. 安装到 Skills 目录
npx clawhub --workdir ~/.openclaw --dir skills install 115-skills

# 2. 验证安装
ls ~/.openclaw/skills/115-skills/.claude/skills/115-skills/SKILL.md

# 3. 重启 Claude Code
claude
```

**使用示例：**
```
/115 容量
/115 文件
/115 搜索 工作报告
```

---

#### 💎 Gemini CLI

```bash
# 1. 找到 Gemini CLI Skills 目录
# 通常为：~/.gemini-cli/skills/ 或 ~/.config/gemini-cli/skills/

# 2. 安装 Skill
git clone https://github.com/sukris/115-skills.git ~/.gemini-cli/skills/115-skills

# 3. 安装依赖
cd ~/.gemini-cli/skills/115-skills
npm install --production

# 4. 在 gemini-cli 配置中启用
# 编辑 ~/.gemini-cli/config.json，添加：
{
  "skills": ["115-skills"]
}
```

**使用示例：**
```
@115 查看我的文件
@115 转存 https://115.com/s/abc123
```

---

#### 🖥️ Cursor

```bash
# 1. Cursor 使用 Agent Skills 标准
# 找到 Cursor Agent 目录：~/.cursor/agents/

# 2. 创建 Agent 配置
mkdir -p ~/.cursor/agents/115-skills
cd ~/.cursor/agents/115-skills

# 3. 克隆并安装
git clone https://github.com/sukris/115-skills.git .
npm install --production

# 4. 在 Cursor 中启用
# 设置 → AI → Agents → 启用 115-skills
```

**使用示例：**
```
@115 帮我整理文件
@115 下载这个磁力链接
```

---

#### 🤗 OpenHands

```bash
# 1. OpenHands 使用 Agent Skills 标准
# 找到 Skills 目录：~/.openhands/skills/

# 2. 安装 Skill
git clone https://github.com/sukris/115-skills.git ~/.openhands/skills/115-skills

# 3. 安装依赖
cd ~/.openhands/skills/115-skills
npm install --production

# 4. 在 OpenHands 配置中注册
# 编辑 ~/.openhands/config.yaml，添加：
skills:
  - name: 115-skills
    path: ~/.openhands/skills/115-skills
```

**使用示例：**
```
使用 115-skills 查看我的文件
使用 115-skills 转存这个分享
```

---

#### 🌐 其他支持 Agent Skills 的平台

```bash
# 通用安装步骤：

# 1. 找到平台的 Skills/Agents 目录
# 常见位置：
# - ~/.agents/skills/
# - ~/.config/{platform}/skills/
# - ~/Documents/{platform}/skills/

# 2. 克隆仓库
git clone https://github.com/sukris/115-skills.git {skills-dir}/115-skills

# 3. 安装依赖
cd {skills-dir}/115-skills
npm install --production

# 4. 在平台配置中启用 Skill
```

---

### 验证安装

```bash
# 检查安装目录
ls -la ~/.openclaw/skills/115-skills/

# 检查依赖
cd ~/.openclaw/skills/115-skills
npm ls

# 运行测试
npm test

# 检查 Skill 配置
cat .claude/skills/115-skills/SKILL.md
```

---

### 使用示例

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
- [技能规范](.claude/skills/115-skills/SKILL.md)
- [使用示例](.claude/skills/115-skills/examples.md)
- [评审报告](docs/COMPLETE_REVIEW.md)
- [CI/CD 指南](docs/CI-CD 使用指南.md)
- [测试报告](scripts/test-report.json)

---

## ❓ 常见问题

### 安装问题

#### Q1: 安装时提示 "permission denied"

**解决方案：**
```bash
# 方法 1：使用 sudo
sudo npx clawhub --workdir ~/.openclaw --dir skills install 115-skills

# 方法 2：修改目录权限
chmod -R 755 ~/.openclaw/skills

# 方法 3：使用当前用户安装
npx clawhub --workdir $HOME/.openclaw --dir skills install 115-skills
```

#### Q2: npm install 失败

**解决方案：**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

#### Q3: 找不到 Skill 目录

**解决方案：**
```bash
# 检查 OpenClaw 工作目录
echo $HOME/.openclaw

# 手动创建 Skills 目录
mkdir -p ~/.openclaw/skills

# 验证目录存在
ls -la ~/.openclaw/skills/
```

---

### 使用问题

#### Q4: 扫码登录失败

**可能原因：**
- Cookie 已过期
- 网络问题
- 115 服务器问题

**解决方案：**
```bash
# 清除旧 Cookie
rm ~/.openclaw/skills/115-skills/.secrets/cookies/cookie.json

# 重新登录
/115 登录
```

#### Q5: 文件操作失败

**可能原因：**
- 文件 ID 不存在
- 权限不足
- API 限流

**解决方案：**
1. 刷新文件列表获取最新 ID
2. 检查是否为自己的文件
3. 等待几分钟后重试

#### Q6: 分享转存失败

**可能原因：**
- 分享链接已失效
- 提取码错误
- 分享者取消了分享

**解决方案：**
1. 确认分享链接有效
2. 检查提取码是否正确
3. 联系分享者重新分享

---

### 兼容性问题

#### Q7: 在 Cursor 中无法使用

**解决方案：**
```bash
# 确保使用 Agent Skills 格式
# 检查 ~/.cursor/agents/115-skills/ 目录存在

# 重启 Cursor
# 设置 → AI → Agents → 重新加载
```

#### Q8: 在 Gemini CLI 中命令不识别

**解决方案：**
```bash
# 检查配置文件中是否启用 Skill
# ~/.gemini-cli/config.json 应包含：
{
  "skills": ["115-skills"]
}

# 重启 Gemini CLI
```

#### Q9: 不同平台命令格式不同？

**说明：**
| 平台 | 命令前缀 | 示例 |
|------|---------|------|
| Claude Code | `/115` | `/115 容量` |
| Gemini CLI | `@115` | `@115 容量` |
| Cursor | `@115` | `@115 容量` |
| OpenHands | `使用 115-skills` | `使用 115-skills 容量` |

---

### 性能问题

#### Q10: 响应速度慢

**可能原因：**
- 网络延迟
- 文件数量过多
- API 限流

**解决方案：**
1. 检查网络连接
2. 使用分页浏览大目录
3. 避免短时间内大量请求

#### Q11: 内存占用高

**解决方案：**
```bash
# 清理会话缓存
rm ~/.openclaw/skills/115-skills/.data/sessions/*.json

# 重启 AI 助手
```

---

### 安全问题

#### Q12: Cookie 安全吗？

**说明：**
- ✅ Cookie 加密存储在本地
- ✅ 不会上传到任何服务器
- ✅ 仅用于 115 API 调用
- ✅ 可设置过期时间自动失效

**最佳实践：**
```bash
# 定期更新 Cookie
/115 登录

# 清除旧 Cookie
rm ~/.openclaw/skills/115-skills/.secrets/cookies/cookie.json
```

#### Q13: 可以开源吗？

**说明：**
- ✅ 代码完全开源（MIT 许可）
- ⚠️ Cookie 等敏感信息不要提交
- ⚠️ 使用 `.secrets/` 目录隔离敏感数据

---

## 🔧 故障排除

### 诊断工具

```bash
# 运行诊断脚本
cd ~/.openclaw/skills/115-skills
node scripts/diagnose.js

# 检查 API 连接
node scripts/test-api.js

# 验证 Cookie 有效性
node scripts/verify-cookie.js
```

### 日志查看

```bash
# 查看最近日志
tail -f ~/.openclaw/skills/115-skills/logs/*.log

# 查看错误日志
cat ~/.openclaw/skills/115-skills/logs/error.log
```

### 重置 Skill

```bash
# 完全重置（会清除所有数据）
rm -rf ~/.openclaw/skills/115-skills/.data
rm -rf ~/.openclaw/skills/115-skills/.secrets

# 重新安装
npx clawhub --workdir ~/.openclaw --dir skills reinstall 115-skills
```

---

## 📞 获取帮助

如果以上方法无法解决问题：

1. **查看 Issue**: https://github.com/sukris/115-skills/issues
2. **提交 Issue**: 提供详细错误信息和日志
3. **加入讨论**: GitHub Discussions
4. **邮件联系**: sukris@github.com

**提交 Issue 时请提供：**
- 平台名称和版本
- Node.js 版本
- 错误日志
- 复现步骤

## 🛠️ 开发

### 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |
| Git | 2.0 | 最新 |

### 检查环境

```bash
# 检查 Node.js 版本
node --version  # 应 >= v18.0.0

# 检查 npm 版本
npm --version   # 应 >= 9.0.0

# 检查 Git
git --version
```

### 安装依赖

```bash
# 进入项目目录
cd 115-skills

# 安装所有依赖
npm install

# 或仅安装生产依赖
npm install --production
```

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage

# 监听模式（开发时使用）
npm run test:watch

# 运行单个测试文件
npm test -- test/files/operations.test.js
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# Prettier 格式化
npm run format
```

### 构建项目

```bash
# 构建（如无编译步骤则跳过）
npm run build

# 发布新版本
npm run release
```

## 📋 项目结构

```
115-skills/
├── .claude/                      # Claude Code 配置
│   └── skills/                   # Skill 定义（遵循 Claude Code Skills 规范）
│       └── 115-skills/
│           ├── SKILL.md          # Skill 主入口（YAML frontmatter + 说明）
│           ├── reference.md      # API 参考文档
│           ├── examples.md       # 使用示例
│           └── scripts/
│               └── run.sh        # 执行脚本
├── lib/                          # 核心代码库
│   ├── auth.js                   # 扫码登录模块
│   ├── session.js                # 会话管理模块
│   ├── utils/
│   │   └── helpers.js            # 通用工具函数
│   ├── storage/
│   │   └── cookie-store.js       # Cookie 加密存储
│   ├── client/
│   │   └── http-client.js        # HTTP 请求封装（速率限制/重试）
│   ├── files/
│   │   ├── browser.js            # 文件浏览 API
│   │   ├── operations.js         # 文件操作 API
│   │   └── transfer.js           # 上传下载 API
│   ├── share/
│   │   └── transfer.js           # 分享转存 API
│   ├── lixian/
│   │   └── download.js           # 离线下载 API
│   └── organizer/
│       ├── classifier.js         # 文件分类器
│       └── smart-organizer.js    # 智能整理引擎
├── test/                         # 单元测试（Jest）
│   ├── auth.test.js              # 认证模块测试
│   ├── session.test.js           # 会话管理测试
│   ├── client/
│   │   └── http-client.test.js   # HTTP 客户端测试
│   ├── organizer/
│   │   └── classifier.test.js    # 分类器测试
│   └── storage/
│       └── cookie-store.test.js  # Cookie 存储测试
├── docs/                         # 项目文档
│   ├── COMPLETE_REVIEW.md        # 完整评审报告
│   ├── CODE_REVIEW.md            # 代码评审
│   ├── SKILL_SPEC_GUIDE.md       # Skill 规范指南
│   ├── user/                     # 用户文档
│   │   └── USER_GUIDE.md         # 用户手册
│   └── api/                      # API 文档
│       └── SKILL_API.md          # API 参考
├── index.js                      # Skill 主入口
├── package.json                  # 项目配置
└── README.md                     # 项目说明
```

### 目录说明

| 目录 | 用途 | 规范参考 |
|------|------|---------|
| `.claude/skills/` | Skill 定义 | Claude Code Skills |
| `lib/` | 核心业务逻辑 | Agent Skills |
| `test/` | 单元测试 | Jest |
| `docs/` | 项目文档 | - |

## 🤝 贡献

欢迎贡献代码！请提交 Issue 或 Pull Request。

## 📄 许可证

MIT License

## 🔗 链接

- [GitHub 仓库](https://github.com/sukris/115-skills)
- [问题反馈](https://github.com/sukris/115-skills/issues)
- [ClawHub 页面](https://clawhub.ai/skills/115-skills)

## 📜 规范参考

- **[Claude Code Skills 官方文档](https://code.claude.com/docs/zh-CN/skills)**
  - Skill 目录结构
  - YAML frontmatter 配置
  - 调用控制（disable-model-invocation）
  - 动态上下文注入

- **[Agent Skills 开放标准](https://agentskills.io)**
  - 跨平台 Skill 格式
  - 工具定义规范
  - 命令注册机制
  - 兼容性指南

---

**Made with ❤️ by 115 Skills Team**
