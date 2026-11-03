// Conflux Extension 黄果短剧源 修复可运行版
// 元数据配置
const WidgetMetadata = {
    id: "huangguo_rex",
    title: "黄果短剧",
    description: "黄果AI短剧扩展源",
    author: "rex",
    version: "1.0.0",
    requiredVersion: "1.0.0",
    detailCacheDuration: 60,
    site: "shturl.cc/AAsvUSYVTIsX",
    icon: "",
    globalParams: [
        {
            name: "coverWorkerUrl",
            title: "封面反代Worker地址",
            type: "text",
            value: "",
            description: "用于防盗链图片中转，留空使用内置默认"
        }
    ],
    modules: [
        {
            id: "recommend",
            title: "推荐",
            description: "推荐短剧列表",
            requiresWebView: false,
            functionName: "loadRecommend",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "newest",
            title: "最新",
            description: "最新上线短剧",
            requiresWebView: false,
            functionName: "loadNewest",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "aiDuanju",
            title: "AI短剧",
            description: "AI生成短剧分类",
            requiresWebView: false,
            functionName: "loadAiDuanju",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "aiManju",
            title: "AI漫剧",
            description: "AI漫剧分类",
            requiresWebView: false,
            functionName: "loadAiManju",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "aiHuanlian",
            title: "AI连环画",
            description: "AI连环题材",
            requiresWebView: false,
            functionName: "loadAiHuanlian",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "aiMogai",
            title: "AI魔改",
            description: "AI魔改题材",
            requiresWebView: false,
            functionName: "loadAiMogai",
            cacheDuration: 0,
            params: [
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "topic",
            title: "专题",
            description: "各专题分类",
            requiresWebView: false,
            functionName: "loadTopics",
            cacheDuration: 0,
            params: [
                {
                    name: "topicId",
                    title: "专题",
                    type: "select",
                    description: "选择专题分类",
                    value: "default",
                    enumOptions: [
                        { title: "全部", value: "default" },
                        { title: "热门", value: "hot" },
                        { title: "言情", value: "love" },
                        { title: "逆袭", value: "nixi" },
                        { title: "爽文", value: "shuang" },
                        { title: "穿越", value: "chuanyue" }
                    ]
                },
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "ranking",
            title: "榜单",
            description: "短剧榜单",
            requiresWebView: false,
            functionName: "loadRanking",
            cacheDuration: 0,
            params: [
                {
                    name: "rankingType",
                    title: "榜单",
                    type: "select",
                    description: "选择榜单类型",
                    value: "hot",
                    enumOptions: [
                        { title: "热度榜", value: "hot" },
                        { title: "推荐榜", value: "recommend" },
                        { title: "潜力榜", value: "potential" }
                    ]
                },
                { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
            ]
        },
        {
            id: "detail",
            title: "详情",
            functionName: "loadDetail",
            type: "detail",
            cacheDuration: 0,
            params: []
        }
    ],
    search: {
        title: "搜索",
        functionName: "searchVideos",
        params: [
            { name: "keyword", title: "关键词", type: "text", description: "搜索关键词", value: "" },
            { name: "page", title: "页码", type: "number", description: "页码", value: "1" }
        ]
    }
};

// ====================== 全局常量 ======================
const HUANGGUO_SITE = "shturl.cc/AAsvUSYVTIsX";
const HUANGGUO_UA = "Mozilla/5.0 (Mobile) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36";
const HUANGGUO_FALLBACK_COVER = HUANGGUO_SITE + "/static/default_cover.png";
const MAX_EPISODES = 300;
const EP_FETCH_CONCURRENCY = 6;
const DETAIL_LINK_PREFIX = "hg://detail/";
const STORAGE_KEY_WORKER = "huangguo_cover_worker";
const HUANGGUO_COVER_WORKER_URL = "https://your-worker.example/proxy-image";

// 排序参数，注入到部分模块
const HUANGGUO_SORT_PARAM = {
    name: "sort",
    title: "排序",
    type: "select",
    description: "选择排序方式",
    value: "latest",
    enumOptions: [
        { title: "最新", value: "latest" },
        { title: "热门", value: "hot" },
        { title: "原创", value: "original" },
        { title: "随机", value: "random" }
    ]
};
// 给指定模块追加排序参数
["aiDuanju", "aiManju", "aiHuanlian", "aiMogai"].forEach(modId => {
    const mod = WidgetMetadata.modules.find(m => m.id === modId);
    if (mod) {
        mod.params = [HUANGGUO_SORT_PARAM, ...(mod.params || [])];
    }
});

// 栏目页面地址映射
const SECTION_URLS = {
    recommend: HUANGGUO_SITE + "/category/recommend",
    newest: HUANGGUO_SITE + "/category/newest",
    aiDuanju: HUANGGUO_SITE + "/category/ai‑duanju",
    aiManju: HUANGGUO_SITE + "/category/ai‑manju",
    aiHuanlian: HUANGGUO_SITE + "/category/ai‑huanlian",
    aiMogai: HUANGGUO_SITE + "/category/ai‑mogai"
};
// 榜单地址映射
const HUANGGUO_RANKING_URLS = {
    hot: HUANGGUO_SITE + "/ranking/hot",
    recommend: HUANGGUO_SITE + "/ranking/recommend",
    potential: HUANGGUO_SITE + "/ranking/potential"
};

let ACTIVE_COVER_WORKER = "";
function normalizeWorker(url) {
    if (!url) return "";
    return String(url || "").trim().replace(/\/+$/, "");
}
ACTIVE_COVER_WORKER = normalizeWorker(HUANGGUO_COVER_WORKER_URL);

// 读取全局设置，更新反代worker
function applySettings(settings) {
    const w = normalizeWorker(settings && settings.coverWorkerUrl);
    ACTIVE_COVER_WORKER = w || normalizeWorker(HUANGGUO_COVER_WORKER_URL);
    try {
        if (Widget.storage) Widget.storage.set(STORAGE_KEY_WORKER, ACTIVE_COVER_WORKER);
    } catch (e) { }
}
function currentWorker() {
    if (ACTIVE_COVER_WORKER) return ACTIVE_COVER_WORKER;
    try {
        if (Widget.storage) ACTIVE_COVER_WORKER = normalizeWorker(Widget.storage.get(STORAGE_KEY_WORKER));
    } catch (e) { }
    return ACTIVE_COVER_WORKER || normalizeWorker(HUANGGUO_COVER_WORKER_URL);
}

// 页码安全解析
function pageNumber(params) {
    const p = parseInt(params && params.page, 10);
    return Number.isInteger(p) && p > 0 ? p : 1;
}

// 相对url转绝对url
function absoluteUrl(href, baseUrl) {
    let s = String(href || "").trim().replace(/&amp;/g, "&");
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/\//.test(s)) return "https:" + s;
    const base = (baseUrl || HUANGGUO_SITE + "/");
    if (s.startsWith("/")) {
        const domain = base.match(/^(https?:\/\/[^/]+)/i);
        return (domain ? domain[1] : HUANGGUO_SITE) + s;
    }
    const baseNoQuery = base.replace(/[?#].*$/, "").replace(/\/[^/]*$/, "/");
    return new URL(s, baseNoQuery).href;
}

// 封面图片反代
function coverUrl(imgSrc) {
    let src = String(imgSrc || "").trim();
    const worker = currentWorker();
    if (!src || !worker || /^data:|^blob:/i.test(src)) return src;
    return `${worker}${worker.includes("?") ? "&" : "?"}url=${encodeURIComponent(src)}`;
}

function hasUsableCover(src) {
    const s = String(src || "").trim();
    return !!s && s !== HUANGGUO_FALLBACK_COVER
        && !/^blob:|^data:/i.test(s)
        && !/cover‑placeholder|avatar‑default/i.test(s);
}

// 构造内部跳转链接 hg://detail/id?cover=xxx
function makeDetailLink(id, cover) {
    let link = DETAIL_LINK_PREFIX + id + "/";
    if (cover) link += "?cover=" + encodeURIComponent(cover);
    return link;
}

// 解析 hg://detail 链接，取出id和cover
function parseDetailLink(linkStr) {
    const s = String(linkStr || "");
    const m = s.match(/^hg:\/\/detail\/(\d+)\/?/i);
    if (!m) return null;
    let cover = "";
    const cm = s.match(/[?&]cover=([^&#]*)/i);
    if (cm) try { cover = decodeURIComponent(cm[1]); } catch { cover = cm[1]; }
    return { id: m[1], cover };
}

// 作品详情网页url
function detailPageUrl(id) {
    return HUANGGUO_SITE + "/detail/" + id + "/";
}
// 单集播放页url
function episodePageUrl(id, epNum) {
    const ep = parseInt(epNum, 10) || 1;
    return HUANGGUO_SITE + "/video/" + id + "/ep‑" + ep + "/";
}

// 请求头
function requestHeaders(referer) {
    return {
        "User‑Agent": HUANGGUO_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept‑Language": "zh‑CN,zh;q=0.9",
        "Referer": referer || HUANGGUO_SITE + "/"
    };
}

// fetch 获取网页文本
async function fetchPage(url, referer) {
    const safeUrl = String(url || "").replace(/^https?:\/\/[^/]+/i, HUANGGUO_SITE);
    try {
        const resp = await Widget.fetch.fetch(safeUrl, {
            headers: requestHeaders(referer || HUANGGUO_SITE + "/"),
            timeout: 30000
        });
        if (resp && resp.text !== null && resp.text !== undefined) {
            return typeof resp.text === "string" ? resp.text : String(resp.text);
        }
    } catch (err) {
        console.log("[fetchPage] error", safeUrl, err?.message || err);
    }
    return "";
}

// 并发控制mapLimit
async function mapLimit(arr, limit, fn) {
    const result = new Array(arr.length);
    let idx = 0;
    const workers = Array(Math.min(limit, arr.length)).fill(0).map(async () => {
        while (idx < arr.length) {
            const cur = idx++;
            result[cur] = await fn(arr[cur], cur);
        }
    });
    await Promise.all(workers);
    return result;
}

// 解析sort参数
function sortChannel(params) {
    const valid = ["latest", "hot", "original", "random"];
    const s = String(params && params.sort || "latest");
    return valid.includes(s) ? s : "latest";
}

// url追加页码与sort参数
function withPage(baseUrl, page, sortVal) {
    const sep = baseUrl.includes("?") ? "&" : "?";
    let q = `page=${Number.isInteger(page) && page > 0 ? page : 1}`;
    if (sortVal) q += `&sort=${sortVal}`;
    return baseUrl + sep + q;
}

// 清理标题：去除多余空白、站点后缀
function cleanTitle(title) {
    return String(title || "")
        .replace(/\s+/g, " ")
        .replace(/\s*[-|_]\s*(黄果短剧|黄果AI|黄果影视).*$/i, "")
        .trim();
}

// 构建卡片item（Conflux标准卡片格式）
function buildCardVideoItem(opt) {
    return {
        id: opt.link,
        type: "video",
        mediaType: "tv",
        title: opt.title,
        description: opt.description || "",
        posterPath: opt.poster,
        backdropPath: opt.poster,
        coverUrl: opt.poster,
        durationText: opt.durationText || "",
        rating: opt.rating,
        link: opt.link
    };
}

// 从html片段提取图片地址，兼容data‑src、背景图、img标签
function extractImageValue(html) {
    const str = String(html || "");
    const clean = (u) => {
        const s = String(u || "").trim().replace(/&amp;/g, "&");
        if (/^blob:|^data:|^javascript:/i.test(s)) return "";
        return s;
    };
    // img标签
    const imgMatch = str.match(/<img\b[^>]*>/i);
    if (imgMatch) {
        const srcReg = /\b(?:data‑src|data‑lazy‑src|data‑original|data‑bg|data‑cover|data‑poster|data‑image|data‑thumb)=["']([^"']+)["']/i;
        const m = imgMatch[0].match(srcReg);
        if (m) return clean(m[1]);
    }
    // 背景图
    const bg = str.match(/background‑image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bg) return clean(bg[1]);
    // 直接http图片链接
    const direct = str.match(/https?:[^\s"'<>()]+?\.(?:jpg|jpeg|png|webp)(?:[?#][^\s"'<>()]*)?/i);
    return direct ? clean(direct[0]) : "";
}

// html实体解码
function decodeBasicEntities(s) {
    return String(s || "")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;|&#x27;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");
}

// 去除html标签
function stripBasicTags(html) {
    return decodeBasicEntities(String(html || "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")).trim();
}

// 提取卡片可见区域，按sort筛选对应grid块
function extractVisibleCardRegion(html, sortVal) {
    let content = String(html || "");
    if (sortVal === "latest") content = content.replace(/<template\b[\s\S]*?<\/template>/gi, "");
    return content;
}

// 解析普通列表卡片 hg‑drama‑card
function parseCards(htmlText, baseUrl, sortVal) {
    const html = extractVisibleCardRegion(htmlText, sortVal);
    const items = [];
    const seen = new Set();
    const cardRe = /<div\b[^>]*class=["'][^"']*\bhg‑drama‑card\b[^"']*["'][^>]*>/gi;
    let match;
    const posList = [];
    while ((match = cardRe.exec(html)) !== null) posList.push(match.index);

    for (let i = 0; i < posList.length; i++) {
        const start = posList[i];
        const end = posList[i + 1] ?? html.length;
        const frag = html.slice(start, end);
        const idMatch = frag.match(/href=["'](?:https?:\/\/huangguoai\.com)?\/(?:detail|video)\/(\d+)\/?["']/i);
        if (!idMatch) continue;
        const dramaId = idMatch[1];
        if (seen.has(dramaId)) continue;
        seen.add(dramaId);

        const titleRaw = frag.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || frag.match(/alt=["']([^"']+)["']/);
        const title = cleanTitle(titleRaw ? stripBasicTags(titleRaw[1]) : "");
        if (!title) continue;

        const descRaw = frag.match(/<div class="desc[^>]*>([\s\S]*?)<\/div>/);
        const durRaw = frag.match(/<div class="duration[^>]*>([\s\S]*?)<\/div>/);
        const scoreRaw = frag.match(/(\d+(?:\.\d+)?)分/);

        let imgRaw = extractImageValue(frag);
        const poster = coverUrl(absoluteUrl(imgRaw, baseUrl)) || HUANGGUO_FALLBACK_COVER;
        const link = makeDetailLink(dramaId, poster);

        items.push(buildCardVideoItem({
            link,
            title,
            description: descRaw ? stripBasicTags(descRaw[1]) : "",
            poster,
            durationText: durRaw ? stripBasicTags(durRaw[1]) : "",
            rating: scoreRaw ? parseFloat(scoreRaw[1]) : undefined
        }));
    }
    return items;
}

// 通用列表加载
async function loadList(url, params, needSort = false) {
    try {
        const p = pageNumber(params);
        const s = needSort ? sortChannel(params) : "";
        const target = withPage(url, p, s);
        const html = await fetchPage(target, params?.referer || HUANGGUO_SITE + "/");
        if (!html) return [];
        return parseCards(html, target, s);
    } catch (e) {
        console.log("[loadList]", url, e?.message);
        return [];
    }
}

async function loadRecommend(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.recommend, params, false);
}
async function loadNewest(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.newest, params, false);
}
async function loadAiDuanju(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.aiDuanju, params, true);
}
async function loadAiManju(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.aiManju, params, true);
}
async function loadAiHuanlian(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.aiHuanlian, params, true);
}
async function loadAiMogai(params = {}) {
    applySettings(params);
    return await loadList(SECTION_URLS.aiMogai, params, true);
}

// 专题
async function loadTopics(params = {}) {
    applySettings(params);
    const tid = String(params?.topicId || "default");
    const validTopic = ["default", "hot", "love", "nixi", "shuang", "chuanyue"];
    const realTid = validTopic.includes(tid) ? tid : "default";
    const url = HUANGGUO_SITE + "/topic/" + realTid + "/";
    return await loadList(url, params, false);
}

// 榜单解析
function parseRankingCards(htmlText, baseUrl) {
    const html = String(htmlText || "");
    const out = [];
    const seen = new Set();
    const rankRe = /<div\b[^>]*class=["'][^"']*\bhg‑rank‑item\b[^"']*["'][^>]*\bdata‑rank‑item\b[^>]*>/gi;
    const posList = [];
    let m;
    while ((m = rankRe.exec(html)) !== null) posList.push(m.index);

    for (let i = 0; i < posList.length; i++) {
        const start = posList[i];
        const end = posList[i + 1] ?? html.length;
        const frag = html.slice(start, end);
        const idM = frag.match(/data‑rank‑item=["'](\d+)["']/i);
        const titleM = frag.match(/<div class="rank‑title[^>]*>([\s\S]*?)<\/div>/);
        if (!idM || !titleM) continue;
        const dramaId = idM[1];
        if (seen.has(dramaId)) continue;
        seen.add(dramaId);
        const title = cleanTitle(stripBasicTags(titleM[1]));
        const scoreM = frag.match(/(\d+(?:\.\d+)?)分/);
        const descM = frag.match(/<div class="rank‑desc[^>]*>([\s\S]*?)<\/div>/);
        const imgSrc = extractImageValue(frag);
        const poster = coverUrl(absoluteUrl(imgSrc, baseUrl)) || HUANGGUO_FALLBACK_COVER;
        const link = makeDetailLink(dramaId, poster);
        out.push(buildCardVideoItem({
            link,
            title,
            description: descM ? stripBasicTags(descM[1]) : "",
            poster,
            rating: scoreM ? parseFloat(scoreM[1]) : undefined
        }));
    }
    return out;
}

async function loadRanking(params = {}) {
    applySettings(params);
    const rt = String(params?.rankingType || "hot");
    const url = HUANGGUO_RANKING_URLS[rt] || HUANGGUO_RANKING_URLS.hot;
    const p = pageNumber(params);
    const target = withPage(url, p, "");
    try {
        const html = await fetchPage(target, HUANGGUO_SITE + "/");
        if (!html) return [];
        return parseRankingCards(html, target);
    } catch (e) {
        console.log("[loadRanking]", rt, e?.message);
        return [];
    }
}

// 搜索
async function searchVideos(params = {}) {
    applySettings(params);
    const kw = String(params?.keyword || "").trim();
    if (!kw) return [];
    const p = pageNumber(params);
    const searchUrl = `${HUANGGUO_SITE}/search?q=${encodeURIComponent(kw)}&page=${p}`;
    return await loadList(searchUrl, { page: p, referer: HUANGGUO_SITE + "/" }, false);
}

// 判断播放链接是否可用
function isPlayableUrl(u) {
    const s = String(u || "").trim().replace(/&amp;/g, "&");
    return /^https?:\/\//i.test(s)
        && /\.(?:m3u8|mp4|flv|ts)(?:[?#]|$)/i.test(s)
        && !/^blob:|^javascript:/i.test(s);
}

// 提取播放地址
function extractPlayUrl(html, pageBase) {
    let text = String(html || "")
        .replace(/\\\//g, "/")
        .replace(/&amp;/g, "&")
        .replace(/\\u0026/g, "&");

    const toAbs = (u) => absoluteUrl(u, pageBase);
    // json数据块
    const dataScript = text.match(/<script\b[^>]*id=["']videoInitialData["'][^>]*>([\s\S]*?)<\/script>/i);
    if (dataScript) {
        let jsonStr = dataScript[1];
        try {
            const obj = JSON.parse(jsonStr);
            const keys = ["videoSrc", "playUrl", "videoUrl", "src", "url"];
            for (const k of keys) {
                const v = obj[k];
                if (v && isPlayableUrl(toAbs(v))) return toAbs(v);
            }
        } catch { }
    }
    // 正则匹配playUrl/videoSrc
    const urlRe = /["']?(?:videoSrc|previewSrc|playUrl|play_url|videoUrl|video_url|playSrc|mediaUrl|media_url|file|src|url)["']?\s*:\s*["']([^"']{8,}?)["']/gi;
    let m;
    while ((m = urlRe.exec(text)) !== null) {
        const abs = toAbs(m[1]);
        if (isPlayableUrl(abs)) return abs;
    }
    // meta og:video
    const metaVideo = text.match(/<meta\b[^>]*(?:property|name)=["']og:video(?::url)?["'][^>]*content=["']([^"']+)["']/i);
    if (metaVideo && isPlayableUrl(toAbs(metaVideo[1]))) return toAbs(metaVideo[1]);
    // 直接m3u8/mp4链接
    const direct = text.match(/https?:[^\s"'<>,\\]+?\.m3u8(?:[^\s"'<>,\\]*)?/i)
        || text.match(/https?:[^\s"'<>,\\]+?\.(?:mp4|flv)(?:[^\s"'<>,\\]*)?/i);
    if (direct && isPlayableUrl(toAbs(direct[0]))) return toAbs(direct[0]);
    return "";
}

// 解析时长 PT格式
function durationSeconds(durStr) {
    const s = String(durStr || "");
    const pt = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
    if (pt) {
        const h = parseInt(pt[1] || "0", 10);
        const m = parseInt(pt[2] || "0", 10);
        const sec = parseInt(pt[3] || "0", 10);
        return h * 3600 + m * 60 + sec;
    }
    const num = parseInt(s, 10);
    return Number.isInteger(num) && num >= 0 && num < 200000 ? num : 0;
}

// 解析集号
function episodeNumber(text, def = 1) {
    const m = String(text || "").match(/(?:第\s*)?(\d{1,4})(?:\s*(?:集|话|期|章|集数))?/i);
    return m ? parseInt(m[1], 10) : def;
}

// 请求单集页面，拿到播放地址
async function resolveEpisodePlay(dramaId, epNum) {
    const ep = parseInt(epNum, 10) || 1;
    const url = episodePageUrl(dramaId, ep);
    const ret = { pageUrl: url, videoUrl: "", duration: 0, title: "", description: "" };
    try {
        const html = await fetchPage(url, detailPageUrl(dramaId));
        if (!html) return ret;
        ret.videoUrl = extractPlayUrl(html, url);
        const dataScript = html.match(/<script\b[^>]*id=["']videoInitialData["'][^>]*>([\s\S]*?)<\/script>/i);
        if (dataScript) {
            try {
                const o = JSON.parse(dataScript[1]);
                ret.duration = durationSeconds(o.duration);
                ret.title = cleanTitle(o.title || "");
                ret.description = String(o.description || "").trim();
            } catch { }
        }
    } catch (e) {
        console.log("[resolveEpisodePlay]", url, e?.message);
    }
    return ret;
}

// 从详情页html提取全部集号
function discoverEpisodes(html, dramaId) {
    const str = String(html || "");
    const eps = [];
    const seen = new Set();
    const pushEp = (n) => {
        const num = parseInt(n, 10);
        if (Number.isInteger(num) && num >= 1 && !seen.has(num)) {
            seen.add(num);
            eps.push({ episode: num });
        }
    };
    // a标签
    const aRe = /<a\b[^>]*(?:href=["']([^"']*\/video\/\d+\/(?:ep‑(\d+)\/?)?)["'][^>]*data‑ep‑id=["'](\d+)["']|data‑ep‑id=["'](\d+)["'][^>]*href=["']([^"']*\/video\/\d+\/(?:ep‑(\d+)\/?)?)["'])[^>]*>/gi;
    let m;
    while ((m = aRe.exec(str)) !== null) {
        const val = m[3] || m[2] || m[4] || m[6];
        if (val) pushEp(val);
    }
    // js episodes数组
    const jsonEpRe = /["'](?:episodes|epList|episode_list|playList|videos)["']?\s*:\s*(\[[\s\S]{0,50000}?\])\s*[,}\]]/gi;
    while ((m = jsonEpRe.exec(str)) !== null) {
        try {
            const arr = JSON.parse(m[1].replace(/\\\//g, "/"));
            if (Array.isArray(arr)) {
                arr.forEach((item, idx) => {
                    if (typeof item === "number") pushEp(item);
                    else if (typeof item === "string") pushEp(item);
                    else if (item && typeof item === "object") {
                        const v = item.ep || item.id || item.episode || (idx + 1);
                        pushEp(v);
                    }
                });
                if (eps.length > 0) break;
            }
        } catch { continue; }
    }
    // 兜底：页面能解析播放链接就当作1集
    if (eps.length === 0 && extractPlayUrl(str, detailPageUrl(dramaId))) {
        pushEp(1);
    }
    return eps.sort((a, b) => a.episode - b.episode).slice(0, MAX_EPISODES);
}

// 组装episodeItems
function buildEpisodeItems(dramaId, epList, epResolveResult, cover) {
    return epList.map((epItem, idx) => {
        const res = epResolveResult[idx] || {};
        const epNum = epItem.episode;
        return {
            id: episodePageUrl(dramaId, epNum),
            type: "video",
            mediaType: "tv",
            title: res.title || `第 ${epNum} 集`,
            episodeNumber: epNum,
            videoUrl: res.videoUrl || "",
            posterPath: cover,
            coverUrl: cover,
            playerType: res.videoUrl ? "default" : undefined
        };
    }).filter(x => !!x.videoUrl);
}

// 解析详情元信息：标题、简介、封面、作者
function parseDetailMeta(html, pageUrl, opt) {
    const s = String(html || "");
    const titleM = s.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || s.match(/<title\b[^>]*>([\s\S]*?)<\/title>/);
    const title = cleanTitle(titleM ? stripBasicTags(titleM[1]) : "");
    const descM = s.match(/<div class="detail‑desc[^>]*>([\s\S]*?)<\/div>/);
    const description = descM ? stripBasicTags(descM[1]) : "";
    let poster = "";
    if (!opt?.skipPoster) {
        const img = extractImageValue(s);
        poster = coverUrl(absoluteUrl(img, pageUrl)) || HUANGGUO_FALLBACK_COVER;
    }
    return { title, description, poster, author: null, releaseDate: undefined };
}

// 解析相关推荐卡片
function parseRecommendations(htmlText, baseUrl) {
    const html = String(htmlText || "");
    const relatedBlock = html.match(/<div\b[^>]*class=["'][^"']*\bhg‑web‑detail__related\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
    if (!relatedBlock) return [];
    return parseCards(relatedBlock[1], baseUrl, "");
}

// 详情主入口
async function loadDetail(params = {}) {
    applySettings(params);
    const link = String(params.link || "");
    const parsed = parseDetailLink(link);
    if (!parsed) return null;
    const dramaId = parsed.id;
    const preCover = hasUsableCover(parsed.cover) ? parsed.cover : "";
    const detailUrl = detailPageUrl(dramaId);
    let html = "";
    try {
        html = await fetchPage(detailUrl, HUANGGUO_SITE + "/");
    } catch { }
    const emptyRet = {
        id: link, type: "video", mediaType: "tv", link,
        title: "", description: "", posterPath: HUANGGUO_FALLBACK_COVER,
        backdropPath: HUANGGUO_FALLBACK_COVER, coverUrl: HUANGGUO_FALLBACK_COVER,
        episodeItems: [], relatedItems: []
    };
    if (!html) return emptyRet;

    const meta = parseDetailMeta(html, detailUrl, { skipPoster: !!preCover });
    const finalCover = preCover || meta.poster;
    const relatedItems = parseRecommendations(html, detailUrl);
    const epList = discoverEpisodes(html, dramaId);
    // 并发请求每一集
    const epFetchResult = await mapLimit(epList, EP_FETCH_CONCURRENCY, ep => resolveEpisodePlay(dramaId, ep.episode));
    const episodeItems = buildEpisodeItems(dramaId, epList, epFetchResult, finalCover);

    return {
        id: link,
        type: "video",
        mediaType: "tv",
        link,
        title: meta.title,
        description: meta.description || meta.title,
        posterPath: finalCover,
        backdropPath: finalCover,
        coverUrl: finalCover,
        episodeItems,
        relatedItems,
        peoples: []
    };
}

// 获取播放资源
async function loadResource(params = {}) {
    applySettings(params);
    const link = String(params.link || "");
    const parsed = parseDetailLink(link);
    if (!parsed) return [];
    const dramaId = parsed.id;
    const epNum = parseInt(params.episodeNumber || 1, 10) || 1;
    const res = await resolveEpisodePlay(dramaId, epNum);
    if (!res.videoUrl) return [];
    return [{
        name: `第 ${epNum} 集`,
        description: "",
        url: res.videoUrl,
        playerType: "default",
        customHeaders: requestHeaders(res.pageUrl)
    }];
}

// ========== Conflux Extension 标准导出 ==========
export default {
    WidgetMetadata,
    loadRecommend,
    loadNewest,
    loadAiDuanju,
    loadAiManju,
    loadAiHuanlian,
    loadAiMogai,
    loadTopics,
    loadRanking,
    searchVideos,
    loadDetail,
    loadResource
};