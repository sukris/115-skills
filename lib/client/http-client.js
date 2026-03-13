const axios = require('axios');
const crypto = require('crypto');

/**
 * 115 API HTTP 请求封装
 * 
 * 功能：
 * - 统一请求签名
 * - 速率限制控制
 * - 自动重试机制
 * - 错误处理
 */
class HttpClient {
  constructor(cookie) {
    this.cookie = cookie;
    this.apiBase = 'https://webapi.115.com';
    
    // 速率限制配置
    this.rateLimit = {
      maxRequests: 100,        // 每分钟最大请求数
      windowMs: 60 * 1000,     // 时间窗口
      currentRequests: [],     // 当前窗口内的请求
      concurrentLimit: 5       // 并发限制
    };

    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatus: [429, 500, 502, 503, 504]
    };

    // 默认请求头
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // 并发控制
    this.activeRequests = 0;
    this.requestQueue = [];
  }

  /**
   * 生成请求签名
   * @param {Object} params - 请求参数
   * @returns {string} 签名
   */
  generateSign(params = {}) {
    const timestamp = Date.now();
    const signString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto.createHash('md5')
      .update(signString + timestamp + this.cookie.se)
      .digest('hex');
  }

  /**
   * 获取 Cookie 头
   * @returns {string} Cookie 字符串
   */
  getCookieHeader() {
    return `UID=${this.cookie.uid}; CID=${this.cookie.cid}; SE=${this.cookie.se}`;
  }

  /**
   * 检查速率限制
   * @returns {Promise<void>}
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // 清理过期请求
    this.rateLimit.currentRequests = this.rateLimit.currentRequests.filter(
      time => now - time < this.rateLimit.windowMs
    );

    // 检查是否超限
    if (this.rateLimit.currentRequests.length >= this.rateLimit.maxRequests) {
      const oldestRequest = this.rateLimit.currentRequests[0];
      const waitTime = this.rateLimit.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // 记录请求
    this.rateLimit.currentRequests.push(Date.now());
  }

  /**
   * 并发控制
   * @returns {Promise<Function>} 释放函数
   */
  async acquireSlot() {
    if (this.activeRequests < this.rateLimit.concurrentLimit) {
      this.activeRequests++;
      return () => {
        this.activeRequests--;
        this.processQueue();
      };
    }

    // 等待可用槽位
    return new Promise(resolve => {
      this.requestQueue.push(resolve);
    });
  }

  /**
   * 处理队列
   */
  processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests < this.rateLimit.concurrentLimit) {
      const next = this.requestQueue.shift();
      this.activeRequests++;
      next();
    }
  }

  /**
   * 发送请求
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      params = {},
      data = {},
      headers = {},
      useSign = false,
      retryCount = 0
    } = options;

    try {
      // 速率限制
      await this.checkRateLimit();

      // 获取并发槽位
      const release = await this.acquireSlot();

      // 构建完整 URL
      const url = endpoint.startsWith('http') ? endpoint : `${this.apiBase}${endpoint}`;

      // 准备请求头
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
        'Cookie': this.getCookieHeader()
      };

      // 添加签名
      if (useSign && method === 'POST') {
        params.sign = this.generateSign(params);
      }

      // 发送请求
      const response = await axios({
        method,
        url,
        params: method === 'GET' ? { ...params, _: Date.now() } : params,
        data: method === 'POST' ? data : undefined,
        headers: requestHeaders,
        timeout: 30000,
        validateStatus: () => true // 不自动抛出错误
      });

      // 释放槽位
      release();

      // 处理响应
      const responseData = response.data;

      // 检查业务错误
      if (responseData && responseData.state === false) {
        const error = new Error(responseData.error || 'API 请求失败');
        error.code = responseData.errno || 'API_ERROR';
        error.data = responseData;
        throw error;
      }

      return responseData;

    } catch (error) {
      // 重试逻辑
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
      }

      throw error;
    }
  }

  /**
   * 判断是否应该重试
   * @param {Error} error - 错误对象
   * @param {number} retryCount - 当前重试次数
   * @returns {boolean} 是否重试
   */
  shouldRetry(error, retryCount) {
    if (retryCount >= this.retryConfig.maxRetries) {
      return false;
    }

    if (error.response) {
      return this.retryConfig.retryableStatus.includes(error.response.status);
    }

    // 网络错误重试
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' || 
           error.code === 'ECONNREFUSED';
  }

  /**
   * GET 请求
   * @param {string} endpoint - API 端点
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} 响应数据
   */
  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }

  /**
   * POST 请求
   * @param {string} endpoint - API 端点
   * @param {Object} data - 请求数据
   * @param {Object} params - URL 参数
   * @returns {Promise<Object>} 响应数据
   */
  async post(endpoint, data = {}, params = {}) {
    return this.request(endpoint, { method: 'POST', data, params, useSign: true });
  }

  /**
   * 批量请求
   * @param {Array<Object>} requests - 请求数组
   * @returns {Promise<Array<Object>>} 响应数组
   */
  async batchRequest(requests) {
    const results = [];
    const batchSize = 10;

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => this.request(req.endpoint, req.options).catch(err => ({ error: err.message })))
      );
      results.push(...batchResults);

      // 避免速率限制
      if (i + batchSize < requests.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * 休眠函数
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取速率限制状态
   * @returns {Object} 状态信息
   */
  getRateLimitStatus() {
    const now = Date.now();
    const currentRequests = this.rateLimit.currentRequests.filter(
      time => now - time < this.rateLimit.windowMs
    );

    return {
      currentRequests: currentRequests.length,
      maxRequests: this.rateLimit.maxRequests,
      windowMs: this.rateLimit.windowMs,
      activeRequests: this.activeRequests,
      concurrentLimit: this.rateLimit.concurrentLimit,
      queuedRequests: this.requestQueue.length
    };
  }
}

module.exports = HttpClient;
