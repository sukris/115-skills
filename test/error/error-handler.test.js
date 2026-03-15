/**
 * ErrorHandler 测试
 */

const ErrorHandler = require('../../lib/error/error-handler');

describe('ErrorHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  describe('创建错误', () => {
    test('创建网络错误', () => {
      const error = handler.createError('NETWORK');
      
      expect(error.type).toBe('network');
      expect(error.message).toContain('网络');
      expect(error.recoveries.length).toBeGreaterThan(0);
    });

    test('创建认证错误', () => {
      const error = handler.createError('AUTH');
      
      expect(error.type).toBe('auth');
      expect(error.message).toContain('认证');
    });

    test('创建 Cookie 过期错误', () => {
      const error = handler.createError('COOKIE_EXPIRED');
      
      expect(error.type).toBe('cookie_expired');
      expect(error.message).toContain('过期');
    });

    test('创建未登录错误', () => {
      const error = handler.createError('NOT_LOGGED_IN');
      
      expect(error.type).toBe('not_logged_in');
      expect(error.message).toContain('登录');
    });

    test('创建文件不存在错误', () => {
      const error = handler.createError('FILE_NOT_FOUND');
      
      expect(error.type).toBe('file_not_found');
      expect(error.message).toContain('文件');
    });

    test('创建服务器错误', () => {
      const error = handler.createError('SERVER');
      
      expect(error.type).toBe('server');
      expect(error.message).toContain('服务器');
    });

    test('创建空间不足错误', () => {
      const error = handler.createError('SPACE_FULL');
      
      expect(error.type).toBe('space_full');
      expect(error.message).toContain('空间');
    });

    test('创建未知错误', () => {
      const error = handler.createError('UNKNOWN_TYPE');
      
      expect(error.type).toBe('unknown');
    });

    test('创建带自定义消息的错误', () => {
      const error = handler.createError('NETWORK', '自定义消息');
      
      expect(error.message).toBe('自定义消息');
    });

    test('创建带上下文的错误', () => {
      const error = handler.createError('NETWORK', null, {
        context: { url: 'https://example.com' }
      });
      
      expect(error.context.url).toBe('https://example.com');
    });
  });

  describe('HTTP 错误转换', () => {
    test('网络错误（无状态码）', () => {
      const httpError = new Error('Network Error');
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('network');
    });

    test('401 认证错误', () => {
      const httpError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('auth');
    });

    test('403 权限错误', () => {
      const httpError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('auth');
    });

    test('404 未找到', () => {
      const httpError = {
        response: {
          status: 404,
          data: { error: 'Not Found' }
        }
      };
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('not_found');
    });

    test('400 参数错误', () => {
      const httpError = {
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      };
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('param');
    });

    test('500 服务器错误', () => {
      const httpError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      const error = handler.fromHttpError(httpError);
      
      expect(error.type).toBe('server');
    });
  });

  describe('API 响应转换', () => {
    test('Cookie 过期（errno: 990001）', () => {
      const response = {
        state: false,
        errno: 990001,
        error: '登录超时'
      };
      const error = handler.fromApiResponse(response);
      
      expect(error.type).toBe('cookie_expired');
    });

    test('文件不存在（errno: 90008）', () => {
      const response = {
        state: false,
        errno: 90008,
        error: '文件不存在'
      };
      const error = handler.fromApiResponse(response);
      
      expect(error.type).toBe('file_not_found');
    });

    test('目录不存在（errno: 430003）', () => {
      const response = {
        state: false,
        errno: 430003,
        error: '目录不存在'
      };
      const error = handler.fromApiResponse(response);
      
      expect(error.type).toBe('dir_not_found');
    });

    test('权限不足（errno: 980005）', () => {
      const response = {
        state: false,
        errno: 980005,
        error: '权限不足'
      };
      const error = handler.fromApiResponse(response);
      
      expect(error.type).toBe('permission');
    });

    test('业务错误', () => {
      const response = {
        state: false,
        errno: 12345,
        error: '操作失败'
      };
      const error = handler.fromApiResponse(response);
      
      expect(error.type).toBe('business');
    });

    test('成功响应不是错误', () => {
      const response = {
        state: true,
        errno: 0
      };
      const error = handler.fromApiResponse(response);
      
      expect(error).toBeNull();
    });
  });

  describe('友好消息', () => {
    test('获取友好消息', () => {
      const error = handler.createError('NETWORK');
      const message = handler.getFriendlyMessage(error);
      
      expect(message).toContain('网络');
    });

    test('null 错误', () => {
      const message = handler.getFriendlyMessage(null);
      expect(message).toBe('未知错误');
    });
  });

  describe('恢复建议', () => {
    test('获取恢复建议', () => {
      const error = handler.createError('SPACE_FULL');
      const recoveries = handler.getRecoveries(error);
      
      expect(recoveries.length).toBeGreaterThan(0);
      expect(recoveries).toContain('回复"清理建议"获取清理方案');
    });

    test('null 错误', () => {
      const recoveries = handler.getRecoveries(null);
      expect(recoveries).toEqual([]);
    });
  });

  describe('格式化输出', () => {
    test('格式化错误', () => {
      const error = handler.createError('SPACE_FULL');
      const output = handler.formatError(error);
      
      expect(output).toContain('❌');
      expect(output).toContain('💡');
      expect(output).toContain('空间');
    });

    test('null 错误', () => {
      const output = handler.formatError(null);
      expect(output).toBe('');
    });
  });

  describe('错误判断', () => {
    test('需要重新登录', () => {
      const error = handler.createError('COOKIE_EXPIRED');
      expect(handler.needsRelogin(error)).toBe(true);
    });

    test('不需要重新登录', () => {
      const error = handler.createError('NETWORK');
      expect(handler.needsRelogin(error)).toBe(false);
    });

    test('可重试错误', () => {
      const error = handler.createError('NETWORK');
      expect(handler.isRetryable(error)).toBe(true);
    });

    test('不可重试错误', () => {
      const error = handler.createError('FILE_NOT_FOUND');
      expect(handler.isRetryable(error)).toBe(false);
    });

    test('判断错误类型', () => {
      const error = handler.createError('NETWORK');
      expect(handler.isErrorType(error, 'NETWORK')).toBe(true);
      expect(handler.isErrorType(error, 'AUTH')).toBe(false);
    });
  });

  describe('错误日志', () => {
    test('记录错误日志', () => {
      handler.createError('NETWORK');
      handler.createError('AUTH');
      
      const log = handler.getErrorLog();
      expect(log.length).toBe(2);
    });

    test('限制日志大小', () => {
      for (let i = 0; i < 150; i++) {
        handler.createError('NETWORK');
      }
      
      const log = handler.getErrorLog(100);
      expect(log.length).toBe(100); // 获取最多 100 条
    });

    test('清除日志', () => {
      handler.createError('NETWORK');
      handler.clearErrorLog();
      
      expect(handler.getErrorLog().length).toBe(0);
    });

    test('获取错误统计', () => {
      handler.createError('NETWORK');
      handler.createError('NETWORK');
      handler.createError('AUTH');
      
      const stats = handler.getErrorStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byType.network).toBe(2);
      expect(stats.byType.auth).toBe(1);
      expect(stats.mostCommon).toBe('network');
    });
  });

  describe('自定义错误', () => {
    test('注册自定义错误', () => {
      handler.registerError('custom_error', '自定义错误消息', ['建议 1', '建议 2']);
      
      const error = handler.createError('CUSTOM_ERROR');
      
      expect(error.message).toBe('自定义错误消息');
      expect(error.recoveries).toEqual(['建议 1', '建议 2']);
    });
  });

  describe('获取错误类型', () => {
    test('获取所有错误类型', () => {
      const types = handler.getErrorTypes();
      
      expect(typeof types).toBe('object');
      expect(types.NETWORK).toBe('network');
      expect(types.AUTH).toBe('auth');
      expect(types.SERVER).toBe('server');
    });
  });
});

