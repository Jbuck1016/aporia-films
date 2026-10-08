import { mkdir, writeFile } from 'node:fs/promises';
import { site } from './content.mjs';

const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages = [['Home','/'],['Projects','/projects/'],['About','/about/'],['Contact','/contact/']];
const icon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#1b1d1c"/><text x="20" y="30" text-anchor="middle" fill="#eee9dd" font-family="Georgia,serif" font-size="31">A</text></svg>');

function shell(name, content) {
  const title = name === 'Home' ? site.name : `${name} — ${site.name}`;
  const description = name === 'About' ? 'Aporia Films. Andy Arango and Javi Arango, Founding Partners.' : `${site.name}. ${site.introduction}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="noindex, nofollow">
  <meta name="color-scheme" content="dark">
  <title>${escape(title)}</title>
  <link rel="icon" type="${site.logo?'image/png':'image/svg+xml'}" href="${site.logo || icon}">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body class="page-${name.toLowerCase()}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header frame">
    <a class="brand" href="/" aria-label="Aporia Films home">${site.logo?`<span class="brand-mark"><img src="${escape(site.logo)}" alt="" width="5053" height="5052"></span>`:''}<span>Aporia Films<span class="brand-period" aria-hidden="true">.</span></span></a>
    <nav aria-label="Main navigation">
      ${pages.map(([label,href])=>`<a href="${href}"${label===name?' aria-current="page"':''}>${label}</a>`).join('\n      ')}
    </nav>
  </header>
  <main id="main" class="frame" tabindex="-1">${content}</main>
  <footer class="site-footer frame"><span>Aporia Films</span><span class="draft-note">Website draft</span></footer>
</body>
</html>\n`;
}

function home() {
  return `<section class="home-intro" aria-labelledby="home-title">
    <p class="eyebrow">Film production</p>
    <div class="home-lockup">${site.logo?`<div class="logo-panel"><img src="${escape(site.logo)}" alt="" width="5053" height="5052"></div>`:''}<h1 id="home-title" class="home-wordmark"><span>Aporia</span><span class="wordmark-second">Films</span></h1></div>
    <div class="home-baseline"><span class="short-rule" aria-hidden="true"></span><p>${escape(site.introduction)}</p></div>
  </section>`;
}

function projectCard(project, i) {
  const placeholder = !project;
  return `<article class="project-card${placeholder?' is-placeholder':''}">
    <div class="project-art${placeholder?' empty-art':''}">${project?.image ? `<img src="${escape(project.image)}" alt="${escape(project.imageAlt || '')}" loading="lazy" width="900" height="600">` : `<span class="art-placeholder">${placeholder?'Artwork to come':'Artwork forthcoming'}</span>`}<span class="project-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div>
    <div class="project-caption"><h2>${escape(project?.title || 'Project title')}</h2><span class="project-meta">${escape(placeholder?'Draft placeholder':project.year || '')}</span></div>
    ${project?.description?`<p class="project-description">${escape(project.description)}</p>`:''}
    ${project?.credits?`<p class="project-credits">${escape(project.credits)}</p>`:''}
  </article>`;
}

function projects() {
  const items = site.projects.length ? site.projects : [null,null,null];
  return `<section class="page-content" aria-labelledby="projects-title">
    <div class="page-heading"><p class="eyebrow">Aporia Films</p><h1 id="projects-title">Projects<span class="title-period" aria-hidden="true">.</span></h1>${site.projects.length?'':'<p class="page-intro">Film titles and imagery to come.</p>'}</div>
    <div class="project-grid">${items.map(projectCard).join('\n')}</div>
  </section>`;
}

function about() {
  return `<section class="page-content about-content" aria-labelledby="about-title">
    <div class="page-heading"><p class="eyebrow">About</p><h1 id="about-title">Aporia Films<span class="title-period" aria-hidden="true">.</span></h1><p class="page-intro">${escape(site.about || site.introduction)}</p></div>
    <div class="partners">${site.partners.map((partner,i)=>`<article class="partner"><span class="partner-number" aria-hidden="true">0${i+1}</span><h2>${escape(partner.name)}</h2><p>${escape(partner.role)}</p></article>`).join('')}</div>
  </section>`;
}

function contact() {
  return `<section class="page-content contact-content" aria-labelledby="contact-title">
    <div class="page-heading"><p class="eyebrow">Contact</p><h1 id="contact-title">Let’s talk<span class="title-period" aria-hidden="true">.</span></h1>${site.partners.some(p=>p.email)?'':'<p class="page-intro">Contact details to come.</p>'}</div>
    <div class="contact-list">${site.partners.map(partner=>`<article class="contact-row"><div><h2>${escape(partner.name)}</h2><p>${escape(partner.role)}</p></div>${partner.email?`<a class="email-link" href="mailto:${escape(partner.email)}">${escape(partner.email)}</a>`:'<span class="pending-email">Email to be added</span>'}</article>`).join('')}</div>
  </section>`;
}

for (const [name,path] of pages) {
  const folder = new URL(`./dist${path}`, import.meta.url);
  await mkdir(folder, { recursive: true });
  await writeFile(new URL('index.html',folder), shell(name, {Home:home,Projects:projects,About:about,Contact:contact}[name]()));
}
console.log('Generated Home, Projects, About, and Contact.');
