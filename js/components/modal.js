/* === Modal Dialog === */
const Modal = {
  open(title, bodyHTML, onSave) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" onclick="Modal.close()">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="Modal.close()">取消</button>
        <button class="btn btn-primary" id="modal-save-btn">保存</button>
      </div>`;
    overlay.style.display = 'flex';
    document.getElementById('modal-save-btn').onclick = () => {
      if (onSave) onSave(content);
    };
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };
  },

  close() {
    document.getElementById('modal-overlay').style.display = 'none';
  },
};
