/**
 * 红果短剧 ForwardWidget v1.0
 * 数据源: hongguoduanju.com (网页 SSR, 免签名)
 * 详情/分类/搜索: SSR JSON; 播放: 网页端每剧免费前3集 (accessible_episode_cnt)
 *
 * 结构参考: happy-capy 镜像 hongguo_core 逆向
 */
WidgetMetadata = {
  id: "forward.hongguo.web",
  title: "红果短剧",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "红果短剧：分类/搜索/分集播放（网页端，每部剧可免费看前3集）",
  author: "balge",
  site: "https://hongguoduanju.com",
  detailCacheDuration: 180,
  globalParams: [
    {
      name: "siteBase",
      title: "站点地址",
      type: "input",
      value: "https://hongguoduanju.com"
    }
  ],
  modules: [
    {
      id: "loadList",
      title: "分类",
      functionName: "loadList",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "short",
          enumOptions: [
            { title: "短剧", value: "short" },
            { title: "漫剧", value: "comic" },
            { title: "榜单", value: "rank" }
          ]
        }
      ]
    },
    {
      id: "loadResource",
      title: "播放资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 0,
      params: []
    }
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" }
    ]
  }
};

var UA = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function t(v) {
  return String(v == null ? "" : v).trim();
}
function cfg(params) {
  params = params || {};
  return t(params.siteBase || "https://hongguoduanju.com").replace(/\/+$/, "");
}
function qs(obj) {
  var parts = [];
  Object.keys(obj || {}).forEach(function (k) {
    if (obj[k] == null || obj[k] === "") return;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k])));
  });
  return parts.length ? "?" + parts.join("&") : "";
}
async function httpText(url) {
  var res = await Widget.http.get(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "zh-CN,zh;q=0.9",
      Accept: "text/html,application/json,*/*"
    }
  });
  var d = res && res.data;
  if (typeof d !== "string") d = String(d == null ? "" : d);
  return d;
}
/** SSR 页面里 JSON 值的 \u002F 转义还原 */
function unesc(s) {
  return t(s).replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
}
function absCover(base, cover) {
  cover = unesc(cover);
  if (!cover) return "";
  if (/^https?:\/\//i.test(cover)) return cover;
  if (cover.indexOf("//") === 0) return "https:" + cover;
  return base + (cover[0] === "/" ? "" : "/") + cover;
}

/** 从 SSR HTML 里抽取卡片数组片段（series_id ... series_intro 的 JSON 对象流） */
function extractCards(html) {
  var out = [];
  var re = /"series_id":"(\d{15,25})"[\s\S]{0,120}?"series_name":"([^"]*)"[\s\S]{0,400}?"series_cover":"([^"]*)"[\s\S]{0,2000}?"series_intro":"([\s\S]*?)"(?:,"tags)/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      id: m[1],
      name: unesc(m[2]),
      cover: unesc(m[3]),
      intro: unesc(m[4])
    });
  }
  return out;
}

/** 搜索页卡片结构不同: doc_type=23 的 video_data 对象 */
function extractSearchCards(html) {
  var out = [];
  var re = /"video_data":\{"series_id":"(\d{15,25})","episode_cnt":(\d+)[\s\S]{0,200}?"series_title":"([^"]*)"[\s\S]{0,600}?"series_cover":"([^"]*)"[\s\S]{0,1200}?"series_intro":"([\s\S]*?)","episode_right_text/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      id: m[1],
      epCount: m[2],
      name: unesc(m[3]),
      cover: unesc(m[4]),
      intro: unesc(m[5])
    });
  }
  return out;
}

function remarkOf(epRight) {
  // episode_right_text 如 "全61集" / "更新至xx集"
  return unesc(epRight || "");
}

function toItem(base, card) {
  if (!card || !card.id) return null;
  var cover = absCover(base, card.cover);
  var remark = card.remark || "";
  return {
    id: "hguo:" + card.id,
    type: "url",
    title: card.name || card.id,
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: card.intro || remark || "",
    mediaType: "tv",
    link: "hguo:" + card.id
  };
}

async function loadList(params) {
  params = params || {};
  var base = cfg(params);
  var page = Number(params.page || 1) || 1;
  var tid = t(params.tid) || "short";
  var cards = [];
  if (tid === "comic") {
    var html = await httpText(base + "/category/anime" + (page > 1 ? qs({ page: page }) : ""));
    cards = extractCards(html);
  } else if (tid === "rank") {
    // 榜单页
    var html2 = await httpText(base + "/rank" + (page > 1 ? qs({ page: page }) : ""));
    cards = extractCards(html2);
    if (!cards.length) cards = extractSearchCards(html2);
  } else {
    var html3 = await httpText(base + "/category/real-drama" + (page > 1 ? qs({ page: page }) : ""));
    cards = extractCards(html3);
  }
  var out = [];
  for (var i = 0; i < cards.length; i++) {
    var item = toItem(base, cards[i]);
    if (item) out.push(item);
  }
  return out;
}

