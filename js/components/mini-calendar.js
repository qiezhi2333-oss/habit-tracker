/* === Mini Calendar Component === */
// Renders a month grid with colored dots for check-in days.
// Usage: MiniCalendar.render(container, year, month, completedDates, options)
//   completedDates: Map of "YYYY-MM-DD" -> color
//   options: { onDayClick(dateStr), highlightToday }
const MiniCalendar = {
  render(container, year, month, completedDates = new Map(), opts = {}) {
    const today = Utils.today();
    const daysInMonth = Utils.getDaysInMonth(year, month);
    const firstWeekday = Utils.getFirstWeekday(year, month); // 0=Sun
    // Adjust for Monday start (0=Mon..6=Sun)
    const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

    const headerHTML = ['一','二','三','四','五','六','日']
      .map(d => `<span class="cal-day-header">${d}</span>`).join('');

    let cellsHTML = '';
    const totalCells = startOffset + daysInMonth;
    const rows = Math.ceil(totalCells / 7);
    const totalGrid = rows * 7;

    for (let i = 0; i < totalGrid; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cellsHTML += `<div class="cal-cell empty"></div>`;
      } else {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
        const isToday = dateStr === today;
        const dots = completedDates.get(dateStr) || [];
        const dotsHTML = dots.slice(0,4).map(c =>
          `<span class="cal-dot" style="background:${c}"></span>`
        ).join('') + (dots.length > 4 ? `<span class="cal-more">+${dots.length-4}</span>` : '');

        cellsHTML += `<div class="cal-cell${isToday?' today':''}" data-date="${dateStr}">
          <span class="cal-day-num">${dayNum}</span>
          <div class="cal-dots">${dotsHTML}</div>
        </div>`;
      }
    }

    container.innerHTML = `
      <div class="mini-calendar">
        <div class="cal-header-row">${headerHTML}</div>
        <div class="cal-grid">${cellsHTML}</div>
      </div>`;

    // Click handler
    if (opts.onDayClick) {
      container.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
        cell.addEventListener('click', () => opts.onDayClick(cell.dataset.date));
      });
    }
  },
};
