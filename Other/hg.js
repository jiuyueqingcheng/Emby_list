/**
 * 黄果短剧 插件模块 (HGDJ-REX)
 * Version: 1.0.0
 */

const HUANGGUO_SITE = 'https://huangguoai.com';
const HUANGGUO_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const HUANGGUO_FALLBACK_COVER = HUANGGUO_SITE + '/static/images/cover-placeholder.png';
const MAX_EPISODES = 300;
const EP_FETCH_CONCURRENCY = 6;
const DETAIL_LINK_PREFIX = 'hg://detail/';
const STORAGE_KEY_WORKER = 'huangguo_cover_worker';
const HUANGGUO_COVER_WORKER_URL = ''; // 可填入代理 worker 地址

let ACTIVE_COVER_WORKER = normalizeWorker(HUANGGUO_COVER_WORKER_URL);

// 组件元数据定义
const WidgetMetadata = {
  id: 'huangguo_duanju',
  title: '黄果短剧',
  description: '黄果短剧/AI短剧/漫剧资源检索与播放',
  author: 'Rex',
  version: '1.0.0',
  requiredVersion: '1.0.0',
  detailCacheDuration: 60,
  site: HUANGGUO_SITE,
  icon: 'https://huangguoai.com/favicon.ico',
  globalParams: [
    {
      name: 'coverWorker',
      title: '封面代理Worker',
      type: 'string',
      value: '',
      description: '解决封面图片防盗链或防跨域的 Cloudflare Worker URL'
    }
  ],
  modules: [
    { id: 'recommend', title: '推荐', description: '推荐短剧列表', requiresWebView: true, functionName: 'loadRecommend', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'newest', title: '最新', description: '最新短剧列表', requiresWebView: true, functionName: 'loadNewest', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'aiDuanju', title: 'AI短剧', description: 'AI短剧分类', requiresWebView: true, functionName: 'loadAiDuanju', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'aiManju', title: 'AI漫剧', description: 'AI漫剧分类', requiresWebView: true, functionName: 'loadAiManju', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'aiHuanlian', title: 'AI换脸', description: 'AI换脸分类', requiresWebView: true, functionName: 'loadAiHuanlian', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'aiMogai', title: 'AI魔改', description: 'AI魔改分类', requiresWebView: true, functionName: 'loadAiMogai', cacheDuration: 0, params: [{ name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'topics', title: '专题', description: '按专题浏览', requiresWebView: true, functionName: 'loadTopics', cacheDuration: 0, params: [{ name: 'topic', title: '专题', type: 'enum', description: '选择专题', value: 'nanpin', enumOptions: [{ title: '男频', value: 'nanpin' }, { title: '女频', value: 'nvpin' }, { title: '都市', value: 'dushi' }, { title: '古装', value: 'guzhuang' }, { title: '悬疑', value: 'xuanyi' }, { title: '科幻', value: 'kehuan' }] }, { name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] },
    { id: 'ranking', title: '榜单', description: '热门短剧榜单', requiresWebView: true, functionName: 'loadRanking', cacheDuration: 0, params: [{ name: 'rankType', title: '榜单', type: 'enum', description: '选择榜单类型', value: 'hot', enumOptions: [{ title: '飙升榜', value: 'hot' }, { title: '热播榜', value: 'recommend' }, { title: '潜力榜', value: 'potential' }] }, { name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }] }
  ],
  search: {
    title: '搜索',
    functionName: 'searchVideos',
    params: [
      { name: 'keyword', title: '关键词', type: 'string', description: '输入搜索关键词', value: '' },
      { name: 'page', title: '页码', type: 'page', description: '页码', value: '1' }
    ]
  }
};

// 辅助工具函数
function normalizeWorker(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function requestHeaders(referer) {
  return {
    'User-Agent': HUANGGUO_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': referer || (HUANGGUO_SITE + '/')
  };
}

async function fetchPage(targetUrl, refererUrl) {
  const url = String(targetUrl || '').replace(/^https?:\/\/[^/]+/i, HUANGGUO_SITE);
  try {
    const response = await Widget.http.get(url, {
      headers: requestHeaders(refererUrl || (HUANGGUO_SITE + '/')),
      timeout: 30000
    });
    if (response && response.data !== null && response.data !== undefined) {
      return typeof response.data === 'string' ? response.data : String(response.data);
    }
  } catch (err) {
    console.error('Fetch Page Error:', url, err?.message || err);
  }
  return '';
}

// 核心功能 API 实现
async function loadRecommend(params = {}) {
  applySettings(params);
  return await loadList(HUANGGUO_SITE + '/recommend/', params);
}

async function loadRanking(params = {}) {
  applySettings(params);
  const rankType = String(params?.rankType || 'hot');
  const targetUrl = HUANGGUO_RANKING_URLS[rankType] || HUANGGUO_RANKING_URLS['hot'];
  const html = await fetchPage(withPage(targetUrl, pageNumber(params)), HUANGGUO_SITE + '/');
  if (!html) return [];
  return parseRankingCards(html, targetUrl);
}

async function searchVideos(params = {}) {
  applySettings(params);
  const keyword = String(params?.keyword || '').trim();
  if (!keyword) return [];
  const page = pageNumber(params);
  const searchUrl = HUANGGUO_SITE + '/search?q=' + encodeURIComponent(keyword);
  return await loadList(searchUrl, { page: page, referer: HUANGGUO_SITE + '/' });
}

async function loadDetail(detailLink) {
  const parsed = parseDetailLink(detailLink);
  if (!parsed) return null;
  const dramaId = parsed.id;
  const detailUrl = detailPageUrl(dramaId);
  const html = await fetchPage(detailUrl, HUANGGUO_SITE + '/');
  
  if (!html) return null;

  const metadata = parseDetailMeta(html, detailUrl);
  const episodes = discoverEpisodes(html, dramaId);
  
  // 并行解析剧集播放地址
  const playInfos = await mapLimit(episodes, EP_FETCH_CONCURRENCY, ep => resolveEpisodePlay(dramaId, ep));
  const episodeItems = buildEpisodeItems(dramaId, episodes, playInfos, metadata.poster);

  return {
    id: detailLink,
    type: 'video',
    link: detailLink,
    mediaType: 'tv',
    title: metadata.title,
    description: metadata.description,
    posterPath: metadata.poster,
    backdropPath: metadata.poster,
    coverUrl: metadata.poster,
    episodeItems: episodeItems,
    relatedItems: parseRecommendations(html, detailUrl)
  };
}

async function loadResource(params = {}) {
  applySettings(params);
  const detail = parseDetailLink(params.link);
  if (!detail) {
    const playUrl = String(params.videoUrl || '');
    if (!isPlayableUrl(playUrl)) return [];
    return [{
      name: params.title || '播放资源',
      description: '直链播放',
      url: playUrl,
      playerType: 'system',
      customHeaders: requestHeaders(HUANGGUO_SITE + '/')
    }];
  }

  const epNumber = parseInt(params.episodeNumber, 10) || 1;
  const playInfo = await resolveEpisodePlay(detail.id, epNumber);
  if (!playInfo.videoUrl) return [];

  return [{
    name: `第 ${epNumber} 集`,
    description: 'HLS/MP4 视频流',
    url: playInfo.videoUrl,
    playerType: 'system',
    customHeaders: requestHeaders(playInfo.pageUrl)
  }];
}
