// @name 瓜子影视
// @description 瓜子视频源
// @version 2.4.4

const USER_AGENT = "LeanMirror/3 CFNetwork/3892.100.1 Darwin/27.0.0";
const PLAY_USER_AGENT = "AppleCoreMedia/1.0.0.24A5390f (iPhone; U; CPU OS 27_0 like Mac OS X; zh_cn)";
const LIB_CRYPTO_JS_LIST = [
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
  "https://unpkg.com/crypto-js@4.2.0/crypto-js.min.js",
  "https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js"
];
const LIB_JSENCRYPT_LIST = [
  "https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.3.2/jsencrypt.min.js",
  "https://unpkg.com/jsencrypt@3.3.2/bin/jsencrypt.min.js",
  "https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js"
];
const LIB_TIMEOUT = 3000;
const LIB_CACHE_PREFIX = "gxf.libcache.v1.";

const APP_CONFIG = {
  baseURL: "",
  baseURLs: [
    "https://api.8b42w67.com",
    "https://api.4pmyvfz.com",
    "https://sdapi.s3432pr.com",
    "https://sdapi.q5sn3gk.com",
    "https://apinew.qwepe.com"
  ],
  thirdPartyDomainURL: "https://raw.githubusercontent.com/tdopops/jiafeimao/main/0103/jfm-ios-prod.json",
  thirdPartyAes: { key: "m4nQCskrndxTCULX", iv: "92ilxgNlcweTTfvG" },
  versionCode: "2026033001",
  apiVersion: "3.0.5.0",
  productnumber: "1",
  platform: "2",
  packageName: "com.jfm202203",
  code: "GZ0520",
  requestAes: { key: "aaaabbbbccccdddd", iv: "1111222233334444" },
  requestPublicKey: "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWJafJAdhTPWMrNpbmlk672o06smRwxe1LoHjy2XbLRaKIXfQJWgJTBhLH4qUIPMmpnIKQYqjMLTrJhwG5Bwsd3/15YHdL7eWad7lpomF5doOQmmexK2+gSBHmCOhXeumhrOD63vx8ERepxR6UCxTi5b5fZmqMdbLk45IW39mn6wIDAQAB-----END PUBLIC KEY-----",
  responsePrivateKey: "-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQCM+iJdCeYFydG3DiFG0Ajr6IS0NENW1Bb2MSwrUdvLiI7nXHG+zZZuyqewVUPUPQRdEvhSMCyTKjjX9QajRJ1Uv+xVnsOmxEQQIhAIUa1dsXsN30nLGA+VuNHF7J1SE+Vh/46duR/0Q+Iq+3esSYlb3/PdN4wgK5ab+jKeR0JA2wIDAQABAoGAbst/CkPnRZFRgl5WhMKm4FDDSqTwb2MMELygjAMvjIxsUyRyOJR2r+gRViIMxtaVgViRVHaL8bTzK7ZkWxhn1LEM7RpWB1zjKFvXxE+dzxPrYY/Qw7dobzAAMyQhZ2+7PTO/plUYOxNgZPUzsvcoI44M3HRy1yFxGbF9z9LiMDECQQDTs5eXJnjEN1JmqbBotFw0III0/se/r0oDv4AvJdbxl64t64dZI2tS3BO7NL3OAOzf+WL14Pf2uADFDZz9kzHPAkEAqnn7TBlZXc6L70TnCaggMAN9C+2Iuik2Q2dePfTBI9IyJiC54k4G66iT+kQ5F6T4MGWf6jb7xUuUTk6AHck/NQJBALk+5oAh7v0rt5QUGkSUxjXq2GUNKLbn6Ok8sisPfnVrF8Qg3A+4+ZnI8A8ZSJkxoBUgwWKMWA5w1mOX1O7i1WsCQHV0qgHajUomnx9x18U9gz/Rh3yKYmPxNSPnunTxh4kIr+i5L5mOrRH9CkeqbbOuxBmES1PyIjHjSwFQ8NCU8ekCQQCwb4PirUbcqeHbjN0Nv6vm5pqsgJ29GhA9qiy2l+1Wb637STe9L2mEt7ImUd9FGy7k3Nnsn5eou/t2SV3OkGaU-----END RSA PRIVATE KEY-----",
  iosRequestSalt: "&ffddffujhjhgvdvdvdz4Y!s!2br",
  token: "",
  tokenId: "",
  deviceId: "",
  ip: "",
  lang: "zh_cn"
};

let __libsReady = false;
let __authPromise = null;
let __domainPromise = null;

// 兼容 Widget/WS-JS 运行环境：部分版本没有内置 safeArray。
function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (Array.isArray(value.list)) return value.list;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.data && value.data.list)) return value.data.list;
  if (Array.isArray(value.result)) return value.result;
  if (Array.isArray(value.result && value.result.list)) return value.result.list;
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.items)) return value.items;
  return [];
}
let __domainsReady = false;
let __activeDomainIndex = 0;
const DOMAIN_CACHE_TTL = 6 * 60 * 60 * 1000;
const PLAY_PROBE_CONCURRENCY = 1;
const PLAY_PROBE_TIMEOUT = 1200;
const VERIFY_PLAY_URL = false;
const API_TIMEOUT = 3500;
const AUTH_STORAGE_KEY = "gxf.auth.v2";
const DOMAIN_STORAGE_KEY = "gxf.domains.v2";
const MEDIA_BINDING_PREFIX = "gxf.media.v3.";
const __tmdbMovieDetailCache = {};
const __apiCache = new Map();
const API_CACHE_TTL = 30 * 60 * 1000;
const SEARCH_CACHE_TTL = 30 * 60 * 1000;
const DETAIL_CACHE_TTL = 30 * 60 * 1000;
const PLAY_DETAIL_CACHE_TTL = 10 * 60 * 1000;
function apiCacheKey(path, params = {}) {
  let body = "";
  try {
    body = JSON.stringify(params, Object.keys(params || {}).sort());
  } catch (_) {
    body = String(params || "");
  }
  return String(path || "") + "?" + body;
}

