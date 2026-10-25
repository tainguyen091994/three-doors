// Three Doors: a home of three doors, a room of strings for each artist, and a scene for each song.
// Routes: #/ (doors), #/ceralie (room), #/ceralie/06 (song scene). Browser back works.

const $ = (s) => document.querySelector(s);
const touch = matchMedia('(hover: none)').matches;
const pad = (k) => String(k).padStart(2, '0');
const mmss = (s) => `${Math.floor(s / 60)}:${pad(Math.round(s % 60))}`;

// feature is the song that opens each door. Every song's story lives in stories.js. Bios are drafts.
const ARTISTS = [
  {
    id: 'ceralie', name: 'Ceralie', color: '#e3899a', album: 'Out Loud', cover: 'assets/Ceralie - Out Loud.jpg',
    bio: 'Fingerpicked songs about what stays behind: a door left open for a cat, a 32-cent stamp, two bikes on the porch.',
    feature: '06'
  },
  {
    id: 'julius', name: 'Julius Wren', color: '#d6b48f', album: 'Tipped Your Way', cover: 'assets/Julius Wren - Tipped Your Way.jpg',
    bio: 'Songs about staying put. A power cut, one pan for two, and ten years he would live again.',
    feature: '10'
  },
  {
    id: 'halfsaid', name: 'halfsaid', color: '#9eaad6', album: 'Stay Anyway', cover: 'assets/halfsaid - Stay Anyway.jpg',
    bio: 'Two voices, one couple. He raps, she sings. They fight, they grieve, and they stay anyway.',
    feature: '06'
  }
];
ARTISTS.forEach((a) => {
  a.tracks = TRACKS[a.id].map((t) => ({ ...t, id: `${a.id}-${t.n}`, artist: a }));
  a.tracks.forEach((t) => Object.assign(t, STORIES[t.id]));
  a.feature = a.tracks.find((t) => t.n === a.feature);
});

const homeEl = $('#home'), roomEl = $('#room'), sceneEl = $('#scene'), soundBtn = $('#soundBtn');
let view = { name: 'home' }, gateDone = false, mx = -1, my = -1;
const go = (h) => { location.hash = h; };

// ---------- Home: three doors ----------
let openIdx = -1;
ARTISTS.forEach((a, i) => {
  const d = document.createElement('div');
  d.className = 'door'; d.tabIndex = 0; d.style.setProperty('--c', a.color);
  d.setAttribute('role', 'button'); d.setAttribute('aria-label', `${a.name}: ${a.feature.title}`);
  d.innerHTML = `
    <div class="slit"><video muted loop playsinline preload="metadata" src="${src(a.feature.loop)}"></video></div>
    <div class="beam"></div>
    <div class="story">${a.feature.story.map((w, k) => `<span style="transition-delay:${.25 + k * .22}s">${w}</span>`).join('')}</div>
    <div class="hint">${touch ? 'Tap again to walk in' : 'Click to walk in'}</div>
    <div class="label"><div class="name">${a.name}</div><div class="song">${a.feature.title}</div></div>`;
  d.querySelector('video').play().catch(() => {});
  d.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && view.name === 'home') openDoor(i); });
  d.addEventListener('focus', () => { if (!touch && view.name === 'home') openDoor(i); });
  d.addEventListener('click', () => { if (touch && openIdx !== i) openDoor(i); else go(`#/${a.id}`); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(`#/${a.id}`); } });
  homeEl.appendChild(d);
});
homeEl.addEventListener('mouseleave', () => { if (!touch && view.name === 'home') closeDoors(); });

function openDoor(i) {
  if (openIdx === i) return;
  openIdx = i;
  homeEl.classList.add('has-open');
  [...homeEl.children].forEach((d, k) => d.classList.toggle('open', k === i));
  Sound.play(ARTISTS[i].feature, .5);
}
function closeDoors() {
  openIdx = -1;
  homeEl.classList.remove('has-open');
  [...homeEl.children].forEach((d) => d.classList.remove('open'));
  Sound.stop();
}

