// ---------- Theme ----------
// Runs in <head> so the page never flashes the wrong theme.
(function () {
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light");
})();

document.addEventListener("DOMContentLoaded", function () {
  // Toggle button
  var btn = document.querySelector(".theme-toggle");
  if (btn) {
    var setIcon = function () {
      var dark = document.documentElement.dataset.theme === "dark";
      btn.textContent = dark ? "☀" : "☾";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    };
    setIcon();
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      setIcon();
    });
  }

  // ---------- Archive filters: ?author=author-1 and/or ?tag=embedded ----------
  var archive = document.querySelector(".archive");
  if (!archive) return;

  var params = new URLSearchParams(location.search);
  var author = params.get("author");
  var tag = params.get("tag");
  var items = archive.querySelectorAll("li[data-tags]");
  var tagsOf = function (li) {
    return li.dataset.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
  };

  // Author filter: highlight the active one
  archive.querySelectorAll(".author-filter a").forEach(function (a) {
    if ((a.dataset.author || null) === author) a.classList.add("active");
  });

  // Tag list at the bottom, built from the posts
  var allTags = {};
  items.forEach(function (li) { tagsOf(li).forEach(function (t) { allTags[t] = true; }); });
  var tagBox = archive.querySelector(".all-tags");
  if (tagBox) {
    Object.keys(allTags).sort().forEach(function (t) {
      var a = document.createElement("a");
      a.className = "tag" + (t === tag ? " active" : "");
      a.href = "?tag=" + encodeURIComponent(t);
      a.textContent = t;
      tagBox.appendChild(a);
    });
  }

  if (!author && !tag) return;

  var shown = 0;
  items.forEach(function (li) {
    var ok = (!author || li.dataset.author === author) &&
             (!tag || tagsOf(li).indexOf(tag) !== -1);
    li.hidden = !ok;
    if (ok) shown++;
  });
  archive.querySelectorAll("section.year").forEach(function (sec) {
    sec.hidden = !sec.querySelector("li[data-tags]:not([hidden])");
  });
  var none = archive.querySelector(".no-results");
  if (none) none.hidden = shown > 0;

  // "Showing posts by X · tagged Y · show all"
  var status = archive.querySelector(".filter-status");
  if (status) {
    var parts = [];
    if (author) {
      var link = archive.querySelector('.author-filter a[data-author="' + author + '"] span');
      parts.push("by " + (link ? link.textContent : author));
    }
    if (tag) parts.push("tagged " + tag);
    status.querySelector(".filter-text").textContent = parts.join(", ");
    status.hidden = false;
  }
});
