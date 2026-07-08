/* === Hash-based Tab Router === */
const Router = {
  current: 'today',

  init() {
    const hash = location.hash.replace('#', '') || 'today';
    this.navigate(hash, false);
    window.addEventListener('hashchange', () => {
      const tab = location.hash.replace('#', '');
      if (tab) this.navigate(tab, false);
    });
  },

  navigate(tab, pushState = true) {
    if (pushState) location.hash = tab;
    if (this.current === tab) return;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show target
    const page = document.getElementById('page-' + tab);
    if (page) page.classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    // Trigger page lifecycle
    if (tab === 'today' && TodayPage && TodayPage.mount) TodayPage.mount();
    if (tab === 'calendar' && CalendarPage && CalendarPage.mount) CalendarPage.mount();
    if (tab === 'settings' && SettingsPage && SettingsPage.mount) SettingsPage.mount();

    this.current = tab;
  },
};