// ---------- Knock: walk through the door, through the artist's name ----------
const knockEl = $('#knock'), knockV = knockEl.querySelector('video'), knockSpan = knockEl.querySelector('span');
let knockT = [];
function cancelKnock() { knockT.forEach(clearTimeout); knockT = []; knockEl.className = 'knockL'; knockV.pause(); }
function knock(a, done) {
  cancelKnock();
  const dv = homeEl.children[ARTISTS.indexOf(a)].querySelector('video');
  knockV.src = src(a.feature.loop); knockV.currentTime = dv.currentTime || 0; knockV.play().catch(() => {});
  knockSpan.textContent = a.name;
  knockSpan.parentElement.style.fontSize = Math.min(27, 92 / (a.name.length * .56)) + 'vw';
  knockEl.className = 'knockL on';
  const quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
  knockT.push(setTimeout(() => knockEl.classList.add('zoom'), quick ? 0 : 700));
  knockT.push(setTimeout(() => { done(); knockEl.classList.add('out'); }, quick ? 300 : 2700));
  knockT.push(setTimeout(cancelKnock, quick ? 1200 : 3700));
}

// ---------- Room: one string per song ----------
const cv = $('#strings'), g = cv.getContext('2d'), labels = $('#labels'), list = $('#trackList'), hintEl = $('#roomHint');
const room = { a: null, S: [], hot: -1, gap: 60 };
let W = innerWidth, H = innerHeight, leaveT = 0;
const roomHint = () => touch ? 'Tap a string to hear it. Tap again to open it.' : 'Run your hand over a string to hear it. Click to open it.';

function buildRoom(a) {
  if (room.a === a) return;
  room.a = a;
  roomEl.style.setProperty('--c', a.color); sceneEl.style.setProperty('--c', a.color);
  $('#roomAlbum').textContent = `${a.album} · ${a.tracks.length} songs`;
  $('#roomName').textContent = a.name;
  $('#roomBio').textContent = a.bio;
  hintEl.textContent = roomHint();
  labels.innerHTML = ''; list.innerHTML = '';
  room.S = a.tracks.map((t, k) => {
    const lab = document.createElement('div');
    lab.className = 'lab';
    lab.innerHTML = `<b><em>${pad(k + 1)}</em>${t.title}</b><span><span class="tag">${t.word}</span> · ${mmss(t.dur)}</span>`;
    labels.appendChild(lab);
    const li = document.createElement('li'), b = document.createElement('button');
    b.textContent = `${pad(k + 1)} ${t.title}`;
    b.addEventListener('focus', () => setHot(k));
    b.addEventListener('click', () => go(`#/${a.id}/${t.n}`));
    li.appendChild(b); list.appendChild(li);
    return { t, lab, y: 0, amp: 0, px: 0, side: 0 };
  });
  const nx = ARTISTS[(ARTISTS.indexOf(a) + 1) % ARTISTS.length];
  $('#roomNext').href = `#/${nx.id}`; $('#roomNext').textContent = `Next room: ${nx.name}`;
}
function layout() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const head = $('#roomHead'), y0 = head.offsetTop + head.offsetHeight + 56, y1 = H - 76, n = room.S.length;
  room.gap = (y1 - y0) / Math.max(1, n - 1);
  room.S.forEach((s, i) => { s.y = y0 + room.gap * i; s.lab.style.top = s.y + 'px'; });
}
addEventListener('resize', () => { if (room.a) layout(); });

function setHot(i, sound = true) {
  if (i === room.hot) return;
  room.hot = i;
  room.S.forEach((s, k) => s.lab.classList.toggle('hot', k === i));
  if (i > -1) {
    clearTimeout(leaveT);
    if (sound) Sound.play(room.S[i].t, .45);
    if (touch) hintEl.textContent = `Tap again to open “${room.S[i].t.title}”.`;
  } else {
    leaveT = setTimeout(() => { if (room.hot === -1 && view.name === 'room') Sound.stop(); }, 700);
  }
}
function nearest(y) {
  let best = -1, bd = Math.min(70, room.gap * .5);
  room.S.forEach((s, i) => { const d = Math.abs(y - s.y); if (d < bd) { bd = d; best = i; } });
  return best;
}
function enterRoom() {
  layout();
  room.hot = -1; room.S.forEach((s) => s.lab.classList.remove('hot'));
  hintEl.textContent = roomHint();
  // The song you heard at the door is already playing: light up its string
  const cur = Sound.current();
  const k = room.S.findIndex((s) => s.t === cur);
  if (k > -1) setHot(k, false);
  show('room');
}

