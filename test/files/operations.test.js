// Mock dependencies before requiring the module
jest.mock('../../lib/client/http-client');

const FileOperations = require('../../lib/files/operations');
const HttpClient = require('../../lib/client/http-client');

describe('FileOperations', () => {
  let operations;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    operations = new FileOperations({ uid: '123', cid: '456', se: '789' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      expect(operations).toBeDefined();
      expect(operations.http).toBeDefined();
    });
  });

  describe('moveFiles', () => {
    it('should move file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success: 1 }
      });

      const result = await operations.moveFiles(['123'], '456');

      expect(result.success).toBe(true);
      expect(result.moved).toBe(1);
    });

    it('should move multiple files', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success: 2 }
      });

      const result = await operations.moveFiles(['123', '456'], '789');

      expect(result.success).toBe(true);
      expect(result.moved).toBe(2);
    });

    it('should handle move error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Move failed'
      });

      const result = await operations.moveFiles(['123'], '456');

      expect(result.success).toBe(false);
    });
  });

  describe('copyFiles', () => {
    it('should copy file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success: 1 }
      });

      const result = await operations.copyFiles(['123'], '456');

      expect(result.success).toBe(true);
      expect(result.copied).toBe(1);
    });

    it('should handle copy error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Copy failed'
      });

      const result = await operations.copyFiles(['123'], '456');

      expect(result.success).toBe(false);
    });
  });

  describe('deleteFiles', () => {
    it('should delete file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success: 1 }
      });

      const result = await operations.deleteFiles(['123']);

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(1);
    });

    it('should delete multiple files', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success: 2 }
      });

      const result = await operations.deleteFiles(['123', '456']);

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(2);
    });

    it('should handle delete error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Delete failed'
      });

      const result = await operations.deleteFiles(['123']);

      expect(result.success).toBe(false);
    });
  });

  describe('renameFile', () => {
    it('should rename file successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { file_name: 'new_name.txt' }
      });

      const result = await operations.renameFile('123', 'new_name.txt');

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('new_name.txt');
    });

    it('should handle rename error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Rename failed'
      });

      const result = await operations.renameFile('123', 'new_name.txt');

      expect(result.success).toBe(false);
    });

    it('should validate file name', async () => {
      const result = await operations.renameFile('123', '');

      expect(result.success).toBe(false);
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { cid: '123', file_name: 'New Folder' }
      });

      const result = await operations.createFolder('New Folder', '0');

      expect(result.success).toBe(true);
      expect(result.folderId).toBe('123');
    });

    it('should handle create folder error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Create failed'
      });

      const result = await operations.createFolder('New Folder', '0');

      expect(result.success).toBe(false);
    });

    it('should validate folder name', async () => {
      const result = await operations.createFolder('', '0');

      expect(result.success).toBe(false);
    });
  });

  describe('batchMove', () => {
    it('should batch move files', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true, data: { success: 1 } });

      const result = await operations.batchMove(['1', '2', '3'], 'target');

      expect(result.success).toBe(true);
    });

    it('should handle partial failure', async () => {
      mockHttpClient.post
        .mockResolvedValueOnce({ state: true, data: { success: 1 } })
        .mockResolvedValueOnce({ state: true, data: { success: 1 } })
        .mockResolvedValueOnce({ state: false, error: 'Failed' });

      const result = await operations.batchMove(['1', '2', '3'], 'target');

      expect(result.success).toBe(true);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete files', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true, data: { success: 1 } });

      const result = await operations.batchDelete(['1', '2', '3']);

      expect(result.success).toBe(true);
    });

    it('should handle empty file list', async () => {
      const result = await operations.batchDelete([]);

      expect(result.success).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('should get file info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: { file_id: '123', file_name: 'test.txt' }
      });

      const result = await operations.getFileInfo('123');

      expect(result.success).toBe(true);
    });
  });

  describe('setFavorite', () => {
    it('should set favorite successfully', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await operations.setFavorite('123', true);

      expect(result.success).toBe(true);
    });
  });
});
