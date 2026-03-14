# 115 API 参考项目汇总

> **创建日期：** 2026-03-14  
> **用途：** 115 网盘 API 开发参考  
> **最后更新：** 2026-03-14

---

## 📚 项目列表

### 1. 115-to-alist ⭐⭐⭐⭐⭐

**链接：** https://github.com/yenkn/115-to-alist  
**Stars:** 205 | **Forks:** 19  
**语言:** JavaScript (76.2%), HTML (23.8%)  
**最后更新:** 2025 年 5 月 9 日

**简介：** Chrome 插件，自动同步 115 cookie 到 alist

**核心实现：**
- 使用 `chrome.cookies.getAll()` 获取完整 Cookie
- Cookie 格式：`name=value; name=value;` 分号空格连接
- 监听 Cookie 变化自动更新

**关键代码：**
```javascript
// background.js
chrome.cookies.getAll({ domain: ".115.com" }, cookies => {
  const lastInterceptedCookie = cookies
    .filter(x => x.domain == '.115.com')
    .map(c => `${c.name}=${c.value}`)
    .join("; ");
});
```

**可借鉴点：**
- ✅ 浏览器插件方式获取 Cookie（不会过期）
- ✅ 完整 Cookie 字符串拼接方法
- ✅ Cookie 变化监听机制

---

### 2. qrcode_cookie_115 ⭐⭐⭐⭐

**链接：** https://gist.github.com/ChenyangGao/d26a592a0aeb13465511c885d5c7ad61  
**Stars:** 65 | **Forks:** 25  
**语言:** Python  
**最后更新:** 2026 年 2 月

**简介：** 扫码获取 115 cookie 的 Gist 代码

**API 端点：**
```python
# 1. 获取二维码 token
GET https://qrcodeapi.115.com/api/1.0/web/1.0/token/

# 2. 查询二维码状态
GET https://qrcodeapi.115.com/get/status/?uid=&time=&sign=

# 3. 获取登录结果（包含 Cookie）
POST https://passportapi.115.com/app/1.0/{app}/1.0/login/qrcode/
```

**可用的 App 类型：**
```
web, android, ios, linux, mac, windows, tv, alipaymini, wechatmini, qandroid
```

**用户反馈：**
- ⚠️ `windows` 客户端已失效
- ✅ 推荐 `wechatmini`（微信小程序）- 不会顶号
- ✅ 推荐 `linux` - 不会顶号

**可借鉴点：**
- ✅ 官方二维码 API 使用方式
- ✅ 扫码登录完整流程
- ✅ App 类型选择建议

---

### 3. 115-cookie-chrome-extention ⭐⭐⭐

**链接：** https://github.com/thsun6/115-cookie-chrome-extention  
**Stars:** 10  
**语言:** JavaScript  
**最后更新:** 2025 年 7 月 12 日

**简介：** 自用的基于 AI 生成的 chrome 插件，官网 api 获取登录二维码

**核心实现：**
- 基于方案 2 的 API 逻辑
- 用 Chrome 插件自动化扫码登录流程

**可借鉴点：**
- ✅ 插件 + API 混合方案
- ✅ 一键复制完整 Cookie

---

## 🔍 API 端点汇总

### 二维码登录 API

| 端点 | 方法 | 说明 | 参考项目 |
|------|------|------|---------|
| `https://qrcodeapi.115.com/api/1.0/web/1.0/token/` | GET | 获取二维码 token | qrcode_cookie_115 |
| `https://qrcodeapi.115.com/get/status/` | GET | 查询二维码状态 | qrcode_cookie_115 |
| `https://passportapi.115.com/app/1.0/{app}/1.0/login/qrcode/` | POST | 确认登录获取 Cookie | qrcode_cookie_115 |

### 文件操作 API

| 端点 | 方法 | 说明 | 参考项目 |
|------|------|------|---------|
| `https://webapi.115.com/files` | GET | 文件列表 | 115-to-alist |
| `https://webapi.115.com/files/add` | POST | 创建目录 | - |
| `https://webapi.115.com/files/rename` | POST | 重命名 | - |
| `https://webapi.115.com/files/move` | POST | 移动文件 | - |
| `https://webapi.115.com/files/copy` | POST | 复制文件 | - |
| `https://webapi.115.com/files/delete` | POST | 删除文件 | - |

### 用户信息 API

| 端点 | 方法 | 说明 | 参考项目 |
|------|------|------|---------|
| `https://passportapi.115.com/app/1.0/web/1.0/user/mine` | GET | 用户信息 | - |
| `https://webapi.115.com/account` | GET | 账户信息/存储空间 | - |

---

## 🔑 Cookie 格式要求

