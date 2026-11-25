(() => {
  const nav = document.querySelector('.article-nav');
  const chapters = Array.from(nav.querySelectorAll('a'), link => ({
    link,
    section: document.getElementById(link.hash.slice(1))
  }));
  let scheduled = false;

  function markChapter() {
    const readingLine = nav.offsetHeight + Math.min(100, window.innerHeight * .16);
    let current;
    for (const chapter of chapters) {
      if (chapter.section.getBoundingClientRect().top > readingLine) break;
      current = chapter;
    }
    for (const chapter of chapters) {
      if (chapter === current) chapter.link.setAttribute('aria-current', 'location');
      else chapter.link.removeAttribute('aria-current');
    }
    scheduled = false;
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(markChapter);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  markChapter();
})();
