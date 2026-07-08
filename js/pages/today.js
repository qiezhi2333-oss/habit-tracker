/* === Today Page === */
const TodayPage = {
  async mount() {
    await this.render();
  },

  async render() {
    const grid = document.getElementById('today-grid');
    const today = Utils.today();

    // Load all non-archived activities sorted by sortOrder
    const allActivities = await DB.getAll('activities');
    const active = allActivities
      .filter(a => !a.isArchived)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Load all categories
    const categories = await DB.getAll('categories');
    const catMap = {};
    categories.sort((a,b) => a.sortOrder - b.sortOrder).forEach(c => {
      catMap[c.id] = c;
      c._activities = [];
    });

    // Group activities by category
    active.forEach(a => {
      const cat = catMap[a.categoryId];
      if (cat) cat._activities.push(a);
    });

    // Build with DOM nodes (not innerHTML) to preserve event listeners
    grid.innerHTML = '';

    if (!active.length) {
      grid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary)">
        🌱 还没有习惯，去「我的」添加吧
      </div>`;
      return;
    }

    for (const cat of categories) {
      if (!cat._activities || cat._activities.length === 0) continue;

      const section = document.createElement('div');
      section.className = 'category-section';

      const header = document.createElement('div');
      header.className = 'category-header';
      header.dataset.cat = cat.id;
      header.innerHTML = `<span>${cat.icon}</span><span>${cat.name}</span><span class="cat-arrow">▼</span>`;

      const habitGrid = document.createElement('div');
      habitGrid.className = 'habit-grid cat-' + cat.id;

      // Collapse toggle
      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        habitGrid.style.display = header.classList.contains('collapsed') ? 'none' : '';
      });

      for (const act of cat._activities) {
        const isEligible = await this.checkEligibility(act, today);
        const chk = await DB.getByIndex('checkins', 'activityId_date', [act.id, today]);
        const count = chk ? chk.count : 0;
        const target = this.getTarget(act, today);
        const card = HabitCard.render(act, count, target, isEligible);
        habitGrid.appendChild(card);
      }

      section.appendChild(header);
      section.appendChild(habitGrid);
      grid.appendChild(section);
    }
  },

  getTarget(activity, today) {
    const ft = activity.frequencyType;
    const fv = activity.frequencyValue || 1;
    if (ft === 'multi_per_day') return fv; // e.g., 8 for water
    if (ft === 'weekly') {
      // Show weekly target for today (weekly targets shown as 1/day but really meant for week)
      return 1;
    }
    return 1;
  },

  async checkEligibility(activity, today) {
    const ft = activity.frequencyType;
    const fv = activity.frequencyValue || 1;

    if (ft === 'daily' || ft === 'multi_per_day') return true;

    if (ft === 'every_n_days') {
      const allChk = (await DB.getAllByIndex('checkins', 'activityId', activity.id))
        .filter(c => c.date <= today)
        .sort((a,b) => b.date.localeCompare(a.date));
      if (allChk.length === 0) return true;
      const lastDate = allChk[0].date;
      const daysSince = Utils.diffDays(lastDate, today);
      return daysSince >= fv;
    }

    if (ft === 'weekly') {
      // Count this week's check-ins (Mon-Sun)
      const d = new Date(today + 'T00:00:00');
      const dayOfWeek = d.getDay(); // 0=Sun
      const monday = Utils.addDays(today, dayOfWeek === 0 ? -6 : -(dayOfWeek - 1));
      const weekChecks = (await DB.getAllByIndex('checkins', 'activityId', activity.id))
        .filter(c => c.date >= monday && c.date <= today);
      return weekChecks.length < fv;
    }

    return true;
  },

  async checkIn(activity, card) {
    const today = Utils.today();
    const target = this.getTarget(activity, today);

    let chk = await DB.getByIndex('checkins', 'activityId_date', [activity.id, today]);
    const currentCount = chk ? chk.count : 0;

    if (currentCount >= target) {
      // Undo: remove check-in
      if (chk && chk.count > 1) {
        chk.count--;
        await DB.put('checkins', chk);
      } else if (chk) {
        await DB.delete('checkins', chk.id);
      }
      Toast.show('已撤销');
    } else {
      // Check in
      if (chk) {
        chk.count++;
        await DB.put('checkins', chk);
      } else {
        await DB.put('checkins', {
          id: Utils.generateId(),
          activityId: activity.id,
          date: today,
          count: 1,
          createdAt: Utils.now(),
        });
      }

      const newCount = currentCount + 1;
      if (newCount >= target) {
        const rect = card.getBoundingClientRect();
        Confetti.fire(rect.left + rect.width/2, rect.top + rect.height/2, activity.color || '#FFAAA5');
        if (navigator.vibrate) navigator.vibrate(15);
      }
    }

    // Refresh card
    await this.render();
  },

  async showDetail(activity) {
    const today = Utils.today();
    const now2 = new Date();
    const year = now2.getFullYear();
    const month = now2.getMonth() + 1;

    // Build completed date map for this month
    const monthStart = `${year}-${String(month).padStart(2,'0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2,'0')}-${String(Utils.getDaysInMonth(year, month)).padStart(2,'0')}`;
    const allChk = await DB.getAllByIndex('checkins', 'activityId', activity.id);
    const color = activity.color || '#FFAAA5';
    const completedMap = new Map();
    allChk.forEach(c => {
      if (c.date >= monthStart && c.date <= monthEnd) {
        const arr = completedMap.get(c.date) || [];
        arr.push(color);
        completedMap.set(c.date, arr);
      }
    });

    // Streak
    let streak = 0;
    const sorted = allChk
      .filter(c => c.date <= today)
      .map(c => c.date)
      .filter((v,i,a) => a.indexOf(v) === i) // unique dates
      .sort((a,b) => b.localeCompare(a));
    for (let i = 0; i < sorted.length; i++) {
      const expected = Utils.addDays(today, -i);
      if (sorted[i] === expected) streak++;
      else break;
    }

    const totalCount = allChk.reduce((s, c) => s + c.count, 0);

    const calContainer = document.createElement('div');
    MiniCalendar.render(calContainer, year, month, completedMap, {});

    BottomSheet.open(`
      <div class="sheet-content">
        <div class="sheet-activity">
          <span class="sheet-emoji">${activity.icon}</span>
          <div>
            <div class="sheet-name">${activity.name}</div>
            <div class="sheet-cat">${activity.frequencyType === 'daily' ? '每天' : activity.frequencyType === 'multi_per_day' ? `每天 ${activity.frequencyValue} 次` : activity.frequencyType === 'weekly' ? `每周 ${activity.frequencyValue} 次` : `每 ${activity.frequencyValue} 天`}</div>
          </div>
        </div>
        <div class="sheet-stats">
          <div class="stat-item"><span class="stat-val">${streak}</span><span class="stat-label">连续天数</span></div>
          <div class="stat-item"><span class="stat-val">${totalCount}</span><span class="stat-label">累计完成</span></div>
        </div>
        <div id="sheet-calendar">${calContainer.innerHTML}</div>
        <div style="text-align:center;padding-top:12px">
          <button class="btn btn-outline" onclick="BottomSheet.close();Modal.open('编辑活动','',null)">编辑活动</button>
        </div>
      </div>
    `);
  },
};
