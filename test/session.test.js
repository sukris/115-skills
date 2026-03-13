const SessionManager = require('../lib/session');

// Mock CookieStore
jest.mock('../lib/storage/cookie-store');

describe('SessionManager', () => {
  let sessionManager;
  let mockCookieStore;

  beforeEach(() => {
    mockCookieStore = {
      load: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
      exists: jest.fn()
    };
    sessionManager = new SessionManager(mockCookieStore);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with cookieStore', () => {
      expect(sessionManager.cookieStore).toBe(mockCookieStore);
    });

    it('should have autoRenewThreshold', () => {
      expect(sessionManager.autoRenewThreshold).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('getSessionInfo', () => {
    it('should return not logged in when no cookie', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const info = await sessionManager.getSessionInfo();

      expect(info.loggedIn).toBe(false);
      expect(info.reason).toBe('no_cookie');
    });

    it('should return logged in when cookie exists and valid', async () => {
      const mockCookie = {
        uid: '123456',
        cid: '789',
        se: 'abc',
        loginTime: Date.now() - 1000,
        expireAt: Date.now() + 1000000
      };
      mockCookieStore.load.mockResolvedValue(mockCookie);

      const info = await sessionManager.getSessionInfo();

      expect(info.loggedIn).toBe(true);
      expect(info.uid).toBe('123456');
    });

    it('should return expired when cookie is expired', async () => {
      const mockCookie = {
        uid: '123456',
        loginTime: Date.now() - 10000000,
        expireAt: Date.now() - 1000
      };
      mockCookieStore.load.mockResolvedValue(mockCookie);

      const info = await sessionManager.getSessionInfo();

      expect(info.loggedIn).toBe(false);
      expect(info.expired).toBe(true);
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no cookie', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const result = await sessionManager.isLoggedIn();

      expect(result).toBe(false);
    });

    it('should return true when cookie is valid', async () => {
      mockCookieStore.load.mockResolvedValue({
        uid: '123',
        expireAt: Date.now() + 1000000
      });

      const result = await sessionManager.isLoggedIn();

      expect(result).toBe(true);
    });

    it('should return false when cookie is expired', async () => {
      mockCookieStore.load.mockResolvedValue({
        uid: '123',
        expireAt: Date.now() - 1000
      });

      const result = await sessionManager.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('refreshSession', () => {
    it('should update session expiry', async () => {
      const mockCookie = { uid: '123', cid: '456', se: '789' };
      mockCookieStore.load.mockResolvedValue(mockCookie);
      mockCookieStore.save.mockResolvedValue({ success: true });

      const result = await sessionManager.refreshSession();

      expect(result.success).toBe(true);
      expect(mockCookieStore.save).toHaveBeenCalled();
      const savedCookie = mockCookieStore.save.mock.calls[0][0];
      expect(savedCookie.expireAt).toBeGreaterThan(Date.now());
    });

    it('should fail when no cookie exists', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const result = await sessionManager.refreshSession();

      expect(result.success).toBe(false);
      expect(mockCookieStore.save).not.toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('should clear cookie', async () => {
      mockCookieStore.clear.mockResolvedValue({ success: true });

      const result = await sessionManager.clearSession();

      expect(result.success).toBe(true);
      expect(mockCookieStore.clear).toHaveBeenCalled();
    });

    it('should handle clear error', async () => {
      mockCookieStore.clear.mockResolvedValue({ success: false, error: 'Failed' });

      const result = await sessionManager.clearSession();

      expect(result.success).toBe(false);
    });
  });

  describe('extendSession', () => {
    it('should extend session by specified duration', async () => {
      const mockCookie = { uid: '123' };
      mockCookieStore.load.mockResolvedValue(mockCookie);
      mockCookieStore.save.mockResolvedValue({ success: true });

      const extendMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      const result = await sessionManager.extendSession(extendMs);

      expect(result.success).toBe(true);
      const savedCookie = mockCookieStore.save.mock.calls[0][0];
      expect(savedCookie.expireAt).toBeGreaterThan(Date.now() + extendMs - 1000);
    });

    it('should use default timeout when not specified', async () => {
      const mockCookie = { uid: '123' };
      mockCookieStore.load.mockResolvedValue(mockCookie);
      mockCookieStore.save.mockResolvedValue({ success: true });

      const result = await sessionManager.extendSession();

      expect(result.success).toBe(true);
      const savedCookie = mockCookieStore.save.mock.calls[0][0];
      expect(savedCookie.expireAt).toBeGreaterThan(Date.now() + 90 * 24 * 60 * 60 * 1000 - 1000);
    });

    it('should fail when no cookie exists', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const result = await sessionManager.extendSession();

      expect(result.success).toBe(false);
    });
  });

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      const mockCookie = {
        uid: '123',
        loginTime: Date.now() - 1000,
        expireAt: Date.now() + 1000000
      };
      mockCookieStore.load.mockResolvedValue(mockCookie);

      const result = await sessionManager.validateSession();

      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
    });

    it('should return false for expired session', async () => {
      const mockCookie = {
        uid: '123',
        expireAt: Date.now() - 1000
      };
      mockCookieStore.load.mockResolvedValue(mockCookie);

      const result = await sessionManager.validateSession();

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });

    it('should return false for missing session', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const result = await sessionManager.validateSession();

      expect(result.valid).toBe(false);
      expect(result.missing).toBe(true);
    });

    it('should return timeUntilExpiry', async () => {
      const expireAt = Date.now() + 3600000; // 1 hour
      mockCookieStore.load.mockResolvedValue({ expireAt });

      const result = await sessionManager.validateSession();

      expect(result.timeUntilExpiry).toBeDefined();
      expect(result.timeUntilExpiry).toBeGreaterThan(3500000);
    });
  });

  describe('getSessionDuration', () => {
    it('should return duration in milliseconds', async () => {
      const loginTime = Date.now() - 7200000; // 2 hours ago
      mockCookieStore.load.mockResolvedValue({ loginTime });

      const duration = await sessionManager.getSessionDuration();

      expect(duration).toBeGreaterThan(7100000);
    });

    it('should return 0 when no session', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const duration = await sessionManager.getSessionDuration();

      expect(duration).toBe(0);
    });
  });

  describe('getSessionAge', () => {
    it('should return age in human readable format', async () => {
      const loginTime = Date.now() - 7200000; // 2 hours ago
      mockCookieStore.load.mockResolvedValue({ loginTime });

      const age = await sessionManager.getSessionAge();

      expect(age).toContain('小时');
    });

    it('should return days for old sessions', async () => {
      const loginTime = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days ago
      mockCookieStore.load.mockResolvedValue({ loginTime });

      const age = await sessionManager.getSessionAge();

      expect(age).toContain('天');
    });

    it('should return unknown when no session', async () => {
      mockCookieStore.load.mockResolvedValue(null);

      const age = await sessionManager.getSessionAge();

      expect(age).toBe('未知');
    });
  });
});
