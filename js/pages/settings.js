/* === Settings Page === */
const SettingsPage = {
  async mount() {
    await this.render();
  },

  async render() {
    const root = document.getElementById('settings-root');
    const categories = await DB.getAll('categories');
    categories.sort((a,b) => a.sortOrder - b.sortOrder);
    const activities = await DB.getAll('activities');
    const actByCat = {};
    activities.forEach(a => {
      if (!actByCat[a.categoryId]) actByCat[a.categoryId] = [];
      actByCat[a.categoryId].push(a);
    });

    root.innerHTML = `
      <div class="settings-page">
        <!-- Categories -->
        <div class="settings-section">
          <div class="settings-section-title">📂 习惯分类</div>
          <div id="cat-list">
            ${categories.map(c => `
              <div class="settings-row">
                <span>${c.icon} ${c.name}</span>
                <span>
                  <button class="btn-sm" onclick="SettingsPage.editCategory('${c.id}')">编辑</button>
                  <button class="btn-sm btn-danger" onclick="SettingsPage.deleteCategory('${c.id}')">删除</button>
                </span>
              </div>`).join('')}
          </div>
          <button class="btn btn-outline btn-full" onclick="SettingsPage.addCategory()">+ 添加分类</button>
        </div>

        <!-- Activities -->
        <div class="settings-section">
          <div class="settings-section-title">📋 习惯管理</div>
          <div id="act-list">
            ${categories.map(c => {
              const acts = actByCat[c.id] || [];
              return `<div style="padding:4px 0"><strong>${c.icon} ${c.name}</strong></div>` +
                acts.sort((a,b) => a.sortOrder - b.sortOrder).map(a => `
                  <div class="settings-row ${a.isArchived ? 'archived' : ''}">
                    <span>${a.icon} ${a.name} <span class="freq-tag">${this.freqLabel(a)}</span></span>
                    <span>
                      <button class="btn-sm" onclick="SettingsPage.editActivity('${a.id}')">编辑</button>
                      <button class="btn-sm" onclick="SettingsPage.toggleArchive('${a.id}')">${a.isArchived ? '恢复' : '归档'}</button>
                    </span>
                  </div>`).join('');
            }).join('')}
          </div>
          <button class="btn btn-outline btn-full" onclick="SettingsPage.addActivity()">+ 添加习惯</button>
        </div>

        <!-- Data Management -->
        <div class="settings-section">
          <div class="settings-section-title">📦 数据管理</div>
          <button class="btn btn-outline btn-full" onclick="SettingsPage.exportData()">📤 导出备份 JSON</button>
          <button class="btn btn-outline btn-full" onclick="SettingsPage.importData()">📥 导入备份 JSON</button>
          <button class="btn btn-danger btn-full" onclick="SettingsPage.resetAll()">🗑 重置所有数据</button>
        </div>

        <!-- Appearance -->
        <div class="settings-section">
          <div class="settings-section-title">🎨 外观</div>
          <div class="theme-row">
            <button class="theme-btn" data-theme="light" onclick="SettingsPage.setTheme('light')">☀️ 浅色</button>
            <button class="theme-btn" data-theme="dark" onclick="SettingsPage.setTheme('dark')">🌙 深色</button>
          </div>
        </div>
      </div>`;
  },

  freqLabel(a) {
    switch(a.frequencyType) {
      case 'daily': return '每天';
      case 'multi_per_day': return `每天${a.frequencyValue}次`;
      case 'every_n_days': return `每${a.frequencyValue}天`;
      case 'weekly': return `每周${a.frequencyValue}次`;
      default: return '';
    }
  },

  setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('habit-theme', t);
  },

  async addCategory() {
    let pickedEmoji = '📁';
    let pickedColor = '#FFAAA5';
    const colors = ['#FFAAA5','#A8D8EA','#AA96DA','#FCBAD3','#A8E6CF','#FFD3B6','#D4A5A5','#C7CEEA'];
    Modal.open('添加分类', `
      <div class="form-group"><label>名称</label><input id="f-cat-name" class="form-input" placeholder="如：运动"></div>
      <div class="form-group"><label>图标</label><div id="f-cat-emoji-pick"></div></div>
      <div class="form-group"><label>颜色</label><div class="color-row">${colors.map(c => `<span class="color-dot" style="background:${c}" data-color="${c}" onclick="this.parentElement.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('selected'));this.classList.add('selected');pickedColor='${c}'"></span>`).join('')}</div></div>`,
      async () => {
        const name = document.getElementById('f-cat-name').value.trim();
        if (!name) return Toast.show('请输入名称');
        await DB.put('categories', {
          id: Utils.generateId(), name, icon: pickedEmoji, color: pickedColor,
          sortOrder: (await DB.getAll('categories')).length,
        });
        Modal.close();
        this.render();
      });
    const pickerEl = document.getElementById('f-cat-emoji-pick');
    if (pickerEl) pickerEl.appendChild(EmojiPicker.render('📁', e => pickedEmoji = e));
  },

  async editCategory(id) {
    const cat = await DB.get('categories', id);
    if (!cat) return;
    let pickedEmoji = cat.icon;
    let pickedColor = cat.color;
    const colors = ['#FFAAA5','#A8D8EA','#AA96DA','#FCBAD3','#A8E6CF','#FFD3B6','#D4A5A5','#C7CEEA'];
    Modal.open('编辑分类', `
      <div class="form-group"><label>名称</label><input id="f-cat-name" class="form-input" value="${cat.name}"></div>
      <div class="form-group"><label>图标</label><div id="f-cat-emoji-pick"></div></div>
      <div class="form-group"><label>颜色</label><div class="color-row">${colors.map(c => `<span class="color-dot${c===cat.color?' selected':''}" style="background:${c}" data-color="${c}" onclick="this.parentElement.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('selected'));this.classList.add('selected');pickedColor='${c}'"></span>`).join('')}</div></div>`,
      async () => {
        cat.name = document.getElementById('f-cat-name').value.trim();
        cat.icon = pickedEmoji;
        cat.color = pickedColor;
        if (!cat.name) return Toast.show('请输入名称');
        await DB.put('categories', cat);
        Modal.close();
        this.render();
        TodayPage.render();
      });
    const pickerEl = document.getElementById('f-cat-emoji-pick');
    if (pickerEl) pickerEl.appendChild(EmojiPicker.render(cat.icon, e => pickedEmoji = e));
  },

  async deleteCategory(id) {
    if (!confirm('删除分类会同时删除该分类下的所有习惯，确定？')) return;
    const acts = await DB.getAllByIndex('activities', 'categoryId', id);
    for (const a of acts) await DB.delete('activities', a.id);
    await DB.delete('categories', id);
    this.render();
    TodayPage.render();
  },

  async addActivity() {
    const categories = await DB.getAll('categories');
    if (!categories.length) return Toast.show('请先添加分类');
    const catOpts = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    let pickedEmoji = '✅';
    Modal.open('添加习惯', `
      <div class="form-group"><label>名称</label><input id="f-act-name" class="form-input" placeholder="如：跑步"></div>
      <div class="form-group"><label>图标</label><div id="f-act-emoji-pick"></div></div>
      <div class="form-group"><label>分类</label><select id="f-act-cat" class="form-input">${catOpts}</select></div>
      <div class="form-group"><label>频率</label><select id="f-act-freq" class="form-input" onchange="document.getElementById('f-act-fval-wrap').style.display=this.value==='daily'?'none':''">
        <option value="daily">每天</option><option value="multi_per_day">每天多次</option><option value="weekly">每周</option><option value="every_n_days">每N天</option>
      </select></div>
      <div class="form-group" id="f-act-fval-wrap" style="display:none"><label>次数/天数</label><input id="f-act-fval" class="form-input" type="number" min="1" value="1"></div>`,
      async () => {
        const name = document.getElementById('f-act-name').value.trim();
        if (!name) return Toast.show('请输入名称');
        await DB.put('activities', {
          id: Utils.generateId(),
          categoryId: document.getElementById('f-act-cat').value,
          name, icon: pickedEmoji, color: null,
          frequencyType: document.getElementById('f-act-freq').value,
          frequencyValue: parseInt(document.getElementById('f-act-fval').value) || 1,
          sortOrder: (await DB.getAll('activities')).length,
          isArchived: false,
          createdAt: Utils.now(),
        });
        Modal.close();
        this.render();
        TodayPage.render();
      });
    const pickerEl = document.getElementById('f-act-emoji-pick');
    if (pickerEl) pickerEl.appendChild(EmojiPicker.render('✅', e => pickedEmoji = e));
  },

  async editActivity(id) {
    const act = await DB.get('activities', id);
    if (!act) return;
    const categories = await DB.getAll('categories');
    const catOpts = categories.map(c => `<option value="${c.id}" ${c.id===act.categoryId?'selected':''}>${c.icon} ${c.name}</option>`).join('');
    let pickedEmoji = act.icon;
    Modal.open('编辑习惯', `
      <div class="form-group"><label>名称</label><input id="f-act-name" class="form-input" value="${act.name}"></div>
      <div class="form-group"><label>图标</label><div id="f-act-emoji-pick"></div></div>
      <div class="form-group"><label>分类</label><select id="f-act-cat" class="form-input">${catOpts}</select></div>
      <div class="form-group"><label>频率</label><select id="f-act-freq" class="form-input" onchange="document.getElementById('f-act-fval-wrap').style.display=this.value==='daily'?'none':''">
        <option value="daily" ${act.frequencyType==='daily'?'selected':''}>每天</option>
        <option value="multi_per_day" ${act.frequencyType==='multi_per_day'?'selected':''}>每天多次</option>
        <option value="weekly" ${act.frequencyType==='weekly'?'selected':''}>每周</option>
        <option value="every_n_days" ${act.frequencyType==='every_n_days'?'selected':''}>每N天</option>
      </select></div>
      <div class="form-group" id="f-act-fval-wrap" style="display:${act.frequencyType==='daily'?'none':''}"><label>次数/天数</label><input id="f-act-fval" class="form-input" type="number" min="1" value="${act.frequencyValue}"></div>`,
      async () => {
        act.name = document.getElementById('f-act-name').value.trim();
        act.icon = pickedEmoji;
        act.categoryId = document.getElementById('f-act-cat').value;
        act.frequencyType = document.getElementById('f-act-freq').value;
        act.frequencyValue = parseInt(document.getElementById('f-act-fval').value) || 1;
        if (!act.name) return Toast.show('请输入名称');
        await DB.put('activities', act);
        Modal.close();
        this.render();
        TodayPage.render();
      });
    const pickerEl = document.getElementById('f-act-emoji-pick');
    if (pickerEl) pickerEl.appendChild(EmojiPicker.render(act.icon, e => pickedEmoji = e));
  },

  async toggleArchive(id) {
    const act = await DB.get('activities', id);
    act.isArchived = !act.isArchived;
    await DB.put('activities', act);
    this.render();
    TodayPage.render();
    Toast.show(act.isArchived ? '已归档' : '已恢复');
  },

  async exportData() {
    const data = {
      version: 1,
      exportedAt: Utils.now(),
      appName: '小习惯',
      data: {
        categories: await DB.getAll('categories'),
        activities: await DB.getAll('activities'),
        checkins: await DB.getAll('checkins'),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `小习惯_备份_${Utils.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('导出成功');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!json.appName || json.appName !== '小习惯') return Toast.show('无效的备份文件');
        if (!confirm(`即将导入 ${json.data.checkins?.length || 0} 条记录，这会覆盖当前数据，确定？`)) return;

        await DB.clear('categories');
        await DB.clear('activities');
        await DB.clear('checkins');
        for (const c of json.data.categories || []) await DB.put('categories', c);
        for (const a of json.data.activities || []) await DB.put('activities', a);
        for (const ch of json.data.checkins || []) await DB.put('checkins', ch);

        this.render();
        TodayPage.render();
        Toast.show('导入成功');
      } catch (err) {
        Toast.show('导入失败：' + err.message);
      }
    };
    input.click();
  },

  async resetAll() {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销！')) return;
    if (!confirm('再次确认：删除所有习惯和打卡记录？')) return;
    await DB.clear('categories');
    await DB.clear('activities');
    await DB.clear('checkins');
    await DB.seedDefaults();
    this.render();
    TodayPage.render();
    Toast.show('已重置');
  },
};
