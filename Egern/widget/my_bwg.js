// Generated: 2026-03-18 04:44:00 UTC
export default async function (ctx) {
  const veid   = ctx.env.VEID;
  const apiKey = ctx.env.API_KEY;

  // ── iOS 26 系统原生 浅色/深色模式配色 ──────────────────────
  const C = {
    // 小组件底色（iOS 系统标准背景）
    bg:           { light: '#F2F2F7',    dark: '#1C1C1E' },
    // 卡片背景
    card:         { light: '#FFFFFF',    dark: '#2C2C2E' },
    // 进度条底层轨道
    track:        { light: '#E5E5EA',    dark: '#3A3A3C' },
    // 角标背景
    badge:        { light: '#E5E5EA',    dark: '#3A3A3C' },

    // 文字（完全跟随iOS系统字体颜色）
    t1:           { light: '#000000',    dark: '#FFFFFF' },   // 主标题、数值
    t2:           { light: '#3C3C43',    dark: '#EBEBF5' },   // 次级正文
    t3:           { light: '#6C6C70',    dark: '#8E8E93' },   // 辅助信息
    t4:           { light: '#AEAEB2',    dark: '#636366' },   // 最弱提示

    // iOS 原生系统强调色
    blue:         '#007AFF',
    purple:       '#AF52DE',
    green:        '#34C759',
    orange:       '#FF9500',
    red:          '#FF3B30',
  };

  // ── 错误视图 ──────────────────────────────────────────────
  function errorWidget(msg) {
    return {
      type: 'widget',
      backgroundColor: C.bg,
      padding: 16,
      gap: 8,
      children: [
        {
          type: 'stack', direction: 'row', alignItems: 'center', gap: 6,
          children: [
            { type: 'image', src: 'sf-symbol:exclamationmark.triangle.fill', color: C.orange, width: 16, height: 16 },
            { type: 'text', text: 'BandwagonHost', font: { size: 'caption1', weight: 'semibold' }, textColor: C.orange },
          ],
        },
        { type: 'text', text: msg, font: { size: 'caption2' }, textColor: C.red },
      ],
    };
  }

  // ── 参数校验 ──────────────────────────────────────────────
  if (!veid || !apiKey) {
    return errorWidget('请在 env 中配置 VEID 和 API_KEY');
  }

  // ── 拉取数据 ──────────────────────────────────────────────
  let info;
  try {
    const url = `https://api.64clouds.com/v1/getLiveServiceInfo?veid=${veid}&api_key=${apiKey}`;
    const resp = await ctx.http.get(url, { timeout: 15000 });
    info = await resp.json();
  } catch (e) {
    return errorWidget('请求失败: ' + e.message);
  }

  if (!info || info.error !== 0) {
    return errorWidget('API 错误: ' + (info ? info.message : '无响应'));
  }

  // ── 数据处理 ──────────────────────────────────────────────
  function fmtBytes(bytes) {
    if (bytes == null) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let val = bytes, i = 0;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return val.toFixed(i === 0 ? 0 : 2) + ' ' + units[i];
  }

  function fmtMemKb(kb) {
    if (kb == null) return 'N/A';
    if (kb >= 1024 * 1024) return (kb / 1024 / 1024).toFixed(2) + ' GB';
    if (kb >= 1024) return (kb / 1024).toFixed(0) + ' MB';
    return kb + ' KB';
  }

  const used     = info.data_counter || 0;
  const total    = info.plan_monthly_data || 0;
  const ratio    = total > 0 ? used / total : 0;
  const pct      = Math.round(ratio * 100);
  const usedStr  = fmtBytes(used);
  const totalStr = fmtBytes(total);

  const planRamKb  = info.plan_ram != null ? Math.round(info.plan_ram / 1024) : null;
  const memAvailKb = info.mem_available_kb;
  const memUsedKb  = (planRamKb != null && memAvailKb != null) ? planRamKb - memAvailKb : null;
  const memStr     = memUsedKb != null
    ? `${fmtMemKb(memUsedKb)} / ${fmtMemKb(planRamKb)}`
    : 'N/A';

  let resetStr = 'N/A';
  if (info.data_next_reset) {
    const d = new Date(info.data_next_reset * 1000);
    resetStr = `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  const dc       = info.node_location || 'N/A';
  const barColor = pct < 70 ? C.green : pct < 90 ? C.orange : C.red;

  // ── 锁屏矩形 ─────────────────────────────────────────────
  if (ctx.widgetFamily === 'accessoryRectangular') {
    return {
      type: 'widget',
      padding: [2, 4, 2, 4],
      gap: 2,
      children: [
        {
          type: 'stack', direction: 'row', alignItems: 'center', gap: 4,
          children: [
            { type: 'image', src: 'sf-symbol:network', color: C.blue, width: 12, height: 12 },
            { type: 'text', text: 'BandwagonHost', font: { size: 'caption2', weight: 'bold' }, maxLines: 1, textColor: C.t1 },
          ],
        },
        { type: 'text', text: `流量 ${usedStr} / ${totalStr}  ${pct}%`, font: { size: 'caption2' }, maxLines: 1, textColor: C.t2 },
        { type: 'text', text: `内存 ${memStr}  重置 ${resetStr}`, font: { size: 'caption2' }, maxLines: 1, textColor: C.t3 },
      ],
    };
  }

  // ── 锁屏内联 ─────────────────────────────────────────────
  if (ctx.widgetFamily === 'accessoryInline') {
    return {
      type: 'widget',
      children: [
        { type: 'text', text: `BWH 流量 ${pct}% · ${usedStr}/${totalStr}`, font: { size: 'caption1' }, maxLines: 1, textColor: C.t1 },
      ],
    };
  }

  // ── 主屏幕小尺寸 ──────────────────────────────────────────
  if (ctx.widgetFamily === 'systemSmall') {
    return {
      type: 'widget',
      backgroundColor: C.bg,
      padding: 14,
      gap: 6,
      children: [
        {
          type: 'stack', direction: 'row', alignItems: 'center', gap: 5,
          children: [
            { type: 'image', src: 'sf-symbol:server.rack', color: C.blue, width: 14, height: 14 },
            { type: 'text', text: 'BWH', font: { size: 'caption1', weight: 'heavy' }, textColor: C.blue },
          ],
        },
        { type: 'spacer' },
        { type: 'text', text: pct + '%', font: { size: 'title2', weight: 'bold' }, textColor: barColor },
        { type: 'text', text: `${usedStr}\n/ ${totalStr}`, font: { size: 'caption2' }, textColor: C.t3 },
        { type: 'spacer' },
        {
          type: 'stack', direction: 'row', alignItems: 'center', gap: 4,
          children: [
            { type: 'image', src: 'sf-symbol:location.fill', color: C.t4, width: 10, height: 10 },
            { type: 'text', text: dc, font: { size: 'caption2' }, textColor: C.t4, maxLines: 1, minScale: 0.6 },
          ],
        },
      ],
    };
  }

  // ── 主屏幕中/大尺寸（默认） ───────────────────────────────
  const BAR_FILL = Math.max(1, Math.round(ratio * 100));

  return {
    type: 'widget',
    backgroundColor: C.bg,
    padding: 16,
    gap: 10,
    children: [

      // ── 标题行 ──
      {
        type: 'stack', direction: 'row', alignItems: 'center', gap: 6,
        children: [
          { type: 'image', src: 'sf-symbol:server.rack', color: C.blue, width: 18, height: 18 },
          { type: 'text', text: 'BandwagonHost', font: { size: 'headline', weight: 'bold' }, textColor: C.t1, flex: 1 },
          {
            type: 'stack', direction: 'row', alignItems: 'center', gap: 3,
            backgroundColor: C.badge,
            borderRadius: 6,
            padding: [2, 6, 2, 6],
            children: [
              { type: 'image', src: 'sf-symbol:location.fill', color: C.t4, width: 10, height: 10 },
              { type: 'text', text: dc, font: { size: 'caption2' }, textColor: C.t3, maxLines: 1, minScale: 0.7 },
            ],
          },
        ],
      },

      // ── 流量区 ──
      {
        type: 'stack', direction: 'column', gap: 10,
        backgroundColor: C.card,
        borderRadius: 10,
        padding: [10, 12, 10, 12],
        children: [
          {
            type: 'stack', direction: 'row', alignItems: 'center',
            children: [
              { type: 'image', src: 'sf-symbol:arrow.up.arrow.down', color: C.blue, width: 13, height: 13 },
              { type: 'spacer', length: 5 },
              { type: 'text', text: '流量使用', font: { size: 'subheadline', weight: 'semibold' }, textColor: C.t2, flex: 1 },
              { type: 'text', text: pct + '%', font: { size: 'subheadline', weight: 'bold' }, textColor: barColor },
            ],
          },
          {
            type: 'stack', direction: 'row', height: 6, borderRadius: 3,
            backgroundColor: C.track,
            children: [
              { type: 'stack', flex: BAR_FILL, height: 6, backgroundColor: barColor, borderRadius: 3, children: [] },
              { type: 'spacer', length: 0, flex: Math.max(0, 100 - BAR_FILL) },
            ],
          },
          {
            type: 'stack', direction: 'row', alignItems: 'center',
            children: [
              { type: 'text', text: usedStr, font: { size: 'footnote', weight: 'medium' }, textColor: C.t1 },
              { type: 'text', text: ' / ' + totalStr, font: { size: 'footnote' }, textColor: C.t3 },
              { type: 'spacer' },
              {
                type: 'stack', direction: 'row', alignItems: 'center', gap: 3,
                children: [
                  { type: 'image', src: 'sf-symbol:arrow.clockwise', color: C.t4, width: 10, height: 10 },
                  { type: 'text', text: '重置 ' + resetStr, font: { size: 'caption2' }, textColor: C.t4 },
                ],
              },
            ],
          },
        ],
      },

      // ── 内存区 ──
      {
        type: 'stack', direction: 'row', alignItems: 'center', gap: 6,
        backgroundColor: C.card,
        borderRadius: 10,
        padding: [8, 12, 8, 12],
        children: [
          { type: 'image', src: 'sf-symbol:memorychip', color: C.purple, width: 14, height: 14 },
          { type: 'text', text: '内存', font: { size: 'footnote', weight: 'semibold' }, textColor: C.t2 },
          { type: 'spacer' },
          { type: 'text', text: memStr, font: { size: 'footnote', weight: 'medium' }, textColor: C.purple },
        ],
      },

    ],
  };
}