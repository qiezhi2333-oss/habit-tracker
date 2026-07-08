/* === Calendar Page === */
const CalendarPage = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,

  async mount() {
    await this.render();
  },

  async render() {
    const root = document.getElementById('calendar-root');
    const today = Utils.today();

    // Get all non-archived activities for dot colors
    const activities = await DB.getAll('activities');
    const actMap = {};
    activities.forEach(a => { actMap[a.id] = a; });

    // Get all checkins for this month
    const monthStart = `${this.year}-${String(this.month).padStart(2,'0')}-01`;
    const lastDay = Utils.getDaysInMonth(this.year, this.month);
    const monthEnd = `${this.year}-${String(this.month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;

    const allCheckins = await DB.getAll('checkins');
    const completedMap = new Map();
    const dateDetail = {}; // date -> [{actId, count, done}]

    allCheckins.forEach(c => {
      if (c.date < monthStart || c.date > monthEnd) return;
      const act = actMap[c.activityId];
      if (!act || act.isArchived) return;
      const color = act.color || '#FFAAA5';
      const arr = completedMap.get(c.date) || [];
      if (!arr.includes(color)) arr.push(color);
      completedMap.set(c.date, arr);

      if (!dateDetail[c.date]) dateDetail[c.date] = [];
      const target = act.frequencyType === 'multi_per_day' ? act.frequencyValue : 1;
      dateDetail[c.date].push({
        icon: act.icon,
        name: act.name,
        color,
        count: c.count,
        target,
        done: c.count >= target,
      });
    });

    // Month nav + calendar container
    root.innerHTML = `
      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev">◀</button>
        <span class="cal-nav-title">${this.year}年 ${this.month}月</span>
        <button class="cal-nav-btn" id="cal-next">▶</button>
      </div>
      <div id="calendar-container"></div>
      <div id="cal-day-detail" class="cal-day-detail">
        <div class="cal-detail-placeholder">👆 点击日期查看详情</div>
      </div>`;

    MiniCalendar.render(
      document.getElementById('calendar-container'),
      this.year, this.month, completedMap,
      {
        onDayClick: (dateStr) => this.showDayDetail(dateStr, dateDetail, actMap),
      }
    );

    // Nav buttons
    document.getElementById('cal-prev').onclick = () => { this.changeMonth(-1); };
    document.getElementById('cal-next').onclick = () => { this.changeMonth(1); };

    // Show today's detail by default
    this.showDayDetail(today, dateDetail, actMap);
  },

  changeMonth(delta) {
    this.month += delta;
    if (this.month > 12) { this.month = 1; this.year++; }
    if (this.month < 1) { this.month = 12; this.year--; }
    this.render();
  },

  showDayDetail(dateStr, dateDetail, actMap) {
    const panel = document.getElementById('cal-day-detail');
    const details = dateDetail[dateStr] || [];
    const d = new Date(dateStr + 'T00:00:00');
    const title = `${d.getMonth()+1}月${d.getDate()}日`;

    if (!details.length) {
      panel.innerHTML = `<div class="cal-detail-title">${title}</div>
        <div class="cal-detail-empty">这天没有打卡记录</div>`;
      return;
    }

    panel.innerHTML = `<div class="cal-detail-title">${title}</div>` +
      details.map(d => `
        <div class="cal-detail-item">
          <span>${d.icon} ${d.name}</span>
          <span style="color:${d.done ? 'var(--cat-5)' : 'var(--text-secondary)'}">
            ${d.done ? '✅' : (d.count > 0 ? d.count + '/' + d.target : '○')}
          </span>
        </div>`).join('');
  },
};
