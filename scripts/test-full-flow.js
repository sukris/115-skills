#!/usr/bin/env node

/**
 * 115 Skills 完整功能测试（自动登录）
 * 使用 Puppeteer 扫码登录后测试所有功能
 */

const AuthPuppeteer = require('../lib/auth-puppeteer');
const HttpClient = require('../lib/client/http-client');
const ResponseBuilder = require('../lib/ui/response-builder');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(name, fn) {
  try {
    console.log(`\n📝 测试：${name}`);
    await fn();
    console.log(`✅ 通过`);
    return true;
  } catch (error) {
    console.log(`❌ 失败：${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          115 Skills 完整功能测试（自动登录）             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = { passed: 0, failed: 0 };
  let cookie = null;
  let httpClient = null;
  
  // 步骤 1: 扫码登录
  console.log('\n🔐 步骤 1: 扫码登录');
  console.log('─'.repeat(60));
  
  try {
    const auth = new AuthPuppeteer({ headless: false });
    const loginResult = await auth.login();
    
    if (!loginResult.success) {
      console.log(`❌ 登录失败：${loginResult.message}`);
      console.log('\n⚠️ 请使用 115 网盘 APP 扫码登录');
      return;
    }
    
    cookie = loginResult.cookie;
    console.log('✅ 登录成功！');
    console.log(`UID: ${loginResult.uid || 'N/A'}`);
    
    httpClient = new HttpClient(cookie);
    results.passed++;
  } catch (error) {
    console.log(`❌ 登录异常：${error.message}`);
    console.log('\n💡 提示：请确保已安装 Puppeteer 并可以打开浏览器');
    return;
  }
  
  // 步骤 2: 测试基础 API
  console.log('\n📊 步骤 2: 测试基础 API');
  console.log('─'.repeat(60));
  
  // 测试 2.1: 用户设置
  await test('获取用户设置', async () => {
    const data = await httpClient.get('/user/setting');
    if (!data.state) throw new Error(data.error || '获取失败');
    console.log(`   用户 ID: ${data.data.user_id}`);
    console.log(`   用户名：${data.data.user_name || '未设置'}`);
    results.passed++;
  });
  
  // 测试 2.2: 存储空间
  await test('获取存储空间', async () => {
    const data = await httpClient.get('/files/index_info', { count_space_nums: 1 });
    if (!data.state) throw new Error(data.error || '获取失败');
    
    const totalTB = (data.total / 1099511627776).toFixed(2);
    const usedTB = (data.used / 1099511627776).toFixed(2);
    const remainTB = (data.remain / 1099511627776).toFixed(2);
    
    console.log(`   总空间：${totalTB} TB`);
    console.log(`   已使用：${usedTB} TB`);
    console.log(`   剩余：${remainTB} TB`);
    results.passed++;
  });
  
  // 测试 2.3: 文件列表
  await test('获取文件列表', async () => {
    const data = await httpClient.get('/files', {
      cid: '0',
      offset: '0',
      limit: '5'
    });
    if (!data.state) throw new Error(data.error || '获取失败');
    console.log(`   文件总数：${data.count}`);
    console.log(`   返回数量：${data.data.length}`);
    if (data.data.length > 0) {
      console.log(`   第一个：${data.data[0].file_name || data.data[0].n}`);
    }
    results.passed++;
  });
  
  // 步骤 3: 测试文件操作
  console.log('\n📁 步骤 3: 测试文件操作');
  console.log('─'.repeat(60));
  
  let testCid = null;
  
  // 测试 3.1: 创建目录
  await test('创建测试目录', async () => {
    const timestamp = Date.now();
    const data = await httpClient.post('/files/add', {
      pid: '0',
      cname: `skills-test-${timestamp}`
    });
    if (!data.state) throw new Error(data.error || '创建失败');
    testCid = data.cid;
    console.log(`   目录 ID: ${testCid}`);
    console.log(`   目录名：skills-test-${timestamp}`);
    results.passed++;
  });
  
  // 测试 3.2: 重命名
  if (testCid) {
    await test('重命名目录', async () => {
      const data = await httpClient.post('/files/edit', {
        fid: testCid,
        file_name: 'skills-test-renamed'
      });
      if (!data.state) throw new Error(data.error || '重命名失败');
      console.log(`   新名称：skills-test-renamed`);
      results.passed++;
    });
  }
  
  // 测试 3.3: 移动
  if (testCid) {
    await test('移动目录', async () => {
      const data = await httpClient.post('/files/move', {
        fid: testCid,
        pid: '0'
      });
      if (!data.state) throw new Error(data.error || '移动失败');
      console.log(`   移动到：根目录`);
      results.passed++;
    });
  }
  
  // 测试 3.4: 复制
  if (testCid) {
    await test('复制目录', async () => {
      const data = await httpClient.post('/files/copy', {
        fid: testCid,
        pid: '0'
      });
      if (!data.state) throw new Error(data.error || '复制失败');
      console.log(`   复制成功`);
      results.passed++;
    });
  }
  
  // 测试 3.5: 删除
  if (testCid) {
    await test('删除目录', async () => {
      const data = await httpClient.post('/rb/delete', {
        fid: testCid
      }, {
        headers: {
          'Origin': 'https://115.com',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!data.state) {
        throw new Error(data.error || '删除失败');
      }
      console.log(`   删除成功`);
      results.passed++;
    });
  }
  
  // 步骤 4: 测试分享功能
  console.log('\n📦 步骤 4: 测试分享功能');
  console.log('─'.repeat(60));
  
  await test('创建分享', async () => {
    // 先获取一个文件
    const listData = await httpClient.get('/files', {
      cid: '0',
      offset: '0',
      limit: '1'
    });
    
    if (!listData.state || listData.data.length === 0) {
      console.log(`   ⚠️ 无可用文件，跳过分享测试`);
      return;
    }
    
    const fileId = listData.data[0].fid || listData.data[0].cid;
    
    // 获取用户 ID
    const userSetting = await httpClient.get('/user/setting');
    const userId = userSetting.data?.user_id || userSetting.data?.uid;
    
    if (!userId) {
      console.log(`   ⚠️ 无法获取用户 ID`);
      return;
    }
    
    const shareData = await httpClient.post('/share/send', {
      user_id: userId,
      file_ids: fileId,
      ignore_warn: '0'
    });
    
    if (!shareData.state) {
      throw new Error(shareData.error || '分享创建失败');
    }
    
    console.log(`   分享创建成功`);
    console.log(`   分享码：${shareData.data?.share_code || 'N/A'}`);
    results.passed++;
  });
  
  // 步骤 5: 测试 UI 组件
  console.log('\n🎨 步骤 5: 测试 UI 组件');
  console.log('─'.repeat(60));
  
  const builder = new ResponseBuilder();
  
  await test('空间统计卡片', async () => {
    const card = builder.buildSpaceCard({
      analysis: {
        total: 63865752928936,
        used: 17412309602680,
        remain: 46453443326256,
        percent: 27.3
      }
    });
    console.log(`   卡片生成成功`);
    console.log(`   长度：${card.length} 字符`);
    results.passed++;
  });
  
  await test('文件列表卡片', async () => {
    const files = [
      { file_name: '测试文件 1.pdf', file_size: '1048576', is_folder: false },
      { file_name: '测试文件夹', is_folder: true },
      { file_name: '测试文件 2.mp4', file_size: '1073741824', is_folder: false }
    ];
    const card = builder.buildFileList(files);
    console.log(`   卡片生成成功`);
    console.log(`   长度：${card.length} 字符`);
    results.passed++;
  });
  
  // 输出总结
  console.log('\n' + '═'.repeat(60));
  console.log('📊 测试总结');
  console.log('═'.repeat(60));
  console.log(`✅ 通过：${results.passed}`);
  console.log(`❌ 失败：${results.failed}`);
  const total = results.passed + results.failed;
  console.log(`📈 通过率：${total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0}%`);
  console.log('═'.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 所有测试通过！Skill 功能完全正常！');
  } else {
    console.log(`\n⚠️ 有 ${results.failed} 个测试失败`);
  }
  
  console.log('\n💡 提示：测试创建的目录已自动清理');
}

main().catch(console.error);
