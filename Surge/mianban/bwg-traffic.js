/*
 * =====================================================
 * BandwagonHost VPS Dashboard for Surge
 * =====================================================
 *
 * 参数:
 *
 * veid=你的VEID
 * apikey=你的APIKEY
 * title=显示名称
 *
 * =====================================================
 */


const args = parseArgs($argument);


const VEID =
    args.veid || "";

const APIKEY =
    args.apikey || "";

const TITLE =
    args.title || "🇺🇸 BWH VPS";


const API =
    "https://api.64clouds.com/v1/";


if (!VEID || !APIKEY) {

    $done({
        title: TITLE,
        content: "❌ 请配置 VEID 和 APIKEY",
        icon: "exclamationmark.triangle",
        "icon-color": "#FF9500"
    });

} else {

    getInfo();

}



/*
 * 获取 VPS 信息
 */

function getInfo(){


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
            error,
            response,
            body
        ){

            if(error){

                doneError(error);
                return;
            }


            let data;


            try{

                data =
                    JSON.parse(body);

            }catch(e){

                doneError(
                    "解析失败"
                );

                return;
            }


            getLive(
                data
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
        "?veid=" +
        VEID +
        "&api_key=" +
        APIKEY;



    $httpClient.get(
        url,
        function(
            error,
            response,
            body
        ){

            let live={};


            if(!error && body){

                try{

                    live =
                        JSON.parse(body);

                }catch(e){}

            }


            render(
                service,
                live
            );

        }
    );

}




/*
 * 面板
 */

function render(
    service,
    live
){


    let status =
        "未知";


    if(live.ve_status){

        status =
            live.ve_status
            .toLowerCase()=="running"
            ?
            "🟢 运行中"
            :
            "🔴 已停止";

    }



    /*
     * 流量
     */

    const total =
        Number(
            service.plan_monthly_data || 0
        );


    const used =
        Number(
            service.data_counter || 0
        );


    let percent =
        0;


    if(total>0){

        percent =
            used /
            total *
            100;

    }



    /*
     * 今日流量
     */

    let today =
        "暂无数据";


    if(service.data_counter){

        today =
            formatBytes(
                used
            );

    }



    /*
     * 内存
     */

    let memory =
        "未知";


    if(service.plan_ram){

        memory =
            formatBytes(
                service.plan_ram
            );

    }



    /*
     * IP
     */

    let ip =
        "未知";


    if(
        service.ip_addresses &&
        service.ip_addresses.length
    ){

        ip =
            service.ip_addresses[0];

    }



    /*
     * 颜色
     */

    let color =
        "#34C759";


    let remain =
        100-percent;


    if(remain<20){

        color="#FF3B30";

    }else if(remain<50){

        color="#FF9500";

    }



    const content =

        "状态       "+
        status+
        "\n\n"+


        "今日流量   "+
        today+
        "\n\n"+


        "流量       "+
        bar(percent)+
        " "+
        percent.toFixed(1)+
        "%"+
        "\n"+
        "           "+
        formatBytes(used)+
        " / "+
        formatBytes(total)+
        "\n\n"+


        "内存       "+
        memory+
        "\n\n"+


        "重置时间   "+
        resetTime(service)+
        "\n\n"+


        "服务器     "+
        (
            service.hostname ||
            "BWH VPS"
        )+
        "\n"+


        "机房       "+
        (
            service.node_datacenter ||
            "未知"
        )+
        "\n"+


        "IP         "+
        ip;



    $done({

        title:
            TITLE,

        content:
            content,

        icon:
            "server.rack",

        "icon-color":
            color

    });


}



/*
 * 进度条
 */

function bar(percent){


    const length =
        10;


    let n =
        Math.round(
            percent/100*length
        );


    if(n>length)
        n=length;


    if(n<0)
        n=0;


    return (
        "█".repeat(n)+
        "░".repeat(length-n)
    );

}



/*
 * 字节转换
 */

function formatBytes(bytes){


    bytes =
        Number(bytes);


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
            Math.log(bytes)/
            Math.log(1024)
        );


    return (
        (bytes/
        Math.pow(1024,i))
        .toFixed(2)
        +" "+
        units[i]
    );

}



/*
 * 重置时间
 */

function resetTime(data){


    if(
        !data.data_next_reset
    )
        return "未知";


    return new Date(
        data.data_next_reset*1000
    )
    .toLocaleString();

}



/*
 * 参数解析
 */

function parseArgs(str){

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
                    p[1]||""
                );

        }
    );


    return obj;

}



/*
 * 错误
 */

function doneError(msg){

    $done({

        title:
            TITLE,

        content:
            "❌ "+
            msg,

        icon:
            "xmark.circle",

        "icon-color":
            "#FF3B30"

    });

}