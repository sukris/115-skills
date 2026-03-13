# 115 Cloud Master 项目规则

> 项目版本：v1.0.0  
> 创建日期：2026-03-14  
> 最后更新：2026-03-14

---

## 📋 目录

1. [项目概述](#项目概述)
2. [团队角色](#团队角色)
3. [开发规范](#开发规范)
4. [代码标准](#代码标准)
5. [提交流程](#提交流程)
6. [质量要求](#质量要求)
7. [沟通机制](#沟通机制)

---

## 项目概述

### 项目名称
**115 Cloud Master** - 115 网盘智能管理 Skill

### 项目目标
创建一个高质量的 OpenClaw Skill，让用户在聊天中优雅地管理 115 网盘。

### 核心功能
- 🔐 扫码登录（免浏览器）
- 📁 文件管理（浏览/上传/下载/操作）
- 🤖 智能整理（AI 分类/重复检测）
- 🔄 分享转存（一键转存/批量操作）
- ⬇️ 离线下载（磁力/种子/HTTP）

### 技术栈
- **运行时**: Node.js 18+
- **语言**: JavaScript (ES2022)
- **测试**: Jest
- **代码质量**: ESLint + Prettier
- **版本控制**: Git + GitHub

---

## 团队角色

### Sub-Agent 团队

| Agent | 职责 | 权限 |
|-------|------|------|
| **DevBot** | 代码开发 | 编写、修改代码 |
| **TestBot** | 测试验证 | 运行测试、验证 Bug |
| **DocBot** | 文档管理 | 编写、更新文档 |
| **ReviewBot** | 代码审查 | 审查代码、批准合并 |
| **ReleaseBot** | 发布管理 | 打包、发布 |
| **Coordinator** | 项目协调 | 任务分配、进度跟踪 |

### 人类角色

| 角色 | 职责 |
|------|------|
| **Project Owner** | 需求确认、最终决策 |
| **Developer** | 代码开发（可由 DevBot 辅助） |
| **Reviewer** | 代码审查（可由 ReviewBot 辅助） |

---

## 开发规范

### 目录结构规范
```
115-cloud-master/
├── lib/           # 核心代码
├── storage/       # 存储模块
├── utils/         # 工具函数
├── config/        # 配置文件
├── test/          # 测试文件
├── docs/          # 文档
└── tasks/         # 任务文档
```

### 文件命名规范
- **代码文件**: `kebab-case.js` (例：`cookie-store.js`)
- **测试文件**: `*.test.js` (例：`cookie-store.test.js`)
- **文档文件**: `*.md` (例：`USER_GUIDE.md`)

### 变量命名规范
```javascript
// 常量
const MAX_RETRY_COUNT = 3;

// 变量
let currentTask = null;

// 函数
async function fetchFileList() {}

// 类
class CookieStore {}

// 私有成员
const _internalCache = {};
```

---

## 代码标准

### JavaScript 规范

```javascript
// ✅ 推荐
async function uploadFile(filePath, options = {}) {
  const { targetDir, onProgress } = options;
  
  try {
    const result = await client.upload(filePath, targetDir);
    onProgress?.(result);
    return result;
  } catch (error) {
    logger.error('Upload failed', error);
    throw error;
  }
}

// ❌ 避免
function upload(f, o) {
  let d = o.d;
  return client.up(f, d).then(r => r).catch(e => {
    console.log(e);
    throw e;
  });
}
```

### 错误处理规范

```javascript
// ✅ 推荐
class TransferError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'TransferError';
    this.code = code;
    this.details = details;
  }
}

try {
  await transferFile(fileId);
} catch (error) {
  if (error.code === 'SPACE_FULL') {
    return '存储空间不足，请清理后重试';
  }
  throw error;
}

// ❌ 避免
try {
  await transferFile(fileId);
} catch (e) {
  console.log(e);
}
```

### 注释规范

```javascript
/**
 * 解析 115 分享码
 * 
 * 支持多种格式：
 * - 纯分享码：abc123
 * - 完整链接：https://115.com/s/abc123
 * - 带提取码：abc123#xyzw
 * 
 * @param {string} shareCode - 分享码或链接
 * @returns {Object} 解析结果
 * @returns {string} return.code - 分享码
 * @returns {string} return.password - 提取码（可选）
 * 
 * @example
 * parseShareCode('https://115.com/s/abc123?password=xyzw')
 * // returns { code: 'abc123', password: 'xyzw' }
 */
function parseShareCode(shareCode) {
  // 实现...
}
```

---

## 提交流程

### Git 提交流程

```bash
# 1. 创建功能分支
git checkout -b feature/task-02.01

# 2. 开发代码
# ... 编写代码 ...

# 3. 运行测试
npm test

# 4. 代码格式化
npm run lint:fix

# 5. 提交代码
git add .
git commit -m "feat(cookie-store): 实现 Cookie 加密存储

- 添加 AES-256 加密
- 实现安全存储到 ~/.openclaw/
- 添加单元测试

Closes TASK-02.01"

# 6. 推送到远程
git push origin feature/task-02.01

# 7. 创建 Pull Request
# GitHub 上创建 PR，请求合并到 develop 分支
```

### Pull Request 模板

```markdown
## 📋 变更说明
[描述本次 PR 的变更内容]

## 🎯 关联任务
- Closes TASK-XX.XX

## ✅ 检查清单
- [ ] 代码通过 ESLint 检查
- [ ] 单元测试覆盖率 > 80%
- [ ] 文档已更新
- [ ] 自测通过

## 🧪 测试说明
[描述如何测试这些变更]

## 📸 截图（如适用）
[相关截图]
```

---

## 质量要求

### 代码质量

| 指标 | 要求 | 检查方式 |
|------|------|----------|
| ESLint | 0 错误 | 自动检查 |
| 测试覆盖率 | > 80% | Jest |
| 代码重复率 | < 5% | SonarQube |
| 函数复杂度 | < 10 | ESLint |
| 文件大小 | < 500 行 | 手动检查 |

### 文档质量

| 文档类型 | 要求 | 负责人 |
|----------|------|--------|
| README | 完整、清晰 | DocBot |
| API 文档 | 100% 覆盖 | DocBot |
| 用户手册 | 易懂、有示例 | DocBot |
| 更新日志 | 每次发布更新 | ReleaseBot |

### 测试质量

| 测试类型 | 覆盖率 | 执行时机 |
|----------|--------|----------|
| 单元测试 | > 80% | 每次提交 |
| 集成测试 | > 60% | 每次 PR |
| E2E 测试 | 核心流程 | 发布前 |

---

## 沟通机制

### 日常沟通

| 场景 | 方式 | 频率 |
|------|------|------|
| 任务分配 | 任务卡片 | 每日 |
| 进度同步 | 状态更新 | 每日 |
| 问题讨论 | 评论/会议 | 按需 |
| 代码审查 | PR 评论 | 提交后 24h 内 |

### 会议制度

| 会议 | 时间 | 参与者 | 内容 |
|------|------|--------|------|
| 每日站会 | 每天 10:00 | 全体 Agent | 进度同步、问题反馈 |
| 周会 | 每周一 14:00 | 全体 | 周计划、周总结 |
| 评审会 | 按需 | 相关 Agent | 代码审查、设计评审 |

### 问题上报流程

```
发现问题
    ↓
记录到 Issue
    ↓
分配负责人
    ↓
优先级评估 (P0-P3)
    ↓
修复开发
    ↓
测试验证
    ↓
关闭 Issue
```

---

## 附录

### 常用命令

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建
npm run build

# 发布
npm run release
```

### 相关链接

- [GitHub 仓库](https://github.com/sukris/115-cloud-master)
- [项目看板](https://github.com/sukris/115-cloud-master/projects)
- [问题追踪](https://github.com/sukris/115-cloud-master/issues)
- [CI/CD](https://github.com/sukris/115-cloud-master/actions)

---

**文档版本**: v1.0.0  
**维护者**: Coordinator  
**最后更新**: 2026-03-14
