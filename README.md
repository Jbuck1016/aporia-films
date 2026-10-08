# Aporia Films website

Live at https://aporia-films.vercel.app

Everything you will ever need to edit is in the `public` folder:

- `public/films.json` is the list of films.
- `public/site.json` holds the intro line, the About text and the contact emails.
- `public/assets/films/` holds the film images.

You can edit these files directly on GitHub in your browser. You don't need to install anything.

## Add a film

1. Get a still or key art image, landscape, ideally 1600 × 900 pixels, saved as a JPG under about 400 KB.
2. Give it a simple lowercase name with no spaces, such as `night-swim.jpg`.
3. On GitHub, open `public/assets/films/`, click **Add file → Upload files**, drop the image in and click **Commit changes**.
4. Open `public/films.json` and click the pencil icon to edit it.
5. Copy one whole film entry, from its `{` to its matching `}`, and paste it where you want the new film to appear. Films show on the site in the same order as in this file. Put a comma between entries.
6. Change the details:
   - `"slug"`: a short lowercase name with dashes, used in the film's link, such as `"night-swim"`. Each film needs its own.
   - `"title"`: the film's title.
   - `"year"`: such as `"2026"`, or `null` (no quotes) if there isn't one yet.
   - `"format"`: one of `"Feature"`, `"Short"`, `"Documentary"` or `"Series"`.
   - `"status"`: one of `"Released"`, `"In production"` or `"In development"`.
   - `"still"`: `"/assets/films/night-swim.jpg"`, using your image's name.
   - `"synopsis"`: one paragraph.
   - `"credits"`: a list such as `[{ "role": "Director", "name": "Jane Doe" }]`. Use `[]` for none.
   - `"links"`: buttons such as `[{ "label": "Trailer", "url": "https://..." }]`. Use `[]` for none.
7. Click **Commit changes**. The site updates in about a minute.

To remove a film, delete its entry, including the comma that separated it from the next one.

A film's own link is the site address plus `#projects/` and its slug, for example `https://aporia-films.vercel.app/#projects/night-swim`. That link opens the site with the film already expanded.

## Change the About or Contact text

1. Open `public/site.json` on GitHub and click the pencil icon.
2. Change the words inside the quotation marks. Leave the labels to the left of each colon as they are.
   - `"intro"` is the line under the logo at the top.
   - `"about"` holds the headline, the studio story, and the two partner names and titles.
   - `"contact"` holds the headline and the email addresses. Add or remove addresses in the list.
3. Click **Commit changes**.

If a line needs a quotation mark inside it, type it as `\"`.

## How changes go live

1. Every change committed to the `main` branch on GitHub is published automatically by Vercel.
2. It takes about a minute. Refresh https://aporia-films.vercel.app to see it.
3. If the page looks unchanged or broken, the usual cause is a missing comma or quotation mark in a `.json` file. Paste the file into https://jsonlint.com to find the line. You can also undo the change from the file's **History** on GitHub.

## Preview on your own computer (optional)

If Python is installed, open a terminal in the `public` folder, run `python -m http.server 8000`, and visit http://localhost:8000.