const __searchCache = new Map();
const __detailCache = new Map();
const __playDetailCache = new Map();

// ==================== 持久化极速缓存 v2.4 ====================
const PERSIST_CACHE_PREFIX = "gxf.playcache.v5.";
const PERSIST_VOD_TTL = 7 * 24 * 60 * 60 * 1000;
const PERSIST_PLAY_TTL = 8 * 60 * 1000;
const PERSIST_DETAIL_TTL = 20 * 60 * 1000;

function simpleCacheHash(text) {
  const s = String(text || "");
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 16777619);
    h2 ^= c + i; h2 = Math.imul(h2, 2246822519);
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

function persistKey(kind, key) {
  return PERSIST_CACHE_PREFIX + kind + "." + simpleCacheHash(key);
}

function persistGet(kind, key, ttl) {
  try {
    const raw = storageGet(persistKey(kind, key));
    if (!raw) return null;
    const obj = parseJSON(raw, null);
    if (!obj || !obj.savedAt) return null;
    if (Date.now() - Number(obj.savedAt) >= ttl) return null;
    return obj.value == null ? null : obj.value;
  } catch (_) { return null; }
}

function persistSet(kind, key, value) {
  try {
    storageSet(persistKey(kind, key), JSON.stringify({ savedAt: Date.now(), value }));
  } catch (_) {}
}

function playPersistKey(seriesName, type, season, episode) {
  return [cleanTitle(extractBaseName(seriesName)), type, Number(season || 1), Number(episode || 0)].join("|");
}

function vodPersistKey(seriesName, type, season) {
  return [cleanTitle(extractBaseName(seriesName)), type, Number(season || 1)].join("|");
}

function cachedResourceIsUsable(items) {
  return Array.isArray(items) && items.some(x => x && typeof x.url === 'string' && /^https?:\/\//i.test(x.url));
}


function fastCacheGet(map, key, ttl) {
  const hit = map.get(String(key));
  if (!hit) return null;
  if (Date.now() - hit.time >= ttl) { map.delete(String(key)); return null; }
  return hit.value;
}
function fastCacheSet(map, key, value, max = 40) {
  map.set(String(key), { time: Date.now(), value });
  if (map.size > max) map.delete(map.keys().next().value);
}

function libraryCacheGet(name) {
  try {
    const raw = storageGet(LIB_CACHE_PREFIX + name);
    if (!raw) return "";
    const obj = parseJSON(raw, null);
    if (!obj || !obj.code || !obj.savedAt) return "";
    // CDN 脚本本身有版本号，缓存 30 天足够；失败时仍会自动回源。
    if (Date.now() - Number(obj.savedAt) > 30 * 24 * 60 * 60 * 1000) return "";
    return String(obj.code || "");
  } catch (_) { return ""; }
}

function libraryCacheSet(name, code) {
  try {
    if (code && code.length > 1000) {
      storageSet(LIB_CACHE_PREFIX + name, JSON.stringify({ savedAt: Date.now(), code }));
    }
  } catch (_) {}
}

function evalLibraryCode(code, globalName) {
  if (!code || code.length < 1000) throw new Error("脚本内容为空");
  (0, eval)(code);
  const g = (typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));
  return !!(g && typeof g[globalName] !== "undefined");
}

async function loadExternalScript(url, globalName) {
  const resp = await Widget.http.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: LIB_TIMEOUT
  });
  const code = typeof resp.data === "string" ? resp.data : String(resp.data || "");
  if (!evalLibraryCode(code, globalName)) throw new Error(`${globalName}未成功加载`);
  return code;
}

async function loadLibrary(name, urls, globalName) {
  const g = (typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));
  if (g && typeof g[globalName] !== "undefined") return true;

  // 第一优先：本地缓存。这样第二次进入播放时不再等待 CDN。
  const cached = libraryCacheGet(globalName);
  if (cached) {
    try {
      if (evalLibraryCode(cached, globalName)) {
        logInfo(`${name}使用本地缓存`);
        return true;
      }
    } catch (_) {}
  }

  let lastError = null;
  for (const url of urls) {
    try {
      logInfo(`加载${name}: ${url}`);
      const code = await loadExternalScript(url, globalName);
      libraryCacheSet(globalName, code);
      return true;
    } catch (e) {
      lastError = e;
      logInfo(`${name}加载失败，切换备用源`);
    }
  }
  throw new Error(`${name}加载失败: ${String(lastError || "unknown")}`);
}

