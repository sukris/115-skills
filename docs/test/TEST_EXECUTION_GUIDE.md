# 115 Skills API 测试执行手册

> **版本：** v1.0  
> **创建日期：** 2026-03-14  
> **最后更新：** 2026-03-14  
> **执行方式：** 自动化脚本 + 人工审核

---

## 📋 目录

1. [执行概览](#执行概览)
2. [阶段 1: 准备 - 详细执行方案](#阶段 1-准备 - 详细执行方案)
3. [阶段 2: 执行 - 详细执行方案](#阶段 2-执行 - 详细执行方案)
4. [阶段 3: 清理 - 详细执行方案](#阶段 3-清理 - 详细执行方案)
5. [阶段 4: 报告 - 详细执行方案](#阶段 4-报告 - 详细执行方案)
6. [验收标准汇总](#验收标准汇总)

---

## 🎯 执行概览

### 测试目标

使用真实 Cookie 对所有 115 API 进行全面测试，确保功能可用。

### 执行时间

| 阶段 | 预计时长 | 执行人 | 审核人 |
|------|---------|--------|--------|
| 准备 | 20 分钟 | AI | - |
| 执行 | 60 分钟 | AI | - |
| 清理 | 15 分钟 | AI | - |
| 报告 | 15 分钟 | AI | 小主 |
| **总计** | **110 分钟** | | |

### 关键里程碑

```
[M1] 环境准备完成    → 验收：检查清单全部通过
[M2] Cookie 验证通过  → 验收：5/5 测试通过
[M3] 测试执行完成    → 验收：≥85% 通过率
[M4] 数据清理完成    → 验收：无残留数据
[M5] 测试报告提交    → 验收：小主审核通过
```

---

## 阶段 1: 准备 - 详细执行方案

### T1: 环境检查

**执行时间：** 5 分钟  
**执行人：** AI Assistant

#### 执行步骤

```bash
# 步骤 1: 检查 Node.js 版本
node --version
# 预期输出：v18.0.0 或更高

# 步骤 2: 检查项目依赖
cd /home/kris/.openclaw/projects/115-skills
npm ls --depth=0
# 预期输出：无 missing 依赖

# 步骤 3: 检查 Cookie 文件
ls -la .data/cookie.json
# 预期输出：文件存在，大小 > 0

# 步骤 4: 检查网络连接
curl -s -o /dev/null -w "%{http_code}" https://webapi.115.com
# 预期输出：200 或 302
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| Node.js 版本 | >= 18.0.0 | 版本号匹配 |
| 依赖安装 | 无 missing | `npm ls` 无错误 |
| Cookie 文件 | 存在且可读 | 文件大小 > 0 |
| 网络连接 | 能访问 115 | HTTP 状态码 200/302 |

**完成标志：** ✅ 所有检查项通过

---

### T2: Cookie 验证

**执行时间：** 5 分钟  
**执行人：** AI Assistant

#### 执行步骤

```bash
# 步骤 1: 读取并解析 Cookie
cat .data/cookie.json | jq .

# 步骤 2: 验证必需字段
jq 'has("uid") and has("cid") and has("seid") and has("kid")' .data/cookie.json
# 预期输出：true

# 步骤 3: 检查有效期
jq '.expireAt > now' .data/cookie.json
# 预期输出：true

# 步骤 4: 测试 API 调用
node -e "
const Session = require('./lib/session');
const session = new Session();
session.getSessionInfo().then(info => console.log(info));
"
# 预期输出：{ loggedIn: true, uid: '...' }
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| JSON 格式 | 有效 JSON | 可解析 |
| 必需字段 | uid, cid, seid, kid | 全部存在 |
| 有效期 | expireAt > 当前时间 | 未过期 |
| API 调用 | 能获取用户信息 | loggedIn=true |

**完成标志：** ✅ Cookie 验证通过

---

### T3: 创建测试目录

**执行时间：** 5 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
// 使用 FileBrowser API 创建目录结构
const browser = new FileBrowser(cookie);

// 创建根目录
const rootDir = await browser.createDirectory('0', `115-skills-test-${date}`);

// 创建子目录
const subDirs = [
  '01_upload_test',
  '02_move_test',
  '03_copy_test',
  '04_rename_test',
  '05_share_test',
  '06_lixian_test',
  '07_cleanup_test'
];

for (const dir of subDirs) {
  await browser.createDirectory(rootDir.cid, dir);
}
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| 根目录 | 创建成功 | 返回目录 ID |
| 子目录 | 7 个子目录 | 全部创建成功 |
| 目录结构 | 符合预期 | 浏览可看到 |

**完成标志：** ✅ 测试目录创建完成

---

### T4: 准备测试数据

**执行时间：** 5 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
// 生成测试文件
const testFiles = {
  small: {
    name: 'test-upload-small.txt',
    content: `115 Skills API Test\nGenerated: ${new Date().toISOString()}`,
    size: 1024
  },
  medium: {
    name: 'test-upload-medium.txt',
    content: generateContent(5 * 1024 * 1024), // 5MB
    size: 5242880
  }
};

// 保存测试文件到本地临时目录
fs.writeFileSync(`/tmp/${testFiles.small.name}`, testFiles.small.content);
fs.writeFileSync(`/tmp/${testFiles.medium.name}`, testFiles.medium.content);
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| 小文件 | 1KB 文本文件 | 文件存在，大小正确 |
| 中文件 | 5MB 文本文件 | 文件存在，大小正确 |
| 文件内容 | 包含时间戳 | 内容可验证 |

**完成标志：** ✅ 测试数据准备完成

---

## 阶段 2: 执行 - 详细执行方案

### T5: L0 测试 - Cookie 有效性

**执行时间：** 5 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
const results = [];

// T5-01: Cookie 文件存在性
results.push({
  id: 'T5-01',
  name: 'Cookie 文件存在性',
  pass: fs.existsSync('.data/cookie.json'),
  expected: '文件存在',
  actual: fs.existsSync('.data/cookie.json') ? '文件存在' : '文件不存在'
});

// T5-02: Cookie 格式验证
try {
  const cookie = JSON.parse(fs.readFileSync('.data/cookie.json'));
  results.push({
    id: 'T5-02',
    name: 'Cookie 格式验证',
    pass: typeof cookie === 'object',
    expected: 'JSON 格式正确',
    actual: 'JSON 格式正确'
  });
} catch (e) {
  results.push({ id: 'T5-02', pass: false, actual: e.message });
}

// T5-03: 有效期检查
const cookie = JSON.parse(fs.readFileSync('.data/cookie.json'));
results.push({
  id: 'T5-03',
  name: '有效期检查',
  pass: cookie.expireAt > Date.now(),
  expected: '未过期',
  actual: cookie.expireAt > Date.now() ? '未过期' : '已过期'
});

// T5-04: 账户信息获取
const session = new Session();
const info = await session.getSessionInfo();
results.push({
  id: 'T5-04',
  name: '账户信息获取',
  pass: info.loggedIn && info.uid,
  expected: '返回 UID',
  actual: info.loggedIn ? `UID: ${info.uid}` : '未登录'
});

// T5-05: 存储空间查询
const account = await account.getAccountInfo();
results.push({
  id: 'T5-05',
  name: '存储空间查询',
  pass: account.total && account.used,
  expected: '返回容量信息',
  actual: `${formatSize(account.used)} / ${formatSize(account.total)}`
});
```

#### 验收标准

| 用例 ID | 测试项 | 通过标准 | 权重 |
|--------|-------|---------|------|
| T5-01 | 文件存在 | 文件存在 | 必须 |
| T5-02 | 格式验证 | JSON 正确 | 必须 |
| T5-03 | 有效期 | 未过期 | 必须 |
| T5-04 | 账户信息 | loggedIn=true | 必须 |
| T5-05 | 存储空间 | 返回容量 | 必须 |

**完成标志：** ✅ 5/5 通过（100%）

---

### T6-T11: L1 测试 - API 接口

**执行时间：** 40 分钟  
**执行人：** AI Assistant

#### 执行方案

每个 API 测试遵循相同模式：

```javascript
async function testAPI(testCase) {
  const startTime = Date.now();
  let result = {
    id: testCase.id,
    name: testCase.name,
    api: testCase.api,
    method: testCase.method,
    startTime,
    endTime: null,
    duration: null,
    pass: false,
    expected: testCase.expected,
    actual: null,
    error: null
  };

  try {
    const response = await apiCall(testCase.api, testCase.method, testCase.params);
    result.actual = parseResponse(response);
    result.pass = validateResponse(response, testCase.validator);
  } catch (error) {
    result.error = error.message;
    result.actual = `错误：${error.message}`;
  }

  result.endTime = Date.now();
  result.duration = result.endTime - result.startTime;
  return result;
}
```

#### 验收标准

| 模块 | 用例数 | 通过标准 | 权重 |
|------|--------|---------|------|
| 认证 | 3 | ≥3/3 | P0 |
| 浏览 | 4 | ≥4/4 | P0 |
| 操作 | 5 | ≥5/5 | P0 |
| 传输 | 3 | ≥3/3 | P0 |
| 分享 | 3 | ≥2/3 | P1 |
| 离线 | 3 | ≥2/3 | P1 |
| **L1 总计** | **21** | **≥19/21 (90%)** | |

**完成标志：** ✅ 通过率 ≥ 90%

---

### T12: L2 测试 - 模块集成

**执行时间：** 10 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
// L2-INT-01: 上传后浏览
const file1 = await transfer.uploadFile('/tmp/test.txt', testDir.cid);
const list = await browser.listFiles(testDir.cid);
const found = list.files.find(f => f.cid === file1.cid);
result1.pass = !!found;

// L2-INT-02: 创建后移动
const dir1 = await browser.createDirectory(testDir.cid, 'move_test');
const dir2 = await browser.createDirectory(testDir.cid, 'target');
const moved = await browser.moveDirectory(dir1.cid, dir2.cid);
result2.pass = moved.state;

// L2-INT-03: 分享后转存
const share = await share.createShare(file1.cid);
const parsed = await share.parseShareCode(share.shareCode);
const transferred = await share.transferFiles(parsed, testDir2.cid);
result3.pass = transferred.success;
```

#### 验收标准

| 用例 ID | 测试项 | 通过标准 | 权重 |
|--------|-------|---------|------|
| L2-INT-01 | 上传后浏览 | 能找到文件 | P0 |
| L2-INT-02 | 创建后移动 | 移动成功 | P0 |
| L2-INT-03 | 分享后转存 | 转存成功 | P1 |

**完成标志：** ✅ ≥2/3 通过

---

### T13: L3 测试 - 业务流程

**执行时间：** 10 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
// L3-FLOW-01: 完整上传流程
const flow1Dir = await browser.createDirectory(root.cid, 'flow1');
const flow1File = await transfer.uploadFile('/tmp/test.txt', flow1Dir.cid);
const flow1List = await browser.listFiles(flow1Dir.cid);
await browser.deleteFile(flow1File.cid);
await browser.deleteDirectory(flow1Dir.cid);
result1.pass = flow1File.cid && flow1List.count === 1;

// L3-FLOW-02: 文件管理流程
const flow2File = await transfer.uploadFile('/tmp/test.txt', testDir.cid);
const moved = await browser.moveFile(flow2File.cid, subDir1.cid);
const copied = await browser.copyFile(flow2File.cid, subDir2.cid);
const renamed = await browser.renameFile(copied.cid, 'renamed.txt');
await browser.deleteFile(flow2File.cid);
await browser.deleteFile(renamed.cid);
result2.pass = moved.state && copied.state && renamed.state;

// L3-FLOW-03: 分享转存流程
const flow3File = await transfer.uploadFile('/tmp/test.txt', testDir.cid);
const share = await share.createShare(flow3File.cid);
const parsed = await share.parseShareCode(share.shareCode);
const transferred = await share.transferFiles(parsed, testDir2.cid);
await share.cancelShare(share.shareId);
await browser.deleteFile(flow3File.cid);
await browser.deleteFile(transferred.files[0].cid);
result3.pass = share.shareCode && transferred.success;
```

#### 验收标准

| 用例 ID | 测试项 | 通过标准 | 权重 |
|--------|-------|---------|------|
| L3-FLOW-01 | 上传流程 | 上传→验证→删除 | P0 |
| L3-FLOW-02 | 管理流程 | 移动→复制→重命名→删除 | P0 |
| L3-FLOW-03 | 分享流程 | 分享→转存→清理 | P1 |

**完成标志：** ✅ ≥2/3 通过

---

## 阶段 3: 清理 - 详细执行方案

### T14-T17: 数据清理

**执行时间：** 15 分钟  
**执行人：** AI Assistant

#### 执行步骤

```javascript
// 步骤 1: 列出测试目录
const testDirs = await browser.listFiles('0');
const testDir = testDirs.files.find(f => f.name.startsWith('115-skills-test-'));

if (!testDir) {
  console.log('测试目录不存在，跳过清理');
  return;
}

// 步骤 2: 删除所有子目录
const subDirs = await browser.listFiles(testDir.cid);
for (const dir of subDirs.files) {
  await browser.deleteDirectory(dir.cid);
  console.log(`删除子目录：${dir.name}`);
}

// 步骤 3: 删除根测试目录
await browser.deleteDirectory(testDir.cid);
console.log(`删除根目录：${testDir.name}`);

// 步骤 4: 验证清理结果
const verify = await browser.listFiles('0');
const stillExists = verify.files.find(f => f.name.startsWith('115-skills-test-'));
if (stillExists) {
  console.error('警告：测试目录未完全清理');
} else {
  console.log('✅ 清理完成，无残留');
}
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| 子目录删除 | 7 个子目录 | 全部删除 |
| 根目录删除 | 测试根目录 | 已删除 |
| 无残留 | 搜索确认 | 无匹配结果 |

**完成标志：** ✅ 所有测试数据已清理

---

## 阶段 4: 报告 - 详细执行方案

### T18-T20: 报告生成与提交

**执行时间：** 15 分钟  
**执行人：** AI Assistant  
**审核人：** 小主

#### 执行步骤

```javascript
// 步骤 1: 生成测试报告
const report = {
  meta: {
    testDate: new Date().toISOString(),
    cookieUID: cookie.uid,
    testDir: testDirName,
    totalDuration: endTime - startTime
  },
  summary: {
    total: results.length,
    passed: results.filter(r => r.pass).length,
    failed: results.filter(r => !r.pass).length,
    skipped: results.filter(r => r.skipped).length,
    passRate: ((results.filter(r => r.pass).length / results.length) * 100).toFixed(1)
  },
  results: results,
  failedCases: results.filter(r => !r.pass),
  recommendations: generateRecommendations(results)
};

// 步骤 2: 保存报告
fs.writeFileSync('docs/test/TEST_REPORT_API.md', generateMarkdownReport(report));
fs.writeFileSync('logs/api-test-results.json', JSON.stringify(report, null, 2));

// 步骤 3: Git 提交
execSync('git add docs/test/TEST_REPORT_API.md');
execSync('git add logs/api-test-results.json');
execSync('git commit -m "test: API 测试报告 - ' + date + '"');
execSync('git push origin develop');
```

#### 验收标准

| 检查项 | 标准 | 通过条件 |
|--------|------|---------|
| 报告格式 | Markdown + JSON | 两个文件都生成 |
| 报告内容 | 完整测试结果 | 包含所有用例 |
| Git 提交 | develop 分支 | 提交成功 |
| 小主审核 | 审核通过 | 无重大问题 |

**完成标志：** ✅ 报告已提交并审核通过

---

## ✅ 验收标准汇总

### 阶段验收标准

| 阶段 | 验收项 | 通过标准 | 状态 |
|------|--------|---------|------|
| **准备** | 环境检查 | 4/4 通过 | ⬜ |
| **准备** | Cookie 验证 | 5/5 通过 | ⬜ |
| **准备** | 测试目录 | 创建成功 | ⬜ |
| **准备** | 测试数据 | 准备完成 | ⬜ |
| **执行** | L0 测试 | 5/5 (100%) | ⬜ |
| **执行** | L1 测试 | ≥19/21 (90%) | ⬜ |
| **执行** | L2 测试 | ≥2/3 (67%) | ⬜ |
| **执行** | L3 测试 | ≥2/3 (67%) | ⬜ |
| **清理** | 数据清理 | 无残留 | ⬜ |
| **报告** | 报告生成 | 完整准确 | ⬜ |
| **报告** | 报告提交 | Git 推送成功 | ⬜ |
| **报告** | 小主审核 | 审核通过 | ⬜ |

### 总体验收标准

| 等级 | 通过率 | 要求 | 结论 |
|------|--------|------|------|
| **优秀** | ≥95% | 所有 P0 测试通过 | ⬜ |
| **良好** | ≥85% | 所有 P0 测试通过 | ⬜ |
| **合格** | ≥70% | 核心 P0 测试通过 | ⬜ |
| **不合格** | <70% | - | ⬜ |

---

## 📊 测试结果记录表

| 任务 ID | 任务名称 | 开始时间 | 结束时间 | 结果 | 备注 |
|--------|---------|---------|---------|------|------|
| T1 | 环境检查 | | | ⬜ | |
| T2 | Cookie 验证 | | | ⬜ | |
| T3 | 创建测试目录 | | | ⬜ | |
| T4 | 准备测试数据 | | | ⬜ | |
| T5 | L0 测试 | | | ⬜ | |
| T6-T11 | L1 测试 | | | ⬜ | |
| T12 | L2 测试 | | | ⬜ | |
| T13 | L3 测试 | | | ⬜ | |
| T14-T17 | 数据清理 | | | ⬜ | |
| T18-T20 | 报告提交 | | | ⬜ | |

---

**文档版本：** v1.0  
**创建者：** 115 Skills Team  
**创建日期：** 2026-03-14  
**最后更新：** 2026-03-14
