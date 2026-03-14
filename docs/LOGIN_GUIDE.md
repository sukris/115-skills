# 115 网盘登录方案指南

> 更新日期：2026-03-14  
> 版本：v1.0.0

---

## 📋 概述

由于 115 网盘 API 端点经常变更，扫码登录功能可能暂时不可用。**推荐使用 Cookie 导入方案**。

---

## 🔐 方案一：Cookie 导入（推荐 ⭐⭐⭐⭐⭐）

### 优点
- ✅ 稳定可靠
- ✅ 有效期长（APP Cookie 可达 90 天）
- ✅ 无需依赖 API 端点

### 步骤

#### 1. 网页版 Cookie（简单，有效期短）

1. 访问 [115.com](https://115.com) 并登录
2. 按 `F12` 打开开发者工具
3. 切换到 `Console` 标签
4. 运行以下代码：

```javascript
const c = document.cookie;
console.log(JSON.stringify({
  uid: c.match(/UID=(\d+)/)?.[1],
  cid: c.match(/CID=([^;]+)/)?.[1],
  seid: c.match(/SEID=([^;]+)/)?.[1],
  kid: c.match(/KID=([^;]+)/)?.[1],
  expireAt: Date.now() + 7776000000  // 90 天
}, null, 2));
```

5. 复制输出内容

#### 2. APP Cookie（推荐，有效期 90 天）

**iOS:**
1. 下载 [Stream](https://apps.apple.com/cn/app/stream/id1312141691) 抓包工具
2. 打开 Stream，开始抓包
3. 打开 115 APP
4. 在 Stream 中找到 `115.com` 的请求
5. 提取 Cookie 中的 `UID`, `CID`, `SEID`, `KID`

**Android:**
1. 使用抓包精灵等工具
2. 步骤同上

### 保存 Cookie

创建文件 `~/.openclaw/skills/115-cloud-master/.data/cookie.json`：

```json
{
  "uid": "123456789",
  "cid": "abcdefg",
  "seid": "hijklmn",
  "kid": "opqrstu",
  "expireAt": 1773460663305
}
```

### 验证 Cookie

```bash
cd /home/kris/.openclaw/skills/115-cloud-master
node -e "
const SessionManager = require('./lib/session');
const CookieStore = require('./lib/storage/cookie-store');

async function test() {
  const store = new CookieStore();
  const session = new SessionManager(store);
  const info = await session.getSessionInfo();
  console.log('登录状态:', info.loggedIn ? '已登录' : '未登录');
  console.log('用户 ID:', info.uid);
}

test();
"
```

---

## 📱 方案二：扫码登录（⚠️ API 可能不可用）

### 现状

经过测试，以下 API 端点**当前不可用**：

| API 端点 | 状态 | 响应 |
|---------|------|------|
| `https://passportapi.115.com/app/qrcode` | ❌ 404 | Not Found |
| `https://webapi.115.com/qrcode/login` | ❌ 错误页面 | 出错了 |
| `https://passport.115.com/qrcode` | ❌ 404 | Not Found |

### 参考开源项目

以下项目可能有可用的方案：

1. **[115drive-webdav](https://github.com/gaoyb7/115drive-webdav)** - Go 语言实现
   - 使用 Cookie 认证
   - 需要 UID, CID, SEID, KID

2. **[115Master](https://github.com/cbingb666/115master)** - 油猴脚本
   - 浏览器扩展方案
   - 直接操作网页

### 可能的解决方案

如果未来需要恢复扫码登录，可以尝试：

1. **逆向 115 网页版** - 分析网页 JS 获取真实 API
2. **使用 Puppeteer** - 自动化浏览器扫码
3. **等待官方 API 恢复**

---

## 🔧 故障排查

### 问题 1：提示"请重新登录"

**原因：** Cookie 过期或无效

**解决：**
1. 重新获取 Cookie
2. 确保包含所有字段（UID, CID, SEID, KID）
3. 检查 `expireAt` 是否过期

### 问题 2：提示"服务器开小差"

**原因：** 115 服务器维护或网络问题

**解决：**
1. 检查网络连接
2. 稍后重试
3. 使用代理（如果在海外）

### 问题 3：扫码登录不可用

**原因：** API 端点变更

**解决：**
1. 使用 Cookie 导入方案（推荐）
2. 关注项目更新
3. 提交 Issue 反馈

---

## 📚 参考资料

- [115drive-webdav](https://github.com/gaoyb7/115drive-webdav) - WebDAV 实现
- [115Master](https://github.com/cbingb666/115master) - 油猴脚本
- [115 网盘官方](https://115.com)

---

## 📝 更新日志

### v1.0.0 (2026-03-14)
- ✅ 添加 Cookie 导入详细指南
- ✅ 记录扫码登录 API 测试结果
- ✅ 提供故障排查方案

---

**推荐优先使用 Cookie 导入方案！** ⭐
