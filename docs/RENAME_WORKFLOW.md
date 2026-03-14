# 115-cloud-master → 115-skills 改名执行工作流

> 项目改名完整执行方案 - 任务最小化拆解

**创建时间：** 2026-03-14  
**执行状态：** ⏳ 待执行  
**预计耗时：** ~111 分钟

---

## 📋 改名范围

| 类型 | 旧名称 | 新名称 |
|------|--------|--------|
| 目录名 | `115-cloud-master` | `115-skills` |
| package name | `115-cloud-master` | `115-skills` |
| Skill 名称 | `115-cloud-master` | `115-skills` |
| 显示名称 | `115 Cloud Master` | `115 Skills` |
| GitHub 仓库 | `sukris/115-cloud-master` | `sukris/115-skills` |

---

## 📌 阶段 0：准备工作（5 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T0-1 | 记录当前项目路径 | `ls ~/.openclaw/projects/115-cloud-master` 能列出文件 | ⬜ |
| T0-2 | 记录当前 git remote URL | `cd ~/.openclaw/projects/115-cloud-master && git remote -v` | ⬜ |
| T0-3 | 备份 package.json | `cp package.json package.json.bak` | ⬜ |
| T0-4 | 确认 GitHub 登录状态 | 浏览器能访问 https://github.com/sukris/115-cloud-master/settings | ⬜ |

---

## 📌 阶段 1：GitHub 仓库改名（10 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T1-1 | 打开 GitHub 仓库设置页 | 访问 https://github.com/sukris/115-cloud-master/settings | ⬜ |
| T1-2 | 找到 Repository name 输入框 | 页面上看到 "115-cloud-master" 输入框 | ⬜ |
| T1-3 | 输入新名称 `115-skills` | 输入框显示 `115-skills` | ⬜ |
| T1-4 | 点击 Rename 按钮 | 页面跳转到新 URL：`.../sukris/115-skills` | ⬜ |
| T1-5 | 确认重定向生效 | 旧 URL 自动 301 到新 URL | ⬜ |
| T1-6 | 记录新仓库 URL | `https://github.com/sukris/115-skills` | ⬜ |

---

## 📌 阶段 2：本地 Git Remote 更新（3 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T2-1 | 进入项目目录 | `cd ~/.openclaw/projects/115-cloud-master` | ⬜ |
| T2-2 | 查看当前 remote | `git remote -v` 显示旧 URL | ⬜ |
| T2-3 | 更新 origin URL | `git remote set-url origin https://github.com/sukris/115-skills.git` | ⬜ |
| T2-4 | 验证 remote 已更新 | `git remote -v` 显示新 URL | ⬜ |

---

## 📌 阶段 3：目录重命名（5 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T3-1 | 重命名 projects 目录 | `mv ~/.openclaw/projects/115-cloud-master ~/.openclaw/projects/115-skills` | ⬜ |
| T3-2 | 验证 projects 目录 | `ls ~/.openclaw/projects/115-skills` 能列出文件 | ⬜ |
| T3-3 | 重命名 skills 目录 | `mv ~/.openclaw/skills/115-cloud-master ~/.openclaw/skills/115-skills` | ⬜ |
| T3-4 | 验证 skills 目录 | `ls ~/.openclaw/skills/115-skills` 能列出文件 | ⬜ |

---

## 📌 阶段 4：package.json 更新（8 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T4-1 | 读取 package.json | `cat ~/.openclaw/projects/115-skills/package.json` | ⬜ |
| T4-2 | 更新 `name` 字段 | `"name": "115-skills"` | ⬜ |
| T4-3 | 更新 `author` 字段 | `"author": "115 Skills Team"` | ⬜ |
| T4-4 | 更新 `repository.url` | `"url": "git+https://github.com/sukris/115-skills.git"` | ⬜ |
| T4-5 | 更新 `bugs.url` | `"url": "https://github.com/sukris/115-skills/issues"` | ⬜ |
| T4-6 | 更新 `homepage` | `"homepage": "https://github.com/sukris/115-skills#readme"` | ⬜ |
| T4-7 | 验证 JSON 格式 | `cat package.json \| jq .` 无报错 | ⬜ |

---

