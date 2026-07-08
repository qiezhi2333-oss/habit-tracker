/* === Habit Card Component === */
const HabitCard = {
  render(activity, checkinCount, target, isEligible) {
    const done = checkinCount >= target;
    const frac = target > 0 ? Math.min(checkinCount / target, 1) : 0;
    const color = activity.color || '#FFAAA5';

    const card = document.createElement('div');
    card.className = 'habit-card' + (done ? ' done' : '') + (isEligible === false ? ' ineligible' : '');
    card.dataset.id = activity.id;

    card.innerHTML = `
      <div class="card-icon-wrap" style="background:${color}18">
        <span class="card-icon">${activity.icon}</span>
      </div>
      <div class="card-name">${Utils.truncate(activity.name, 6)}</div>
      <div class="card-progress">
        <div class="card-bar-bg" style="background:${color}18">
          <div class="card-bar-fill" style="width:${frac*100}%;background:${color}"></div>
        </div>
        ${target > 1 ? `<span class="card-count">${checkinCount}/${target}</span>` : (done ? '<span class="card-check">✅</span>' : '')}
      </div>`;

    // Click: check-in
    card.addEventListener('click', async (e) => {
      if (isEligible === false) return;
      e.preventDefault();
      await TodayPage.checkIn(activity, card);
    });

    // Long press: detail sheet
    let pressTimer;
    card.addEventListener('pointerdown', (e) => {
      pressTimer = setTimeout(() => {
        TodayPage.showDetail(activity);
      }, 500);
    });
    card.addEventListener('pointerup', () => clearTimeout(pressTimer));
    card.addEventListener('pointermove', () => clearTimeout(pressTimer));
    card.addEventListener('pointerleave', () => clearTimeout(pressTimer));

    return card;
  },
};
