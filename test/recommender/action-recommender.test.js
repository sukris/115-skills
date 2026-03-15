/**
 * ActionRecommender 测试
 */

const ActionRecommender = require('../../lib/recommender/action-recommender');

describe('ActionRecommender', () => {
  let recommender;

  beforeEach(() => {
    recommender = new ActionRecommender();
  });

  describe('基础推荐', () => {
    test('容量查询推荐', () => {
      const recs = recommender.recommend('status');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('clean');
      expect(recs[0].text).toContain('清理');
    });

    test('文件浏览推荐', () => {
      const recs = recommender.recommend('files');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('search');
      expect(recs[0].text).toContain('搜索');
    });

    test('搜索后推荐', () => {
      const recs = recommender.recommend('search');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('select_all');
    });

    test('下载完成推荐', () => {
      const recs = recommender.recommend('download');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('organize');
    });

    test('整理后推荐', () => {
      const recs = recommender.recommend('organize');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('clean');
    });

    test('清理后推荐', () => {
      const recs = recommender.recommend('clean');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('clean_confirm');
    });

    test('分享后推荐', () => {
      const recs = recommender.recommend('share');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('share_list');
    });

    test('转存后推荐', () => {
      const recs = recommender.recommend('transfer');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('files');
    });

    test('登录后推荐', () => {
      const recs = recommender.recommend('login');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('files');
    });

    test('删除后推荐', () => {
      const recs = recommender.recommend('delete');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('files');
    });
  });

  describe('快捷词推荐', () => {
    test('容量快捷词', () => {
      const recs = recommender.recommend('容量');
      expect(recs[0].action).toBe('clean');
    });

    test('空间快捷词', () => {
      const recs = recommender.recommend('空间');
      expect(recs[0].action).toBe('clean');
    });

    test('文件快捷词', () => {
      const recs = recommender.recommend('文件');
      expect(recs[0].action).toBe('search');
    });

    test('搜索快捷词', () => {
      const recs = recommender.recommend('搜索');
      expect(recs[0].action).toBe('select_all');
    });
  });

  describe('上下文调整', () => {
    test('有选中文件时推荐批量操作', () => {
      const context = {
        selectedCount: 5,
        usageRate: 50
      };
      
      const recs = recommender.recommend('files', context);
      
      // 获取所有推荐（不限制前 3 个）
      recommender.recommend('files', context);
      
      // 批量操作优先级应该提升
      const batchActions = ['download', 'transfer', 'delete', 'share'];
      const hasBatchAction = recs.some(r => batchActions.includes(r.action));
      
      // 至少有一个批量操作推荐
      expect(hasBatchAction).toBe(true);
    });

    test('空间使用率高时优先推荐清理', () => {
      const context = {
        selectedCount: 0,
        usageRate: 95
      };
      
      const recs = recommender.recommend('status', context);
      
      expect(recs[0].action).toBe('clean');
      expect(recs[0].reason).toContain('⚠️');
    });
  });

  describe('默认推荐', () => {
    test('未知动作返回默认推荐', () => {
      const recs = recommender.recommend('unknown_action');
      
      expect(recs.length).toBe(3);
      expect(recs[0].action).toBe('files');
      expect(recs[1].action).toBe('search');
      expect(recs[2].action).toBe('status');
    });

    test('空动作返回默认推荐', () => {
      const recs = recommender.recommend('');
      
      expect(recs.length).toBe(3);
    });

    test('null 动作返回默认推荐', () => {
      const recs = recommender.recommend(null);
      
      expect(recs.length).toBe(3);
    });
  });

  describe('场景推荐', () => {
    test('早晨场景', () => {
      const recs = recommender.getSceneRecommendations('morning');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('files');
    });

    test('夜晚场景', () => {
      const recs = recommender.getSceneRecommendations('night');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('clean');
    });

    test('空间已满场景', () => {
      const recs = recommender.getSceneRecommendations('full_storage');
      
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].action).toBe('clean');
      expect(recs[0].reason).toContain('⚠️');
    });

    test('未知场景返回默认', () => {
      const recs = recommender.getSceneRecommendations('unknown');
      
      expect(recs.length).toBeGreaterThan(0);
    });
  });

  describe('规则管理', () => {
    test('添加推荐规则', () => {
      recommender.addRule('test_action', {
        action: 'test',
        text: '测试',
        reason: '测试原因',
        priority: 1
      });
      
      const recs = recommender.recommend('test_action');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.find(r => r.action === 'test')).toBeDefined();
    });

    test('移除推荐规则', () => {
      recommender.addRule('test_action', {
        action: 'test',
        text: '测试',
        reason: '测试原因',
        priority: 1
      });
      
      recommender.removeRule('test_action', 'test');
      
      const recs = recommender.recommend('test_action');
      expect(recs.find(r => r.action === 'test')).toBeUndefined();
    });

    test('获取所有规则', () => {
      const rules = recommender.getRules();
      
      expect(typeof rules).toBe('object');
      expect(Object.keys(rules).length).toBeGreaterThan(5);
    });
  });

  describe('格式化', () => {
    test('格式化推荐列表', () => {
      const recs = [
        { action: 'files', text: '📁 查看文件', reason: '浏览文件', priority: 1 },
        { action: 'search', text: '🔍 搜索', reason: '查找文件', priority: 2 }
      ];
      
      const text = recommender.formatRecommendations(recs);
      
      expect(text).toContain('1. 📁 查看文件');
      expect(text).toContain('2. 🔍 搜索');
    });

    test('格式化空列表', () => {
      const text = recommender.formatRecommendations([]);
      expect(text).toBe('');
    });

    test('格式化 null', () => {
      const text = recommender.formatRecommendations(null);
      expect(text).toBe('');
    });
  });

  describe('卡片生成', () => {
    test('生成推荐卡片', () => {
      const recs = [
        { action: 'files', text: '📁 查看文件', reason: '浏览文件', priority: 1 },
        { action: 'search', text: '🔍 搜索', reason: '查找文件', priority: 2 }
      ];
      
      const card = recommender.createCard(recs);
      
      expect(card).toContain('💡 推荐操作');
      expect(card).toContain('📁 查看文件');
      expect(card).toContain('🔍 搜索');
    });

    test('生成空卡片', () => {
      const card = recommender.createCard([]);
      expect(card).toBe('💡 暂无推荐');
    });

    test('生成 null 卡片', () => {
      const card = recommender.createCard(null);
      expect(card).toBe('💡 暂无推荐');
    });
  });

  describe('优先级排序', () => {
    test('推荐按优先级排序', () => {
      const recs = recommender.recommend('status');
      
      expect(recs[0].priority).toBeLessThanOrEqual(recs[1].priority);
      expect(recs[1].priority).toBeLessThanOrEqual(recs[2].priority);
    });

    test('只返回前 3 个推荐', () => {
      const recs = recommender.recommend('files');
      expect(recs.length).toBeLessThanOrEqual(3);
    });
  });
});

