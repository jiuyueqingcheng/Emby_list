// 部署黄果封面解密 Worker 后填入，例如 https://your-worker.workers.dev/
const HUANGGUO_COVER_WORKER_URL = "https://black-meadow-162e.tonghua.workers.dev/";
const HUANGGUO_SITE = "https://huangguoai.com";
const HUANGGUO_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const HUANGGUO_FALLBACK_COVER = HUANGGUO_SITE + "/favicon.ico";
const MAX_EPISODES = 300;
const HUANGGUO_SORT_PARAM = {
  name: "channel",
  title: "排序",
  type: "enumeration",
  description: "选择内容排序",
  value: "latest",
  enumOptions: [
    { title: "最新更新", value: "latest" },
    { title: "当前热播", value: "hot" },
    { title: "独家原创", value: "original" },
    { title: "随机推荐", value: "random" }
  ]
};

const SECTION_URLS = {
  recommend: HUANGGUO_SITE + "/recommend",
  newest: HUANGGUO_SITE + "/newest",
  aiDuanju: HUANGGUO_SITE + "/ai-duanju/",
  aiManju: HUANGGUO_SITE + "/ai-manju/",
  aiHuanlian: HUANGGUO_SITE + "/ai-huanlian/",
  aiMogai: HUANGGUO_SITE + "/ai-mogai/"
};

const HUANGGUO_RANKING_URLS = {
  hot: HUANGGUO_SITE + "/ranks/hot/",
  recommend: HUANGGUO_SITE + "/ranks/recommend/",
  potential: HUANGGUO_SITE + "/ranks/potential/"
};

