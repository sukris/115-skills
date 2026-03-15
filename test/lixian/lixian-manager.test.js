/**
 * LixianManager 测试
 */

jest.mock('../../lib/client/http-client');

const LixianManager = require('../../lib/lixian/lixian-manager');

describe('LixianManager', () => {
  let manager;
  let mockHttp;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    require('../../lib/client/http-client').mockImplementation(() => mockHttp);
    manager = new LixianManager('test-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('添加磁力任务', () => {
    test('添加成功', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          task_id: 'task123',
          file_name: 'test.torrent',
          file_size: '1073741824'
        }
      });

      const result = await manager.addMagnet('magnet:?xt=urn:btih:xxx');

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task123');
      expect(result.fileName).toBe('test.torrent');
    });

    test('添加失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        error: '无效的磁力链接'
      });

      let error;
      try {
        await manager.addMagnet('invalid');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.type).toBe('business');
    });
  });

  describe('添加 HTTP 任务', () => {
    test('添加成功', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          task_id: 'task456',
          file_name: 'file.zip',
          file_size: '209715200'
        }
      });

      const result = await manager.addHttp('https://example.com/file.zip');

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task456');
    });
  });

  describe('获取任务列表', () => {
    test('获取成功', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: 't1', file_name: 'file1.zip', status: '1', percent: '50' },
            { task_id: 't2', file_name: 'file2.zip', status: '2', percent: '100' }
          ],
          total: 2
        }
      });

      const result = await manager.getTaskList();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.total).toBe(2);
    });

    test('带分页参数', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: { tasks: [], total: 0 }
      });

      await manager.getTaskList({ page: '2', limit: '50' });

      expect(mockHttp.post).toHaveBeenCalledWith('/lixian', expect.objectContaining({
        page: '2',
        limit: '50'
      }));
    });

    test('空列表', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: { tasks: [], total: 0 }
      });

      const result = await manager.getTaskList();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe('获取任务详情', () => {
    test('获取成功', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: 't1', file_name: 'file.zip', status: '1', percent: '75', file_size: '1000' }
          ]
        }
      });

      const result = await manager.getTaskInfo('t1');

      expect(result.success).toBe(true);
      expect(result.task.task_id).toBe('t1');
      expect(result.progress.percent).toBe(75);
    });

    test('任务不存在', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: { tasks: [] }
      });

      let error;
      try {
        await manager.getTaskInfo('notfound');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.message).toContain('任务不存在');
    });
  });

  describe('任务控制', () => {
    test('暂停任务', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.pauseTask('task123');

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task123');
      expect(result.message).toBe('任务已暂停');
    });

    test('开始任务', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.startTask('task123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('任务已开始');
    });

    test('删除任务', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.deleteTask('task123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('任务已删除');
    });

    test('删除失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        error: '删除失败'
      });

      let error;
      try {
        await manager.deleteTask('invalid');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.type).toBe('business');
    });
  });

  describe('批量删除', () => {
    test('批量删除成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.batchDeleteTasks(['t1', 't2', 't3']);

      expect(result.success).toBe(true);
      expect(result.progress.success).toBe(3);
      expect(result.progress.failed).toBe(0);
    });

    test('部分删除失败', async () => {
      mockHttp.post
        .mockResolvedValueOnce({ state: true })
        .mockResolvedValueOnce({ state: false, error: '失败' })
        .mockResolvedValueOnce({ state: true });

      const result = await manager.batchDeleteTasks(['t1', 't2', 't3']);

      expect(result.progress.success).toBe(2);
      expect(result.progress.failed).toBe(1);
    });
  });

  describe('清理已完成', () => {
    test('清理成功', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: 't1', status: '2' },
            { task_id: 't2', status: '1' },
            { task_id: 't3', status: '2' }
          ]
        }
      });

      const result = await manager.clearCompleted();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // 2 个已完成
    });

    test('没有已完成任务', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: 't1', status: '1' },
            { task_id: 't2', status: '0' }
          ]
        }
      });

      const result = await manager.clearCompleted();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe('任务统计', () => {
    test('获取统计', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: 't1', status: '0', file_size: '1000' },
            { task_id: 't2', status: '1', file_size: '2000', percent: '50' },
            { task_id: 't3', status: '2', file_size: '3000' },
            { task_id: 't4', status: '3', file_size: '4000' },
            { task_id: 't5', status: '4', file_size: '5000' }
          ]
        }
      });

      const result = await manager.getStats();

      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(5);
      expect(result.stats.pending).toBe(1);
      expect(result.stats.downloading).toBe(1);
      expect(result.stats.completed).toBe(1);
      expect(result.stats.failed).toBe(1);
      expect(result.stats.paused).toBe(1);
    });

    test('空统计', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: { tasks: [] }
      });

      const result = await manager.getStats();

      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(0);
    });
  });

  describe('格式化输出', () => {
    test('格式化任务列表', () => {
      const tasks = [
        { task_id: 't1', file_name: 'file1.zip', status: '1', percent: '50', file_size: '1000' },
        { task_id: 't2', file_name: 'file2.zip', status: '2', percent: '100', file_size: '2000' }
      ];

      const output = manager.formatTaskList(tasks);

      expect(output).toContain('📥 离线下载任务');
      expect(output).toContain('file1.zip');
      expect(output).toContain('file2.zip');
    });

    test('格式化空列表', () => {
      const output = manager.formatTaskList([]);
      expect(output).toBe('暂无离线下载任务');
    });

    test('格式化任务详情', () => {
      const task = {
        task_id: 't1',
        file_name: 'test.zip',
        status: '1',
        percent: '75',
        file_size: '1073741824',
        speed: '1MB',
        peers: 10
      };

      const output = manager.formatTaskInfo(task);

      expect(output).toContain('📥 任务详情');
      expect(output).toContain('test.zip');
      expect(output).toContain('75%');
      expect(output).toContain('1.00 GB');
    });

    test('格式化统计', () => {
      const stats = {
        total: 10,
        downloading: 2,
        pending: 3,
        completed: 4,
        failed: 1,
        paused: 0,
        totalSize: 10737418240,
        completedSize: 5368709120
      };

      const output = manager.formatStats(stats);

      expect(output).toContain('📊 离线下载统计');
      expect(output).toContain('总任务：10 个');
      expect(output).toContain('下载中：2 个');
      expect(output).toContain('已完成：4 个');
    });
  });

  describe('状态格式化', () => {
    test('等待中', () => {
      expect(manager._formatStatus('0')).toBe('⏳ 等待中');
      expect(manager._formatStatus('pending')).toBe('⏳ 等待中');
    });

    test('下载中', () => {
      expect(manager._formatStatus('1')).toBe('⬇️ 下载中');
      expect(manager._formatStatus('downloading')).toBe('⬇️ 下载中');
    });

    test('已完成', () => {
      expect(manager._formatStatus('2')).toBe('✅ 已完成');
      expect(manager._formatStatus('completed')).toBe('✅ 已完成');
    });

    test('失败', () => {
      expect(manager._formatStatus('3')).toBe('❌ 失败');
      expect(manager._formatStatus('failed')).toBe('❌ 失败');
    });

    test('已暂停', () => {
      expect(manager._formatStatus('4')).toBe('⏸️ 已暂停');
      expect(manager._formatStatus('paused')).toBe('⏸️ 已暂停');
    });

    test('未知状态', () => {
      expect(manager._formatStatus('unknown')).toBe('未知 (unknown)');
    });
  });

  describe('文件大小格式化', () => {
    test('字节', () => {
      expect(manager._formatSize(0)).toBe('0 B');
      expect(manager._formatSize(100)).toBe('100.00 B');
    });

    test('KB', () => {
      expect(manager._formatSize(1024)).toBe('1.00 KB');
    });

    test('MB', () => {
      expect(manager._formatSize(1048576)).toBe('1.00 MB');
    });

    test('GB', () => {
      expect(manager._formatSize(1073741824)).toBe('1.00 GB');
    });

    test('TB', () => {
      expect(manager._formatSize(1099511627776)).toBe('1.00 TB');
    });
  });

  describe('集成测试', () => {
    test('完整下载流程', async () => {
      // 1. 添加任务
      mockHttp.post.mockResolvedValueOnce({
        state: true,
        data: { task_id: 'new123', file_name: 'test.zip', file_size: '1000' }
      });

      const addResult = await manager.addMagnet('magnet:?xt=urn:btih:xxx');
      expect(addResult.success).toBe(true);
      expect(addResult.taskId).toBe('new123');

      // 2. 获取任务列表
      mockHttp.post.mockResolvedValueOnce({
        state: true,
        data: {
          tasks: [
            { task_id: 'new123', file_name: 'test.zip', status: '1', percent: '50' }
          ],
          total: 1
        }
      });

      const listResult = await manager.getTaskList();
      expect(listResult.count).toBe(1);

      // 3. 获取统计
      mockHttp.post.mockResolvedValueOnce({
        state: true,
        data: {
          tasks: [
            { task_id: 'new123', status: '1', file_size: '1000', percent: '50' }
          ]
        }
      });

      const statsResult = await manager.getStats();
      expect(statsResult.stats.downloading).toBe(1);

      // 4. 暂停任务
      mockHttp.post.mockResolvedValueOnce({ state: true });

      const pauseResult = await manager.pauseTask('new123');
      expect(pauseResult.success).toBe(true);

      // 5. 继续任务
      mockHttp.post.mockResolvedValueOnce({ state: true });

      const startResult = await manager.startTask('new123');
      expect(startResult.success).toBe(true);

      // 6. 删除任务
      mockHttp.post.mockResolvedValueOnce({ state: true });

      const deleteResult = await manager.deleteTask('new123');
      expect(deleteResult.success).toBe(true);
    });
  });
});
