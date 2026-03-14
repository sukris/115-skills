#!/usr/bin/env node

/**
 * 115 网盘自动登录脚本
 * 
 * 使用 Puppeteer 自动化浏览器进行扫码登录
 */

const AuthPuppeteer = require('./lib/auth-puppeteer');
const SessionManager = require('./lib/session');
const CookieStore = require('./lib/storage/cookie-store');

async function main() {
  console.log('🔐 115 网盘自动登录\n');
  
  const cookieStore = new CookieStore();
  const auth = new AuthPuppeteer(cookieStore);
  
  try {
    // 1. 生成二维码
    console.log('📱 正在生成登录二维码...');
    const qrResult = await auth.generateQRCode();
    
    if (!qrResult.success) {
      console.error('❌ 生成二维码失败:', qrResult.error);
      process.exit(1);
    }
    
    console.log('✅ 二维码生成成功！\n');
    console.log('📱 请使用 115 手机 APP 扫码登录');
    console.log('⏰ 二维码有效期：5 分钟\n');
    
    // 2. 在终端显示二维码（如果支持）
    if (qrResult.image) {
      console.log('二维码图片已生成（Base64）');
      // 可以使用 qrcode-terminal 显示
      // const QRCode = require('qrcode-terminal');
      // QRCode.generate(qrResult.qrcode, { small: true });
    }
    
    // 3. 等待登录
    console.log('⏳ 等待扫码登录...\n');
    const result = await auth.waitForLogin();
    
    if (result.success) {
      console.log('✅ 登录成功！\n');
      console.log('👤 用户信息:');
      console.log('   UID:', result.cookie.uid);
      console.log('   有效期：90 天\n');
      
      // 4. 验证登录
      const session = new SessionManager(cookieStore);
      const info = await session.getSessionInfo();
      
      console.log('📊 会话信息:');
      console.log('   已登录:', info.loggedIn ? '是' : '否');
      console.log('   用户 ID:', info.uid);
      console.log('   过期时间:', info.expireAt ? new Date(info.expireAt).toLocaleString() : '未知');
      console.log('   VIP:', info.vip ? '是' : '否');
      console.log('');
      
      process.exit(0);
    } else {
      console.error('❌ 登录失败:', result.error);
      console.error('   状态:', result.status);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 登录过程出错:', error.message);
    await auth.close();
    process.exit(1);
  }
}

// 运行
main();
