(() => {
  'use strict';

  const schedule = [
    { id: 'd1-wake', name: '起床、整理随身物品', start: '2026-10-02T06:30:00+08:00', end: '2026-10-02T07:00:00+08:00', day: 'day-1', zone: '中国时间 UTC+8' },
    { id: 'd1-leave', name: '从深圳出发前往机场码头', start: '2026-10-02T07:00:00+08:00', end: '2026-10-02T08:45:00+08:00', day: 'day-1', zone: '中国时间 UTC+8' },
    { id: 'd1-ferry', name: '拟乘坐：深圳机场码头 → 澳门氹仔码头', start: '2026-10-02T08:45:00+08:00', end: '2026-10-02T10:05:00+08:00', day: 'day-1', zone: '中国时间 UTC+8', pending: true },
    { id: 'd1-transfer', name: '下船、衔接前往澳门机场', start: '2026-10-02T10:05:00+08:00', end: '2026-10-02T11:45:00+08:00', day: 'day-1', zone: '澳门时间 UTC+8' },
    { id: 'd1-flight', name: '澳门机场起飞 · FD763', start: '2026-10-02T14:15:00+08:00', end: '2026-10-02T16:05:00+07:00', day: 'day-1', zone: '澳门／曼谷当地时间' },
    { id: 'd1-arrival', name: '抵达曼谷，办理入境', start: '2026-10-02T16:05:00+07:00', end: '2026-10-02T17:00:00+07:00', day: 'day-1', zone: '曼谷时间 UTC+7' },
    { id: 'd1-hotel-transfer', name: '前往曼谷亚洲酒店', start: '2026-10-02T17:00:00+07:00', end: '2026-10-02T18:30:00+07:00', day: 'day-1', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/usJqCT7o19Qer72o8' },
    { id: 'd1-checkin', name: '办理酒店入住、放行李', start: '2026-10-02T19:00:00+07:00', end: '2026-10-02T19:30:00+07:00', day: 'day-1', zone: '曼谷时间 UTC+7' },
    { id: 'd1-siam', name: '暹罗百丽宫晚餐与采购', start: '2026-10-02T19:45:00+07:00', end: '2026-10-02T21:00:00+07:00', day: 'day-1', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/nMBbXHEbtNgXfkNn6' },
    { id: 'd2-market', name: '乍都乍市场', start: '2026-10-03T10:00:00+07:00', end: '2026-10-03T12:00:00+07:00', day: 'day-2', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/55QdQhUT6rgk7dkYA' },
    { id: 'd2-ddmall', name: 'DD Mall', start: '2026-10-03T13:30:00+07:00', end: '2026-10-03T15:30:00+07:00', day: 'day-2', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/SWbAGcYGnErcuEWx5' },
    { id: 'd2-park', name: '伦披尼公园散步', start: '2026-10-03T16:30:00+07:00', end: '2026-10-03T17:30:00+07:00', day: 'day-2', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/6VZVHTpy4Cga3WTL7' },
    { id: 'd2-bigc', name: 'Big C 晚餐与购物', start: '2026-10-03T18:00:00+07:00', end: '2026-10-03T20:00:00+07:00', day: 'day-2', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/pUXraenAErLrcg2T7' },
    { id: 'd3-breakfast', name: '酒店附近早餐', start: '2026-10-04T09:30:00+07:00', end: '2026-10-04T10:00:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7' },
    { id: 'd3-taxi', name: '打车前往大皇宫', start: '2026-10-04T10:00:00+07:00', end: '2026-10-04T10:30:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/KPVpPwBFVvk9cyFN7' },
    { id: 'd3-palace', name: '大皇宫＋玉佛寺', start: '2026-10-04T10:30:00+07:00', end: '2026-10-04T12:30:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7' },
    { id: 'd3-watpho', name: '卧佛寺', start: '2026-10-04T12:45:00+07:00', end: '2026-10-04T14:00:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/NGtBEk5D4APQSZsBA' },
    { id: 'd3-watarun', name: '郑王庙', start: '2026-10-04T15:30:00+07:00', end: '2026-10-04T16:30:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/M14v4wKyyDL991T68' },
    { id: 'd3-dinner', name: 'chom arun 晚餐、河畔观景', start: '2026-10-04T17:00:00+07:00', end: '2026-10-04T18:30:00+07:00', day: 'day-3', zone: '曼谷时间 UTC+7' },
    { id: 'd4-songwat', name: 'Song Wat 老街闲逛', start: '2026-10-05T10:15:00+07:00', end: '2026-10-05T12:30:00+07:00', day: 'day-4', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/pY7dUj6YQ6ntm9hu9' },
    { id: 'd4-talat', name: 'Talat Noi＋河城艺术中心', start: '2026-10-05T13:30:00+07:00', end: '2026-10-05T16:00:00+07:00', day: 'day-4', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/rNCtYDRNiisSd82L6' },
    { id: 'd4-chinatown', name: 'Yaowarat 唐人街', start: '2026-10-05T16:30:00+07:00', end: '2026-10-05T19:30:00+07:00', day: 'day-4', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/RnEUrDKpkLdBenjXA' },
    { id: 'd5-airport', name: '从酒店打车前往廊曼机场', start: '2026-10-06T06:45:00+07:00', end: '2026-10-06T07:45:00+07:00', day: 'day-5', zone: '曼谷时间 UTC+7', map: 'https://maps.app.goo.gl/KfzVHie8bgWJKDDx6' },
    { id: 'd5-flight', name: '廊曼机场起飞', start: '2026-10-06T10:00:00+07:00', end: '2026-10-06T13:45:00+08:00', day: 'day-5', zone: '曼谷／澳门当地时间' },
    { id: 'd5-macau', name: '澳门自由活动', start: '2026-10-06T14:20:00+08:00', end: '2026-10-06T19:20:00+08:00', day: 'day-5', zone: '澳门时间 UTC+8' },
    { id: 'd5-ferry', name: '拟乘坐：澳门氹仔码头 → 深圳机场码头', start: '2026-10-06T20:00:00+08:00', end: '2026-10-06T21:20:00+08:00', day: 'day-5', zone: '中国时间 UTC+8', pending: true }
  ].map((item) => ({ ...item, startMs: Date.parse(item.start), endMs: Date.parse(item.end) }));

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const els = {
    localNow: $('#localNow'),
    status: $('#attentionStatus'),
    name: $('#attentionName'),
    time: $('#attentionTime'),
    countdown: $('#countdown'),
    countdownLabel: $('#countdownLabel'),
    note: $('#attentionNote'),
    tripLink: $('#attentionTripLink'),
    mapLink: $('#attentionMapLink'),
    toast: $('#toast')
  };

  let toastTimer;
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 2200);
  }

  function formatLocal(iso, zone) {
    const timeZone = iso.endsWith('+08:00') ? 'Asia/Shanghai' : 'Asia/Bangkok';
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone,
      month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(iso)) + ` · ${zone}`;
  }

  function formatCountdown(milliseconds) {
    const total = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${String(days).padStart(2, '0')}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateAttention() {
    const now = Date.now();
    const tripStart = schedule[0].startMs;
    const tripEnd = schedule.at(-1).endMs;
    const current = schedule.find((item) => now >= item.startMs && now < item.endMs);
    const next = schedule.find((item) => item.startMs > now);
    const bangkokNow = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Bangkok', month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
    els.localNow.textContent = `曼谷当地时间 ${bangkokNow}`;

    if (now >= tripEnd) {
      els.status.textContent = '旅程已结束';
      els.name.textContent = '本次旅行已结束，仍可查看完整攻略';
      els.time.textContent = '2026 年 10 月 2—6 日 · 5 天 4 晚';
      els.countdown.textContent = '泰兰德之旅';
      els.countdownLabel.textContent = '行程已留存';
      els.note.textContent = '所有计划、路线与实用信息仍可在本页查看。';
      els.tripLink.href = '#daily';
      els.mapLink.href = '#utility';
      els.mapLink.removeAttribute('target');
      els.mapLink.innerHTML = '<svg><use href="#i-info"/></svg>查看实用信息';
      return;
    }

    const target = current || next;
    if (!target) return;
    const isBeforeTrip = now < tripStart;
    els.status.textContent = current ? '按计划进行中' : (target.pending ? '下一项 · 待预订' : '计划下一项');
    els.name.textContent = target.name;
    els.time.textContent = formatLocal(target.start, target.zone);
    els.countdown.textContent = formatCountdown((current ? target.endMs : target.startMs) - now);
    els.countdownLabel.textContent = current ? '按计划距离结束' : (isBeforeTrip ? '距离旅程开始' : '距离下一项开始');
    els.note.textContent = isBeforeTrip ? '关键待办：往返船票仍待预订。' : (target.pending ? '这是候选船班，不代表已经预订。' : '页面展示计划安排，不判断你是否已到达。');
    els.tripLink.href = `#${target.day}`;

    if (target.map) {
      els.mapLink.href = target.map;
      els.mapLink.target = '_blank';
      els.mapLink.rel = 'noreferrer';
      els.mapLink.innerHTML = '<svg><use href="#i-pin"/></svg>地点导航';
    } else {
      els.mapLink.href = '#transport';
      els.mapLink.removeAttribute('target');
      els.mapLink.removeAttribute('rel');
      els.mapLink.innerHTML = '<svg><use href="#i-bed"/></svg>交通住宿';
    }
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('copy failed');
  }

  async function shareUrl(url, title) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: '勇闯泰兰德｜2026.10.02—10.06 旅行手册', url });
        showToast('分享面板已打开');
      } else {
        await copyText(url);
        showToast('链接已复制');
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await copyText(url);
        showToast('链接已复制');
      } catch {
        window.prompt('复制下面的链接进行分享：', url);
      }
    }
  }

  $('#shareButton')?.addEventListener('click', () => shareUrl(window.location.href, document.title));
  $$('[data-share-day]').forEach((button) => {
    button.addEventListener('click', () => {
      const day = button.dataset.shareDay;
      const url = new URL(window.location.href);
      url.hash = day;
      const title = $(`#${day} h3`)?.textContent || document.title;
      shareUrl(url.href, `${title}｜勇闯泰兰德`);
    });
  });

  $$('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try { await copyText(button.dataset.copy); showToast('名称与地址已复制'); }
      catch { showToast('复制失败，请长按文字复制'); }
    });
  });

  $$('[data-google-route]').forEach((link) => {
    const params = new URLSearchParams({
      api: '1',
      origin: link.dataset.routeOrigin,
      destination: link.dataset.routeDestination
    });
    const waypoints = link.dataset.routeWaypoints?.split('||').filter(Boolean);
    if (waypoints?.length) params.set('waypoints', waypoints.join('|'));
    if (link.dataset.routeMode) params.set('travelmode', link.dataset.routeMode);
    link.href = `https://www.google.com/maps/dir/?${params.toString()}`;
  });

  $$('[data-toggle-note]').forEach((button) => {
    const note = document.getElementById(button.dataset.toggleNote);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const willOpen = note.hidden;
      note.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      button.textContent = willOpen ? '收起攻略' : '详细攻略';
    });
  });

  const themeButton = $('#themeButton');
  const themeMenu = $('#themeMenu');
  const themeOptions = $$('[data-theme-value]');
  const validThemes = new Set(['system', 'light', 'dark']);

  function setTheme(theme, persist = true) {
    const safeTheme = validThemes.has(theme) ? theme : 'system';
    document.documentElement.dataset.theme = safeTheme;
    themeOptions.forEach((option) => option.setAttribute('aria-selected', String(option.dataset.themeValue === safeTheme)));
    const labels = { system: '主题', light: '浅色', dark: '深色' };
    themeButton.querySelector('span').textContent = labels[safeTheme];
    if (persist) {
      try { localStorage.setItem('thailand-theme', safeTheme); } catch { /* 阅读偏好存储不可用时无影响 */ }
    }
  }

  try { setTheme(localStorage.getItem('thailand-theme') || 'system', false); }
  catch { setTheme('system', false); }

  themeButton?.addEventListener('click', () => {
    const willOpen = themeMenu.hidden;
    themeMenu.hidden = !willOpen;
    themeButton.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) themeOptions[0]?.focus();
  });
  themeOptions.forEach((option) => option.addEventListener('click', () => {
    setTheme(option.dataset.themeValue);
    themeMenu.hidden = true;
    themeButton.setAttribute('aria-expanded', 'false');
    themeButton.focus();
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.theme-control')) {
      themeMenu.hidden = true;
      themeButton.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !themeMenu.hidden) {
      themeMenu.hidden = true;
      themeButton.setAttribute('aria-expanded', 'false');
      themeButton.focus();
    }
  });

  const dayLinks = $$('[data-day-link]');
  const bottomLinks = $$('[data-nav-section]');
  const sections = [
    { id: 'overview', element: $('#overview') },
    { id: 'transport', element: $('#transport') },
    { id: 'daily', element: $('#daily') },
    { id: 'utility', element: $('#utility') }
  ];

  function setActiveDay(id) {
    dayLinks.forEach((link) => link.classList.toggle('active', link.dataset.dayLink === id));
    const active = dayLinks.find((link) => link.dataset.dayLink === id);
    if (active) {
      const rail = active.parentElement;
      const left = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
      rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }
  function setActiveBottom(id) {
    bottomLinks.forEach((link) => link.classList.toggle('active', link.dataset.navSection === id));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveBottom(visible.target.id === 'preparation' ? 'utility' : visible.target.id);
    }, { rootMargin: '-28% 0px -60% 0px', threshold: [0, .08] });
    sections.forEach(({ element }) => element && sectionObserver.observe(element));
    sectionObserver.observe($('#preparation'));
  } else {
    setActiveBottom('overview');
  }

  dayLinks.forEach((link) => link.addEventListener('click', () => setActiveDay(link.dataset.dayLink)));

  let dayScrollFrame = 0;
  function updateActiveDayFromScroll() {
    dayScrollFrame = 0;
    const headerHeight = $('.site-header')?.offsetHeight || 0;
    const dayNavHeight = $('.day-nav-wrap')?.offsetHeight || 0;
    const activationY = window.scrollY + headerHeight + dayNavHeight + 32;
    const days = $$('.day');
    const activeDay = days.reduce((active, day) => day.offsetTop <= activationY ? day : active, days[0]);
    if (activeDay) setActiveDay(activeDay.id);
  }
  window.addEventListener('scroll', () => {
    if (!dayScrollFrame) dayScrollFrame = window.requestAnimationFrame(updateActiveDayFromScroll);
  }, { passive: true });

  updateAttention();
  updateActiveDayFromScroll();
  window.setInterval(updateAttention, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateAttention(); });

  const initialHash = window.location.hash;
  function alignInitialHashTarget() {
    if (window.location.hash === initialHash && document.querySelector(initialHash)) {
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      document.querySelector(initialHash).scrollIntoView({ block: 'start', behavior: 'instant' });
      root.style.scrollBehavior = previousBehavior;
      updateActiveDayFromScroll();
    }
  }

  if (initialHash && document.querySelector(initialHash)) {
    const queueInitialHashAlignment = () => window.requestAnimationFrame(() => {
      window.requestAnimationFrame(alignInitialHashTarget);
    });
    if (document.readyState === 'complete') queueInitialHashAlignment();
    else window.addEventListener('load', queueInitialHashAlignment, { once: true });
  }
})();