async function ensureLibs() {
  if (__libsReady && typeof CryptoJS !== "undefined" && typeof JSEncrypt !== "undefined") return;
  const g = (function () {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    return this;
  })();
  if (!g.window) g.window = g;
  if (!g.self) g.self = g;
  if (!g.global) g.global = g;
  if (!g.navigator) g.navigator = { appName: "Netscape", userAgent: USER_AGENT };

  // 两个库互不依赖，允许同时加载；真正的 API 请求仍保持串行，避免 Widget Runtime 被并发请求回收。
  const jobs = [];
  if (typeof CryptoJS === "undefined") jobs.push(loadLibrary("CryptoJS", LIB_CRYPTO_JS_LIST, "CryptoJS"));
  if (typeof JSEncrypt === "undefined") jobs.push(loadLibrary("JSEncrypt", LIB_JSENCRYPT_LIST, "JSEncrypt"));
  if (jobs.length) await Promise.all(jobs);
  if (typeof CryptoJS === "undefined") throw new Error("CryptoJS 加载失败");
  if (typeof JSEncrypt === "undefined") throw new Error("JSEncrypt 加载失败");
  __libsReady = true;
}
function buildHeaders(extra = {}) {
  return Object.assign({
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Version": APP_CONFIG.versionCode,
    "api-ver": APP_CONFIG.apiVersion,
    "packagename": APP_CONFIG.packageName,
    "code": APP_CONFIG.code,
    "ver": APP_CONFIG.apiVersion,
    "deviceid": APP_CONFIG.deviceId,
    "ip": APP_CONFIG.ip,
    "lang": APP_CONFIG.lang,
    "x-customer-client-ip": "",
    "User-Agent": USER_AGENT,
    "parent-code": ""
  }, extra);
}

function aesEncryptHex(text, keyStr, ivStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);
  const data = CryptoJS.enc.Utf8.parse(text);
  return CryptoJS.AES.encrypt(data, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).ciphertext.toString();
}

function aesDecryptHex(cipherHex, keyStr, ivStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);
  return CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(cipherHex) }, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
}

function rsaEncryptBase64(text, publicKey) {
  const js = new JSEncrypt();
  js.setPublicKey(publicKey);
  return js.encrypt(text);
}

function rsaDecryptBase64(text, privateKey) {
  const js = new JSEncrypt();
  js.setPrivateKey(privateKey);
  return js.decrypt(text);
}

function buildRequestBody(params = {}) {
  const ts = Math.floor(Date.now() / 1000);
  const requestKey = aesEncryptHex(JSON.stringify(params), APP_CONFIG.requestAes.key, APP_CONFIG.requestAes.iv);
  const keys = rsaEncryptBase64(JSON.stringify(APP_CONFIG.requestAes), APP_CONFIG.requestPublicKey);
  const signBase = "token_id=" + APP_CONFIG.tokenId + ",token=" + APP_CONFIG.token + ",phone_type=" + APP_CONFIG.platform + ",request_key=" + requestKey + ",app_id=" + APP_CONFIG.productnumber + ",time=" + String(ts) + ",keys=" + keys;
  const signature = CryptoJS.MD5(signBase + "*" + APP_CONFIG.iosRequestSalt).toString().toUpperCase();
  return { token: APP_CONFIG.token, token_id: APP_CONFIG.tokenId, time: ts, app_id: APP_CONFIG.productnumber, phone_type: APP_CONFIG.platform, keys, request_key: requestKey, signature, ad_version: 1 };
}

function decryptResponse(responseData) {
  const aesInfo = JSON.parse(rsaDecryptBase64(responseData.keys, APP_CONFIG.responsePrivateKey));
  return JSON.parse(aesDecryptHex(responseData.response_key, aesInfo.key, aesInfo.iv));
}

function storageGet(key) {
  try { return Widget.storage && Widget.storage.get ? Widget.storage.get(key) : null; } catch (e) { return null; }
}

function storageSet(key, value) {
  try { if (Widget.storage && Widget.storage.set) Widget.storage.set(key, value); } catch (e) {}
}

function mediaBindingKey(mediaType, tmdbId) {
  const type = normalizeMediaType(mediaType);
  const id = String(tmdbId || "").trim();
  return type && id ? MEDIA_BINDING_PREFIX + type + "." + id : "";
}

function saveMediaBinding(mediaType, tmdbId, item) {
  const key = mediaBindingKey(mediaType, tmdbId);
  if (!key || !item || !item.vod_id) return;
  storageSet(key, JSON.stringify({
    vodId: String(item.vod_id),
    title: String(item.title || item.vod_name || ""),
    year: String(item.vod_year || "").slice(0, 4),
    area: String(item.vod_area || item.area || ""),
    category: mediaType === "movie" ? "movie" : "tv",
    updatedAt: Date.now()
  }));
}

function loadMediaBinding(mediaType, tmdbId) {
  const key = mediaBindingKey(mediaType, tmdbId);
  return key ? parseJSON(storageGet(key), null) : null;
}

async function getTmdbMovieContext(tmdbId) {
  const id = String(tmdbId || "").replace(/^movie\./i, "").trim();
  if (!/^\d+$/.test(id)) return null;
  if (!__tmdbMovieDetailCache[id]) {
    __tmdbMovieDetailCache[id] = Widget.tmdb.get("movie/" + id, { params: { language: "zh-CN", append_to_response: "credits" } }).catch(() => null);
  }
  const data = await __tmdbMovieDetailCache[id];
  if (!data || !data.id) return null;
  return {
    tmdbId: String(data.id),
    title: cleanText(data.title || data.original_title || ""),
    originalTitle: cleanText(data.original_title || ""),
    releaseDate: String(data.release_date || ""),
    year: String(data.release_date || "").slice(0, 4),
    actors: safeArray(data.credits && data.credits.cast).slice(0, 8).map(x => x && x.name).filter(Boolean).join("/")
  };
}

