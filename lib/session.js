const CookieStore = require('./storage/cookie-store');
const Auth115 = require('./auth');

/**
 * 会话管理模块
 * 
 * 管理用户登录会话，自动续期，状态跟踪
 */
class SessionManager {
  constructor(cookieStore = null) {
    this.cookieStore = cookieStore || new CookieStore();
    this.auth = new Auth115(this.cookieStore);
    this.sessionInfo = null;
    this.autoRenewThreshold = 7 * 24 * 60 * 60 * 1000; // 7 天前自动续期
  }

  /**
   * 获取当前会话信息
   * @returns {Promise<Object>} 会话信息
   */
  async getSessionInfo() {
    const cookie = await this.cookieStore.load();
    
    if (!cookie) {
      return {
        loggedIn: false,
        reason: 'no_cookie'
      };
    }

    const isValid = await this.auth.validateCookie(cookie);
    
    if (!isValid) {
      await this.cookieStore.clear();
      return {
        loggedIn: false,
        reason: 'cookie_expired'
      };
    }

    // 检查是否需要续期
    const needsRenewal = cookie.expireAt && 
      (Date.now() + this.autoRenewThreshold > cookie.expireAt);

    this.sessionInfo = {
      loggedIn: true,
      uid: cookie.uid,
      loginTime: cookie.loginTime,
      expireAt: cookie.expireAt,
      needsRenewal,
      daysUntilExpiry: cookie.expireAt ? 
        Math.floor((cookie.expireAt - Date.now()) / (24 * 60 * 60 * 1000)) : null,
      vip: cookie.vip || false,
      vipType: cookie.vipType,
      vipExpire: cookie.vipExpire
    };

    return this.sessionInfo;
  }

  /**
   * 检查会话是否有效
   * @returns {Promise<boolean>} 是否有效
   */
  async isValid() {
    const info = await this.getSessionInfo();
    return info.loggedIn === true;
  }

  /**
   * 获取用户信息
   * @returns {Promise<Object|null>} 用户信息
   */
  async getUserInfo() {
    const info = await this.getSessionInfo();
    
    if (!info.loggedIn) {
      return null;
    }

    return {
      uid: info.uid,
      loginTime: info.loginTime,
      vip: info.vip,
      vipType: info.vipType,
      vipExpire: info.vipExpire
    };
  }

  /**
   * 自动续期会话
   * @returns {Promise<Object>} 续期结果
   */
  async autoRenew() {
    const info = await this.getSessionInfo();
    
    if (!info.loggedIn) {
      return {
        success: false,
        reason: 'not_logged_in'
      };
    }

    if (!info.needsRenewal) {
      return {
        success: false,
        reason: 'not_needed',
        daysUntilExpiry: info.daysUntilExpiry
      };
    }

    // 更新过期时间
    const cookie = await this.cookieStore.load();
    cookie.expireAt = Date.now() + 90 * 24 * 60 * 60 * 1000; // 续期 90 天
    
    const saveResult = await this.cookieStore.save(cookie);
    
    return {
      success: saveResult.success,
      newExpireAt: cookie.expireAt,
      daysAdded: 90
    };
  }

  /**
   * 强制刷新会话
   * @returns {Promise<Object>} 刷新结果
   */
  async refresh() {
    await this.cookieStore.clear();
    this.sessionInfo = null;
    
    return {
      success: true,
      message: '会话已清除，请重新登录'
    };
  }

  /**
   * 获取会话统计
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const storageInfo = this.cookieStore.getStorageInfo();
    const sessionInfo = await this.getSessionInfo();

    return {
      hasCookie: this.cookieStore.exists(),
      storagePath: storageInfo?.path,
      storageSize: storageInfo?.size,
      storagePermissions: storageInfo?.permissions,
      loggedIn: sessionInfo.loggedIn,
      uid: sessionInfo.uid,
      daysUntilExpiry: sessionInfo.daysUntilExpiry,
      needsRenewal: sessionInfo.needsRenewal,
      vip: sessionInfo.vip
    };
  }
}

module.exports = SessionManager;