var WidgetMetadata = {
  id: "huangguo_ai",
  title: "黄果短剧",
  description: "获取黄果 AI 短剧、漫剧和影视内容",
  author: "...",
  version: "1.4.1",
  requiredVersion: "0.0.7",
  detailCacheDuration: 300,
  site: HUANGGUO_SITE,
  icon: HUANGGUO_FALLBACK_COVER,
  modules: [
    {
      title: "热门视频推荐",
      description: "精选站内热门视频内容，结合播放热度、用户评分与内容类型持续更新推荐结果，涵盖不同题材与热门作品，帮助你快速发现更多值得观看的精彩视频。",
      requiresWebView: true,
      functionName: "loadRecommend",
      cacheDuration: 900,
      params: [{ name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "最近上新视频",
      description: "汇集近期最新发布的短剧、漫剧、AI换脸、AI魔改等内容，持续更新不同题材与类型的新作品，方便快速发现站内最近上线和最新更新的精彩内容。",
      requiresWebView: true,
      functionName: "loadNewest",
      cacheDuration: 900,
      params: [{ name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "AI成人短剧",
      description: "黄果短剧 AI成人短剧频道汇集最新 AI 生成成人短剧，涵盖都市情欲、修仙系统、家庭禁忌、办公室潜规则、性转、后宫等热门题材。所有作品支持免费高清在线观看，每日持续更新最新上架与独家原创内容，提供最新更新、当前热播、独家原创、随机推荐等筛选方式，方便用户快速找到剧情紧凑、画面真实的 AI 色情短剧与擦边短剧。",
      requiresWebView: true,
      functionName: "loadAiDuanju",
      cacheDuration: 1800,
      params: [HUANGGUO_SORT_PARAM, { name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "AI成人漫剧",
      description: "黄果短剧 AI成人漫剧频道专注二次元与动漫风格的 AI 生成成人短剧，画风精美、角色诱人，涵盖纯欲、调教、斗破苍穹系列魔改、国漫情欲、修仙双修等题材。内容每日更新，支持免费高清流畅播放，提供最新更新、当前热播、独家原创与随机推荐入口，适合喜欢二次元画风的用户观看 AI 色情漫剧与擦边漫剧。",
      requiresWebView: true,
      functionName: "loadAiManju",
      cacheDuration: 1800,
      params: [HUANGGUO_SORT_PARAM, { name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "AI换脸",
      description: "黄果短剧 AI换脸频道精选最新 AI 换脸成人视频，利用人工智能技术将明星、网红或角色面部自然替换到高清视频中，呈现迪丽热巴、杨幂、景甜、李一桐、赵今麦等热门人物向作品。内容涵盖明星换脸、网红换脸、角色替换与成人向合成视频，全部支持免费高清在线观看，每日更新最新作品，可通过最新更新、当前热播、独家原创等入口快速浏览。",
      requiresWebView: true,
      functionName: "loadAiHuanlian",
      cacheDuration: 1800,
      params: [HUANGGUO_SORT_PARAM, { name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "AI魔改",
      description: "黄果短剧 AI魔改频道提供最新 AI 魔改成人视频，对影视、电视剧、动漫、经典 IP 进行剧情改编、角色替换、画面重制与风格转换，打造全新成人向演绎。常见类型包括影视魔改、电视剧魔改、角色魔改与真人化二次创作，涵盖《花千骨》《黑暗荣耀》《狐妖小红娘》《快乐星球》等热门题材。所有内容免费高清在线观看，每日持续更新，支持最新更新与热播筛选。",
      requiresWebView: true,
      functionName: "loadAiMogai",
      cacheDuration: 1800,
      params: [HUANGGUO_SORT_PARAM, { name: "page", title: "页码", type: "page", description: "页码", value: "1" }]
    },
    {
      title: "专题",
      description: "专题集中展示黄果短剧各类精品专题合集，涵盖AI成人短剧、AI色情短剧、擦边短剧、AI换脸、AI魔改等热门主题。内容丰富多样，每日持续更新，方便你按主题快速找到想看的高清短剧，随时畅享极致观看体验。",
      requiresWebView: true,
      functionName: "loadTopics",
      cacheDuration: 1800,
      params: [
        {
          name: "topic",
          title: "专题",
          type: "enumeration",
          description: "选择 AI 短剧专题",
          value: "hot-aiduanju",
          enumOptions: [
            { title: "精品高分AI成人短剧专辑", value: "hot-aiduanju" },
            { title: "家庭禁忌伦理AI成人短剧专辑", value: "luanlun-aiduanju" },
            { title: "灵异诡事AI成人短剧专辑", value: "paranormal-aiduanju" },
            { title: "欧美精选AI成人短剧专辑", value: "oumei-duanju" },
            { title: "精选AI魔改电视剧专辑", value: "magic-drama" },
            { title: "热门明星AI换脸专辑", value: "mingxing-huanlian" }
          ]
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
      ]
    },
    {
      title: "排行榜",
      description: "热播榜/推荐榜/潜力榜",
      requiresWebView: true,
      functionName: "loadRanking",
      cacheDuration: 900,
      params: [
        {
          name: "ranking",
          title: "榜单",
          type: "enumeration",
          description: "选择榜单",
          value: "hot",
          enumOptions: [
            { title: "热播榜", value: "hot" },
            { title: "推荐榜", value: "recommend" },
            { title: "潜力榜", value: "potential" }
          ]
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
      ]
    }
  ],
  search: {
    title: "搜索",
    functionName: "searchVideos",
    params: [
      { name: "keyword", title: "搜索关键词", type: "input", description: "输入剧名或关键词", value: "" },
      { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
    ]
  }
};

function pageNumber(params) {
  const page = parseInt(params && params.page, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function absoluteUrl(value, baseUrl) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/\//.test(url)) return "https:" + url;
  try {
    return new URL(url, baseUrl || HUANGGUO_SITE + "/").toString();
  } catch (error) {
    return url;
  }
}

function coverUrl(value) {
  const source = String(value || "").trim();
  if (!source || !HUANGGUO_COVER_WORKER_URL || /^data:|^blob:/i.test(source) || source.indexOf(HUANGGUO_COVER_WORKER_URL) === 0) return source;
  return HUANGGUO_COVER_WORKER_URL + (HUANGGUO_COVER_WORKER_URL.indexOf("?") >= 0 ? "&" : "?") + "url=" + encodeURIComponent(source);
}

function hasUsableCover(value) {
  const cover = String(value || "").trim();
  return !!cover && cover !== HUANGGUO_FALLBACK_COVER &&
    !/^blob:|^data:/i.test(cover) &&
    !/cover-placeholder|avatar-default/i.test(cover);
}

function addCoverMarker(url, cover) {
  const source = String(url || "");
  const image = String(cover || "");
  if (!source || !image) return source;
  return source + (source.indexOf("?") >= 0 ? "&" : "?") + "hg_cover=" + encodeURIComponent(image);
}

function readCoverMarker(url) {
  const source = String(url || "");
  const marker = source.match(/[?&]hg_cover=([^&#]*)/i);
  if (marker) {
    let cover = marker[1] || "";
    try {
      cover = decodeURIComponent(cover);
    } catch (error) {
      // Keep the raw value when the host has partially decoded the URL.
    }
    return {
      url: source.replace(marker[0], "").replace(/[?&]$/, ""),
      cover: cover
    };
  }
  try {
    const parsed = new URL(source, HUANGGUO_SITE + "/");
    const cover = parsed.searchParams.get("hg_cover") || "";
    parsed.searchParams.delete("hg_cover");
    return { url: parsed.toString(), cover: cover };
  } catch (error) {
    return { url: source, cover: "" };
  }
}

function requestHeaders(referer) {
  return {
    "User-Agent": HUANGGUO_UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
    "Referer": referer || HUANGGUO_SITE + "/"
  };
}

async function fetchPage(url, params) {
  const headers = requestHeaders((params && params.referer) || HUANGGUO_SITE + "/");
  const requestUrl = String(url || "").replace(/^https?:\/\/[^/]+/i, HUANGGUO_SITE);

  if (typeof fetch === "function") {
    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: headers,
        cache: "no-store"
      });
      if (response && response.ok) {
        return { ok: true, data: await response.text() };
      }
    } catch (error) {
      console.warn("黄果 fetch 请求失败", requestUrl, error && error.message ? error.message : error);
    }
  }

  try {
    const response = await Widget.http.get(requestUrl, {
      headers: headers,
      timeout: 30000
    });
    if (response && response.ok && response.data !== null && response.data !== undefined) {
      return { ok: true, data: typeof response.data === "string" ? response.data : String(response.data) };
    }
  } catch (error) {
    console.warn("黄果 Widget.http 请求失败", requestUrl, error && error.message ? error.message : error);
  }

  return { ok: false, data: "" };
}

function sortChannel(params) {
  const value = String(params && params.channel || "latest");
  return ["latest", "hot", "original", "random"].indexOf(value) >= 0 ? value : "latest";
}

function withPage(url, page, channel) {
  const separator = url.indexOf("?") >= 0 ? "&" : "?";
  const pagePart = page && page > 1 ? "page=" + page : "page=1";
  const widgetPath = url.replace(/^https?:\/\/[^/]+/i, "") + (channel ? "?sort=" + channel : "");
  return url + separator + pagePart + "&_hg_widget=" + encodeURIComponent(widgetPath);
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s*[-|_]\s*(黄果短剧|黄果AI|黄果影视).*$/i, "")
    .trim();
}

function parseCards(html, pageUrl, channel) {
  const source = extractVisibleCardRegion(String(html || ""), channel);
  const items = [];
  const seen = {};
  const cardRe = /<div\b[^>]*class=["'][^"']*\bhg-drama-card\b[^"']*["'][^>]*>/gi;
  const starts = [];
  let match;
  while ((match = cardRe.exec(source))) starts.push(match.index);

  const attr = (text, name) => {
    const re = new RegExp("\\b" + name + "\\s*=\\s*[\\\"']([^\\\"']*)", "i");
    const hit = String(text || "").match(re);
    return hit ? decodeBasicEntities(hit[1]) : "";
  };
  const fragment = (block, selector) => {
    const re = new RegExp("<[^>]*class=[\\\"'][^\\\"']*" + selector + "[^\\\"']*[\\\"'][^>]*>([\\s\\S]*?)<\\/", "i");
    const hit = String(block || "").match(re);
    return hit ? stripBasicTags(hit[1]) : "";
  };
  const image = block => {
    const hit = String(block || "").match(/<img\b[^>]*>/i);
    if (!hit) return HUANGGUO_FALLBACK_COVER;
    const value = attr(hit[0], "data-src") || attr(hit[0], "data-lazy-src") || attr(hit[0], "src");
    return value && !/^blob:|^data:/i.test(value) ? coverUrl(absoluteUrl(value, pageUrl)) : HUANGGUO_FALLBACK_COVER;
  };

  for (let index = 0; index < starts.length; index++) {
    const block = source.slice(starts[index], starts[index + 1] || source.length);
    const hrefMatch = block.match(/href=["'](?:https?:\/\/huangguoai\.com)?\/detail\/(\d+)\/?["']/i);
    if (!hrefMatch) continue;
    const id = hrefMatch[1];
    const href = HUANGGUO_SITE + "/detail/" + id + "/";
    if (seen[href]) continue;
    const imageTag = block.match(/<img\b[^>]*>/i);
    const title = cleanTitle(attr(block, "data-track-title") || fragment(block, "hg-drama-card__title") || attr(imageTag ? imageTag[0] : "", "alt"));
    if (!title) continue;
    const scoreText = fragment(block, "hg-drama-card__score");
    const episodeText = fragment(block, "hg-drama-card__episode");
    const description = fragment(block, "hg-drama-card__desc");
    const tags = [];
    const tagRe = /<a\b[^>]*class=["'][^"']*hg-tag[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    let tagMatch;
    while ((tagMatch = tagRe.exec(block))) tags.push(stripBasicTags(tagMatch[1]));
    const posterPath = image(block);
    const markedHref = addCoverMarker(href, posterPath);
    seen[href] = true;
    items.push({
      id: href,
      type: "link",
      title: title,
      description: description || (episodeText ? "集数: " + episodeText : ""),
      posterPath: posterPath,
      backdropPath: posterPath,
      posterUrl: posterPath,
      backdropUrl: posterPath,
      fallbackCoverPath: HUANGGUO_FALLBACK_COVER,
      mediaType: "tv",
      duration: 0,
      durationText: episodeText,
      rating: scoreText ? parseFloat(scoreText.replace(/[^0-9.]/g, "")) || undefined : undefined,
      tags: tags,
      previewUrl: "",
      videoUrl: "",
      url: "",
      playUrl: "",
      link: markedHref,
      detailUrl: markedHref,
      playerType: "none"
    });
  }

  return items;
}

function extractVisibleCardRegion(html, channel) {
  let source = String(html || "");
  const selectedChannel = ["latest", "hot", "original", "random"].indexOf(String(channel || "latest")) >= 0 ? String(channel || "latest") : "latest";
  if (selectedChannel === "latest") source = source.replace(/<template\b[\s\S]*?<\/template>/gi, "");

  const aliases = {
    latest: ["latest", "newest", "recent"],
    hot: ["hot", "popular", "trending", "top"],
    original: ["original", "exclusive"],
    random: ["random", "recommend", "recommended"]
  }[selectedChannel];
  const grids = [];
  const gridRe = /<div\b[^>]*class=["'][^"']*\bhg-card-grid\b[^"']*["'][^>]*>/gi;
  let gridMatch;
  while ((gridMatch = gridRe.exec(source))) grids.push({ index: gridMatch.index, tag: gridMatch[0] });
  let activeGrid = null;
  for (const grid of grids) {
    const tag = grid.tag.toLowerCase();
    if (selectedChannel === "latest" && /\bis-active\b/i.test(tag)) {
      activeGrid = grid;
      break;
    }
    if (aliases.some(alias => new RegExp("(?:data-channel-panel|data-channel|data-sort|data-tab|id)=[\\\"'][^\\\"']*" + alias + "[^\\\"']*[\\\"']", "i").test(tag))) {
      activeGrid = grid;
      break;
    }
  }
  if (!activeGrid && selectedChannel !== "latest") {
    const fallbackIndex = { hot: 1, original: 2, random: 3 }[selectedChannel];
    if (fallbackIndex !== undefined && grids[fallbackIndex]) activeGrid = grids[fallbackIndex];
  }
  if (activeGrid) {
    const start = activeGrid.index;
    const tail = source.slice(start);
    const endMatch = tail.match(/<div\b[^>]*class=["'][^"']*\bhg-channel-pager\b[^"']*["'][^>]*>/i);
    return endMatch ? tail.slice(0, endMatch.index) : tail;
  }

  const firstGrid = source.match(/<div\b[^>]*class=["'][^"']*\bhg-card-grid\b[^"']*["'][^>]*>/i);
  if (firstGrid) {
    const start = firstGrid.index;
    const tail = source.slice(start);
    const nextGrid = tail.slice(1).search(/<div\b[^>]*class=["'][^"']*\bhg-card-grid\b/i);
    return nextGrid >= 0 ? tail.slice(0, nextGrid + 1) : tail;
  }

  return source;
}

function stripBasicTags(value) {
  return decodeBasicEntities(String(value || "").replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeBasicEntities(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

async function loadList(url, params, enableChannel) {
  try {
    const channel = enableChannel ? sortChannel(params) : "";
    const response = await fetchPage(withPage(url, pageNumber(params), channel), params);
    if (!response || !response.ok) return [];
    return parseCards(response && response.data, url, channel);
  } catch (error) {
    return [];
  }
}

async function loadRecommend(params = {}) {
  return await loadList(SECTION_URLS.recommend, params);
}

async function loadNewest(params = {}) {
  return await loadList(SECTION_URLS.newest, params);
}

async function loadAiDuanju(params = {}) {
  return await loadList(SECTION_URLS.aiDuanju, params, true);
}

async function loadAiManju(params = {}) {
  return await loadList(SECTION_URLS.aiManju, params, true);
}

async function loadAiHuanlian(params = {}) {
  return await loadList(SECTION_URLS.aiHuanlian, params, true);
}

async function loadAiMogai(params = {}) {
  return await loadList(SECTION_URLS.aiMogai, params, true);
}

async function loadTopics(params = {}) {
  const key = String(params.topic || "hot-aiduanju");
  const topicValues = [
    "hot-aiduanju",
    "luanlun-aiduanju",
    "paranormal-aiduanju",
    "oumei-duanju",
    "magic-drama",
    "mingxing-huanlian"
  ];
  const topic = topicValues.indexOf(key) >= 0 ? key : "hot-aiduanju";
  return await loadList(HUANGGUO_SITE + "/topics/" + topic + "/", params);
}

async function loadRanking(params = {}) {
  const key = String(params.ranking || "hot");
  const url = HUANGGUO_RANKING_URLS[key] || HUANGGUO_RANKING_URLS.hot;
  try {
    const response = await fetchPage(withPage(url, pageNumber(params)), params);
    if (!response || !response.ok) return [];
    return parseRankingCards(response.data, url);
  } catch (error) {
    console.warn("黄果排行榜解析失败", key, error && error.message ? error.message : error);
    return [];
  }
}

function parseRankingCards(html, pageUrl) {
  const source = String(html || "");
  const matches = [];
  const itemRe = /<div\b[^>]*class=["'][^"']*\bhg-rank-item\b[^"']*["'][^>]*\bdata-rank-item\b[^>]*>/gi;
  let match;
  while ((match = itemRe.exec(source))) matches.push({ index: match.index, tag: match[0] });

  const items = [];
  const seen = {};
  for (let index = 0; index < matches.length; index++) {
    const start = matches[index].index;
    const end = matches[index + 1] ? matches[index + 1].index : source.length;
    const block = source.slice(start, end);
    const id = rankAttribute(matches[index].tag, "data-track-id");
    const title = cleanTitle(rankAttribute(matches[index].tag, "data-track-title"));
    if (!id || !title || seen[id]) continue;
    seen[id] = true;
    const synopsis = rankText(block, "hg-rank-item__desc");
    const ratingMatch = block.match(/(?:^|[^\d])([0-9]+(?:\.[0-9]+)?)\s*分(?:[^\d]|$)/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
    const tags = rankTags(block);
    const detailUrl = HUANGGUO_SITE + "/detail/" + id + "/";
    const poster = rankImage(block, pageUrl);
    const markedUrl = poster ? addCoverMarker(detailUrl, poster) : detailUrl;
    const displayPoster = poster || HUANGGUO_FALLBACK_COVER;
    const description = synopsis;
    items.push({
      id: detailUrl,
      type: "link",
      mediaType: "tv",
      title: title,
      description: description,
      rating: rating,
      tags: tags,
      link: markedUrl,
      detailUrl: markedUrl,
      posterPath: displayPoster,
      backdropPath: displayPoster,
      posterUrl: displayPoster,
      backdropUrl: displayPoster,
      playerType: "none"
    });
  }
  return items;
}

function rankAttribute(tag, name) {
  const match = String(tag || "").match(new RegExp("\\b" + name + "=[\\\"']([^\\\"']*)", "i"));
  return match ? decodeBasicEntities(match[1]) : "";
}

function rankText(block, className) {
  const match = String(block || "").match(new RegExp("<[^>]*class=[\\\"'][^\\\"']*" + className + "[^\\\"']*[\\\"'][^>]*>([\\s\\S]*?)</", "i"));
  return match ? stripBasicTags(match[1]) : "";
}

function rankTags(block) {
  const tags = [];
  const tagRe = /<a\b[^>]*href=["'][^"']*\/tag\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = tagRe.exec(String(block || "")))) {
    const tag = stripBasicTags(match[1]);
    if (tag && tags.indexOf(tag) < 0) tags.push(tag);
  }
  return tags;
}

function rankImage(block, pageUrl) {
  const source = String(block || "");
  const candidates = [];
  const preferredRe = /\b(?:data-src|data-lazy-src|data-original|data-image|data-cover|data-poster|data-thumb|content)=["']([^"']+)["']/gi;
  let match;
  while ((match = preferredRe.exec(source))) candidates.push(match[1]);
  const srcRe = /\bsrc=["']([^"']+)["']/gi;
  while ((match = srcRe.exec(source))) candidates.push(match[1]);
  const urlRe = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
  while ((match = urlRe.exec(source))) candidates.push(match[1]);
  const directRe = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/ig;
  while ((match = directRe.exec(source))) candidates.push(match[0]);
  for (const candidate of candidates) {
    const value = absoluteUrl(decodeBasicEntities(candidate), pageUrl);
    if (value && !/^blob:|^data:/i.test(value)) return coverUrl(value);
  }
  return "";
}

async function searchVideos(params = {}) {
  const keyword = String(params.keyword || "").trim();
  if (!keyword) return [];
  const page = pageNumber(params);
  const urls = [
    HUANGGUO_SITE + "/search/?keyword=" + encodeURIComponent(keyword),
    HUANGGUO_SITE + "/search/video/" + encodeURIComponent(keyword) + "/"
  ];
  for (const url of urls) {
    const result = await loadList(url, { page: page, referer: HUANGGUO_SITE + "/" });
    if (result.length) return result;
  }
  return [];
}

function normalizeVideoUrl(value, pageUrl) {
  const url = absoluteUrl(value, pageUrl).replace(/&amp;/g, "&");
  if (!url || /^blob:/i.test(url) || /^javascript:/i.test(url)) return "";
  return url;
}

function mediaUrlFromText(text, pageUrl) {
  const source = String(text || "").replace(/\\\//g, "/").replace(/&amp;/g, "&");
  const patterns = [
    /https?:[^\s"'<>]+?\.m3u8(?:\?[^\s"'<>]*)?/ig,
    /https?:[^\s"'<>]+?\.mp4(?:\?[^\s"'<>]*)?/ig,
    /["'](?:file|src|url|playUrl|videoUrl)["']?\s*:\s*["']([^"']+)["']/ig
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(source);
    if (match) {
      const candidate = normalizeVideoUrl(match[1] || match[0], pageUrl);
      if (candidate) return candidate;
    }
  }
  return "";
}

function episodeNumber(text, fallback) {
  const value = String(text || "");
  const match = value.match(/(?:第\s*)?(\d{1,4})(?:\s*(?:集|话|期|章|集数))?/i);
  return match ? parseInt(match[1], 10) : fallback;
}

function parseEpisodes(detailHtml, pageUrl, detailUrl) {
  const groups = {};
  const add = (seasonName, title, href, mediaUrl) => {
    const link = normalizeVideoUrl(href, detailUrl) || detailUrl;
    const name = String(seasonName || "第 1 季").trim() || "第 1 季";
    if (!groups[name]) groups[name] = [];
    const duplicate = groups[name].some(item => item.link === link && item.title === title);
    if (duplicate) return;
    groups[name].push({
      id: link + "#" + groups[name].length,
      title: title || "第 " + (groups[name].length + 1) + " 集",
      episodeNumber: episodeNumber(title, groups[name].length + 1),
      link: link,
      url: mediaUrl || "",
      videoUrl: mediaUrl || "",
      playUrl: mediaUrl || "",
      playerType: mediaUrl ? "system" : "none"
    });
  };
  const source = String(detailHtml || "");
  const episodeRe = /<a\b[^>]*href=["']([^"']*\/video\/\d+\/(?:ep-(\d+)\/?)?)["'][^>]*data-ep-id=["'](\d+)["'][^>]*>/gi;
  let match;
  while ((match = episodeRe.exec(source))) {
    const number = parseInt(match[3] || match[2] || "1", 10) || 1;
    add("第 1 季", "第 " + number + " 集", match[1], "");
  }
  if (!Object.keys(groups).length) {
    const fallbackRe = /href=["'](?:https?:\/\/huangguoai\.com)?\/video\/\d+\/(?:ep-(\d+)\/?)?["']/gi;
    let index = 0;
    while ((match = fallbackRe.exec(source))) {
      const number = parseInt(match[1] || "1", 10) || (++index);
      add("第 1 季", "第 " + number + " 集", match[0].match(/["']([^"']+)["']/)[1], "");
    }
  }
  const embedded = mediaUrlFromText(detailHtml, detailUrl);
  if (!Object.keys(groups).length && embedded) add("第 1 季", "第 1 集", detailUrl, embedded);
  const seasons = Object.keys(groups).map(name => ({ title: name, name: name, seasonNumber: episodeNumber(name, 1), episodes: groups[name].sort((a, b) => a.episodeNumber - b.episodeNumber) }));
  return seasons.filter(season => season.episodes.length).slice(0, 100);
}

function parseDetailMeta(html, pageUrl, options) {
  const source = String(html || "");
  const meta = (name) => {
    const re = new RegExp("<meta\\b[^>]*(?:property|name)=[\\\"']" + name + "[\\\"'][^>]*content=[\\\"']([^\\\"']*)", "i");
    const reverse = new RegExp("<meta\\b[^>]*content=[\\\"']([^\\\"']*)[\\\"'][^>]*(?:property|name)=[\\\"']" + name + "[\\\"']", "i");
    const hit = source.match(re) || source.match(reverse);
    return hit ? decodeBasicEntities(hit[1]) : "";
  };
  const title = cleanTitle(meta("og:title") || stripBasicTags((source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "") || stripBasicTags((source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""));
  const description = meta("og:description") || meta("description");
  const posterValue = options && options.skipPoster ? "" : meta("og:image");
  const media = mediaUrlFromText(source, pageUrl);
  const author = parseAuthorInfo(source, pageUrl);
  return {
    title: title || "黄果短剧",
    description: description,
    poster: options && options.skipPoster
      ? ""
      : (coverUrl(normalizeVideoUrl(posterValue, pageUrl)) || HUANGGUO_FALLBACK_COVER),
    author: author,
    releaseDate: meta("article:published_time") || undefined,
    media: media
  };
}

function parseAuthorInfo(html, pageUrl) {
  const source = String(html || "");
  const blockMatch = source.match(/<div\b[^>]*class=["'][^"']*\bhg-web-detail__author\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (!blockMatch) return null;
  const block = blockMatch[1];
  const link = block.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  const image = block.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i);
  const name = link ? stripBasicTags(link[2]) : "";
  if (!name) return null;
  const avatar = image ? absoluteUrl(image[1], pageUrl) : "";
  return {
    id: link ? absoluteUrl(link[1], pageUrl) : "",
    name: name,
    avatar: avatar,
    avatarUrl: avatar
  };
}

function parseRecommendations(html, pageUrl) {
  const source = String(html || "");
  const match = source.match(/<div\b[^>]*class=["'][^"']*\bhg-web-detail__related\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
  if (!match) return [];
  return parseRecommendationCards(match[1], pageUrl);
}

function parseRecommendationCards(html, pageUrl) {
  const source = String(html || "");
  const links = [];
  const linkRe = /<a\b[^>]*href=["'](?:https?:\/\/huangguoai\.com)?\/detail\/(\d+)\/?["'][^>]*>/gi;
  let match;
  while ((match = linkRe.exec(source))) links.push({ index: match.index, id: match[1] });
  const items = [];
  const seen = {};
  for (let index = 0; index < links.length; index++) {
    const start = links[index].index;
    const end = links[index + 1] ? links[index + 1].index : source.length;
    const block = source.slice(start, end);
    const id = links[index].id;
    if (seen[id]) continue;
    const titleMatch = block.match(/class=["'][^"']*\bhg-drama-card__title\b[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
      block.match(/<img\b[^>]*alt=["']([^"']+)["']/i);
    const title = cleanTitle(titleMatch ? stripBasicTags(titleMatch[1]) : "");
    if (!title) continue;
    const poster = recommendationImage(block, pageUrl);
    const detailUrl = HUANGGUO_SITE + "/detail/" + id + "/";
    const markedUrl = poster ? addCoverMarker(detailUrl, poster) : detailUrl;
    const score = block.match(/hg-drama-card__score[^>]*>[\s\S]*?([0-9]+(?:\.[0-9]+)?)\s*分/i);
    items.push({
      id: detailUrl,
      type: "link",
      mediaType: "tv",
      title: title,
      description: recommendationText(block, "hg-drama-card__desc"),
      tags: recommendationTags(block),
      rating: score ? parseFloat(score[1]) : undefined,
      posterPath: poster || HUANGGUO_FALLBACK_COVER,
      backdropPath: poster || HUANGGUO_FALLBACK_COVER,
      posterUrl: poster || HUANGGUO_FALLBACK_COVER,
      backdropUrl: poster || HUANGGUO_FALLBACK_COVER,
      link: markedUrl,
      detailUrl: markedUrl,
      playerType: "none"
    });
    seen[id] = true;
  }
  return items;
}

function recommendationText(block, className) {
  const match = String(block || "").match(new RegExp("<[^>]*class=[\\\"'][^\\\"']*" + className + "[^\\\"']*[\\\"'][^>]*>([\\s\\S]*?)</", "i"));
  return match ? stripBasicTags(match[1]) : "";
}

function recommendationTags(block) {
  const tags = [];
  const tagRe = /<a\b[^>]*class=["'][^"']*\bhg-tag\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = tagRe.exec(String(block || "")))) {
    const tag = stripBasicTags(match[1]);
    if (tag && tags.indexOf(tag) < 0) tags.push(tag);
  }
  return tags;
}

function recommendationImage(block, pageUrl) {
  const image = String(block || "").match(/<img\b[^>]*>/i);
  if (!image) return "";
  const tag = image[0];
  const preferred = tag.match(/\b(?:data-src|data-lazy-src|data-original|data-image)=["']([^"']+)["']/i);
  const source = preferred || tag.match(/\bsrc=["']([^"']+)["']/i);
  if (!source) return "";
  const value = absoluteUrl(source[1], pageUrl);
  return value && !/^blob:|^data:/i.test(value) ? coverUrl(value) : "";
}

function extractVideoInitialData(html) {
  const match = String(html || "").match(/<script\b[^>]*id=["']videoInitialData["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  const raw = String(match[1] || "").trim();
  const variants = [raw, raw.replace(/\\u0026/g, "&"), decodeBasicEntities(raw)];
  for (const value of variants) {
    try {
      return JSON.parse(value);
    } catch (error) {
      continue;
    }
  }
  return null;
}

function durationSeconds(value) {
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return 0;
  return (parseInt(match[1] || "0", 10) * 3600) + (parseInt(match[2] || "0", 10) * 60) + parseInt(match[3] || "0", 10);
}

async function loadEpisodeData(detailId, episode, params) {
  const suffix = episode === 1 ? "" : "ep-" + episode + "/";
  const url = HUANGGUO_SITE + "/video/" + detailId + "/" + suffix;
  try {
    const response = await fetchPage(url, params);
    const html = String(response && response.data || "");
    const initial = extractVideoInitialData(html) || {};
    const source = initial.videoSrc || initial.previewSrc || (initial.epPlaySrcs && (initial.epPlaySrcs[String(episode)] || initial.epPlaySrcs[episode])) || "";
    const ld = parseDetailMeta(html, url);
    return {
      url: url,
      videoUrl: normalizeVideoUrl(source, url),
      duration: durationSeconds(initial.duration),
      title: cleanTitle(initial.title || ld.title),
      // poster: coverUrl(normalizeVideoUrl(initial.posterSrc || initial.coverSrc || ld.poster, url)),
      description: String(initial.description || ld.description || "").trim()
    };
  } catch (error) {
    return { url: url, videoUrl: "", duration: 0, title: "", poster: "", description: "" };
  }
}

async function loadDetail(link) {
  const isListItem = link && typeof link === "object";
  const originalUrl = isListItem ? link.detailUrl || link.link || link.id || "" : link;
  const marked = readCoverMarker(originalUrl);
  const listPoster = coverUrl((isListItem && (link.posterPath || link.posterUrl)) || marked.cover || "");
  const listBackdrop = coverUrl((isListItem && (link.backdropPath || link.backdropUrl || link.posterPath)) || marked.cover || "");
  const detailUrl = normalizeVideoUrl(marked.url, HUANGGUO_SITE + "/");
  if (!detailUrl) return { id: originalUrl, type: "detail", title: "黄果短剧", playerType: "none", seasons: [] };
  try {
    const response = await fetchPage(detailUrl, { referer: HUANGGUO_SITE + "/" });
    const html = String(response && response.data || "");
    const meta = parseDetailMeta(html, detailUrl, {
      skipPoster: hasUsableCover(listPoster)
    });
    const recommendations = parseRecommendations(html, detailUrl);
    if (listPoster) meta.poster = listPoster;
    const seasons = parseEpisodes(html, detailUrl, detailUrl);
    const allEpisodes = seasons.reduce((items, season) => items.concat(season.episodes), []);
    const detailIdMatch = detailUrl.match(/\/detail\/(\d+)/i);
    const detailId = detailIdMatch ? detailIdMatch[1] : "";
    const episodeRows = allEpisodes.slice(0, MAX_EPISODES);
    const episodeData = detailId
      ? await Promise.all(episodeRows.map((episode, index) => loadEpisodeData(detailId, episodeNumber(episode.title, index + 1), { referer: detailUrl })))
      : [];
    episodeRows.forEach((episode, index) => {
      const data = episodeData[index] || {};
      episode.url = data.videoUrl || "";
      episode.videoUrl = data.videoUrl || "";
      episode.playUrl = data.videoUrl || "";
      episode.playerType = data.videoUrl ? "system" : "none";
      episode.pageUrl = data.url || episode.link;
      if (data.title) episode.title = data.title;
      // if (data.poster && !meta.poster) meta.poster = data.poster;
    });
    const videoUrl = meta.media || (episodeRows[0] && episodeRows[0].videoUrl) || "";
    const duration = (episodeData[0] && episodeData[0].duration) || 0;
    const playHeaders = videoUrl ? requestHeaders(detailUrl) : undefined;
    const episodeItems = episodeRows.filter(episode => episode.videoUrl).map(episode => ({
      id: episode.id,
      title: episode.title,
      episodeNumber: episode.episodeNumber,
      videoUrl: episode.videoUrl,
      posterUrl: listPoster || meta.poster,
      backdropUrl: listBackdrop || meta.poster,
      headers: requestHeaders(episode.pageUrl),
      customHeaders: requestHeaders(episode.pageUrl)
    }));
    return {
      id: detailUrl,
      type: "detail",
      title: meta.title,
      description: meta.description || meta.title,
      releaseDate: meta.releaseDate,
      posterPath: listPoster || meta.poster,
      backdropPath: listBackdrop || meta.poster,
      poster: listPoster || meta.poster,
      backdrop: listBackdrop || meta.poster,
      cover: listPoster || meta.poster,
      thumbnail: listPoster || meta.poster,
      fallbackCoverPath: HUANGGUO_FALLBACK_COVER,
      mediaType: "tv",
      duration: duration,
      durationText: duration ? Math.round(duration / 60) + "分钟" : "",
      previewUrl: "",
      videoUrl: videoUrl,
      url: videoUrl,
      playUrl: videoUrl,
      playerType: videoUrl ? "system" : "none",
      seasons: seasons,
      episodes: episodeRows,
      episodeItems: episodeItems,
      directors: meta.author ? [{
        id: meta.author.id,
        name: meta.author.name + " (导演)",
        avatar: meta.author.avatar,
        avatarUrl: meta.author.avatarUrl
      }] : [],
      recommendations: recommendations,
      link: detailUrl,
      customHeaders: playHeaders,
      headers: playHeaders
    };
  } catch (error) {
    const fallback = typeof link === "object" ? link.posterPath || HUANGGUO_FALLBACK_COVER : HUANGGUO_FALLBACK_COVER;
    return {
      id: detailUrl,
      type: "detail",
      title: typeof link === "object" && link.title ? link.title : "黄果短剧",
      description: "详情页请求失败，请稍后重试",
      posterPath: fallback,
      backdropPath: fallback,
      mediaType: "tv",
      videoUrl: "",
      url: "",
      playUrl: "",
      playerType: "none",
      seasons: [],
      episodes: [],
      directors: [],
      recommendations: [],
      link: detailUrl
    };
  }
}
