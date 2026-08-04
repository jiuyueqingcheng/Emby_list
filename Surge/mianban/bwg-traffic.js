/*
 * ============================================================
 * BandwagonHost / KiwiVM Surge Panel
 * ============================================================
 *
 * 显示：
 *  - VPS 状态
 *  - 剩余流量
 *  - 今日流量
 *  - 本月已用流量
 *  - 总流量
 *  - 流量使用百分比
 *  - 内存使用
 *  - 开机时间
 *  - 运行时长
 *  - 下次流量重置
 *
 * Surge Module 参数：
 *
 * VEID
 * APIKEY
 * TITLE
 * INTERVAL
 *
 * ============================================================
 */

const args = parseArgs($argument);

const VEID = args.veid || "";
const APIKEY = args.apikey || "";
const TITLE = args.title || "🇺🇸 BWH VPS";

const API_BASE = "https://api.64clouds.com/v1/";


/*
 * ------------------------------------------------------------
 * 参数检查
 * ------------------------------------------------------------
 */

if (!VEID || !APIKEY) {

    panel(
        TITLE,
        "❌ 请先配置 VEID 和 APIKEY",
        "exclamationmark.triangle.fill",
        "#FF9500"
    );

} else {

    getServiceInfo();
}


/*
 * ------------------------------------------------------------
 * 获取 VPS 基础信息
 * ------------------------------------------------------------
 */

function getServiceInfo() {

    const url =
        API_BASE +
        "getServiceInfo" +
        "?veid=" + encodeURIComponent(VEID) +
        "&api_key=" + encodeURIComponent(APIKEY);

    $httpClient.get(
        {
            url: url,
            timeout: 15
        },
        function (error, response, body) {

            if (error) {

                panel(
                    TITLE,
                    "❌ 获取 VPS 信息失败\n" + error,
                    "wifi.exclamationmark",
                    "#FF3B30"
                );

                return;
            }

            if (!body) {

                panel(
                    TITLE,
                    "❌ API 返回为空",
                    "exclamationmark.triangle.fill",
                    "#FF3B30"
                );

                return;
            }

            let service;

            try {
                service = JSON.parse(body);
            } catch (e) {

                panel(
                    TITLE,
                    "❌ API 数据解析失败",
                    "exclamationmark.triangle.fill",
                    "#FF3B30"
                );

                return;
            }

            if (Number(service.error || 0) !== 0) {

                panel(
                    TITLE,
                    "❌ KiwiVM API 错误\n" +
                    getErrorMessage(service),
                    "exclamationmark.triangle.fill",
                    "#FF3B30"
                );

                return;
            }

            getLiveServiceInfo(service);
        }
    );
}


/*
 * ------------------------------------------------------------
 * 获取实时 VPS 信息
 *
 * 用于：
 *  - VPS 状态
 *  - 可用内存
 * ------------------------------------------------------------
 */

function getLiveServiceInfo(service) {

    const url =
        API_BASE +
        "getLiveServiceInfo" +
        "?veid=" + encodeURIComponent(VEID) +
        "&api_key=" + encodeURIComponent(APIKEY);

    $httpClient.get(
        {
            url: url,
            timeout: 20
        },
        function (error, response, body) {

            let live = {};

            if (!error && body) {

                try {
                    live = JSON.parse(body);
                } catch (e) {
                    live = {};
                }
            }

            /*
             * 即使实时接口失败，也继续显示基础流量信息
             */
            getRawUsageStats(service, live);
        }
    );
}


/*
 * ------------------------------------------------------------
 * 获取详细流量统计
 *
 * 用于：
 *  - 今日流量
 * ------------------------------------------------------------
 */

function getRawUsageStats(service, live) {

    const url =
        API_BASE +
        "getRawUsageStats" +
        "?veid=" + encodeURIComponent(VEID) +
        "&api_key=" + encodeURIComponent(APIKEY);

    $httpClient.get(
        {
            url: url,
            timeout: 20
        },
        function (error, response, body) {

            let stats = {};

            if (!error && body) {

                try {
                    stats = JSON.parse(body);
                } catch (e) {
                    stats = {};
                }
            }

            /*
             * Linux VPS：
             * 通过 /proc/uptime 获取准确运行时间
             */
            if (isRunning(live)) {

                getUptime(service, live, stats);

            } else {

                renderPanel(
                    service,
                    live,
                    stats,
                    null
                );
            }
        }
    );
}


/*
 * ------------------------------------------------------------
 * 获取 Linux VPS uptime
 * ------------------------------------------------------------
 */

