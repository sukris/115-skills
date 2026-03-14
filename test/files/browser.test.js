// Mock HttpClient before requiring the module
jest.mock('../../lib/client/http-client');

const FileBrowser = require('../../lib/files/browser');
const HttpClient = require('../../lib/client/http-client');

describe('FileBrowser', () => {
  let browser;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      sleep: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    browser = new FileBrowser({ uid: '123', cid: '456', se: '789' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      expect(browser).toBeDefined();
      expect(browser.http).toBeDefined();
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [
          { file_id: '1', file_name: 'file1.txt', file_size: 1024, is_dir: 0 },
          { file_id: '2', file_name: 'file2.txt', file_size: 2048, is_dir: 0 }
        ],
        count: 2
      });

      const result = await browser.listFiles('0', { page: 1, size: 100 });

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle API error', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: false,
        error: 'API Error'
      });

      const result = await browser.listFiles('0');

      expect(result.success).toBe(false);
      expect(result.message).toBe('API Error');
    });

    it('should handle network error', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: false,
        error: 'Network Error'
      });

      const result = await browser.listFiles('0');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network Error');
    });

    it('should use default page and size', async () => {
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      await browser.listFiles('0');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/files',
        expect.objectContaining({
          cid: '0',
          offset: 0,
          limit: 100
        })
      );
    });

    it('should use custom page and size', async () => {
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      await browser.listFiles('0', { page: 2, size: 50 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/files',
        expect.objectContaining({
          cid: '0',
          offset: 50,
          limit: 50
        })
      );
    });

    it('should detect hasMore correctly', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: new Array(100).fill({}),
        count: 150
      });

      const result = await browser.listFiles('0', { page: 1, size: 100 });

      expect(result.hasMore).toBe(true);
    });
  });

  describe('searchFiles', () => {
    it('should search files successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [{ file_id: '1', file_name: 'test.txt', file_size: 1024 }],
        count: 1
      });

      const result = await browser.searchFiles('test');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [],
        count: 0
      });

      const result = await browser.searchFiles('nonexistent');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle search error', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: false,
        error: 'Search failed'
      });

      const result = await browser.searchFiles('test');

      expect(result.success).toBe(false);
    });

    it('should search with filters', async () => {
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      await browser.searchFiles('test', { cid: '123', fileType: 'doc' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/files/search',
        expect.objectContaining({
          keyword: 'test',
          cid: '123',
          file_type: 'doc'
        })
      );
    });
  });

  describe('getAllFiles', () => {
    it('should get all files with pagination', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ state: true, data: new Array(100).fill({}), count: 150 })
        .mockResolvedValueOnce({ state: true, data: new Array(50).fill({}), count: 150 });

      const result = await browser.getAllFiles('0');

      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty directory', async () => {
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      const result = await browser.getAllFiles('0');

      expect(result).toHaveLength(0);
    });

    it('should call onProgress callback', async () => {
      const onProgress = jest.fn();
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      await browser.getAllFiles('0', { onProgress });

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('getFileDetail', () => {
    it('should get file detail successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { file_id: '123', file_name: 'test.txt' }
      });

      const result = await browser.getFileDetail('123');

      expect(result.success).toBe(true);
      expect(result.file.file_id).toBe('123');
    });

    it('should handle file not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: false,
        error: 'File not found'
      });

      const result = await browser.getFileDetail('999');

      expect(result.success).toBe(false);
    });
  });

  describe('getDirectoryPath', () => {
    it('should get directory path successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        path: [{ cid: '0', name: '根目录' }],
        current_name: '当前目录'
      });

      const result = await browser.getDirectoryPath('123');

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
    });
  });

  describe('getCategoryStats', () => {
    it('should get category stats successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { video: 10, image: 20 }
      });

      const result = await browser.getCategoryStats('0');

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
    });
  });

  describe('getStarredFiles', () => {
    it('should get starred files', async () => {
      mockHttpClient.get.mockResolvedValue({ state: true, data: [], count: 0 });

      const result = await browser.getStarredFiles();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/files',
        expect.objectContaining({ star: 1 })
      );
    });
  });

  describe('getRecentFiles', () => {
    it('should get recent files', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [{ file_id: '1', file_name: 'recent.txt' }]
      });

      const result = await browser.getRecentFiles({ days: 7, limit: 100 });

      expect(result.success).toBe(true);
    });
  });

  describe('checkFileExists', () => {
    it('should return true if file exists', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [{ file_name: 'test.txt' }],
        count: 1
      });

      const result = await browser.checkFileExists('test.txt', '0');

      expect(result.exists).toBe(true);
    });

    it('should return false if file not exists', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [{ file_name: 'other.txt' }],
        count: 1
      });

      const result = await browser.checkFileExists('test.txt', '0');

      expect(result.exists).toBe(false);
    });
  });
});