function parseJSON(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (e) { return fallback; }
}

function randomHex(size) {
  const chars = "0123456789ABCDEF";
  let out = "";
  for (let i = 0; i < size; i++) out += chars.charAt(Math.floor(Math.random() * 16));
  return out;
}

function createDeviceId() {
  return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${"89AB".charAt(Math.floor(Math.random() * 4))}${randomHex(3)}-${randomHex(12)}`;
}

function normalizeBaseURL(value) {
  const url = String(value || "").trim().replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(url) ? url : "";
}

function uniqueBaseURLs(values) {
  const out = [];
  for (const value of values || []) {
    const url = normalizeBaseURL(value);
    if (url && out.indexOf(url) < 0) out.push(url);
  }
  return out;
}

async function getPublicIP() {
  try {
    const response = await Widget.http.get("https://api.ipify.org/?format=json", { headers: { "User-Agent": USER_AGENT } });
    const data = parseJSON(response && response.data, {});
    return String(data && data.ip || "");
  } catch (e) {
    return "";
  }
}

async function loadRemoteDomains() {
  try {
    const response = await Widget.http.get(APP_CONFIG.thirdPartyDomainURL, { headers: { "User-Agent": USER_AGENT } });
    const root = parseJSON(response && response.data, null);
    const encrypted = root && root.code === 200 && root.data && root.data.response_key;
    if (!encrypted) return [];
    const text = aesDecryptHex(encrypted, APP_CONFIG.thirdPartyAes.key, APP_CONFIG.thirdPartyAes.iv);
    return uniqueBaseURLs(parseJSON(text, {}).list || []);
  } catch (e) {
    return [];
  }
}

async function initializeDomains(force = false) {
  if (__domainsReady && !force && APP_CONFIG.baseURL) return APP_CONFIG.baseURL;
  if (__domainPromise) return __domainPromise;
  __domainPromise = (async () => {
    const cached = parseJSON(storageGet(DOMAIN_STORAGE_KEY), {});
    const cachedList = uniqueBaseURLs(cached && cached.list || []);
    APP_CONFIG.baseURLs = uniqueBaseURLs([cached && cached.active || ""].concat(cachedList, APP_CONFIG.baseURLs));
    APP_CONFIG.baseURL = (cached && cached.active && normalizeBaseURL(cached.active)) || APP_CONFIG.baseURLs[0] || "";
    __activeDomainIndex = Math.max(0, APP_CONFIG.baseURLs.indexOf(APP_CONFIG.baseURL));
    if (!APP_CONFIG.baseURL) throw new Error("瓜子 API 域名不可用");
    __domainsReady = true;
    return APP_CONFIG.baseURL;
  })();
  try { return await __domainPromise; } finally { __domainPromise = null; }
}

function loadStoredAuth() {
  const auth = parseJSON(storageGet(AUTH_STORAGE_KEY), {});
  if (!auth || !auth.deviceId || !auth.token) return false;
  APP_CONFIG.deviceId = String(auth.deviceId);
  APP_CONFIG.token = String(auth.token);
  APP_CONFIG.tokenId = String(auth.tokenId || "");
  APP_CONFIG.ip = String(auth.ip || "");
  return true;
}

function saveAuth() {
  storageSet(AUTH_STORAGE_KEY, JSON.stringify({
    deviceId: APP_CONFIG.deviceId,
    token: APP_CONFIG.token,
    tokenId: APP_CONFIG.tokenId,
    ip: APP_CONFIG.ip,
    updatedAt: Date.now()
  }));
}

async function rawPrivatePost(path, params = {}, baseURL = "") {
  const url = normalizeBaseURL(baseURL || APP_CONFIG.baseURL);
  if (!url) throw new Error("瓜子 API 域名为空");
  const response = await Widget.http.post(url + path, buildRequestBody(params), { headers: buildHeaders(), timeout: API_TIMEOUT });
  const root = parseJSON(response && response.data, null);
  if (!root) throw new Error("瓜子 API 响应格式异常");
  let data = root.data;
  if (data && data.response_key && data.keys) data = decryptResponse(data);
  return { root, data };
}

async function authenticate(force = false) {
  if (__authPromise) return __authPromise;
  __authPromise = (async () => {
    if (!force && !APP_CONFIG.token) loadStoredAuth();
    if (!APP_CONFIG.deviceId) APP_CONFIG.deviceId = createDeviceId();
    // 已有持久化 token 时无需再请求公网 IP；只有真正重新注册/鉴权时才取 IP。
    const hadToken = !!APP_CONFIG.token;
    await ensureLibs();
    await initializeDomains(false);
    if (!APP_CONFIG.ip && !hadToken) APP_CONFIG.ip = await getPublicIP();
    const payload = { new_key: APP_CONFIG.deviceId, old_key: APP_CONFIG.deviceId };
    APP_CONFIG.token = "";
    APP_CONFIG.tokenId = "";
    let lastError = null;
    const total = Math.max(1, APP_CONFIG.baseURLs.length);
    for (let attempt = 0; attempt < total; attempt++) {
      const index = (__activeDomainIndex + attempt) % total;
      const baseURL = APP_CONFIG.baseURLs[index];
      APP_CONFIG.baseURL = baseURL;
      try {
        let result = await rawPrivatePost("/App/Authentication/Device/signIn", payload, baseURL);
        if (!result.root || result.root.code !== 200 || !result.data || !result.data.token) {
          result = await rawPrivatePost("/App/Authentication/Device/signUp", payload, baseURL);
        }
        if (!result.root || result.root.code !== 200 || !result.data || !result.data.token) {
          throw new Error((result.root && result.root.msg) || "瓜子设备鉴权失败");
        }
        APP_CONFIG.token = String(result.data.token);
        APP_CONFIG.tokenId = String(result.data.token_id || "");
        __activeDomainIndex = index;
        saveAuth();
        return true;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("瓜子设备鉴权失败");
  })();
  try { return await __authPromise; } finally { __authPromise = null; }
}

function shouldReauthenticate(root) {
  const code = Number(root && root.code || 0);
  const msg = String(root && root.msg || "");
  return code === 401 || code === 403 || code === 451 || /token|登录|鉴权|认证|设备.*不存在|过期/i.test(msg);
}

function shouldRotateDomain(error, root) {
  if (error) return true;
  const code = Number(root && root.code || 0);
  return code === 502 || code === 503 || code === 504 || code === 404;
}

async function privatePost(path, params = {}) {
  await ensureLibs();
  await initializeDomains(false);
  if (!APP_CONFIG.token) loadStoredAuth();
  if (!APP_CONFIG.token) await authenticate(false);

  let lastError = null;
  const total = Math.max(1, APP_CONFIG.baseURLs.length);
  for (let attempt = 0; attempt < total; attempt++) {
    const index = (__activeDomainIndex + attempt) % total;
    const baseURL = APP_CONFIG.baseURLs[index];
    APP_CONFIG.baseURL = baseURL;
    try {
      let result = await rawPrivatePost(path, params, baseURL);
      if (shouldReauthenticate(result.root)) {
        await authenticate(true);
        result = await rawPrivatePost(path, params, APP_CONFIG.baseURL);
      }
      if (result.root && Number(result.root.code) === 200) {
        __activeDomainIndex = index;
        return result.data != null ? result.data : result.root;
      }
      const e = new Error((result.root && result.root.msg) || '瓜子 API 请求失败');
      if (shouldReauthenticate(result.root)) break;
      lastError = e;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('瓜子 API 全部域名请求失败');
}

async function privatePostCached(path, params = {}) {
  const key = apiCacheKey(path, params);
  const now = Date.now();
  const hit = __apiCache.get(key);
  if (hit && now - hit.time < API_CACHE_TTL) return hit.value;
  const value = await privatePost(path, params);
  __apiCache.set(key, { time: now, value });
  if (__apiCache.size > 30) {
    const first = __apiCache.keys().next().value;
    __apiCache.delete(first);
  }
  return value;
}



// ==================== 工具函数 ====================
function logInfo(message, data = null) {
  if (data !== null && data !== undefined) {
    try { console.log(`[瓜子] ${message}:`, JSON.stringify(data)); } catch (e) { console.log(`[瓜子] ${message}`); }
  } else console.log(`[瓜子] ${message}`);
}
function logError(message, error = null) {
  console.error(`[瓜子] ${message}:`, error && (error.message || error) || '');
}
function cleanTitle(title) {
  if (!title) return '';
  return String(title).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
}
function extractBaseName(title) {
  if (!title) return '';
  return String(title)
    .replace(/[\(\[（【][^\)\]）】]*[\)\]）】]/g, '')
    .replace(/第\s*[0-9一二三四五六七八九十百]+\s*[季部]/gi, '')
    .replace(/\bS(?:eason)?\s*\d{1,3}\b/gi, '')
    .trim();
}
function chineseNumberToInt(text) {
  const s = String(text || '').trim();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const map = { '零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9 };
  if (s === '十') return 10;
  if (s.length === 2 && s[0] === '十' && map[s[1]] != null) return 10 + map[s[1]];
  if (s.length === 2 && map[s[0]] != null && s[1] === '十') return map[s[0]] * 10;
  if (s.length === 3 && map[s[0]] != null && s[1] === '十' && map[s[2]] != null) return map[s[0]] * 10 + map[s[2]];
  return map[s] != null ? map[s] : 0;
}
function extractSeason(text) {
  const s = String(text || '');
  let m = s.match(/(?:第\s*([0-9一二两三四五六七八九十百]+)\s*[季部])/i);
  if (m) return chineseNumberToInt(m[1]);
  m = s.match(/\bS(?:eason)?\s*([0-9]{1,3})\b/i);
  if (m) return parseInt(m[1], 10);
  m = s.match(/\b([0-9]{1,3})\s*[季部]\b/i);
  if (m) return parseInt(m[1], 10);
  return 0;
}
function extractEpisode(text) {
  const s = String(text || '');
  let m = s.match(/\bS\s*\d{1,3}\s*E\s*(\d{1,4})\b/i);
  if (m) return parseInt(m[1], 10);
  m = s.match(/(?:第\s*([0-9一二两三四五六七八九十百]+)\s*[集话期])/i);
  if (m) return chineseNumberToInt(m[1]);
  m = s.match(/\bEP?\s*[-_.]?\s*(\d{1,4})\b/i);
  if (m) return parseInt(m[1], 10);
  return 0;
}
function calculateMatchScore(seriesName, item) {
  const want = cleanTitle(extractBaseName(seriesName));
  const gotRaw = String(item && (item.vod_name || item.title || item.name) || '');
  const got = cleanTitle(extractBaseName(gotRaw));
  if (!want || !got) return -100000000;
  if (got === want) return 1000;
  let score = 0;
  if (got.indexOf(want) >= 0) score += 650;
  else if (want.indexOf(got) >= 0) score += 450;
  else {
    const compactWant = want.replace(/第[一二两三四五六七八九十百0-9]+[季部]/g, '');
    const compactGot = got.replace(/第[一二两三四五六七八九十百0-9]+[季部]/g, '');
    if (compactWant && compactWant === compactGot) score += 500;
    else return -100000000;
  }
  const ws = extractSeason(seriesName);
  const gs = extractSeason(gotRaw);
  if (ws > 0 && gs === ws) score += 180;
  else if (ws > 1 && gs > 0 && gs !== ws) score -= 180;
  if (item && item.vod_year) score += 5;
  return score;
}

function buildQueryString(params) {
  return Object.keys(params || {}).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
}

// ==================== 瓜子搜索层（对应荐片 searchVod） ====================
async function searchVod(wd) {
  const cacheKey = String(wd || '').trim();
  const cached = fastCacheGet(__searchCache, cacheKey, SEARCH_CACHE_TTL);
  if (cached) { logInfo(`搜索内存缓存命中: ${cacheKey}`); return cached; }
  const persisted = persistGet('search', cacheKey, 30 * 60 * 1000);
  if (persisted && Array.isArray(persisted.list)) {
    logInfo(`搜索持久缓存命中: ${cacheKey}`);
    fastCacheSet(__searchCache, cacheKey, persisted, 40);
    return persisted;
  }
  try {
    const keyword = String(wd || '').trim();
    if (!keyword) return { list: [] };

    const data = await privatePost('/App/Index/findMoreVod', {
      keywords: keyword,
      order_val: ''
    });

    // 瓜子接口正常返回 data.list；兼容少数版本直接返回数组/嵌套 data.list。
    let rawList = [];
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data?.list)) rawList = data.list;
    else if (Array.isArray(data?.data?.list)) rawList = data.data.list;
    else if (Array.isArray(data?.data)) rawList = data.data;

    const list = rawList.filter(i => i && (i.vod_id != null || i.id != null)).map(i => ({
      vod_id: String(i.vod_id ?? i.id),
      vod_name: String(i.vod_name ?? i.title ?? i.name ?? '').trim(),
      vod_pic: i.vod_pic || i.pic || i.pre_video_pic || i.tvimg || '',
      vod_remarks: i.vod_remarks || i.new_continue || i.mask || '',
      vod_year: i.vod_year || i.year || '',
      vod_area: i.vod_area || i.area || '',
      vod_actor: i.vod_actor || i.actor || '',
      vod_continu: i.vod_continu || i.d_total || i.vod_total || i.total || 0,
      t_id: i.t_id || i.type_id || ''
    })).filter(i => i.vod_id && i.vod_name);

    logInfo(`搜索 "${keyword}" 找到 ${list.length} 条结果`);
    if (list.length) logInfo('首个结果', list[0].vod_name);
    return (() => { const out = { list }; fastCacheSet(__searchCache, cacheKey, out); persistSet('search', cacheKey, out); return out; })();
  } catch (e) {
    logError(`搜索失败: ${String(wd || '')}`, e);
    return { list: [] };
  }
}

// ==================== 瓜子详情层（对应荐片 getDetail） ====================
async function getDetail(vodId) {
  const key = String(vodId || '');
  const mem = fastCacheGet(__detailCache, key, DETAIL_CACHE_TTL);
  if (mem) { logInfo(`详情内存缓存命中: ${key}`); return mem; }
  const persisted = persistGet('detail', key, PERSIST_DETAIL_TTL);
  if (persisted) {
    logInfo(`详情持久缓存命中: ${key}`);
    fastCacheSet(__detailCache, key, persisted, 30);
    return persisted;
  }
  try {
    const data = await privatePostCached('/App/Resource/Vurl/show', { vod_d_id: key, vurl_cloud_id: '2' });
    if (!data) return null;
    fastCacheSet(__detailCache, key, data, 30);
    persistSet('detail', key, data);
    return data;
  } catch (e) {
    logError('获取详情失败', e);
    return null;
  }
}

const GXF_FAKE_HOST_RE = /xn--55qx2ai23bz99b|xn--fiqs8s|wanglaoshi|(^|\.)(\u529e\u516c\u9694\u65ad)\.cn|(^|\.)(\u7f51\u8001\u5e08)/i;

function isFakePlayUrl(url) {
  const u = String(url || '');
  if (!u) return true;
  return GXF_FAKE_HOST_RE.test(u);
}

async function extractPlayInfo(detail, vodName, targetEpNum, vodId, type, seasonNum) {
  const list = safeArray(detail);
  if (!list.length) {
    logInfo(`Vurl/show 未找到分集列表（原始类型=${typeof detail}）`);
    return [];
  }

  const ep = type === 'movie' ? (list[0] || null) : (() => {
    for (const x of list) {
      const n = extractEpisode(x.title || x.name || x.source_name || x.vod_name || '');
      if (n === targetEpNum) return x;
    }
    for (const x of list) if (Number(x.sort || x.episode || x.episode_num || 0) === targetEpNum) return x;
    return null;
  })();
  if (!ep) {
    logInfo(`未匹配到第 ${targetEpNum} 集，分集数=${list.length}`);
    return [];
  }

  const epId = ep.id ?? ep.vurl_id ?? ep.vod_id ?? ep.url_id;
  if (epId == null || epId === '') {
    logInfo('分集对象缺少 vurl id');
    return [];
  }

  const detailCacheKey = String(epId);
  let rawDetails = persistGet('vdetail', detailCacheKey, PERSIST_DETAIL_TTL);
  if (rawDetails) {
    logInfo(`vurlDetail 持久缓存命中: ${detailCacheKey}`);
  } else {
    rawDetails = await privatePost('/App/Resource/Vod/vurlDetail', { vurl_id: epId });
    persistSet('vdetail', detailCacheKey, rawDetails);
  }
  const details = safeArray(rawDetails);
  logInfo(`vurlDetail 返回 ${details.length} 个地址`);
  if (!details.length) return [];

  const valid = [];
  for (const x of details) {
    if (!x) continue;
    const url = String(x.url || x.play_url || x.playUrl || x.vurl || x.file || '').trim();
    if (!url || isFakePlayUrl(url)) continue;
    valid.push(Object.assign({}, x, { url }));
  }
  if (!valid.length) {
    logInfo('vurlDetail 有数据，但没有可用播放地址');
    return [];
  }

  valid.sort((a,b) => Number(b.resolution || b.height || 0) - Number(a.resolution || a.height || 0));
  const item = valid[0];
  const label = type === 'tv' && seasonNum > 0 && targetEpNum > 0 ? ` S${seasonNum}E${targetEpNum}` : ' 正片';
  return [{
    id: `${vodId}_${targetEpNum || 'movie'}_${Date.now()}`,
    name: `瓜子影视${label}`,
    type: type === 'movie' ? 'movie' : 'tv',
    description: vodName,
    url: item.url,
    customHeaders: { 'User-Agent': PLAY_USER_AGENT },
    headers: { 'User-Agent': PLAY_USER_AGENT }
  }];
}


// ==================== 同名候选线路筛选优化 ====================
// 规则：
// 1. 只以第一个成功候选的真实名称作为基准。
// 2. 后续候选名称与第一个相同：全部保留，并显示各自真实名称。
// 3. 后续候选名称不同：不显示，只保留第一个候选。
// 4. 不添加“候选1/2/3”等编号。
function normalizeCandidateName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[\s·•・:：\-–—_!！?？.,，。、\"'`~()（）\[\]【】]/g, '')
    .trim();
}

