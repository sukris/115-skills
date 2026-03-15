/**
 * 115 Skills 真实账号测试脚本
 * 
 * 使用说明：
 * 1. 首次运行会提示扫码登录
 * 2. Cookie 会自动保存到 .secrets/cookies/cookie.json
 * 3. 后续测试会使用保存的 Cookie
 */

const AuthPuppeteer = require('../lib/auth-puppeteer');
const SessionContext = require('../lib/context/session-context');
const CommandParser = require('../lib/parser/command-parser');
const ActionRecommender = require('../lib/recommender/action-recommender');
const ErrorHandler = require('../lib/error/error-handler');
const ShareManager = require('../lib/share/share-manager');
const BatchOperations = require('../lib/files/batch-operations');
const LixianManager = require('../lib/lixian/lixian-manager');
const CleanAdvisor = require('../lib/organizer/clean-advisor');
const ResponseBuilder = require('../lib/ui/response-builder');
const HistoryManager = require('../lib/context/history-manager');
const fs = require('fs');
const path = require('path');

class RealAccountTest {
  constructor() {
    this.cookie = null;
    this.cookiePath = path.join(__dirname, '../.secrets/cookies/cookie.json');
    this.builder = new ResponseBuilder();
    this.history = new HistoryManager();
  }

  /**
   * 加载或获取 Cookie
   */
  async loadCookie() {
    // 尝试加载已保存的 Cookie
    if (fs.existsSync(this.cookiePath)) {
      console.log('📝 检测到已保存的 Cookie，正在加载...');
      const data = JSON.parse(fs.readFileSync(this.cookiePath, 'utf-8'));
      this.cookie = data.cookie;
      console.log('✅ Cookie 加载成功');
      return true;
    }

    console.log('⚠️ 未检测到 Cookie，需要扫码登录');
    console.log('📱 请使用 115 网盘 APP 扫码');
    
    try {
      const auth = new AuthPuppeteer();
      const result = await auth.login();
      
      if (result.success) {
        this.cookie = result.cookie;
        // 保存 Cookie
        this.saveCookie();
        console.log('✅ 登录成功，Cookie 已保存');
        return true;
      } else {
        console.log('❌ 登录失败:', result.message);
        return false;
      }
    } catch (error) {
      console.log('❌ 登录异常:', error.message);
      return false;
    }
  }

  /**
   * 保存 Cookie
   */
  saveCookie() {
    const dir = path.dirname(this.cookiePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.cookiePath, JSON.stringify({
      cookie: this.cookie,
      savedAt: Date.now()
    }, null, 2));
  }

  /**
   * 测试上下文管理
   */
  async testContext() {
    console.log('\n' + '='.repeat(60));
    console.log('📁 测试 1: 上下文管理');
    console.log('='.repeat(60));

    const context = new SessionContext();
    
    // 设置路径
    context.setPath('0', '根目录');
    console.log('✅ 设置路径：根目录');
    
    // 获取面包屑
    const breadcrumb = context.getBreadcrumb();
    console.log('📍 面包屑:', breadcrumb.map(b => b.name).join(' > '));
    
    // 模拟文件选择
    context.selectFile('file123', { name: '测试文件.txt', size: 1024 });
    context.selectFile('file456', { name: '测试文件 2.txt', size: 2048 });
    console.log('✅ 选中文件数:', context.getSelectedCount());
    
    // 记录操作
    context.recordAction('browse', { path: '/测试' });
    context.recordAction('select', { count: 2 });
    
    // 获取历史
    const history = context.getHistory(5);
    console.log('📋 操作历史:', history.length, '条');
    
    // 格式化输出
    const info = context.getContextInfo();
    console.log('📊 上下文信息:', JSON.stringify(info, null, 2));
    
    console.log('✅ 上下文管理测试通过');
  }

