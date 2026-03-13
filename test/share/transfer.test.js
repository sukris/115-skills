const ShareTransfer = require('../../lib/share/transfer');
const HttpClient = require('../../lib/client/http-client');

// Mock HttpClient
jest.mock('../../lib/client/http-client');

describe('ShareTransfer', () => {
  let shareTransfer;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    shareTransfer = new ShareTransfer('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseShareCode', () => {
    it('should parse standard share code', () => {
      const result = ShareTransfer.parseShareCode('https://115.com/s/abc123');

      expect(result.success).toBe(true);
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBeNull();
    });

    it('should parse share code with password', () => {
      const result = ShareTransfer.parseShareCode('https://115.com/s/abc123 密码：xyzw');

      expect(result.success).toBe(true);
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBe('xyzw');
    });

    it('should parse short link', () => {
      const result = ShareTransfer.parseShareCode('https://wapi.115.com/s/abc123');

      expect(result.success).toBe(true);
      expect(result.shareCode).toBe('abc123');
    });

    it('should handle invalid share code', () => {
      const result = ShareTransfer.parseShareCode('invalid-link');

      expect(result.success).toBe(false);
      expect(result.message).toContain('分享码');
    });

    it('should parse share code with different password formats', () => {
      const testCases = [
        { input: 'abc123 提取码：xyzw', expected: 'xyzw' },
        { input: 'abc123 提取码:xyzw', expected: 'xyzw' },
        { input: 'abc123 密码 xyzw', expected: 'xyzw' },
        { input: 'abc123 code:xyzw', expected: 'xyzw' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = ShareTransfer.parseShareCode(input);
        expect(result.password).toBe(expected);
      });
    });
  });

  describe('getShareInfo', () => {
    it('should get share info successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          file_info: {
            file_name: 'shared-file.txt',
            file_size: 1024
          }
        }
      });

      const result = await shareTransfer.getShareInfo('abc123');

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('shared-file.txt');
    });

    it('should handle invalid share code', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'Share not found' }
      });

      const result = await shareTransfer.getShareInfo('invalid');

      expect(result.success).toBe(false);
    });

    it('should handle expired share', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: false, error_msg: 'Share expired' }
      });

      const result = await shareTransfer.getShareInfo('expired');

      expect(result.success).toBe(false);
      expect(result.message).toContain('过期');
    });
  });

  describe('transferShare', () => {
    it('should transfer single file', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, file_id: '123' }
      });

      const result = await shareTransfer.transferShare('abc123', 'target-cid');

      expect(result.success).toBe(true);
      expect(result.transferred).toBe(1);
    });

    it('should transfer with password', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await shareTransfer.transferShare('abc123', 'target', 'xyzw');

      expect(result.success).toBe(true);
    });

    it('should handle transfer error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Transfer failed' }
      });

      const result = await shareTransfer.transferShare('abc123', 'target');

      expect(result.success).toBe(false);
    });

    it('should handle insufficient space', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Insufficient space' }
      });

      const result = await shareTransfer.transferShare('abc123', 'target');

      expect(result.success).toBe(false);
      expect(result.message).toContain('空间');
    });
  });

  describe('batchTransfer', () => {
    it('should batch transfer multiple shares', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const shares = [
        { code: 'abc1', target: 'cid1' },
        { code: 'abc2', target: 'cid2' },
        { code: 'abc3', target: 'cid3' }
      ];

      const result = await shareTransfer.batchTransfer(shares);

      expect(result.success).toBe(true);
      expect(result.transferred).toBe(3);
    });

    it('should handle partial failure', async () => {
      mockHttpClient.post
        .mockResolvedValueOnce({ data: { state: true } })
        .mockResolvedValueOnce({ data: { state: false } })
        .mockResolvedValueOnce({ data: { state: true } });

      const shares = [
        { code: 'abc1', target: 'cid1' },
        { code: 'abc2', target: 'cid2' },
        { code: 'abc3', target: 'cid3' }
      ];

      const result = await shareTransfer.batchTransfer(shares);

      expect(result.success).toBe(true);
      expect(result.transferred).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should handle empty share list', async () => {
      const result = await shareTransfer.batchTransfer([]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('分享列表');
    });
  });

  describe('createShare', () => {
    it('should create share successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          state: true,
          share_code: 'abc123',
          share_url: 'https://115.com/s/abc123'
        }
      });

      const result = await shareTransfer.createShare('123');

      expect(result.success).toBe(true);
      expect(result.shareCode).toBe('abc123');
      expect(result.shareUrl).toContain('115.com');
    });

    it('should create share with password', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          state: true,
          share_code: 'abc123',
          share_url: 'https://115.com/s/abc123'
        }
      });

      const result = await shareTransfer.createShare('123', { password: 'xyzw' });

      expect(result.success).toBe(true);
    });

    it('should create share with expiration', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true, share_code: 'abc123' }
      });

      const result = await shareTransfer.createShare('123', {
        expire: 7,
        password: 'xyzw'
      });

      expect(result.success).toBe(true);
    });

    it('should handle create share error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Create failed' }
      });

      const result = await shareTransfer.createShare('123');

      expect(result.success).toBe(false);
    });
  });

  describe('cancelShare', () => {
    it('should cancel share successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: true }
      });

      const result = await shareTransfer.cancelShare('abc123');

      expect(result.success).toBe(true);
    });

    it('should handle cancel error', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { state: false, error_msg: 'Cancel failed' }
      });

      const result = await shareTransfer.cancelShare('abc123');

      expect(result.success).toBe(false);
    });
  });

  describe('getShareList', () => {
    it('should get share list', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          state: true,
          list: [
            { share_code: 'abc1', file_name: 'file1.txt' },
            { share_code: 'abc2', file_name: 'file2.txt' }
          ],
          count: 2
        }
      });

      const result = await shareTransfer.getShareList();

      expect(result.success).toBe(true);
      expect(result.shares).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should handle empty share list', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { state: true, list: [], count: 0 }
      });

      const result = await shareTransfer.getShareList();

      expect(result.success).toBe(true);
      expect(result.shares).toHaveLength(0);
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const st = new ShareTransfer('test-cookie');
      expect(st).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith('test-cookie');
    });
  });
});