addEventListener('pointermove', (e) => {
  const x = e.clientX, y = e.clientY;
  if (view.name === 'scene' && tuned) {
    tuned.moved = true;
    sceneEl.style.setProperty('--x', x + 'px'); sceneEl.style.setProperty('--y', y + 'px');
  }
  if (view.name === 'room' && roomEl.classList.contains('on')) {
    room.S.forEach((s) => {
      const side = Math.sign(y - s.y);
      if (s.side && side && side !== s.side && Math.abs(x - mx) < 400) { s.amp = Math.min(46, 10 + Math.abs(y - my) * 1.4); s.px = x; }
      s.side = side;
    });
    if (e.pointerType === 'mouse') {
      setHot(nearest(y));
      roomEl.style.cursor = room.hot > -1 ? 'pointer' : 'crosshair';
    }
  }
  mx = x; my = y;
});
cv.addEventListener('click', (e) => {
  const i = nearest(e.clientY);
  if (i < 0) return;
  if (touch && room.hot !== i) { setHot(i); room.S[i].amp = 30; room.S[i].px = e.clientX; return; }
  go(`#/${room.a.id}/${room.S[i].t.n}`);
});

// ---------- Scene: story lines, then the feeling word, then the song ----------
const media = $('#media'), line = $('#line'), word = $('#word'), end = $('#end'), playBtn = $('#play');
let tuned = null, timers = [];
function tune(a, t) {
  untune();
  tuned = { a, t, t0: performance.now(), moved: false };
  sceneEl.style.setProperty('--c', a.color);
  setMedia(t);
  sceneEl.style.setProperty('--x', (mx > -1 ? mx : W / 2) + 'px');
  sceneEl.style.setProperty('--y', (my > -1 ? my : H / 2) + 'px');
  const k = a.tracks.indexOf(t);
  line.className = 'line'; line.innerHTML = t.story.map((s) => `<span>${s}</span>`).join('');
  word.textContent = t.word || ''; word.classList.remove('on'); end.classList.remove('on');
  $('#who').textContent = `${a.name} · ${t.title} · ${pad(k + 1)} of ${a.album}`;
  $('#lyric').textContent = t.line;
  $('#feel').textContent = t.feeling;
  $('#sceneBack').href = `#/${a.id}`;
  // The story runs over a quiet song; the song swells when the feeling word lands
  if (Sound.enabled) Sound.play(t, .25);
  playBtn.textContent = Sound.current() === t ? 'Playing' : 'Play the song';
  show('scene');
  const spans = [...line.children];
  spans.forEach((s, j) => timers.push(setTimeout(() => s.classList.add('on'), 900 + j * 1300)));
  const after = 900 + spans.length * 1300 + 900;
  timers.push(setTimeout(() => { line.classList.add('out'); word.classList.add('on'); if (Sound.current() === t) Sound.play(t, .9); }, after));
  timers.push(setTimeout(() => end.classList.add('on'), after + 1800));
}
// Mount the first file that loads: the web scene (assets/scenes/<id>.mp4, then .jpg), then the social loop, then the cover
window.scenePaths = (t) => [`assets/scenes/${t.id}.mp4`, `assets/scenes/${t.id}.jpg`, t.loop, t.artist.cover].filter(Boolean);
window.mount = (box, tries, alive = () => true) => {
  const next = (i) => {
    if (i >= tries.length || !alive()) return;
    const p = tries[i], vid = /\.mp4$/.test(p);
    const el = document.createElement(vid ? 'video' : 'img');
    if (vid) { el.muted = el.loop = el.playsInline = el.autoplay = true; } else el.alt = '';
    el.onerror = () => { el.remove(); next(i + 1); };
    el.src = src(p);
    box.innerHTML = ''; box.appendChild(el);
    if (vid) el.play().catch(() => {});
  };
  next(0);
};
function setMedia(t) { mount(media, scenePaths(t), () => tuned && tuned.t === t); }
function untune() {
  timers.forEach(clearTimeout); timers = [];
  const v = media.querySelector('video'); if (v) v.pause();
  tuned = null;
}
$('#skip').onclick = () => {
  timers.forEach(clearTimeout); timers = [];
  line.classList.add('out'); word.classList.add('on'); end.classList.add('on');
  if (tuned) { tuned.t0 = performance.now() - 9000; if (Sound.current() === tuned.t) Sound.play(tuned.t, .9); }
};
playBtn.onclick = () => {
  if (!tuned) return;
  if (!Sound.enabled) { Sound.unlock(); soundBtn.textContent = 'Sound on'; }
  Sound.play(tuned.t, .9); playBtn.textContent = 'Playing';
};

