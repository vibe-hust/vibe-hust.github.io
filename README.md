# VibeLab project pages

This repository publishes the VibeLab project index and redirects from the old
project URLs. Each complete website now has its own repository and deployment.

| Project | Website | Website repository | Code repository |
| --- | --- | --- | --- |
| ELP | [Website](https://vibe-hust.github.io/elp_page/) | [elp_page](https://github.com/vibe-hust/elp_page) | [elp_code](https://github.com/vibe-hust/elp_code) |
| AutoCache | [Website](https://vibe-hust.github.io/autocache_page/) | [autocache_page](https://github.com/vibe-hust/autocache_page) | [autocache_code](https://github.com/vibe-hust/autocache_code) |
| ARLIFT | [Website](https://vibe-hust.github.io/arlift_page/) | [arlift_page](https://github.com/vibe-hust/arlift_page) | [arlift_code](https://github.com/vibe-hust/arlift_code) |

Edit each project's website repository to update its content, scripts, or media.
Edit this repository only to maintain the lab index and redirects.

GitHub Pages publishes the root of `main` automatically. No installation or build
step is required. The `.nojekyll` file disables Jekyll.

## Existing links

The old `/elp/`, `/autocache/`, and `/arlift/` pages redirect in the browser to the
new websites. JavaScript preserves query strings, section anchors, and deep-link
paths. The custom `404.html` also handles browser navigation to old asset paths;
these are browser redirects, not HTTP redirects for embedded media requests.

The complete websites and media have been removed from the current published
tree, but previous versions remain in Git history. No history was rewritten.
