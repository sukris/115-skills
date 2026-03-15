# ClawHub 发布配置

## 发布信息

- **Skill 名称：** 115-skills
- **版本：** 1.0.0
- **分类：** productivity-and-tasks
- **许可证：** MIT

## 发布命令

```bash
# 1. 确保 clawhub.json 已创建
cd ~/.openclaw/projects/115-skills

# 2. 创建 GitHub Release（已完成）
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0 --force

# 3. 发布到 ClawHub
npx clawhub publish --workdir ~/.openclaw --dir skills

# 或使用 GitHub Actions 自动发布
# 创建 tag 后会自动触发 release.yml 工作流
```

## ClawHub 元数据

```json
{
  "name": "115-skills",
  "version": "1.0.0",
  "category": "productivity-and-tasks",
  "tags": ["115", "cloud-storage", "file-management", "ai-skill"],
  "platforms": ["Claude Code", "Gemini CLI", "Cursor", "OpenHands"],
  "install": "npx clawhub --workdir ~/.openclaw --dir skills install 115-skills"
}
```

## 审核状态

- [ ] 提交到 ClawHub
- [ ] 等待审核
- [ ] 审核通过
- [ ] 正式上线

## 上线后验证

```bash
# 验证 ClawHub 可安装
npx clawhub --workdir ~/.openclaw --dir skills install 115-skills

# 验证技能可用
/115 容量
/115 文件
```
