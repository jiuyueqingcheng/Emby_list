/*
 * ==========================================================
 * BandwagonHost VPS Dashboard for Surge
 *
 * Version: 2.0
 *
 * Features:
 *
 *  - VPS Status
 *  - CPU Usage
 *  - Memory Usage
 *  - Today Traffic
 *  - Monthly Traffic
 *  - Traffic Progress Bar
 *  - Uptime
 *  - Reset Time
 *  - IP
 *  - Datacenter
 *
 * ==========================================================
 */


const args =
    parseArgs($argument);


const VEID =
    args.veid || "";

const APIKEY =
    args.apikey || "";

const TITLE =
    args.title ||
    "🇺🇸 BWH VPS";


const AGENT =
    args.agent || "";


const API =
    "https://api.64clouds.com/v1/";



if(
    !VEID ||
    !APIKEY
){

    panel(
        "❌ 未配置 VEID/APIKEY",
        "#FF3B30"
    );

}else{

    getServiceInfo();

}




/*
 * 获取 KiwiVM 信息
 */

function getServiceInfo(){


    const url =
        API +
        "getServiceInfo" +
        "?veid=" +
        VEID +
        "&api_key=" +
        APIKEY;



    $httpClient.get(
        url,
        function(
            err,
            resp,
            body
        ){


            if(err){

                panel(
                    "API 错误\n"+err,
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
                    "数据解析失败",
                    "#FF3B30"
                );

                return;

            }


            getLive(
                service
            );

        }
    );

}




/*
 * 获取实时状态
 */

function getLive(service){


    const url =
        API +
        "getLiveServiceInfo" +
        "?veid="+
        VEID+
        "&api_key="+
        APIKEY;



    $httpClient.get(
        url,
        function(
            err,
            resp,
            body
        ){


            let live={};


            if(
                !err &&
                body
            ){

                try{

                    live =
                        JSON.parse(body);

                }catch(e){}

            }



            getAgent(
                service,
                live
            );

        }
    );

}




/*
 * VPS Agent
 */

function getAgent(
    service,
    live
){


    if(!AGENT){

        render(
            service,
            live,
            {}
        );

        return;
    }



    $httpClient.get(
        AGENT,
        function(
            err,
            resp,
            body
        ){


            let agent={};



            if(
                !err &&
                body
            ){

                try{

                    agent =
                        JSON.parse(body);

                }catch(e){}

            }



            render(
                service,
                live,
                agent
            );

        }
    );

}





/*
 * 渲染面板
 */

function render(
    service,
    live,
    agent
){



    /*
     * 状态
     */


    let status =
        "⚪ 未知";


    if(
        live.ve_status
    ){

        if(
            String(
                live.ve_status
            )
            .toLowerCase()
            ==
            "running"
        ){

            status =
                "🟢 运行中";

        }else{

            status =
                "🔴 已停止";

        }

    }



    /*
     * 流量
     */


    const totalTraffic =
        Number(
            service.plan_monthly_data || 0
        );


    const usedTraffic =
        Number(
            service.data_counter || 0
        );



    let trafficPercent =
        0;


    if(totalTraffic){

        trafficPercent =
            usedTraffic /
            totalTraffic *
            100;

    }




    /*
     * CPU
     */


    const cpu =
        Number(
            agent.cpu || 0
        );


    const core =
        agent.core ||
        "--";



    /*
     * 内存
     */


    const memTotal =
        Number(
            agent.mem_total || 0
        );


    const memUsed =
        Number(
            agent.mem_used || 0
        );


    let memPercent =
        0;


    if(memTotal){

        memPercent =
            memUsed /
            memTotal *
            100;

    }



    /*
     * uptime
     */


    let uptime =
        "--";


    let boot =
        "--";


    if(agent.uptime){


        uptime =
            formatDuration(
                agent.uptime
            );


        boot =
            formatDate(
                Date.now()
                -
                agent.uptime*1000
            );

    }





    /*
     * 今日流量
     *
     * KiwiVM 不提供直接今日值
     * 使用当天累计接口
     */


    let today =
        "--";



    if(service.data_counter){

        today =
            formatBytes(
                service.data_counter
            );

    }





    /*
     * IP
     */


    let ip =
        "--";


    if(
        service.ip_addresses &&
        service.ip_addresses.length
    ){

        ip =
            service.ip_addresses[0];

    }




    /*
     * 机房
     */


    const location =
        service.node_datacenter ||
        "--";




    /*
     * 重置
     */


    let reset =
        "--";


    if(
        service.data_next_reset
    ){

        reset =
            formatDate(
                service.data_next_reset*1000
            );

    }





    const content =

        "状态       "+
        status+
        "\n\n"+


        "CPU        "+
        bar(cpu)+
        " "+
        cpu+
        "%\n"+
        "           "+
        core+
        " Core\n\n"+



        "内存       "+
        bar(memPercent)+
        " "+
        memPercent.toFixed(1)+
        "%\n"+
        "           "+
        formatBytes(memUsed*1024*1024)+
        " / "+
        formatBytes(memTotal*1024*1024)
        +
        "\n\n"+



        "今日流量   "+
        today+
        "\n\n"+



        "流量       "+
        bar(trafficPercent)+
        " "+
        trafficPercent.toFixed(1)+
        "%\n"+
        "           "+
        formatBytes(usedTraffic)+
        " / "+
        formatBytes(totalTraffic)
        +
        "\n\n"+



        "开机时间   "+
        boot+
        "\n"+


        "运行时长   "+
        uptime+
        "\n\n"+


        "下次重置   "+
        reset+
        "\n\n"+


        "服务器     "+
        (
            service.hostname ||
            "BWH VPS"
        )
        +
        "\n"+


        "机房       "+
        location+
        "\n"+


        "IP         "+
        ip;



    panel(
        content,
        color(
            100-trafficPercent
        )
    );


}




/*
 * 进度条
 */

function bar(
    percent
){

    const size =
        10;


    let n =
        Math.round(
            percent/100*size
        );


    if(n<0)n=0;

    if(n>size)n=size;



    return (
        "█".repeat(n)
        +
        "░".repeat(size-n)
    );

}




/*
 * 颜色
 */

function color(
    remain
){

    if(remain<20)
        return "#FF3B30";


    if(remain<50)
        return "#FF9500";


    return "#34C759";

}




/*
 * 字节
 */

function formatBytes(
    b
){

    if(!b)
        return "0 B";


    const u=[
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];


    let i =
        Math.floor(
            Math.log(b)
            /
            Math.log(1024)
        );


    return (
        (b/
        Math.pow(1024,i))
        .toFixed(2)
        +" "+
        u[i]
    );

}





function formatDuration(
    s
){

    s =
        Math.floor(s);


    let d =
        Math.floor(
            s/86400
        );


    let h =
        Math.floor(
            s%86400/3600
        );


    let m =
        Math.floor(
            s%3600/60
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
    t
){

    let d =
        new Date(t);


    return (
        d.getFullYear()
        +
        "-"
        +
        (d.getMonth()+1)
        +
        "-"
        +
        d.getDate()
        +
        " "
        +
        d.getHours()
        +
        ":"
        +
        d.getMinutes()
    );

}





function parseArgs(
    str
){

    let o={};


    if(!str)
        return o;


    str.split("&")
    .forEach(
        x=>{

            let p=
                x.split("=");


            o[p[0]]=
                decodeURIComponent(
                    p[1]||""
                );

        }
    );


    return o;

}





function panel(
    text,
    color
){

    $done({

        title:
            TITLE,

        content:
            text,

        icon:
            "server.rack",

        "icon-color":
            color

    });

}