# 115 Skills CI/CD 使用指南

> **配置时间：** 2026-03-15  
> **CI 平台：** GitHub Actions

---

## 📋 目录

1. [CI/CD 配置概览](#cicd-配置概览)
2. [本地测试](#本地测试)
3. [GitHub Actions 工作流](#github-actions-工作流)
4. [使用指南](#使用指南)
5. [故障排查](#故障排查)

---

## 🎯 CI/CD 配置概览

### 工作流文件

```
.github/workflows/
├── test.yml              # 单元测试（Node 18/20/22）
├── code-quality.yml      # 代码质量检查
└── release.yml           # 发布流程
```

### 触发条件

| 工作流 | 触发条件 | 说明 |
|--------|---------|------|
| **test.yml** | push/pr | 推送或 PR 到 main/develop |
| **code-quality.yml** | push/pr | 代码质量检查 |
| **release.yml** | tag push | 推送版本标签 |

---

## 💻 本地测试

### 运行完整本地 CI

```bash
# 方式 1：使用脚本（推荐）
npm run local-ci

# 方式 2：直接运行脚本
bash scripts/local-ci.sh
```

**脚本会执行：**
1. ✅ 检查 Node.js 和 npm 版本
2. ✅ 安装依赖
3. ✅ 运行 ESLint 代码检查
4. ✅ 运行 Jest 单元测试
5. ✅ 检查测试覆盖率（≥80%）
6. ✅ 检查代码格式化

### 单独运行检查

```bash
# 只运行测试
npm test

# 监听模式（开发时用）
npm run test:watch

# 只运行代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 格式化代码
npm run format

# CI 模式测试（更快）
npm run test:ci
```

### 提交前检查

```bash
# 预提交钩子（自动运行）
npm run precommit
```

---

## 🚀 GitHub Actions 工作流

### 1. 单元测试 (test.yml)

**触发：** push 或 pull request

**执行步骤：**
```yaml
1. 检出代码
2. 设置 Node.js (18/20/22 三个版本)
3. 安装依赖 (npm ci)
4. 运行 ESLint
5. 运行 Jest 测试
6. 上传覆盖率到 Codecov
```

**配置多 Node 版本测试：**
- Node 18.x (LTS)
- Node 20.x (LTS)
- Node 22.x (Current)

### 2. 代码质量 (code-quality.yml)

**触发：** push 或 pull request

**执行步骤：**
```yaml
1. 检出代码
2. 设置 Node.js 20
3. 安装依赖
4. 运行 ESLint
5. 运行 Prettier 检查
6. 生成覆盖率报告
7. 检查覆盖率阈值 (≥80%)
```

### 3. 发布流程 (release.yml)

**触发：** 推送版本标签 (v*)

**执行步骤：**
```yaml
1. 检出代码
2. 设置 Node.js 20
3. 安装依赖
4. 运行测试
5. 运行代码检查
6. 创建 GitHub Release
7. 上传发布资产
```

---

## 📖 使用指南

### 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 开发时运行监听测试
npm run test:watch

# 3. 提交前运行本地 CI
npm run local-ci

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 5. 推送到远程
git push origin feature/your-feature

# 6. 创建 Pull Request
# GitHub Actions 会自动运行测试
```

### 发布流程

```bash
# 1. 确保所有测试通过
npm run local-ci

# 2. 更新版本号 (package.json)
# 例如：1.0.0 → 1.1.0

# 3. 提交更改
git add .
git commit -m "chore: release v1.1.0"

# 4. 创建标签
git tag -a v1.1.0 -m "Release v1.1.0"

# 5. 推送标签（触发发布工作流）
git push origin v1.1.0

# 6. GitHub Actions 会自动：
#    - 运行测试
#    - 创建 Release
#    - 上传资产
```

### 查看 CI 状态

1. **GitHub Actions 页面：**
   - 访问：https://github.com/sukris/115-skills/actions
   - 查看所有工作流运行状态

2. **PR 检查：**
   - 在 Pull Request 页面查看检查状态
   - 所有检查必须通过才能合并

3. **徽章状态：**
   ```markdown
   [![Tests](https://github.com/sukris/115-skills/actions/workflows/test.yml/badge.svg)](https://github.com/sukris/115-skills/actions/workflows/test.yml)
   [![Code Quality](https://github.com/sukris/115-skills/actions/workflows/code-quality.yml/badge.svg)](https://github.com/sukris/115-skills/actions/workflows/code-quality.yml)
   ```

---

## 🔧 故障排查

### 问题 1：本地 CI 失败

**症状：** `npm run local-ci` 失败

**解决：**
```bash
# 查看详细错误
npm run local-ci 2>&1 | tee /tmp/ci.log

# 检查具体失败步骤
cat /tmp/ci.log | grep -A 5 "error"
```

### 问题 2：测试覆盖率不足

**症状：** 覆盖率 < 80%

**解决：**
```bash
# 查看覆盖率报告
npm test -- --coverage

# 打开 HTML 报告
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux

# 补充低覆盖率模块的测试
```

### 问题 3：ESLint 错误

**症状：** 代码检查失败

**解决：**
```bash
# 自动修复
npm run lint:fix

# 手动修复剩余问题
npm run lint
```

### 问题 4：GitHub Actions 失败

**症状：** CI 在 GitHub 上失败

**解决：**
1. 访问 Actions 页面查看日志
2. 下载日志分析错误
3. 本地复现问题
4. 修复后重新推送

**查看日志：**
```bash
# GitHub Actions 页面
https://github.com/sukris/115-skills/actions

# 点击失败的工作流
# 查看详细日志
```

### 问题 5：Node 版本不兼容

**症状：** 特定 Node 版本测试失败

**解决：**
```bash
# 本地切换 Node 版本测试
nvm use 18
npm test

nvm use 20
npm test

nvm use 22
npm test
```

---

## 📊 覆盖率要求

### 当前状态

| 模块 | 覆盖率 | 目标 | 状态 |
|------|--------|------|------|
| 整体 | >85% | 80% | ✅ |
| context | 88.6% | 80% | ✅ |
| parser | 94.3% | 80% | ✅ |
| recommender | 96.3% | 80% | ✅ |
| error | 90.2% | 80% | ✅ |
| ui | 85.5% | 80% | ✅ |
| share | 51.5% | 80% | ⚠️ |
| files | 70.2% | 80% | ⚠️ |
| lixian | 70.5% | 80% | ⚠️ |
| organizer | 70.8% | 80% | ⚠️ |

### 提升覆盖率

```bash
# 查看哪些代码未覆盖
npm test -- --coverage --collectCoverageFrom='lib/share/**/*.js'

# 补充测试
# 编辑 test/share/*.test.js
```

---

## 🎯 最佳实践

### 1. 提交前必做

- ✅ 运行 `npm run local-ci`
- ✅ 确保所有测试通过
- ✅ 确保覆盖率达标
- ✅ 确保代码格式化

### 2. PR 规范

- ✅ 描述清晰的功能说明
- ✅ 关联相关 Issue
- ✅ 添加必要的测试
- ✅ 更新文档

### 3. 版本管理

- ✅ 使用语义化版本 (SemVer)
- ✅ 每个版本打标签
- ✅ 编写变更日志
- ✅ 发布前完整测试

### 4. 代码质量

- ✅ 遵循 ESLint 规则
- ✅ 保持高测试覆盖率
- ✅ 编写清晰的注释
- ✅ 使用有意义的命名

---

## 📝 配置自定义

### 修改覆盖率阈值

编辑 `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 添加新的工作流

创建 `.github/workflows/custom.yml`:
```yaml
name: Custom Workflow

on:
  push:
    branches: [ main ]

jobs:
  custom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # 添加你的步骤
```

### 配置通知

在 `.github/workflows/test.yml` 中添加:
```yaml
notify:
  on:
    failure:
      - email
      - slack
```

---

## 🔗 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Jest 文档](https://jestjs.io/)
- [ESLint 文档](https://eslint.org/)
- [Codecov 文档](https://docs.codecov.com/)

---

**更新时间：** 2026-03-15 19:30 GMT+8
