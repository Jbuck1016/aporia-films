# Aporia Films website: guide for Claude

You are probably helping Andy or Javi Arango, the founders of Aporia Films. They are not developers. Explain what you are doing in plain English, avoid jargon, and confirm what changed once you have finished.

## What this is

- The static website for Aporia Films, a film production company. Live at https://aporia-films.vercel.app.
- Vercel serves the `public/` folder exactly as it is. There is no build step, no framework and no `npm install`.
- Every push to `main` goes live in about 30 seconds.
- There are four pages: Home (`/`), `/projects`, `/about` and `/contact`. All four read their words from the same two JSON files, and the page code renders them in the browser.
- If you want to preview locally, run `python -m http.server 8000` inside `public/` and open http://localhost:8000.

## Where content lives

| Path | What it holds |
|---|---|
| `public/site.json` | Studio copy, founders, emails and socials |
| `public/films.json` | Every film |
| `public/assets/films/` | Film stills: landscape JPG, 1600×900 or larger |
| `public/assets/founders/` | Founder photos: square JPG, around 800×800. Create the folder when the first photo arrives |

### site.json keys

- `_note`: a reminder that the copy is sample text. It never shows on the site.
- `heroIntro`: the sentence under the logo at the top of Home.
- `location`: city label. It appears in the Home intro, the footer and on /contact.
- `tagline`: short label along the bottom of the Home intro.
- `aboutHeadline`: the big About sentence, used on Home and as the heading of /about.
- `aboutShort`: the About paragraph on Home.
- `aboutLong`: the story on /about, as a list of text strings. Each string is one paragraph.
- `projectsIntro`: the line under "All work." on /projects.
- `generalEmail`: the general address. It is shown on Home and /contact, labelled "General", and it is where the /contact form sends messages.
- `socials`: list of `{ "label": "Instagram", "url": "https://..." }`, shown on /contact. Use `[]` for none.
- `founders`: list of founders, in display order. Each founder has these keys:
  - `name`: full name. It is also used as the label above their email.
  - `title`: role, such as "Founding Partner".
  - `email`: their address.
  - `bio`: one paragraph for /about.
  - `photo`: `null` until there is a photo, then a path such as `"/assets/founders/andy.jpg"`.

### films.json keys

The file is `{ "_note": "...", "films": [ ... ] }`. Films appear on the site in the same order as in the file.

- `slug`: the film's ID in links (`/projects#night-swim`). Use lowercase letters and numbers joined by single hyphens, with no spaces. Every slug must be unique. Don't change the slug of a published film, because links already shared would break.
- `title`: the film's title.
- `year`: four digits in quotes, such as `"2026"`, or `null` if there isn't one yet.
- `format`: one of `"Feature"`, `"Short"`, `"Documentary"` or `"Series"`.
- `status`: one of `"Released"`, `"In production"` or `"In development"`. This drives the filter buttons on /projects.
- `featured`: `true` shows the film on Home as well as /projects. `false`, or leaving the key out, means /projects only. Four featured films fill Home best. If none are featured, Home shows the first four.
- `still`: an image path such as `"/assets/films/night-swim.jpg"`. The file must exist, and the name must match exactly, including capitals.
- `synopsis`: one paragraph.
- `credits`: a list of `{ "role": "Director", "name": "..." }`. Use `[]` for none.
- `links`: buttons in the film panel, as a list of `{ "label": "Trailer", "url": "https://..." }`. Use `[]` for none.

## Rules

- **Make content edits only, by default.** Change only `public/site.json`, `public/films.json`, `public/assets/films/` and `public/assets/founders/`.
- **Leave the code alone unless asked.** Don't change `styles.css`, `app.js`, any HTML file, `vercel.json` or any asset outside those two folders, unless the person explicitly asks for a design or behaviour change. If they do, tell them what will change and get a yes before doing it.
- **Never delete a film.** To take one off Home, set `"featured": false`, and tell the person it still appears on /projects. If they want it gone entirely, explain this and let them decide.
- **Keep the `"_note"` key** in both files until the person says the copy is final.
- **Don't invent content.** Never make up credits, years, synopses or links. Ask the person instead.
- **Images should be JPGs with lowercase names and hyphens** (`night-swim.jpg`). Keep stills under about 400 KB and photos under about 300 KB.

## Before every commit

1. Run `node scripts/check-content.mjs`. It checks both JSON files, every required key, slugs, image paths, emails, status and format.
2. If it reports anything, fix it and run it again until it prints `Content OK`. The same check runs on GitHub after every push.
3. Write the commit message in plain English, saying what changed: "Add film: Salt Flat", "Update Javi's email", "Replace About story".
4. Push to `main`. Tell the person the site will update in about 30 seconds, and give them the page link.

## Recipes

### Add a film

1. Put the still in `public/assets/films/` with a lowercase, hyphenated name, such as `night-swim.jpg`.
2. In `public/films.json`, copy an existing film entry and paste it into the `films` list where the film should appear.
3. Fill in every key, using the rules above. Ask the person for anything you don't know.
4. Choose a new unique `slug`, and set `still` to `"/assets/films/night-swim.jpg"`.
5. Run the check, then commit as "Add film: Night Swim".

### Change text

1. Find the key in the tables above. Most text is in `public/site.json`. Film text is in that film's entry in `public/films.json`.
2. Edit only the words inside the quotation marks. Escape any quotation mark inside the text as `\"`.
3. Run the check, then commit, for example "Update About headline".

### Add an image

1. Save it as a JPG with a lowercase, hyphenated name.
   - A film still goes in `public/assets/films/`, landscape, 1600×900 or larger.
   - A founder photo goes in `public/assets/founders/`, square.
2. Point the content at it.
   - For a film still, set that film's `"still": "/assets/films/<name>.jpg"`.
   - For a founder photo, set that founder's `"photo": "/assets/founders/<name>.jpg"`.
3. Run the check, which confirms the file exists, then commit, for example "Add Andy's photo".

## If something goes wrong

The README explains how to roll back to an earlier version in the Vercel dashboard (see "Rolling back"). `DECISIONS.md` explains why the site is built the way it is.
