/* === Utils: Date helpers, UUID, debounce === */
const Utils = {
  today() {
    return new Date().toISOString().slice(0,10); // YYYY-MM-DD
  },

  now() {
    return new Date().toISOString();
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  },

  formatWeekday(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['日','一','二','三','四','五','六'];
    return `星期${days[d.getDay()]}`;
  },

  formatHeader(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const days = ['日','一','二','三','四','五','六'];
    return `${m}月${day}日 星期${days[d.getDay()]}`;
  },

  getDaysInMonth(year, month) { // month: 1-12
    return new Date(year, month, 0).getDate();
  },

  getFirstWeekday(year, month) { // month: 1-12, returns 0=Sun..6=Sat
    return new Date(year, month-1, 1).getDay();
  },

  addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0,10);
  },

  diffDays(d1, d2) {
    const a = new Date(d1 + 'T00:00:00');
    const b = new Date(d2 + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  },

  generateId() {
    return crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random()*16|0; return (c==='x'?r:r&0x3|0x8).toString(16);
      });
  },

  debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  },

  truncate(str, max = 6) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  },
};
