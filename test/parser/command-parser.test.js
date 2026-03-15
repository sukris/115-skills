/**
 * CommandParser 测试
 */

const CommandParser = require('../../lib/parser/command-parser');

describe('CommandParser', () => {
  let parser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  describe('基础解析', () => {
    test('空输入', () => {
      const result = parser.parse('');
      expect(result.command).toBe('unknown');
    });

    test('null 输入', () => {
      const result = parser.parse(null);
      expect(result.command).toBe('unknown');
    });
  });

  describe('数字选择', () => {
    test('数字 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const result = parser.parse(i.toString());
        expect(result.command).toBe('select');
        expect(result.params.index).toBe(i);
      }
    });

    test('数字 0 不是选择', () => {
      const result = parser.parse('0');
      expect(result.command).not.toBe('select');
    });

    test('多位数字不是选择', () => {
      const result = parser.parse('10');
      expect(result.command).not.toBe('select');
    });
  });

  describe('斜杠命令', () => {
    test('/115 搜索 工作报告', () => {
      const result = parser.parse('/115 搜索 工作报告');
      expect(result.command).toBe('search');
      expect(result.params.args).toEqual(['工作报告']);
    });

    test('/115-skills 容量', () => {
      const result = parser.parse('/115-skills 容量');
      expect(result.command).toBe('status');
    });

    test('/115 文件', () => {
      const result = parser.parse('/115 文件');
      expect(result.command).toBe('files');
    });

    test('/115 转存 115.com/s/abc123', () => {
      const result = parser.parse('/115 转存 115.com/s/abc123');
      expect(result.command).toBe('transfer');
    });
  });

  describe('快捷词', () => {
    test('容量', () => {
      expect(parser.parse('容量').command).toBe('status');
      expect(parser.parse('空间').command).toBe('status');
      expect(parser.parse('剩余空间').command).toBe('status');
    });

    test('文件浏览', () => {
      expect(parser.parse('文件').command).toBe('files');
      expect(parser.parse('文件列表').command).toBe('files');
      expect(parser.parse('查看文件').command).toBe('files');
    });

    test('搜索', () => {
      expect(parser.parse('搜索').command).toBe('search');
      expect(parser.parse('查找').command).toBe('search');
      expect(parser.parse('找').command).toBe('search');
    });

    test('搜索带参数', () => {
      const result = parser.parse('搜索 工作报告');
      expect(result.command).toBe('search');
      expect(result.params.keyword).toBe('工作报告');
    });

    test('登录', () => {
      expect(parser.parse('登录').command).toBe('login');
      expect(parser.parse('扫码登录').command).toBe('login');
    });

    test('下载', () => {
      expect(parser.parse('下载').command).toBe('download');
      expect(parser.parse('离线下载').command).toBe('download');
      expect(parser.parse('下载任务').command).toBe('download');
    });

    test('分享', () => {
      expect(parser.parse('分享').command).toBe('share');
      expect(parser.parse('我的分享').command).toBe('shareList');
    });

    test('整理', () => {
      expect(parser.parse('整理').command).toBe('organize');
      expect(parser.parse('分类整理').command).toBe('organize');
    });

    test('清理', () => {
      expect(parser.parse('清理').command).toBe('clean');
      expect(parser.parse('清理建议').command).toBe('clean');
    });

    test('返回', () => {
      expect(parser.parse('返回').command).toBe('back');
      expect(parser.parse('上级').command).toBe('back');
    });

    test('打开', () => {
      const result = parser.parse('打开 工作文档');
      expect(result.command).toBe('open');
      expect(result.params.name).toBe('工作文档');
    });
  });

  describe('分享链接', () => {
    test('115 分享链接', () => {
      const result = parser.parse('https://115.com/s/abc123');
      expect(result.command).toBe('transfer');
      expect(result.params.shareCode).toBe('abc123');
      expect(result.params.type).toBe('share');
    });

    test('带密码的分享链接', () => {
      const result = parser.parse('https://115.com/s/abc123 密码：xyzw');
      expect(result.command).toBe('transfer');
      expect(result.params.shareCode).toBe('abc123');
      expect(result.params.password).toBe('xyzw');
    });

    test('带冒号的密码', () => {
      const result = parser.parse('115.com/s/abc123 密码：1234');
      expect(result.params.password).toBe('1234');
    });
  });

  describe('下载链接', () => {
    test('磁力链接', () => {
      const magnet = 'magnet:?xt=urn:btih:abc123...';
      const result = parser.parse(magnet);
      expect(result.command).toBe('download');
      expect(result.params.type).toBe('magnet');
      expect(result.params.url).toBe(magnet);
    });

    test('HTTP 链接', () => {
      const url = 'https://example.com/file.zip';
      const result = parser.parse(url);
      expect(result.command).toBe('download');
      expect(result.params.type).toBe('http');
      expect(result.params.url).toBe(url);
    });

    test('HTTPS 链接', () => {
      const url = 'https://example.com/file.zip';
      const result = parser.parse(url);
      expect(result.command).toBe('download');
    });
  });

  describe('别名', () => {
    test('ls', () => {
      expect(parser.parse('/115 ls').command).toBe('files');
    });

    test('cd', () => {
      expect(parser.parse('/115 cd 工作文档').command).toBe('open');
    });

    test('rm', () => {
      expect(parser.parse('/115 rm').command).toBe('delete');
    });

    test('mv', () => {
      expect(parser.parse('/115 mv').command).toBe('move');
    });

    test('cp', () => {
      expect(parser.parse('/115 cp').command).toBe('copy');
    });

    test('mkdir', () => {
      expect(parser.parse('/115 mkdir').command).toBe('create_folder');
    });
  });

  describe('注册功能', () => {
    test('注册快捷词', () => {
      parser.registerShortcut('测试命令', 'test_cmd');
      const result = parser.parse('测试命令');
      expect(result.command).toBe('test_cmd');
    });

    test('注册别名', () => {
      parser.registerAlias('tt', 'test_cmd');
      const result = parser.parse('/115 tt');
      expect(result.command).toBe('test_cmd');
    });
  });

  describe('命令验证', () => {
    test('有效命令', () => {
      expect(parser.isValidCommand('login')).toBe(true);
      expect(parser.isValidCommand('files')).toBe(true);
      expect(parser.isValidCommand('search')).toBe(true);
    });

    test('无效命令', () => {
      expect(parser.isValidCommand('invalid_cmd')).toBe(false);
      expect(parser.isValidCommand('xxx')).toBe(false);
    });
  });

  describe('帮助信息', () => {
    test('获取帮助', () => {
      const help = parser.getHelp('login');
      expect(help).toContain('登录');
    });

    test('未知命令帮助', () => {
      const help = parser.getHelp('unknown_cmd');
      expect(help).toBe('未知命令');
    });
  });

  describe('可用命令列表', () => {
    test('获取可用命令', () => {
      const commands = parser.getAvailableCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(10);
      expect(commands).toContain('login');
      expect(commands).toContain('files');
      expect(commands).toContain('search');
    });
  });

  describe('原始输入保留', () => {
    test('保留原始输入', () => {
      const input = '/115 搜索 工作报告 2026';
      const result = parser.parse(input);
      expect(result.originalInput).toBe(input);
    });

    test('包含时间戳', () => {
      const result = parser.parse('容量');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('number');
    });
  });
});

