const FileTransfer = require('../../lib/files/transfer');
const HttpClient = require('../../lib/client/http-client');
const fs = require('fs');

// Mock dependencies
jest.mock('../../lib/client/http-client');
jest.mock('fs');

describe('FileTransfer', () => {
  let transfer;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    transfer = new FileTransfer('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload small file successfully', async () => {
      // Mock file exists
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('test'));

      // Mock upload init
      mockHttpClient.post.mockResolvedValueOnce({
        data: {
          state: true,
          upload_id: 'upload-123',
          file_id: 'file-456'
        }
      });

      const result = await transfer.uploadFile('/test/file.txt', '0');

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-456');
    });

    it('should handle file not found', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await transfer.uploadFile('/nonexistent.txt', '0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件不存在');
    });

    it('should handle upload error', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });

      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Upload failed' }
      });

      const result = await transfer.uploadFile('/test.txt', '0');

      expect(result.success).toBe(false);
    });

    it('should call onProgress callback', async () => {
      const mockProgress = jest.fn();
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, file_id: '123' }
      });

      await transfer.uploadFile('/test.txt', '0', { onProgress: mockProgress });

      expect(mockProgress).toHaveBeenCalled();
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_url: 'https://down.115.com/file/test.txt'
        }
      });

      const result = await transfer.downloadFile('123');

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toContain('115.com');
    });

    it('should handle download error', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'Download failed' }
      });

      const result = await transfer.downloadFile('123');

      expect(result.success).toBe(false);
    });

    it('should handle VIP required', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'VIP required' }
      });

      const result = await transfer.downloadFile('123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('VIP');
    });
  });

  describe('chunked upload', () => {
    it('should upload large file in chunks', async () => {
      const largeSize = 10 * 1024 * 1024; // 10MB
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: largeSize });
      fs.readFileSync.mockReturnValue(Buffer.from('chunk'));

      // Mock init upload
      mockHttpClient.post.mockResolvedValueOnce({
        data: {
          state: true,
          upload_id: 'upload-123',
          file_id: 'file-456'
        }
      });

      const result = await transfer.uploadFile('/large-file.bin', '0');

      expect(result.success).toBe(true);
    });

    it('should handle chunk upload error', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 5 * 1024 * 1024 });

      mockHttpClient.post
        .mockResolvedValueOnce({
          data: { state: true, upload_id: 'upload-123' }
        })
        .mockRejectedValueOnce(new Error('Chunk upload failed'));

      const result = await transfer.uploadFile('/large-file.bin', '0');

      expect(result.success).toBe(false);
    });
  });

  describe('getDownloadUrl', () => {
    it('should get download URL', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_url: 'https://down.115.com/file/123'
        }
      });

      const result = await transfer.getDownloadUrl('123');

      expect(result.success).toBe(true);
      expect(result.url).toContain('115.com');
    });

    it('should handle expired URL', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'URL expired' }
      });

      const result = await transfer.getDownloadUrl('123');

      expect(result.success).toBe(false);
    });
  });

  describe('validateFilePath', () => {
    it('should validate valid file path', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024, isFile: () => true });

      const result = transfer.validateFilePath('/valid/path.txt');

      expect(result.valid).toBe(true);
    });

    it('should reject non-existent file', () => {
      fs.existsSync.mockReturnValue(false);

      const result = transfer.validateFilePath('/nonexistent.txt');

      expect(result.valid).toBe(false);
    });

    it('should reject directory', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isFile: () => false });

      const result = transfer.validateFilePath('/directory');

      expect(result.valid).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const t = new FileTransfer('test-cookie');
      expect(t).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith('test-cookie');
    });
  });
});
