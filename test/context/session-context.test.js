/**
 * SessionContext 测试
 */

const SessionContext = require('../../lib/context/session-context');

describe('SessionContext', () => {
  let ctx;

  beforeEach(() => {
    ctx = new SessionContext();
  });

  describe('基础功能', () => {
    test('创建会话', () => {
      expect(ctx.sessionId).toBeDefined();
      expect(ctx.currentPath).toBe('/');
      expect(ctx.selectedFiles).toEqual([]);
      expect(ctx.history).toEqual([]);
    });

    test('自定义会话 ID', () => {
      const customCtx = new SessionContext('my-session-123');
      expect(customCtx.sessionId).toBe('my-session-123');
    });
  });

  describe('路径管理', () => {
    test('设置和获取路径', () => {
      ctx.setPath('/工作文档');
      expect(ctx.getPath()).toBe('/工作文档');
    });

    test('进入子目录', () => {
      ctx.enterDirectory('工作文档');
      expect(ctx.getPath()).toBe('/工作文档');
      
      ctx.enterDirectory('2026 项目');
      expect(ctx.getPath()).toBe('/工作文档/2026 项目');
    });

    test('返回上一级', () => {
      ctx.setPath('/工作文档/2026 项目');
      ctx.goBack();
      expect(ctx.getPath()).toBe('/工作文档');
      
      ctx.goBack();
      expect(ctx.getPath()).toBe('/');
      
      // 根目录不能再返回
      ctx.goBack();
      expect(ctx.getPath()).toBe('/');
    });

    test('面包屑导航', () => {
      ctx.setPath('/工作文档/2026 项目/报告');
      const breadcrumb = ctx.getBreadcrumb();
      
      expect(breadcrumb.length).toBe(4);
      expect(breadcrumb[0]).toEqual({ name: '根目录', path: '/' });
      expect(breadcrumb[1]).toEqual({ name: '工作文档', path: '/工作文档' });
      expect(breadcrumb[2]).toEqual({ name: '2026 项目', path: '/工作文档/2026 项目' });
      expect(breadcrumb[3]).toEqual({ name: '报告', path: '/工作文档/2026 项目/报告' });
    });
  });

  describe('文件选择', () => {
    test('选中文件（字符串 ID）', () => {
      ctx.selectFiles(['file1', 'file2', 'file3']);
      expect(ctx.getSelectedFiles()).toEqual(['file1', 'file2', 'file3']);
      expect(ctx.getSelectedCount()).toBe(3);
    });

    test('选中文件（对象数组）', () => {
      const files = [
        { file_id: '123', name: 'file1.txt' },
        { cid: '456', name: 'file2.txt' },
        { id: '789', name: 'file3.txt' }
      ];
      
      ctx.selectFiles(files);
      expect(ctx.getSelectedFiles()).toEqual(['123', '456', '789']);
    });

    test('添加选中文件', () => {
      ctx.selectFiles(['file1']);
      ctx.addSelectedFile('file2');
      ctx.addSelectedFile({ file_id: 'file3' });
      
      expect(ctx.getSelectedCount()).toBe(3);
    });

    test('清除选中', () => {
      ctx.selectFiles(['file1', 'file2']);
      ctx.clearSelected();
      
      expect(ctx.getSelectedCount()).toBe(0);
      expect(ctx.getSelectedFiles()).toEqual([]);
    });
  });

  describe('操作历史', () => {
    test('记录操作', () => {
      ctx.recordAction('view_files', { path: '/工作文档' });
      
      expect(ctx.history.length).toBe(1);
      expect(ctx.lastAction.action).toBe('view_files');
    });

    test('获取历史记录', () => {
      for (let i = 0; i < 60; i++) {
        ctx.recordAction(`action_${i}`);
      }
      
      // 只保留最近 50 条
      expect(ctx.history.length).toBe(50);
      
      const history = ctx.getHistory(20);
      expect(history.length).toBe(20);
    });

    test('搜索历史', () => {
      ctx.recordAction('view_files', { path: '/a' });
      ctx.recordAction('delete_file', { id: '123' });
      ctx.recordAction('view_files', { path: '/b' });
      
      const views = ctx.searchHistory('view_files');
      expect(views.length).toBe(2);
    });

    test('路径切换自动记录历史', () => {
      ctx.setPath('/工作文档');
      ctx.setPath('/工作文档/2026 项目');
      
      const pathChanges = ctx.searchHistory('path_change');
      expect(pathChanges.length).toBe(2);
    });
  });

  describe('序列化/反序列化', () => {
    test('序列化', () => {
      ctx.setPath('/工作文档');
      ctx.selectFiles(['file1', 'file2']);
      ctx.recordAction('test_action');
      
      const json = ctx.serialize();
      expect(typeof json).toBe('string');
      
      const data = JSON.parse(json);
      expect(data.currentPath).toBe('/工作文档');
      expect(data.selectedFiles).toEqual(['file1', 'file2']);
    });

    test('反序列化', () => {
      ctx.setPath('/工作文档');
      ctx.selectFiles(['file1', 'file2']);
      
      const json = ctx.serialize();
      const restored = SessionContext.deserialize(json);
      
      expect(restored.currentPath).toBe('/工作文档');
      expect(restored.getSelectedCount()).toBe(2);
      expect(restored.sessionId).toBe(ctx.sessionId);
    });

    test('反序列化失败返回新实例', () => {
      const restored = SessionContext.deserialize('invalid json');
      expect(restored).toBeInstanceOf(SessionContext);
      expect(restored.currentPath).toBe('/');
    });
  });

  describe('上下文信息', () => {
    test('获取上下文信息', () => {
      ctx.setPath('/工作文档');
      ctx.selectFiles(['file1', 'file2']);
      
      const info = ctx.getInfo();
      
      expect(info.sessionId).toBeDefined();
      expect(info.currentPath).toBe('/工作文档');
      expect(info.selectedCount).toBe(2);
      expect(info.historyCount).toBe(2); // path_change + select_files
      expect(info.createdAt).toBeDefined();
      expect(info.updatedAt).toBeDefined();
    });
  });

  describe('重置', () => {
    test('重置上下文', () => {
      ctx.setPath('/工作文档/2026 项目');
      ctx.selectFiles(['file1', 'file2']);
      ctx.recordAction('test');
      
      ctx.reset();
      
      expect(ctx.getPath()).toBe('/');
      expect(ctx.getSelectedCount()).toBe(0);
      expect(ctx.history.length).toBe(0);
      expect(ctx.lastAction).toBeNull();
    });
  });
});

// 手动测试场景
describe('SessionContext - 手动测试场景', () => {
  test('完整浏览流程', () => {
    const ctx = new SessionContext();
    
    // 进入工作文档
    ctx.enterDirectory('工作文档');
    expect(ctx.getPath()).toBe('/工作文档');
    
    // 选中文件
    ctx.selectFiles(['file1', 'file2']);
    expect(ctx.getSelectedCount()).toBe(2);
    
    // 进入子目录
    ctx.enterDirectory('2026 项目');
    expect(ctx.getPath()).toBe('/工作文档/2026 项目');
    
    // 返回
    ctx.goBack();
    expect(ctx.getPath()).toBe('/工作文档');
    
    // 清除选中
    ctx.clearSelected();
    expect(ctx.getSelectedCount()).toBe(0);
    
    // 获取面包屑
    const breadcrumb = ctx.getBreadcrumb();
    expect(breadcrumb.length).toBe(2);
  });
});
