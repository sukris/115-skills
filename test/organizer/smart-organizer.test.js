const SmartOrganizer = require('../../lib/organizer/smart-organizer');
const FileBrowser = require('../../lib/files/browser');
const FileOperations = require('../../lib/files/operations');
const FileClassifier = require('../../lib/organizer/classifier');
const HttpClient = require('../../lib/client/http-client');

// Mock dependencies
jest.mock('../../lib/files/browser');
jest.mock('../../lib/files/operations');
jest.mock('../../lib/organizer/classifier');
jest.mock('../../lib/client/http-client');

describe('SmartOrganizer', () => {
  let organizer;
  let mockBrowser;
  let mockOperations;
  let mockClassifier;

  beforeEach(() => {
    mockBrowser = {
      listFiles: jest.fn(),
      getAllFiles: jest.fn()
    };
    mockOperations = {
      moveFile: jest.fn(),
      createFolder: jest.fn()
    };
    mockClassifier = {
      classify: jest.fn(),
      batchClassify: jest.fn()
    };

    FileBrowser.mockImplementation(() => mockBrowser);
    FileOperations.mockImplementation(() => mockOperations);
    FileClassifier.mockImplementation(() => mockClassifier);

    organizer = new SmartOrganizer('mock-cookie');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('autoOrganizeByType', () => {
    it('should organize files by type successfully', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'doc.txt', category: 'doc' },
          { file_id: '2', file_name: 'video.mp4', category: 'video' },
          { file_id: '3', file_name: 'photo.jpg', category: 'image' }
        ],
        totalCount: 3,
        hasMore: false
      });

      mockClassifier.batchClassify.mockReturnValue({
        '文档': [{ file_id: '1', file_name: 'doc.txt' }],
        '视频': [{ file_id: '2', file_name: 'video.mp4' }],
        '图片': [{ file_id: '3', file_name: 'photo.jpg' }]
      });

      mockOperations.createFolder.mockResolvedValue({ success: true, folderId: 'folder-1' });
      mockOperations.moveFile.mockResolvedValue({ success: true });

      const result = await organizer.autoOrganizeByType('0', { dryRun: false });

      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      expect(result.moved).toBe(3);
    });

    it('should handle dry run mode', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [{ file_id: '1', file_name: 'test.txt', category: 'doc' }],
        totalCount: 1,
        hasMore: false
      });

      mockClassifier.batchClassify.mockReturnValue({
        '文档': [{ file_id: '1', file_name: 'test.txt' }]
      });

      const result = await organizer.autoOrganizeByType('0', { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(1);
      expect(mockOperations.moveFile).not.toHaveBeenCalled();
    });

    it('should handle empty directory', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [],
        totalCount: 0,
        hasMore: false
      });

      const result = await organizer.autoOrganizeByType('0');

      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
    });

    it('should handle move failure', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [{ file_id: '1', file_name: 'test.txt', category: 'doc' }],
        totalCount: 1,
        hasMore: false
      });

      mockClassifier.batchClassify.mockReturnValue({
        '文档': [{ file_id: '1', file_name: 'test.txt' }]
      });

      mockOperations.createFolder.mockResolvedValue({ success: true, folderId: 'f1' });
      mockOperations.moveFile.mockResolvedValue({ success: false });

      const result = await organizer.autoOrganizeByType('0');

      expect(result.success).toBe(true);
      expect(result.failed).toBe(1);
    });
  });

  describe('autoOrganizeByTime', () => {
    it('should organize files by time successfully', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'old.txt', pick_time: 1609459200 },
          { file_id: '2', file_name: 'new.txt', pick_time: 1672531200 }
        ],
        totalCount: 2,
        hasMore: false
      });

      mockClassifier.batchClassify.mockReturnValue({
        '2021 年': [{ file_id: '1', file_name: 'old.txt' }],
        '2023 年': [{ file_id: '2', file_name: 'new.txt' }]
      });

      mockOperations.createFolder.mockResolvedValue({ success: true, folderId: 'folder-1' });
      mockOperations.moveFile.mockResolvedValue({ success: true });

      const result = await organizer.autoOrganizeByTime('0');

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
    });

    it('should handle files without time info', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [{ file_id: '1', file_name: 'notime.txt' }],
        totalCount: 1,
        hasMore: false
      });

      mockClassifier.batchClassify.mockReturnValue({
        '未知时间': [{ file_id: '1', file_name: 'notime.txt' }]
      });

      const result = await organizer.autoOrganizeByTime('0');

      expect(result.success).toBe(true);
    });
  });

  describe('detectDuplicates', () => {
    it('should detect duplicate files', async () => {
      mockBrowser.getAllFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'file.txt', file_size: 1024, sha1: 'abc123' },
          { file_id: '2', file_name: 'copy.txt', file_size: 1024, sha1: 'abc123' },
          { file_id: '3', file_name: 'unique.txt', file_size: 2048, sha1: 'def456' }
        ],
        totalCount: 3
      });

      const result = await organizer.detectDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates).toHaveLength(1);
      expect(result.duplicates[0]).toHaveLength(2);
      expect(result.totalWaste).toBe(1024);
    });

    it('should handle no duplicates', async () => {
      mockBrowser.getAllFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'file1.txt', file_size: 1024, sha1: 'abc' },
          { file_id: '2', file_name: 'file2.txt', file_size: 2048, sha1: 'def' }
        ],
        totalCount: 2
      });

      const result = await organizer.detectDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates).toHaveLength(0);
      expect(result.totalWaste).toBe(0);
    });

    it('should handle empty directory', async () => {
      mockBrowser.getAllFiles.mockResolvedValue({
        success: true,
        files: [],
        totalCount: 0
      });

      const result = await organizer.detectDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('getCleanupSuggestions', () => {
    it('should get cleanup suggestions', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'old.txt', pick_time: 1577836800 },
          { file_id: '2', file_name: 'small.txt', file_size: 100 },
          { file_id: '3', file_name: 'normal.txt', file_size: 1024, pick_time: Date.now() / 1000 }
        ],
        totalCount: 3,
        hasMore: false
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.success).toBe(true);
      expect(result.suggestions).toBeDefined();
    });

    it('should identify old files', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'very-old.txt', pick_time: 1577836800 }
        ],
        totalCount: 1,
        hasMore: false
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.success).toBe(true);
      expect(result.oldFiles).toBeDefined();
    });

    it('should identify small files', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'tiny.txt', file_size: 50 }
        ],
        totalCount: 1,
        hasMore: false
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.success).toBe(true);
      expect(result.smallFiles).toBeDefined();
    });
  });

  describe('analyzeStorage', () => {
    it('should analyze storage by category', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [
          { file_id: '1', file_name: 'doc.txt', file_size: 1024, category: 'doc' },
          { file_id: '2', file_name: 'video.mp4', file_size: 1048576, category: 'video' },
          { file_id: '3', file_name: 'image.jpg', file_size: 2048, category: 'image' }
        ],
        totalCount: 3,
        hasMore: false
      });

      const result = await organizer.analyzeStorage('0');

      expect(result.success).toBe(true);
      expect(result.byCategory).toBeDefined();
      expect(result.totalSize).toBe(1051648);
    });

    it('should handle empty directory', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        success: true,
        files: [],
        totalCount: 0,
        hasMore: false
      });

      const result = await organizer.analyzeStorage('0');

      expect(result.success).toBe(true);
      expect(result.totalSize).toBe(0);
    });
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      const org = new SmartOrganizer('test-cookie');
      expect(org).toBeDefined();
      expect(FileBrowser).toHaveBeenCalledWith('test-cookie');
      expect(FileOperations).toHaveBeenCalledWith('test-cookie');
    });
  });
});
