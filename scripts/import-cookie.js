#!/usr/bin/env node

/**
 * 115 Cookie 导入脚本
 * 
 * 用法：node scripts/import-cookie.js [cookie 文件路径]
 */

const fs = require('fs');
const path = require('path');

const cookieStorePath = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.openclaw/115-cookie.json'
);

// 从命令行参数或默认位置读取 Cookie
const inputPath = process.argv[2] || path.join(__dirname, '../.data/cookie.json');

console.log('🔐 115 Cookie 导入工具\n');
console.log('📁 输入文件:', inputPath);
console.log('📁 输出文件:', cookieStorePath);
console.log('');

// 读取 Cookie 文件
let cookieData;
try {
  const content = fs.readFileSync(inputPath, 'utf8');
  cookieData = JSON.parse(content);
  console.log('✅ Cookie 文件读取成功\n');
} catch (error) {
  console.error('❌ 读取 Cookie 文件失败:', error.message);
  process.exit(1);
}

// 验证必要字段
const requiredFields = ['uid', 'cid', 'seid', 'kid'];
const missingFields = requiredFields.filter(f => !cookieData[f]);

if (missingFields.length > 0) {
  console.error('❌ 缺少必要字段:', missingFields.join(', '));
  console.error('');
  console.error('必要的 Cookie 字段:');
  console.error('  - uid: 用户 ID');
  console.error('  - cid: 会话 ID');
  console.error('  - seid: 安全密钥');
  console.error('  - kid: 密钥 ID');
  process.exit(1);
}

// 确保有过期时间
if (!cookieData.expireAt) {
  console.log('⚠️ 未指定过期时间，设置为 90 天后');
  cookieData.expireAt = Date.now() + 90 * 24 * 60 * 60 * 1000;
}

// 确保有登录时间
if (!cookieData.loginTime) {
  cookieData.loginTime = Date.now();
}

// 创建目录
const dir = path.dirname(cookieStorePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 保存 Cookie
fs.writeFileSync(cookieStorePath, JSON.stringify(cookieData, null, 2));

console.log('✅ Cookie 导入成功！\n');
console.log('📋 Cookie 信息:');
console.log('   UID:', cookieData.uid.substring(0, 25) + '...');
console.log('   CID:', cookieData.cid.substring(0, 25) + '...');
console.log('   KID:', cookieData.kid.substring(0, 25) + '...');
console.log('   过期时间:', new Date(cookieData.expireAt).toLocaleString());
console.log('');
console.log('🎉 现在可以使用 115-Cloud-Master 了！');
console.log('');
console.log('📝 可用命令:');
console.log('   node scripts/login.js     - 扫码登录（如果 Cookie 过期）');
console.log('   node -e "..."             - 测试 Cookie 有效性');