// ---------- One loop draws the strings, the door light, the spotlight and the meter ----------
const bars = [...document.querySelectorAll('#meter i')];
function draw(t) {
  const lv = Sound.level();
  if (openIdx > -1) homeEl.children[openIdx].style.setProperty('--lv', lv.toFixed(3));
  if (view.name === 'room') {
    g.clearRect(0, 0, W, H);
    room.S.forEach((s, i) => {
      s.amp *= .955;
      const voice = Sound.current() === s.t ? lv : 0;
      const hot = i === room.hot || voice > 0;
      g.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const d = (x - s.px) / 180;
        const pluck = s.amp * Math.exp(-d * d) * Math.sin(x * .05 - t * .02);
        const hum = voice * Math.min(26, room.gap * .4) * Math.sin(x * .013 + t * .006) * Math.sin(x * .0041 - t * .0021);
        const bow = i === room.hot && !touch ? Math.max(0, 50 - Math.abs(my - s.y)) / 50 * (my - s.y) * .5 * Math.exp(-Math.pow((x - mx) / 260, 2)) : 0;
        const y = s.y + pluck + hum + bow + Math.sin(x * .02 + t * .001 + i) * .6;
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.strokeStyle = room.a.color;
      g.globalAlpha = hot ? 1 : .4;
      g.lineWidth = hot ? 1.6 + voice * 2 : 1;
      g.shadowColor = room.a.color; g.shadowBlur = hot ? 12 + voice * 30 : 0;
      g.stroke();
    });
    g.globalAlpha = 1; g.shadowBlur = 0;
  }
  if (view.name === 'scene' && tuned) {
    const k = Math.min(1, (performance.now() - tuned.t0) / 9000);
    const base = Math.max(W, H) * (.2 + .95 * k * k * k);
    sceneEl.style.setProperty('--r', (base + lv * Math.max(W, H) * .12) + 'px');
    if (touch && !tuned.moved) {
      sceneEl.style.setProperty('--x', (W / 2 + Math.sin(t / 2100) * W * .2) + 'px');
      sceneEl.style.setProperty('--y', (H / 2 + Math.sin(t / 1700) * H * .15) + 'px');
    }
    bars.forEach((b, j) => b.style.height = (20 + 80 * Math.abs(Math.sin(t / 180 + j * 1.3)) * lv) + '%');
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---------- Routes ----------
function show(name) { [homeEl, roomEl, sceneEl].forEach((el) => el.classList.toggle('on', el.id === name)); }
function parse() {
  const [, id, n] = location.hash.split('/');
  const a = ARTISTS.find((x) => x.id === id);
  if (!a) return { name: 'home' };
  const t = n && a.tracks.find((x) => x.n === n);
  return t ? { name: 'scene', a, t } : { name: 'room', a };
}
function route() {
  if (!gateDone) return;
  const r = parse(), prev = view;
  view = r;
  cancelKnock(); clearTimeout(leaveT);
  if (prev.name === 'scene') untune();
  if (r.name === 'home') { show('home'); closeDoors(); return; }
  buildRoom(r.a);
  if (r.name === 'scene') { tune(r.a, r.t); return; }
  const cur = Sound.current();
  if (prev.name === 'scene' || (cur && cur.artist !== r.a)) Sound.stop();
  if (prev.name === 'home' || (prev.a && prev.a !== r.a)) {
    if (!Sound.current()) Sound.play(r.a.feature, .5);
    knock(r.a, enterRoom);
  } else enterRoom();
}
addEventListener('hashchange', route);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (view.name === 'scene') go(`#/${view.a.id}`);
    else if (view.name === 'room') go('#/');
  }
  if (view.name === 'room' && /^[1-9]$/.test(e.key) && room.S[+e.key - 1]) go(`#/${room.a.id}/${room.S[+e.key - 1].t.n}`);
});

// ---------- Gate: nothing plays before this click ----------
if (touch) $('#gateText').textContent = 'Each door is open a little. Tap one to hear what is behind it. Tap again to walk in. Headphones help.';
function leaveGate(withSound) {
  if (withSound) Sound.unlock();
  soundBtn.hidden = false; soundBtn.textContent = withSound ? 'Sound on' : 'Sound off';
  $('#gate').classList.add('gone');
  document.body.classList.remove('at-gate');
  gateDone = true;
  route();
}
$('#enterSound').onclick = () => leaveGate(true);
$('#enterMute').onclick = () => leaveGate(false);
soundBtn.onclick = () => {
  if (Sound.enabled) { Sound.mute(); soundBtn.textContent = 'Sound off'; return; }
  Sound.unlock(); soundBtn.textContent = 'Sound on';
  if (view.name === 'scene' && tuned) { Sound.play(tuned.t, .9); playBtn.textContent = 'Playing'; }
  else if (view.name === 'room' && room.hot > -1) Sound.play(room.S[room.hot].t, .45);
  else if (view.name === 'home' && openIdx > -1) Sound.play(ARTISTS[openIdx].feature, .5);
};
