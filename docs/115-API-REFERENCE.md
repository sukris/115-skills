# 115 API 接口说明文档

> **版本：** v1.0  
> **更新日期：** 2026-03-14  
> **测试状态：** ✅ 已实测  
> **维护者：** 115 Skills Team

---

## 📋 目录

1. [基础信息](#基础信息)
2. [认证模块](#认证模块)
3. [文件浏览模块](#文件浏览模块)
4. [文件操作模块](#文件操作模块)
5. [文件传输模块](#文件传输模块)
6. [分享转存模块](#分享转存模块)
7. [离线下载模块](#离线下载模块)
8. [用户模块](#用户模块)

---

## 基础信息

### API 域名

| 域名 | 用途 | 状态 |
|------|------|------|
| `https://webapi.115.com` | 主要 API | ✅ 可用 |
| `https://passportapi.115.com` | 认证 API | ✅ 可用 |
| `https://qrcodeapi.115.com` | 二维码 API | ✅ 可用 |
| `https://115.com/web/lixian/` | 离线下载 | ✅ 可用 |

### 请求头要求

```http
Cookie: <完整 Cookie 字符串>
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
Accept: application/json, text/javascript, */*; q=0.01
Accept-Language: zh-CN,zh;q=0.9
Referer: https://115.com/
Origin: https://115.com
```

### Cookie 必需字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `UID` | 用户 ID | `7321552_A1_1773495984` |
| `CID` | 会话 ID | `611e9c4b7687619ec93fc112fd5f45bb` |
| `SEID` | 加密会话凭证 | `f8baa4a57741e4e03b4c40bf...` |
| `KID` | 密钥 ID | `75a6cf2246e51887b2c7e9523d44cb13` |
| `PHPSESSID` | PHP 会话 | `d8ap02mafii9878se6jata112u` |
| `acw_tc` | 安全令牌 | `2f6a1fa817734956911935085e2c06676f795c57f75ca800f8c3e61e87c95d` |
| `USERSESSIONID` | 用户会话 ID | `62a7716c2e149b2d8538d77ead206d492c22f132021777a26f34c552fd1f6b8e` |
| `loginType` | 登录类型 | `1` |
| `115_lang` | 语言 | `zh` |

---

## 认证模块

### 1. 获取二维码 Token

**状态：** ✅ 可用

**端点：**
```
GET https://qrcodeapi.115.com/api/1.0/web/1.0/token/
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_` | number | 是 | 时间戳，防缓存 |

**请求示例：**
```bash
curl 'https://qrcodeapi.115.com/api/1.0/web/1.0/token/?_=1773497285'
```

**返回结果：**
```json
{
  "state": 1,
  "code": 0,
  "message": "",
  "data": {
    "uid": "44a54077c2e6a539027094da1f71abc9097afe27",
    "time": 1773497242,
    "sign": "03146380aa3915df7541...",
    "qrcode": "https://115.com/scan/dg-44a54077c2e6a539027094da1f..."
  }
}
```

**字段说明：**
- `uid`: 二维码唯一标识
- `time`: 时间戳
- `sign`: 签名
- `qrcode`: 二维码 URL

---

### 2. 查询二维码状态

**状态：** ✅ 可用

**端点：**
```
GET https://qrcodeapi.115.com/get/status/
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `uid` | string | 是 | 二维码 UID |
| `time` | number | 是 | 时间戳 |
| `sign` | string | 是 | 签名 |
| `_` | number | 是 | 防缓存 |

**请求示例：**
```bash
curl 'https://qrcodeapi.115.com/get/status/?uid=xxx&time=xxx&sign=xxx&_='
```

**返回结果：**
```json
{
  "state": 1,
  "data": {
    "status": 0
  }
}
```

**status 说明：**
- `0`: 等待扫码
- `1`: 已扫码，待确认
- `2`: 已确认，可登录
- `-1`: 二维码已过期
- `-2`: 扫码已取消

---

### 3. 确认登录获取 Cookie

**状态：** ✅ 可用

**端点：**
```
POST https://qrcodeapi.115.com/post/qrcode
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `uid` | string | 是 | 二维码 UID |
| `time` | number | 是 | 时间戳 |
| `sign` | string | 是 | 签名 |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**返回结果：**
```json
{
  "state": 1,
  "data": {
    "cookie": "UID=...; CID=...; SEID=...; ..."
  }
}
```

---

## 文件浏览模块

### 1. 文件列表

**状态：** ✅ 可用

**端点：**
```
GET https://webapi.115.com/files
```

**参数：**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `cid` | string | 是 | - | 目录 ID，根目录为 0 |
| `offset` | number | 否 | 0 | 偏移量 |
| `limit` | number | 否 | 20 | 返回数量 |
| `show_dir` | number | 否 | 1 | 是否显示目录 |
| `format` | string | 否 | json | 返回格式 |

**请求示例：**
```bash
curl 'https://webapi.115.com/files?cid=0&offset=0&limit=20&show_dir=1' \
  -H 'Cookie: <完整 Cookie>'
```

**返回结果：**
```json
{
  "state": true,
  "count": 8,
  "data": [
    {
      "fid": "3384653334588685427",
      "file_name": "test-dir",
      "file_type": 0,
      "create_time": 1773497285,
      "update_time": 1773497285
    }
  ]
}
```

**字段说明：**
- `state`: 请求状态
- `count`: 文件总数
- `data`: 文件列表
- `fid`: 文件 ID
- `file_name`: 文件名
- `file_type`: 文件类型 (0=目录，1=文件)

---

### 2. 用户设置

**状态：** ✅ 可用

**端点：**
```
GET https://webapi.115.com/user/setting
```

**参数：** 无

**请求示例：**
```bash
curl 'https://webapi.115.com/user/setting' \
  -H 'Cookie: <完整 Cookie>'
```

**返回结果：**
```json
{
  "state": true,
  "data": {
    "user_id": "7321552",
    "user_name": "xxx",
    "settings": {}
  }
}
```

---

### 3. 用户信息

**状态：** ❌ 不可用（返回错误）

**端点：**
```
GET https://webapi.115.com/user/mine
```

**参数：** 无

**返回结果：**
```json
{
  "state": false,
  "error": "登录超时，请重新登录。"
}
```

---

## 文件操作模块

### 1. 创建目录

**状态：** ✅ 可用

**端点：**
```
POST https://webapi.115.com/files/add
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pid` | string | 是 | 父目录 ID，根目录为 0 |
| `cname` | string | 是 | 目录名称 |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**请求示例：**
```bash
curl -X POST 'https://webapi.115.com/files/add' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'pid=0&cname=test-dir'
```

**返回结果：**
```json
{
  "state": true,
  "cid": "3384653334588685427",
  "data": {
    "cid": "3384653334588685427",
    "file_name": "test-dir",
    "create_time": 1773497285
  }
}
```

---

### 2. 重命名文件/目录

**状态：** ✅ 可用

**端点：**
```
POST https://webapi.115.com/files/edit
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件/目录 ID |
| `file_name` | string | 是 | 新名称 |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**请求示例：**
```bash
curl -X POST 'https://webapi.115.com/files/edit' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'fid=3384653334588685427&file_name=new-name'
```

**返回结果：**
```json
{
  "state": true,
  "data": {
    "fid": "3384653334588685427",
    "file_name": "new-name"
  }
}
```

---

### 3. 移动文件/目录

**状态：** ✅ 可用

**端点：**
```
POST https://webapi.115.com/files/move
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件/目录 ID（多个用逗号分隔） |
| `pid` | string | 是 | 目标目录 ID |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**请求示例：**
```bash
curl -X POST 'https://webapi.115.com/files/move' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'fid=3384653334588685427&pid=0'
```

**返回结果：**
```json
{
  "state": true,
  "success": true
}
```

---

### 4. 复制文件/目录

**状态：** ✅ 可用

**端点：**
```
POST https://webapi.115.com/files/copy
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件/目录 ID（多个用逗号分隔） |
| `pid` | string | 是 | 目标目录 ID |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**请求示例：**
```bash
curl -X POST 'https://webapi.115.com/files/copy' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'fid=3384653334588685427&pid=0'
```

**返回结果：**
```json
{
  "state": true,
  "success": true
}
```

---

### 5. 删除文件/目录

**状态：** ❌ 不稳定（服务器返回"开小差"）

**端点：**
```
POST https://webapi.115.com/files/delete
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件/目录 ID（多个用逗号分隔） |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**请求示例：**
```bash
curl -X POST 'https://webapi.115.com/files/delete' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'fid=3384653334588685427'
```

**返回结果（失败）：**
```json
{
  "state": false,
  "error": "服务器开小差了，稍后再试吧",
  "errno": 0
}
```

---

## 文件传输模块

### 1. 获取上传签名

**状态：** ❌ 不可用（404）

**端点：**
```
GET https://webapi.115.com/upload
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | 是 | `initupload` |
| `target` | string | 是 | `U` |
| `filename` | string | 是 | 文件名 |
| `filesize` | number | 是 | 文件大小 |

**返回结果：**
```
404 Not Found
```

---

### 2. 秒传检测

**状态：** ❌ 不可用（404）

**端点：**
```
GET https://webapi.115.com/upload
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | 是 | `check` |
| `sig` | string | 是 | 文件 SHA1 哈希 |
| `target` | string | 是 | `U` |

**返回结果：**
```
404 Not Found
```

---

### 3. 获取下载链接

**状态：** ✅ 可用

**端点：**
```
GET https://webapi.115.com/files/download
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件 ID |

**请求示例：**
```bash
curl 'https://webapi.115.com/files/download?fid=xxx' \
  -H 'Cookie: <完整 Cookie>'
```

**返回结果：**
```json
{
  "state": true,
  "data": {
    "url": "https://.../download?..."
  }
}
```

---

### 4. 批量下载

**状态：** ✅ 可用

**端点：**
```
POST https://webapi.115.com/files/download_batch
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件 ID（多个用逗号分隔） |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
```

**返回结果：**
```json
{
  "state": true
}
```

---

## 分享转存模块

### 1. 创建分享

**状态：** ❌ 不可用（API 返回错误）

**端点：**
```
POST https://webapi.115.com/share/send
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fid` | string | 是 | 文件 ID |
| `is_asc` | number | 否 | 排序 |
| `offset` | number | 否 | 偏移量 |
| `limit` | number | 否 | 数量 |
| `show_dir` | number | 否 | 显示目录 |
| `receive_dirs` | number | 否 | 接收目录 |

**返回结果（失败）：**
```json
{
  "state": false,
  "error": "..."
}
```

---

### 2. 分享列表

**状态：** ❌ 不可用（API 返回错误）

**端点：**
```
GET https://webapi.115.com/share
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `offset` | number | 否 | 偏移量 |
| `limit` | number | 否 | 数量 |

**返回结果（失败）：**
```json
{
  "state": false,
  "error": "..."
}
```

---

## 离线下载模块

### 1. 离线任务列表

**状态：** ✅ 可用

**端点：**
```
GET https://115.com/web/lixian/?ct=lixian&ac=task_lists
```

**参数：** 无

**请求头：**
```
Referer: https://115.com/?tab=lixian
```

**请求示例：**
```bash
curl 'https://115.com/web/lixian/?ct=lixian&ac=task_lists' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Referer: https://115.com/?tab=lixian'
```

**返回结果：**
```json
{
  "state": true,
  "data": {
    "tasks": []
  }
}
```

---

### 2. 添加离线下载（URL）

**状态：** ✅ 可用

**端点：**
```
POST https://115.com/web/lixian/?ct=lixian&ac=add_task_url
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 下载 URL |

**请求头：**
```
Content-Type: application/x-www-form-urlencoded
Referer: https://115.com/?tab=lixian
```

**请求示例：**
```bash
curl -X POST 'https://115.com/web/lixian/?ct=lixian&ac=add_task_url' \
  -H 'Cookie: <完整 Cookie>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Referer: https://115.com/?tab=lixian' \
  -d 'url=http://example.com/test.txt'
```

**返回结果：**
```json
{
  "state": true,
  "data": {
    "task_id": "xxx"
  }
}
```

---

## 用户模块

### 1. 账户信息

**状态：** ❌ 不可用（404）

**端点：**
```
GET https://webapi.115.com/account
```

**参数：** 无

**返回结果：**
```
404 Not Found
```

---

## 📊 API 可用性汇总

### ✅ 可用 API（13 个）

| 模块 | API | 端点 |
|------|-----|------|
| 认证 | 获取二维码 Token | `GET /api/1.0/web/1.0/token/` |
| 认证 | 查询二维码状态 | `GET /get/status/` |
| 认证 | 确认登录 | `POST /post/qrcode` |
| 文件浏览 | 文件列表 | `GET /files` |
| 文件浏览 | 用户设置 | `GET /user/setting` |
| 文件操作 | 创建目录 | `POST /files/add` |
| 文件操作 | 重命名 | `POST /files/edit` |
| 文件操作 | 移动 | `POST /files/move` |
| 文件操作 | 复制 | `POST /files/copy` |
| 文件传输 | 获取下载链接 | `GET /files/download` |
| 文件传输 | 批量下载 | `POST /files/download_batch` |
| 离线下载 | 任务列表 | `GET /web/lixian/?ct=lixian&ac=task_lists` |
| 离线下载 | 添加任务 | `POST /web/lixian/?ct=lixian&ac=add_task_url` |

### ❌ 不可用 API（8 个）

| 模块 | API | 端点 | 原因 |
|------|-----|------|------|
| 文件浏览 | 用户信息 | `GET /user/mine` | 返回错误 |
| 文件操作 | 删除 | `POST /files/delete` | 服务器不稳定 |
| 文件传输 | 获取上传签名 | `GET /upload` | 404 |
| 文件传输 | 秒传检测 | `GET /upload` | 404 |
| 分享转存 | 创建分享 | `POST /share/send` | 返回错误 |
| 分享转存 | 分享列表 | `GET /share` | 返回错误 |
| 用户 | 账户信息 | `GET /account` | 404 |

---

## 🔧 代码示例

### Node.js - 文件列表

```javascript
const axios = require('axios');

async function getFileList(cid = '0') {
  const response = await axios.get('https://webapi.115.com/files', {
    params: { cid, offset: 0, limit: 20, show_dir: 1 },
    headers: {
      Cookie: '<完整 Cookie>',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://115.com/'
    }
  });
  
  return response.data;
}
```

### Node.js - 创建目录

```javascript
async function createFolder(parentId = '0', folderName) {
  const response = await axios.post('https://webapi.115.com/files/add',
    `pid=${parentId}&cname=${encodeURIComponent(folderName)}`,
    {
      headers: {
        Cookie: '<完整 Cookie>',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://115.com/'
      }
    }
  );
  
  return response.data;
}
```

### Node.js - 重命名

```javascript
async function renameFile(fileId, newName) {
  const response = await axios.post('https://webapi.115.com/files/edit',
    `fid=${fileId}&file_name=${encodeURIComponent(newName)}`,
    {
      headers: {
        Cookie: '<完整 Cookie>',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://115.com/'
      }
    }
  );
  
  return response.data;
}
```

---

## 📝 注意事项

1. **Cookie 有效期** - 浏览器复制的 Cookie 几小时后失效，建议使用扫码登录获取长期 Cookie
2. **请求频率** - 避免短时间内大量请求，可能触发限流
3. **参数编码** - 中文参数需要 URL 编码
4. **POST 请求** - 必须使用 `application/x-www-form-urlencoded` 内容类型
5. **Referer 头** - 必须设置正确的 Referer，否则可能返回错误

---

**文档维护：** 115 Skills Team  
**最后更新：** 2026-03-14 22:30  
**测试环境：** 真实 115 环境 + 真实 Cookie
