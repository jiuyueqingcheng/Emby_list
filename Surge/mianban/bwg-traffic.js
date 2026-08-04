/*
 * BandwagonHost / KiwiVM Traffic Panel
 * Surge iOS
 *
 * 参数：
 * veid   = 搬瓦工 VEID
 * apikey = KiwiVM API Key
 * title  = 面板标题
 */

const args = parseArgs($argument);

const veid = args.veid || "";
const apiKey = args.apikey || "";
const title = args.title || "Bandwagon VPS";

if (!veid || !apiKey) {
    $done({
        title: title,
        content: "❌ 未配置 VEID 或 API Key",
        icon: "exclamationmark.triangle.fill",
        "icon-color": "#FF9500"
    });
} else {
    const url =
        "https://api.64clouds.com/v1/getServiceInfo" +
        "?veid=" + encodeURIComponent(veid) +
        "&api_key=" + encodeURIComponent(apiKey);

    $httpClient.get(
        {
            url: url,
            timeout: 10
        },
        function (error, response, data) {

            if (error) {
                $done({
                    title: title,
                    content: "❌ API 请求失败\n" + error,
                    icon: "wifi.exclamationmark",
                    "icon-color": "#FF3B30"
                });
                return;
            }

            if (!data) {
                $done({
                    title: title,
                    content: "❌ API 返回为空",
                    icon: "exclamationmark.triangle.fill",
                    "icon-color": "#FF3B30"
                });
                return;
            }

            let info;

            try {
                info = JSON.parse(data);
            } catch (e) {
                $done({
                    title: title,
                    content: "❌ API 返回数据解析失败",
                    icon: "exclamationmark.triangle.fill",
                    "icon-color": "#FF3B30"
                });
                return;
            }

            // KiwiVM API 错误
            if (Number(info.error || 0) !== 0) {
                $done({
                    title: title,
                    content:
                        "❌ API 错误\n" +
                        (info.message || ("Error " + info.error)),
                    icon: "exclamationmark.triangle.fill",
                    "icon-color": "#FF3B30"
                });
                return;
            }

            const planMonthlyData = Number(info.plan_monthly_data || 0);
            const dataCounter = Number(info.data_counter || 0);
            const multiplier = Number(info.monthly_data_multiplier || 1);

            /*
             * KiwiVM：
             * 实际已用流量 = data_counter × monthly_data_multiplier
             * 总流量 = plan_monthly_data
             */

            const totalBytes = planMonthlyData;
            const usedBytes = dataCounter * multiplier;

            let remainingBytes = totalBytes - usedBytes;

            if (remainingBytes < 0) {
                remainingBytes = 0;
            }

            const usedPercent =
                totalBytes > 0
                    ? (usedBytes / totalBytes * 100)
                    : 0;

            const remainingPercent =
                totalBytes > 0
                    ? (remainingBytes / totalBytes * 100)
                    : 0;

            const used = formatBytes(usedBytes);
            const total = formatBytes(totalBytes);
            const remaining = formatBytes(remainingBytes);

            const resetTime = info.data_next_reset
                ? formatDate(Number(info.data_next_reset) * 1000)
                : "未知";

            const hostname =
                info.hostname ||
                info.plan ||
                "VPS";

            /*
             * 根据剩余流量选择图标颜色
             */
            let iconColor = "#34C759";

            if (remainingPercent <= 10) {
                iconColor = "#FF3B30";
            } else if (remainingPercent <= 30) {
                iconColor = "#FF9500";
            }

            /*
             * Surge Panel
             */
            const content =
                "剩余流量  " + remaining + "\n" +
                "已用流量  " + used + " / " + total + "\n" +
                "剩余比例  " + remainingPercent.toFixed(1) + "%\n" +
                "使用比例  " + usedPercent.toFixed(1) + "%\n" +
                "下次重置  " + resetTime + "\n" +
                "服务器    " + hostname;

            $done({
                title: title,
                content: content,
                icon: "externaldrive.fill",
                "icon-color": iconColor
            });
        }
    );
}


/**
 * 解析 Surge $argument
 *
 * 例如：
 * veid=123456&apikey=private_xxx&title=Bandwagon%20VPS
 */
function parseArgs(argument) {

    const result = {};

    if (!argument) {
        return result;
    }

    argument.split("&").forEach(function (item) {

        const index = item.indexOf("=");

        if (index === -1) {
            return;
        }

        const key = item.substring(0, index);
        const value = item.substring(index + 1);

        result[key] = decodeURIComponent(value);
    });

    return result;
}


/**
 * 字节转换
 */
function formatBytes(bytes) {

    bytes = Number(bytes);

    if (!isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
        "PB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

    const i =
        Math.min(index, units.length - 1);

    const value =
        bytes / Math.pow(1024, i);

    if (i === 0) {
        return value.toFixed(0) + " " + units[i];
    }

    return value.toFixed(2) + " " + units[i];
}


/**
 * 时间格式化
 */
function formatDate(timestamp) {

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
        return "未知";
    }

    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes())
    );
}