/**
 * HistoryManager 测试
 */

const HistoryManager = require('../../lib/context/history-manager');

describe('HistoryManager', () => {
  let history;

  beforeEach(() => {
    history = new HistoryManager({ maxRecords: 100 });
  });

  describe('添加记录', () => {
    test('添加记录成功', () => {
      const record = history.addRecord({
        type: 'files',
        action: '浏览文件',
        details: { cid: '123' },
        status: 'success',
        userInput: '文件',
        duration: 150
      });

      expect(record.id).toBeDefined();
      expect(record.type).toBe('files');
      expect(record.action).toBe('浏览文件');
      expect(record.status).toBe('success');
      expect(record.duration).toBe(150);
    });

    test('自动生成 ID', () => {
      const record1 = history.addRecord({ type: 'test' });
      const record2 = history.addRecord({ type: 'test' });

      expect(record1.id).not.toBe(record2.id);
    });

    test('记录数量限制', () => {
      // 添加超过限制的记录
      for (let i = 0; i < 150; i++) {
        history.addRecord({ type: 'test', action: `action${i}` });
      }

      expect(history.records.length).toBe(100);
    });
  });

  describe('获取历史', () => {
    beforeEach(() => {
      // 添加测试数据
      history.addRecord({ type: 'files', action: '浏览', status: 'success' });
      history.addRecord({ type: 'download', action: '下载', status: 'success' });
      history.addRecord({ type: 'files', action: '删除', status: 'failed' });
      history.addRecord({ type: 'share', action: '分享', status: 'success' });
    });

    test('获取全部历史', () => {
      const result = history.getHistory();

      expect(result.records.length).toBe(4);
      expect(result.total).toBe(4);
    });

    test('按类型过滤', () => {
      const result = history.getHistory({ type: 'files' });

      expect(result.records.length).toBe(2);
    });

    test('按状态过滤', () => {
      const result = history.getHistory({ status: 'success' });

      expect(result.records.length).toBe(3);
    });

    test('分页', () => {
      const result = history.getHistory({ page: 1, limit: 2 });

      expect(result.records.length).toBe(2);
      expect(result.total).toBe(4);
      expect(result.hasMore).toBe(true);
    });

    test('按时间范围过滤', () => {
      // 清空之前的数据
      history.clearHistory();
      
      const now = Date.now();
      const oneHourAgo = now - 3600000;

      // 只添加新记录
      history.addRecord({ type: 'new', action: 'new', timestamp: now });

      const result = history.getHistory({ startTime: oneHourAgo });

      expect(result.records.length).toBe(1);
    });
  });

  describe('搜索', () => {
    beforeEach(() => {
      history.addRecord({ type: 'files', action: '浏览文件', userInput: '查看文档' });
      history.addRecord({ type: 'download', action: '下载电影', userInput: '下载视频' });
      history.addRecord({ type: 'share', action: '分享图片', userInput: '分享照片' });
    });

    test('搜索操作', () => {
      const results = history.search('下载');

      expect(results.length).toBe(1);
      expect(results[0].action).toBe('下载电影');
    });

    test('搜索用户输入', () => {
      const results = history.search('文档');

      expect(results.length).toBe(1);
    });

    test('搜索类型', () => {
      const results = history.search('files');

      expect(results.length).toBe(1);
    });
  });

  describe('统计', () => {
    beforeEach(() => {
      history.addRecord({ type: 'files', status: 'success', duration: 100 });
      history.addRecord({ type: 'files', status: 'success', duration: 200 });
      history.addRecord({ type: 'files', status: 'failed', duration: 50 });
      history.addRecord({ type: 'download', status: 'success', duration: 150 });
    });

    test('按类型统计', () => {
      const stats = history.getStatsByType();

      expect(stats.files.count).toBe(3);
      expect(stats.files.success).toBe(2);
      expect(stats.files.failed).toBe(1);
      expect(stats.download.count).toBe(1);
    });

    test('按时间统计', () => {
      const stats = history.getStatsByTime('day');

      expect(Object.keys(stats).length).toBeGreaterThan(0);
    });
  });

  describe('获取记录', () => {
    test('获取最近记录', () => {
      history.addRecord({ type: 'a', action: '1' });
      history.addRecord({ type: 'b', action: '2' });
      history.addRecord({ type: 'c', action: '3' });

      const recent = history.getRecent(2);

      expect(recent.length).toBe(2);
      expect(recent[0].action).toBe('3');
    });

    test('按 ID 获取', () => {
      const record = history.addRecord({ type: 'test', action: 'test' });

      const found = history.getById(record.id);

      expect(found).toEqual(record);
    });

    test('获取不存在的 ID', () => {
      const found = history.getById('not-exist');

      expect(found).toBeUndefined();
    });
  });

  describe('删除', () => {
    test('删除记录', () => {
      const record = history.addRecord({ type: 'test' });
      
      const result = history.deleteRecord(record.id);

      expect(result).toBe(true);
      expect(history.getById(record.id)).toBeUndefined();
    });

    test('删除不存在的记录', () => {
      const result = history.deleteRecord('not-exist');

      expect(result).toBe(false);
    });

    test('清空历史', () => {
      history.addRecord({ type: 'a' });
      history.addRecord({ type: 'b' });
      history.addRecord({ type: 'c' });

      const count = history.clearHistory();

      expect(count).toBe(3);
      expect(history.records.length).toBe(0);
    });
  });

  describe('导出', () => {
    beforeEach(() => {
      history.addRecord({ 
        type: 'files', 
        action: '浏览', 
        status: 'success', 
        duration: 100,
        userInput: '文件'
      });
    });

    test('导出 JSON', () => {
      const json = history.export({ format: 'json' });

      expect(json).toContain('files');
      expect(json).toContain('浏览');
    });

    test('导出 CSV', () => {
      const csv = history.export({ format: 'csv' });

      expect(csv).toContain('ID,时间,类型,操作,状态,耗时');
      expect(csv).toContain('files');
    });

    test('导出 Markdown', () => {
      const md = history.export({ format: 'markdown' });

      expect(md).toContain('# 历史记录');
      expect(md).toContain('|');
    });
  });

  describe('格式化输出', () => {
    test('格式化空历史', () => {
      const output = history.formatHistory();

      expect(output).toContain('暂无历史记录');
    });

    test('格式化历史', () => {
      history.addRecord({ 
        type: 'files', 
        action: '浏览文件',
        status: 'success',
        userInput: '查看文档',
        duration: 150
      });

      const output = history.formatHistory();

      expect(output).toContain('📋 历史记录');
      expect(output).toContain('浏览文件');
      expect(output).toContain('150ms');
    });

    test('格式化统计', () => {
      history.addRecord({ type: 'files', status: 'success', duration: 100 });
      history.addRecord({ type: 'files', status: 'success', duration: 200 });
      history.addRecord({ type: 'download', status: 'failed', duration: 50 });

      const output = history.formatStats();

      expect(output).toContain('📊 历史统计');
      expect(output).toContain('总记录：3 条');
      expect(output).toContain('成功：2');
      expect(output).toContain('失败：1');
    });
  });

  describe('工具方法', () => {
    test('格式化时间 - 刚刚', () => {
      // 添加记录
      history.addRecord({ type: 'test', action: 'test' });
      
      const output = history.formatHistory();
      
      // 刚刚添加的记录应该显示"刚刚"
      expect(output).toMatch(/刚刚|分钟前/);
    });

    test('类型图标', () => {
      // 测试各种类型
      expect(history._getTypeIcon('files')).toBe('📁');
      expect(history._getTypeIcon('download')).toBe('📥');
      expect(history._getTypeIcon('share')).toBe('📦');
      expect(history._getTypeIcon('delete')).toBe('🗑️');
      expect(history._getTypeIcon('search')).toBe('🔍');
      expect(history._getTypeIcon('unknown')).toBe('❓');
    });
  });

  describe('集成测试', () => {
    test('完整使用流程', () => {
      // 1. 添加操作记录
      history.addRecord({
        type: 'files',
        action: '浏览文件',
        details: { cid: '123' },
        status: 'success',
        userInput: '查看文档',
        duration: 150
      });

      // 2. 继续操作
      history.addRecord({
        type: 'download',
        action: '下载文件',
        details: { fid: '456' },
        status: 'success',
        userInput: '下载电影',
        duration: 2000
      });

      // 3. 搜索历史
      const searchResults = history.search('文件');
      expect(searchResults.length).toBe(2);

      // 4. 查看统计
      const stats = history.getStatsByType();
      expect(stats.files.count).toBe(1);
      expect(stats.download.count).toBe(1);

      // 5. 查看最近
      const recent = history.getRecent(5);
      expect(recent.length).toBe(2);

      // 6. 格式化输出
      const output = history.formatHistory();
      expect(output).toContain('浏览文件');
      expect(output).toContain('下载文件');

      // 7. 导出
      const json = history.export({ format: 'json' });
      expect(json).toContain('"files"');
      expect(json).toContain('"download"');
    });

    test('错误处理流程', () => {
      // 1. 添加失败记录
      history.addRecord({
        type: 'files',
        action: '删除文件',
        status: 'failed',
        details: { error: '权限不足' },
        userInput: '删除文件',
        duration: 50
      });

      // 2. 搜索失败记录
      const failed = history.getHistory({ status: 'failed' });
      expect(failed.records.length).toBe(1);

      // 3. 查看统计
      const stats = history.getStatsByType();
      expect(stats.files.failed).toBe(1);

      // 4. 删除记录
      const record = history.getRecent(1)[0];
      history.deleteRecord(record.id);

      // 5. 确认删除
      const remaining = history.getHistory();
      expect(remaining.records.length).toBe(0);
    });
  });
});
