/**
 * CleanAdvisor 测试
 */

jest.mock('../../lib/client/http-client');

const CleanAdvisor = require('../../lib/organizer/clean-advisor');

describe('CleanAdvisor', () => {
  let advisor;
  let mockHttp;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    require('../../lib/client/http-client').mockImplementation(() => mockHttp);
    advisor = new CleanAdvisor('test-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('回收站统计', () => {
    test('获取成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: {
          files: [
            { file_name: 'file1.txt', file_size: '1000' },
            { file_name: 'file2.txt', file_size: '2000' }
          ]
        }
      });

      const result = await advisor.getRecycleStats();

      expect(result.success).toBe(true);
      expect(result.available).toBe(true);
      expect(result.stats.count).toBe(2);
    });

    test('API 不可用', async () => {
      mockHttp.get.mockResolvedValue({
        state: false,
        error: 'API 不可用'
      });

      const result = await advisor.getRecycleStats();

      expect(result.success).toBe(false);
      expect(result.available).toBe(false);
    });

    test('网络错误', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network error'));

      const result = await advisor.getRecycleStats();

      expect(result.success).toBe(false);
      expect(result.available).toBe(false);
    });
  });

  describe('空间分析', () => {
    test('获取成功', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: {
          total: '1000000000000',
          used: '500000000000'
        }
      });

      const result = await advisor.getSpaceAnalysis();

      expect(result.success).toBe(true);
      expect(result.analysis.percent).toBe(50);
      expect(result.analysis.level).toBe('healthy');
    });

    test('空间紧张', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: {
          total: '1000000000000',
          used: '850000000000'
        }
      });

      const result = await advisor.getSpaceAnalysis();

      expect(result.analysis.percent).toBe(85);
      expect(result.analysis.level).toBe('warning');
    });

    test('空间严重不足', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: {
          total: '1000000000000',
          used: '950000000000'
        }
      });

      const result = await advisor.getSpaceAnalysis();

      expect(result.analysis.percent).toBe(95);
      expect(result.analysis.level).toBe('critical');
    });

    test('获取失败', async () => {
      mockHttp.get.mockResolvedValue({
        state: false,
        error: '获取失败'
      });

      let error;
      try {
        await advisor.getSpaceAnalysis();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
    });
  });

  describe('查找大文件', () => {
    test('找到大文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'large1.zip', file_size: '200000000', is_folder: false },
          { file_name: 'large2.zip', file_size: '150000000', is_folder: false },
          { file_name: 'small.txt', file_size: '1000', is_folder: false }
        ]
      });

      const result = await advisor.findLargeFiles({ minSize: 100000000 });

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    test('没有大文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'small.txt', file_size: '1000', is_folder: false }
        ]
      });

      const result = await advisor.findLargeFiles({ minSize: 100000000 });

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    test('获取失败', async () => {
      mockHttp.get.mockResolvedValue({
        state: false,
        error: '获取失败'
      });

      let error;
      try {
        await advisor.findLargeFiles();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
    });
  });

  describe('查找重复文件', () => {
    test('找到重复文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'file.txt', file_size: '1000', is_folder: false, fuuid: 'f1' },
          { file_name: 'file.txt', file_size: '1000', is_folder: false, fuuid: 'f2' },
          { file_name: 'other.txt', file_size: '2000', is_folder: false, fuuid: 'f3' }
        ]
      });

      const result = await advisor.findDuplicateFiles();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1); // 1 组重复
      expect(result.duplicates[0].files).toHaveLength(2);
    });

    test('没有重复文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'file1.txt', file_size: '1000', is_folder: false },
          { file_name: 'file2.txt', file_size: '2000', is_folder: false }
        ]
      });

      const result = await advisor.findDuplicateFiles();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    test('忽略文件夹', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'folder', is_folder: true },
          { file_name: 'file.txt', file_size: '1000', is_folder: false }
        ]
      });

      const result = await advisor.findDuplicateFiles();

      expect(result.success).toBe(true);
    });
  });

  describe('查找临时文件', () => {
    test('找到临时文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'cache.tmp', file_size: '1000', is_folder: false },
          { file_name: 'backup.bak', file_size: '2000', is_folder: false },
          { file_name: 'normal.txt', file_size: '3000', is_folder: false }
        ]
      });

      const result = await advisor.findTempFiles();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // .tmp 和.bak
    });

    test('支持的临时文件模式', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'file.tmp', is_folder: false },
          { file_name: 'file.temp', is_folder: false },
          { file_name: 'file.cache', is_folder: false },
          { file_name: '~$document.docx', is_folder: false },
          { file_name: 'file.bak', is_folder: false },
          { file_name: 'file.swp', is_folder: false }
        ]
      });

      const result = await advisor.findTempFiles();

      expect(result.count).toBe(6);
    });

    test('没有临时文件', async () => {
      mockHttp.get.mockResolvedValue({
        state: true,
        data: [
          { file_name: 'normal.txt', is_folder: false }
        ]
      });

      const result = await advisor.findTempFiles();

      expect(result.count).toBe(0);
    });
  });

  describe('清理建议', () => {
    test('空间严重不足时的建议', async () => {
      mockHttp.get
        .mockResolvedValueOnce({ // 空间分析
          state: true,
          data: { total: '1000', used: '950' }
        })
        .mockResolvedValueOnce({ // 大文件
          state: true,
          data: []
        })
        .mockResolvedValueOnce({ // 重复文件
          state: true,
          data: []
        })
        .mockResolvedValueOnce({ // 临时文件
          state: true,
          data: []
        })
        .mockResolvedValueOnce({ // 回收站
          state: true,
          data: { files: [] }
        });

      const result = await advisor.getCleanSuggestions();

      expect(result.success).toBe(true);
      expect(result.suggestions.some(s => s.type === 'urgent')).toBe(true);
    });

    test('空间紧张时的建议', async () => {
      mockHttp.get
        .mockResolvedValueOnce({
          state: true,
          data: { total: '1000', used: '850' }
        })
        .mockResolvedValue(() => ({ state: true, data: [] }));

      const result = await advisor.getCleanSuggestions();

      expect(result.suggestions.some(s => s.type === 'warning')).toBe(true);
    });

    test('健康空间', async () => {
      mockHttp.get
        .mockResolvedValueOnce({
          state: true,
          data: { total: '1000', used: '300' }
        })
        .mockResolvedValue(() => ({ state: true, data: [] }));

      const result = await advisor.getCleanSuggestions();

      expect(result.suggestions.length).toBeLessThanOrEqual(1);
    });

    test('建议按优先级排序', async () => {
      mockHttp.get
        .mockResolvedValueOnce({
          state: true,
          data: { total: '1000', used: '950' }
        })
        .mockResolvedValue(() => ({ state: true, data: [] }));

      const result = await advisor.getCleanSuggestions();

      if (result.suggestions.length > 1) {
        expect(result.suggestions[0].priority).toBeLessThanOrEqual(
          result.suggestions[1].priority
        );
      }
    });
  });

  describe('格式化输出', () => {
    test('格式化清理建议', () => {
      const result = {
        suggestions: [
          {
            type: 'urgent',
            title: '🚨 空间严重不足',
            description: '存储空间已使用 95%',
            priority: 1,
            actions: ['清理回收站', '删除大文件']
          },
          {
            type: 'info',
            title: '📦 大文件清理',
            description: '找到 5 个大文件',
            priority: 3,
            actions: ['查看大文件']
          }
        ]
      };

      const output = advisor.formatSuggestions(result);

      expect(output).toContain('🧹 清理建议');
      expect(output).toContain('🚨 空间严重不足');
      expect(output).toContain('清理回收站');
    });

    test('格式化空建议', () => {
      const output = advisor.formatSuggestions({ suggestions: [] });
      expect(output).toBe('✅ 存储空间健康，无需清理');
    });

    test('格式化大文件列表', () => {
      const result = {
        files: [
          { file_name: 'large.zip', file_size: '1073741824', fuuid: 'f123' }
        ],
        totalSize: 1073741824
      };

      const output = advisor.formatLargeFiles(result);

      expect(output).toContain('📦 大文件列表');
      expect(output).toContain('large.zip');
      expect(output).toContain('1.00 GB');
    });

    test('格式化空大文件列表', () => {
      const output = advisor.formatLargeFiles({ files: [] });
      expect(output).toBe('没有找到大文件');
    });

    test('格式化重复文件列表', () => {
      const result = {
        duplicates: [
          {
            fileName: 'file.txt',
            fileSize: '1000',
            files: [
              { category_name: '文件夹 1' },
              { category_name: '文件夹 2' }
            ]
          }
        ],
        cleanableSize: 1000
      };

      const output = advisor.formatDuplicates(result);

      expect(output).toContain('🔄 重复文件');
      expect(output).toContain('file.txt');
    });

    test('格式化空重复文件列表', () => {
      const output = advisor.formatDuplicates({ duplicates: [] });
      expect(output).toBe('没有找到重复文件');
    });
  });

  describe('空间等级', () => {
    test('严重不足', () => {
      expect(advisor._getSpaceLevel(95)).toBe('critical');
      expect(advisor._getSpaceLevel(90)).toBe('critical');
    });

    test('紧张', () => {
      expect(advisor._getSpaceLevel(85)).toBe('warning');
      expect(advisor._getSpaceLevel(80)).toBe('warning');
    });

    test('正常', () => {
      expect(advisor._getSpaceLevel(70)).toBe('normal');
      expect(advisor._getSpaceLevel(60)).toBe('normal');
    });

    test('健康', () => {
      expect(advisor._getSpaceLevel(50)).toBe('healthy');
      expect(advisor._getSpaceLevel(0)).toBe('healthy');
    });
  });

  describe('文件大小格式化', () => {
    test('字节', () => {
      expect(advisor._formatSize(0)).toBe('0 B');
      expect(advisor._formatSize(100)).toBe('100.00 B');
    });

    test('KB', () => {
      expect(advisor._formatSize(1024)).toBe('1.00 KB');
    });

    test('MB', () => {
      expect(advisor._formatSize(1048576)).toBe('1.00 MB');
    });

    test('GB', () => {
      expect(advisor._formatSize(1073741824)).toBe('1.00 GB');
    });

    test('TB', () => {
      expect(advisor._formatSize(1099511627776)).toBe('1.00 TB');
    });
  });

  describe('集成测试', () => {
    test('完整清理分析流程', async () => {
      // 设置统一的 mock 响应
      mockHttp.get.mockImplementation((url) => {
        if (url === '/files/index_info') {
          return Promise.resolve({
            state: true,
            data: { total: '1000000', used: '900000' }
          });
        }
        if (url === '/files') {
          return Promise.resolve({
            state: true,
            data: [
              { file_name: 'large.zip', file_size: '500000', is_folder: false }
            ]
          });
        }
        if (url === '/recycle/list') {
          return Promise.resolve({
            state: true,
            data: { files: [{ file_name: 'deleted.txt' }] }
          });
        }
        return Promise.resolve({ state: true, data: [] });
      });

      // 1. 空间分析
      const spaceResult = await advisor.getSpaceAnalysis();
      expect(spaceResult.success).toBe(true);

      // 2. 大文件查找
      const largeResult = await advisor.findLargeFiles({ minSize: 100000 });
      expect(largeResult.success).toBe(true);

      // 3. 临时文件查找
      const tempResult = await advisor.findTempFiles();
      expect(tempResult.success).toBe(true);

      // 4. 回收站统计
      const recycleResult = await advisor.getRecycleStats();
      expect(recycleResult.available).toBe(true);

      // 5. 清理建议
      const suggestionsResult = await advisor.getCleanSuggestions();
      expect(suggestionsResult.success).toBe(true);
    });
  });
});
