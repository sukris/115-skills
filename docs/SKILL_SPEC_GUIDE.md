# 115 Cloud Master Skill 规范改进指导

> 改进日期：2026-03-14  
> 参考规范：https://code.claude.com/docs/zh-CN/skills

---

## 一、背景说明

本项目当前形态是 **115 网盘能力代码库**，具备完整的扫码登录、文件管理、离线下载等功能实现，但缺少 **Skill 元数据包装层**，不符合通用 Skills 规范（SKILL.md 体系）。

按 Claude Code Skills 规范，Skill 是一个可被 Claude 自动发现和调度的功能单元，需要：

- 标准目录结构（`.claude/skills/<skill-name>/SKILL.md`）
- YAML frontmatter 配置
- 任务化的可执行提示内容
- 支持参数传递和动态上下文注入

---

## 二、当前项目与 Skill 规范的差距

### 2.1 缺失项

| 规范要求               | 当前状态           | 优先级 |
| ---------------------- | ------------------ | ------ |
| `.claude/skills/` 目录 | 不存在             | P0     |
| `SKILL.md` 入口文件    | 不存在             | P0     |
| YAML frontmatter 配置  | 无                 | P0     |
| 任务化可执行内容       | 代码化，非提示词化 | P1     |
| 参数传递支持           | 代码硬编码         | P1     |
| 动态上下文变量         | 未使用             | P2     |
| 危险操作控制           | 无显式确认         | P1     |
| 支持文件拆分           | 未拆分             | P2     |

### 2.2 代码层遗留问题（影响 Skill 可用性）

这些问题即使加了 SKILL.md 也会导致 Skill 执行失败，必须同步修复：

| 问题                  | 严重度 | 说明                                                               |
| --------------------- | ------ | ------------------------------------------------------------------ |
| 模块 require 路径错误 | P0     | `lib/files/*.js` 引用 `./http-client` 应为 `../client/http-client` |
| HttpClient 并发槽 bug | P0     | 队列返回的 Promise 未传释放函数                                    |
| 异常未释放并发槽      | P0     | request 方法缺少 finally 释放                                      |
| 重试逻辑失效          | P1     | validateStatus 导致状态码不抛错                                    |
| 分片上传字节边界      | P1     | end 包含终点导致多读 1 字节                                        |
| 按时间整理未实现      | P1     | 空壳逻辑，需补齐或标注                                             |
| 转存确认流程断链      | P1     | handleTransfer 只展示，需闭环                                      |
| 输入校验不足          | P2     | 非字符串输入未做防御                                               |

---

## 三、Skill 规范改进清单

### 3.1 必须完成的改进项

#### 1. 创建 Skill 标准目录

```bash
mkdir -p .claude/skills/115-cloud-master
mkdir -p .claude/skills/115-cloud-master/scripts
```

#### 2. 创建 SKILL.md 主入口

位置：`.claude/skills/115-cloud-master/SKILL.md`

必须包含：

- **frontmatter**：`name`, `description`, `argument-hint`, `disable-model-invocation`, `allowed-tools`
- **任务化内容**：描述如何解析用户意图 → 调用功能 → 返回结果
- **参数支持**：使用 `$ARGUMENTS` 和 `$ARGUMENTS[N]`
- **错误处理**：常见错误场景和恢复方案

#### 3. frontmatter 字段选择

| 字段                       | 建议值                                 | 说明                                                                     |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `name`                     | `115-cloud-master`                     | 技能短名（小写+连字符）                                                  |
| `description`              | 具体描述触发场景                       | 例如："115 网盘管理：扫码登录、文件浏览、搜索、转存、离线下载、智能整理" |
| `argument-hint`            | `[action] [target] [options]`          | 参数提示，如：`登录 查看 搜索 转存 磁力 整理`                            |
| `disable-model-invocation` | `true`（高危操作）或 `false`（查看类） | 建议登录/转存/删除等高危操作设为 true                                    |
| `user-invocable`           | `true`                                 | 默认展示给用户                                                           |
| `allowed-tools`            | `Read, Grep, Glob, Bash`               | 最小权限原则                                                             |

