(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced.matches ? 0 : ms));

  /* ---------- Intro ---------- */
  function playIntro() {
    if (!root.classList.contains('intro')) return;
    const anims = [];
    const animate = (el, frames, opts) => { const a = el.animate(frames, { fill: 'both', ...opts }); anims.push(a); return a; };
    const rand = (min, max) => min + Math.random() * (max - min);

    // 0.0–0.9s: segments draw in at scattered positions; 0.9–1.5s: they settle into place.
    $$('.hero-mark .seg:not(.cube-side)').forEach((seg) => {
      seg.style.transformBox = 'fill-box';
      seg.style.transformOrigin = 'center';
      const scatter = `translate(${rand(-140, 140).toFixed(0)}px, ${rand(-120, 120).toFixed(0)}px) rotate(${rand(-35, 35).toFixed(0)}deg) scale(${rand(.6, .9).toFixed(2)})`;
      const delay = rand(0, 450);
      animate(seg, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay, duration: 900 - delay, easing: 'ease-out' });
      animate(seg, [
        { transform: scatter, offset: 0 },
        { transform: scatter, offset: .6 },
        { transform: 'none', offset: 1, easing: 'ease' },
      ], { duration: 1500, easing: 'cubic-bezier(.6,0,.2,1)' });
    });
    // Faces close and fill as the outline locks.
    $$('.hero-mark .face:not(.cube-side)').forEach((face, i) => {
      animate(face, [{ opacity: 0 }, { opacity: 1 }], { delay: 1050 + i * 70, duration: 380, easing: 'ease-out' });
    });
    // 1.5–1.9s: the cube separates up-right and settles.
    animate($('.cube-drift'), [{ transform: 'none' }, { transform: 'translate(34%, -36%) rotate(8deg)' }], { delay: 1500, duration: 400, easing: 'cubic-bezier(.2,.8,.3,1)' });
    $$('.cube-side').forEach((el) => {
      animate(el, [{ opacity: 0, strokeDashoffset: 0 }, { opacity: 1, strokeDashoffset: 0 }], { delay: 1520, duration: 300 });
    });
    // 1.9–2.6s: wordmark rises, then the copy and chrome.
    animate($('.hero-wordmark'), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { delay: 1900, duration: 450, easing: 'ease-out' });
    $$('.hero-intro, .hero-strip, .nav').forEach((el) => {
      animate(el, [{ opacity: 0.01 }, { opacity: 1 }], { delay: 2200, duration: 400, easing: 'ease-out' });
    });

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { sessionStorage.setItem('aporia-intro', '1'); } catch (e) {}
      root.classList.remove('intro');
      anims.forEach((a) => a.cancel());
      removeEventListener('pointerdown', finish, true);
      removeEventListener('keydown', onKey, true);
    };
    const onKey = (e) => { if (e.key === 'Escape') finish(); };
    addEventListener('pointerdown', finish, true);
    addEventListener('keydown', onKey, true);
    Promise.all(anims.map((a) => a.finished)).then(finish, () => {});
  }

  /* ---------- Editable copy from site.json ---------- */
  async function loadSite() {
    try {
      const site = await (await fetch('/site.json')).json();
      const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), site);
      $$('[data-site]').forEach((el) => { const v = get(el.dataset.site); if (typeof v === 'string') el.textContent = v; });
      if (site.about?.partners) {
        $('#partners').innerHTML = site.about.partners.map((p, i) => `<li><div><p class="partner-name">${esc(p.name)}</p><p class="label">${esc(p.role)}</p></div><span class="index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></li>`).join('');
      }
      if (site.contact?.emails) {
        $('#emails').innerHTML = site.contact.emails.map((m) => `<li><a href="mailto:${esc(m)}">${esc(m)}</a></li>`).join('');
      }
    } catch (e) { /* the markup already carries the default copy */ }
  }

  /* ---------- Projects ---------- */
  const grid = $('#grid');
  let films = [];
  let open = null; // { slug, card, row }

  // "Feature · 2026", or just "In development" for films without a date yet
  const meta = (f) => (f.status === 'In development' ? 'In development' : `${f.format} · ${f.year || f.status}`);

  function renderGrid() {
    grid.innerHTML = films.map((f, i) => `
      <li class="card" data-slug="${esc(f.slug)}">
        <img src="${esc(f.still)}" alt="" width="1600" height="900" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
        <div class="card-body">
          <h3><button class="card-hit" type="button" aria-expanded="false" aria-controls="panel">${esc(f.title)}</button></h3>
          <p class="label">${esc(meta(f))}</p>
        </div>
        <span class="index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      </li>`).join('');
  }

  const columns = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  function rowEnd(card) {
    const cards = $$('.card', grid);
    const i = cards.indexOf(card), n = columns();
    return cards[Math.min(cards.length - 1, Math.floor(i / n) * n + n - 1)];
  }

  function panelHTML(f) {
    const credits = (f.credits || []).map((c) => `<dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd>`).join('');
    const links = (f.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
    return `
      <div class="panel" id="panel" role="region" aria-labelledby="panel-title">
        <div class="panel-inner">
          <div class="panel-still"><img src="${esc(f.still)}" alt="Still from ${esc(f.title)}" width="1600" height="900"></div>
          <div class="panel-text">
            <h3 id="panel-title" tabindex="-1">${esc(f.title)}</h3>
            <p class="label">${esc([f.format, f.year, f.status].filter(Boolean).join(' · '))}</p>
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
    if (!f || !card) return;
    if (open?.slug === slug) return;
    if (open) await closeFilm({ restoreFocus: false, keepHash: true });

    history.replaceState(null, '', `#projects/${slug}`);
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
    panel.addEventListener('transitionend', (e) => { if (e.propertyName === 'max-height' && panel.classList.contains('is-open')) panel.style.maxHeight = 'none'; }, { once: false });
    if (reduced.matches) panel.style.maxHeight = 'none';
    if (focus) $('#panel-title', row).focus({ preventScroll: true });
  }

  async function closeFilm({ restoreFocus = true, keepHash = false } = {}) {
    if (!open) return;
    const { card, row } = open;
    open = null;
    card.classList.remove('is-covered', 'is-active');
    card.querySelector('.card-hit').setAttribute('aria-expanded', 'false');
    if (!keepHash) history.replaceState(null, '', '#projects');
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
    const m = location.hash.match(/^#projects\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  async function loadFilms() {
    try {
      films = await (await fetch('/films.json')).json();
    } catch (e) {
      films = [];
    }
    renderGrid();
    grid.addEventListener('click', (e) => {
      const hit = e.target.closest('.card-hit');
      if (!hit) return;
      const slug = hit.closest('.card').dataset.slug;
      open?.slug === slug ? closeFilm() : openFilm(slug);
    });
    const slug = slugFromHash();
    if (slug) {
      $('#projects').scrollIntoView();
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
    const n = columns();
    if (n === lastCols) return;
    lastCols = n;
    if (open?.row) rowEnd(open.card).after(open.row);
  });

  /* ---------- Nav state, reveals, scroll cue ---------- */
  function observeSections() {
    const links = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a, id) => (id === en.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach((s) => io.observe(s));

    const reveals = $$('.reveal');
    if (reduced.matches || !('IntersectionObserver' in window)) { reveals.forEach((r) => r.classList.add('is-in')); return; }
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach((r) => rio.observe(r));
  }

  $('.scroll-cue').addEventListener('click', () => {
    if (root.classList.contains('intro')) return;
    $('#projects').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  });

  playIntro();
  observeSections();
  loadSite();
  loadFilms();
  lastCols = columns();
})();
