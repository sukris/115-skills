# 115 Cloud Master API 文档

> 版本：v1.0.0  
> 最后更新：2026-03-14

---

## 📖 目录

1. [核心模块](#核心模块)
2. [API 参考](#api 参考)
3. [错误码](#错误码)

---

## 核心模块

### CookieStore

**路径：** `lib/storage/cookie-store.js`

**功能：** Cookie 加密存储

**方法：**
```javascript
const store = new CookieStore();

// 保存 Cookie
await store.save({ uid, cid, se });

// 加载 Cookie
const cookie = await store.load();

// 清除 Cookie
await store.clear();

// 检查是否存在
store.exists();
```

---

### Auth115

**路径：** `lib/auth.js`

**功能：** 扫码登录

**方法：**
```javascript
const auth = new Auth115(cookieStore);

// 生成二维码
const qrData = await auth.generateQRCode();

// 检查扫码状态
const status = await auth.checkQRStatus(qrKey);

// 完整登录流程
await auth.login({
  onQRCode: (qr) => {},
  onStatus: (status) => {},
  onComplete: (result) => {},
  onError: (error) => {}
});

// 验证 Cookie
const isValid = await auth.validateCookie(cookie);
```

---

### FileBrowser

**路径：** `lib/files/browser.js`

**功能：** 文件浏览

**方法：**
```javascript
const browser = new FileBrowser(cookie);

// 获取文件列表
const result = await browser.listFiles(cid, { page, size });

// 获取文件详情
const detail = await browser.getFileDetail(fileId);

// 搜索文件
const result = await browser.searchFiles(keyword, options);

// 获取所有文件（递归）
const allFiles = await browser.getAllFiles(cid, { recursive: true });
```

---

### FileOperations

**路径：** `lib/files/operations.js`

**功能：** 文件操作

**方法：**
```javascript
const ops = new FileOperations(cookie);

// 移动文件
await ops.moveFiles(fid, targetCid);

// 复制文件
await ops.copyFiles(fid, targetCid);

// 删除文件
await ops.deleteFiles(fid);

// 重命名
await ops.renameFile(fid, newName);

// 创建文件夹
await ops.createFolder(folderName, parentCid);
```

---

### FileTransfer

**路径：** `lib/files/transfer.js`

**功能：** 上传下载

**方法：**
```javascript
const transfer = new FileTransfer(cookie);

// 上传文件
await transfer.uploadFile(filePath, targetCid, { onProgress });

// 下载文件
await transfer.downloadFile(fileId, savePath, { onProgress });

// 批量上传
await transfer.batchUpload(filePaths, targetCid, { onProgress });
```

---

### ShareTransfer

**路径：** `lib/share/transfer.js`

**功能：** 分享转存

**方法：**
```javascript
const share = new ShareTransfer(cookie);

// 解析分享码
const parsed = share.parseShareCode('https://115.com/s/abc123#xyzw');

// 获取分享详情
const info = await share.getShareInfo(shareCode, password);

// 转存文件
await share.transferFile(fileId, shareCode, targetCid, password);

// 批量转存
await share.batchTransfer(fileIds, shareCode, targetCid, password, { onProgress });

// 一键转存全部
await share.transferAll(shareCode, targetCid, password, { onProgress });

// 创建分享
const shareInfo = await share.createShare(fid, { shareTime, needPassword, password });
```

---

### LixianDownload

**路径：** `lib/lixian/download.js`

**功能：** 离线下载

**方法：**
```javascript
const lixian = new LixianDownload(cookie);

// 添加磁力任务
await lixian.addMagnet(magnetUrl, targetCid);

// 添加 HTTP 任务
await lixian.addHttp(url, targetCid);

// 获取任务列表
const list = await lixian.getTaskList({ page, size });

// 获取任务详情
const detail = await lixian.getTaskDetail(taskId);

// 删除任务
await lixian.deleteTask(taskIds);

// 清空已完成
await lixian.clearCompleted();

// 获取统计
const stats = await lixian.getTaskStats();
```

---

### SmartOrganizer

**路径：** `lib/organizer/smart-organizer.js`

**功能：** 智能整理

**方法：**
```javascript
const organizer = new SmartOrganizer(cookie);

// 按类型整理
await organizer.autoOrganizeByType(sourceCid, targetBase, { dryRun, onProgress });

// 按时间整理
await organizer.autoOrganizeByTime(sourceCid, targetBase, { onProgress });

// 查找重复文件
const duplicates = await organizer.findDuplicates(sourceCid, { recursive });

// 获取清理建议
const suggestions = await organizer.getCleanupSuggestions(sourceCid);
```

---

## 错误码

### 通用错误

| 错误码 | 说明 | 处理方法 |
|--------|------|----------|
| `AUTH_ERROR` | 认证失败 | 重新登录 |
| `COOKIE_EXPIRED` | Cookie 过期 | 重新登录 |
| `NETWORK_ERROR` | 网络错误 | 检查网络后重试 |
| `RATE_LIMIT` | 速率限制 | 等待后重试 |

### API 错误

| 错误码 | 说明 | 处理方法 |
|--------|------|----------|
| `FILE_NOT_FOUND` | 文件不存在 | 检查文件 ID |
| `SPACE_FULL` | 空间不足 | 清理空间 |
| `SHARE_EXPIRED` | 分享已失效 | 联系分享者 |
| `PASSWORD_ERROR` | 提取码错误 | 检查提取码 |
| `TASK_EXISTS` | 任务已存在 | 无需重复添加 |

---

## 使用示例

### 完整流程示例

```javascript
const Skill115Master = require('./index');

// 初始化 Skill
const skill = new Skill115Master(agent);

// 处理消息
const response = await skill.handle('登录 115');

// 处理转存
const response = await skill.handle('https://115.com/s/abc123 密码：xyzw');

// 处理离线下载
const response = await skill.handle('magnet:?xt=urn:btih:...');
```

---

**文档版本：** v1.0.0  
**维护者：** DocBot  
**最后更新：** 2026-03-14
