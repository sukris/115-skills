/**
 * ResponseBuilder 测试
 */

const ResponseBuilder = require('../../lib/ui/response-builder');

describe('ResponseBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new ResponseBuilder();
  });

  describe('基础卡片', () => {
    test('构建简单卡片', () => {
      const card = builder.buildCard({
        title: '测试标题',
        content: '测试内容'
      });

      expect(card).toContain('测试标题');
      expect(card).toContain('测试内容');
      expect(card).toContain('━━━━━━━━━━━━━━━━━━━━');
    });

    test('带图标的卡片', () => {
      const card = builder.buildCard({
        title: '标题',
        icon: '📊',
        content: '内容'
      });

      expect(card).toContain('📊 标题');
    });

    test('带副标题的卡片', () => {
      const card = builder.buildCard({
        title: '标题',
        subtitle: '副标题',
        content: '内容'
      });

      expect(card).toContain('副标题');
    });

    test('带操作的卡片', () => {
      const card = builder.buildCard({
        title: '标题',
        content: '内容',
        actions: [
          { icon: '🔍', label: '搜索', hint: '快速查找' },
          { icon: '📥', label: '下载' }
        ]
      });

      expect(card).toContain('💡 操作建议');
      expect(card).toContain('🔍 搜索');
      expect(card).toContain('快速查找');
    });

    test('带页脚的卡片', () => {
      const card = builder.buildCard({
        title: '标题',
        footer: '页脚信息'
      });

      expect(card).toContain('页脚信息');
    });
  });

  describe('进度条', () => {
    test('构建进度条', () => {
      const progress = builder.buildProgressBar(50, 100);

      expect(progress).toContain('[');
      expect(progress).toContain(']');
      expect(progress).toContain('50.0%');
      expect(progress).toContain('(50/100)');
    });

    test('自定义宽度', () => {
      const progress = builder.buildProgressBar(50, 100, { width: 30 });

      // 30 字符宽度
      const barMatch = progress.match(/\[(.+)\]/);
      expect(barMatch).toBeTruthy();
      expect(barMatch[1].length).toBe(30);
    });

    test('隐藏百分比', () => {
      const progress = builder.buildProgressBar(50, 100, { showPercent: false });

      expect(progress).not.toMatch(/\d+\.\d%/);
    });

    test('隐藏计数', () => {
      const progress = builder.buildProgressBar(50, 100, { showCount: false });

      expect(progress).not.toMatch(/\(\d+\/\d+\)/);
    });

    test('自定义字符', () => {
      const progress = builder.buildProgressBar(50, 100, {
        filledChar: '✅',
        emptyChar: '⬜'
      });

      expect(progress).toContain('✅');
      expect(progress).toContain('⬜');
    });

    test('零进度', () => {
      const progress = builder.buildProgressBar(0, 100);

      expect(progress).toContain('0.0%');
    });

    test('完成进度', () => {
      const progress = builder.buildProgressBar(100, 100);

      expect(progress).toContain('100.0%');
    });
  });

  describe('状态卡片', () => {
    test('构建成功状态', () => {
      const card = builder.buildStatusCard({
        title: '操作成功',
        items: [
          { label: '文件数', value: '10' },
          { label: '大小', value: '1.5', unit: 'GB' }
        ],
        status: 'success'
      });

      expect(card).toContain('✅');
      expect(card).toContain('文件数: 10');
    });

    test('构建错误状态', () => {
      const card = builder.buildStatusCard({
        title: '操作失败',
        items: [{ label: '错误', value: '文件不存在' }],
        status: 'error'
      });

      expect(card).toContain('❌');
    });

    test('构建警告状态', () => {
      const card = builder.buildStatusCard({
        title: '警告',
        items: [{ label: '提示', value: '空间不足' }],
        status: 'warning'
      });

      expect(card).toContain('⚠️');
    });
  });

  describe('文件列表卡片', () => {
    test('构建文件列表', () => {
      const files = [
        { file_name: 'file1.txt', file_size: '1024', is_folder: false },
        { file_name: 'folder1', is_folder: true }
      ];

      const card = builder.buildFileList(files);

      expect(card).toContain('📄 file1.txt');
      expect(card).toContain('📁 folder1');
      expect(card).toContain('共 2 个文件');
    });

    test('空文件列表', () => {
      const card = builder.buildFileList([]);

      expect(card).toContain('暂无文件');
    });

    test('限制显示数量', () => {
      const files = Array(15).fill({ file_name: 'file.txt' });

      const card = builder.buildFileList(files, { limit: 10 });

      expect(card).toContain('... 还有 5 个文件');
    });

    test('隐藏大小', () => {
      const files = [{ file_name: 'file.txt', file_size: '1024' }];

      const card = builder.buildFileList(files, { showSize: false });

      expect(card).not.toMatch(/\(\d+\.\d+ [BKMG]B\)/);
    });
  });

  describe('任务列表卡片', () => {
    test('构建下载任务列表', () => {
      const tasks = [
        { file_name: 'ubuntu.iso', status: '1', percent: '75', file_size: '1073741824' }
      ];

      const card = builder.buildTaskList(tasks, { type: 'download' });

      expect(card).toContain('📥');
      expect(card).toContain('ubuntu.iso');
      expect(card).toContain('⬇️ 下载中');
      expect(card).toContain('75%');
    });

    test('空任务列表', () => {
      const card = builder.buildTaskList([]);

      expect(card).toContain('暂无任务');
    });

    test('不同状态的任务', () => {
      const tasks = [
        { file_name: 'file1', status: '0' },
        { file_name: 'file2', status: '1' },
        { file_name: 'file3', status: '2' },
        { file_name: 'file4', status: '3' },
        { file_name: 'file5', status: '4' }
      ];

      const card = builder.buildTaskList(tasks);

      expect(card).toContain('⏳'); // 等待中
      expect(card).toContain('⬇️'); // 下载中
      expect(card).toContain('✅'); // 已完成
      expect(card).toContain('❌'); // 失败
      expect(card).toContain('⏸️'); // 已暂停
    });
  });

  describe('清理建议卡片', () => {
    test('构建清理建议', () => {
      const suggestions = {
        suggestions: [
          {
            type: 'urgent',
            title: '空间严重不足',
            description: '已使用 95%'
          },
          {
            type: 'info',
            title: '大文件清理',
            description: '找到 5 个大文件'
          }
        ]
      };

      const card = builder.buildCleanSuggestions(suggestions);

      expect(card).toContain('🚨');
      expect(card).toContain('空间严重不足');
      expect(card).toContain('大文件清理');
    });

    test('健康空间', () => {
      const card = builder.buildCleanSuggestions({ suggestions: [] });

      expect(card).toContain('存储空间健康');
      expect(card).toContain('✅');
    });

    test('限制显示数量', () => {
      const suggestions = {
        suggestions: Array(10).fill({
          type: 'info',
          title: '建议',
          description: '描述'
        })
      };

      const card = builder.buildCleanSuggestions(suggestions);

      expect(card).toContain('... 还有 5 条建议');
    });
  });

  describe('分享卡片', () => {
    test('构建分享详情', () => {
      const share = {
        data: {
          share_title: '测试分享',
          share_url: '115.com/s/abc123',
          receive_code: 'xyzw',
          file_count: 5,
          total_size: '1073741824',
          share_duration: '7 天',
          receive_count: 10
        }
      };

      const card = builder.buildShareCard(share);

      expect(card).toContain('📦');
      expect(card).toContain('测试分享');
      expect(card).toContain('115.com/s/abc123');
      expect(card).toContain('xyzw');
      expect(card).toContain('1.00 GB');
    });

    test('空分享信息', () => {
      const card = builder.buildShareCard({});

      expect(card).toContain('分享信息不可用');
    });
  });

  describe('空间统计卡片', () => {
    test('构建空间卡片 - 健康', () => {
      const space = {
        analysis: {
          total: 1000000,
          used: 300000,
          remain: 700000,
          percent: 30
        }
      };

      const card = builder.buildSpaceCard(space);

      expect(card).toContain('✅');
      expect(card).toContain('存储空间');
      expect(card).toContain('🟢');
    });

    test('构建空间卡片 - 紧张', () => {
      const space = {
        analysis: {
          total: 1000000,
          used: 850000,
          remain: 150000,
          percent: 85
        }
      };

      const card = builder.buildSpaceCard(space);

      expect(card).toContain('⚠️');
      expect(card).toContain('空间紧张');
    });

    test('构建空间卡片 - 严重不足', () => {
      const space = {
        analysis: {
          total: 1000000,
          used: 950000,
          remain: 50000,
          percent: 95
        }
      };

      const card = builder.buildSpaceCard(space);

      expect(card).toContain('🚨');
      expect(card).toContain('空间严重不足');
    });

    test('空空间信息', () => {
      const card = builder.buildSpaceCard({});

      expect(card).toContain('空间信息获取失败');
    });
  });

  describe('错误卡片', () => {
    test('构建错误卡片', () => {
      const error = {
        message: '登录已过期',
        recoveries: [
          '回复"登录 115"重新扫码',
          '使用 /115 登录 命令'
        ]
      };

      const card = builder.buildErrorCard(error);

      expect(card).toContain('❌');
      expect(card).toContain('登录已过期');
      expect(card).toContain('💡 建议操作');
      expect(card).toContain('回复"登录 115"重新扫码');
    });

    test('无恢复建议的错误', () => {
      const error = { message: '未知错误' };

      const card = builder.buildErrorCard(error);

      expect(card).toContain('未知错误');
      expect(card).not.toContain('建议操作');
    });
  });

  describe('批量操作结果卡片', () => {
    test('构建成功结果', () => {
      const result = {
        message: '批量删除完成',
        progress: {
          total: 10,
          success: 10,
          failed: 0
        }
      };

      const card = builder.buildBatchResultCard(result);

      expect(card).toContain('✅');
      expect(card).toContain('成功：10 个');
    });

    test('构建部分失败结果', () => {
      const result = {
        message: '批量移动完成',
        progress: {
          total: 10,
          success: 8,
          failed: 2,
          errors: [
            { error: '文件不存在' },
            { error: '权限不足' }
          ]
        }
      };

      const card = builder.buildBatchResultCard(result);

      expect(card).toContain('⚠️');
      expect(card).toContain('成功：8 个');
      expect(card).toContain('失败：2 个');
      expect(card).toContain('文件不存在');
    });

    test('构建全部失败结果', () => {
      const result = {
        message: '批量复制失败',
        progress: {
          total: 5,
          success: 0,
          failed: 5
        }
      };

      const card = builder.buildBatchResultCard(result);

      expect(card).toContain('❌');
      expect(card).toContain('成功：0 个');
    });
  });

  describe('帮助卡片', () => {
    test('构建帮助卡片', () => {
      const card = builder.buildHelpCard();

      expect(card).toContain('❓');
      expect(card).toContain('使用帮助');
      expect(card).toContain('/115 容量');
      expect(card).toContain('容量、文件、搜索');
      expect(card).toContain('115.com/s/');
      expect(card).toContain('magnet:?');
    });
  });

  describe('工具方法', () => {
    test('格式化文件大小 - B', () => {
      expect(builder._formatSize(0)).toBe('0 B');
      expect(builder._formatSize(100)).toBe('100.00 B');
    });

    test('格式化文件大小 - KB', () => {
      expect(builder._formatSize(1024)).toBe('1.00 KB');
    });

    test('格式化文件大小 - MB', () => {
      expect(builder._formatSize(1048576)).toBe('1.00 MB');
    });

    test('格式化文件大小 - GB', () => {
      expect(builder._formatSize(1073741824)).toBe('1.00 GB');
    });

    test('格式化文件大小 - TB', () => {
      expect(builder._formatSize(1099511627776)).toBe('1.00 TB');
    });

    test('格式化时间', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const formatted = builder._formatTime(timestamp);

      expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
    });

    test('格式化任务状态', () => {
      expect(builder._formatTaskStatus('0')).toBe('⏳ 等待中');
      expect(builder._formatTaskStatus('1')).toBe('⬇️ 下载中');
      expect(builder._formatTaskStatus('2')).toBe('✅ 已完成');
      expect(builder._formatTaskStatus('3')).toBe('❌ 失败');
      expect(builder._formatTaskStatus('4')).toBe('⏸️ 已暂停');
      expect(builder._formatTaskStatus('unknown')).toBe('未知 (unknown)');
    });
  });

  describe('集成测试', () => {
    test('完整文件浏览流程', () => {
      // 1. 文件列表
      const files = [
        { file_name: 'document.pdf', file_size: '1048576', is_folder: false },
        { file_name: 'photos', is_folder: true },
        { file_name: 'video.mp4', file_size: '1073741824', is_folder: false }
      ];

      const fileListCard = builder.buildFileList(files);
      expect(fileListCard).toContain('📁');
      expect(fileListCard).toContain('document.pdf');

      // 2. 空间统计
      const space = {
        analysis: {
          total: 63865752928936,
          used: 17412309602680,
          remain: 46453443326256,
          percent: 27.3
        }
      };

      const spaceCard = builder.buildSpaceCard(space);
      expect(spaceCard).toContain('✅');
      expect(spaceCard).toContain('27.3%');
    });

    test('完整分享流程', () => {
      // 1. 创建分享
      const share = {
        data: {
          share_title: '重要文件',
          share_url: '115.com/s/abc123',
          receive_code: '1234',
          file_count: 3,
          total_size: '524288000'
        }
      };

      const shareCard = builder.buildShareCard(share);
      expect(shareCard).toContain('📦');
      expect(shareCard).toContain('1234');

      // 2. 操作结果
      const result = {
        message: '分享创建成功',
        progress: { total: 1, success: 1, failed: 0 }
      };

      const resultCard = builder.buildBatchResultCard(result);
      expect(resultCard).toContain('✅');
    });

    test('错误处理流程', () => {
      // 1. 错误卡片
      const error = {
        message: '登录已过期',
        recoveries: ['重新登录']
      };

      const errorCard = builder.buildErrorCard(error);
      expect(errorCard).toContain('❌');
      expect(errorCard).toContain('💡');

      // 2. 帮助卡片
      const helpCard = builder.buildHelpCard();
      expect(helpCard).toContain('使用帮助');
    });
  });
});
