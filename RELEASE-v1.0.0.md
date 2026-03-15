# 🎉 115 Skills v1.0.0 发布说明

**发布日期：** 2026 年 3 月 15 日  
**版本类型：** 重大更新（Major Release）

---

## ✨ 新功能

### 🔐 登录认证
- 聊天内扫码登录（无需浏览器）
- Cookie 自动管理与加密存储
- 会话持久化与自动恢复

### 📁 文件管理
- 浏览文件列表（支持分页）
- 多条件搜索
- 文件上传/下载
- 移动/复制/删除/重命名
- 路径导航与面包屑

### 🤖 智能整理
- 按类型自动分类（文档/图片/视频/音乐等）
- 按时间自动整理
- AI 智能分类
- 重复文件检测（SHA1 哈希）
- 清理建议（优先级排序）

### 📦 分享转存
- 分享码解析（支持 6 种格式）
- 一键转存全部
- 批量转存
- 创建分享链接
- 分享管理（列表/取消/更新时长）

### ⬇️ 离线下载
- 磁力链接下载
- 种子文件下载
- HTTP/HTTPS 下载
- 任务列表管理
- 任务状态跟踪

### 🧹 智能清理
- 大文件检测（Top 100）
- 重复文件检测
- 临时文件识别
- 回收站统计
- 一键清理

---

## 🔧 技术优化

### 上下文管理
- 路径管理（设置/获取/进入/返回）
- 面包屑导航生成
- 文件选择（单选/多选/清除）
- 操作历史记录（50 条上限）
- 序列化/反序列化（支持会话恢复）

### 快捷命令
- 斜杠命令（`/115 [命令]`）
- 快捷词匹配（30+ 个）
- 数字选择（1-9 推荐操作）
- 分享链接自动识别
- 磁力/HTTP 链接自动识别
- 自然语言命令理解

### 主动推荐
- 场景推荐（10+ 个场景）
- 上下文感知推荐
- 时间相关推荐（早晨/夜晚）
- 优先级排序
- 快捷命令推荐

### 错误处理
- 15+ 错误类型分类
- 115 API 特定错误码映射
- 友好错误消息
- 恢复建议机制
- 错误日志记录

### UI 响应
- 卡片式响应（15+ 种卡片）
- 进度条组件（emoji 进度条）
- 速度显示与剩余时间估算
- 成功/失败统计
- 错误详情展开

---

## 📊 测试覆盖

| 指标 | 数值 |
|------|------|
| 测试文件 | 11 个 |
| 测试用例 | 382 个 |
| 通过率 | 100% |
| 平均覆盖率 | >85% |
| 新增代码 | ~12,052 行 |
| 新增模块 | 11 个 |

### 测试模块
- ✅ 上下文管理器（20 测试，88.63% 覆盖率）
- ✅ 快捷命令解析器（43 测试，94.33% 覆盖率）
- ✅ 主动推荐系统（36 测试，96.29% 覆盖率）
- ✅ 错误处理（42 测试，~90% 覆盖率）
- ✅ 分享管理（31 测试）
- ✅ 批量操作（29 测试）
- ✅ 离线下载管理（34 测试）
- ✅ 智能清理（36 测试）
- ✅ 卡片式响应（47 测试）
- ✅ 进度显示（35 测试）
- ✅ 历史记录增强（29 测试）

---

## 🚀 CI/CD

### GitHub Actions 工作流
- ✅ 单元测试（Node 18/20/22 矩阵测试）
- ✅ 代码质量检查（ESLint + Prettier）
- ✅ 测试覆盖率检查（≥80%）
- ✅ 自动发布流程（创建 tag 触发）

### 本地 CI 脚本
```bash
# 运行本地 CI
bash scripts/local-ci.sh
```

---

## 📝 文档

### 新增文档
- ✅ README.md（5 种安装方式 + 13 个常见问题）
- ✅ Skill 重构方案.md
- ✅ 功能实现进度报告.md
- ✅ 重构开发任务列表.md
- ✅ CI-CD 使用指南.md
- ✅ 测试能力评估报告.md
- ✅ 用户手册（docs/user/USER_GUIDE.md）
- ✅ API 文档（docs/api/SKILL_API.md）

### 常见问题（13 个）
**安装问题：**
- Q1: permission denied
- Q2: npm install 失败
- Q3: 找不到 Skill 目录

**使用问题：**
- Q4: 扫码登录失败
- Q5: 文件操作失败
- Q6: 分享转存失败

**兼容性问题：**
- Q7: Cursor 无法使用
- Q8: Gemini 命令不识别
- Q9: 命令格式差异

**性能问题：**
- Q10: 响应速度慢
- Q11: 内存占用高

**安全问题：**
- Q12: Cookie 安全性
- Q13: 开源许可

---

## 🔗 链接

- **GitHub 仓库：** https://github.com/sukris/115-skills
- **问题反馈：** https://github.com/sukris/115-skills/issues
- **ClawHub 页面：** （待审核上线）

---

## 📦 安装方式

### 方式 1：ClawHub 安装（推荐）⭐
```bash
npx clawhub --workdir ~/.openclaw --dir skills install 115-skills
```

### 方式 2：Git 克隆安装
```bash
git clone https://github.com/sukris/115-skills.git ~/.openclaw/skills/115-skills
cd ~/.openclaw/skills/115-skills
npm install --production
```

### 方式 3：手动下载安装
```bash
curl -L https://github.com/sukris/115-skills/archive/refs/heads/main.zip -o 115-skills.zip
unzip 115-skills.zip -d ~/.openclaw/skills/
mv ~/.openclaw/skills/115-skills-main ~/.openclaw/skills/115-skills
cd ~/.openclaw/skills/115-skills
npm install --production
```

### 方式 4：npm 全局安装
```bash
npm install -g 115-skills
ln -s $(npm root -g)/115-skills ~/.openclaw/skills/115-skills
```

### 方式 5：Docker 安装
```bash
docker pull sukris/115-skills:latest
docker run -d --name 115-skills -v ~/.openclaw:/app/data sukris/115-skills:latest
```

---

## 🎯 平台兼容性

| 平台 | 状态 | 命令前缀 |
|------|------|---------|
| Claude Code | ✅ 完全兼容 | `/115` |
| Gemini CLI | ✅ 兼容 | `@115` |
| Cursor | ✅ 兼容 | `@115` |
| OpenHands | ✅ 兼容 | `使用 115-skills` |

---

## 📈 统计

- **总提交数：** 30+ 次
- **贡献者：** 1 人
- **代码行数：** ~12,052 行（新增）
- **测试用例：** 382 个
- **文档文件：** 10+ 个
- **支持 API 端点：** 14 个

---

## 🙏 致谢

感谢所有测试和使用 115 Skills 的用户！

---

## 📄 许可证

MIT License

---

**Made with ❤️ by 115 Skills Team**
