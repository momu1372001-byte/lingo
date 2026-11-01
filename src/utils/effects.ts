interface Particle {
  el: HTMLElement;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  g: number;
  sx: number;
  r: number;
}

let fxContainer: HTMLElement | null = null;

function getFxContainer(): HTMLElement {
  if (!fxContainer) {
    fxContainer = document.createElement('div');
    fxContainer.id = 'fx';
    fxContainer.style.cssText =
      'position:fixed;inset:0;perspective:700px;pointer-events:none;z-index:50;overflow:hidden';
    document.body.appendChild(fxContainer);
  }
  return fxContainer;
}

export function burst(
  count: number,
  x: number,
  y: number,
  opts: {
    sad?: boolean;
    ang?: number;
    spread?: number;
    pow?: number;
  } = {},
) {
  const container = getFxContainer();
  const W = innerWidth;
  const H = innerHeight;
  const particles: Particle[] = [];
  const emojis = ['⭐', '🪙', '✨', '💎', '🎉'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'p3';

    if (opts.sad) {
      el.textContent = ['💧', '💧', '🌧️', '🥀'][i % 4];
      el.style.fontSize = 14 + Math.random() * 14 + 'px';
    } else if (i % 3) {
      el.style.cssText = `width:9px;height:15px;border-radius:2px;background:hsl(${Math.random() * 360},90%,60%)`;
    } else {
      el.textContent = emojis[i % 5];
      el.style.fontSize = 16 + Math.random() * 16 + 'px';
    }
    container.appendChild(el);

    if (opts.sad) {
      particles.push({
        el,
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.6,
        z: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 1 + Math.random() * 2,
        vz: 0,
        g: 0.03,
        sx: (Math.random() - 0.5) * 3,
        r: 0,
      });
    } else {
      const ang = (opts.ang ?? -1.57) + (Math.random() - 0.5) * (opts.spread ?? 3);
      const speed = (opts.pow || 9) * (0.4 + Math.random() * 0.8);
      particles.push({
        el,
        x,
        y,
        z: 0,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        vz: (Math.random() - 0.3) * 12,
        g: 0.4,
        sx: (Math.random() - 0.5) * 16,
        r: Math.random() * 360,
      });
    }
  }

  const totalFrames = opts.sad ? 260 : 140;
  let frame = 0;
  function animate() {
    frame++;
    particles.forEach((p) => {
      p.vy += p.g;
      p.vx *= 0.985;
      p.vz *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      p.z = Math.min(p.z + p.vz, 450);
      p.r += p.sx;
      p.el.style.transform = `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.r}deg) rotateY(${p.r * 1.3}deg)`;
      p.el.style.opacity = String(Math.min(1, (totalFrames - frame) / 40));
    });
    if (frame < totalFrames) requestAnimationFrame(animate);
    else particles.forEach((p) => p.el.remove());
  }
  animate();
}

export function flashScreen(color: string) {
  const el = document.createElement('div');
  el.className = 'fl';
  el.style.boxShadow = `inset 0 0 140px 50px ${color}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

export function popText(text: string) {
  const el = document.createElement('div');
  el.className = 'popfx';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

export function confetti() {
  burst(60, innerWidth / 2, innerHeight * 0.4, { pow: 11, spread: 6.3 });
}
