(() => {
  const match = window.location.pathname.match(/^\/(elp|autocache|arlift)(?:\/(.*))?$/);
  if (!match) return;
  const target = new URL(`${match[1]}_page/${match[2] || ""}`, "https://vibe-hust.github.io/");
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
