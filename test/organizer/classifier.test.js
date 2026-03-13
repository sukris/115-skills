const FileClassifier = require('../../lib/organizer/classifier');

describe('FileClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new FileClassifier();
  });

  describe('classifyByType', () => {
    it('should classify images correctly', () => {
      expect(classifier.classifyByType('photo.jpg')).toBe('📷 图片');
      expect(classifier.classifyByType('image.PNG')).toBe('📷 图片');
      expect(classifier.classifyByType('pic.gif')).toBe('📷 图片');
    });

    it('should classify videos correctly', () => {
      expect(classifier.classifyByType('movie.mp4')).toBe('🎬 视频');
      expect(classifier.classifyByType('video.AVI')).toBe('🎬 视频');
      expect(classifier.classifyByType('clip.mkv')).toBe('🎬 视频');
    });

    it('should classify music correctly', () => {
      expect(classifier.classifyByType('song.mp3')).toBe('🎵 音乐');
      expect(classifier.classifyByType('track.FLAC')).toBe('🎵 音乐');
    });

    it('should classify documents correctly', () => {
      expect(classifier.classifyByType('report.pdf')).toBe('📄 文档');
      expect(classifier.classifyByType('doc.DOCX')).toBe('📄 文档');
      expect(classifier.classifyByType('sheet.xlsx')).toBe('📄 文档');
    });

    it('should classify archives correctly', () => {
      expect(classifier.classifyByType('archive.zip')).toBe('📦 压缩包');
      expect(classifier.classifyByType('file.RAR')).toBe('📦 压缩包');
      expect(classifier.classifyByType('data.7z')).toBe('📦 压缩包');
    });

    it('should classify code files correctly', () => {
      expect(classifier.classifyByType('script.js')).toBe('💻 代码');
      expect(classifier.classifyByType('app.PY')).toBe('💻 代码');
      expect(classifier.classifyByType('index.html')).toBe('💻 代码');
    });

    it('should return other for unknown types', () => {
      expect(classifier.classifyByType('file.xyz')).toBe('📁 其他');
      expect(classifier.classifyByType('noextension')).toBe('📁 其他');
    });
  });

  describe('classifyByTime', () => {
    it('should classify by year and month', () => {
      const timestamp = new Date('2026-03-14').getTime();
      const result = classifier.classifyByTime(timestamp);

      expect(result).toContain('2026');
      expect(result).toContain('03');
      expect(result).toContain('三月');
    });

    it('should handle different months', () => {
      const january = new Date('2026-01-15').getTime();
      const december = new Date('2026-12-15').getTime();

      expect(classifier.classifyByTime(january)).toContain('一月');
      expect(classifier.classifyByTime(december)).toContain('十二月');
    });

    it('should pad single digit months', () => {
      const may = new Date('2026-05-01').getTime();
      const result = classifier.classifyByTime(may);

      expect(result).toContain('05');
    });
  });

  describe('classifyBySize', () => {
    it('should classify small files', () => {
      expect(classifier.classifyBySize(500)).toBe('🐜 小于 1KB');
      expect(classifier.classifyBySize(1023)).toBe('🐜 小于 1KB');
    });

    it('should classify files under 100KB', () => {
      expect(classifier.classifyBySize(1024)).toBe('📝 小文件 (<100KB)');
      expect(classifier.classifyBySize(50 * 1024)).toBe('📝 小文件 (<100KB)');
    });

    it('should classify files under 1MB', () => {
      expect(classifier.classifyBySize(100 * 1024)).toBe('📄 普通文件 (<1MB)');
      expect(classifier.classifyBySize(500 * 1024)).toBe('📄 普通文件 (<1MB)');
    });

    it('should classify files under 100MB', () => {
      expect(classifier.classifyBySize(1024 * 1024)).toBe('📦 中等文件 (<100MB)');
      expect(classifier.classifyBySize(50 * 1024 * 1024)).toBe('📦 中等文件 (<100MB)');
    });

    it('should classify files under 1GB', () => {
      expect(classifier.classifyBySize(100 * 1024 * 1024)).toBe('🎬 大文件 (<1GB)');
      expect(classifier.classifyBySize(500 * 1024 * 1024)).toBe('🎬 大文件 (<1GB)');
    });

    it('should classify files under 10GB', () => {
      expect(classifier.classifyBySize(1024 * 1024 * 1024)).toBe('🎥 超大文件 (<10GB)');
      expect(classifier.classifyBySize(5 * 1024 * 1024 * 1024)).toBe('🎥 超大文件 (<10GB)');
    });

    it('should classify huge files', () => {
      expect(classifier.classifyBySize(10 * 1024 * 1024 * 1024)).toBe('💾 巨型文件 (>10GB)');
      expect(classifier.classifyBySize(100 * 1024 * 1024 * 1024)).toBe('💾 巨型文件 (>10GB)');
    });
  });

  describe('batchClassify', () => {
    it('should classify files by type', () => {
      const files = [
        { file_name: 'photo.jpg', size: 1024 },
        { file_name: 'movie.mp4', size: 1024 * 1024 },
        { file_name: 'doc.pdf', size: 512 * 1024 }
      ];

      const result = classifier.batchClassify(files, 'type');

      expect(result['📷 图片'].length).toBe(1);
      expect(result['🎬 视频'].length).toBe(1);
      expect(result['📄 文档'].length).toBe(1);
    });

    it('should classify files by time', () => {
      const files = [
        { file_name: 'file1.txt', create_time: new Date('2026-03-01').getTime() },
        { file_name: 'file2.txt', create_time: new Date('2026-03-15').getTime() },
        { file_name: 'file3.txt', create_time: new Date('2026-04-01').getTime() }
      ];

      const result = classifier.batchClassify(files, 'time');

      expect(Object.keys(result).length).toBe(2); // March and April
    });

    it('should classify files by size', () => {
      const files = [
        { file_name: 'small.txt', size: 500 },
        { file_name: 'medium.txt', size: 50 * 1024 },
        { file_name: 'large.txt', size: 500 * 1024 * 1024 }
      ];

      const result = classifier.batchClassify(files, 'size');

      expect(result['🐜 小于 1KB'].length).toBe(1);
      expect(result['📝 小文件 (<100KB)'].length).toBe(1);
      expect(result['🎬 大文件 (<1GB)'].length).toBe(1);
    });

    it('should handle empty file list', () => {
      const result = classifier.batchClassify([], 'type');
      expect(result).toEqual({});
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', () => {
      const files = [
        { file_name: 'photo.jpg', file_size: 1024 },
        { file_name: 'movie.mp4', file_size: 1024 * 1024 },
        { file_name: 'doc.pdf', file_size: 512 * 1024 }
      ];

      const stats = classifier.getStats(files);

      expect(stats.total).toBe(3);
      expect(stats.totalSize).toBe(1024 + 1024 * 1024 + 512 * 1024);
      expect(stats.byCategory['📷 图片'].count).toBe(1);
      expect(stats.byCategory['🎬 视频'].count).toBe(1);
      expect(stats.byCategory['📄 文档'].count).toBe(1);
    });

    it('should handle files without size', () => {
      const files = [
        { file_name: 'file1.txt' },
        { file_name: 'file2.txt' }
      ];

      const stats = classifier.getStats(files);

      expect(stats.total).toBe(2);
      expect(stats.totalSize).toBe(0);
    });

    it('should handle empty file list', () => {
      const stats = classifier.getStats([]);

      expect(stats.total).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.byCategory).toEqual({});
    });
  });
});
