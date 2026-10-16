import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Copy static files to the output as-is
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/pictures");

  // Lets the site live in a subfolder (e.g. GitHub Pages project sites):
  // build with  npx @11ty/eleventy --pathprefix=/repo-name/
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // ---------- Date filters (UTC so dates don't shift by timezone) ----------
  const fmt = (d, opts) => new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  eleventyConfig.addFilter("readableDate", (d) => fmt(d, { year: "numeric", month: "long", day: "numeric" }));
  eleventyConfig.addFilter("shortDate", (d) => fmt(d, { month: "short", day: "2-digit" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

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
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
