const Auth115 = require('../lib/auth');
const CookieStore = require('../lib/storage/cookie-store');

describe('Auth115', () => {
  let auth;
  let mockCookieStore;

  beforeEach(() => {
    mockCookieStore = {
      save: jest.fn(),
      load: jest.fn(),
      clear: jest.fn(),
      exists: jest.fn()
    };
    auth = new Auth115(mockCookieStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default cookieStore', () => {
      const defaultAuth = new Auth115();
      expect(defaultAuth.cookieStore).toBeDefined();
    });

    it('should create instance with provided cookieStore', () => {
      expect(auth.cookieStore).toBe(mockCookieStore);
    });

    it('should set correct API base URL', () => {
      expect(auth.apiBase).toBe('https://passportapi.115.com');
    });

    it('should set correct poll interval', () => {
      expect(auth.pollInterval).toBe(3000);
    });

    it('should set correct max poll count', () => {
      expect(auth.maxPollCount).toBe(100);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code successfully', async () => {
      // Mock axios response
      const mockResponse = {
        data: {
          state: 1,
          data: {
            uid: 'test-uid-123',
            sign: 'test-sign',
            qrcode: 'https://115.com/scan/dg-test123',
            time: Date.now()
          }
        }
      };

      // Mock QRCode.toDataURL
      const QRCode = require('qrcode');
      QRCode.toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,test');

      // Mock axios
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await auth.generateQRCode();

      expect(result.success).toBe(true);
      expect(result.image).toContain('data:image/png;base64,');
    });

    it('should handle API error', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await auth.generateQRCode();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle API response with state false', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: { state: 0, error: 'API error' }
      });

      const result = await auth.generateQRCode();

      expect(result.success).toBe(false);
    });
  });

  describe('checkQRStatus', () => {
    it('should return waiting status for code 90038', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: { state: false, code: 90038, message: '请扫描二维码' }
      });

      const result = await auth.checkQRStatus('test-key');

      expect(result.status).toBe('waiting');
      expect(result.pending).toBe(true);
    });

    it('should return expired status for code 90039', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: { state: false, code: 90039 }
      });

      const result = await auth.checkQRStatus('test-key');

      expect(result.status).toBe('expired');
    });

    it('should return cancelled status for code 90040', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: { state: false, code: 90040 }
      });

      const result = await auth.checkQRStatus('test-key');

      expect(result.status).toBe('cancelled');
    });

    it('should handle network error', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await auth.checkQRStatus('test-key');

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Network error');
    });
  });

  describe('parseCookie', () => {
    it('should parse cookie string correctly', () => {
      const cookieString = 'UID=123; CID=456; SE=789';
      const result = auth.parseCookie(cookieString);

      expect(result).toEqual({
        uid: '123',
        cid: '456',
        se: '789'
      });
    });

    it('should handle empty cookie string', () => {
      const result = auth.parseCookie('');

      expect(result).toEqual({
        uid: '',
        cid: '',
        se: ''
      });
    });

    it('should handle partial cookie string', () => {
      const cookieString = 'UID=123; other=value';
      const result = auth.parseCookie(cookieString);

      expect(result.uid).toBe('123');
      expect(result.cid).toBe('');
      expect(result.se).toBe('');
    });
  });

  describe('sleep', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await auth.sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });

  describe('login', () => {
    it('should complete login flow successfully', async () => {
      // Mock QR code generation
      auth.generateQRCode = jest.fn().mockResolvedValue({
        success: true,
        key: 'test-key',
        image: 'data:image/png;base64,test'
      });

      // Mock status check - return logged_in on second call
      let callCount = 0;
      auth.checkQRStatus = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ success: false, pending: true, status: 'waiting' });
        } else {
          return Promise.resolve({
            success: true,
            cookie: { uid: '123', cid: '456', se: '789' },
            status: 'logged_in'
          });
        }
      });

      // Mock cookie store save
      mockCookieStore.save.mockResolvedValue({ success: true });

      const callbacks = {
        onQRCode: jest.fn(),
        onStatus: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn()
      };

      auth.maxPollCount = 2;
      auth.pollInterval = 10;

      const result = await auth.login(callbacks);

      expect(result.success).toBe(true);
      expect(callbacks.onQRCode).toHaveBeenCalled();
      expect(callbacks.onComplete).toHaveBeenCalled();
      expect(mockCookieStore.save).toHaveBeenCalled();
    });

    it('should handle login timeout', async () => {
      auth.generateQRCode = jest.fn().mockResolvedValue({
        success: true,
        key: 'test-key'
      });

      auth.checkQRStatus = jest.fn().mockResolvedValue({
        success: false,
        pending: true,
        status: 'waiting'
      });

      // Set maxPollCount to 2 for faster test
      auth.maxPollCount = 2;
      auth.pollInterval = 10;

      const callbacks = {
        onError: jest.fn()
      };

      const result = await auth.login(callbacks);

      expect(result.success).toBe(false);
      expect(result.error).toContain('超时');
    });
  });

  describe('validateCookie', () => {
    it('should return true for valid cookie', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: { state: true }
      });

      const cookie = { uid: '123', cid: '456', se: '789' };
      const result = await auth.validateCookie(cookie);

      expect(result).toBe(true);
    });

    it('should return false for invalid cookie', async () => {
      const axios = require('axios');
      axios.get = jest.fn().mockRejectedValue(new Error('Invalid cookie'));

      const cookie = { uid: 'invalid', cid: 'invalid', se: 'invalid' };
      const result = await auth.validateCookie(cookie);

      expect(result).toBe(false);
    });
  });
});