## 📌 阶段 5：.claude/skills/ 目录更新（8 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T5-1 | 查看 .claude/skills/ 结构 | `ls -la ~/.openclaw/projects/115-skills/.claude/skills/` | ⬜ |
| T5-2 | 重命名 skills 子目录 | `mv .../.claude/skills/115-cloud-master .../.claude/skills/115-skills` | ⬜ |
| T5-3 | 验证目录重命名 | `ls .../.claude/skills/115-skills/` 能看到 SKILL.md | ⬜ |
| T5-4 | 读取 SKILL.md frontmatter | 查看前 10 行 | ⬜ |
| T5-5 | 更新 frontmatter name | `name: 115-skills` | ⬜ |
| T5-6 | 验证 frontmatter 格式 | YAML 格式正确，无语法错误 | ⬜ |

---

## 📌 阶段 6：SKILL.md 正文更新（10 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T6-1 | 搜索 `115-cloud-master` 引用 | `grep -n "115-cloud-master" SKILL.md` | ⬜ |
| T6-2 | 替换标题中的项目名 | `115 Cloud Master` → `115 Skills` | ⬜ |
| T6-3 | 替换路径引用 | `/115-cloud-master` → `/115-skills` | ⬜ |
| T6-4 | 替换目录结构示例 | 代码块中的路径更新 | ⬜ |
| T6-5 | 验证无遗漏 | `grep -n "cloud-master" SKILL.md` 返回空 | ⬜ |

---

## 📌 阶段 7：README.md 更新（10 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T7-1 | 搜索 `115-cloud-master` 引用 | `grep -n "115-cloud-master" README.md` | ⬜ |
| T7-2 | 更新徽章 URL | `.../115-cloud-master/...` → `.../115-skills/...` | ⬜ |
| T7-3 | 更新 GitHub 链接 | 所有 `github.com/sukris/115-cloud-master` 更新 | ⬜ |
| T7-4 | 更新 ClawHub 链接 | `clawhub.ai/skills/115-cloud-master` → `115-skills` | ⬜ |
| T7-5 | 更新项目结构示例 | 代码块中的路径更新 | ⬜ |
| T7-6 | 验证无遗漏 | `grep -n "cloud-master" README.md` 返回空 | ⬜ |

---

## 📌 阶段 8：docs/ 文档更新（15 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T8-1 | 列出 docs 下所有 md 文件 | `find docs/ -name "*.md" -type f` | ⬜ |
| T8-2 | 更新 USER_GUIDE.md | 全局替换项目名 | ⬜ |
| T8-3 | 更新 SKILL_API.md | 全局替换项目名和路径 | ⬜ |
| T8-4 | 更新 COMPLETE_REVIEW.md | 全局替换项目名 | ⬜ |
| T8-5 | 更新 CODE_REVIEW.md | 全局替换项目名 | ⬜ |
| T8-6 | 更新其他文档 | 遍历剩余 md 文件 | ⬜ |
| T8-7 | 验证所有文档 | `grep -r "cloud-master" docs/` 返回空 | ⬜ |

---

## 📌 阶段 9：代码文件检查（10 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T9-1 | 检查 index.js | `grep -n "cloud-master" index.js` | ⬜ |
| T9-2 | 检查 lib/ 目录 | `grep -r "cloud-master" lib/` | ⬜ |
| T9-3 | 检查 test/ 目录 | `grep -r "cloud-master" test/` | ⬜ |
| T9-4 | 检查 scripts/ 目录 | `grep -r "cloud-master" scripts/` | ⬜ |
| T9-5 | 修复发现的引用 | 逐个替换 | ⬜ |
| T9-6 | 验证无遗漏 | 所有 grep 返回空 | ⬜ |

---

## 📌 阶段 10：.data 配置检查（5 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T10-1 | 检查 .data 目录 | `ls -la ~/.openclaw/skills/115-skills/.data/` | ⬜ |
| T10-2 | 读取配置文件 | `cat .data/*` | ⬜ |
| T10-3 | 更新旧路径引用 | 如有则替换 | ⬜ |
| T10-4 | 验证配置格式 | JSON/YAML 格式正确 | ⬜ |

---

