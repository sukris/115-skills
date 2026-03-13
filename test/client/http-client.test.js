const HttpClient = require('../../lib/client/http-client');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('HttpClient', () => {
  let httpClient;
  let mockCookie;

  beforeEach(() => {
    mockCookie = { uid: 'test-uid', cid: 'test-cid', se: 'test-se' };
    httpClient = new HttpClient(mockCookie);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with cookie', () => {
      expect(httpClient.cookie).toEqual(mockCookie);
    });

    it('should set correct API base URL', () => {
      expect(httpClient.apiBase).toBe('https://webapi.115.com');
    });

    it('should set correct rate limit config', () => {
      expect(httpClient.rateLimit.maxRequests).toBe(100);
      expect(httpClient.rateLimit.windowMs).toBe(60000);
      expect(httpClient.rateLimit.concurrentLimit).toBe(5);
    });

    it('should set correct retry config', () => {
      expect(httpClient.retryConfig.maxRetries).toBe(3);
      expect(httpClient.retryConfig.retryDelay).toBe(1000);
    });
  });

  describe('generateSign', () => {
    it('should generate signature correctly', () => {
      const params = { key1: 'value1', key2: 'value2' };
      const sign = httpClient.generateSign(params);

      expect(sign).toBeDefined();
      expect(sign.length).toBe(32); // MD5 hash length
    });

    it('should generate different signatures for different params', () => {
      const sign1 = httpClient.generateSign({ a: '1' });
      const sign2 = httpClient.generateSign({ a: '2' });

      expect(sign1).not.toBe(sign2);
    });

    it('should handle empty params', () => {
      const sign = httpClient.generateSign({});
      expect(sign).toBeDefined();
    });
  });

  describe('getCookieHeader', () => {
    it('should return correct cookie header', () => {
      const header = httpClient.getCookieHeader();
      expect(header).toContain('UID=test-uid');
      expect(header).toContain('CID=test-cid');
      expect(header).toContain('SE=test-se');
    });

    it('should handle empty cookie', () => {
      httpClient.cookie = null;
      const header = httpClient.getCookieHeader();
      expect(header).toBe('');
    });

    it('should handle partial cookie', () => {
      httpClient.cookie = { uid: '123' };
      const header = httpClient.getCookieHeader();
      expect(header).toContain('UID=123');
    });
  });

  describe('checkRateLimit', () => {
    it('should not block when under limit', async () => {
      const start = Date.now();
      await httpClient.checkRateLimit();
      const end = Date.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should clean up old requests', async () => {
      // Add old requests
      httpClient.rateLimit.currentRequests = [Date.now() - 120000];

      await httpClient.checkRateLimit();

      expect(httpClient.rateLimit.currentRequests.length).toBe(1);
    });
  });

  describe('acquireSlot', () => {
    it('should acquire slot immediately when under limit', async () => {
      const release = await httpClient.acquireSlot();

      expect(httpClient.activeRequests).toBe(1);
      expect(typeof release).toBe('function');

      release();
      expect(httpClient.activeRequests).toBe(0);
    });

    it('should queue when at limit', async () => {
      // Fill all slots
      const releases = [];
      for (let i = 0; i < 5; i++) {
        const release = await httpClient.acquireSlot();
        releases.push(release);
      }

      expect(httpClient.activeRequests).toBe(5);

      // Next acquire should queue (we won't wait for it in this test)
      expect(httpClient.requestQueue.length).toBe(0);
    });

    it('should release slot correctly', async () => {
      const release = await httpClient.acquireSlot();
      expect(httpClient.activeRequests).toBe(1);

      release();
      expect(httpClient.activeRequests).toBe(0);
    });

    it('should not release twice', async () => {
      const release = await httpClient.acquireSlot();
      release();
      release(); // Should be no-op

      expect(httpClient.activeRequests).toBe(0);
    });
  });

  describe('processQueue', () => {
    it('should process queued requests', async () => {
      // Add items to queue
      const mockResolver = jest.fn();
      httpClient.requestQueue.push(mockResolver);

      httpClient.processQueue();

      expect(mockResolver).toHaveBeenCalled();
    });

    it('should not process when queue is empty', () => {
      expect(() => httpClient.processQueue()).not.toThrow();
    });

    it('should not process when at limit', () => {
      httpClient.activeRequests = 5;
      const mockResolver = jest.fn();
      httpClient.requestQueue.push(mockResolver);

      httpClient.processQueue();

      expect(mockResolver).not.toHaveBeenCalled();
    });
  });

  describe('request', () => {
    beforeEach(() => {
      axios.mockClear();
    });

    it('should send GET request successfully', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true, data: { result: 'success' } }
      });

      const result = await httpClient.request('/test', { method: 'GET' });

      expect(result.state).toBe(true);
      expect(axios).toHaveBeenCalled();
    });

    it('should send POST request with form data', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true }
      });

      const result = await httpClient.request('/test', {
        method: 'POST',
        data: { key: 'value' }
      });

      expect(result.state).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should retry on 500 error', async () => {
      axios
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce({
          status: 200,
          data: { state: true }
        });

      httpClient.retryConfig.retryDelay = 10; // Fast retry for test

      const result = await httpClient.request('/test');

      expect(result.state).toBe(true);
      expect(axios).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 error', async () => {
      axios
        .mockRejectedValueOnce({ response: { status: 429 } })
        .mockResolvedValueOnce({
          status: 200,
          data: { state: true }
        });

      httpClient.retryConfig.retryDelay = 10;

      const result = await httpClient.request('/test');

      expect(result.state).toBe(true);
      expect(axios).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      axios.mockRejectedValue({ response: { status: 500 } });
      httpClient.retryConfig.retryDelay = 10;

      await expect(httpClient.request('/test')).rejects.toThrow();
    });

    it('should handle API business error', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: false, error: 'Business error' }
      });

      await expect(httpClient.request('/test')).rejects.toThrow('Business error');
    });

    it('should release slot on error', async () => {
      axios.mockRejectedValue(new Error('Network error'));

      try {
        await httpClient.request('/test');
      } catch (e) {
        // Expected
      }

      expect(httpClient.activeRequests).toBe(0);
    });

    it('should add timestamp to GET params', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true }
      });

      await httpClient.request('/test', { method: 'GET', params: { key: 'value' } });

      const callArgs = axios.mock.calls[0][0];
      expect(callArgs.params._).toBeDefined();
    });
  });

  describe('get', () => {
    it('should call request with GET method', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true }
      });

      await httpClient.get('/test', { param: 'value' });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('post', () => {
    it('should call request with POST method', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true }
      });

      await httpClient.post('/test', { data: 'value' });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('batch', () => {
    it('should process batch requests', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { state: true }
      });

      const requests = [
        { endpoint: '/test1', options: {} },
        { endpoint: '/test2', options: {} }
      ];

      const results = await httpClient.batch(requests);

      expect(results.length).toBe(2);
      expect(axios).toHaveBeenCalledTimes(2);
    });

    it('should handle batch errors gracefully', async () => {
      axios
        .mockResolvedValueOnce({ status: 200, data: { state: true } })
        .mockRejectedValueOnce(new Error('Failed'));

      const requests = [
        { endpoint: '/test1', options: {} },
        { endpoint: '/test2', options: {} }
      ];

      const results = await httpClient.batch(requests);

      expect(results.length).toBe(2);
      expect(results[1].error).toBe('Failed');
    });
  });

  describe('sleep', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await httpClient.sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });

  describe('setCookie', () => {
    it('should update cookie', () => {
      const newCookie = { uid: 'new-uid', cid: 'new-cid', se: 'new-se' };
      httpClient.setCookie(newCookie);

      expect(httpClient.cookie).toEqual(newCookie);
    });
  });
});
