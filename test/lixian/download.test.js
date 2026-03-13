const LixianDownload = require('../../lib/lixian/download');
const HttpClient = require('../../lib/client/http-client');

// Mock HttpClient
jest.mock('../../lib/client/http-client');

describe('LixianDownload', () => {
  let download;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    download = new LixianDownload('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMagnetTask', () => {
    it('should add magnet task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          state: true,
          task_id: 'task-123',
          file_name: 'test-video.mp4',
          file_size: 1073741824
        }
      });

      const result = await download.addMagnetTask('magnet:?xt=urn:btih:abc123');

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task-123');
      expect(result.fileName).toBe('test-video.mp4');
    });

    it('should handle invalid magnet link', async () => {
      const result = await download.addMagnetTask('invalid-magnet');

      expect(result.success).toBe(false);
      expect(result.message).toContain('磁力链接');
    });

    it('should handle duplicate task', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Task exists' }
      });

      const result = await download.addMagnetTask('magnet:?xt=urn:btih:abc123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('存在');
    });

    it('should handle VIP required', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'VIP required' }
      });

      const result = await download.addMagnetTask('magnet:?xt=urn:btih:abc123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('VIP');
    });
  });

  describe('addHttpTask', () => {
    it('should add HTTP task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          state: true,
          task_id: 'task-456',
          file_name: 'file.zip',
          file_size: 104857600
        }
      });

      const result = await download.addHttpTask('https://example.com/file.zip');

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task-456');
    });

    it('should handle invalid URL', async () => {
      const result = await download.addHttpTask('not-a-url');

      expect(result.success).toBe(false);
      expect(result.message).toContain('URL');
    });

    it('should add HTTP task with custom name', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, task_id: 'task-789' }
      });

      const result = await download.addHttpTask('https://example.com/file.zip', {
        fileName: 'custom-name.zip'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('addTorrentTask', () => {
    it('should add torrent task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          state: true,
          task_id: 'task-torrent',
          file_name: 'torrent-file.mp4'
        }
      });

      const result = await download.addTorrentTask('/path/to/file.torrent');

      expect(result.success).toBe(true);
    });

    it('should handle torrent file not found', async () => {
      const result = await download.addTorrentTask('/nonexistent.torrent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('种子文件');
    });
  });

  describe('getTaskList', () => {
    it('should get task list successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          list: [
            { task_id: '1', file_name: 'file1.mp4', status: 1, percent: 100 },
            { task_id: '2', file_name: 'file2.mp4', status: 1, percent: 50 }
          ],
          count: 2
        }
      });

      const result = await download.getTaskList();

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should handle empty task list', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, list: [], count: 0 }
      });

      const result = await download.getTaskList();

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(0);
    });

    it('should filter by status', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, list: [], count: 0 }
      });

      await download.getTaskList({ status: 1 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/lixian',
        expect.objectContaining({
          status: 1
        })
      );
    });
  });

  describe('getTaskInfo', () => {
    it('should get task info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          task_info: {
            task_id: '123',
            file_name: 'video.mp4',
            status: 1,
            percent: 75
          }
        }
      });

      const result = await download.getTaskInfo('123');

      expect(result.success).toBe(true);
      expect(result.taskInfo.task_id).toBe('123');
      expect(result.taskInfo.percent).toBe(75);
    });

    it('should handle task not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'Task not found' }
      });

      const result = await download.getTaskInfo('999');

      expect(result.success).toBe(false);
    });
  });

  describe('cancelTask', () => {
    it('should cancel task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await download.cancelTask('123');

      expect(result.success).toBe(true);
    });

    it('should cancel multiple tasks', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await download.cancelTask(['123', '456']);

      expect(result.success).toBe(true);
    });

    it('should handle cancel error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Cancel failed' }
      });

      const result = await download.cancelTask('123');

      expect(result.success).toBe(false);
    });
  });

  describe('clearCompleted', () => {
    it('should clear completed tasks', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, cleared: 5 }
      });

      const result = await download.clearCompleted();

      expect(result.success).toBe(true);
      expect(result.cleared).toBe(5);
    });

    it('should handle clear error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Clear failed' }
      });

      const result = await download.clearCompleted();

      expect(result.success).toBe(false);
    });
  });

  describe('pauseTask', () => {
    it('should pause task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await download.pauseTask('123');

      expect(result.success).toBe(true);
    });

    it('should handle pause error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Pause failed' }
      });

      const result = await download.pauseTask('123');

      expect(result.success).toBe(false);
    });
  });

  describe('resumeTask', () => {
    it('should resume task successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await download.resumeTask('123');

      expect(result.success).toBe(true);
    });

    it('should handle resume error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Resume failed' }
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
      expect(result.infoHash).toBe('abc123def456');
      expect(result.name).toBe('Test File');
    });

    it('should handle magnet without name', () => {
      const magnet = 'magnet:?xt=urn:btih:abc123';
      const result = LixianDownload.parseMagnetLink(magnet);

      expect(result.success).toBe(true);
      expect(result.infoHash).toBe('abc123');
      expect(result.name).toBeNull();
    });

    it('should handle invalid magnet link', () => {
      const result = LixianDownload.parseMagnetLink('not-a-magnet');

      expect(result.success).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const d = new LixianDownload('test-cookie');
      expect(d).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith('test-cookie');
    });
  });
});