// 集成测试场景
describe('ActionRecommender - 集成测试场景', () => {
  let recommender;

  beforeEach(() => {
    recommender = new ActionRecommender();
  });

  test('完整用户流程推荐', () => {
    // 用户登录
    let recs = recommender.recommend('login');
    expect(recs[0].action).toBe('files');

    // 查看文件
    recs = recommender.recommend('files');
    expect(recs[0].action).toBe('search');

    // 搜索文件
    recs = recommender.recommend('search');
    expect(recs[0].action).toBe('select_all');

    // 查看容量
    recs = recommender.recommend('status');
    expect(recs[0].action).toBe('clean');

    // 清理
    recs = recommender.recommend('clean');
    expect(recs[0].action).toBe('clean_confirm');
  });

  test('上下文感知推荐', () => {
    // 正常浏览
    let recs = recommender.recommend('files', { selectedCount: 0, usageRate: 50 });
    expect(recs[0].action).toBe('search');

    // 选中文件后
    recs = recommender.recommend('files', { selectedCount: 10, usageRate: 50 });
    const batchActions = ['download', 'transfer', 'delete', 'share'];
    const hasBatchAction = recs.some(r => batchActions.includes(r.action));
    expect(hasBatchAction).toBe(true);

    // 空间不足
    recs = recommender.recommend('status', { selectedCount: 0, usageRate: 95 });
    expect(recs[0].action).toBe('clean');
    expect(recs[0].reason).toContain('⚠️');
  });
});
