import { HtmlBasePlugin } from "@11ty/eleventy";
import footnotes from "markdown-it-footnote";

export default function (eleventyConfig) {
  // Footnotes in Markdown:  text[^1]  ...  [^1]: the note
  // Clicking the number in the text jumps to the note; clicking the note's
  // number jumps back. (No ↩ arrows.)
  eleventyConfig.amendLibrary("md", (md) => {
    md.use(footnotes);
    const r = md.renderer.rules;
    r.footnote_anchor = () => "";                       // drop the ↩ links

    // *** = "* * *" section break, --- = plain line
    r.hr = (tokens, idx) =>
      tokens[idx].markup.startsWith("*") ? '<hr class="section-break">\n' : "<hr>\n";
    r.footnote_open = (tokens, idx, options, env, slf) => {
      const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      const n = tokens[idx].meta.id + 1;
      return `<li id="fn${id}" class="footnote-item">` +
        `<a href="#fnref${id}" class="footnote-num" aria-label="Back to text">${n}.</a>`;
    };
  });

  // ---------- Media in posts ----------
  // Plain Markdown images (jpg, png, gif, webp…) load lazily:  ![alt text](/pictures/cat.gif)
  eleventyConfig.amendLibrary("md", (md) => {
    const defaultImage = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, slf) => {
      tokens[idx].attrSet("loading", "lazy");
      return defaultImage(tokens, idx, options, env, slf);
    };
  });

  const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  // Image with a caption:  {% figure "/pictures/cat.gif", "Alt text", "Caption (optional)" %}
  eleventyConfig.addShortcode("figure", (src, alt = "", caption = "") =>
    `<figure><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` +
    (caption ? `<figcaption>${caption}</figcaption>` : "") + `</figure>`
  );

  // YouTube:  {% youtube "https://www.youtube.com/watch?v=VIDEO_ID" %}  (any YouTube link, or just the ID)
  eleventyConfig.addShortcode("youtube", (url, title = "YouTube video") => {
    const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    const id = m ? m[1] : String(url).trim();
    const t = String(url).match(/[?&]t=(\d+)/);
    const start = t ? `?start=${t[1]}` : "";
    return `<div class="embed embed-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}${start}" ` +
      `title="${esc(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
      `allowfullscreen></iframe></div>`;
  });

  // Tweet / X post:  {% tweet "https://x.com/user/status/1234567890" %}
  // Shows as a plain link until Twitter's script loads it; follows the site's light/dark theme.
  eleventyConfig.addShortcode("tweet", (url) => {
    const href = String(url).replace(/^https?:\/\/(www\.)?(x|twitter)\.com/, "https://twitter.com");
    return `<div class="embed embed-tweet"><blockquote class="twitter-tweet" data-dnt="true"><a href="${esc(href)}">View post on X</a></blockquote>` +
      `<script>document.currentScript.previousElementSibling.dataset.theme=document.documentElement.dataset.theme||"light"</script>` +
      `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>`;
  });

  // Copy static files to the output as-is
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/pictures");

  // Applies pathPrefix (below) to every URL in the HTML
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // ---------- Date filters (UTC so dates don't shift by timezone) ----------
  const fmt = (d, opts) => new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  eleventyConfig.addFilter("readableDate", (d) => fmt(d, { year: "numeric", month: "long", day: "numeric" }));
  eleventyConfig.addFilter("shortDate", (d) => fmt(d, { month: "short", day: "2-digit" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  // First paragraph of a post's HTML as plain text (footnote markers removed).
  // Used as the preview when a post has no "summary" in its front matter.
  eleventyConfig.addFilter("firstParagraph", (html = "") => {
    // First paragraph that has actual text (skips image-only paragraphs)
    for (const m of html.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
      const text = m[1]
        .replace(/<sup class="footnote-ref">[\s\S]*?<\/sup>/g, "")
        .replace(/<[^>]+>/g, "")
        .trim();
      if (text) return text;
    }
    return "";
  });

  // First n items of an array
  eleventyConfig.addFilter("head", (arr, n) => (n < 0 ? arr.slice(n) : arr.slice(0, n)));

  // Post tags without Eleventy's internal "posts" tag
  eleventyConfig.addFilter("topicTags", (tags = []) => tags.filter((t) => t !== "posts"));

  // ---------- Collections ----------
  // All posts, newest first
  eleventyConfig.addCollection("postsNewest", (api) =>
    api.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  // Posts grouped by year, newest first: [{ year, posts: [...] }]
  eleventyConfig.addCollection("postsByYear", (api) => {
    const groups = new Map();
    api.getFilteredByTag("posts")
      .sort((a, b) => b.date - a.date)
      .forEach((p) => {
        const y = p.date.getUTCFullYear();
        if (!groups.has(y)) groups.set(y, []);
        groups.get(y).push(p);
      });
    return [...groups].map(([year, posts]) => ({ year, posts }));
  });

  return {
    // Subfolder the site is served from. GitHub Pages project sites live at
    // username.github.io/<repo>/, so the deploy workflow sets PATH_PREFIX to "/<repo>/".
    // Locally (npm start) it stays "/". HtmlBasePlugin rewrites every link/image for it.
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
