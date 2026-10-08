import { mkdir, writeFile } from 'node:fs/promises';
import { site } from './content.mjs';

const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections = [['Home','home'],['Projects','projects'],['About','about'],['Contact','contact']];
const icon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#1b1d1c"/><text x="20" y="30" text-anchor="middle" fill="#eee9dd" font-family="Georgia,serif" font-size="31">A</text></svg>');

function shell(content) {
  const description = `${site.name}. ${site.introduction}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="noindex, nofollow">
  <meta name="color-scheme" content="dark">
  <title>${escape(site.name)}</title>
  <link rel="icon" type="${site.logo?'image/png':'image/svg+xml'}" href="${site.logo || icon}">
  <link rel="stylesheet" href="/assets/styles.css">
  <script src="/assets/navigation.js" defer></script>
</head>
<body class="page-home">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header frame">
    <a class="brand" href="#home" aria-label="Aporia Films home">${site.logo?`<span class="brand-mark"><img src="${escape(site.logo)}" alt="" width="5053" height="5052"></span>`:''}<span>Aporia Films<span class="brand-period" aria-hidden="true">.</span></span></a>
    <nav aria-label="Main navigation">
      ${sections.map(([label,id])=>`<a href="#${id}"${id==='home'?' aria-current="location"':''}>${label}</a>`).join('\n      ')}
    </nav>
  </header>
  <main id="main" class="frame" tabindex="-1">${content}</main>
  <footer class="site-footer frame"><span>Aporia Films</span><span class="draft-note">Website draft</span></footer>
</body>
</html>\n`;
}

function home() {
  return `<section id="home" class="home-intro" aria-labelledby="home-title" tabindex="-1">
    <p class="eyebrow">Film production</p>
    <div class="home-lockup">${site.logo?`<div class="logo-panel"><img src="${escape(site.logo)}" alt="" width="5053" height="5052"></div>`:''}<h1 id="home-title" class="home-wordmark"><span>Aporia</span><span class="wordmark-second">Films</span></h1></div>
    <div class="home-baseline"><span class="short-rule" aria-hidden="true"></span><p>${escape(site.introduction)}</p></div>
  </section>`;
}

function projectCard(project, i) {
  const placeholder = !project;
  return `<article class="project-card${placeholder?' is-placeholder':''}">
    <div class="project-art${placeholder?' empty-art':''}">${project?.image ? `<img src="${escape(project.image)}" alt="${escape(project.imageAlt || '')}" loading="lazy" width="900" height="600">` : `<span class="art-placeholder">${placeholder?'Artwork to come':'Artwork forthcoming'}</span>`}<span class="project-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div>
    <div class="project-caption"><h3>${escape(project?.title || 'Project title')}</h3><span class="project-meta">${escape(placeholder?'Draft placeholder':project.year || '')}</span></div>
    ${project?.description?`<p class="project-description">${escape(project.description)}</p>`:''}
    ${project?.credits?`<p class="project-credits">${escape(project.credits)}</p>`:''}
  </article>`;
}

function projects() {
  const items = site.projects.length ? site.projects : [null,null,null];
  return `<section id="projects" class="page-content" aria-labelledby="projects-title" tabindex="-1">
    <div class="page-heading"><p class="eyebrow">Aporia Films</p><h2 id="projects-title">Projects<span class="title-period" aria-hidden="true">.</span></h2>${site.projects.length?'':'<p class="page-intro">Film titles and imagery to come.</p>'}</div>
    <div class="project-grid">${items.map(projectCard).join('\n')}</div>
  </section>`;
}

function about() {
  return `<section id="about" class="page-content about-content" aria-labelledby="about-title" tabindex="-1">
    <div class="page-heading"><p class="eyebrow">About</p><h2 id="about-title">Aporia Films<span class="title-period" aria-hidden="true">.</span></h2><p class="page-intro">${escape(site.about || site.introduction)}</p></div>
    <div class="partners">${site.partners.map((partner,i)=>`<article class="partner"><span class="partner-number" aria-hidden="true">0${i+1}</span><h3>${escape(partner.name)}</h3><p>${escape(partner.role)}</p></article>`).join('')}</div>
  </section>`;
}

function contact() {
  return `<section id="contact" class="page-content contact-content" aria-labelledby="contact-title" tabindex="-1">
    <div class="page-heading"><p class="eyebrow">Contact</p><h2 id="contact-title">Let’s talk<span class="title-period" aria-hidden="true">.</span></h2>${site.partners.some(p=>p.email)?'':'<p class="page-intro">Contact details to come.</p>'}</div>
    <div class="contact-list">${site.partners.map(partner=>`<article class="contact-row"><div><h3>${escape(partner.name)}</h3><p>${escape(partner.role)}</p></div>${partner.email?`<a class="email-link" href="mailto:${escape(partner.email)}">${escape(partner.email)}</a>`:'<span class="pending-email">Email to be added</span>'}</article>`).join('')}</div>
  </section>`;
}

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), shell([home(), projects(), about(), contact()].join('\n')));

// Keep old shared URLs useful on Vercel and on ordinary static preview servers.
for (const [name,id] of sections.slice(1)) {
  const folder = new URL(`./dist/${id}/`, import.meta.url);
  await mkdir(folder, { recursive: true });
  await writeFile(new URL('index.html',folder), `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0;url=/#${id}">
  <title>${name} — ${escape(site.name)}</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head><body><main class="frame page-content"><p>Continue to <a href="/#${id}">${name}</a>.</p></main></body></html>\n`);
}
console.log('Generated one homepage with Home, Projects, About, and Contact sections, plus legacy URL redirects.');