// 集成测试场景
describe('ErrorHandler - 集成测试场景', () => {
  let handler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  test('完整错误处理流程', () => {
    // 模拟 API 调用失败
    const apiResponse = {
      state: false,
      errno: 990001,
      error: '登录超时'
    };

    // 转换错误
    const error = handler.fromApiResponse(apiResponse);

    // 获取友好消息
    const message = handler.getFriendlyMessage(error);
    expect(message).toContain('过期');

    // 获取恢复建议
    const recoveries = handler.getRecoveries(error);
    expect(recoveries.length).toBeGreaterThan(0);

    // 格式化输出
    const output = handler.formatError(error);
    expect(output).toContain('❌');
    expect(output).toContain('💡');

    // 判断是否需要重新登录
    expect(handler.needsRelogin(error)).toBe(true);
  });

  test('HTTP 错误处理', () => {
    // 模拟网络错误
    const httpError = {
      message: 'Request failed',
      response: {
        status: 503,
        data: { error: 'Service Unavailable' }
      }
    };

    const error = handler.fromHttpError(httpError);
    expect(error.type).toBe('server');
    expect(handler.isRetryable(error)).toBe(true);
  });

  test('115 API 特定错误', () => {
    // 文件不存在
    const fileNotFound = {
      state: false,
      errno: 90008
    };
    const error1 = handler.fromApiResponse(fileNotFound);
    expect(error1.type).toBe('file_not_found');

    // 目录不存在
    const dirNotFound = {
      state: false,
      errno: 430003
    };
    const error2 = handler.fromApiResponse(dirNotFound);
    expect(error2.type).toBe('dir_not_found');

    // 空间不足
    const spaceFull = {
      state: false,
      errno: 999999,
      error: '空间不足'
    };
    const error3 = handler.fromApiResponse(spaceFull);
    expect(error3.type).toBe('business');
  });
});
