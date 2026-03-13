const FileBrowser = require('../../lib/files/browser');
const HttpClient = require('../../lib/client/http-client');

// Mock HttpClient
jest.mock('../../lib/client/http-client');

describe('FileBrowser', () => {
  let browser;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    browser = new FileBrowser('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_list: {
            data: [
              { file_id: '1', file_name: 'test.txt', file_size: 1024, is_dir: 0 },
              { file_id: '2', file_name: 'folder', is_dir: 1 }
            ]
          },
          count: 2,
          offset: 0,
          limit: 100
        }
      });

      const result = await browser.listFiles('0', { page: 1, size: 100 });

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle API error', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'API Error' }
      });

      const result = await browser.listFiles('0');

      expect(result.success).toBe(false);
      expect(result.message).toBe('API Error');
    });

    it('should handle network error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await browser.listFiles('0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network Error');
    });

    it('should use default page and size', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      await browser.listFiles('0');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/file',
        expect.objectContaining({
          cid: '0',
          offset: 0,
          limit: 100,
          show_dir: 1
        })
      );
    });

    it('should use custom page and size', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      await browser.listFiles('0', { page: 2, size: 50 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/file',
        expect.objectContaining({
          cid: '0',
          offset: 50,
          limit: 50
        })
      );
    });

    it('should detect hasMore correctly', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_list: { data: Array(100).fill({}) },
          count: 150,
          offset: 0,
          limit: 100
        }
      });

      const result = await browser.listFiles('0', { page: 1, size: 100 });

      expect(result.hasMore).toBe(true);
    });
  });

  describe('searchFiles', () => {
    it('should search files successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_list: {
            data: [
              { file_id: '1', file_name: 'test.txt' }
            ]
          },
          count: 1
        }
      });

      const result = await browser.searchFiles('test');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      const result = await browser.searchFiles('nonexistent');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle search error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Search failed'));

      const result = await browser.searchFiles('test');

      expect(result.success).toBe(false);
    });

    it('should search with type filter', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      await browser.searchFiles('test', { type: 'doc' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/file/search',
        expect.objectContaining({
          search_key: 'test',
          type: 'doc'
        })
      );
    });
  });

  describe('getStorageInfo', () => {
    it('should get storage info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          total: 1099511627776,
          used: 1073741824
        }
      });

      const result = await browser.getStorageInfo();

      expect(result.success).toBe(true);
      expect(result.total).toBe(1099511627776);
      expect(result.used).toBe(1073741824);
      expect(result.available).toBe(1098437885952);
    });

    it('should handle storage info error', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'Failed to get storage' }
      });

      const result = await browser.getStorageInfo();

      expect(result.success).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('should get file info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_info: {
            file_id: '123',
            file_name: 'test.txt',
            file_size: 1024
          }
        }
      });

      const result = await browser.getFileInfo('123');

      expect(result.success).toBe(true);
      expect(result.fileInfo.file_id).toBe('123');
      expect(result.fileInfo.file_name).toBe('test.txt');
    });

    it('should handle file not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'File not found' }
      });

      const result = await browser.getFileInfo('999');

      expect(result.success).toBe(false);
      expect(result.message).toBe('File not found');
    });
  });

  describe('getAllFiles', () => {
    it('should get all files with pagination', async () => {
      // Mock multiple pages
      mockHttpClient.get
        .mockResolvedValueOnce({
          data: {
            state: true,
            file_list: { data: Array(100).fill({ file_id: '1' }) },
            count: 150,
            offset: 0,
            limit: 100
          }
        })
        .mockResolvedValueOnce({
          data: {
            state: true,
            file_list: { data: Array(50).fill({ file_id: '2' }) },
            count: 150,
            offset: 100,
            limit: 100
          }
        });

      const result = await browser.getAllFiles('0');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(150);
    });

    it('should handle empty directory', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      const result = await browser.getAllFiles('0');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(0);
    });

    it('should call onProgress callback', async () => {
      const mockProgress = jest.fn();
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, file_list: { data: [] }, count: 0 }
      });

      await browser.getAllFiles('0', { onProgress: mockProgress });

      expect(mockProgress).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const browser = new FileBrowser('test-cookie');
      expect(browser).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith('test-cookie');
    });
  });
});
