/**
 * ShareManager 测试
 */

// Mock HttpClient before importing ShareManager
jest.mock('../../lib/client/http-client', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn()
  }));
});

const ShareManager = require('../../lib/share/share-manager');
const HttpClient = require('../../lib/client/http-client');

describe('ShareManager', () => {
  let manager;
  let mockHttp;

  beforeEach(() => {
    // 创建 mock 实例
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    // 设置 mock 实现
    HttpClient.mockImplementation(() => mockHttp);
    
    manager = new ShareManager('test-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('创建分享', () => {
    test('创建单个文件分享', async () => {
      mockHttp.get.mockResolvedValue({ data: { user_id: '123456' } });
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {
          share_title: 'test.txt',
          file_count: 1,
          share_code: 'abc123'
        }
      });

      const result = await manager.createShare('file123');

      expect(result.success).toBe(true);
      expect(result.data.file_count).toBe(1);
      expect(mockHttp.post).toHaveBeenCalledWith('/share/send', expect.any(Object));
    });

    test('创建批量文件分享', async () => {
      mockHttp.get.mockResolvedValue({ data: { user_id: '123456' } });
      mockHttp.post.mockResolvedValue({
        state: true,
        data: { file_count: 3 }
      });

      const result = await manager.createShare(['file1', 'file2', 'file3']);

      expect(result.success).toBe(true);
      expect(result.data.file_count).toBe(3);
    });

    test('创建分享失败', async () => {
      mockHttp.get.mockResolvedValue({ data: { user_id: '123456' } });
      mockHttp.post.mockResolvedValue({
        state: false,
        errno: 990001,
        error: '登录超时'
      });

      let error;
      try {
        await manager.createShare('file123');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.type).toBe('cookie_expired');
    });
  });

  describe('获取分享信息', () => {
    test('获取成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: {
          share_code: 'abc123',
          share_title: 'test.txt',
          file_count: 1,
          receive_count: 10
        }
      });

      const result = await manager.getShareInfo('abc123');

      expect(result.success).toBe(true);
      expect(result.data.share_code).toBe('abc123');
    });

    test('获取失败', async () => {
      mockHttp.get.mockResolvedValue({
        state: false,
        error: '分享不存在'
      });

      let error;
      try {
        await manager.getShareInfo('invalid');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.type).toBe('business');
    });
  });

  describe('更新分享时长', () => {
    test('更新为 1 天', async () => {
      mockHttp.post.mockResolvedValue({
        state: true,
        data: {}
      });

      const result = await manager.updateShareDuration('abc123', 1);

      expect(result.success).toBe(true);
      expect(result.newDuration).toBe('1 天');
    });

    test('更新为 7 天', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.updateShareDuration('abc123', 7);

      expect(result.success).toBe(true);
      expect(result.newDuration).toBe('7 天');
    });

    test('更新为长期', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.updateShareDuration('abc123', -1);

      expect(result.success).toBe(true);
      expect(result.newDuration).toBe('长期');
    });

    test('无效时长参数', async () => {
      let error;
      try {
        await manager.updateShareDuration('abc123', 100);
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.message).toBe('无效的时长参数');
      expect(error.type).toBe('invalid_param');
    });
  });

  describe('获取访问列表', () => {
    test('获取成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { user_id: '1', user_name: '用户 1' },
          { user_id: '2', user_name: '用户 2' }
        ]
      });

      const result = await manager.getAccessList('abc123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    test('空列表', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: []
      });

      const result = await manager.getAccessList('abc123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe('取消分享', () => {
    test('取消成功', async () => {
      mockHttp.post.mockResolvedValue({ state: true });

      const result = await manager.cancelShare('abc123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('分享已取消');
    });

    test('取消失败', async () => {
      mockHttp.post.mockResolvedValue({
        state: false,
        error: '分享不存在'
      });

      let error;
      try {
        await manager.cancelShare('invalid');
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.type).toBe('business');
    });
  });

  describe('获取分享列表', () => {
    test('获取成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { share_code: 'abc', share_title: '分享 1', file_count: 5 },
          { share_code: 'def', share_title: '分享 2', file_count: 10 }
        ],
        count: 2
      });

      const result = await manager.getShareList();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    test('带分页参数', async () => {
      mockHttp.get.mockResolvedValue({ state: true, data: [] });

      await manager.getShareList({ offset: '10', limit: '50' });

      expect(mockHttp.get).toHaveBeenCalledWith('/usershare/list', {
        offset: '10',
        limit: '50'
      });
    });
  });

  describe('解析分享码', () => {
    test('纯分享码', () => {
      const result = manager.parseShareCode('abc123');
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBe('');
      expect(result.valid).toBe(true);
    });

    test('完整链接', () => {
      const result = manager.parseShareCode('https://115.com/s/abc123');
      expect(result.shareCode).toBe('abc123');
      expect(result.valid).toBe(true);
    });

    test('带#号提取码', () => {
      const result = manager.parseShareCode('abc123#xyzw');
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBe('xyzw');
    });

    test('带密码参数', () => {
      const result = manager.parseShareCode('https://115.com/s/abc123?password=xyzw');
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBe('xyzw');
    });

    test('口令格式', () => {
      const result = manager.parseShareCode('/abc123-xyzw/');
      expect(result.shareCode).toBe('abc123');
      expect(result.password).toBe('xyzw');
    });

    test('无效分享码', () => {
      const result = manager.parseShareCode('');
      expect(result.valid).toBe(false);
    });
  });

  describe('格式化分享信息', () => {
    test('格式化成功', () => {
      const shareInfo = {
        data: {
          share_title: '测试文件',
          share_url: 'https://115.com/s/abc123',
          receive_code: 'xyzw',
          file_count: 5,
          folder_count: 2,
          total_size: 1073741824,
          share_duration: '7 天',
          receive_count: 10
        }
      };

      const output = manager.formatShareInfo(shareInfo);

      expect(output).toContain('📦 分享详情');
      expect(output).toContain('测试文件');
      expect(output).toContain('xyzw');
      expect(output).toContain('5 个');
      expect(output).toContain('1.00 GB');
    });

    test('空信息', () => {
      const output = manager.formatShareInfo(null);
      expect(output).toBe('分享信息不可用');
    });
  });

  describe('格式化分享列表', () => {
    test('格式化列表', () => {
      const shares = [
        { share_code: 'abc', share_title: '分享 1', file_count: 5, receive_count: 10 },
        { share_code: 'def', share_title: '分享 2', file_count: 3, receive_count: 5 }
      ];

      const output = manager.formatShareList(shares);

      expect(output).toContain('📋 我的分享');
      expect(output).toContain('分享 1');
      expect(output).toContain('分享 2');
    });

    test('空列表', () => {
      const output = manager.formatShareList([]);
      expect(output).toBe('暂无分享');
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
});

// 集成测试场景
describe('ShareManager - 集成测试场景', () => {
  let manager;
  let mockHttp;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    require('../../lib/client/http-client').mockImplementation(() => mockHttp);
    manager = new ShareManager('test-cookie');
  });

  test('完整分享流程', async () => {
    // 1. 创建分享
    mockHttp.get.mockResolvedValue({ data: { user_id: '123456' } });
    mockHttp.post.mockResolvedValueOnce({
      state: true,
      data: { share_code: 'abc123', share_title: 'test.txt', file_count: 1 }
    });

    const createResult = await manager.createShare('file123');
    expect(createResult.success).toBe(true);

    // 2. 获取分享信息
    mockHttp.get.mockResolvedValueOnce({
      state: true,
      data: { share_code: 'abc123', receive_count: 0 }
    });

    const infoResult = await manager.getShareInfo('abc123');
    expect(infoResult.success).toBe(true);

    // 3. 更新时长
    mockHttp.post.mockResolvedValueOnce({ state: true });

    const updateResult = await manager.updateShareDuration('abc123', 7);
    expect(updateResult.success).toBe(true);
    expect(updateResult.newDuration).toBe('7 天');

    // 4. 获取访问列表
    mockHttp.get.mockResolvedValueOnce({ state: true, data: [] });

    const accessResult = await manager.getAccessList('abc123');
    expect(accessResult.success).toBe(true);

    // 5. 取消分享
    mockHttp.post.mockResolvedValueOnce({ state: true });

    const cancelResult = await manager.cancelShare('abc123');
    expect(cancelResult.success).toBe(true);
  });
});
