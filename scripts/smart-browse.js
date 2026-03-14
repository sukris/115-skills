#!/usr/bin/env node

/**
 * 115 网盘智能分类浏览
 * 按电影、电视剧、音乐、照片等智能分类，保持原文件夹结构
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 读取 Cookie
const cookiePath = path.join(process.env.HOME, '.openclaw/115-cookie.json');
const cookie = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));

// 创建客户端
const client = axios.create({
  baseURL: 'https://webapi.115.com',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 115Browser/23.9.3.2',
    'Cookie': `UID=${cookie.uid}; CID=${cookie.cid}; SEID=${cookie.seid}; KID=${cookie.kid}`
  }
});

// 文件类型定义
const CATEGORIES = {
  // 电影
  movie: {
    name: '🎬 电影',
    exts: ['.mp4', '.mkv', '.avi', '.rmvb', '.wmv', '.mov', '.flv'],
    keywords: ['电影', 'movie', 'film'],
    test: (name) => {
      // 电影通常没有"第 X 季"字样，且文件名较短
      return !name.includes('第') && !name.includes('季') && !name.includes('S0') && !name.includes('EP');
    }
  },
  // 电视剧
  tvshow: {
    name: '📺 电视剧',
    exts: ['.mp4', '.mkv', '.avi', '.rmvb', '.wmv', '.mov', '.flv'],
    keywords: ['剧', 'tv', 'series', 'episode', 's0', 'e0', 'ep'],
    test: (name) => {
      // 检测季数格式：S01E01, 第一季，第 1 集等
      return name.match(/s\d{1,2}e\d{1,2}/i) || 
             name.match(/第 [零一二三四五六七八九十\d]+[季集]/) ||
             name.match(/ep\d{1,2}/i);
    }
  },
  // 综艺
  variety: {
    name: '🎭 综艺',
    exts: ['.mp4', '.mkv', '.avi', '.rmvb', '.wmv', '.mov', '.flv'],
    keywords: ['综艺', 'variety', 'show', 'running', '极限', '快乐', '歌手']
  },
  // 动漫
  anime: {
    name: '🎌 动漫',
    exts: ['.mp4', '.mkv', '.avi', '.rmvb', '.wmv', '.mov', '.flv'],
    keywords: ['动漫', 'anime', '漫画', 'cartoon', '火影', '海贼', '柯南']
  },
  // 纪录片
  documentary: {
    name: '📚 纪录片',
    exts: ['.mp4', '.mkv', '.avi', '.rmvb', '.wmv', '.mov', '.flv'],
    keywords: ['纪录片', 'documentary', 'bbc', 'discovery', '国家地理']
  },
  // 音乐
  music: {
    name: '🎵 音乐',
    exts: ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.wma', '.ape', '.m4a'],
    keywords: ['mv', 'mtv', '演唱会', 'concert']
  },
  // 照片
  photo: {
    name: '📷 照片',
    exts: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.raw', '.tiff'],
    keywords: ['照片', 'photo', 'image', 'pic']
  },
  // 文档
  document: {
    name: '📄 文档',
    exts: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md', '.epub']
  },
  // 压缩包
  archive: {
    name: '📦 压缩包',
    exts: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
  },
  // 安装包
  app: {
    name: '💿 安装包',
    exts: ['.exe', '.dmg', '.apk', '.ipa', '.msi']
  },
  // 其他
  other: {
    name: '📝 其他',
    exts: []
  }
};

// 格式化大小
function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN');
}

// 智能分类文件
function classifyFile(fileName, fileSize) {
  const name = fileName.toLowerCase();
  const ext = '.' + name.split('.').pop();
  
  // 首先按扩展名分类
  for (const [cat, data] of Object.entries(CATEGORIES)) {
    if (cat === 'other') continue;
    if (data.exts.includes(ext)) {
      // 视频文件需要进一步判断
      if (['movie', 'tvshow', 'variety', 'anime', 'documentary'].includes(cat)) {
        // 检测电视剧
        if (CATEGORIES.tvshow.test(name)) {
          return 'tvshow';
        }
        // 检测综艺
        if (CATEGORIES.variety.keywords.some(k => name.includes(k))) {
          return 'variety';
        }
        // 检测动漫
        if (CATEGORIES.anime.keywords.some(k => name.includes(k))) {
          return 'anime';
        }
        // 检测纪录片
        if (CATEGORIES.documentary.keywords.some(k => name.includes(k))) {
          return 'documentary';
        }
        // 默认电影
        return 'movie';
      }
      return cat;
    }
  }
  
  // 按关键词分类
  for (const [cat, data] of Object.entries(CATEGORIES)) {
    if (cat === 'other') continue;
    if (data.keywords && data.keywords.some(k => name.includes(k))) {
      return cat;
    }
  }
  
  return 'other';
}

// 提取电视剧季数
function extractTVSeason(fileName) {
  const name = fileName.toLowerCase();
  
  // S01E01 格式
  const match1 = name.match(/s(\d{1,2})e\d{1,2}/i);
  if (match1) return '第' + parseInt(match1[1]) + '季';
  
  // 第一季格式
  const match2 = name.match(/第 ([零一二三四五六七八九十\d]+) 季/);
  if (match2) return match2[0];
  
  // 第 1 季格式
  const match3 = name.match(/第 (\d+) 季/);
  if (match3) return '第' + match3[1] + '季';
  
  return '未知季';
}

// 获取文件列表
async function getFiles(cid = 0, offset = 0, limit = 100) {
  const res = await client.get('/files', {
    params: { cid, offset, limit, show_dir: 1, format: 'json' }
  });
  return res.data;
}

// 主函数
async function smartBrowse() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🤖 115 网盘 智能分类浏览                           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  // 获取根目录文件
  const rootData = await getFiles(0, 0, 200);
  if (!rootData.state) {
    console.log('❌ 获取文件失败：' + (rootData.error || 'API 错误'));
    return;
  }
  
  const rootFiles = rootData.data || [];
  const dirs = rootFiles.filter(f => f.is_dir);
  const files = rootFiles.filter(f => !f.is_dir);
  
  // 分类统计
  const categories = {};
  for (const key of Object.keys(CATEGORIES)) {
    categories[key] = {
      ...CATEGORIES[key],
      files: [],
      dirs: [],
      size: 0
    };
  }
  
  // 分类文件
  files.forEach(file => {
    const cat = classifyFile(file.file_name || '', file.file_size || 0);
    categories[cat].files.push(file);
    categories[cat].size += (file.file_size || 0);
  });
  
  // 分类目录
  dirs.forEach(dir => {
    const cat = classifyFile(dir.file_name || '', 0);
    categories[cat].dirs.push(dir);
  });
  
  // 显示原始根目录
  console.log('📂 根目录结构 (保持原样)');
  console.log('─'.repeat(60));
  if (dirs.length > 0) {
    dirs.forEach(dir => {
      console.log('   📁 ' + dir.file_name);
    });
  } else {
    console.log('   (无文件夹)');
  }
  console.log('');
  
  // 显示智能分类
  console.log('═'.repeat(60));
  console.log('');
  console.log('🎯 智能分类视图 (不改变原结构)');
  console.log('─'.repeat(60));
  console.log('');
  
  // 影视类
  const videoCats = ['movie', 'tvshow', 'variety', 'anime', 'documentary'];
  let hasVideo = false;
  videoCats.forEach(catKey => {
    const cat = categories[catKey];
    if (cat.files.length === 0 && cat.dirs.length === 0) return;
    
    hasVideo = true;
    console.log(cat.name + ' (' + cat.files.length + ' 个文件，' + formatSize(cat.size) + ')');
    console.log('');
    
    // 电视剧按季分组
    if (catKey === 'tvshow') {
      const seasons = {};
      cat.files.forEach(file => {
        const season = extractTVSeason(file.file_name || '');
        if (!seasons[season]) seasons[season] = [];
        seasons[season].push(file);
      });
      
      Object.entries(seasons).forEach(([season, files]) => {
        console.log('   ┌─ ' + season + ' (' + files.length + ' 集)');
        files.slice(0, 5).forEach(f => {
          console.log('   │  ▶ ' + f.file_name + ' (' + formatSize(f.file_size) + ')');
        });
        if (files.length > 5) {
          console.log('   │  ... 还有 ' + (files.length - 5) + ' 集');
        }
        console.log('   └─');
      });
    } else {
      cat.files.slice(0, 5).forEach(f => {
        console.log('   ▶ ' + f.file_name + ' (' + formatSize(f.file_size) + ')');
      });
      if (cat.files.length > 5) {
        console.log('   ... 还有 ' + (cat.files.length - 5) + ' 个文件');
      }
    }
    console.log('');
  });
  
  if (!hasVideo) {
    console.log('   (无影视文件)');
    console.log('');
  }
  
  // 音乐
  if (categories.music.files.length > 0 || categories.music.dirs.length > 0) {
    console.log(categories.music.name + ' (' + categories.music.files.length + ' 个文件，' + formatSize(categories.music.size) + ')');
    console.log('');
    categories.music.files.slice(0, 5).forEach(f => {
      console.log('   🎵 ' + f.file_name + ' (' + formatSize(f.file_size) + ')');
    });
    console.log('');
  }
  
  // 照片
  if (categories.photo.files.length > 0 || categories.photo.dirs.length > 0) {
    console.log(categories.photo.name + ' (' + categories.photo.files.length + ' 个文件，' + formatSize(categories.photo.size) + ')');
    console.log('');
    categories.photo.files.slice(0, 5).forEach(f => {
      console.log('   🖼️ ' + f.file_name + ' (' + formatSize(f.file_size) + ')');
    });
    console.log('');
  }
  
  // 其他分类
  const otherCats = ['document', 'archive', 'app', 'other'];
  otherCats.forEach(catKey => {
    const cat = categories[catKey];
    if (cat.files.length === 0 && cat.dirs.length === 0) return;
    
    console.log(cat.name + ' (' + cat.files.length + ' 个文件，' + formatSize(cat.size) + ')');
    console.log('');
    cat.files.slice(0, 3).forEach(f => {
      console.log('   📄 ' + f.file_name + ' (' + formatSize(f.file_size) + ')');
    });
    console.log('');
  });
  
  // 快速命令
  console.log('═'.repeat(60));
  console.log('');
  console.log('⚡ 快速查看命令:');
  console.log('');
  console.log('   查看电影        - 只看电影');
  console.log('   查看电视剧      - 只看电视剧 (按季分组)');
  console.log('   查看综艺        - 只看综艺');
  console.log('   查看动漫        - 只看动漫');
  console.log('   查看音乐        - 只看音乐');
  console.log('   查看照片        - 只看照片');
  console.log('   搜索 xxx        - 搜索文件');
  console.log('   进入 [文件夹名]  - 进入指定文件夹');
  console.log('');
  console.log('💡 提示：所有分类都是虚拟视图，不会改变原文件结构');
  console.log('');
}

// 运行
smartBrowse().catch(console.error);
