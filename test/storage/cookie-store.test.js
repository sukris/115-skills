const CookieStore = require('../../lib/storage/cookie-store');

describe('CookieStore', () => {
  let store;

  beforeEach(() => {
    store = new CookieStore();
  });

  describe('save and load', () => {
    it('should save and load cookie successfully', async () => {
      const testCookie = {
        uid: '123456',
        cid: 'abcdef',
        se: 'xyz789',
        loginTime: Date.now()
      };

      // Save
      const saveResult = await store.save(testCookie);
      expect(saveResult.success).toBe(true);

      // Load
      const loadedCookie = await store.load();
      expect(loadedCookie).toBeDefined();
      expect(loadedCookie.uid).toBe(testCookie.uid);
      expect(loadedCookie.cid).toBe(testCookie.cid);
      expect(loadedCookie.se).toBe(testCookie.se);

      // Cleanup
      await store.clear();
    });

    it('should return null when no cookie exists', async () => {
      await store.clear();
      const loaded = await store.load();
      expect(loaded).toBeNull();
    });

    it('should clear cookie successfully', async () => {
      await store.save({ uid: '123', cid: 'abc', se: 'xyz' });
      const clearResult = await store.clear();
      expect(clearResult.success).toBe(true);
      
      const loaded = await store.load();
      expect(loaded).toBeNull();
    });
  });

  describe('encryption', () => {
    it('should encrypt cookie data', async () => {
      const testCookie = {
        uid: '123456',
        cid: 'abcdef',
        se: 'xyz789'
      };

      await store.save(testCookie);
      
      // Read raw file content
      const fs = require('fs');
      const rawContent = fs.readFileSync(store.storagePath, 'utf8');
      const parsed = JSON.parse(rawContent);

      // Verify encryption fields exist
      expect(parsed.salt).toBeDefined();
      expect(parsed.iv).toBeDefined();
      expect(parsed.authTag).toBeDefined();
      expect(parsed.encryptedData).toBeDefined();

      // Verify data is actually encrypted (not plain text)
      expect(rawContent).not.toContain('123456');
      expect(rawContent).not.toContain('abcdef');

      await store.clear();
    });
  });

  describe('expiration', () => {
    it('should return null for expired cookie', async () => {
      const expiredCookie = {
        uid: '123',
        cid: 'abc',
        se: 'xyz',
        expireAt: Date.now() - 1000 // 1 秒前过期
      };

      await store.save(expiredCookie);
      const loaded = await store.load();
      
      expect(loaded).toBeNull();
    });

    it('should load valid cookie', async () => {
      const validCookie = {
        uid: '123',
        cid: 'abc',
        se: 'xyz',
        expireAt: Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 天后过期
      };

      await store.save(validCookie);
      const loaded = await store.load();
      
      expect(loaded).toBeDefined();
      expect(loaded.uid).toBe('123');

      await store.clear();
    });
  });

  describe('exists', () => {
    it('should return true when cookie exists', async () => {
      await store.save({ uid: '123', cid: 'abc', se: 'xyz' });
      expect(store.exists()).toBe(true);
      await store.clear();
    });

    it('should return false when cookie does not exist', async () => {
      await store.clear();
      expect(store.exists()).toBe(false);
    });
  });

  describe('storage info', () => {
    it('should return storage info', async () => {
      await store.save({ uid: '123', cid: 'abc', se: 'xyz' });
      
      const info = store.getStorageInfo();
      expect(info).toBeDefined();
      expect(info.path).toBeDefined();
      expect(info.size).toBeGreaterThan(0);
      expect(info.permissions).toBe('600');

      await store.clear();
    });

    it('should return null when no storage', async () => {
      await store.clear();
      const info = store.getStorageInfo();
      expect(info).toBeNull();
    });
  });
});