#### 4. 危险操作控制

对于以下操作，建议设置 `disable-model-invocation: true`：

- 登录认证（扫码是独立流程）
- 文件删除
- 清空回收站
- 批量转存
- 离线下载清理

用户需显式使用 `/115-cloud-master` 调用。

#### 5. 支持文件拆分

当 SKILL.md 超过 500 行时，应拆分为：

```
.claude/skills/115-cloud-master/
├── SKILL.md           # 主入口（<500行）
├── reference.md       # 详细 API 参考
├── examples.md        # 使用示例
└── scripts/
    └── run.sh        # 封装脚本
```

---

## 四、SKILL.md 设计模板

```yaml
---
name: 115-cloud-master
description: 115 网盘智能管理：扫码登录、文件浏览、搜索、转存、离线下载、智能整理。适用于"登录115"、"查看文件"、"搜索xxx"、"转存链接"、"磁力链接"、"整理文件"等场景。
argument-hint: [action] [target] [options]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---

# 115 Cloud Master Skill

你是一个 115 网盘智能管理助手。用户可以通过聊天方式管理 115 网盘。

## 可用操作

### 1. 登录认证
- 触发：`登录 115`、`扫码登录`
- 执行：调用 index.js 的 handle 方法处理登录
- 返回：二维码图片或登录状态

### 2. 文件浏览
- 触发：`查看文件`、`文件列表`
- 执行：列出目录文件
- 返回：文件列表（名称、大小、类型）

### 3. 文件搜索
- 触发：`搜索 xxx`、`找 xxx`
- 执行：按关键词搜索文件
- 返回：搜索结果列表

### 4. 分享转存
- 触发：`转存 115.com/s/xxx 密码:xxxx`
- 执行：解析分享码并转存
- 返回：转存结果

### 5. 离线下载
- 触发：`磁力 magnet:xxx`、`下载 xxx`
- 执行：添加离线下载任务
- 返回：任务添加结果

### 6. 智能整理
- 触发：`整理文件`、`分类整理`
- 执行：按类型/时间整理文件
- 返回：整理结果统计

## 参数传递

当用户使用 `/115-cloud-master 登录` 时：
- `$ARGUMENTS` = "登录"
- `$ARGUMENTS[0]` = "登录"

当用户使用 `/115-cloud-master 搜索 工作报告` 时：
- `$ARGUMENTS` = "搜索 工作报告"
- `$ARGUMENTS[0]` = "搜索"
- `$ARGUMENTS[1]` = "工作报告"

## 执行流程

1. 解析用户输入，提取操作类型和参数
2. 调用 index.js 的 Skill115Master.handle(message, context) 方法
3. 解析返回值，转换为用户友好的响应格式
4. 如遇错误，提供明确的错误信息和恢复建议

## 错误处理

| 错误类型 | 用户可见信息 | 恢复建议 |
|---------|-------------|----------|
| 未登录 | "请先说'登录 115'扫码登录" | 引导扫码 |
| Cookie 过期 | "登录已过期，请重新登录" | 重新扫码 |
| 网络错误 | "网络不稳定，请稍后重试" | 延迟重试 |
| 文件不存在 | "未找到指定文件" | 建议搜索 |
| 转存失败 | "转存失败: 原因" | 检查链接/空间 |

## 注意事项

1. 所有高危操作（登录、转存、删除）需要用户明确确认
2. 避免自动触发高危操作，使用 disable-model-invocation: true
3. 返回结果要简洁明了，避免泄露敏感信息
4. 超时场景要给出友好提示，不要让用户等待过久
```

---

## 五、代码层必须修复的问题

### 5.1 P0 阻塞问题（必须立即修复）

#### 问题 1：模块 require 路径错误

**受影响文件：**

- `lib/files/browser.js:1`
- `lib/files/operations.js:1`
- `lib/files/transfer.js:1`
- `lib/share/transfer.js:11`

