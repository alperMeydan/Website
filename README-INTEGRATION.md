# Abstract Minds Bureau redesign integration

The approved package in `abstract-minds-bureau-redesign/` has been integrated into
the existing Vite site. The package remains untouched as the original reference.
Vite builds the English, Turkish and Russian HTML entries to `dist/`, which the
existing `npm run deploy` command publishes to the `gh-pages` branch of
`https://github.com/alperMeydan/Website.git`.

The Vite base remains `/`. `public/CNAME` retains `abstractmindsbureau.com`, and
the existing `/privacypolicyaetheriaendlessforest/` page is copied unchanged into
every build. Production canonical, alternate-language and social-image URLs use
`https://abstractmindsbureau.com`.

## Files

- `index.html`: supplied English design, wired to the existing Vite entry point;
  privacy links use the local site route.
- `tr/index.html`, `ru/index.html`: generated full locale pages, also Vite entries.
- `src/main.ts`: imports the new stylesheet and scripts once, in their required order.
- `src/styles.css`: supplied responsive styles, with narrower headings at 320px
  to accommodate Turkish and Russian text.
- `src/i18n.js`: supplied localized labels for dynamic controls.
- `src/script.js`: supplied filters, disclosures, slideshow, motion controls,
  bounded parallax and scroll progress.
- `src/language.js`: supplied in-place translation handling, with reading anchors
  based on visible text and an explicit rule to stay at the top when already there.
- `vite.config.js`: three HTML build entries; the existing output, base and public
  directory settings remain in use.
- `scripts/build-locales.py`: generator paths point to the integrated repository
  files, and all text reads and writes explicitly use UTF-8 on Windows.
- `content/translations.tsv`: all 211 supplied static translation entries.
- `public/assets/aetheria-store.webp`, `cybershop.webp`, `limbo.webp`, `logo.png`,
  `og-image.png`: original supplied artwork, copied without modification.

## Editing and localization

Edit `index.html` as the English source. Update `content/translations.tsv` for
static Turkish/Russian text and accessible labels. Edit `src/i18n.js` for dynamic
labels such as the motion control, slideshow and filter announcements.

After a static content or markup change, regenerate the locale files using
Python 3, then build:

```powershell
python scripts/build-locales.py
npm run build
```

Python is only an authoring dependency. The website and the existing npm build
use the generated HTML files directly. On this computer, Python is available
through the bundled workspace runtime rather than the shell's `python` command:

```powershell
& 'C:\Users\alper\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/build-locales.py
```

The generator fails if an English string has no translation. Commit regenerated
`tr/index.html` and `ru/index.html` with the English source. Keep the same body
structure across all locales: language switching updates existing nodes so the
visitor's filters, open disclosures and focus survive.

## Local preview

Production preview: `http://127.0.0.1:4173/`, with `/tr/` and `/ru/` variants.
Development server: `http://127.0.0.1:5173/`.

To restart the production preview:

```powershell
npm run build
npm run preview -- --configLoader native --host 127.0.0.1 --port 4173 --strictPort
```

The native config loader avoids the sandbox's restrictions on esbuild's config
directory discovery. The ordinary npm commands still work outside that sandbox.

## Validation completed on 4 October 2026

- `npm run build` passed TypeScript checks and generated all three locale pages.
- 66 browser checks passed in headless Microsoft Edge, including every language
  pair at the top, middle of the project list and near the bottom, at 1440px,
  390px and 320px viewport widths.
- Checks covered in-place DOM preservation, keyboard focus, rapid switching,
  cancellation back to the active language, scrolling during delayed translation
  fetches, active filters, open details, motion settings and back/forward navigation.
- Manual scene selection, pause/resume, automatic scene advance, reduced motion
  and offscreen slideshow pause passed. Hidden-tab handling was exercised with a
  simulated visibility event.
- All locale URLs and image assets returned successfully. There were no browser
  JavaScript errors or failed local asset requests. Development-server locale
  switching and switching at the bottom scroll boundary also passed.
- Internal section links and the four badge colors were verified. The privacy
  page and CNAME in `dist/` match their existing source files; the five imported
  artwork files match the package's SHA-256 checksums.
- Desktop and mobile screenshots were inspected, including the hero, project
  index and Russian mobile layout. No horizontal overflow remained at 320px.
- `git diff --check` passed. Browser harnesses, logs and screenshots are in the
  ignored `.local/` directory and are not required to build or publish the site.

## Publishing through the existing GitHub setup

No commit, source push or production deployment was performed by this import.
From `C:\Users\alper\Desktop\AMB\Website`, review and commit only the integrated
files, leaving the import package and unrelated `.claude/` files out of the commit:

```powershell
git add index.html src/main.ts src/styles.css src/i18n.js src/script.js src/language.js vite.config.js scripts/build-locales.py content/translations.tsv public/assets tr/index.html ru/index.html README-INTEGRATION.md
git diff --cached --stat
git commit -m "Integrate approved AMB redesign"
git push origin main
npm run deploy
```

`npm run deploy` runs `tsc` and Vite, then executes `gh-pages -d dist` using the
existing Git remote. After GitHub Pages updates, check `/`, `/tr/`, `/ru/` and
`/privacypolicyaetheriaendlessforest/` on the custom domain.
