/* === Entry Point === */
(function() {
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = Utils.formatHeader(Utils.today());

  // Make nav buttons work immediately (before DB is ready)
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Router.navigate(btn.dataset.tab, true);
    });
  });

  // Show the Today page immediately
  document.getElementById('page-today').classList.add('active');
})();

(async function() {
  const status = document.createElement('div');
  status.id = 'init-status';
  status.style.cssText = 'text-align:center;padding:40px;color:var(--text-secondary);font-size:14px;';
  const grid = document.getElementById('today-grid');
  grid.appendChild(status);

  try {
    status.textContent = '⏳ 正在初始化数据库…';

    await DB.open();
    await DB.seedDefaults();

    // Register service worker (silently fail if no HTTPS)
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js', { scope: '/habit-tracker/' }).catch(() => {});
    }

    // Mount today page
    status.textContent = '⏳ 正在加载…';
    await TodayPage.mount();

    // Remove status indicator
    status.remove();

    // Apply saved theme
    const savedTheme = localStorage.getItem('habit-theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    console.log('🌱 小习惯 ready');
  } catch (e) {
    console.error('App init error:', e);
    status.innerHTML = `<div style="color:#EF4444">⚠️ 加载失败</div>
      <div style="font-size:11px;margin-top:8px;word-break:break-all">${e.message || e}</div>
      <button onclick="location.reload()" style="margin-top:12px;padding:8px 16px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer;font-size:14px">重试</button>`;
  }
})();
