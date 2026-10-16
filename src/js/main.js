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

  // ---------- Tag filter (Archive page only) ----------
  var archive = document.querySelector(".archive");
  if (!archive) return;

  var items = archive.querySelectorAll("li[data-tags]");
  var tagOf = function (li) {
    return li.dataset.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
  };

  // Build the "all tags" list from the posts, so you never maintain it by hand.
  var counts = {};
  items.forEach(function (li) {
    tagOf(li).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
  });
  var allTags = archive.querySelector(".all-tags");
  var active = new URLSearchParams(location.search).get("tag");

  if (allTags) {
    Object.keys(counts).sort().forEach(function (t) {
      var a = document.createElement("a");
      a.className = "tag" + (t === active ? " active" : "");
      a.href = "?tag=" + encodeURIComponent(t);
      a.textContent = t + " (" + counts[t] + ")";
      allTags.appendChild(a);
    });
  }

  if (!active) return;

  items.forEach(function (li) {
    li.hidden = tagOf(li).indexOf(active) === -1;
  });
  // Hide year groups with no matching posts
  archive.querySelectorAll("section.year").forEach(function (sec) {
    sec.hidden = !sec.querySelector("li[data-tags]:not([hidden])");
  });

  var filter = archive.querySelector(".tag-filter");
  if (filter) {
    filter.hidden = false;
    filter.querySelector(".tag-name").textContent = active;
  }
});
