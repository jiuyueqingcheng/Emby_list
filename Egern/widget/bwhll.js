// BandwagonHost / KiwiVM Egern Widget
// 中号紧凑版
// 功能：
// 1. 今日流量
// 2. 月度流量 + 使用率 + 进度条
// 3. 内存
// 4. VPS 状态
// 5. IP 地址
// 6. 机房
// 7. 完整流量重置时间
// 8. 锁屏组件
//
// 注意：重置时间固定按照北京时间 UTC+8 显示
export default async function (ctx) {
  const veid   = ctx.env.VEID;
  const apiKey = ctx.env.API_KEY;
  // ============================================================
  // 配色
  // ============================================================
  const C = {
    bg: {
      light: '#F2F2F7',
      dark:  '#1C1C1E'
    },
    card: {
      light: '#FFFFFF',
      dark:  '#2C2C2E'
    },
    track: {
      light: '#E5E5EA',
      dark:  '#3A3A3C'
    },
    t1: {
      light: '#000000',
      dark:  '#FFFFFF'
    },
    t2: {
      light: '#3C3C43',
      dark:  '#EBEBF5'
    },
    t3: {
      light: '#6C6C70',
      dark:  '#8E8E93'
    },
    t4: {
      light: '#AEAEB2',
      dark:  '#636366'
    },
    blue:   '#007AFF',
    purple: '#AF52DE',
    green:  '#34C759',
    orange: '#FF9500',
    red:    '#FF3B30'
  };
  // ============================================================
  // 错误组件
  // ============================================================
  function errorWidget(msg) {
    return {
      type: 'widget',
      backgroundColor: C.bg,
      padding: 14,
      gap: 6,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 5,
          children: [
            {
              type: 'image',
              src:
                'sf-symbol:exclamationmark.triangle.fill',
              color:
                C.orange,
              width: 15,
              height: 15
            },
            {
              type: 'text',
              text:
                'BandwagonHost',
              font: {
                size: 'caption1',
                weight: 'semibold'
              },
              textColor:
                C.orange
            }
          ]
        },
        {
          type: 'text',
          text:
            msg,
          font: {
            size: 'caption2'
          },
          textColor:
            C.red,
          maxLines: 2
        }
      ]
    };
  }
  // ============================================================
  // 参数检查
  // ============================================================
  if (!veid || !apiKey) {
    return errorWidget(
      '请在 Env 中配置 VEID 和 API_KEY'
    );
  }
  // ============================================================
  // 获取 VPS 基础信息
  // ============================================================
  let info;
  try {
    const url =
      'https://api.64clouds.com/v1/getLiveServiceInfo' +
      '?veid=' +
      encodeURIComponent(veid) +
      '&api_key=' +
      encodeURIComponent(apiKey);
    const resp =
      await ctx.http.get(
        url,
        {
          timeout: 15000
        }
      );
    info =
      await resp.json();
  } catch (e) {
    return errorWidget(
      '请求失败：' +
      e.message
    );
  }
  if (
    !info ||
    info.error !== 0
  ) {
    return errorWidget(
      'API 错误：' +
      (
        info
          ? (
              info.message ||
              '未知错误'
            )
          : '无响应'
      )
    );
  }
  // ============================================================
  // 工具函数
  // ============================================================
  function num(value) {
    const n =
      Number(value);
    return isFinite(n)
      ? n
      : 0;
  }
  function fmtBytes(bytes) {
    if (
      bytes == null ||
      !isFinite(
        Number(bytes)
      )
    ) {
      return 'N/A';
    }
    let value =
      Number(bytes);
    const units = [
      'B',
      'KB',
      'MB',
      'GB',
      'TB'
    ];
    let i = 0;
    while (
      value >= 1024 &&
      i < units.length - 1
    ) {
      value /= 1024;
      i++;
    }
    if (i === 0) {
      return (
        Math.round(value) +
        ' ' +
        units[i]
      );
    }
    return (
      value.toFixed(2) +
      ' ' +
      units[i]
    );
  }
  function fmtMemKb(kb) {
    if (
      kb == null ||
      !isFinite(
        Number(kb)
      )
    ) {
      return 'N/A';
    }
    kb =
      Number(kb);
    if (
      kb >= 1024 * 1024
    ) {
      return (
        (
          kb /
          1024 /
          1024
        ).toFixed(2) +
        ' GB'
      );
    }
    if (
      kb >= 1024
    ) {
      return (
        (
          kb /
          1024
        ).toFixed(0) +
        ' MB'
      );
    }
    return (
      Math.round(kb) +
      ' KB'
    );
  }
  function fmtTime(seconds) {
    seconds =
      Math.max(
        0,
        Math.floor(
          Number(seconds) || 0
        )
      );
    const days =
      Math.floor(
        seconds /
        86400
      );
    seconds %=
      86400;
    const hours =
      Math.floor(
        seconds /
        3600
      );
    seconds %=
      3600;
    const minutes =
      Math.floor(
        seconds /
        60
      );
    if (days > 0) {
      return (
        days +
        '天 ' +
        hours +
        '小时'
      );
    }
    if (hours > 0) {
      return (
        hours +
        '小时 ' +
        minutes +
        '分'
      );
    }
    return (
      minutes +
      '分钟'
    );
  }
  // ============================================================
  // Unix 时间戳 → 北京时间
  //
  // 固定 UTC+8
  // ============================================================
  function fmtBeijingTime(timestamp) {
    if (!timestamp) {
      return 'N/A';
    }
    const ms =
      Number(timestamp) *
      1000;
    if (
      !isFinite(ms)
    ) {
      return 'N/A';
    }
    // Unix 时间戳本身代表 UTC 时间点
    // 加 8 小时转换为北京时间
    const d =
      new Date(
        ms + 8 * 60 * 60 * 1000
      );
    if (
      isNaN(
        d.getTime()
      )
    ) {
      return 'N/A';
    }
    const year =
      d.getUTCFullYear();
    const month =
      String(
        d.getUTCMonth() + 1
      ).padStart(
        2,
        '0'
      );
    const day =
      String(
        d.getUTCDate()
      ).padStart(
        2,
        '0'
      );
    const hour =
      String(
        d.getUTCHours()
      ).padStart(
        2,
        '0'
      );
    const minute =
      String(
        d.getUTCMinutes()
      ).padStart(
        2,
        '0'
      );
    return (
      year +
      '-' +
      month +
      '-' +
      day +
      ' ' +
      hour +
      ':' +
      minute
    );
  }
  // ============================================================
  // 月度流量
  // ============================================================
  const used =
    num(
      info.data_counter
    );
  const total =
    num(
      info.plan_monthly_data
    );
  const ratio =
    total > 0
      ? used / total
      : 0;
  const pct =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ratio * 100
        )
      )
    );
  const usedStr =
    fmtBytes(used);
  const totalStr =
    fmtBytes(total);
  // ============================================================
  // 内存
  // ============================================================
  const planRamKb =
    info.plan_ram != null
      ? Math.round(
          num(
            info.plan_ram
          ) / 1024
        )
      : null;
  const memAvailKb =
    info.mem_available_kb != null
      ? num(
          info.mem_available_kb
        )
      : null;
  const memUsedKb =
    (
      planRamKb != null &&
      memAvailKb != null
    )
      ? Math.max(
          0,
          planRamKb -
          memAvailKb
        )
      : null;
  const memStr =
    memUsedKb != null
      ? (
          fmtMemKb(
            memUsedKb
          ) +
          ' / ' +
          fmtMemKb(
            planRamKb
          )
        )
      : 'N/A';
  let memPct =
    (
      planRamKb > 0 &&
      memUsedKb != null
    )
      ? Math.round(
          memUsedKb /
          planRamKb *
          100
        )
      : null;
  if (memPct != null) {
    memPct =
      Math.min(
        100,
        Math.max(
          0,
          memPct
        )
      );
  }
  // ============================================================
  // 流量重置时间
  // ============================================================
  const resetStr =
    info.data_next_reset
      ? fmtBeijingTime(
          info.data_next_reset
        )
      : 'N/A';
  // ============================================================
  // 机房
  // ============================================================
  const dc =
    info.node_location ||
    info.node_datacenter ||
    'N/A';
  // ============================================================
  // IP
  // ============================================================
  let ip =
    'N/A';
  if (
    Array.isArray(
      info.ip_addresses
    )
  ) {
    ip =
      info.ip_addresses.length
        ? info.ip_addresses[0]
        : 'N/A';
  } else {
    ip =
      info.ip_address ||
      info.ip ||
      info.ip_addresses ||
      'N/A';
  }
  // ============================================================
  // VPS 状态
  // ============================================================
  const isRunning =
    (
      info.ve_status ===
        'running' ||
      info.status ===
        'running' ||
      info.power_status ===
        'running' ||
      info.online === true
    );
  const statusText =
    isRunning
      ? 'Running'
      : (
          info.ve_status ||
          info.status ||
          'Running'
        );
  const statusColor =
    isRunning
      ? C.green
      : C.orange;
  // ============================================================
  // 运行时间
  // ============================================================
  let bootStr =
    'N/A';
  let runtimeStr =
    'N/A';
  if (
    info.start_time
  ) {
    const startTime =
      num(
        info.start_time
      );
    const bootDate =
      new Date(
        startTime * 1000
      );
    if (
      !isNaN(
        bootDate.getTime()
      )
    ) {
      bootStr =
        fmtBeijingTime(
          startTime
        );
    }
    const uptime =
      Math.floor(
        Date.now() /
        1000
      ) -
      startTime;
    if (
      uptime > 0
    ) {
      runtimeStr =
        fmtTime(
          uptime
        );
    }
  }
  if (
    runtimeStr === 'N/A' &&
    info.uptime
  ) {
    runtimeStr =
      fmtTime(
        info.uptime
      );
  }
  // ============================================================
  // 今日流量
  // ============================================================
  let todayTraffic =
    null;
  try {
    const statsUrl =
      'https://api.64clouds.com/v1/getRawUsageStats' +
      '?veid=' +
      encodeURIComponent(veid) +
      '&api_key=' +
      encodeURIComponent(apiKey);
    const statsResp =
      await ctx.http.get(
        statsUrl,
        {
          timeout: 15000
        }
      );
    const stats =
      await statsResp.json();
    if (
      stats &&
      stats.error === 0 &&
      Array.isArray(
        stats.data
      )
    ) {
      const now =
        new Date();
      // 今天北京时间 00:00
      const bjNow =
        new Date(
          now.getTime() +
          8 * 60 * 60 * 1000
        );
      const bjYear =
        bjNow.getUTCFullYear();
      const bjMonth =
        bjNow.getUTCMonth();
      const bjDay =
        bjNow.getUTCDate();
      // 北京时间今天 00:00
      // 转成 Unix 时间戳
      const startOfDay =
        Date.UTC(
          bjYear,
          bjMonth,
          bjDay,
          0,
          0,
          0
        ) / 1000 -
        8 * 60 * 60;
      const endTimestamp =
        Math.floor(
          Date.now() /
          1000
        );
      let totalToday =
        0;
      for (
        const item of stats.data
      ) {
        if (!item) {
          continue;
        }
        const timestamp =
          num(
            item.timestamp
          );
        if (
          timestamp <
            startOfDay ||
          timestamp >
            endTimestamp
        ) {
          continue;
        }
        const networkIn =
          num(
            item.network_in_bytes
          );
        const networkOut =
          num(
            item.network_out_bytes
          );
        totalToday +=
          networkIn +
          networkOut;
      }
      todayTraffic =
        totalToday;
    }
  } catch (e) {
    todayTraffic =
      null;
  }
  const todayStr =
    todayTraffic != null
      ? fmtBytes(
          todayTraffic
        )
      : 'N/A';
  // ============================================================
  // 颜色
  // ============================================================
  const trafficColor =
    pct < 70
      ? C.green
      : pct < 90
        ? C.orange
        : C.red;
  const memoryColor =
    memPct == null
      ? C.purple
      : (
          memPct < 70
            ? C.green
            : memPct < 90
              ? C.orange
              : C.red
        );
  // ============================================================
  // 中号 Widget
  // ============================================================
  if (
    ctx.widgetFamily ===
    'systemMedium'
  ) {
    const barFill =
      Math.max(
        1,
        Math.min(
          100,
          pct
        )
      );
    return {
      type: 'widget',
      backgroundColor:
        C.bg,
      padding: 12,
      children: [
        {
          type: 'stack',
          direction: 'row',
          gap: 10,
          children: [
            // ==================================================
            // 左栏
            // ==================================================
            {
              type: 'stack',
              direction: 'column',
              gap: 5,
              flex: 1,
              children: [
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  gap: 5,
                  children: [
                    {
                      type: 'image',
                      src:
                        'sf-symbol:server.rack',
                      color:
                        C.blue,
                      width: 15,
                      height: 15
                    },
                    {
                      type: 'text',
                      text:
                        'BWH VPS',
                      font: {
                        size: 'headline',
                        weight: 'bold'
                      },
                      textColor:
                        C.t1
                    }
                  ]
                },
                // 今日流量
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'text',
                      text:
                        '今日流量',
                      font: {
                        size: 'caption1',
                        weight: 'medium'
                      },
                      textColor:
                        C.t3,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        todayStr,
                      font: {
                        size: 'subheadline',
                        weight: 'bold'
                      },
                      textColor:
                        C.orange
                    }
                  ]
                },
                // 月流量
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'text',
                      text:
                        '月流量',
                      font: {
                        size: 'caption1',
                        weight: 'medium'
                      },
                      textColor:
                        C.t3,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        pct + '%',
                      font: {
                        size: 'subheadline',
                        weight: 'bold'
                      },
                      textColor:
                        trafficColor
                    }
                  ]
                },
                // 进度条
                {
                  type: 'stack',
                  direction: 'row',
                  height: 5,
                  borderRadius: 3,
                  backgroundColor:
                    C.track,
                  children: [
                    {
                      type: 'stack',
                      flex:
                        barFill,
                      height: 5,
                      backgroundColor:
                        trafficColor,
                      borderRadius: 3,
                      children: []
                    },
                    {
                      type: 'spacer',
                      flex:
                        Math.max(
                          0,
                          100 -
                          barFill
                        ),
                      length: 0
                    }
                  ]
                },
                // 已用 / 总流量
                {
                  type: 'text',
                  text:
                    usedStr +
                    ' / ' +
                    totalStr,
                  font: {
                    size: 'caption2',
                    weight: 'medium'
                  },
                  textColor:
                    C.t2,
                  maxLines: 1
                }
              ]
            },
            // ==================================================
            // 中间分隔线
            // ==================================================
            {
              type: 'stack',
              width: 1,
              backgroundColor:
                C.track,
              children: []
            },
            // ==================================================
            // 右栏
            // ==================================================
            {
              type: 'stack',
              direction: 'column',
              gap: 5,
              flex: 1,
              children: [
                // 状态 + 机房
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'image',
                      src:
                        'sf-symbol:circle.fill',
                      color:
                        statusColor,
                      width: 7,
                      height: 7
                    },
                    {
                      type: 'spacer',
                      length: 5
                    },
                    {
                      type: 'text',
                      text:
                        statusText,
                      font: {
                        size: 'caption1',
                        weight: 'semibold'
                      },
                      textColor:
                        statusColor,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        dc,
                      font: {
                        size: 'caption2'
                      },
                      textColor:
                        C.t3,
                      maxLines: 1,
                      minScale: 0.55
                    }
                  ]
                },
                // 内存
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'image',
                      src:
                        'sf-symbol:memorychip',
                      color:
                        memoryColor,
                      width: 13,
                      height: 13
                    },
                    {
                      type: 'spacer',
                      length: 5
                    },
                    {
                      type: 'text',
                      text:
                        '内存',
                      font: {
                        size: 'caption1'
                      },
                      textColor:
                        C.t3,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        memStr,
                      font: {
                        size: 'caption2',
                        weight: 'medium'
                      },
                      textColor:
                        memoryColor,
                      maxLines: 1,
                      minScale: 0.5
                    }
                  ]
                },
                // IP
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'image',
                      src:
                        'sf-symbol:network',
                      color:
                        C.blue,
                      width: 13,
                      height: 13
                    },
                    {
                      type: 'spacer',
                      length: 5
                    },
                    {
                      type: 'text',
                      text:
                        'IP',
                      font: {
                        size: 'caption1'
                      },
                      textColor:
                        C.t3,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        String(ip),
                      font: {
                        size: 'caption2',
                        weight: 'medium'
                      },
                      textColor:
                        C.t2,
                      maxLines: 1,
                      minScale: 0.4
                    }
                  ]
                },
                // 重置时间
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems:
                    'center',
                  children: [
                    {
                      type: 'image',
                      src:
                        'sf-symbol:arrow.clockwise',
                      color:
                        C.t4,
                      width: 12,
                      height: 12
                    },
                    {
                      type: 'spacer',
                      length: 5
                    },
                    {
                      type: 'text',
                      text:
                        '重置',
                      font: {
                        size: 'caption1'
                      },
                      textColor:
                        C.t3,
                      flex: 1
                    },
                    {
                      type: 'text',
                      text:
                        resetStr,
                      font: {
                        size: 'caption2',
                        weight: 'medium'
                      },
                      textColor:
                        C.t2,
                      maxLines: 1,
                      minScale: 0.45
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }
  // ============================================================
  // 小号 Widget
  // ============================================================
  if (
    ctx.widgetFamily ===
    'systemSmall'
  ) {
    return {
      type: 'widget',
      backgroundColor:
        C.bg,
      padding: 12,
      gap: 5,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems:
            'center',
          gap: 5,
          children: [
            {
              type: 'image',
              src:
                'sf-symbol:server.rack',
              color:
                C.blue,
              width: 14,
              height: 14
            },
            {
              type: 'text',
              text:
                'BWH',
              font: {
                size: 'caption1',
                weight: 'bold'
              },
              textColor:
                C.blue
            }
          ]
        },
        {
          type: 'text',
          text:
            '今日 ' +
            todayStr,
          font: {
            size: 'caption1',
            weight: 'semibold'
          },
          textColor:
            C.orange
        },
        {
          type: 'text',
          text:
            pct + '%',
          font: {
            size: 'title2',
            weight: 'bold'
          },
          textColor:
            trafficColor
        },
        {
          type: 'text',
          text:
            usedStr +
            ' / ' +
            totalStr,
          font: {
            size: 'caption2'
          },
          textColor:
            C.t3,
          maxLines: 1
        },
        {
          type: 'stack',
          direction: 'row',
          height: 5,
          borderRadius: 3,
          backgroundColor:
            C.track,
          children: [
            {
              type: 'stack',
              flex:
                Math.max(
                  1,
                  pct
                ),
              height: 5,
              backgroundColor:
                trafficColor,
              borderRadius: 3,
              children: []
            },
            {
              type: 'spacer',
              flex:
                Math.max(
                  0,
                  100 -
                  pct
                ),
              length: 0
            }
          ]
        },
        {
          type: 'text',
          text:
            dc,
          font: {
            size: 'caption2'
          },
          textColor:
            C.t4,
          maxLines: 1,
          minScale: 0.6
        }
      ]
    };
  }
  // ============================================================
  // 锁屏矩形
  // ============================================================
  if (
    ctx.widgetFamily ===
    'accessoryRectangular'
  ) {
    return {
      type: 'widget',
      padding: [
        2,
        4,
        2,
        4
      ],
      gap: 2,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems:
            'center',
          gap: 4,
          children: [
            {
              type: 'image',
              src:
                'sf-symbol:server.rack',
              color:
                C.blue,
              width: 11,
              height: 11
            },
            {
              type: 'text',
              text:
                'BWH',
              font: {
                size: 'caption2',
                weight: 'bold'
              },
              textColor:
                C.t1
            },
            {
              type: 'spacer'
            },
            {
              type: 'text',
              text:
                statusText,
              font: {
                size: 'caption2',
                weight: 'semibold'
              },
              textColor:
                statusColor
            }
          ]
        },
        {
          type: 'text',
          text:
            '今日 ' +
            todayStr +
            ' · ' +
            pct +
            '%',
          font: {
            size: 'caption2'
          },
          textColor:
            C.t2,
          maxLines: 1
        },
        {
          type: 'text',
          text:
            '重置 ' +
            resetStr,
          font: {
            size: 'caption2'
          },
          textColor:
            C.t3,
          maxLines: 1,
          minScale: 0.55
        }
      ]
    };
  }
  // ============================================================
  // 锁屏内联
  // ============================================================
  if (
    ctx.widgetFamily ===
    'accessoryInline'
  ) {
    return {
      type: 'widget',
      children: [
        {
          type: 'text',
          text:
            'BWH 今日 ' +
            todayStr +
            ' · ' +
            pct +
            '%',
          font: {
            size: 'caption1'
          },
          textColor:
            C.t1,
          maxLines: 1
        }
      ]
    };
  }
  // ============================================================
  // 其他尺寸默认布局
  // ============================================================
  return {
    type: 'widget',
    backgroundColor:
      C.bg,
    padding: 14,
    gap: 8,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems:
          'center',
        gap: 6,
        children: [
          {
            type: 'image',
            src:
              'sf-symbol:server.rack',
            color:
              C.blue,
            width: 17,
            height: 17
          },
          {
            type: 'text',
            text:
              'BandwagonHost',
            font: {
              size: 'headline',
              weight: 'bold'
            },
            textColor:
              C.t1,
            flex: 1
          },
          {
            type: 'text',
            text:
              statusText,
            font: {
              size: 'caption1',
              weight: 'semibold'
            },
            textColor:
              statusColor
          }
        ]
      },
      {
        type: 'stack',
        direction: 'row',
        gap: 8,
        children: [
          {
            type: 'stack',
            direction: 'column',
            gap: 4,
            flex: 1,
            backgroundColor:
              C.card,
            borderRadius: 9,
            padding: 9,
            children: [
              {
                type: 'text',
                text:
                  '今日流量',
                font: {
                  size: 'caption2'
                },
                textColor:
                  C.t3
              },
              {
                type: 'text',
                text:
                  todayStr,
                font: {
                  size: 'title3',
                  weight: 'bold'
                },
                textColor:
                  C.orange
              }
            ]
          },
          {
            type: 'stack',
            direction: 'column',
            gap: 4,
            flex: 1,
            backgroundColor:
              C.card,
            borderRadius: 9,
            padding: 9,
            children: [
              {
                type: 'text',
                text:
                  '月流量',
                font: {
                  size: 'caption2'
                },
                textColor:
                  C.t3
              },
              {
                type: 'text',
                text:
                  pct + '%',
                font: {
                  size: 'title3',
                  weight: 'bold'
                },
                textColor:
                  trafficColor
              }
            ]
          }
        ]
      },
      {
        type: 'text',
        text:
          usedStr +
          ' / ' +
          totalStr +
          '    重置 ' +
          resetStr,
        font: {
          size: 'caption2'
        },
        textColor:
          C.t3,
        maxLines: 1,
        minScale: 0.5
      }
    ]
  };
}