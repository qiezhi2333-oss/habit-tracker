/* === Entry Point === */
// Install prompt handler
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install banner
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
});

// Render date header immediately
(function() {
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = Utils.formatHeader(Utils.today());

  // Nav buttons work immediately
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Router.navigate(btn.dataset.tab, true);
    });
  });

  document.getElementById('page-today').classList.add('active');
})();

// Main init
(async function() {
  const grid = document.getElementById('today-grid');
  const status = document.createElement('div');
  status.style.cssText = 'text-align:center;padding:40px;color:var(--text-secondary);font-size:14px;';
  grid.appendChild(status);

  try {
    status.textContent = '⏳ 初始化中…';
    await DB.open();
    await DB.seedDefaults();

    // Register SW (no HTTPS check needed — GitHub Pages is always HTTPS)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Mount today page
    await TodayPage.mount();
    status.remove();

    // Apply saved theme
    const savedTheme = localStorage.getItem('habit-theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    console.log('🌱 小习惯 ready');
  } catch (e) {
    console.error('Init error:', e);
    status.innerHTML = `<div style="color:#EF4444">⚠️ 加载失败</div>
      <div style="font-size:11px;margin-top:8px">${e.message || e}</div>
      <button onclick="location.reload()" style="margin-top:12px;padding:8px 16px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer">重试</button>`;
  }
})();

// Global install handler
window.installApp = async function() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log('PWA install:', result.outcome);
    deferredPrompt = null;
    document.getElementById('install-banner').style.display = 'none';
  }
};

window.dismissInstall = function() {
  document.getElementById('install-banner').style.display = 'none';
};