## 📌 阶段 11：Git 提交（5 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T11-1 | 进入项目目录 | `cd ~/.openclaw/projects/115-skills` | ⬜ |
| T11-2 | 查看变更文件 | `git status` | ⬜ |
| T11-3 | 添加所有变更 | `git add -A` | ⬜ |
| T11-4 | 提交变更 | `git commit -m "chore: rename project to 115-skills"` | ⬜ |
| T11-5 | 验证提交 | `git log -1` 显示提交信息 | ⬜ |

---

## 📌 阶段 12：推送到 GitHub（5 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T12-1 | 推送 main 分支 | `git push origin main` | ⬜ |
| T12-2 | 验证推送成功 | 无报错，显示 `main -> main` | ⬜ |
| T12-3 | 打开 GitHub 仓库 | 访问 https://github.com/sukris/115-skills | ⬜ |
| T12-4 | 确认提交已同步 | 看到最新提交记录 | ⬜ |

---

## 📌 阶段 13：功能验证（10 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T13-1 | 检查项目可加载 | OpenClaw 能识别 115-skills | ⬜ |
| T13-2 | 运行测试 | `cd ~/.openclaw/projects/115-skills && npm test` | ⬜ |
| T13-3 | 验证测试通过 | 所有测试用例 green | ⬜ |
| T13-4 | 检查 Skill 注册 | `.claude/skills/115-skills/SKILL.md` 可读取 | ⬜ |

---

## 📌 阶段 14：清理工作（3 分钟）

| 任务 ID | 任务描述 | 验证方式 | 状态 |
|--------|---------|---------|------|
| T14-1 | 删除备份文件 | `rm package.json.bak` | ⬜ |
| T14-2 | 确认无临时文件 | `ls -la` 无 .tmp/.bak 文件 | ⬜ |
| T14-3 | 记录完成时间 | 记录任务完成时间戳 | ⬜ |

---

## 📊 任务统计

| 阶段 | 任务数 | 预计时间 | 完成状态 |
|------|--------|---------|----------|
| 阶段 0：准备 | 4 | 5 分钟 | ⬜ |
| 阶段 1：GitHub 改名 | 6 | 10 分钟 | ⬜ |
| 阶段 2：Git Remote | 4 | 3 分钟 | ⬜ |
| 阶段 3：目录重命名 | 4 | 5 分钟 | ⬜ |
| 阶段 4：package.json | 7 | 8 分钟 | ⬜ |
| 阶段 5：.claude/skills/ | 6 | 8 分钟 | ⬜ |
| 阶段 6：SKILL.md | 6 | 10 分钟 | ⬜ |
| 阶段 7：README.md | 6 | 10 分钟 | ⬜ |
| 阶段 8：docs/ | 7 | 15 分钟 | ⬜ |
| 阶段 9：代码检查 | 6 | 10 分钟 | ⬜ |
| 阶段 10：.data 检查 | 4 | 5 分钟 | ⬜ |
| 阶段 11：Git 提交 | 5 | 5 分钟 | ⬜ |
| 阶段 12：推送 | 4 | 5 分钟 | ⬜ |
| 阶段 13：验证 | 4 | 10 分钟 | ⬜ |
| 阶段 14：清理 | 3 | 3 分钟 | ⬜ |
| **总计** | **76** | **~111 分钟** | |

---

## ⚠️ 风险提示

| 风险 | 说明 | 应对措施 |
|------|------|---------|
| GitHub 重定向 | 旧链接会 301 重定向到新链接 | 无需处理，GitHub 自动处理 |
| 已有用户 | 已安装旧版本的用户需重新安装 | 可在 README 添加迁移说明 |
| ClawHub | 如已发布需更新页面 | 访问 ClawHub 更新技能页面 |
| 本地配置 | .data 中可能有旧路径引用 | 检查并更新 |

---

## 📝 执行建议

```
推荐执行方式：
1. 按阶段顺序执行，不要跳步
2. 每完成一个阶段，打勾确认
3. 遇到问题立即暂停，不要继续
4. 阶段 1（GitHub 改名）必须先做
5. 阶段 13（验证）必须最后做
```

---

## 🔗 相关链接

- 旧仓库：https://github.com/sukris/115-cloud-master（会重定向）
- 新仓库：https://github.com/sukris/115-skills
- ClawHub 页面：https://clawhub.ai/skills/115-skills

---

**文档维护：** 115 Skills Team  
**最后更新：** 2026-03-14
