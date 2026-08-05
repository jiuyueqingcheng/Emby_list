/*
 * ============================================================
 * BandwagonHost / KiwiVM Surge Panel
 * Progress Bar Edition
 * ============================================================
 *
 * 显示：
 *
 * - VPS 状态
 * - 今日流量
 * - 本月流量进度条
 * - 内存进度条
 * - 开机时间
 * - 运行时长
 * - 下次流量重置
 * - 服务器
 * - 机房
 * - IP
 *
 * 参数:
 * veid
 * apikey
 * title
 *
 * ============================================================
 */


const args = parseArgs($argument);


const VEID =
    args.veid || "";


const APIKEY =
    args.apikey || "";


const TITLE =
    args.title ||
    "🇺🇸 BWH VPS";


const API_BASE =
    "https://api.64clouds.com/v1/";



if (!VEID || !APIKEY) {


    panel(
        TITLE,
        "❌ 请配置 VEID 和 APIKEY",
        "exclamationmark.triangle.fill",
        "#FF9500"
    );


} else {


    getServiceInfo();

}




/*
 * 获取 VPS 信息
 */

function getServiceInfo(){


    const url =
        API_BASE +
        "getServiceInfo" +
        "?veid=" +
        encodeURIComponent(VEID) +
        "&api_key=" +
        encodeURIComponent(APIKEY);



    $httpClient.get(
        {
            url:url,
            timeout:15
        },


        function(
            error,
            response,
            body
        ){


            if(error){

                panel(
                    TITLE,
                    "❌ API 请求失败\n"+
                    error,
                    "wifi.exclamationmark",
                    "#FF3B30"
                );

                return;

            }



            let service;


            try{

                service =
                    JSON.parse(body);


            }catch(e){


                panel(
                    TITLE,
                    "❌ 数据解析失败",
                    "exclamationmark.triangle.fill",
                    "#FF3B30"
                );

                return;

            }



            getLiveServiceInfo(
                service
            );


        }
    );

}




/*
 * 实时信息
 */

function getLiveServiceInfo(
    service
){


    const url =
        API_BASE +
        "getLiveServiceInfo" +
        "?veid="+
        encodeURIComponent(VEID)+
        "&api_key="+
        encodeURIComponent(APIKEY);



    $httpClient.get(
        {
            url:url,
            timeout:15
        },


        function(
            error,
            response,
            body
        ){


            let live={};



            if(
                !error &&
                body
            ){

                try{

                    live =
                        JSON.parse(body);


                }catch(e){}

            }



            getRawUsageStats(
                service,
                live
            );

        }
    );

}




/*
 * 流量统计
 */