// 集成测试场景
describe('CommandParser - 集成测试场景', () => {
  let parser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  test('完整对话流程', () => {
    // 用户：登录
    expect(parser.parse('登录').command).toBe('login');

    // 用户：查看文件
    expect(parser.parse('查看文件').command).toBe('files');

    // 用户：搜索 工作报告
    const search = parser.parse('搜索 工作报告');
    expect(search.command).toBe('search');
    expect(search.params.keyword).toBe('工作报告');

    // 用户：/115 转存 115.com/s/abc123
    const transfer = parser.parse('/115 转存 115.com/s/abc123');
    expect(transfer.command).toBe('transfer');
    expect(transfer.params.args).toEqual(['115.com/s/abc123']);

    // 用户：1（数字选择）
    const select = parser.parse('1');
    expect(select.command).toBe('select');
    expect(select.params.index).toBe(1);

    // 用户：容量
    expect(parser.parse('容量').command).toBe('status');

    // 用户：清理建议
    expect(parser.parse('清理建议').command).toBe('clean');
  });

  test('复杂场景', () => {
    // 磁力链接下载
    const magnet = 'magnet:?xt=urn:btih:abc123&dn=movie.mkv';
    const result = parser.parse(magnet);
    expect(result.command).toBe('download');
    expect(result.params.type).toBe('magnet');

    // 带密码分享
    const share = parser.parse('https://115.com/s/xyz789 密码：abcd');
    expect(share.command).toBe('transfer');
    expect(share.params.shareCode).toBe('xyz789');
    expect(share.params.password).toBe('abcd');
  });
});
