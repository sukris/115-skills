// Mock dependencies before requiring the module
jest.mock('../../lib/client/http-client');

const LixianDownload = require('../../lib/lixian/download');
const HttpClient = require('../../lib/client/http-client');

describe('LixianDownload', () => {
  let download;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    download = new LixianDownload({ uid: '123', cid: '456', se: '789' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      expect(download).toBeDefined();
      expect(download.http).toBeDefined();
    });
  });

  describe('addMagnet', () => {
    it('should add magnet task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { task_id: 'task-123', file_name: 'test.mp4', file_size: 1024 }
      });

      const result = await download.addMagnet('magnet:?xt=urn:btih:abc123');

      expect(result.success).toBe(true);
    });

    it('should handle invalid magnet link', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '无效的磁力链接'
      });

      await expect(download.addMagnet('invalid-magnet')).rejects.toThrow();
    });

    it('should handle duplicate task', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '任务已存在'
      });

      await expect(download.addMagnet('magnet:?xt=urn:btih:abc123')).rejects.toThrow();
    });

    it('should handle VIP required', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '需要 VIP'
      });

      await expect(download.addMagnet('magnet:?xt=urn:btih:abc123')).rejects.toThrow();
    });
  });

  describe('addHttp', () => {
    it('should add HTTP task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { task_id: 'task-456' }
      });

      const result = await download.addHttp('https://example.com/file.zip');

      expect(result.success).toBe(true);
    });

    it('should handle invalid URL', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '无效的 URL'
      });

      await expect(download.addHttp('not-a-url')).rejects.toThrow();
    });

    it('should add HTTP task with custom name', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { task_id: 'task-789' }
      });

      const result = await download.addHttp('https://example.com/file.zip');

      expect(result.success).toBe(true);
    });
  });

  describe('getTaskList', () => {
    it('should get task list successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: {
          tasks: [
            { task_id: '1', file_name: 'file1.mp4', status: 1 },
            { task_id: '2', file_name: 'file2.mp4', status: 0 }
          ],
          count: 2,
          has_more: false
        }
      });

      const result = await download.getTaskList();

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(2);
    });

    it('should handle empty task list', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { tasks: [], count: 0, has_more: false }
      });

      const result = await download.getTaskList();

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(0);
    });

    it('should filter by status', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { tasks: [], count: 0 }
      });

      await download.getTaskList({ status: 1 });

      expect(mockHttpClient.get).toHaveBeenCalled();
    });
  });

  describe('getTaskInfo', () => {
    it('should get task info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { task_id: '123', file_name: 'test.mp4', status: 1 }
      });

      const result = await download.getTaskInfo('123');

      expect(result.success).toBe(true);
    });

    it('should handle task not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: false,
        error: '任务不存在'
      });

      const result = await download.getTaskInfo('999');

      expect(result.success).toBe(false);
    });
  });

  describe('cancelTask', () => {
    it('should cancel task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await download.cancelTask('123');

      expect(result.success).toBe(true);
    });

    it('should cancel multiple tasks', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await download.cancelTask(['123', '456']);

      expect(result.success).toBe(true);
    });

    it('should handle cancel error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Cancel failed'
      });

      const result = await download.cancelTask('123');

      expect(result.success).toBe(false);
    });
  });

  describe('clearCompleted', () => {
    it('should clear completed tasks', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { cleared: 5 }
      });

      const result = await download.clearCompleted();

      expect(result.success).toBe(true);
    });

    it('should handle clear error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Clear failed'
      });

      const result = await download.clearCompleted();

      expect(result.success).toBe(false);
    });
  });

  describe('pauseTask', () => {
    it('should pause task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await download.pauseTask('123');

      expect(result.success).toBe(true);
    });

    it('should handle pause error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Pause failed'
      });

      const result = await download.pauseTask('123');

      expect(result.success).toBe(false);
    });
  });

  describe('resumeTask', () => {
    it('should resume task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await download.resumeTask('123');

      expect(result.success).toBe(true);
    });

    it('should handle resume error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Resume failed'
      });

      const result = await download.resumeTask('123');

      expect(result.success).toBe(false);
    });
  });

  describe('parseMagnetLink', () => {
    it('should parse valid magnet link', () => {
      const magnet = 'magnet:?xt=urn:btih:ABC123DEF456&dn=Test+File';
      const result = LixianDownload.parseMagnetLink(magnet);

      expect(result.success).toBe(true);
    });

    it('should handle magnet without name', () => {
      const magnet = 'magnet:?xt=urn:btih:abc123';
      const result = LixianDownload.parseMagnetLink(magnet);

      expect(result.success).toBe(true);
    });

    it('should handle invalid magnet link', () => {
      const result = LixianDownload.parseMagnetLink('not-a-magnet');

      expect(result.success).toBe(false);
    });
  });

  describe('getTaskStats', () => {
    it('should get task stats successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: {
          total: 10,
          pending: 2,
          downloading: 3,
          completed: 5
        }
      });

      const result = await download.getTaskStats();

      expect(result.success).toBe(true);
    });
  });
});
