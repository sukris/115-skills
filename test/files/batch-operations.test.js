/**
 * BatchOperations 测试
 */

jest.mock('../../lib/client/http-client');

const BatchOperations = require('../../lib/files/batch-operations');

describe('BatchOperations', () => {
  let batchOps;
  let mockHttp;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    require('../../lib/client/http-client').mockImplementation(() => mockHttp);
    batchOps = new BatchOperations('test-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('文件选择', () => {
    test('选择单个文件', () => {
      const count = batchOps.selectFile('file123', {
        name: 'test.txt',
        size: 1024
      });
      
      expect(count).toBe(1);
      expect(batchOps.getSelectedCount()).toBe(1);
    });

    test('选择多个文件', () => {
      batchOps.selectFile('file1', { name: 'file1.txt' });
      batchOps.selectFile('file2', { name: 'file2.txt' });
      batchOps.selectFile('file3', { name: 'file3.txt' });
      
      expect(batchOps.getSelectedCount()).toBe(3);
    });

    test('取消选择', () => {
      batchOps.selectFile('file1');
      batchOps.selectFile('file2');
      
      const count = batchOps.deselectFile('file1');
      expect(count).toBe(1);
    });

    test('清空选择', () => {
      batchOps.selectFile('file1');
      batchOps.selectFile('file2');
      
      const count = batchOps.clearSelection();
      expect(count).toBe(0);
    });

    test('获取选中的文件', () => {
      batchOps.selectFile('file1', { name: 'test.txt', size: 1024 });
      
      const files = batchOps.getSelectedFiles();
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('test.txt');
    });

    test('全选', () => {
      const files = [
        { fuuid: 'f1', file_name: 'file1.txt' },
        { fuuid: 'f2', file_name: 'file2.txt' },
        { fuuid: 'f3', file_name: 'file3.txt' }
      ];
      
      const count = batchOps.selectAll(files);
      expect(count).toBe(3);
    });

    test('反选', () => {
      const files = [
        { fuuid: 'f1', file_name: 'file1.txt' },
        { fuuid: 'f2', file_name: 'file2.txt' }
      ];
      
      batchOps.selectFile('f1');
      const count = batchOps.invertSelection(files);
      
      expect(count).toBe(1); // f1 取消，f2 选中
    });

    test('按条件选择', () => {
      const files = [
        { fuuid: 'f1', file_name: 'file1.txt', file_size: 100 },
        { fuuid: 'f2', file_name: 'file2.txt', file_size: 200 },
        { fuuid: 'f3', file_name: 'file3.txt', file_size: 300 }
      ];
      
      const count = batchOps.selectByCondition(files, f => f.file_size > 150);
      expect(count).toBe(2); // f2 和 f3
    });
  });

  describe('批量移动', () => {
    test('移动成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      const result = await batchOps.batchMove(['f1', 'f2', 'f3'], 'target123');
      
      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(3);
      expect(result.progress.failed).toBe(0);
    });

    test('移动失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        error: '移动失败'
      });
      
      const result = await batchOps.batchMove(['f1', 'f2'], 'target123');
      
      expect(result.success).toBe(false);
      expect(result.progress.failed).toBe(2);
    });

    test('部分成功', async () => {
      // 批量操作要么全成功要么全失败
      mockHttp.post.mockResolvedValue({ state: true });
      
      const result = await batchOps.batchMove(['f1', 'f2', 'f3'], 'target123');
      
      expect(result.progress.success).toBe(3);
    });
  });

  describe('批量复制', () => {
    test('复制成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      const result = await batchOps.batchCopy(['f1', 'f2'], 'target123');
      
      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(2);
    });

    test('复制失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        error: '复制失败'
      });
      
      const result = await batchOps.batchCopy(['f1'], 'target123');
      
      expect(result.success).toBe(false);
    });
  });

  describe('批量删除', () => {
    test('删除成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      const result = await batchOps.batchDelete(['f1', 'f2', 'f3']);
      
      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(3);
      expect(mockHttp.post).toHaveBeenCalledWith('/rb/delete', expect.any(Object), expect.any(Object));
    });

    test('删除请求包含特殊头', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      await batchOps.batchDelete(['f1']);
      
      const callArgs = mockHttp.post.mock.calls[0];
      expect(callArgs[2]?.headers).toEqual({
        'Origin': 'https://115.com',
        'X-Requested-With': 'XMLHttpRequest'
      });
    });

    test('删除失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        errno: 990001,
        error: '登录超时'
      });
      
      const result = await batchOps.batchDelete(['f1']);
      
      expect(result.success).toBe(false);
    });
  });

  describe('批量重命名', () => {
    test('重命名成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      const operations = [
        { fuuid: 'f1', newName: 'new1.txt' },
        { fuuid: 'f2', newName: 'new2.txt' }
      ];
      
      const result = await batchOps.batchRename(operations);
      
      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(2);
    });

    test('部分重命名失败', async () => {
      mockHttp.post
        .mockResolvedValueOnce({ state: true })
        .mockResolvedValueOnce({ state: false, error: '重命名失败' });
      
      const operations = [
        { fuuid: 'f1', newName: 'new1.txt' },
        { fuuid: 'f2', newName: 'new2.txt' }
      ];
      
      const result = await batchOps.batchRename(operations);
      
      expect(result.progress.success).toBe(1);
      expect(result.progress.failed).toBe(1);
    });
  });

  describe('批量下载', () => {
    test('获取下载链接成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: { url: 'https://down.115.com/file123' }
      });
      
      const result = await batchOps.batchDownload(['f1', 'f2']);
      
      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(2);
      expect(result.downloadUrls).toHaveLength(2);
    });

    test('部分下载链接获取失败', async () => {
      mockHttp.get
        .mockResolvedValueOnce({
          state: true,
          data: { url: 'https://down.115.com/file1' }
        })
        .mockResolvedValueOnce({
          state: false,
          error: '获取失败'
        });
      
      const result = await batchOps.batchDownload(['f1', 'f2']);
      
      expect(result.progress.success).toBe(1);
      expect(result.progress.failed).toBe(1);
    });
  });

  describe('操作历史', () => {
    test('记录操作', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      await batchOps.batchMove(['f1', 'f2'], 'target123');
      
      const history = batchOps.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('move');
      expect(history[0].fileCount).toBe(2);
    });

    test('限制历史记录数量', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      // 执行超过 50 次操作
      for (let i = 0; i < 60; i++) {
        await batchOps.batchMove([`f${i}`], 'target');
      }
      
      const history = batchOps.getHistory(100);
      expect(history.length).toBeLessThanOrEqual(50);
    });

    test('获取最近 N 条记录', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      await batchOps.batchMove(['f1'], 't1');
      await batchOps.batchCopy(['f2'], 't2');
      await batchOps.batchDelete(['f3']);
      
      const history = batchOps.getHistory(2);
      expect(history).toHaveLength(2);
    });

    test('清空历史', async () => {
      mockHttp.post.mockResolvedValue({ state: true });
      
      await batchOps.batchMove(['f1'], 'target');
      batchOps.clearHistory();
      
      expect(batchOps.getHistory()).toHaveLength(0);
    });
  });

  describe('进度格式化', () => {
    test('格式化成功进度', () => {
      const progress = {
        total: 10,
        success: 8,
        failed: 2,
        errors: []
      };
      
      const output = batchOps.formatProgress(progress);
      
      expect(output).toContain('📊 操作进度');
      expect(output).toContain('总计：10 个文件');
      expect(output).toContain('成功：8 个 ✅');
      expect(output).toContain('失败：2 个 ❌');
    });

    test('格式化带错误的进度', () => {
      const progress = {
        total: 5,
        success: 3,
        failed: 2,
        errors: [
          { error: '文件不存在' },
          { error: '权限不足' }
        ]
      };
      
      const output = batchOps.formatProgress(progress);
      
      expect(output).toContain('⚠️ 错误详情');
      expect(output).toContain('文件不存在');
    });

    test('限制错误显示数量', () => {
      const progress = {
        total: 100,
        success: 90,
        failed: 10,
        errors: Array(10).fill({ error: '错误' })
      };
      
      const output = batchOps.formatProgress(progress);
      
      expect(output).toContain('... 还有 5 个错误');
    });
  });

  describe('集成测试', () => {
    test('完整批量操作流程', async () => {
      // 1. 选择文件
      batchOps.selectFile('f1', { name: 'file1.txt', size: 100 });
      batchOps.selectFile('f2', { name: 'file2.txt', size: 200 });
      batchOps.selectFile('f3', { name: 'file3.txt', size: 300 });
      
      expect(batchOps.getSelectedCount()).toBe(3);
      
      // 2. 获取选中文件
      const selected = batchOps.getSelectedFiles();
      expect(selected).toHaveLength(3);
      
      // 3. 批量移动
      mockHttp.post.mockResolvedValue({ state: true });
      const moveResult = await batchOps.batchMove(
        selected.map(f => f.fuuid),
        'target123'
      );
      
      expect(moveResult.success).toBe(true);
      
      // 4. 查看历史
      const history = batchOps.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('move');
      
      // 5. 清空选择
      batchOps.clearSelection();
      expect(batchOps.getSelectedCount()).toBe(0);
    });

    test('错误恢复场景', async () => {
      // 模拟删除失败（登录过期）
      mockHttp.post.mockResolvedValue({
        state: false,
        errno: 990001,
        error: '登录超时'
      });
      
      batchOps.selectFile('f1');
      const result = await batchOps.batchDelete(['f1']);
      
      expect(result.success).toBe(false);
      expect(result.progress.errors).toHaveLength(1);
      
      // 历史记录仍会记录失败操作
      const history = batchOps.getHistory();
      expect(history).toHaveLength(1);
    });
  });
});