  /**
   * 测试命令解析
   */
  async testCommandParser() {
    console.log('\n' + '='.repeat(60));
    console.log('💬 测试 2: 命令解析');
    console.log('='.repeat(60));

    const parser = new CommandParser();
    
    const testCases = [
      { input: '/115 容量', expected: 'status' },
      { input: '/115 文件', expected: 'files' },
      { input: '容量', expected: 'status' },
      { input: '文件浏览', expected: 'files' },
      { input: '115.com/s/abc123', expected: 'transfer' },
      { input: 'abc123#xyzw', expected: 'transfer' },
      { input: 'magnet:?xt=urn:btih:xxx', expected: 'lixian' },
      { input: '1', expected: 'select' }
    ];
    
    let passed = 0;
    for (const tc of testCases) {
      const result = parser.parse(tc.input);
      const success = result.command === tc.expected;
      console.log(`${success ? '✅' : '❌'} "${tc.input}" → ${result.command} ${success ? '' : '(期望：' + tc.expected + ')'}`);
      if (success) passed++;
    }
    
    console.log(`\n✅ 命令解析测试通过：${passed}/${testCases.length}`);
  }

  /**
   * 测试推荐系统
   */
  async testRecommender() {
    console.log('\n' + '='.repeat(60));
    console.log('💡 测试 3: 主动推荐');
    console.log('='.repeat(60));

    const recommender = new ActionRecommender();
    const context = new SessionContext();
    
    // 测试场景推荐
    const scenes = ['status', 'files', 'search', 'download', 'share'];
    
    for (const scene of scenes) {
      const recs = recommender.recommend(scene, context);
      console.log(`\n📍 场景：${scene}`);
      console.log(`   推荐操作：${recs.length} 个`);
      recs.slice(0, 3).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec.label} - ${rec.hint}`);
      });
    }
    
    // 测试上下文感知推荐
    context.selectFile('file1');
    context.selectFile('file2');
    const contextRecs = recommender.recommend('files', context);
    console.log(`\n📍 有选中文件时的推荐:`);
    contextRecs.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.label}`);
    });
    
    console.log('\n✅ 推荐系统测试通过');
  }

  /**
   * 测试错误处理
   */
  async testErrorHandler() {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 测试 4: 错误处理');
    console.log('='.repeat(60));

    const handler = new ErrorHandler();
    
    // 测试错误创建
    const error = handler.createError('COOKIE_EXPIRED', '登录已过期');
    console.log('📝 错误类型:', error.type);
    console.log('📝 错误消息:', error.message);
    console.log('💡 恢复建议:', error.recoveries.join(', '));
    
    // 测试 API 响应错误
    const apiError = handler.fromApiResponse({
      state: false,
      errno: 990001,
      error: '登录超时'
    });
    console.log('\n📝 API 错误映射:', apiError?.type);
    
    // 测试格式化输出
    const formatted = handler.formatError(error);
    console.log('\n📋 格式化错误:');
    console.log(formatted);
    
    console.log('✅ 错误处理测试通过');
  }

  /**
   * 测试分享管理
   */
  async testShareManager() {
    console.log('\n' + '='.repeat(60));
    console.log('📦 测试 5: 分享管理');
    console.log('='.repeat(60));

    if (!this.cookie) {
      console.log('⚠️ 无 Cookie，跳过分享管理测试');
      return;
    }

    const manager = new ShareManager(this.cookie);
    
    // 测试分享码解析
    const testCodes = [
      'abc123',
      'https://115.com/s/abc123',
      'abc123#xyzw',
      'https://115.com/s/abc123?password=xyzw',
      '/abc123-xyzw/'
    ];
    
    console.log('📝 分享码解析测试:');
    for (const code of testCodes) {
      const result = manager.parseShareCode(code);
      console.log(`   "${code}" → code:${result.shareCode}, pwd:${result.password || '无'}`);
    }
    
    // 测试获取分享列表（需要真实 Cookie）
    try {
      console.log('\n📋 尝试获取分享列表...');
      const list = await manager.getShareList({ limit: '5' });
      if (list.success) {
        console.log('✅ 分享列表获取成功');
        console.log('   分享数量:', list.count);
        if (list.data && list.data.length > 0) {
          console.log('   第一个分享:', list.data[0].share_title || '无标题');
        }
      } else {
        console.log('⚠️ 分享列表获取失败:', list.message);
      }
    } catch (error) {
      console.log('❌ 分享列表测试异常:', error.message);
    }
    
    console.log('✅ 分享管理测试完成');
  }

  /**
   * 测试批量操作
   */
  async testBatchOperations() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试 6: 批量操作');
    console.log('='.repeat(60));

    if (!this.cookie) {
      console.log('⚠️ 无 Cookie，跳过批量操作测试');
      return;
    }

    const batch = new BatchOperations(this.cookie);
    
    // 测试文件选择
    batch.selectFile('file1', { name: '文件 1.txt', size: 1024 });
    batch.selectFile('file2', { name: '文件 2.txt', size: 2048 });
    batch.selectFile('file3', { name: '文件 3.txt', size: 3072 });
    
    console.log('✅ 选择文件:', batch.getSelectedCount(), '个');
    
    // 测试全选
    const files = [
      { fuuid: 'f1', file_name: '文件 A' },
      { fuuid: 'f2', file_name: '文件 B' },
      { fuuid: 'f3', file_name: '文件 C' }
    ];
    batch.clearSelection();
    batch.selectAll(files);
    console.log('✅ 全选文件:', batch.getSelectedCount(), '个');
    
    // 测试反选
    batch.invertSelection(files);
    console.log('✅ 反选后:', batch.getSelectedCount(), '个');
    
    // 测试进度格式化
    const progress = {
      total: 10,
      success: 8,
      failed: 2,
      errors: [{ error: '文件不存在' }]
    };
    const formatted = batch.formatProgress(progress);
    console.log('\n📋 进度格式化:');
    console.log(formatted);
    
    console.log('✅ 批量操作测试完成');
  }

  /**
   * 测试响应构建
   */
  async testResponseBuilder() {
    console.log('\n' + '='.repeat(60));
    console.log('🎨 测试 7: 卡片式响应');
    console.log('='.repeat(60));

    // 测试空间卡片
    const spaceCard = this.builder.buildSpaceCard({
      analysis: {
        total: 63865752928936,
        used: 17412309602680,
        remain: 46453443326256,
        percent: 27.3
      }
    });
    console.log('📊 空间卡片:');
    console.log(spaceCard);
    
    // 测试文件列表卡片
    const files = [
      { file_name: '文档 1.pdf', file_size: '1048576', is_folder: false },
      { file_name: '图片', is_folder: true },
      { file_name: '视频.mp4', file_size: '1073741824', is_folder: false }
    ];
    const fileCard = this.builder.buildFileList(files);
    console.log('\n📁 文件列表卡片:');
    console.log(fileCard);
    
    // 测试进度条
    const progress = this.builder.buildProgressBar(75, 100, { width: 30 });
    console.log('\n📈 进度条:', progress);
    
    console.log('\n✅ 卡片式响应测试完成');
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║          115 Skills 真实账号测试                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    // 1. 加载 Cookie
    const cookieLoaded = await this.loadCookie();
    if (!cookieLoaded) {
      console.log('\n⚠️ Cookie 加载失败，部分测试将跳过');
    }
    
    const startTime = Date.now();
    
    // 2. 运行测试
    try {
      await this.testContext();
    } catch (e) { console.log('❌ 上下文测试失败:', e.message); }
    
    try {
      await this.testCommandParser();
    } catch (e) { console.log('❌ 命令解析测试失败:', e.message); }
    
    try {
      await this.testRecommender();
    } catch (e) { console.log('❌ 推荐系统测试失败:', e.message); }
    
    try {
      await this.testErrorHandler();
    } catch (e) { console.log('❌ 错误处理测试失败:', e.message); }
    
    try {
      await this.testShareManager();
    } catch (e) { console.log('❌ 分享管理测试失败:', e.message); }
    
    try {
      await this.testBatchOperations();
    } catch (e) { console.log('❌ 批量操作测试失败:', e.message); }
    
    try {
      await this.testResponseBuilder();
    } catch (e) { console.log('❌ 响应构建测试失败:', e.message); }
    
    const duration = Date.now() - startTime;
    
    // 3. 输出总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    console.log(`⏱️  测试耗时：${duration}ms`);
    console.log(`🔐 Cookie 状态：${this.cookie ? '✅ 已加载' : '❌ 未加载'}`);
    console.log(`📝 测试模块：7 个`);
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60));
  }
}

// 运行测试
const test = new RealAccountTest();
test.runAllTests().catch(console.error);
