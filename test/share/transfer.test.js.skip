// Mock dependencies before requiring the module
jest.mock('../../lib/client/http-client');

const ShareTransfer = require('../../lib/share/transfer');
const HttpClient = require('../../lib/client/http-client');

describe('ShareTransfer', () => {
  let shareTransfer;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    HttpClient.mockImplementation(() => mockHttpClient);
    shareTransfer = new ShareTransfer({ uid: '123', cid: '456', se: '789' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      expect(shareTransfer).toBeDefined();
      expect(shareTransfer.http).toBeDefined();
    });
  });

  describe('parseShareCode', () => {
    it('should parse standard share code', () => {
      const result = shareTransfer.parseShareCode('https://115.com/s/abc123');

      expect(result.success).toBe(true);
    });

    it('should parse share code with password', () => {
      const result = shareTransfer.parseShareCode('https://115.com/s/abc123 密码：xyzw');

      expect(result.success).toBe(true);
    });

    it('should parse short link', () => {
      const result = shareTransfer.parseShareCode('https://wapi.115.com/s/abc123');

      expect(result.success).toBe(true);
    });

    it('should handle invalid share code', () => {
      const result = shareTransfer.parseShareCode('invalid-link');

      expect(result.success).toBe(false);
    });
  });

  describe('getShareInfo', () => {
    it('should get share info successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: {
          file_name: 'shared-file.txt',
          count: 1,
          size: 1024
        }
      });

      const result = await shareTransfer.getShareInfo('abc123');

      expect(result.success).toBe(true);
    });

    it('should handle invalid share code', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '分享码无效'
      });

      const result = await shareTransfer.getShareInfo('invalid');

      expect(result.success).toBe(false);
    });

    it('should handle expired share', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '分享已过期'
      });

      const result = await shareTransfer.getShareInfo('abc123');

      expect(result.success).toBe(false);
    });
  });

  describe('transferShare', () => {
    it('should transfer single file', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success_count: 1 }
      });

      const result = await shareTransfer.transferShare('abc123', 'target-cid');

      expect(result.success).toBe(true);
    });

    it('should transfer with password', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { success_count: 1 }
      });

      const result = await shareTransfer.transferShare('abc123', 'target', 'xyzw');

      expect(result.success).toBe(true);
    });

    it('should handle transfer error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Transfer failed'
      });

      const result = await shareTransfer.transferShare('abc123', 'target');

      expect(result.success).toBe(false);
    });

    it('should handle insufficient space', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: '空间不足'
      });

      const result = await shareTransfer.transferShare('abc123', 'target');

      expect(result.success).toBe(false);
    });
  });

  describe('batchTransfer', () => {
    it('should batch transfer multiple shares', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true, data: { success_count: 1 } });

      const shares = [
        { code: 'abc123', target: '0' },
        { code: 'def456', target: '0' },
        { code: 'ghi789', target: '0' }
      ];

      const result = await shareTransfer.batchTransfer(shares);

      expect(result.success).toBe(true);
    });

    it('should handle partial failure', async () => {
      mockHttpClient.post
        .mockResolvedValueOnce({ state: true, data: { success_count: 1 } })
        .mockResolvedValueOnce({ state: true, data: { success_count: 1 } })
        .mockResolvedValueOnce({ state: false, error: 'Failed' });

      const shares = [
        { code: 'abc123', target: '0' },
        { code: 'def456', target: '0' },
        { code: 'ghi789', target: '0' }
      ];

      const result = await shareTransfer.batchTransfer(shares);

      expect(result.success).toBe(true);
    });

    it('should handle empty share list', async () => {
      const result = await shareTransfer.batchTransfer([]);

      expect(result.success).toBe(false);
    });
  });

  describe('createShare', () => {
    it('should create share successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { share_code: 'abc123' }
      });

      const result = await shareTransfer.createShare('123');

      expect(result.success).toBe(true);
    });

    it('should create share with password', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { share_code: 'abc123' }
      });

      const result = await shareTransfer.createShare('123', { password: 'xyzw' });

      expect(result.success).toBe(true);
    });

    it('should create share with expiration', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: true,
        data: { share_code: 'abc123' }
      });

      const result = await shareTransfer.createShare('123', { expireDays: 7 });

      expect(result.success).toBe(true);
    });

    it('should handle create share error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Create failed'
      });

      const result = await shareTransfer.createShare('123');

      expect(result.success).toBe(false);
    });
  });

  describe('cancelShare', () => {
    it('should cancel share successfully', async () => {
      mockHttpClient.post.mockResolvedValue({ state: true });

      const result = await shareTransfer.cancelShare('abc123');

      expect(result.success).toBe(true);
    });

    it('should handle cancel error', async () => {
      mockHttpClient.post.mockResolvedValue({
        state: false,
        error: 'Cancel failed'
      });

      const result = await shareTransfer.cancelShare('abc123');

      expect(result.success).toBe(false);
    });
  });

  describe('getShareList', () => {
    it('should get share list', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [{ share_code: 'abc123' }],
        count: 1
      });

      const result = await shareTransfer.getShareList();

      expect(result.success).toBe(true);
    });

    it('should handle empty share list', async () => {
      mockHttpClient.get.mockResolvedValue({
        state: true,
        data: [],
        count: 0
      });

      const result = await shareTransfer.getShareList();

      expect(result.success).toBe(true);
    });
  });
});
