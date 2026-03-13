# 115 Cloud Master API 参考

## 认证模块

### 生成二维码
```javascript
const qrData = await auth.generateQRCode();
// 返回：{ success, qrcode, image, key, expireAt }
```

### 检查扫码状态
```javascript
const status = await auth.checkQRStatus(qrKey);
// 返回：{ success, status, cookie?, error? }
// status: 'waiting' | 'scanned' | 'logged_in' | 'expired' | 'cancelled'
```

### 完整登录流程
```javascript
await auth.login({
  onQRCode: (qr) => {},
  onStatus: (status) => {},
  onComplete: (result) => {},
  onError: (error) => {}
});
```

---

## 文件浏览 API

### 获取文件列表
```javascript
const result = await browser.listFiles(cid, { page, size, order, asc });
// 返回：{ success, files, totalCount, currentPage, hasMore }
```

### 获取文件详情
```javascript
const detail = await browser.getFileDetail(fileId);
// 返回：{ success, file }
```

### 搜索文件
```javascript
const result = await browser.searchFiles(keyword, { cid, page, size });
// 返回：{ success, files, totalCount, hasMore }
```

### 获取所有文件（分页）
```javascript
const allFiles = await browser.getAllFiles(cid, { recursive, onProgress });
// 返回：文件数组
```

---

## 文件操作 API

### 移动文件
```javascript
await ops.moveFiles(fid, targetCid);
// 返回：{ success, movedCount, targetCid, fileIds }
```

### 复制文件
```javascript
await ops.copyFiles(fid, targetCid);
// 返回：{ success, copiedCount, targetCid, fileIds }
```

### 删除文件
```javascript
await ops.deleteFiles(fid);
// 返回：{ success, deletedCount, fileIds }
```

### 重命名
```javascript
await ops.renameFile(fid, newName);
// 返回：{ success, fileId, oldName, newName }
```

### 创建文件夹
```javascript
await ops.createFolder(folderName, parentCid);
// 返回：{ success, folderId, folderName, parentCid }
```

---

## 上传下载 API

### 上传文件
```javascript
await transfer.uploadFile(filePath, targetCid, { onProgress });
// 返回：{ success, fileId, fileName, fileSize }
```

### 下载文件
```javascript
await transfer.downloadFile(fileId, savePath, { onProgress });
// 返回：{ success, fileId, fileName, fileSize, savePath }
```

---

## 分享转存 API

### 解析分享码
```javascript
const parsed = share.parseShareCode('https://115.com/s/abc123#xyzw');
// 返回：{ success, code, password, original }
```

### 获取分享详情
```javascript
const info = await share.getShareInfo(shareCode, password);
// 返回：{ success, title, files, totalCount, totalSize }
```

### 转存文件
```javascript
await share.transferFile(fileId, shareCode, targetCid, password);
// 返回：{ success, fileId, newFileId }
```

### 批量转存
```javascript
await share.batchTransfer(fileIds, shareCode, targetCid, password, { onProgress });
// 返回：{ total, success, failed, details }
```

### 一键转存全部
```javascript
await share.transferAll(shareCode, targetCid, password, { onProgress });
// 返回：{ total, success, failed, details }
```

---

## 离线下载 API

### 添加磁力任务
```javascript
await lixian.addMagnet(magnetUrl, targetCid);
// 返回：{ success, taskId, fileName, fileSize }
```

### 获取任务列表
```javascript
const list = await lixian.getTaskList({ page, size });
// 返回：{ success, tasks, totalCount, hasMore }
```

### 删除任务
```javascript
await lixian.deleteTask(taskIds);
// 返回：{ success, deletedCount, taskIds }
```

### 获取任务统计
```javascript
const stats = await lixian.getTaskStats();
// 返回：{ total, pending, downloading, completed, failed }
```

---

## 智能整理 API

### 按类型整理
```javascript
await organizer.autoOrganizeByType(sourceCid, targetBase, { dryRun, onProgress });
// 返回：{ total, moved, failed, skipped, details }
```

### 按时间整理
```javascript
await organizer.autoOrganizeByTime(sourceCid, targetBase, { dryRun, onProgress });
// 返回：{ total, moved, failed, skipped, details }
```

### 查找重复文件
```javascript
const duplicates = await organizer.findDuplicates(sourceCid, { recursive, onProgress });
// 返回：{ success, totalFiles, duplicateGroups, duplicates, potentialSavings }
```

### 获取清理建议
```javascript
const suggestions = await organizer.getCleanupSuggestions(sourceCid);
// 返回：{ success, suggestions, storageUsage }
```

---

## HTTP 客户端

### 发送请求
```javascript
const response = await http.request(endpoint, { method, params, data, headers });
```

### GET 请求
```javascript
const data = await http.get(endpoint, params);
```

### POST 请求
```javascript
const data = await http.post(endpoint, data, params);
```

### 批量请求
```javascript
const results = await http.batch(requests);
```

---

## Cookie 存储

### 保存 Cookie
```javascript
await store.save({ uid, cid, se, loginTime, expireAt });
```

### 加载 Cookie
```javascript
const cookie = await store.load();
```

### 清除 Cookie
```javascript
await store.clear();
```

### 检查存在
```javascript
const exists = store.exists();
```

---

**API 版本：** v1.0.0  
**最后更新：** 2026-03-14