**修复方案：**

```diff
- const HttpClient = require('./http-client');
+ const HttpClient = require('../client/http-client');
```

#### 问题 2：HttpClient 并发槽 bug

**位置：** `lib/client/http-client.js:101-124`

**问题：** 队列返回的 Promise 未传递释放函数

**修复方案：** 重构 `acquireSlot` 和 `processQueue` 方法，确保队列中的请求获得正确的释放函数

#### 问题 3：异常未释放并发槽

**位置：** `lib/client/http-client.js:133-202`

**问题：** request 方法在异常时未释放槽位

**修复方案：** 在 request 方法添加 finally 块确保释放

### 5.2 P1 高风险问题

#### 问题 4：POST 参数序列化

**位置：** `lib/client/http-client.js:34-39`

**修复：** 明确 POST 请求的 Content-Type 和参数序列化方式

#### 问题 5：大文件分片边界

**位置：** `lib/files/transfer.js:103-113`

**修复：** 修正 end 边界计算

#### 问题 6：按时间整理空壳

**位置：** `lib/organizer/smart-organizer.js:136-140`

**修复：** 补齐目录创建和文件移动逻辑，或在文档中标注"暂未实现"

#### 问题 7：转存确认流程断链

**位置：** `index.js:199-224`

**修复：** 补齐"确认转存"执行分支，或改为直接执行

---

## 六、推荐的改进顺序

### 阶段一：Skill 包装层（1-2 天）

1. 创建 `.claude/skills/` 目录结构
2. 编写 `SKILL.md` 主入口
3. 配置合法的 frontmatter
4. 实现任务化内容（解析→执行→响应）
5. 添加参数支持（$ARGUMENTS）
6. 配置危险操作控制

### 阶段二：代码层关键修复（1-2 天）

1. 修复 require 路径错误（P0）
2. 修复 HttpClient 并发 bug（P0）
3. 修复异常释放问题（P0）
4. 修复分片上传边界（P1）
5. 补齐按时间整理逻辑（P1）
6. 闭环转存确认流程（P1）

### 阶段三：完善与测试（1 天）

1. 补齐单元测试（auth/session/http-client）
2. 统一错误返回格式
3. 完善输入校验
4. 文档与代码一致性对齐
5. 清理无用依赖和脚本

### 阶段四：验收（0.5 天）

1. 按 Skill 规范清单逐项验收
2. 本地功能测试
3. 错误场景覆盖测试
4. 上线准备

---

## 七、验收检查清单

### Skill 规范验收

- [ ] `.claude/skills/115-cloud-master/SKILL.md` 存在
- [ ] SKILL.md 包含合法的 YAML frontmatter
- [ ] name 字段符合规范（小写+连字符）
- [ ] description 字段描述清晰触发场景
- [ ] 使用 argument-hint 提供参数提示
- [ ] 高危操作设置 disable-model-invocation: true
- [ ] 使用 allowed-tools 限制最小权限
- [ ] 支持 $ARGUMENTS 参数传递
- [ ] 错误处理覆盖常见场景
- [ ] 支持文件拆分（超过 500 行时）

### 代码质量验收

- [ ] 无阻塞型运行时 bug（P0 问题已修复）
- [ ] 核心模块有单元测试覆盖
- [ ] 错误返回格式统一
- [ ] 输入校验完善
- [ ] 文档与代码能力一致

### 功能验收

- [ ] 登录流程完整可用
- [ ] 文件浏览/搜索正常
- [ ] 转存流程闭环
- [ ] 离线下载可用
- [ ] 智能整理至少一种模式可用

---

## 八、参考资源

- [Claude Code Skills 官方文档](https://code.claude.com/docs/zh-CN/skills)
- [Agent Skills 开放标准](https://agentskills.io)
- [项目代码评审报告](./CODE_REVIEW.md)

---

**文档版本：** v1.0.1  
**维护者：** ReviewBot  
**最后更新：** 2026-03-14
