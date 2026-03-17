// VEID: 你的 BandwagonHost VPS ID
// API_KEY: 你的 BandwagonHost API Key

export default async function (ctx) {
  const veid   = ctx.env.VEID;
  const apiKey = ctx.env.API_KEY;

  function toGB(bytes) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  function toGBFromKB(kb) {
    return (kb / 1048576).toFixed(2) + ' GB';
  }

  function barColor(ratio) {
    if (ratio >= 0.9) return '#FF453A';
    if (ratio >= 0.7) return '#FF9F0A';
    return '#30D158';
  }

  // 👇 这里改成了 iOS 官方浅色/深色配色
  const C = {
    bg1:       { light: '#F2F2F7', dark: '#1C1C1E' },
    bg2:       { light: '#F2F2F7', dark: '#1C1C1E' },
    bg3:       { light: '#F2F2F7', dark: '#1C1C1E' },
    title:     { light: '#000000', dark: '#FFFFFF' },
    accent:    { light: '#007AFF', dark: '#007AFF' },
    subtext:   { light: '#3C3C43', dark: '#EBEBF5' },
    dimtext:   { light: '#686873', dark: '#8E8E93' },
    fainttext: { light: '#8E8E93', dark: '#636366' },
    bodytext:  { light: '#000000', dark: '#FFFFFF' },
    resettext: { light: '#686873', dark: '#8E8E93' },
  };

  function errorWidget(msg) {
    return {
      type: 'widget',
      backgroundGradient: {
        type: 'linear',
        colors: [C.bg1, C.bg2],
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1, y: 1 },
      },
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

  const totalBytes   = info.plan_monthly_data;
  const usedBytes    = info.data_counter;
  const trafficRatio = Math.min(usedBytes / totalBytes, 1);
  const trafficPct   = (trafficRatio * 100).toFixed(1);
  const usedStr      = toGB(usedBytes);
  const totalStr     = toGB(totalBytes);
  const remainStr    = toGB(Math.max(totalBytes - usedBytes, 0));
  const trafficColor = barColor(trafficRatio);

  const ramTotalKB  = info.plan_ram / 1024;
  const ramAvailKB  = info.mem_available_kb;
  const ramUsedKB   = ramTotalKB - ramAvailKB;
  const ramRatio    = Math.min(ramUsedKB / ramTotalKB, 1);
  const ramPct      = (ramRatio * 100).toFixed(1);
  const ramUsedStr  = toGBFromKB(ramUsedKB);
  const ramTotalStr = toGBFromKB(ramTotalKB);
  const ramColor    = barColor(ramRatio);

  const diskTotal    = info.plan_disk;
  const diskUsed     = info.ve_used_disk_space_b;
  const diskRatio    = Math.min(diskUsed / diskTotal, 1);
  const diskPct      = (diskRatio * 100).toFixed(1);
  const diskUsedStr  = toGB(diskUsed);
  const diskTotalStr = toGB(diskTotal);
  const diskColor    = barColor(diskRatio);

  const resetISO    = new Date(info.data_next_reset * 1000).toISOString();
  const location    = info.node_location || '—';
  const statusText  = info.ve_status === 'running' ? '运行中'
    : info.ve_status === 'starting' ? '启动中'
    : '已关机';
  const statusColor = info.ve_status === 'running' ? '#30D158'
    : info.ve_status === 'starting' ? '#FF9F0A'
    : '#FF453A';

  const BG = {
    type: 'linear',
    colors: [C.bg1, C.bg2, C.bg3],
    stops: [0, 0.5, 1],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };

  function metricRow(icon, iconColor, label, usedS, totalS, pct, color, barLen) {
    const f   = Math.round((pct / 100) * barLen);
    const bar = '█'.repeat(f) + '░'.repeat(barLen - f);
    return {
      type: 'stack',
      direction: 'column',
      gap: 0,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            { type: 'image', src: 'sf-symbol:' + icon, color: iconColor, width: 10, height: 10 },
            { type: 'text', text: label, font: { size: 'caption2' }, textColor: C.subtext, maxLines: 1 },
            { type: 'spacer' },
            { type: 'text', text: usedS + ' / ' + totalS, font: { size: 'caption2', weight: 'medium' }, textColor: C.bodytext, maxLines: 1, minScale: 0.8 },
            { type: 'text', text: pct + '%', font: { size: 'caption2', weight: 'bold' }, textColor: color, maxLines: 1 },
          ],
        },
        { type: 'text', text: bar, font: { size: 7, family: 'Menlo' }, textColor: color, maxLines: 1 },
      ],
    };
  }

  if (ctx.widgetFamily === 'accessoryCircular') {
    return {
      type: 'widget',
      padding: 2,
      gap: 1,
      children: [
        {
          type: 'text',
          text: trafficPct + '%',
          font: { size: 'title2', weight: 'bold' },
          textColor: trafficColor,
          textAlign: 'center',
          maxLines: 1,
        },
        {
          type: 'text',
          text: 'BWH',
          font: { size: 'caption2' },
          textColor: C.resettext,
          textAlign: 'center',
          maxLines: 1,
        },
      ],
    };
  }

  if (ctx.widgetFamily === 'accessoryRectangular') {
    return {
      type: 'widget',
      padding: [2, 4, 2, 4],
      gap: 3,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 5,
          children: [
            { type: 'image', src: 'sf-symbol:circle.fill', color: statusColor, width: 8, height: 8 },
            { type: 'text', text: 'BWH · ' + statusText, font: { size: 'headline', weight: 'bold' }, maxLines: 1 },
          ],
        },
        { type: 'text', text: '流量 ' + usedStr + ' / ' + totalStr + ' (' + trafficPct + '%)', font: { size: 'body' }, maxLines: 1, minScale: 0.8 },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            { type: 'text', text: '重置：', font: { size: 'footnote' } },
            { type: 'date', date: resetISO, format: 'relative', font: { size: 'footnote', weight: 'medium' } },
          ],
        },
      ],
    };
  }

  if (ctx.widgetFamily === 'systemSmall') {
    const BAR = 10;
    const tf  = Math.round(trafficRatio * BAR);
    const bar = '█'.repeat(tf) + '░'.repeat(BAR - tf);
    return {
      type: 'widget',
      backgroundGradient: BG,
      padding: 12,
      gap: 3,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            { type: 'image', src: 'sf-symbol:server.rack', color: C.accent, width: 11, height: 11 },
            { type: 'text', text: 'BandwagonHost', font: { size: 'caption1', weight: 'semibold' }, textColor: C.accent, flex: 1, maxLines: 1, minScale: 0.7 },
            { type: 'image', src: 'sf-symbol:circle.fill', color: statusColor, width: 7, height: 7 },
            { type: 'text', text: statusText, font: { size: 'caption2' }, textColor: statusColor, maxLines: 1 },
          ],
        },
        { type: 'text', text: trafficPct + '%', font: { size: 'title', weight: 'bold' }, textColor: trafficColor, maxLines: 1 },
        { type: 'text', text: bar, font: { size: 10, family: 'Menlo' }, textColor: trafficColor, maxLines: 1 },
        { type: 'text', text: usedStr + ' / ' + totalStr, font: { size: 'caption2', weight: 'medium' }, textColor: C.bodytext, maxLines: 1, minScale: 0.8 },
        { type: 'spacer' },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 4,
          children: [
            { type: 'image', src: 'sf-symbol:arrow.clockwise', color: C.fainttext, width: 9, height: 9 },
            { type: 'date', date: resetISO, format: 'relative', font: { size: 'caption2' }, textColor: C.resettext, maxLines: 1 },
          ],
        },
      ],
    };
  }

  if (ctx.widgetFamily === 'systemMedium') {
    return {
      type: 'widget',
      backgroundGradient: BG,
      padding: 14,
      gap: 5,
      children: [
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 7,
          children: [
            { type: 'image', src: 'sf-symbol:server.rack', color: C.accent, width: 15, height: 15 },
            { type: 'text', text: 'BandwagonHost', font: { size: 'headline', weight: 'bold' }, textColor: C.title, flex: 1, maxLines: 1 },
            { type: 'image', src: 'sf-symbol:circle.fill', color: statusColor, width: 7, height: 7 },
            { type: 'text', text: statusText, font: { size: 'caption1' }, textColor: statusColor, maxLines: 1 },
          ],
        },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 5,
          children: [
            { type: 'image', src: 'sf-symbol:location.fill', color: C.fainttext, width: 9, height: 9 },
            { type: 'text', text: location, font: { size: 'caption1' }, textColor: C.subtext, flex: 1, maxLines: 1 },
            { type: 'image', src: 'sf-symbol:arrow.clockwise', color: C.fainttext, width: 9, height: 9 },
            { type: 'date', date: resetISO, format: 'relative', font: { size: 'caption1' }, textColor: C.resettext, maxLines: 1 },
          ],
        },
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'start',
          gap: 4,
          children: [
            {
              type: 'stack', direction: 'column', gap: 0, flex: 1,
              children: [
                { type: 'text', text: '流量', font: { size: 'caption2' }, textColor: C.subtext },
                { type: 'text', text: trafficPct + '%', font: { size: 'title3', weight: 'bold' }, textColor: trafficColor, maxLines: 1 },
                { type: 'text', text: usedStr, font: { size: 'caption2', weight: 'medium' }, textColor: C.bodytext, maxLines: 1, minScale: 0.8 },
                { type: 'text', text: '剩 ' + remainStr, font: { size: 'caption2' }, textColor: C.dimtext, maxLines: 1, minScale: 0.8 },
              ],
            },
            {
              type: 'stack', direction: 'column', gap: 0, flex: 1,
              children: [
                { type: 'text', text: '内存', font: { size: 'caption2' }, textColor: C.subtext },
                { type: 'text', text: ramPct + '%', font: { size: 'title3', weight: 'bold' }, textColor: ramColor, maxLines: 1 },
                { type: 'text', text: ramUsedStr, font: { size: 'caption2', weight: 'medium' }, textColor: C.bodytext, maxLines: 1, minScale: 0.8 },
                { type: 'text', text: '共 ' + ramTotalStr, font: { size: 'caption2' }, textColor: C.dimtext, maxLines: 1, minScale: 0.8 },
              ],
            },
            {
              type: 'stack', direction: 'column', gap: 0, flex: 1,
              children: [
                { type: 'text', text: '磁盘', font: { size: 'caption2' }, textColor: C.subtext },
                { type: 'text', text: diskPct + '%', font: { size: 'title3', weight: 'bold' }, textColor: diskColor, maxLines: 1 },
                { type: 'text', text: diskUsedStr, font: { size: 'caption2', weight: 'medium' }, textColor: C.bodytext, maxLines: 1, minScale: 0.8 },
                { type: 'text', text: '共 ' + diskTotalStr, font: { size: 'caption2' }, textColor: C.dimtext, maxLines: 1, minScale: 0.8 },
              ],
            },
          ],
        },
      ],
    };
  }

  const BAR_LEN = 26;
  return {
    type: 'widget',
    backgroundGradient: BG,
    padding: 14,
    gap: 1,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 7,
        children: [
          { type: 'image', src: 'sf-symbol:server.rack', color: C.accent, width: 16, height: 16 },
          { type: 'text', text: 'BandwagonHost', font: { size: 'headline', weight: 'bold' }, textColor: C.title, flex: 1, maxLines: 1 },
          { type: 'image', src: 'sf-symbol:circle.fill', color: statusColor, width: 8, height: 8 },
          { type: 'text', text: statusText, font: { size: 'caption1' }, textColor: statusColor, maxLines: 1 },
        ],
      },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 3,
        children: [
          { type: 'image', src: 'sf-symbol:location.fill', color: C.fainttext, width: 10, height: 10 },
          { type: 'text', text: location, font: { size: 'footnote' }, textColor: C.subtext, maxLines: 1 },
        ],
      },
      metricRow('arrow.up.arrow.down', C.accent, '流量', usedStr, totalStr, trafficPct, trafficColor, BAR_LEN),
      metricRow('memorychip', '#BF5AF2', '内存', ramUsedStr, ramTotalStr, ramPct, ramColor, BAR_LEN),
      metricRow('internaldrive', '#FF9F0A', '磁盘', diskUsedStr, diskTotalStr, diskPct, diskColor, BAR_LEN),
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 5,
        children: [
          { type: 'image', src: 'sf-symbol:arrow.clockwise.circle', color: C.fainttext, width: 12, height: 12 },
          { type: 'text', text: '重置日期：', font: { size: 'footnote' }, textColor: C.fainttext },
          { type: 'date', date: resetISO, format: 'date', font: { size: 'footnote', weight: 'medium' }, textColor: C.bodytext },
          { type: 'spacer' },
          { type: 'date', date: resetISO, format: 'relative', font: { size: 'footnote' }, textColor: C.resettext },
        ],
      },
    ],
  };
}