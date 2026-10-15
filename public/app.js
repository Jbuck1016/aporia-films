(() => {
  const root = document.documentElement;
  const page = root.dataset.page || 'home';
  const isHome = page === 'home';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced.matches ? 0 : ms));
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Shared chrome: the one place the nav and footer are defined ---------- */
  const SECTIONS = [['home', 'Home'], ['projects', 'Projects'], ['about', 'About'], ['contact', 'Contact']];
  let activeId = 'home'; // home only: the section currently in view

  function renderChrome(site = {}) {
    // Home links are in-page anchors; section pages link back into home, except their own page.
    const link = ([id, label]) => {
      if (isHome) return `<li><a href="#${id}"${id === activeId ? ' aria-current="true"' : ''}>${label}</a></li>`;
      if (id === page) return `<li><a href="/${id}" aria-current="page">${label}</a></li>`;
      return `<li><a href="/#${id}">${label}</a></li>`;
    };
    $('#nav').innerHTML = `
      <a class="nav-brand" href="/" aria-label="Aporia Films home"><img src="/assets/mark.svg" alt="" width="22" height="25"><span>Aporia Films</span></a>
      <nav aria-label="Sections"><ul class="nav-links">${SECTIONS.map(link).join('')}</ul></nav>`;
    $('#footer').innerHTML = `
      <span>© 2026 Aporia Films</span>
      <img src="/assets/mark.svg" alt="" width="19" height="22">
      <span>${esc(site.location || 'New York · Los Angeles')}</span>`;
  }

  /* ---------- Intro (home only): the logo is drawn by hand around the play triangle ---------- */
  // The mark's geometry in vector units, and the patch of that space the hero image covers (see DECISIONS.md).
  const MARK = { x0: 141.5, y0: 81, w: 798 };
  const HOLE = [[373, 413], [594, 540], [373, 673]];
  const MARK_EDGES = [[153, 153, 704, 477], [704, 477, 593, 540], [593, 540, 262, 349], [262, 349, 261, 990], [261, 990, 153, 926], [153, 926, 153, 153], [153, 153, 266, 90], [266, 90, 928, 480], [928, 480, 817, 544], [817, 544, 372, 800], [372, 800, 373, 673], [373, 673, 704, 477], [262, 349, 373, 413], [373, 413, 372, 800], [928, 480, 930, 606], [930, 606, 261, 990]];

  function playIntro() {
    if (!root.classList.contains('intro')) return;
    const img = $('.mark-img'), cv = $('.mark-cv');
    if (!img || !cv) { root.classList.remove('intro'); return; }
    const x = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const box = cv.getBoundingClientRect();
    const W = cv.width = Math.round(box.width * dpr), H = cv.height = Math.round(box.height * dpr), k = W / MARK.w;
    const at = (px, py) => [(px - MARK.x0) * k, (py - MARK.y0) * k];
    const ink = getComputedStyle(root).getPropertyValue('--text').trim() || '#e9eeec';

    const ease = (v) => (v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
    const seg = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    const noise = (u, s) => { const i = Math.floor(u), f = u - i, w = f * f * (3 - 2 * f); return hash(i, s) * (1 - w) + hash(i + 1, s) * w; };
    const hc = HOLE.reduce((c, q) => [c[0] + q[0] / 3, c[1] + q[1] / 3], [0, 0]);
    // Lines nearest the triangle are drawn first, so the mark grows outward from it
    const edges = MARK_EDGES.map((e, i) => ({ e, i, d: Math.hypot((e[0] + e[2]) / 2 - hc[0], (e[1] + e[3]) / 2 - hc[1]) })).sort((a, b) => a.d - b.d);

    function draw(t) {
      x.clearRect(0, 0, W, H);
      // 2.2–3.1s: the finished logo fills in beneath the pencil lines
      const fill = ease(seg(t, 2.2, 3.1));
      if (fill > 0 && img.complete) { x.globalAlpha = fill; x.drawImage(img, 0, 0, W, H); x.globalAlpha = 1; }
      // 0.75s on: wobbly double pencil lines grow outward; they fade once the logo is in
      const lineAlpha = 1 - ease(seg(t, 2.7, 3.3));
      if (lineAlpha > 0) {
        x.save(); x.strokeStyle = ink; x.lineCap = 'round'; x.lineJoin = 'round'; x.globalAlpha = lineAlpha;
        edges.forEach(({ e, i }, n) => {
          const start = .75 + n * .075, p = ease(seg(t, start, start + .55));
          if (p <= 0) return;
          const len = Math.hypot(e[2] - e[0], e[3] - e[1]), nx = -(e[3] - e[1]) / len, ny = (e[2] - e[0]) / len, N = 26;
          for (let pass = 0; pass < 2; pass++) {
            x.lineWidth = (pass ? 1.3 : 2.2) * 2.4 * k; x.beginPath();
            for (let s = 0; s <= N * p; s++) {
              const u = s / N, w = (noise(u * 3 + i * 7.3, pass * 11) - .5) * 9 + (pass ? 2.5 : 0);
              const [X, Y] = at(e[0] + (e[2] - e[0]) * u + nx * w, e[1] + (e[3] - e[1]) * u + ny * w);
              s ? x.lineTo(X, Y) : x.moveTo(X, Y);
            }
            x.stroke();
          }
        });
        x.restore();
      }
      // 0.1–0.6s: the play triangle appears alone; 1.5–2.4s it sinks back to become the space inside the mark
      const tIn = ease(seg(t, .1, .6)), tri = tIn * (1 - ease(seg(t, 1.5, 2.4)));
      if (tri > 0) {
        const c = at(...hc), sc = .7 + .3 * tIn;
        x.save(); x.globalAlpha = tri; x.fillStyle = ink; x.beginPath();
        HOLE.forEach((q, j) => { const [X, Y] = at(...q); const px = c[0] + (X - c[0]) * sc, py = c[1] + (Y - c[1]) * sc; j ? x.lineTo(px, py) : x.moveTo(px, py); });
        x.closePath(); x.fill(); x.restore();
      }
    }

    const anims = [];
    const animate = (el, frames, opts) => { if (!el) return; anims.push(el.animate(frames, { fill: 'both', ...opts })); };
    // 2.8s: the name comes in; 3.3s: the copy and the menu
    // the handwritten name is written on, left to right
    animate($('.hero-wordmark'), [{ opacity: 1, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { delay: 2800, duration: 900, easing: 'cubic-bezier(.45,.05,.4,1)' });
    $$('.hero-intro, .hero-strip, .nav').forEach((el) => animate(el, [{ opacity: 0.01 }, { opacity: 1 }], { delay: 3300, duration: 450, easing: 'ease-out' }));

    let done = false, raf = 0, t0 = 0;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      try { sessionStorage.setItem('aporia-intro', '1'); } catch (e) {}
      root.classList.remove('intro');
      x.clearRect(0, 0, W, H);
      anims.forEach((a) => a.cancel());
      removeEventListener('pointerdown', finish, true);
      removeEventListener('keydown', onKey, true);
    };
    const onKey = (e) => { if (e.key === 'Escape') finish(); };
    addEventListener('pointerdown', finish, true);
    addEventListener('keydown', onKey, true);
    const step = (now) => {
      t0 = t0 || now;
      const t = (now - t0) / 1000;
      draw(t);
      if (t < 3.75) raf = requestAnimationFrame(step); else finish();
    };
    raf = requestAnimationFrame(step);
  }

  /* ---------- Copy from site.json ---------- */
  const mailto = (addr) => `<a href="mailto:${esc(addr)}">${esc(addr)}</a>`;

  function renderSite(site) {
    $$('[data-site]').forEach((el) => { const v = site[el.dataset.site]; if (typeof v === 'string') el.textContent = v; });
    const founders = site.founders || [];
    const fill = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };

    // Home
    fill('#partners', founders.map((f, i) => `<li><div><p class="partner-name">${esc(f.name)}</p><p class="label">${esc(f.title)}</p></div><span class="index" aria-hidden="true">${pad(i + 1)}</span></li>`).join(''));

    // About page
    // The long story, or the short About paragraph until one is written
    const story = site.aboutLong?.length ? site.aboutLong : [site.aboutShort].filter(Boolean);
    fill('#about-long', story.map((p) => `<p>${esc(p)}</p>`).join(''));
    fill('#founders', founders.map((f) => `
      <li class="founder">
        ${f.photo ? `<div class="founder-photo"><img src="${esc(f.photo)}" alt="Portrait of ${esc(f.name)}" width="800" height="800" loading="lazy"></div>` : ''}
        <h3 class="founder-name">${esc(f.name)}</h3>
        <p class="label">${esc(f.title)}</p>
        ${f.bio ? `<p class="founder-bio">${esc(f.bio)}</p>` : ''}
        ${f.email ? `<p class="founder-email">${mailto(f.email)}</p>` : ''}
      </li>`).join(''));

    // Every address with who it belongs to: home Contact and the /contact page
    const people = [...founders.filter((f) => f.email).map((f) => [f.name, f.email]), ...(site.generalEmail ? [['General', site.generalEmail]] : [])];
    fill('#emails', people.map(([who, addr]) => `<li><p class="label">${esc(who)}</p>${mailto(addr)}</li>`).join(''));
    fill('#contact-list', people.map(([who, addr]) => `<li><p class="label">${esc(who)}</p>${mailto(addr)}</li>`).join(''));
    fill('#socials', (site.socials || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join(''));
  }

  function wireForm(site) {
    const form = $('#enquiry');
    if (!form) return;
    form.addEventListener('input', () => { $('#form-error').hidden = true; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const field = (n) => form.elements.namedItem(n);
      const name = field('name').value.trim(), email = field('email').value.trim(), message = field('message').value.trim();
      const error = $('#form-error');
      const missing = [!name && 'your name', !email && 'your email', !message && 'a message'].filter(Boolean);
      if (missing.length || !field('email').checkValidity()) {
        const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing.at(-1)}` : missing[0];
        error.textContent = missing.length ? `Please add ${list}.` : 'Please check your email address.';
        error.hidden = false;
        (form.querySelector(':invalid') || field('name')).focus();
        return;
      }
      error.hidden = true;
      const subject = `Website enquiry from ${name}`;
      const body = `${message}\n\n${name}\n${email}`;
      const href = `mailto:${site.generalEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.dataset.lastHref = href;
      console.info('[enquiry] opening', href);
      location.href = href;
    });
  }

  /* ---------- Projects (home: featured, /projects: all with filters) ---------- */
  const grid = $('#grid');
  let films = [];
  let open = null; // { slug, card, row }

  // "Feature · 2026", or just "In development" for films without a date yet
  const meta = (f) => (f.status === 'In development' ? '<span class="status">In development</span>' : `${esc(f.format)} · ${esc(f.year || 'TBD')} · <span class="status">${esc(f.status)}</span>`);
  const filmHash = (slug) => (isHome ? `#projects/${slug}` : `#${slug}`);
  const closedHash = () => (isHome ? '#projects' : location.pathname);

  function renderGrid(list) {
    grid.innerHTML = list.map((f, i) => `
      <li class="card${f.still ? '' : ' card--nostill'}" data-slug="${esc(f.slug)}" data-status="${esc(f.status)}">
        ${f.still ? `<img src="${esc(f.still)}" alt="" width="1600" height="900" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">` : ''}
        <div class="card-body">
          <h3><button class="card-hit" type="button" aria-expanded="false" aria-controls="panel">${esc(f.title)}</button></h3>
          <p class="label">${meta(f)}</p>
        </div>
        <span class="index" aria-hidden="true">${pad(i + 1)}</span>
      </li>`).join('') + `
      <li class="card card--soon" data-status="soon">
        <div class="card-body"><h3>Coming soon</h3><p class="label">More projects to be announced</p></div>
      </li>`;
  }

  const columns = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  function rowEnd(card) {
    const cards = $$('.card:not([hidden])', grid);
    const i = cards.indexOf(card), n = columns();
    return cards[Math.min(cards.length - 1, Math.floor(i / n) * n + n - 1)];
  }

  function panelHTML(f) {
    const credits = (f.credits || []).map((c) => `<dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd>`).join('');
    const links = (f.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
    return `
      <div class="panel" id="panel" role="region" aria-labelledby="panel-title">
        <div class="panel-inner">
          ${f.still ? `<div class="panel-still"><img src="${esc(f.still)}" alt="Still from ${esc(f.title)}" width="1600" height="900"></div>` : '<div class="panel-still" aria-hidden="true"></div>'}
          <div class="panel-text">
            <h3 id="panel-title" tabindex="-1">${esc(f.title)}</h3>
            <p class="label">${esc(f.format)} · ${esc(f.year || 'TBD')} · <span class="status">${esc(f.status)}</span></p>
            ${f.synopsis ? `<p class="panel-synopsis">${esc(f.synopsis)}</p>` : ''}
            ${credits ? `<dl class="credits">${credits}</dl>` : ''}
            ${links ? `<div class="panel-links">${links}</div>` : ''}
          </div>
          <button class="panel-close" type="button" aria-label="Close ${esc(f.title)} details">
            <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>
      </div>`;
  }

  async function openFilm(slug, { focus = true, scroll = false } = {}) {
    const f = films.find((x) => x.slug === slug);
    const card = grid.querySelector(`.card[data-slug="${CSS.escape(slug)}"]`);
    if (!f || !card || card.hidden) return;
    if (open?.slug === slug) return;
    if (open) await closeFilm({ restoreFocus: false, keepHash: true });

    history.replaceState(null, '', filmHash(slug));
    open = { slug, card, row: null };
    card.querySelector('.card-hit').setAttribute('aria-expanded', 'true');
    if (scroll) card.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });

    // The piece covers the lens, then the panel opens beneath the row.
    card.classList.add('is-covered');
    await wait(300);
    if (open?.slug !== slug) return;
    const row = document.createElement('li');
    row.className = 'panel-row';
    row.innerHTML = panelHTML(f);
    rowEnd(card).after(row);
    open.row = row;
    const panel = $('.panel', row);
    $('.panel-close', row).addEventListener('click', () => closeFilm());
    requestAnimationFrame(() => {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.classList.add('is-open');
      card.classList.replace('is-covered', 'is-active');
    });
    panel.addEventListener('transitionend', (e) => { if (e.propertyName === 'max-height' && panel.classList.contains('is-open')) panel.style.maxHeight = 'none'; });
    if (reduced.matches) panel.style.maxHeight = 'none';
    if (focus) $('#panel-title', row).focus({ preventScroll: true });
  }

  async function closeFilm({ restoreFocus = true, keepHash = false } = {}) {
    if (!open) return;
    const { card, row } = open;
    open = null;
    card.classList.remove('is-covered', 'is-active');
    card.querySelector('.card-hit').setAttribute('aria-expanded', 'false');
    if (!keepHash) history.replaceState(null, '', closedHash());
    if (row) {
      const panel = $('.panel', row);
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.offsetHeight; // commit the start height before collapsing
      panel.classList.remove('is-open');
      panel.style.maxHeight = '0px';
      await wait(320);
      row.remove();
    }
    if (restoreFocus) card.querySelector('.card-hit').focus({ preventScroll: true });
  }

  function slugFromHash() {
    const m = isHome ? location.hash.match(/^#projects\/(.+)$/) : location.hash.match(/^#(.+)$/);
    const slug = m ? decodeURIComponent(m[1]) : null;
    return slug && films.some((f) => f.slug === slug) ? slug : null;
  }

  function wireFilters() {
    // With films in only one status, filter buttons would just lead to empty pages, so hide them.
    const filters = $('.filters');
    if (filters) filters.hidden = new Set(films.map((f) => f.status)).size < 2;
    const chips = $$('.chip');
    chips.forEach((chip) => chip.addEventListener('click', async () => {
      if (chip.getAttribute('aria-pressed') === 'true') return;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      if (open) await closeFilm({ restoreFocus: false });
      const want = chip.dataset.filter;
      let shown = 0;
      $$('.card', grid).forEach((card) => {
        card.hidden = !(want === 'all' || card.dataset.status === want);
        if (!card.hidden) shown++;
      });
      $('#grid-empty').hidden = shown > 0;
    }));
  }

  async function loadFilms() {
    if (!grid) return;
    try {
      const data = await (await fetch('/films.json')).json();
      films = Array.isArray(data) ? data : data.films || [];
    } catch (e) {
      films = [];
    }
    let list = films;
    if (isHome) {
      const featured = films.filter((f) => f.featured);
      list = featured.length ? featured : films.slice(0, 4);
    }
    renderGrid(list);
    wireFilters();
    grid.addEventListener('click', (e) => {
      const hit = e.target.closest('.card-hit');
      if (!hit) return;
      const slug = hit.closest('.card').dataset.slug;
      open?.slug === slug ? closeFilm() : openFilm(slug);
    });
    const slug = slugFromHash();
    if (slug) {
      if (isHome) $('#projects').scrollIntoView({ behavior: 'instant' });
      openFilm(slug, { focus: false, scroll: true });
    }
  }

  addEventListener('hashchange', () => {
    const slug = slugFromHash();
    if (slug) openFilm(slug, { scroll: true });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open && !root.classList.contains('intro')) closeFilm(); });
  let lastCols = 0;
  addEventListener('resize', () => {
    if (!grid) return;
    const n = columns();
    if (n === lastCols) return;
    lastCols = n;
    if (open?.row) rowEnd(open.card).after(open.row);
  });

  /* ---------- Nav state, reveals, scroll cue ---------- */
  function observeSections() {
    if (!isHome) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        activeId = en.target.id;
        $$('.nav-links a').forEach((a) => (a.getAttribute('href') === `#${en.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach((s) => io.observe(s));
  }

  function observeReveals() {
    const reveals = $$('.reveal');
    if (reduced.matches || !('IntersectionObserver' in window)) { reveals.forEach((r) => r.classList.add('is-in')); return; }
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach((r) => rio.observe(r));
  }

  // Home heading rows: if an H2 wraps onto several lines, its link drops onto its own line beneath it.
  function stackHeadLinks() {
    $$('.head-title').forEach((row) => {
      const h2 = $('h2', row);
      row.classList.remove('is-stacked');
      const lines = h2.getBoundingClientRect().height / parseFloat(getComputedStyle(h2).lineHeight);
      row.classList.toggle('is-stacked', lines > 1.5);
    });
  }
  addEventListener('resize', stackHeadLinks);
  document.fonts?.ready.then(stackHeadLinks);

  renderChrome();
  playIntro();
  observeSections();
  observeReveals();

  const siteReady = fetch('/site.json').then((r) => r.json()).then((site) => {
    renderChrome(site);
    renderSite(site);
    wireForm(site);
    root.classList.add('site-ready');
  }).catch(() => root.classList.add('site-ready'));

  // Arriving at /#about from another page: content above the target only exists once the JSON
  // has rendered, so land on the section again after it has.
  Promise.all([siteReady, loadFilms()]).then(() => {
    root.classList.add('data-ready');
    stackHeadLinks();
    const target = isHome && /^#(projects|about|contact)$/.test(location.hash) && $(location.hash);
    if (target) target.scrollIntoView({ behavior: 'instant' });
  });
  if (grid) lastCols = columns();
})();