async function search(params) {
  params = params || {};
  var base = cfg(params);
  var kw = t(params.keyword);
  if (!kw) return [];
  var page = Number(params.page || 1) || 1;
  var html = await httpText(base + qs({ __loader: "search_(keyword)/page", __ssrDirect: "true" }).replace("?", "/search/" + encodeURIComponent(kw) + "?"));
  var cards = extractSearchCards(html);
  if (!cards.length) cards = extractCards(html);
  var out = [];
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    c.remark = c.epCount ? "全" + c.epCount + "集" : "";
    var item = toItem(base, c);
    if (item) out.push(item);
  }
  return out;
}

function parseLink(link) {
  var s = t(link).replace(/^hongguo:/, "hguo:");
  if (s.indexOf("hguo:") === 0) s = s.slice(5);
  var parts = s.split(":");
  return { sid: t(parts[0]), vid: t(parts[1] || "") };
}

/** 详情页: 从 SSR JSON 提取 seriesDetail + vid_list */
function extractLink(v) {
  // Forward 不同版本可能传字符串或 {link}/{id} 对象
  if (v && typeof v === "object") return t(v.link || v.id || v.url || "");
  return t(v);
}

async function loadDetail(link) {
  var p = parseLink(extractLink(link));
  if (!p.sid) return null;
  var base = cfg({});
  var html = await httpText(base + "/detail" + qs({ series_id: p.sid }));
  var d = {};
  var mName = html.match(/"series_name":"([^"]*)"/);
  var mCover = html.match(/"series_cover":"([^"]*)"/);
  var mIntro = html.match(/"series_intro":"([\s\S]*?)","tags/);
  var mRight = html.match(/"episode_right_text":"([^"]*)"/);
  var mCnt = html.match(/"episode_cnt":(\d+)/);
  // vid_list 全集 ID（注意: 详情页 vid_list 顺序 ≠ 可播顺序, 播放时以实际可播为准）
  var vi = html.indexOf('"vid_list":[');
  var vids = [];
  if (vi >= 0) {
    var vj = html.indexOf("]", vi);
    vids = (html.substring(vi, vj + 1).match(/\d{15,25}/g) || []);
  }
  var mAcc = html.match(/"accessible_episode_cnt":(\d+)/);
  var accCnt = mAcc ? Number(mAcc[1]) : 3;
  var cover = absCover(base, mCover ? mCover[1] : "");
  var title = unesc(mName ? mName[1] : p.sid);
  var right = unesc(mRight ? mRight[1] : "");
  var episodeItems = [];
  var n = vids.length;
  for (var i = 0; i < n; i++) {
    var epLink = "hguo:" + p.sid + ":" + vids[i];
    var free = i < accCnt; // 网页端可播分集数
    episodeItems.push({
      id: epLink,
      type: "url",
      title: "第" + (i + 1) + "集" + (free ? "" : "🔒"),
      mediaType: "tv",
      seasonNumber: 1,
      episodeNumber: i + 1,
      link: epLink,
      videoUrl: "",
      playerType: "app"
    });
  }
  if (!n) {
    episodeItems.push({
      id: "hguo:" + p.sid + ":1", type: "url", title: "第1集",
      mediaType: "tv", seasonNumber: 1, episodeNumber: 1,
      link: "hguo:" + p.sid + ":1", videoUrl: "", playerType: "app"
    });
  }
  return {
    id: "hguo:" + p.sid,
    type: "url",
    title: title,
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: unesc(mIntro ? mIntro[1] : "") + (right ? "　" + right : ""),
    mediaType: "tv",
    link: "hguo:" + p.sid,
    episodeItems: episodeItems
  };
}

/** 播放: 抓 /player/<sid>[/<vid>] 的 SSR, 提取 main_url. vid 404 时回退 /player/<sid> */
async function loadResource(params) {
  params = params || {};
  var base = cfg(params);
  var p = parseLink(extractLink(params));
  if (!p.sid) return [];
  // 兼容: 若 Forward 只传了分集序号(数字)而非 vid, 也允许
  var html = "";
  if (p.vid) {
    html = await httpText(base + "/player/" + encodeURIComponent(p.sid) + "/" + encodeURIComponent(p.vid));
  }
  if (!html.match(/"main_url":"([^"]+)"/)) {
    // 回退: 站点自动选当前可播集
    html = await httpText(base + "/player/" + encodeURIComponent(p.sid));
  }
  var m = html.match(/"main_url":"([^"]+)"/);
  if (!m) return [];
  var url = unesc(m[1]);
  // 回退成功时尽量把实际播放的 vid 带回
  var mv = html.match(/"vid":"(\d{15,25})"/);
  var desc = "";
  if (!p.vid && mv) desc = "已自动跳到可播分集";
  return [{
    name: "红果短剧",
    description: desc,
    url: url,
    playerType: "app",
    customHeaders: {
      "User-Agent": "com.phoenix.read/71332",
      Referer: "https://novel.snssdk.com/"
    }
  }];
}
