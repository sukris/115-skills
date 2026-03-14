# 115 网盘自动化登录方案

> 更新日期：2026-03-14  
> 版本：v2.0.0

---

## 🎯 需求背景

由于使用场景限制，**不能依赖人工导入 Cookie**，需要完全自动化的扫码登录方案。

---

## 🔍 API 调研结果

### 测试的 API 端点

| API 端点 | 状态 | 响应 |
|---------|------|------|
| `https://passportapi.115.com/app/qrcode` | ❌ 404 | Not Found |
| `https://webapi.115.com/qrcode/login` | ❌ 404 | Not Found |
| `https://115.com/qrcode/login` | ❌ 404 | Not Found |
| `https://passport.115.com/qrcode` | ❌ 404 | Not Found |
| `https://115.com/?ct=ajax&ac=qrcode` | ❌ 空 | 无响应 |
| `https://passportapi.115.com/app/1.0/web/1.0/check/sso` | ✅ 可用 | 需 Cookie |

### 结论

**115 网盘已不再提供公开的扫码登录 API**。目前仅内部 APP 和网页版使用私有 API。

---

## ✅ 解决方案

### 方案一：Puppeteer 自动化浏览器（推荐 ⭐⭐⭐⭐⭐）

使用 Puppeteer 启动无头浏览器，自动打开 115 登录页面并截取二维码。

#### 优点
- ✅ 完全自动化
- ✅ 无需人工干预
- ✅ 使用官方网页版，稳定可靠
- ✅ 自动获取 Cookie

#### 缺点
- ⚠️ 需要安装 Chromium（约 170MB）
- ⚠️ 启动速度较慢（3-5 秒）
- ⚠️ 需要更多系统资源

#### 实现代码

已创建 `lib/auth-puppeteer.js`：

```javascript
const puppeteer = require('puppeteer');
const AuthPuppeteer = require('./lib/auth-puppeteer');

async function login() {
  const auth = new AuthPuppeteer();
  
  // 生成二维码
  const qrResult = await auth.generateQRCode();
  if (!qrResult.success) {
    console.error('生成二维码失败:', qrResult.error);
    return;
  }
  
  // 显示二维码（终端或图片）
  console.log('请扫描二维码登录...');
  
  // 等待登录
  const result = await auth.waitForLogin();
  
  if (result.success) {
    console.log('登录成功！');
    console.log('用户 ID:', result.cookie.uid);
  } else {
    console.error('登录失败:', result.error);
  }
}
```

#### 安装依赖

```bash
cd /home/kris/.openclaw/skills/115-skills
npm install puppeteer --save
```

#### 使用示例

```bash
node -e "
const AuthPuppeteer = require('./lib/auth-puppeteer');

async function test() {
  const auth = new AuthPuppeteer();
  const result = await auth.generateQRCode();
  console.log(result);
}

test();
"
```

---

### 方案二：115 开放平台 API（如果可用）

检查 115 是否有开放平台 API：

1. 访问 [open.115.com](https://open.115.com)
2. 注册开发者账号
3. 创建应用获取 App Key
4. 使用 OAuth 2.0 授权

**注意：** 115 开放平台可能已关闭或不对外。

---

### 方案三：定期同步 Cookie（备选）

如果 Puppeteer 方案不可行，可以：

1. 在可用环境中登录 115
2. 导出 Cookie 到文件
3. 定期（每 90 天）更新 Cookie
4. 程序自动读取 Cookie 文件

#### Cookie 文件位置

```
~/.openclaw/skills/115-skills/.data/cookie.json
```

#### Cookie 格式

```json
{
  "uid": "用户 ID",
  "cid": "会话 ID",
  "seid": "安全密钥",
  "kid": "密钥 ID",
  "expireAt": 1773460663305
}
```

---

## 🛠️ 实现细节

### Puppeteer 方案核心代码

#### 1. 启动浏览器

```javascript
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
});
```

#### 2. 访问登录页面

```javascript
const page = await browser.newPage();
await page.goto('https://115.com/', {
  waitUntil: 'networkidle2',
  timeout: 30000
});
```

#### 3. 截取二维码

```javascript
const qrcodeElement = await page.$('canvas, img[src*="qrcode"], .qrcode');
const screenshot = await qrcodeElement.screenshot();
const qrImageBase64 = screenshot.toString('base64');
```

#### 4. 轮询检查登录状态

```javascript
while (count < maxPollCount) {
  const currentUrl = page.url();
  if (currentUrl.includes('115.com/user')) {
    // 登录成功
    const cookies = await page.cookies();
    return parseCookies(cookies);
  }
  await sleep(3000);
}
```

#### 5. 提取 Cookie

```javascript
function parseCookies(cookies) {
  const cookieMap = {};
  cookies.forEach(c => {
    cookieMap[c.name.toLowerCase()] = c.value;
  });
  
  return {
    uid: cookieMap.uid,
    cid: cookieMap.cid,
    seid: cookieMap.seid,
    kid: cookieMap.kid,
    expireAt: Date.now() + 7776000000
  };
}
```

---

## 📋 部署注意事项

### 系统要求

- Node.js >= 18.0.0
- 内存 >= 512MB
- 磁盘空间 >= 200MB（Puppeteer + Chromium）

### Docker 部署

```dockerfile
FROM node:18-alpine

# 安装 Chromium 依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 设置 Puppeteer 使用系统 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["node", "index.js"]
```

### Linux 服务器

```bash
# 安装依赖
sudo apt-get install -y \
    chromium-browser \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1
```

---

## 🔧 故障排查

### 问题 1：Puppeteer 启动失败

**错误：** `Error: Failed to launch the browser process`

**解决：**
```bash
# 安装缺失的依赖
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1
```

### 问题 2：二维码截取失败

**错误：** `Error: Node is either not clickable or not an Element`

**解决：**
- 增加等待时间
- 检查页面是否完全加载
- 尝试使用 `page.waitForSelector()` 等待元素

### 问题 3：登录超时

**错误：** `Error: Navigation timeout exceeded`

**解决：**
- 增加超时时间
- 检查网络连接
- 使用 `waitUntil: 'domcontentloaded'` 代替 `networkidle2`

---

## 📚 参考资料

- [Puppeteer 官方文档](https://pptr.dev/)
- [115drive-webdav](https://github.com/gaoyb7/115drive-webdav)
- [115Master](https://github.com/cbingb666/115master)

---

## 📝 更新日志

### v2.0.0 (2026-03-14)
- ✅ 添加 Puppeteer 自动化登录方案
- ✅ 创建 auth-puppeteer.js 模块
- ✅ 创建 auth-web.js 模块
- ✅ 添加 Docker 部署指南
- ✅ 添加故障排查章节

### v1.0.0 (2026-03-14)
- ✅ 初始版本
- ✅ Cookie 导入方案

---

**推荐使用 Puppeteer 方案实现完全自动化登录！** ⭐