function getRawUsageStats(
    service,
    live
){


    const url =
        API_BASE+
        "getRawUsageStats"+
        "?veid="+
        encodeURIComponent(VEID)+
        "&api_key="+
        encodeURIComponent(APIKEY);



    $httpClient.get(
        {
            url:url,
            timeout:15
        },


        function(
            error,
            response,
            body
        ){


            let stats={};


            if(
                !error &&
                body
            ){

                try{

                    stats =
                        JSON.parse(body);


                }catch(e){}

            }



            if(
                isRunning(live)
            ){


                getUptime(
                    service,
                    live,
                    stats
                );


            }else{


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
 * uptime
 */

function getUptime(
    service,
    live,
    stats
){


    const url =
        API_BASE+
        "basicShell/exec"+
        "?veid="+
        encodeURIComponent(VEID)+
        "&api_key="+
        encodeURIComponent(APIKEY)+
        "&command="+
        encodeURIComponent(
            "cat /proc/uptime"
        );



    $httpClient.get(
        {
            url:url,
            timeout:15
        },


        function(
            error,
            response,
            body
        ){


            let uptimeSeconds=null;



            if(
                !error &&
                body
            ){


                let match =
                    String(body)
                    .match(
                        /([0-9]+(?:\.[0-9]+)?)/ 
                    );


                if(match){

                    uptimeSeconds =
                        Number(
                            match[1]
                        );

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
// ============================================================
// 生成面板
// ============================================================

function renderPanel(
    service,
    live,
    stats,
    uptimeSeconds
){


    let status =
        "未知";


    if(live.ve_status){

        let s =
            String(
                live.ve_status
            ).toLowerCase();


        if(s==="running"){

            status =
                "🟢 运行中";

        }else if(s==="stopped"){

            status =
                "🔴 已停止";

        }else{

            status =
                live.ve_status;

        }

    }



    // =========================
    // 流量
    // =========================


    const totalBytes =
        Number(
            service.plan_monthly_data || 0
        );


    const usedBytes =
        Number(
            service.data_counter || 0
        ) *
        Number(
            service.monthly_data_multiplier || 1
        );



    let usedPercent = 0;


    if(totalBytes>0){

        usedPercent =
            usedBytes /
            totalBytes *
            100;

    }



    // =========================
    // 今日流量
    // =========================


    let todayBytes =
        calculateTodayTraffic(
            stats
        );


    todayBytes *=
        Number(
            service.monthly_data_multiplier || 1
        );



    let todayText =
        "暂无数据";


    if(todayBytes>0){

        todayText =
            formatBytes(
                todayBytes
            );

    }else{

        todayText =
            "0 B";

    }




    // =========================
    // 内存
    // =========================


    const totalMemory =
        Number(
            service.plan_ram || 0
        );



    /*
     * KiwiVM API没有真实内存
     * 保留兼容
     */

    let usedMemory =
        Number(
            live.mem_used || 0
        );



    let memoryPercent =
        0;



    if(
        totalMemory>0 &&
        usedMemory>0
    ){

        memoryPercent =
            usedMemory /
            totalMemory *
            100;

    }



    let memoryText =
        "未知";



    if(totalMemory>0){


        memoryText =
            progressBar(
                memoryPercent
            )
            +
            " "
            +
            memoryPercent
            .toFixed(1)
            +
            "%\n           "
            +
            formatBytes(
                usedMemory
            )
            +
            " / "
            +
            formatBytes(
                totalMemory
            );

    }



    // =========================
    // uptime
    // =========================


    let bootTime =
        "未知";


    let uptimeText =
        "未知";



    if(
        uptimeSeconds &&
        uptimeSeconds>0
    ){

        let boot =
            Date.now()
            -
            uptimeSeconds*1000;



        bootTime =
            formatDate(
                new Date(
                    boot
                )
            );



        uptimeText =
            formatDuration(
                uptimeSeconds
            );

    }



    // =========================
    // 重置时间
    // =========================


    let reset =
        "未知";


    if(
        service.data_next_reset
    ){

        reset =
            formatDate(
                new Date(
                    service.data_next_reset*1000
                )
            );

    }



    // =========================
    // IP
    // =========================


    let ip =
        "未知";


    if(
        service.ip_addresses &&
        service.ip_addresses.length
    ){

        ip =
            service.ip_addresses[0];

    }



    const hostname =
        service.hostname ||
        "BWH VPS";


    const location =
        service.node_datacenter ||
        "未知";





    let color =
        "#34C759";


    if(
        100-usedPercent < 20
    ){

        color =
            "#FF3B30";


    }else if(
        100-usedPercent < 50
    ){

        color =
            "#FF9500";

    }



    const content =


        "状态       "+
        status+
        "\n\n"+


        "今日流量   "+
        todayText+
        "\n\n"+


        "流量       "+
        progressBar(
            usedPercent
        )
        +
        " "
        +
        usedPercent
        .toFixed(1)
        +
        "%\n"+
        "           "+
        formatBytes(
            usedBytes
        )
        +
        " / "
        +
        formatBytes(
            totalBytes
        )
        +
        "\n\n"+



        "内存       "+
        memoryText+
        "\n\n"+



        "开机时间   "+
        bootTime+
        "\n"+


        "运行时长   "+
        uptimeText+
        "\n\n"+



        "下次重置   "+
        reset+
        "\n\n"+



        "服务器     "+
        hostname+
        "\n"+


        "机房       "+
        location+
        "\n"+


        "IP         "+
        ip;




    panel(
        TITLE,
        content,
        "server.rack",
        color
    );

}



// ============================================================
// 进度条
// ============================================================

function progressBar(
    percent
){

    const size =
        10;


    let count =
        Math.round(
            percent/100*size
        );


    if(count<0)
        count=0;


    if(count>size)
        count=size;



    return (
        "█".repeat(count)
        +
        "░".repeat(size-count)
    );

}



// ============================================================
// 今日流量计算
// ============================================================

function calculateTodayTraffic(
    stats
){

    if(
        !stats ||
        !stats.data
    ){

        return 0;

    }



    let start =
        new Date();


    start.setHours(
        0,
        0,
        0,
        0
    );



    let total=0;



    stats.data.forEach(
        item=>{


            let time =
                Number(
                    item.timestamp || 0
                );



            if(
                time >=
                start.getTime()/1000
            ){


                total +=
                    Number(
                        item.network_in_bytes || 0
                    )
                    +
                    Number(
                        item.network_out_bytes || 0
                    );

            }


        }
    );


    return total;

}



// ============================================================
// 工具
// ============================================================


function formatBytes(
    bytes
){

    if(!bytes)
        return "0 B";


    const units=[
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];



    let i =
        Math.floor(
            Math.log(bytes)
            /
            Math.log(1024)
        );



    return (
        (
        bytes/
        Math.pow(1024,i)
        )
        .toFixed(2)
        +
        " "
        +
        units[i]
    );

}




function formatDuration(
    sec
){

    sec =
        Math.floor(sec);


    let d =
        Math.floor(
            sec/86400
        );


    let h =
        Math.floor(
            sec%86400/3600
        );


    let m =
        Math.floor(
            sec%3600/60
        );


    return (
        d+
        "天 "+
        h+
        "小时 "+
        m+
        "分钟"
    );

}




function formatDate(
    date
){

    return (
        date.getFullYear()
        +
        "-"
        +
        (date.getMonth()+1)
        +
        "-"
        +
        date.getDate()
        +
        " "
        +
        date.getHours()
        +
        ":"
        +
        String(
            date.getMinutes()
        )
        .padStart(2,"0")
    );

}





function isRunning(
    live
){

    return (
        live &&
        String(
            live.ve_status
        )
        .toLowerCase()
        ===
        "running"
    );

}




function parseArgs(
    str
){

    let obj={};


    if(!str)
        return obj;


    str.split("&")
    .forEach(
        item=>{


            let p =
                item.split("=");


            obj[p[0]] =
                decodeURIComponent(
                    p[1] || ""
                );

        }
    );


    return obj;

}




function panel(
    title,
    content,
    icon,
    color
){

    $done({

        title:title,

        content:content,

        icon:icon,

        "icon-color":color

    });

}