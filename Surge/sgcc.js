/**
 * 网上国网 · Cookie / 签到数据抓取
 * Surge 专用增强版
 *
 * 用法：
 * 1. Surge 开启 MITM
 * 2. 添加本脚本为 http-request
 * 3. 打开「网上国网」App
 * 4. 进入「我的」/「积分签到」
 *
 * 保存：
 * sgcc_data
 * sgcc_signin
 */

const KEY_DATA = "sgcc_data";
const KEY_SIGNIN = "sgcc_signin";

const SIGNIN_PATH = "/osg-omgmt1042/member/m1/0103514";

const WANT = [
    "authorization",
    "t",
    "userid",
    "device_token",
    "appguid",
    "appguidnew",
    "devicetokentx",
    "devicetokentxtime",
    "wtoken",
    "appcode",
    "os",
    "version",
    "ip",
    "province",
    "language",
    "wsgwtype",
    "accessmethod",
    "user-agent"
];

function read(key) {
    try {
        return $persistentStore.read(key);
    } catch (e) {
        return null;
    }
}

function write(value, key) {
    try {
        return $persistentStore.write(value, key);
    } catch (e) {
        return false;
    }
}

function notify(title, subtitle, body) {
    try {
        $notification.post(title, subtitle, body);
    } catch (e) {}
}

function done() {
    $done();
}

(function () {

    if (typeof $request === "undefined") {
        notify(
            "网上国网",
            "脚本运行方式错误",
            "必须作为 http-request 脚本运行"
        );
        return done();
    }

    try {

        const url = $request.url || "";
        const headers = $request.headers || {};

        // =========================
        // 统一处理 Header 大小写
        // =========================

        const h = {};

        Object.keys(headers).forEach(function (key) {
            h[key.toLowerCase()] = headers[key];
        });

        // =========================
        // ① 抓签到请求体
        // =========================

        if (url.indexOf(SIGNIN_PATH) !== -1) {

            let body = $request.body || "";

            if (body) {

                try {

                    const obj = JSON.parse(body);

                    if (obj.data && obj.skey) {

                        const signin = {
                            data: obj.data,
                            skey: obj.skey,
                            path: SIGNIN_PATH
                        };

                        const success = write(
                            JSON.stringify(signin),
                            KEY_SIGNIN
                        );

                        if (success) {

                            notify(
                                "网上国网",
                                "签到请求抓取成功",
                                "sgcc_signin 已保存"
                            );

                            console.log(
                                "[SGCC] sgcc_signin 保存成功"
                            );

                        }

                    }

                } catch (e) {

                    console.log(
                        "[SGCC] 签到 body JSON 解析失败: " +
                        e.message
                    );

                }

            }

        }

        // =========================
        // ② 抓请求头
        // =========================

        const picked = {};

        WANT.forEach(function (key) {

            if (
                h[key] !== undefined &&
                h[key] !== null &&
                String(h[key]).length > 0
            ) {
                picked[key] = h[key];
            }

        });

        // =========================
        // 如果没有任何目标字段
        // =========================

        const count = Object.keys(picked).length;

        if (count === 0) {

            console.log(
                "[SGCC] 当前请求没有发现目标 Header"
            );

            return done();

        }

        // =========================
        // 判断是否是有效国网请求
        // =========================

        const hasIdentity =
            picked.t ||
            picked.userid ||
            picked.device_token ||
            picked.appguid ||
            picked.appguidnew;

        if (!hasIdentity) {

            console.log(
                "[SGCC] 找到 Header，但不是国网身份请求"
            );

            return done();

        }

        // =========================
        // 时间戳
        // =========================

        picked._ts = Date.now();

        // =========================
        // 防止重复写入
        // =========================

        let old = {};

        try {
            old = JSON.parse(read(KEY_DATA) || "{}");
        } catch (e) {
            old = {};
        }

        const oldT = old.t || "";
        const newT = picked.t || "";

        // =========================
        // 保存
        // =========================

        const success = write(
            JSON.stringify(picked),
            KEY_DATA
        );

        if (!success) {

            notify(
                "网上国网",
                "Cookie 保存失败",
                "Surge Persistent Store 写入失败"
            );

            return done();

        }

        console.log(
            "[SGCC] sgcc_data 保存成功"
        );

        console.log(
            "[SGCC] 捕获字段数量: " + count
        );

        // =========================
        // 新 Cookie 才通知
        // =========================

        if (newT && newT !== oldT) {

            const uid = picked.userid || "未知";

            notify(
                "网上国网 Cookie",
                "抓取成功",
                "userid: " +
                uid.substring(0, 6) +
                "…"
            );

        }

        done();

    } catch (e) {

        console.log(
            "[SGCC] ERROR: " +
            (e.message || String(e))
        );

        notify(
            "网上国网",
            "抓取异常",
            e.message || String(e)
        );

        done();

    }

})();