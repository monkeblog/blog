# Blog (Eleventy)

```
npm install      # once
npm start        # live preview at http://localhost:8080
npm run build    # outputs the site to _site/
```

- New post: copy a file in `src/posts/`, edit its front matter (title, date, author, summary, tags).
- Authors: `src/_data/authors.json` (photos in `src/pictures/`).
- Site name / footer: `src/_data/site.json`.
- Styles: `src/css/style.css`. Banner image: `src/pictures/banner.jpg`.
- Hosting in a subfolder (e.g. GitHub Pages project site): `npx @11ty/eleventy --pathprefix=/repo-name/`