function getUptime(service, live, stats) {

    const url =
        API_BASE +
        "basicShell/exec" +
        "?veid=" + encodeURIComponent(VEID) +
        "&api_key=" + encodeURIComponent(APIKEY) +
        "&command=" + encodeURIComponent("cat /proc/uptime");

    $httpClient.get(
        {
            url: url,
            timeout: 15
        },
        function (error, response, body) {

            let uptimeSeconds = null;

            if (!error && body) {

                try {

                    const result = JSON.parse(body);

                    /*
                     * basicShell/exec：
                     * message 通常是命令输出
                     */
                    const message = result.message || "";

                    const match =
                        String(message).match(
                            /([0-9]+(?:\.[0-9]+)?)/
                        );

                    if (match) {
                        uptimeSeconds = Number(match[1]);
                    }

                } catch (e) {

                    /*
                     * 某些情况下直接返回文本
                     */
                    const match =
                        String(body).match(
                            /([0-9]+(?:\.[0-9]+)?)/
                        );

                    if (match) {
                        uptimeSeconds = Number(match[1]);
                    }
                }
            }

            renderPanel(
                service,
                live,
                stats,
                uptimeSeconds
            );
        }
    );
}


/*
 * ------------------------------------------------------------
 * 生成最终面板
 * ------------------------------------------------------------
 */

function renderPanel(
    service,
    live,
    stats,
    uptimeSeconds
) {

    /*
     * ========================================================
     * VPS 状态
     * ========================================================
     */

    let status = "未知";

    if (live.ve_status) {

        switch (String(live.ve_status).toLowerCase()) {

            case "running":
                status = "运行中";
                break;

            case "stopped":
                status = "已停止";
                break;

            case "starting":
                status = "启动中";
                break;

            default:
                status = String(live.ve_status);
        }

    }


    /*
     * ========================================================
     * 流量
     * ========================================================
     */

    const multiplier =
        Number(service.monthly_data_multiplier || 1);

    const totalBytes =
        Number(service.plan_monthly_data || 0);

    const usedBytes =
        Number(service.data_counter || 0) *
        multiplier;

    let remainingBytes =
        totalBytes - usedBytes;

    if (remainingBytes < 0) {
        remainingBytes = 0;
    }


    /*
     * ========================================================
     * 流量百分比
     * ========================================================
     */

    let usedPercent = 0;
    let remainingPercent = 0;

    if (totalBytes > 0) {

        usedPercent =
            usedBytes /
            totalBytes *
            100;

        remainingPercent =
            remainingBytes /
            totalBytes *
            100;
    }


    /*
     * ========================================================
     * 今日流量
     * ========================================================
     */

    const todayBytes =
        calculateTodayTraffic(stats) *
        multiplier;


    /*
     * ========================================================
     * 内存
     * ========================================================
     */

    const totalMemory =
        Number(service.plan_ram || 0);

    const availableMemory =
        Number(live.mem_available_kb || 0) *
        1024;

    let usedMemory = 0;

    if (totalMemory > 0 && availableMemory >= 0) {

        usedMemory =
            totalMemory -
            availableMemory;

        if (usedMemory < 0) {
            usedMemory = 0;
        }
    }


    let memoryText = "未知";

    if (totalMemory > 0) {

        const memoryPercent =
            usedMemory /
            totalMemory *
            100;

        memoryText =
            formatBytes(usedMemory) +
            " / " +
            formatBytes(totalMemory) +
            " (" +
            memoryPercent.toFixed(1) +
            "%)";
    }


    /*
     * ========================================================
     * 开机时间
     * ========================================================
     */

    let bootTime = "未知";
    let uptimeText = "未知";

    if (
        uptimeSeconds !== null &&
        isFinite(uptimeSeconds) &&
        uptimeSeconds > 0
    ) {

        const now =
            Date.now();

        const bootTimestamp =
            now -
            uptimeSeconds * 1000;

        bootTime =
            formatDate(
                new Date(bootTimestamp)
            );

        uptimeText =
            formatDuration(
                uptimeSeconds
            );
    }


    /*
     * ========================================================
     * 下次流量重置
     * ========================================================
     */

    let resetTime = "未知";

    if (service.data_next_reset) {

        resetTime =
            formatDate(
                new Date(
                    Number(service.data_next_reset) * 1000
                )
            );
    }


    /*
     * ========================================================
     * 服务器名称
     * ========================================================
     */

    const hostname =
        service.hostname ||
        live.live_hostname ||
        "VPS";


    /*
     * ========================================================
     * 机房
     * ========================================================
     */

    const location =
        service.node_datacenter ||
        service.node_location ||
        "未知";


    /*
     * ========================================================
     * IP
     * ========================================================
     */

    let ip = "未知";

    if (
        service.ip_addresses &&
        service.ip_addresses.length > 0
    ) {

        ip =
            service.ip_addresses[0];
    }


    /*
     * ========================================================
     * 图标颜色
     * ========================================================
     */

    let iconColor = "#34C759";

    if (remainingPercent <= 10) {

        iconColor = "#FF3B30";

    } else if (remainingPercent <= 30) {

        iconColor = "#FF9500";
    }


    /*
     * ========================================================
     * 今日流量文本
     * ========================================================
     */

    let todayText =
        "暂无数据";

    if (todayBytes > 0) {

        todayText =
            formatBytes(todayBytes);

    } else if (
        stats &&
        stats.data &&
        stats.data.length > 0
    ) {

        todayText = "0 B";
    }


    /*
     * ========================================================
     * 最终 Panel
     * ========================================================
     */

    const content =
        "状态       " + status + "\n" +
        "剩余流量   " + formatBytes(remainingBytes) + "\n" +
        "今日流量   " + todayText + "\n" +
        "本月已用   " + formatBytes(usedBytes) + "\n" +
        "总流量     " + formatBytes(totalBytes) + "\n" +
        "剩余比例   " + remainingPercent.toFixed(1) + "%\n" +
        "内存       " + memoryText + "\n" +
        "开机时间   " + bootTime + "\n" +
        "运行时长   " + uptimeText + "\n" +
        "下次重置   " + resetTime + "\n" +
        "服务器     " + hostname + "\n" +
        "机房       " + location + "\n" +
        "IP         " + ip;


    panel(
        TITLE,
        content,
        "server.rack",
        iconColor
    );
}