function filterSameNameResources(resources) {
  if (!Array.isArray(resources) || resources.length <= 1) return resources || [];

  const first = resources[0];
  const firstName = normalizeCandidateName(first && (first.__candidateTitle || first.name || first.title));
  if (!firstName) return [first];

  const result = [first];
  for (let i = 1; i < resources.length; i++) {
    const item = resources[i];
    const name = normalizeCandidateName(item && (item.__candidateTitle || item.name || item.title));
    if (name && name === firstName) result.push(item);
  }
  return result;
}

// ==================== 统一入口（结构与荐片影院一致） ====================
async function loadResource(params = {}) {
  const seriesName = params.seriesName || params.title || params.name || params.keyword || '';
  const type = params.type === 'movie' ? 'movie' : 'tv';
  const episode = params.episode ? parseInt(params.episode, 10) : (params.episodeNumber ? parseInt(params.episodeNumber, 10) : extractEpisode(params.episodeName || ''));
  const season = params.season ? parseInt(params.season, 10) : (extractSeason(seriesName) || extractSeason(params.title || '') || 1);
  const year = params.premiereDate || params.releaseDate || '';
  logInfo(`被动触发 - 搜索: ${seriesName}, 类型: ${type}, 季: ${season}, 集: ${episode}`);
  if (!seriesName) return [];
  const searchKeyword = extractBaseName(seriesName);
  if (!searchKeyword) return [];

  const playKey = playPersistKey(seriesName, type, season, episode);
  if (episode > 0 || type === 'movie') {
    const persistedPlay = persistGet('play', playKey, PERSIST_PLAY_TTL);
    if (cachedResourceIsUsable(persistedPlay)) {
      logInfo(`播放地址持久缓存命中: S${season}E${episode || 'movie'}`);
      return persistedPlay;
    }
  }

  const persistedVodId = persistGet('vod', vodPersistKey(seriesName, type, season), PERSIST_VOD_TTL);
  let searchResult = await searchVod(searchKeyword);
  if (!searchResult.list.length) {
    logInfo(`搜索"${searchKeyword}"无结果`);
    return [];
  }

  let candidates = safeArray(searchResult.list).map((item, index) => {
    let score = calculateMatchScore(seriesName, item);
    const name = String(item.vod_name || item.title || '');
    const base = cleanTitle(extractBaseName(name));
    const wantBase = cleanTitle(extractBaseName(seriesName));
    const itemSeason = extractSeason(name);
    if (base && wantBase && base === wantBase) score += 100;
    if (type !== 'movie') {
      if (season > 1 && itemSeason === season) score += 150;
      else if (season > 1 && itemSeason && itemSeason !== season) score -= 150;
      else if (season === 1 && (!itemSeason || itemSeason === 1)) score += 60;
    }
    return { item, score, index };
  }).filter(x => x.item && x.item.vod_id != null).sort((a, b) => b.score - a.score);

  if (type !== 'movie' && season > 1) {
    const retry = await searchVod(`${searchKeyword} 第${season}季`);
    if (retry.list.length) {
      const seenIds = new Set(candidates.map(x => String(x.item.vod_id)));
      for (const item of retry.list) {
        if (seenIds.has(String(item.vod_id))) continue;
        let score = calculateMatchScore(seriesName, item) + 40;
        const name = String(item.vod_name || item.title || '');
        if (extractSeason(name) === season) score += 150;
        candidates.push({ item, score, index: candidates.length });
        seenIds.add(String(item.vod_id));
      }
      candidates.sort((a, b) => b.score - a.score);
    }
  }

  // 上次成功的 vod_id 优先：避免同名资源每次从头尝试。
  if (persistedVodId) {
    const idx = candidates.findIndex(x => String(x.item && x.item.vod_id) === String(persistedVodId));
    if (idx > 0) {
      const hit = candidates.splice(idx, 1)[0];
      candidates.unshift(hit);
      logInfo(`命中上次成功资源: ${persistedVodId}`);
    }
  }

  // 并发极速版：只检查前 2 个匹配候选，并让两个候选同时执行详情 + 播放地址检查。
  // 每个候选单独捕获异常，避免其中一个失败导致另一个结果一起丢失。
  const maxCandidates = 2;
  const checked = [];
  const allResources = [];
  const candidateList = candidates.slice(0, maxCandidates);

  const candidateResults = await Promise.all(candidateList.map(async (candidate, index) => {
    const item = candidate.item;
    const candidateNo = index + 1;
    logInfo(`并发候选 ${candidateNo}: ${item.vod_name || item.title || ''} (${item.vod_id}) score=${candidate.score}`);

    try {
      const vodId = item.vod_id;
      const detail = await getDetail(vodId);
      if (!detail) {
        return { index, item, reason: '详情为空', resources: [] };
      }

      const realTitle = detail.title || detail.vod_name || item.vod_name || item.title || seriesName;
      const resources = await extractPlayInfo(detail, realTitle, episode, vodId, type, season);
      const mapped = [];

      for (const resource of resources) {
        if (!resource || !resource.url) continue;
        const candidateTitle = String(realTitle || item.vod_name || item.title || seriesName || '').trim();
        const routeName = type === 'tv' && season > 0 && episode > 0
          ? `${candidateTitle} S${season}E${episode}`
          : candidateTitle;
        mapped.push(Object.assign({}, resource, {
          id: `GuaZiYingShi_${vodId}_${season || 1}_${episode || 'movie'}_C${candidateNo}`,
          name: routeName,
          title: routeName,
          description: String(realTitle || candidateTitle),
          __candidateTitle: candidateTitle
        }));
      }

      return {
        index,
        item,
        reason: mapped.length ? '已找到播放地址' : '没有目标集或没有播放地址',
        resources: mapped
      };
    } catch (e) {
      logInfo(`候选 ${candidateNo} 检查失败: ${String(e && e.message || e)}`);
      return { index, item, reason: '检查异常', resources: [] };
    }
  }));

  // 保持候选原顺序，确保“同名候选全部保留、不同名只保留第一个”的规则不变。
  candidateResults.sort((a, b) => a.index - b.index);
  for (const result of candidateResults) {
    checked.push({ item: result.item, reason: result.reason });
    allResources.push(...result.resources);
  }

  // 只保留与第一个成功候选同名的候选；不同名称只保留第一个。
  const selectedResources = filterSameNameResources(allResources);

  const seen = new Set();
  const unique = selectedResources.filter(r => {
    const key = String(r.url || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length) {
    const successfulVod = checked.findIndex(x => x.reason === '已找到播放地址');
    if (successfulVod >= 0) {
      const successfulItem = checked[successfulVod].item;
      persistSet('vod', vodPersistKey(seriesName, type, season), String(successfulItem.vod_id));
    }
    logInfo(`前 ${maxCandidates} 个候选已检查，最终返回 ${unique.length} 条瓜子线路`);
    const cleanResources = unique.map(r => {
      const item = Object.assign({}, r);
      delete item.__candidateTitle;
      return item;
    });
    persistSet('play', playKey, cleanResources);
    logInfo('已写入同名候选线路缓存');
    return cleanResources;
  }

  logInfo(`前 ${maxCandidates} 个候选均未找到第${episode || 1}集，共检查 ${checked.length} 个资源`);
  return [];
}

WidgetMetadata = {
  id: 'GuaZiYingShi',
  title: '瓜子影视',
  icon: '',
  version: '2.4.4',
  requiredVersion: '0.0.1',
  description: '瓜子视频源 - 前2候选极速版，带本地加密库缓存、匹配函数、播放地址过滤与前3候选线路聚合，线路显示候选实际名称',
  author: 'ChatGpt',
  globalParams: [],
  modules: [{ id: 'loadResource', title: '加载瓜子资源', functionName: 'loadResource', type: 'stream', params: [] }]
};