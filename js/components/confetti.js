/* === Canvas Confetti Burst === */
const Confetti = {
  fire(x, y, color = '#FFAAA5') {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const colors = [color, '#A8D8EA', '#AA96DA', '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5'];
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: -(Math.random() * 6 + 2),
        r: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.08,
      });
    }

    const anim = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(anim);
      else document.body.removeChild(canvas);
    };
    requestAnimationFrame(anim);
  },
};
