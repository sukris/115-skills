/**
 * ProgressDisplay 测试
 */

const ProgressDisplay = require('../../lib/ui/progress-display');

describe('ProgressDisplay', () => {
  let display;

  beforeEach(() => {
    display = new ProgressDisplay();
  });

  describe('基础进度条', () => {
    test('创建进度条', () => {
      const progress = display.create({ current: 50, total: 100 });

      expect(progress).toContain('[');
      expect(progress).toContain(']');
      expect(progress).toContain('50.0%');
    });

    test('自定义宽度', () => {
      const progress = display.create({ current: 50, total: 100, width: 40 });

      const barMatch = progress.match(/\[(.+)\]/);
      expect(barMatch[1].length).toBe(40);
    });

    test('隐藏百分比', () => {
      const progress = display.create({ current: 50, total: 100, showPercent: false });

      expect(progress).not.toMatch(/\d+\.\d%/);
    });

    test('隐藏计数', () => {
      const progress = display.create({ current: 50, total: 100, showCount: false });

      expect(progress).not.toMatch(/\(\d+\/\d+\)/);
    });

    test('零进度', () => {
      const progress = display.create({ current: 0, total: 100 });

      expect(progress).toContain('0.0%');
    });

    test('完成进度', () => {
      const progress = display.create({ current: 100, total: 100 });

      expect(progress).toContain('100.0%');
    });
  });

  describe('下载进度', () => {
    test('创建下载进度', () => {
      const progress = display.createDownload({
        downloaded: 52428800,
        total: 104857600,
        speed: 1048576
      });

      expect(progress).toContain('🟦');
      expect(progress).toContain('50.0%');
      expect(progress).toContain('50.00 MB');
      expect(progress).toContain('100.00 MB');
      expect(progress).toContain('1.00 MB/s');
    });

    test('带 ETA', () => {
      const progress = display.createDownload({
        downloaded: 52428800,
        total: 104857600,
        speed: 1048576,
        startTime: Date.now() - 50000
      });

      expect(progress).toContain('⏱️');
    });

    test('完成下载', () => {
      const progress = display.createDownload({
        downloaded: 104857600,
        total: 104857600,
        speed: 0
      });

      expect(progress).toContain('100.0%');
    });
  });

  describe('上传进度', () => {
    test('创建上传进度', () => {
      const progress = display.createUpload({
        uploaded: 26214400,
        total: 104857600,
        speed: 524288
      });

      expect(progress).toContain('🟩');
      expect(progress).toContain('25.0%');
      expect(progress).toContain('512.00 KB/s');
    });
  });

  describe('批量操作进度', () => {
    test('创建批量进度', () => {
      const progress = display.createBatch({
        current: 8,
        total: 10,
        success: 7,
        failed: 1,
        operation: '删除'
      });

      expect(progress).toContain('📊 删除进度');
      expect(progress).toContain('80.0%');
      expect(progress).toContain('成功：7 ✅');
      expect(progress).toContain('失败：1 ❌');
    });

    test('全部成功', () => {
      const progress = display.createBatch({
        current: 10,
        total: 10,
        success: 10,
        failed: 0
      });

      expect(progress).toContain('100.0%');
      expect(progress).toContain('成功：10 ✅');
    });

    test('全部失败', () => {
      const progress = display.createBatch({
        current: 10,
        total: 10,
        success: 0,
        failed: 10
      });

      expect(progress).toContain('失败：10 ❌');
    });
  });

  describe('多任务进度', () => {
    test('创建多任务进度', () => {
      const tasks = [
        { name: '任务 1', current: 50, total: 100, status: 'running', speed: 1024 },
        { name: '任务 2', current: 100, total: 100, status: 'completed' },
        { name: '任务 3', current: 0, total: 100, status: 'pending' }
      ];

      const progress = display.createMultiTask(tasks);

      expect(progress).toContain('📋 多任务进度');
      expect(progress).toContain('3 个');
      expect(progress).toContain('任务 1');
      expect(progress).toContain('任务 2');
      expect(progress).toContain('任务 3');
      expect(progress).toContain('⬇️'); // running
      expect(progress).toContain('✅'); // completed
      expect(progress).toContain('⏳'); // pending
    });

    test('空任务列表', () => {
      const progress = display.createMultiTask([]);

      expect(progress).toBe('暂无任务');
    });

    test('包含总进度', () => {
      const tasks = [
        { current: 50, total: 100 },
        { current: 50, total: 100 }
      ];

      const progress = display.createMultiTask(tasks);

      expect(progress).toContain('总进度：50.0%');
    });
  });

  describe('步骤进度', () => {
    test('创建步骤进度', () => {
      const steps = [
        { name: '准备' },
        { name: '下载' },
        { name: '验证' },
        { name: '完成' }
      ];

      const progress = display.createSteps({
        current: 2,
        total: 4,
        steps
      });

      expect(progress).toContain('📍 进度 (2/4)');
      expect(progress).toContain('✅ 步骤 1: 准备');
      expect(progress).toContain('✅ 步骤 2: 下载');
      expect(progress).toContain('⚪ 步骤 3: 验证');
    });

    test('全部完成', () => {
      const steps = [{ name: '步骤 1' }, { name: '步骤 2' }];

      const progress = display.createSteps({
        current: 2,
        total: 2,
        steps
      });

      expect(progress).toContain('✅ 步骤 1');
      expect(progress).toContain('✅ 步骤 2');
    });
  });

  describe('环形进度', () => {
    test('创建环形进度', () => {
      const progress = display.createCircular({ percent: 50 });

      expect(progress).toMatch(/[◐◓◑◒]/);
      expect(progress).toContain('50.0%');
    });

    test('零进度', () => {
      const progress = display.createCircular({ percent: 0 });

      expect(progress).toContain('0.0%');
    });

    test('完成进度', () => {
      const progress = display.createCircular({ percent: 100 });

      expect(progress).toContain('100.0%');
    });
  });

  describe('迷你进度条', () => {
    test('创建迷你进度条', () => {
      const progress = display.createMini({ current: 50, total: 100, width: 10 });

      expect(progress).toBe('[█████░░░░░]');
    });

    test('自定义宽度', () => {
      const progress = display.createMini({ current: 50, total: 100, width: 5 });

      expect(progress.length).toBeLessThanOrEqual(7); // [██░░░]
    });
  });

  describe('工具方法', () => {
    test('格式化文件大小 - B', () => {
      expect(display._formatSize(0)).toBe('0 B');
      expect(display._formatSize(100)).toBe('100.00 B');
    });

    test('格式化文件大小 - KB', () => {
      expect(display._formatSize(1024)).toBe('1.00 KB');
    });

    test('格式化文件大小 - MB', () => {
      expect(display._formatSize(1048576)).toBe('1.00 MB');
    });

    test('格式化文件大小 - GB', () => {
      expect(display._formatSize(1073741824)).toBe('1.00 GB');
    });

    test('格式化时间 - 秒', () => {
      expect(display._formatTime(30)).toBe('30 秒');
    });

    test('格式化时间 - 分', () => {
      expect(display._formatTime(90)).toBe('1 分 30 秒');
    });

    test('格式化时间 - 小时', () => {
      expect(display._formatTime(3661)).toBe('1 小时 1 分');
    });

    test('格式化数字', () => {
      expect(display._formatNumber(100)).toBe('100');
      expect(display._formatNumber(1500)).toBe('1.5K');
      expect(display._formatNumber(1500000)).toBe('1.5M');
    });

    test('状态图标', () => {
      expect(display._getStatusIcon('pending')).toBe('⏳');
      expect(display._getStatusIcon('running')).toBe('⬇️');
      expect(display._getStatusIcon('completed')).toBe('✅');
      expect(display._getStatusIcon('failed')).toBe('❌');
      expect(display._getStatusIcon('paused')).toBe('⏸️');
      expect(display._getStatusIcon('unknown')).toBe('⚪');
    });
  });

  describe('集成测试', () => {
    test('完整下载流程', () => {
      // 1. 开始下载
      const startProgress = display.createDownload({
        downloaded: 0,
        total: 1073741824,
        speed: 0
      });
      expect(startProgress).toContain('0.0%');

      // 2. 下载中
      const midProgress = display.createDownload({
        downloaded: 536870912,
        total: 1073741824,
        speed: 10485760
      });
      expect(midProgress).toContain('50.0%');
      expect(midProgress).toContain('10.00 MB/s');

      // 3. 下载完成
      const endProgress = display.createDownload({
        downloaded: 1073741824,
        total: 1073741824,
        speed: 0
      });
      expect(endProgress).toContain('100.0%');
    });

    test('完整批量操作流程', () => {
      // 1. 开始
      const startProgress = display.createBatch({
        current: 0,
        total: 10,
        success: 0,
        failed: 0
      });
      expect(startProgress).toContain('0.0%');

      // 2. 进行中
      const midProgress = display.createBatch({
        current: 5,
        total: 10,
        success: 4,
        failed: 1
      });
      expect(midProgress).toContain('50.0%');
      expect(midProgress).toContain('成功：4 ✅');

      // 3. 完成
      const endProgress = display.createBatch({
        current: 10,
        total: 10,
        success: 9,
        failed: 1
      });
      expect(endProgress).toContain('100.0%');
    });

    test('多任务并发', () => {
      const tasks = [
        { name: '下载 1', current: 100, total: 100, status: 'completed' },
        { name: '下载 2', current: 50, total: 100, status: 'running', speed: 1048576 },
        { name: '下载 3', current: 0, total: 100, status: 'pending' }
      ];

      const progress = display.createMultiTask(tasks);

      expect(progress).toContain('总进度：50.0%');
      expect(progress).toContain('✅ 下载 1');
      expect(progress).toContain('⬇️ 下载 2');
      expect(progress).toContain('⏳ 下载 3');
    });
  });
});
