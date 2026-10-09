# Aporia Films website

Live at https://aporia-films.vercel.app

## How the site is laid out

There are four pages:

- **Home** (`/`) is one long scrolling page with four sections: the logo intro, Projects, About and Contact. It shows only your featured films and short versions of the About and Contact text. Each section ends with a link to its full page.
- **Projects** (`/projects`) shows every film, with filter buttons for Released, In production and In development.
- **About** (`/about`) has the full studio story and a block for each founder, with photo, bio and email.
- **Contact** (`/contact`) lists every email address and has a form that opens the visitor's own email app.

All four pages read their words from the same two files, so you only ever change something in one place:

- `public/site.json` holds all the studio text, the founders and the contact details.
- `public/films.json` holds the list of films.
- Images go in `public/assets/films/` (film stills) and `public/assets/founders/` (founder photos).

You can edit these files directly on GitHub in your browser. You don't need to install anything. You never need to touch the `.html`, `.css` or `.js` files. The menu and footer are defined once and appear on every page automatically.

Both files currently contain **sample copy** so the site reads as finished. The `"_note"` line at the top of each file is a reminder. Replace the sample text before launch. The `"_note"` lines themselves never show on the site, so you can leave them or delete them.

## Where each piece of text lives in site.json

| In site.json | Where it appears |
|---|---|
| `heroIntro` | The sentence under the logo at the top of Home |
| `location`, `tagline` | The small labels along the bottom of the Home intro (location also appears in the footer and on Contact) |
| `aboutHeadline` | The big About sentence, on Home and at the top of /about |
| `aboutShort` | The paragraph in the About section on Home |
| `aboutLong` | The story on /about. Each item in the list is one paragraph |
| `projectsIntro` | The line under "All work." on /projects |
| `founders` | Each founder's `name`, `title`, `email`, `bio` and `photo`. Used on Home (About and Contact), /about and /contact |
| `generalEmail` | The general address. It is shown on Home and /contact, and it is where the contact form sends messages |
| `socials` | Links shown on /contact, such as `{ "label": "Instagram", "url": "https://..." }`. Use `[]` to show none |

To change the text, open `public/site.json` on GitHub, click the pencil icon, change the words inside the quotation marks, and click **Commit changes**. Leave the labels to the left of each colon as they are. If a line needs a quotation mark inside it, type it as `\"`.

## Add a founder photo

1. Use a square photo, ideally 800 × 800 pixels, saved as a JPG under about 300 KB.
2. Give it a simple lowercase name such as `andy.jpg`.
3. On GitHub, open `public/assets/`, click **Add file → Upload files**, and type `founders/` in front of the file name so it lands in a `founders` folder. Then click **Commit changes**.
4. In `public/site.json`, change that founder's `"photo": null` to `"photo": "/assets/founders/andy.jpg"`.

Until a photo is set, the page shows a grey square marked [Photo].

## Add a film

1. Get a still or key art image, landscape, ideally 1600 × 900 pixels, saved as a JPG under about 400 KB.
2. Give it a simple lowercase name with no spaces, such as `night-swim.jpg`.
3. On GitHub, open `public/assets/films/`, click **Add file → Upload files**, drop the image in and click **Commit changes**.
4. Open `public/films.json` and click the pencil icon to edit it.
5. Inside the `"films"` list, copy one whole film entry, from its `{` to its matching `}`, and paste it where you want the new film to appear. Films show in the same order as in this file. Put a comma between entries.
6. Change the details:
   - `"slug"`: a short lowercase name with dashes, used in the film's link, such as `"night-swim"`. Each film needs its own.
   - `"title"`: the film's title.
   - `"year"`: such as `"2026"`, or `null` (no quotes) if there isn't one yet.
   - `"format"`: one of `"Feature"`, `"Short"`, `"Documentary"` or `"Series"`.
   - `"status"`: one of `"Released"`, `"In production"` or `"In development"`. This drives the filter buttons on /projects.
   - `"featured"`: `true` to show the film on Home as well as on /projects, `false` for /projects only.
   - `"still"`: `"/assets/films/night-swim.jpg"`, using your image's name.
   - `"synopsis"`: one paragraph.
   - `"credits"`: a list such as `[{ "role": "Director", "name": "Jane Doe" }]`. Use `[]` for none.
   - `"links"`: buttons such as `[{ "label": "Trailer", "url": "https://..." }]`. Use `[]` for none.
7. Click **Commit changes**. The site updates in about a minute.

**Featured films:** Home shows every film marked `"featured": true`, in file order. Four works best, since they fill two rows. If no film is featured, Home shows the first four in the file.

To take a film off Home, set `"featured": false`. It stays on /projects. To remove it from the site completely, delete its entry, including the comma that separated it from the next one.

**Linking to one film:** `https://aporia-films.vercel.app/projects#night-swim` opens the Projects page with that film already expanded. `https://aporia-films.vercel.app/#projects/night-swim` does the same on Home, if the film is featured.

## Editing with Claude

You can ask Claude to make changes for you, such as "add this film" or "update my bio". `CLAUDE.md` at the top of the repository tells Claude how this site works. It also sets the rules Claude follows: change only the words and images unless you ask for a design change, never delete a film, and check the content before saving.

Every change, from Claude or made by hand on GitHub, is checked automatically after it is saved. If something is wrong, such as a missing image, a typo in a status or a duplicate slug, the commit gets a red ✗ on GitHub. Click it to see a plain-English list of what to fix. On a computer with Node installed, run `node scripts/check-content.mjs` to run the same check.

## How changes go live

1. Every change committed to the `main` branch on GitHub is published automatically by Vercel.
2. It takes about a minute. Refresh the site to see it.
3. If a page looks unchanged or broken, the usual cause is a missing comma or quotation mark in a `.json` file. Paste the file into https://jsonlint.com to find the line. You can also undo the change from the file's **History** on GitHub.

## Rolling back

If a change breaks the site, you can put the previous version back in about a minute:

1. Open the Vercel dashboard: https://vercel.com/jbuck1016s-projects/aporia-films
2. Click **Deployments**.
3. Find the last deployment from before the change, click the **⋯** menu beside it and choose **Promote to Production**.

The site switches back straight away. The bad change is still saved on GitHub, so fix it there (or ask Claude to). The next push to `main` goes live as usual.

## Preview on your own computer (optional)

If Python is installed, open a terminal in the `public` folder, run `python -m http.server 8000`, and visit http://localhost:8000.