/*
 * ------------------------------------------------------------
 * 计算今日流量
 *
 * getRawUsageStats 返回：
 *
 * timestamp
 * network_in_bytes
 * network_out_bytes
 *
 * 这里按照 Surge 当前设备的本地日期计算今天。
 * ------------------------------------------------------------
 */

function calculateTodayTraffic(stats) {

    if (
        !stats ||
        !stats.data ||
        !Array.isArray(stats.data)
    ) {
        return 0;
    }


    const now =
        new Date();

    /*
     * 今天 00:00:00
     */
    const startOfDay =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0
        );

    const startTimestamp =
        startOfDay.getTime() / 1000;


    let total = 0;


    stats.data.forEach(function (item) {

        if (!item) {
            return;
        }

        const timestamp =
            Number(item.timestamp || 0);

        if (
            timestamp >= startTimestamp &&
            timestamp <= Date.now() / 1000
        ) {

            const networkIn =
                Number(
                    item.network_in_bytes || 0
                );

            const networkOut =
                Number(
                    item.network_out_bytes || 0
                );

            total +=
                networkIn +
                networkOut;
        }
    });


    return total;
}


/*
 * ------------------------------------------------------------
 * 判断 VPS 是否运行
 * ------------------------------------------------------------
 */

function isRunning(live) {

    if (!live) {
        return false;
    }

    const status =
        String(
            live.ve_status || ""
        ).toLowerCase();

    return (
        status === "running" ||
        status === "started"
    );
}


/*
 * ------------------------------------------------------------
 * 字节格式化
 * ------------------------------------------------------------
 */

function formatBytes(bytes) {

    bytes =
        Number(bytes);

    if (
        !isFinite(bytes) ||
        bytes <= 0
    ) {
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


    let index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    if (index < 0) {
        index = 0;
    }

    if (index >= units.length) {
        index = units.length - 1;
    }


    const value =
        bytes /
        Math.pow(1024, index);


    if (index === 0) {

        return (
            value.toFixed(0) +
            " " +
            units[index]
        );
    }


    return (
        value.toFixed(2) +
        " " +
        units[index]
    );
}


/*
 * ------------------------------------------------------------
 * 运行时间格式化
 * ------------------------------------------------------------
 */

function formatDuration(seconds) {

    seconds =
        Math.floor(
            Number(seconds)
        );


    if (
        !isFinite(seconds) ||
        seconds < 0
    ) {
        return "未知";
    }


    const days =
        Math.floor(
            seconds / 86400
        );

    seconds %=
        86400;


    const hours =
        Math.floor(
            seconds / 3600
        );

    seconds %=
        3600;


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (days > 0) {

        return (
            days +
            "天 " +
            hours +
            "小时 " +
            minutes +
            "分钟"
        );
    }


    if (hours > 0) {

        return (
            hours +
            "小时 " +
            minutes +
            "分钟"
        );
    }


    return (
        minutes +
        "分钟"
    );
}


/*
 * ------------------------------------------------------------
 * 日期格式化
 * ------------------------------------------------------------
 */

function formatDate(date) {

    if (
        !date ||
        isNaN(
            date.getTime()
        )
    ) {
        return "未知";
    }


    function pad(number) {

        return number < 10
            ? "0" + number
            : String(number);
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


/*
 * ------------------------------------------------------------
 * Surge 参数解析
 * ------------------------------------------------------------
 */

function parseArgs(argument) {

    const result = {};

    if (!argument) {
        return result;
    }


    argument
        .split("&")
        .forEach(function (item) {

            const index =
                item.indexOf("=");

            if (index === -1) {
                return;
            }


            const key =
                item.substring(
                    0,
                    index
                );


            const value =
                item.substring(
                    index + 1
                );


            result[key] =
                decodeURIComponent(
                    value
                );
        });


    return result;
}


/*
 * ------------------------------------------------------------
 * API 错误信息
 * ------------------------------------------------------------
 */

function getErrorMessage(data) {

    if (!data) {
        return "未知错误";
    }


    if (data.message) {
        return String(data.message);
    }


    if (data.error) {
        return "Error " + data.error;
    }


    return "未知错误";
}


/*
 * ------------------------------------------------------------
 * Surge Panel 输出
 * ------------------------------------------------------------
 */

function panel(
    title,
    content,
    icon,
    iconColor
) {

    $done({
        title: title,
        content: content,
        icon: icon,
        "icon-color": iconColor
    });
}