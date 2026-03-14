# 115 Skills API 测试工作流

> **版本：** v1.0  
> **创建日期：** 2026-03-14  
> **执行方式：** 自动化脚本 + 人工审核

---

## 📋 目录

1. [工作流概述](#工作流概述)
2. [阶段 1: 准备](#阶段 1-准备)
3. [阶段 2: 执行](#阶段 2-执行)
4. [阶段 3: 清理](#阶段 3-清理)
5. [阶段 4: 报告](#阶段 4-报告)
6. [异常处理](#异常处理)

---

## 🔄 工作流概述

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  阶段 1: 准备  │ ──→ │  阶段 2: 执行  │ ──→ │  阶段 3: 清理  │ ──→ │  阶段 4: 报告  │
│  (15 分钟)    │     │  (45 分钟)    │     │  (15 分钟)    │     │  (15 分钟)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ↓                   ↓                   ↓                   ↓
  环境检查            执行测试            删除数据            生成报告
  Cookie 验证          记录结果            确认清理            提交审核
```

---

## 阶段 1: 准备

### 1.1 环境检查

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
# 检查 Node.js 版本
node --version
# 预期：v18.0.0 或更高

# 检查项目依赖
npm ls
# 预期：无 missing 依赖

# 检查 Cookie 文件
cat .data/cookie.json
# 预期：文件存在，JSON 格式正确
```

**检查清单：**
- [ ] Node.js >= 18.0.0
- [ ] 依赖已安装
- [ ] Cookie 文件存在
- [ ] 网络连接正常

### 1.2 Cookie 验证

**执行人：** AI Assistant  
**预计耗时：** 3 分钟

```bash
# 运行 Cookie 验证
node scripts/api-full-test.js --verify-cookie
```

**验证项：**
- [ ] Cookie 格式正确
- [ ] Cookie 未过期
- [ ] 能获取账户信息
- [ ] 能获取存储空间

### 1.3 创建测试目录

**执行人：** AI Assistant  
**预计耗时：** 2 分钟

```bash
# 创建测试目录
node scripts/api-full-test.js --create-test-dir
```

**目录结构：**
```
/
└── 115-skills-test-20260314/
    ├── 01_upload_test/
    ├── 02_move_test/
    ├── 03_copy_test/
    ├── 04_rename_test/
    ├── 05_share_test/
    ├── 06_lixian_test/
    └── 07_cleanup_test/
```

### 1.4 准备测试数据

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
# 生成测试文件
node scripts/api-full-test.js --prepare-data
```

**测试文件：**
- `test-upload-small.txt` (1KB)
- `test-upload-medium.txt` (5MB)
- 其他测试数据

### 阶段 1 完成标志

```
✅ 环境检查通过
✅ Cookie 验证通过
✅ 测试目录创建成功
✅ 测试数据准备完成
```

---

## 阶段 2: 执行

### 2.1 L0 测试 - Cookie 有效性

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
node scripts/api-full-test.js --level L0
```

**测试用例：**
- [ ] L0-01: Cookie 文件存在性检查
- [ ] L0-02: Cookie 格式验证
- [ ] L0-03: Cookie 有效期检查
- [ ] L0-04: 账户信息获取
- [ ] L0-05: 存储空间查询

**通过标准：** 5/5 通过

### 2.2 L1 测试 - API 接口

**执行人：** AI Assistant  
**预计耗时：** 25 分钟

```bash
node scripts/api-full-test.js --level L1
```

**测试模块：**

| 模块 | 用例数 | 预计时间 |
|------|--------|---------|
| 🔐 认证 | 3 | 3 分钟 |
| 📁 浏览 | 4 | 5 分钟 |
| 📁 操作 | 5 | 8 分钟 |
| 📁 传输 | 3 | 5 分钟 |
| 🔄 分享 | 3 | 3 分钟 |
| ⬇️ 离线 | 3 | 3 分钟 |

**通过标准：** ≥90% 通过

### 2.3 L2 测试 - 模块集成

**执行人：** AI Assistant  
**预计耗时：** 10 分钟

```bash
node scripts/api-full-test.js --level L2
```

**测试用例：**
- [ ] L2-INT-01: 上传后浏览
- [ ] L2-INT-02: 创建后移动
- [ ] L2-INT-03: 分享后转存

**通过标准：** 3/3 通过

### 2.4 L3 测试 - 业务流程

**执行人：** AI Assistant  
**预计耗时：** 10 分钟

```bash
node scripts/api-full-test.js --level L3
```

**测试用例：**
- [ ] L3-FLOW-01: 完整上传流程
- [ ] L3-FLOW-02: 文件管理流程
- [ ] L3-FLOW-03: 分享转存流程

**通过标准：** 3/3 通过

### 阶段 2 完成标志

```
✅ L0 测试完成 (5/5)
✅ L1 测试完成 (≥90%)
✅ L2 测试完成 (3/3)
✅ L3 测试完成 (3/3)
✅ 测试日志已保存
```

---

## 阶段 3: 清理

### 3.1 删除测试文件

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
node scripts/cleanup-test-data.js --files
```

**删除内容：**
- 所有 `test-upload-*` 文件
- 所有测试生成的文件

### 3.2 删除测试目录

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
node scripts/cleanup-test-data.js --directories
```

**删除内容：**
- `01_upload_test/`
- `02_move_test/`
- `03_copy_test/`
- `04_rename_test/`
- `05_share_test/`
- `06_lixian_test/`
- `07_cleanup_test/`

### 3.3 删除根测试目录

**执行人：** AI Assistant  
**预计耗时：** 3 分钟

```bash
node scripts/cleanup-test-data.js --root
```

**删除内容：**
- `/115-skills-test-YYYYMMDD/`

### 3.4 确认清理

**执行人：** AI Assistant  
**预计耗时：** 2 分钟

```bash
node scripts/cleanup-test-data.js --verify
```

**验证项：**
- [ ] 测试文件已删除
- [ ] 测试目录已删除
- [ ] 无残留数据

### 阶段 3 完成标志

```
✅ 测试文件已删除
✅ 测试目录已删除
✅ 清理验证通过
```

---

## 阶段 4: 报告

### 4.1 生成测试报告

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
node scripts/api-full-test.js --generate-report
```

**输出文件：**
- `docs/test/TEST_REPORT_API.md` (人类可读)
- `logs/api-test-results.json` (机器可读)
- `logs/api-test-log.txt` (详细日志)

### 4.2 审核测试报告

**执行人：** 小主  
**预计耗时：** 5 分钟

**审核内容：**
- 测试通过率
- 失败用例分析
- 修复建议

### 4.3 提交测试报告

**执行人：** AI Assistant  
**预计耗时：** 5 分钟

```bash
git add docs/test/TEST_REPORT_API.md
git add logs/api-test-results.json
git commit -m "test: API 测试报告 - 2026-03-14"
git push origin develop
```

### 阶段 4 完成标志

```
✅ 测试报告已生成
✅ 测试报告已审核
✅ 测试报告已提交
```

---

## ⚠️ 异常处理

### Cookie 失效

```
症状：L0 测试失败，返回"Cookie 过期"
处理：
1. 暂停测试
2. 提示用户重新登录
3. 用户重新登录后继续
```

### API 限流

```
症状：API 返回 429 错误
处理：
1. 等待 60 秒
2. 重试请求
3. 仍失败则跳过该测试
```

### 网络异常

```
症状：请求超时或连接失败
处理：
1. 重试 3 次（间隔 5 秒）
2. 仍失败则标记为"网络错误"
3. 继续执行其他测试
```

### 测试数据残留

```
症状：清理后仍有测试数据
处理：
1. 执行强制清理
2. 手动确认删除
3. 记录残留数据
```

---

## 📊 工作流状态图

```
[开始]
  ↓
[阶段 1: 准备] ──→ 失败 ──→ [修复问题] ──→ 重试
  ↓ 成功
[阶段 2: 执行] ──→ 失败 ──→ [记录错误] ──→ 继续
  ↓ 完成
[阶段 3: 清理] ──→ 失败 ──→ [强制清理] ──→ 手动确认
  ↓ 成功
[阶段 4: 报告] ──→ 完成
  ↓
[结束]
```

---

## 🔗 相关文档

| 文档 | 位置 |
|------|------|
| 测试计划 | `docs/test/TEST_PLAN.md` |
| 测试用例 | `docs/test/TEST_CASES.md` |
| 测试数据 | `docs/test/test-data.json` |
| 测试报告 | `docs/test/TEST_REPORT_API.md` |

---

**文档版本：** v1.0  
**创建者：** 115 Skills Team  
**创建日期：** 2026-03-14  
**最后更新：** 2026-03-14
