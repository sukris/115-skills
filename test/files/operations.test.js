const FileOperations = require('../../lib/files/operations');
const HttpClient = require('../../lib/client/http-client');

// Mock HttpClient
jest.mock('../../lib/client/http-client');

describe('FileOperations', () => {
  let operations;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    operations = new FileOperations('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('moveFile', () => {
    it('should move file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, file_id: '123' }
      });

      const result = await operations.moveFile('123', '456');

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('123');
    });

    it('should move multiple files', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await operations.moveFile(['123', '456'], '789');

      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/file/move',
        expect.objectContaining({
          fid: ['123', '456'],
          cid: '789'
        })
      );
    });

    it('should handle move error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Move failed' }
      });

      const result = await operations.moveFile('123', '456');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Move failed');
    });
  });

  describe('copyFile', () => {
    it('should copy file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, file_id: '123' }
      });

      const result = await operations.copyFile('123', '456');

      expect(result.success).toBe(true);
    });

    it('should handle copy error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Copy failed' }
      });

      const result = await operations.copyFile('123', '456');

      expect(result.success).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await operations.deleteFile('123');

      expect(result.success).toBe(true);
    });

    it('should delete multiple files', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await operations.deleteFile(['123', '456']);

      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/file/delete',
        expect.objectContaining({
          fid: ['123', '456']
        })
      );
    });

    it('should handle delete error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Delete failed' }
      });

      const result = await operations.deleteFile('123');

      expect(result.success).toBe(false);
    });
  });

  describe('renameFile', () => {
    it('should rename file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, file_name: 'new_name.txt' }
      });

      const result = await operations.renameFile('123', 'new_name.txt');

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('new_name.txt');
    });

    it('should handle rename error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Rename failed' }
      });

      const result = await operations.renameFile('123', 'new.txt');

      expect(result.success).toBe(false);
    });

    it('should validate file name', async () => {
      const result = await operations.renameFile('123', '');

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件名');
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, cid: '123', file_name: 'New Folder' }
      });

      const result = await operations.createFolder('New Folder', '0');

      expect(result.success).toBe(true);
      expect(result.folderId).toBe('123');
    });

    it('should handle create folder error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Folder exists' }
      });

      const result = await operations.createFolder('Existing', '0');

      expect(result.success).toBe(false);
    });

    it('should validate folder name', async () => {
      const result = await operations.createFolder('', '0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件夹名');
    });
  });

  describe('batchMove', () => {
    it('should batch move files', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await operations.batchMove(['1', '2', '3'], 'target');

      expect(result.success).toBe(true);
      expect(result.moved).toBe(3);
    });

    it('should handle partial failure', async () => {
      mockHttpClient.post
        .mockResolvedValueOnce({ data: { state: true } })
        .mockResolvedValueOnce({ data: { state: false } })
        .mockResolvedValueOnce({ data: { state: true } });

      const result = await operations.batchMove(['1', '2', '3'], 'target');

      expect(result.success).toBe(true);
      expect(result.moved).toBe(2);
      expect(result.failed).toBe(1);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete files', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await operations.batchDelete(['1', '2', '3']);

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(3);
    });

    it('should handle empty file list', async () => {
      const result = await operations.batchDelete([]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件列表');
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const ops = new FileOperations('test-cookie');
      expect(ops).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith('test-cookie');
    });
  });
});
