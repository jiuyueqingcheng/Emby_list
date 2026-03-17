// BWH流量小组件 for Egern
// 环境变量（在 widgets env 中配置）
// 登录https://bandwagonhost.com/clientarea.php,-->Services-->My Services-->点击齿轮-->Open KiWiVM-->左侧栏API
// VEID: 你的 BandwagonHost VPS ID,比如：191977830
// API_KEY: 你的 BandwagonHost API Key,比如：private_xxxxx

export default async function (ctx) {
  const veid   = ctx.env.VEID;
  const apiKey = ctx.env.API_KEY;

  function toGB(bytes) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  function barColor(ratio) {
    if (ratio >= 0.9) return '#FF453A';
    if (ratio >= 0.7) return '#FF9F0A';
    return '#30D158';
  }

  // 全局 iOS 深浅色定义
  const COLORS = {
    bg:      { light: '#F2F2F7', dark: '#1C1C1E' },
    text:    { light: '#000000', dark: '#FFFFFF' },
    subText: { light: '#3C3C43', dark: '#EBEBF5' },
    gray:    { light: '#8E8E93', dark: '#8E8E93' },
  };

  function errorWidget(msg) {
    return {
      type: 'widget',
      background: COLORS.bg,
      padding: 16,
      gap: 8,
      children: [
        {
          type: 'image',
          src: 'sf-symbol:exclamationmark.triangle.fill',
          color: '#FF9F0A',
          width: 22,
          height: 22,
        },
        {
          type: 'text',
          text: msg,
          font: { size: 'footnote' },
          textColor: '#FF453A',
          maxLines: 3,
        },
      ],
    };
  }

  if (!veid || !apiKey) return errorWidget('请在 env 中设置 VEID 和 API_KEY');

  let info;
  try {
    const resp = await ctx.http.get(
      `https://api.64clouds.com/v1/getLiveServiceInfo?veid=${veid}&api_key=${apiKey}`,
      { timeout: 10000 }
    );
    info = await resp.json();
  } catch (e) {
    return errorWidget('请求失败: ' + e.message);
  }

  if (info.error !== 0) return errorWidget('API 错误 #' + info.error);

  const totalBytes = info.plan_monthly_data;
  const usedBytes  = info.data_counter;
  const resetISO   = new Date(info.data_next_reset * 1000).toISOString();

  const ratio     = Math.min(usedBytes / totalBytes, 1);
  const pct       = (ratio * 100).toFixed(1);
  const color     = barColor(ratio);
  const usedStr   = toGB(usedBytes);
  const totalStr  = toGB(totalBytes);
  const remainStr = toGB(Math.max(totalBytes - usedBytes, 0));

  const statusText = info.ve_status === 'running' ? '运行中'
    : info.ve_status === 'starting' ? '启动中'
    : '已关机';

  const statusColor = info.ve_status === 'running' ? '#30D158'
    : info.ve_status === 'starting' ? '#FF9F0A'
    : '#FF453A';

  // 锁屏圆形
  if (ctx.widgetFamily === 'accessoryCircular') {
    return {
      type: 'widget',
      padding: 2,
      gap: 1,
      children: [
        {
          type: 'text',
          text: pct + '%',
          font: { size: 'title2', weight: 'bold' },
          textColor: color,
          textAlign: 'center',
          maxLines: 1,
        },
        {
          type: 'text',
          text: 'BWH',
          font: { size: 'caption2' },
          textColor: COLORS.gray,
          textAlign: 'center',
          maxLines: 1,
        },
      ],
    };
  }

  // 锁屏矩形
  if (ctx.widgetFamily === 'accessoryRectangular') {
    return {
      type: 'widget',
      padding: [2, 4, 2, 4],
      gap: 3,
      children: [
        {
          type: 'text',
          text: 'BWH 流量监控',
          font: { size: 'headline', weight: 'bold' },
          textColor: COLORS.text,
          maxLines: 1,
        },
        {
          type: 'text',
          text: `已用 ${usedStr} / ${totalStr}  (${pct}%)`,
          font: { size: 'body' },
          textColor: COLORS.subText,
          maxLines: 1,
          minScale: 0.8,
        },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            {
              type: 'text',
              text: '重置：',
              font: { size: 'footnote' },
              textColor: COLORS.gray,
            },
            {
              type: 'date',
              date: resetISO,
              format: 'relative',
              font: { size: 'footnote', weight: 'medium' },
              textColor: COLORS.subText,
            },
          ],
        },
      ],
    };
  }

  // 小部件 —— 进度条加长20%
  if (ctx.widgetFamily === 'systemSmall') {
    const BAR = 12;
    const f   = Math.round(ratio * BAR);
    const bar = '█'.repeat(f) + '░'.repeat(BAR - f);
    return {
      type: 'widget',
      background: COLORS.bg,
      padding: 14,
      gap: 6,
      children: [
        {
          type: 'text',
          text: 'BandwagonHost',
          font: { size: 'caption1', weight: 'semibold' },
          textColor: { light: '#007AFF', dark: '#64D2FF' },
          maxLines: 1,
          minScale: 0.7,
        },
        {
          type: 'text',
          text: pct + '%',
          font: { size: 'title', weight: 'bold' },
          textColor: color,
          maxLines: 1,
        },
        {
          type: 'text',
          text: bar,
          font: { size: 10, family: 'Menlo' },
          textColor: color,
          maxLines: 1,
        },
        {
          type: 'text',
          text: usedStr + ' / ' + totalStr,
          font: { size: 'caption2', weight: 'medium' },
          textColor: COLORS.subText,
          maxLines: 1,
          minScale: 0.8,
        },
        { type: 'spacer' },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            {
              type: 'image',
              src: 'sf-symbol:arrow.clockwise',
              color: COLORS.gray,
              width: 10,
              height: 10,
            },
            {
              type: 'date',
              date: resetISO,
              format: 'relative',
              font: { size: 'caption2' },
              textColor: COLORS.gray,
              maxLines: 1,
            },
          ],
        },
      ],
    };
  }

  // 中/大号 —— 进度条加长20%
  const BAR_LEN = 26;
  const filled  = Math.round(ratio * BAR_LEN);
  const barStr  = '█'.repeat(filled) + '░'.repeat(BAR_LEN - filled);

  return {
    type: 'widget',
    background: COLORS.bg,
    padding: 16,
    gap: 8,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 8,
        children: [
          {
            type: 'image',
            src: 'sf-symbol:server.rack',
            color: { light: '#007AFF', dark: '#64D2FF' },
            width: 18,
            height: 18,
          },
          {
            type: 'text',
            text: 'BandwagonHost',
            font: { size: 'headline', weight: 'bold' },
            textColor: COLORS.text,
            flex: 1,
            maxLines: 1,
          },
          {
            type: 'image',
            src: 'sf-symbol:circle.fill',
            color: statusColor,
            width: 8,
            height: 8,
          },
          {
            type: 'text',
            text: statusText,
            font: { size: 'caption1' },
            textColor: statusColor,
            maxLines: 1,
          },
        ],
      },
      {
        type: 'text',
        text: barStr,
        font: { size: 11, family: 'Menlo' },
        textColor: color,
        maxLines: 1,
      },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 4,
        children: [
          {
            type: 'text',
            text: '已用',
            font: { size: 'subheadline' },
            textColor: COLORS.gray,
          },
          {
            type: 'text',
            text: usedStr,
            font: { size: 'subheadline', weight: 'bold' },
            textColor: color,
          },
          {
            type: 'text',
            text: '/ ' + totalStr,
            font: { size: 'subheadline' },
            textColor: COLORS.gray,
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: pct + '%',
            font: { size: 'title3', weight: 'bold' },
            textColor: color,
          },
        ],
      },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 4,
        children: [
          {
            type: 'image',
            src: 'sf-symbol:tray.fill',
            color: COLORS.gray,
            width: 12,
            height: 12,
          },
          {
            type: 'text',
            text: '剩余 ' + remainStr,
            font: { size: 'footnote' },
            textColor: COLORS.subText,
          },
        ],
      },
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        children: [
          {
            type: 'image',
            src: 'sf-symbol:arrow.clockwise.circle',
            color: COLORS.gray,
            width: 13,
            height: 13,
          },
          {
            type: 'text',
            text: '重置日期：',
            font: { size: 'footnote' },
            textColor: COLORS.gray,
          },
          {
            type: 'date',
            date: resetISO,
            format: 'date',
            font: { size: 'footnote', weight: 'medium' },
            textColor: COLORS.text,
          },
          { type: 'spacer' },
          {
            type: 'date',
            date: resetISO,
            format: 'relative',
            font: { size: 'footnote' },
            textColor: COLORS.gray,
          },
        ],
      },
    ],
  };
}