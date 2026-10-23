# Blog (Eleventy)

```
npm install      # once
npm start        # live preview at http://localhost:8080
npm run build    # outputs the site to _site/
```

- New post: copy a file in `src/posts/`, edit its front matter (title, date, author, tags). The Home preview is the first paragraph; add `summary: ...` to override it.
- Footnotes in posts: `text[^1]` in the body, `[^1]: the note` anywhere below.
- Images & GIFs: put the file in `src/pictures/`, then `![alt text](/pictures/name.gif)`.
  With a caption: `{% figure "/pictures/name.jpg", "alt text", "Caption" %}`
- YouTube: `{% youtube "https://www.youtube.com/watch?v=VIDEO_ID" %}` (any YouTube link works)
- Tweet / X post: `{% tweet "https://x.com/user/status/1234567890" %}`
- Authors: `src/_data/authors.json` (photos in `src/pictures/`).
- Site name / footer: `src/_data/site.json`.
- Styles: `src/css/style.css`. Banner image: `src/pictures/banner.jpg`.

## Deploying (GitHub Pages)

1. Push this folder to a GitHub repo (branch `main`).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site with the right path prefix and publishes it.

Local preview of the subfolder build: `PATH_PREFIX=/repo-name/ npm run build`
