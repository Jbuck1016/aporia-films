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
      <a class="nav-brand" href="/" aria-label="Aporia Films home"><img src="/assets/mark-bw-96.png" alt="" width="22" height="26"><span>Aporia Films</span></a>
      <nav aria-label="Sections"><ul class="nav-links">${SECTIONS.map(link).join('')}</ul></nav>`;
    $('#footer').innerHTML = `
      <span>© 2026 Aporia Films</span>
      <img src="/assets/mark-bw-96.png" alt="" width="19" height="22">
      <span>${esc(site.location || 'Los Angeles')}</span>`;
  }

  /* ---------- Intro (home only) ---------- */
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

  /* ---------- Copy from site.json ---------- */
  const mailto = (addr) => `<a href="mailto:${esc(addr)}">${esc(addr)}</a>`;

  function renderSite(site) {
    $$('[data-site]').forEach((el) => { const v = site[el.dataset.site]; if (typeof v === 'string') el.textContent = v; });
    const founders = site.founders || [];
    const fill = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };

    // Home
    fill('#partners', founders.map((f, i) => `<li><div><p class="partner-name">${esc(f.name)}</p><p class="label">${esc(f.title)}</p></div><span class="index" aria-hidden="true">${pad(i + 1)}</span></li>`).join(''));

    // About page
    fill('#about-long', (site.aboutLong || []).map((p) => `<p>${esc(p)}</p>`).join(''));
    fill('#founders', founders.map((f) => `
      <li class="founder">
        <div class="founder-photo">${f.photo ? `<img src="${esc(f.photo)}" alt="Portrait of ${esc(f.name)}" width="800" height="800" loading="lazy">` : '<span class="label">[Photo]</span>'}</div>
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
  const meta = (f) => (f.status === 'In development' ? 'In development' : `${f.format} · ${f.year || f.status}`);
  const filmHash = (slug) => (isHome ? `#projects/${slug}` : `#${slug}`);
  const closedHash = () => (isHome ? '#projects' : location.pathname);

  function renderGrid(list) {
    grid.innerHTML = list.map((f, i) => `
      <li class="card" data-slug="${esc(f.slug)}" data-status="${esc(f.status)}">
        <img src="${esc(f.still)}" alt="" width="1600" height="900" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
        <div class="card-body">
          <h3><button class="card-hit" type="button" aria-expanded="false" aria-controls="panel">${esc(f.title)}</button></h3>
          <p class="label">${esc(meta(f))}</p>
        </div>
        <span class="index" aria-hidden="true">${pad(i + 1)}</span>
      </li>`).join('');
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

  $('.scroll-cue')?.addEventListener('click', () => {
    if (root.classList.contains('intro')) return;
    $('#projects').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  });

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
