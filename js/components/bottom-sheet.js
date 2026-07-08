/* === Bottom Sheet === */
const BottomSheet = {
  open(html) {
    const overlay = document.getElementById('detail-sheet');
    const body = document.getElementById('detail-sheet-body');
    body.innerHTML = html;
    overlay.style.display = 'block';
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };
  },

  close() {
    document.getElementById('detail-sheet').style.display = 'none';
  },
};
