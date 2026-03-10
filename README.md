# jaypaulson.co

Static personal website for Jay Paulson, built for simple GitHub Pages deployment.

## Local preview

Use any static file server from the repository root.

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Structure

- `index.html` - homepage
- `about.html` - executive bio and leadership perspective
- `speaking.html` - talk topics and speaking positioning
- `writing.html` - featured article list and archive-ready layout
- `contact.html` - contact details and outreach prompts
- `styles.css` - shared site styles
- `script.js` - navigation state and footer year
- `site.webmanifest` - basic install metadata
- `robots.txt` - crawler guidance

## Deploy to GitHub Pages

This site is plain static HTML/CSS/JS, so GitHub Pages can publish it directly.

1. Push the repository to GitHub.
2. In the repository settings, open Pages.
3. Set the source to `Deploy from a branch`.
4. Select the branch you want to publish and the `/ (root)` folder.
5. Save. GitHub Pages will serve the site from the repository root.

## Updating content

- Edit page copy directly in the relevant `.html` file.
- Add new articles to the `article-list` section in `writing.html`.
- Add new talks by duplicating a `talk-card` block in `speaking.html`.

## Notes

- The site is intentionally dependency-free to keep iteration fast.
- Metadata for SEO and social sharing is included on each page and can be updated once the production domain details are finalized.
