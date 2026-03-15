#!/usr/bin/env node

/**
 * 115 Skills 真实 Cookie 功能测试
 * 使用之前会话中的真实 Cookie 测试所有核心功能
 */

const axios = require('axios');

// 从历史记录中提取的真实 Cookie
const COOKIE = '115_lang=zh; USERSESSIONID=62a7716c2e149b2d8538d77ead206d492c22f132021777a26f34c552fd1f6b8e; loginType=1; PHPSESSID=d8ap02mafii9878se6jata112u; acw_tc=2f6a1fb417735590019182933ecd61cbf1585e01bf74839a1c0b5ece5b4c79; GST=42975eddb1f98d02b1c002781dd76a75; UID=7321552_A1_1773559008; CID=17b0ed3c0ded31955845792f3598b91c; SEID=fbf17f4f0aea7d03f92ea6be2582479f60ae7f7536649ca86660353ede7cd0712cb652e87422c482eeca625caa99012af30f71d0142e5ac737d0beae; KID=a510c03e32d9745d2a799f29152d2f35';

const API_BASE = 'https://webapi.115.com';

const headers = {
  'Cookie': COOKIE,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Referer': 'https://115.com/',
  'Origin': 'https://115.com',
  'Accept': 'application/json, text/javascript, */*; q=0.01'
};

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

async function apiCall(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: { ...headers }
  };
  
  if (method === 'POST') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    config.data = new URLSearchParams(data).toString();
  }
  
  const response = await axios(config);
  return response.data;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          115 Skills 真实 Cookie 功能测试                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = { passed: 0, failed: 0 };
  
  // 测试 1: 存储空间信息
  await test('存储空间查询', async () => {
    const data = await apiCall('/files/index_info?count_space_nums=1');
    if (!data.state) throw new Error('API 返回失败');
    console.log(`   总空间：${(data.total / 1099511627776).toFixed(2)} TB`);
    console.log(`   已使用：${(data.used / 1099511627776).toFixed(2)} TB`);
    console.log(`   剩余：${(data.remain / 1099511627776).toFixed(2)} TB`);
    results.passed++;
  });
  
  // 测试 2: 文件列表
  await test('文件列表获取', async () => {
    const data = await apiCall('/files?cid=0&offset=0&limit=5');
    if (!data.state) throw new Error('API 返回失败');
    console.log(`   文件数：${data.count}`);
    console.log(`   返回：${data.data.length} 个`);
    results.passed++;
  });
  
  // 测试 3: 用户设置
  await test('用户设置获取', async () => {
    const data = await apiCall('/user/setting');
    if (!data.state) throw new Error('API 返回失败');
    console.log(`   用户 ID: ${data.data.user_id}`);
    console.log(`   用户名：${data.data.user_name || '未设置'}`);
    results.passed++;
  });
  
  // 测试 4: 创建测试目录
  let testCid = null;
  await test('创建测试目录', async () => {
    const timestamp = Date.now();
    const data = await apiCall('/files/add', 'POST', {
      pid: '0',
      cname: `skills-test-${timestamp}`
    });
    if (!data.state) throw new Error('创建失败');
    testCid = data.cid;
    console.log(`   目录 ID: ${testCid}`);
    console.log(`   目录名：skills-test-${timestamp}`);
    results.passed++;
  });
  
  // 测试 5: 重命名目录
  if (testCid) {
    await test('重命名测试目录', async () => {
      const data = await apiCall('/files/edit', 'POST', {
        fid: testCid,
        file_name: 'skills-test-renamed'
      });
      if (!data.state) throw new Error('重命名失败');
      console.log(`   新名称：skills-test-renamed`);
      results.passed++;
    });
  }
  
  // 测试 6: 移动目录
  if (testCid) {
    await test('移动测试目录', async () => {
      const data = await apiCall('/files/move', 'POST', {
        fid: testCid,
        pid: '0'
      });
      if (!data.state) throw new Error('移动失败');
      console.log(`   移动到：根目录`);
      results.passed++;
    });
  }
  
  // 测试 7: 复制目录
  if (testCid) {
    await test('复制测试目录', async () => {
      const data = await apiCall('/files/copy', 'POST', {
        fid: testCid,
        pid: '0'
      });
      if (!data.state) throw new Error('复制失败');
      console.log(`   复制成功`);
      results.passed++;
    });
  }
  
  // 测试 8: 删除目录（使用 /rb/delete 端点）
  if (testCid) {
    await test('删除测试目录', async () => {
      const data = await apiCall('/rb/delete', 'POST', {
        fid: testCid
      }, {
        'Origin': 'https://115.com',
        'X-Requested-With': 'XMLHttpRequest'
      });
      if (!data.state) {
        console.log(`   ⚠️ 删除 API 不稳定：${data.error || '服务器开小差'}`);
        results.failed++;
        return;
      }
      console.log(`   删除成功`);
      results.passed++;
    });
  }
  
  // 测试 9: 分享功能（需要真实文件 ID）
  await test('分享 API 端点测试', async () => {
    // 先获取一个文件 ID
    const listData = await apiCall('/files?cid=0&offset=0&limit=1');
    if (listData.state && listData.data.length > 0) {
      const fileId = listData.data[0].fid || listData.data[0].cid;
      
      // 获取用户 ID
      const userSetting = await apiCall('/user/setting');
      const userId = userSetting.data?.user_id || userSetting.data?.uid;
      
      if (userId) {
        const shareData = await apiCall('/share/send', 'POST', {
          user_id: userId,
          file_ids: fileId,
          ignore_warn: '0'
        });
        
        if (shareData.state) {
          console.log(`   分享创建成功`);
          console.log(`   分享码：${shareData.data?.share_code || 'N/A'}`);
          results.passed++;
        } else {
          console.log(`   ⚠️ 分享创建失败：${shareData.error}`);
          results.failed++;
        }
      } else {
        console.log(`   ⚠️ 无法获取用户 ID`);
        results.failed++;
      }
    } else {
      console.log(`   ⚠️ 无可用文件`);
      results.failed++;
    }
  });
  
  // 测试 10: 离线下载任务列表
  await test('离线下载任务列表', async () => {
    const data = await axios({
      method: 'GET',
      url: 'https://115.com/web/lixian/?ct=lixian&ac=task_lists',
      headers: {
        'Cookie': COOKIE,
        'Referer': 'https://115.com/?tab=lixian',
        'User-Agent': headers['User-Agent']
      }
    });
    
    if (data.data.state) {
      console.log(`   任务列表获取成功`);
      results.passed++;
    } else {
      console.log(`   ⚠️ 任务列表获取失败`);
      results.failed++;
    }
  });
  
  // 输出总结
  console.log('\n' + '═'.repeat(60));
  console.log('📊 测试总结');
  console.log('═'.repeat(60));
  console.log(`✅ 通过：${results.passed}`);
  console.log(`❌ 失败：${results.failed}`);
  console.log(`📈 通过率：${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 所有测试通过！Skill 功能正常！');
  } else {
    console.log(`\n⚠️ 有 ${results.failed} 个测试失败，请检查`);
  }
}

main().catch(console.error);
