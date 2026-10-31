# Games — Ahmed Hassan

The games portfolio of Ahmed Hassan: **[ahshika.github.io/games](https://ahshika.github.io/games/)**.

Software projects have their own portfolio at **[ahshika.github.io](https://ahshika.github.io/)**; the two never mix.

| File | What it is |
|---|---|
| `index.html` | The whole site: HTML, CSS and vanilla JavaScript, no build step |
| `data/games.json` | The games shown on the page (games only) |
| `assets/` | Cover art (`cover` field); a generated abstract cover is shown until real art exists |
| `tools/validate-games.mjs` + `.github/workflows/validate.yml` | Checks every change: valid data, no software, no duplicate |

`data/games.json` is kept current by my automation (new releases, versions, platforms, download links) through pull requests, only for projects I approved as **games**.
