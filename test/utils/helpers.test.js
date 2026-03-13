const { formatSize, sleep } = require('../../lib/utils/helpers');

describe('Helpers', () => {
  describe('formatSize', () => {
    it('should format bytes', () => {
      expect(formatSize(100)).toBe('100.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatSize(1024)).toBe('1.0 KB');
      expect(formatSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatSize(1048576)).toBe('1.0 MB');
      expect(formatSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatSize(1073741824)).toBe('1.0 GB');
      expect(formatSize(1610612736)).toBe('1.5 GB');
    });

    it('should format terabytes', () => {
      expect(formatSize(1099511627776)).toBe('1.0 TB');
    });

    it('should handle zero bytes', () => {
      expect(formatSize(0)).toBe('0.0 B');
    });

    it('should handle large numbers', () => {
      expect(formatSize(10995116277760)).toBe('10.0 TB');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(90);
    });

    it('should resolve promise', async () => {
      await expect(sleep(10)).resolves.toBeUndefined();
    });

    it('should handle zero delay', async () => {
      const start = Date.now();
      await sleep(0);
      const end = Date.now();

      expect(end - start).toBeLessThan(50);
    });
  });
});
