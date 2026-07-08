/* === Emoji Picker === */
const EmojiPicker = {
  emojis: [
    // Faces
    '😊','😄','💪','🤓','😎','🌟','🔥','💯','🎯','❤️','✨','🎉',
    // Activities & Sports
    '🏃','🏋️','🧘','🏊','🚴','⚽','🏀','🎾','🥊','🤸','🏄','🎿',
    // Food & Drink
    '💧','🥗','🥛','🍎','🥑','🍳','☕','🍵','🥤','🚫','🍚','🥩',
    // Health & Sleep
    '😴','🛌','🌙','⏰','🧠','🫁','💊','🏥',
    // Learning & Work
    '📖','📚','💡','📝','📊','💻','🎓','✍️','🧩','🔬','🎨','🎵',
    // Daily
    '🧹','🪴','🐕','🧴','💆','🚿','🧖','👟','👜','🗂️','📱','💤',
    // Nature & Weather
    '🌞','🌈','🌸','🌿','🍃','☀️','🌊','⛰️',
    // Objects & Symbols
    '✅','⭐','💎','🔔','📌','🎁','🏆','📷',
  ],

  render(selected, onPick) {
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    this.emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn' + (emoji === selected ? ' selected' : '');
      btn.textContent = emoji;
      btn.onclick = () => {
        grid.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        onPick(emoji);
      };
      grid.appendChild(btn);
    });
    return grid;
  },
};
