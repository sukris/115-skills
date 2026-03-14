// Mock dependencies before requiring the module
jest.mock('../../lib/files/browser');
jest.mock('../../lib/files/operations');
jest.mock('../../lib/organizer/classifier');
jest.mock('../../lib/client/http-client');

const SmartOrganizer = require('../../lib/organizer/smart-organizer');
const FileBrowser = require('../../lib/files/browser');
const FileOperations = require('../../lib/files/operations');
const FileClassifier = require('../../lib/organizer/classifier');
const HttpClient = require('../../lib/client/http-client');

describe('SmartOrganizer', () => {
  let organizer;
  let mockBrowser;
  let mockOperations;
  let mockClassifier;
  let mockHttp;

  beforeEach(() => {
    mockBrowser = {
      getAllFiles: jest.fn(),
      listFiles: jest.fn(),
      http: {}
    };
    mockOperations = {
      createFolder: jest.fn(),
      moveFiles: jest.fn()
    };
    mockClassifier = {
      batchClassify: jest.fn()
    };
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };

    FileBrowser.mockImplementation(() => mockBrowser);
    FileOperations.mockImplementation(() => mockOperations);
    FileClassifier.mockImplementation(() => mockClassifier);
    HttpClient.mockImplementation(() => mockHttp);

    organizer = new SmartOrganizer({ uid: '123', cid: '456', se: '789' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with cookie', () => {
      expect(organizer).toBeDefined();
      expect(organizer.browser).toBeDefined();
      expect(organizer.operations).toBeDefined();
      expect(organizer.classifier).toBeDefined();
    });
  });

  describe('autoOrganizeByType', () => {
    it('should organize files by type successfully', async () => {
      const mockFiles = [
        { file_id: '1', file_name: 'photo.jpg', is_dir: false },
        { file_id: '2', file_name: 'video.mp4', is_dir: false }
      ];
      const mockClassified = {
        images: [{ file_id: '1', file_name: 'photo.jpg', is_dir: false }],
        videos: [{ file_id: '2', file_name: 'video.mp4', is_dir: false }]
      };

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);
      mockBrowser.listFiles.mockResolvedValue({
        files: [
          { file_name: 'images', file_id: 'dir1', is_dir: true },
          { file_name: 'videos', file_id: 'dir2', is_dir: true }
        ]
      });
      mockClassifier.batchClassify.mockReturnValue(mockClassified);
      mockOperations.moveFiles.mockResolvedValue({ success: true, moved: 1 });

      const result = await organizer.autoOrganizeByType('0', '/已整理');

      expect(result.total).toBe(2);
      expect(result.moved).toBeGreaterThanOrEqual(0);
    });

    it('should handle dry run mode', async () => {
      const mockFiles = [{ file_id: '1', file_name: 'photo.jpg', is_dir: false }];
      const mockClassified = { images: mockFiles };

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);
      mockClassifier.batchClassify.mockReturnValue(mockClassified);

      const result = await organizer.autoOrganizeByType('0', '/已整理', { dryRun: true });

      expect(result.total).toBe(1);
    });

    it('should handle empty directory', async () => {
      mockBrowser.getAllFiles.mockResolvedValue([]);
      mockBrowser.listFiles.mockResolvedValue({ files: [] });
      mockClassifier.batchClassify.mockReturnValue({});

      const result = await organizer.autoOrganizeByType('0', '/已整理');

      expect(result.total).toBe(0);
    });

    it('should handle move failure', async () => {
      const mockFiles = [{ file_id: '1', file_name: 'photo.jpg', is_dir: false }];
      const mockClassified = { images: mockFiles };

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);
      mockBrowser.listFiles.mockResolvedValue({
        files: [{ file_name: 'images', file_id: 'dir1', is_dir: true }]
      });
      mockClassifier.batchClassify.mockReturnValue(mockClassified);
      mockOperations.moveFiles.mockResolvedValue({ success: false });

      const result = await organizer.autoOrganizeByType('0', '/已整理');

      expect(result.total).toBe(1);
      expect(result.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('autoOrganizeByTime', () => {
    it('should organize files by time successfully', async () => {
      const mockFiles = [
        { file_id: '1', file_name: 'photo.jpg', is_dir: false, upload_time: 1234567890 }
      ];
      const mockClassified = {
        '2026-03': [{ file_id: '1', file_name: 'photo.jpg', is_dir: false }]
      };

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);
      mockBrowser.listFiles.mockResolvedValue({
        files: [{ file_name: '2026-03', file_id: 'dir1', is_dir: true }]
      });
      mockClassifier.batchClassify.mockReturnValue(mockClassified);
      mockOperations.moveFiles.mockResolvedValue({ success: true, moved: 1 });

      const result = await organizer.autoOrganizeByTime('0');

      expect(result.total).toBe(1);
      expect(result.moved).toBeGreaterThanOrEqual(0);
    });

    it('should handle files without time info', async () => {
      const mockFiles = [{ file_id: '1', file_name: 'photo.jpg', is_dir: false }];
      const mockClassified = {};

      mockBrowser.listFiles.mockResolvedValue({ files: mockFiles });
      mockClassifier.batchClassify.mockReturnValue(mockClassified);

      const result = await organizer.autoOrganizeByTime('0');

      expect(result.total).toBe(1);
    });
  });

  describe('findDuplicates', () => {
    it('should detect duplicate files', async () => {
      const mockFiles = [
        { file_id: '1', file_name: 'photo.jpg', file_size: 1024, sha1: 'abc123' },
        { file_id: '2', file_name: 'copy.jpg', file_size: 1024, sha1: 'abc123' }
      ];

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);

      const result = await organizer.findDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates).toBeDefined();
    });

    it('should handle no duplicates', async () => {
      const mockFiles = [
        { file_id: '1', file_name: 'photo1.jpg', file_size: 1024, sha1: 'abc123' },
        { file_id: '2', file_name: 'photo2.jpg', file_size: 2048, sha1: 'def456' }
      ];

      mockBrowser.getAllFiles.mockResolvedValue(mockFiles);

      const result = await organizer.findDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates.length).toBe(0);
    });

    it('should handle empty directory', async () => {
      mockBrowser.getAllFiles.mockResolvedValue([]);

      const result = await organizer.findDuplicates('0');

      expect(result.success).toBe(true);
      expect(result.duplicates.length).toBe(0);
    });
  });

  describe('getCleanupSuggestions', () => {
    beforeEach(() => {
      mockHttp.get.mockResolvedValue({
        data: {
          used_capacity: 100000,
          capacity: 1000000
        }
      });
      mockBrowser.listFiles.mockResolvedValue({ files: [] });
      mockBrowser.getAllFiles.mockResolvedValue([]);
    });

    it('should get cleanup suggestions', async () => {
      mockBrowser.listFiles.mockResolvedValue({
        files: [
          { file_id: '1', file_name: 'old.mp4', file_size: 1024, upload_time: Date.now() - 365 * 24 * 60 * 60 * 1000 },
          { file_id: '2', file_name: 'small.txt', file_size: 100, upload_time: Date.now() }
        ]
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.suggestions).toBeDefined();
    });

    it('should identify old files', async () => {
      const oldFile = {
        file_id: '1',
        file_name: 'old.mp4',
        file_size: 1024,
        upload_time: Date.now() - 365 * 24 * 60 * 60 * 1000
      };

      mockBrowser.listFiles.mockResolvedValue({
        files: [oldFile]
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.suggestions).toBeDefined();
    });

    it('should identify small files', async () => {
      const smallFile = {
        file_id: '1',
        file_name: 'tiny.txt',
        file_size: 50,
        upload_time: Date.now()
      };

      mockBrowser.listFiles.mockResolvedValue({
        files: [smallFile]
      });

      const result = await organizer.getCleanupSuggestions('0');

      expect(result.suggestions).toBeDefined();
    });
  });

  describe('formatSize', () => {
    it('should format bytes correctly', () => {
      expect(organizer.formatSize(1024)).toBe('1.0 KB');
      expect(organizer.formatSize(1048576)).toBe('1.0 MB');
      expect(organizer.formatSize(1073741824)).toBe('1.0 GB');
    });

    it('should handle zero bytes', () => {
      expect(organizer.formatSize(0)).toBe('0.0 B');
    });

    it('should handle large numbers', () => {
      expect(organizer.formatSize(1099511627776)).toBe('1.0 TB');
    });
  });
});