### 必需字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `UID` | 用户 ID | `7321552_A1_1773425566` |
| `CID` | 会话 ID | `d6be66c3ddce8185ad93b9c18d4358b9` |
| `SEID` / `SE` | 加密会话凭证 | `4e4ed0500e96442d3288cbc1d545df49...` |
| `KID` | 密钥 ID | `75a6cf2246e51887b2c7e9523d44cb13` |
| `PHPSESSID` | PHP 会话 | `d8ap02mafii9878se6jata112u` |
| `acw_tc` | 安全令牌 | `2f6a1fbb17734956908072243e75b87090cc183532974c2d20eb54b6abd92e` |
| `USERSESSIONID` | 用户会话 ID | `62a7716c2e149b2d8538d77ead206d492c22f132021777a26f34c552fd1f6b8e` |
| `loginType` | 登录类型 | `1` |
| `115_lang` | 语言 | `zh` |

### Cookie 字符串格式

```
acw_tc=...; 115_lang=zh; CID=...; PHPSESSID=...; KID=...; loginType=1; SEID=...; UID=...; USERSESSIONID=...
```

**注意：** 字段之间用 `; ` (分号 + 空格) 连接

---

## 🌐 HTTP 请求头要求

### 成功的请求头配置

```javascript
{
  'Cookie': '完整 Cookie 字符串',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Referer': 'https://115.com/?tab=index'
}
```

### POST 请求特殊要求

```javascript
{
  'Content-Type': 'application/x-www-form-urlencoded'
}
```

---

## ⚠️ 注意事项

### Cookie 有效期

| 来源 | 有效期 | 说明 |
|------|--------|------|
| 浏览器复制 | 短期（几小时） | 会话级 Cookie，浏览器关闭可能失效 |
| 扫码登录 | 长期（90 天） | 推荐 `wechatmini` 或 `linux` |

### 常见问题

1. **登录超时** - Cookie 已失效，需要重新获取
2. **字段缺失** - 必须包含所有必需字段
3. **格式错误** - 使用 `; ` 连接，不是 `,` 或 `&`
4. **App 失效** - 部分 App 类型（如 windows）已失效

### 推荐方案

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 开发测试 | 浏览器插件 | 实时获取，不会过期 |
| 生产环境 | 扫码登录 API | 长期有效，自动化 |
| 临时使用 | 手动复制 | 简单快速 |

---

## 📝 代码片段

### Node.js - 获取 Cookie 字符串

```javascript
// 从浏览器控制台复制的 Cookie 数组转换为字符串
function cookiesToString(cookies) {
  return cookies
    .filter(c => c.domain.includes('.115.com'))
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
}
```

### Node.js - 解析 Cookie 字符串

```javascript
function parseCookie(cookieString) {
  const result = {
    uid: '', cid: '', seid: '', kid: '',
    phpsessid: '', acw_tc: '', usersessionid: '',
    loginType: '1', lang: 'zh', _raw: ''
  };
  
  result._raw = cookieString;
  
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    switch (key) {
      case 'UID': result.uid = value; break;
      case 'CID': result.cid = value; break;
      case 'SEID': case 'SE': result.seid = value; break;
      case 'KID': result.kid = value; break;
      case 'PHPSESSID': result.phpsessid = value; break;
      case 'acw_tc': result.acw_tc = value; break;
      case 'USERSESSIONID': result.usersessionid = value; break;
      case 'loginType': result.loginType = value; break;
      case '115_lang': result.lang = value; break;
    }
  }
  
  return result;
}
```

### Node.js - API 请求封装

```javascript
const axios = require('axios');

async function request115(endpoint, params = {}, method = 'GET') {
  const headers = {
    Cookie: getCookieString(), // 获取完整 Cookie
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': 'https://115.com/?tab=index'
  };
  
  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  
  const response = await axios({
    method,
    url: `https://webapi.115.com${endpoint}`,
    params: method === 'GET' ? params : undefined,
    data: method === 'POST' ? params : undefined,
    headers,
    timeout: 15000
  });
  
  return response.data;
}
```

---

## 🔗 相关链接

- **115 官网:** https://115.com/
- **115 Web API:** https://webapi.115.com/
- **115 Passport API:** https://passportapi.115.com/
- **115 QRCode API:** https://qrcodeapi.115.com/

---

## 📊 项目对比

| 项目 | Stars | 方案 | Cookie 有效期 | 实现难度 | 推荐度 |
|------|-------|------|--------------|---------|--------|
| 115-to-alist | 205 | 浏览器插件 | 实时 | 中 | ⭐⭐⭐⭐⭐ |
| qrcode_cookie_115 | 65 | 扫码 API | 90 天 | 低 | ⭐⭐⭐⭐⭐ |
| 115-cookie-chrome-extention | 10 | 插件+API | 90 天 | 中 | ⭐⭐⭐⭐ |

---

**文档维护：** 115 Skills Team  
**最后更新：** 2026-03-14
