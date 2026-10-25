// The gate before the doors: a torch in the dark. The light follows the pointer, or wanders alone on a phone, and shows the three scenes.
// Tap anywhere to walk in with sound. Images come from scenePaths(), so new web scenes replace the old loops here too.
// Only the gate videos in view play. With reduced motion nothing plays and the light stays put.

(() => {
  const gate = $('#gate');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bg = document.createElement('div');
  bg.className = 'gate-bg'; bg.setAttribute('aria-hidden', 'true');
  gate.prepend(bg);

  const slides = ARTISTS.map((a) => {
    const s = document.createElement('div');
    s.className = 'slide'; s.style.setProperty('--c', a.color);
    const box = document.createElement('div'); box.className = 'pic';
    s.appendChild(box);
    s.insertAdjacentHTML('beforeend', `<span class="who">${a.name}</span>`);
    bg.appendChild(s);
    mount(box, scenePaths(a.feature));
    return s;
  });
  const dark = document.createElement('div'); dark.className = 'dark'; bg.appendChild(dark);
  const names = [...bg.querySelectorAll('.who')];
  const pauseAll = () => bg.querySelectorAll('video').forEach((v) => v.pause());

  // The pointer, smoothed. Until a hand touches the screen, the point wanders on its own.
  const P = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, hand: false };
  const move = (e) => { P.hand = true; P.tx = e.clientX; P.ty = e.clientY; };
  addEventListener('pointermove', move); addEventListener('pointerdown', move);
  let raf = 0;
  const tick = (t) => {
    if (!P.hand && !still) { P.tx = innerWidth * (.5 + .36 * Math.sin(t / 3100)); P.ty = innerHeight * (.5 + .3 * Math.sin(t / 2300 + 1)); }
    P.x += (P.tx - P.x) * .08; P.y += (P.ty - P.y) * .08;
    const r = Math.max(innerWidth, innerHeight) * (innerWidth < 720 ? .34 : .2);
    bg.style.setProperty('--x', `${P.x}px`); bg.style.setProperty('--y', `${P.y}px`); bg.style.setProperty('--r', `${r}px`);
    const col = Math.min(2, Math.floor(P.x / (innerWidth / 3)));
    names.forEach((n, k) => n.classList.toggle('on', k === col));
    if (!still) raf = requestAnimationFrame(tick);
  };
  tick(0);
  if (still) setTimeout(pauseAll, 700);

  // A tap anywhere walks in with sound; "No sound" is the other way in
  gate.addEventListener('click', (e) => { if (!e.target.closest('button, a')) $('#enterSound').click(); });
  const stop = () => setTimeout(() => { pauseAll(); cancelAnimationFrame(raf); }, 1300);
  $('#enterSound').addEventListener('click', stop);
  $('#enterMute').addEventListener('click', stop);
})();
