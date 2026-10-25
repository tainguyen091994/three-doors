// The gate before the doors, in three test versions. Pick one with ?gate=a, ?gate=b or ?gate=c.
// a: a moving wall of all 19 stories. b: three live slits of light behind the title. c: story lines as giant type with the songs showing through.
// Images come from scenePaths(), so new web scenes replace the old loops here too.

(() => {
  const gate = $('#gate');
  const pick = (new URLSearchParams(location.search).get('gate') || 'a').toLowerCase();
  const v = ['a', 'b', 'c'].includes(pick) ? pick : 'a';
  const bg = document.createElement('div');
  bg.className = `gate-bg gate-${v}`; bg.setAttribute('aria-hidden', 'true');
  gate.prepend(bg);
  gate.classList.add(`is-${v}`);
  const all = ARTISTS.flatMap((a) => a.tracks);
  $('#gateCount').textContent = `${all.length} songs. ${all.length} small stories.`;

  if (v === 'a') {
    // One column per artist; each column holds its songs twice so the scroll can loop
    ARTISTS.forEach((a, k) => {
      const col = document.createElement('div');
      col.className = 'col'; col.style.setProperty('--c', a.color);
      col.style.setProperty('--dur', `${70 + k * 14}s`);
      if (k === 1) col.classList.add('down');
      const lane = document.createElement('div'); lane.className = 'lane';
      [...a.tracks, ...a.tracks].forEach((t, j) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const box = document.createElement('div'); box.className = 'pic';
        tile.appendChild(box);
        tile.insertAdjacentHTML('beforeend', `<p>${t.story[0]} ${t.story[1]}</p><span>${a.name} · ${t.title}</span>`);
        lane.appendChild(tile);
        mount(box, scenePaths(t));
      });
      col.appendChild(lane); bg.appendChild(col);
    });
  }

  if (v === 'b') {
    ARTISTS.forEach((a, k) => {
      const s = document.createElement('div');
      s.className = 'slit2'; s.style.setProperty('--c', a.color); s.style.setProperty('--d', `${k * -2.6}s`);
      const box = document.createElement('div'); box.className = 'pic';
      s.appendChild(box);
      s.insertAdjacentHTML('beforeend', `<span>${a.name}</span>`);
      bg.appendChild(s);
      mount(box, scenePaths(a.feature));
    });
  }

  if (v === 'c') {
    ARTISTS.forEach((a, k) => {
      const row = document.createElement('div');
      row.className = 'row2'; row.style.setProperty('--c', a.color);
      row.style.setProperty('--dur', `${90 + k * 20}s`);
      if (k === 1) row.classList.add('rev');
      const box = document.createElement('div'); box.className = 'pic';
      row.appendChild(box);
      const text = a.tracks.map((t) => t.story.join(' ')).join('  ·  ');
      row.insertAdjacentHTML('beforeend', `<div class="type"><div class="run"><span>${text}  ·  </span><span>${text}  ·  </span></div></div><em>${a.name}</em>`);
      bg.appendChild(row);
      mount(box, scenePaths(a.feature));
    });
  }

  // Test switcher; remove once a version is picked
  const sw = document.createElement('nav');
  sw.className = 'gate-switch';
  sw.innerHTML = 'Gate ' + ['a', 'b', 'c'].map((x) => `<a href="?gate=${x}${location.hash}" class="${x === v ? 'on' : ''}">${x.toUpperCase()}</a>`).join('');
  gate.appendChild(sw);

  // Stop the gate videos once the visitor is inside
  const stop = () => setTimeout(() => bg.querySelectorAll('video').forEach((e) => e.pause()), 1300);
  $('#enterSound').addEventListener('click', stop);
  $('#enterMute').addEventListener('click', stop);
})();
