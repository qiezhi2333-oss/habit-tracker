/* === IndexedDB Wrapper === */
class HabitDB {
  constructor() {
    this._db = null;
    this.DB_NAME = 'habit-tracker';
    this.VERSION = 1;
  }

  async open() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('sortOrder', 'sortOrder');
        }
        // Activities store
        if (!db.objectStoreNames.contains('activities')) {
          const actStore = db.createObjectStore('activities', { keyPath: 'id' });
          actStore.createIndex('categoryId', 'categoryId');
          actStore.createIndex('sortOrder', 'sortOrder');
          actStore.createIndex('isArchived', 'isArchived');
        }
        // Checkins store
        if (!db.objectStoreNames.contains('checkins')) {
          const chkStore = db.createObjectStore('checkins', { keyPath: 'id' });
          chkStore.createIndex('activityId', 'activityId');
          chkStore.createIndex('date', 'date');
          chkStore.createIndex('activityId_date', ['activityId', 'date'], { unique: false });
        }
      };
      req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  _store(name, mode = 'readonly') {
    const tx = this._db.transaction(name, mode);
    return { store: tx.objectStore(name), tx };
  }

  async get(storeName, id) {
    await this.open();
    const { store } = this._store(storeName);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAll(storeName) {
    await this.open();
    const { store } = this._store(storeName);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getByIndex(storeName, indexName, key) {
    await this.open();
    const { store } = this._store(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const req = index.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllByIndex(storeName, indexName, key) {
    await this.open();
    const { store } = this._store(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const req = index.getAll(key);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllByIndexRange(storeName, indexName, range) {
    await this.open();
    const { store } = this._store(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const req = index.getAll(range);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async put(storeName, obj) {
    await this.open();
    const { store, tx } = this._store(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(obj);
      req.onsuccess = () => {
        tx.oncomplete = () => resolve(req.result);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async delete(storeName, id) {
    await this.open();
    const { store, tx } = this._store(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => { tx.oncomplete = () => resolve(); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async clear(storeName) {
    await this.open();
    const { store, tx } = this._store(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => { tx.oncomplete = () => resolve(); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async count(storeName) {
    await this.open();
    const { store } = this._store(storeName);
    return new Promise((resolve, reject) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async transaction(storeNames, mode, fn) {
    await this.open();
    const tx = this._db.transaction(storeNames, mode);
    const stores = {};
    storeNames.forEach(n => stores[n] = tx.objectStore(n));
    try {
      const result = await fn(stores, tx);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = (e) => reject(e.target.error);
      });
    } catch (e) {
      tx.abort();
      throw e;
    }
  }

  async seedDefaults() {
    // Only seed if DB is empty
    const catCount = await this.count('categories');
    if (catCount > 0) return;

    const categories = [
      { id: Utils.generateId(), name: '运动', color: '#FFAAA5', icon: '💪', sortOrder: 0 },
      { id: Utils.generateId(), name: '饮食', color: '#A8E6CF', icon: '🍽️', sortOrder: 1 },
      { id: Utils.generateId(), name: '睡眠', color: '#C7CEEA', icon: '😴', sortOrder: 2 },
      { id: Utils.generateId(), name: '学习', color: '#AA96DA', icon: '📚', sortOrder: 3 },
      { id: Utils.generateId(), name: '工作', color: '#FFD3B6', icon: '💼', sortOrder: 4 },
    ];

    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    const activities = [
      { name: '跑步', icon: '🏃', category: '运动', freqType: 'daily', freqVal: 1 },
      { name: '力量训练', icon: '🏋️', category: '运动', freqType: 'weekly', freqVal: 2 },
      { name: '普拉提', icon: '🧘', category: '运动', freqType: 'weekly', freqVal: 1 },
      { name: '游泳', icon: '🏊', category: '运动', freqType: 'weekly', freqVal: 1 },
      { name: '喝水', icon: '💧', category: '饮食', freqType: 'multi_per_day', freqVal: 8 },
      { name: '健康餐', icon: '🥗', category: '饮食', freqType: 'daily', freqVal: 1 },
      { name: '不喝饮料', icon: '🚫', category: '饮食', freqType: 'daily', freqVal: 1 },
      { name: '牛奶', icon: '🥛', category: '饮食', freqType: 'daily', freqVal: 1 },
      { name: '8小时睡眠', icon: '🛌', category: '睡眠', freqType: 'daily', freqVal: 1 },
      { name: '23点前入睡', icon: '🌙', category: '睡眠', freqType: 'daily', freqVal: 1 },
      { name: '阅读', icon: '📖', category: '学习', freqType: 'daily', freqVal: 1 },
      { name: '专业学习', icon: '💡', category: '学习', freqType: 'daily', freqVal: 1 },
      { name: '日报', icon: '📝', category: '工作', freqType: 'daily', freqVal: 1 },
      { name: '周报准备', icon: '📊', category: '工作', freqType: 'weekly', freqVal: 1 },
    ];

    for (const c of categories) {
      await this.put('categories', c);
    }

    for (let i = 0; i < activities.length; i++) {
      const a = activities[i];
      await this.put('activities', {
        id: Utils.generateId(),
        categoryId: catMap[a.category],
        name: a.name,
        icon: a.icon,
        color: null,
        frequencyType: a.freqType,
        frequencyValue: a.freqVal,
        sortOrder: i,
        isArchived: false,
        createdAt: Utils.now(),
      });
    }
  }
}

const DB = new HabitDB();
