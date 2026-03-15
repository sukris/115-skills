/**
 * 115 Skills 核心功能演示
 * 不需要真实 Cookie，展示 UI 和交互效果
 */

const ResponseBuilder = require('../lib/ui/response-builder');
const ProgressDisplay = require('../lib/ui/progress-display');
const ErrorHandler = require('../lib/error/error-handler');
const CommandParser = require('../lib/parser/command-parser');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║          115 Skills 核心功能演示                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const builder = new ResponseBuilder();
const progress = new ProgressDisplay();
const errorHandler = new ErrorHandler();
const parser = new CommandParser();

// 1. 空间统计卡片
console.log('📊 1. 存储空间统计');
console.log('─'.repeat(60));
const spaceCard = builder.buildSpaceCard({
  analysis: {
    total: 63865752928936,
    used: 17412309602680,
    remain: 46453443326256,
    percent: 27.3
  }
});
console.log(spaceCard);

// 2. 文件列表卡片
console.log('\n📁 2. 文件列表展示');
console.log('─'.repeat(60));
const files = [
  { file_name: '工作文档 2026.pdf', file_size: '2097152', is_folder: false },
  { file_name: '项目资料', is_folder: true },
  { file_name: 'ubuntu-24.04.iso', file_size: '5368709120', is_folder: false },
  { file_name: '照片备份', is_folder: true },
  { file_name: '重要数据.xlsx', file_size: '1048576', is_folder: false }
];
const fileCard = builder.buildFileList(files);
console.log(fileCard);

// 3. 下载进度
console.log('\n📥 3. 下载进度显示');
console.log('─'.repeat(60));
const downloadProgress = progress.createDownload({
  downloaded: 2147483648,
  total: 5368709120,
  speed: 10485760
});
console.log(downloadProgress);

// 4. 批量操作进度
console.log('\n📊 4. 批量操作进度');
console.log('─'.repeat(60));
const batchProgress = progress.createBatch({
  current: 8,
  total: 10,
  success: 7,
  failed: 1,
  operation: '文件删除'
});
console.log(batchProgress);

// 5. 命令解析演示
console.log('\n💬 5. 快捷命令解析');
console.log('─'.repeat(60));
const commands = [
  '/115 容量',
  '/115 文件',
  '容量',
  '文件浏览',
  '115.com/s/abc123',
  'magnet:?xt=urn:btih:1234567890',
  '1'
];
commands.forEach(cmd => {
  const result = parser.parse(cmd);
  console.log(`   "${cmd}" → ${result.command}`);
});

// 6. 错误处理演示
console.log('\n❌ 6. 错误处理展示');
console.log('─'.repeat(60));
const error = errorHandler.createError('COOKIE_EXPIRED', '登录已过期，请重新扫码');
const errorCard = builder.buildErrorCard(error);
console.log(errorCard);

// 7. 清理建议
console.log('\n🧹 7. 智能清理建议');
console.log('─'.repeat(60));
const cleanCard = builder.buildCleanSuggestions({
  suggestions: [
    {
      type: 'warning',
      title: '空间紧张',
      description: '存储空间已使用 85%',
      priority: 1,
      actions: ['清理回收站', '删除大文件']
    },
    {
      type: 'info',
      title: '大文件清理',
      description: '找到 5 个大文件，共 2.5GB',
      priority: 2,
      actions: ['查看大文件']
    },
    {
      type: 'info',
      title: '重复文件',
      description: '找到 3 组重复文件，可释放 500MB',
      priority: 3,
      actions: ['查看重复']
    }
  ]
});
console.log(cleanCard);

// 8. 帮助卡片
console.log('\n❓ 8. 使用帮助');
console.log('─'.repeat(60));
const helpCard = builder.buildHelpCard();
console.log(helpCard);

console.log('\n' + '═'.repeat(60));
console.log('✅ 核心功能演示完成！');
console.log('═'.repeat(60));
