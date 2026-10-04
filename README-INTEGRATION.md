# Abstract Minds Bureau redesign integration

The approved package in `abstract-minds-bureau-redesign/` has been integrated into
the existing Vite site. The package remains untouched as the original reference.
Vite builds the English, Turkish and Russian HTML entries to `dist/`, which the
existing `npm run deploy` command publishes to the `gh-pages` branch of
`https://github.com/alperMeydan/Website.git`.

The Vite base remains `/`. `public/CNAME` retains `abstractmindsbureau.com`, and
the `/privacypolicyaetheriaendlessforest/` page retains its policy wording, date
and URL while using the redesign's dark styling. Its HTML and stylesheet are
copied into every build. Production canonical, alternate-language and social-image URLs use
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
- `content/translations.tsv`: 212 static translation entries, including the
  sharing image description.
- `public/assets/aetheria-store.webp`, `cybershop.webp`, `limbo.webp`, `logo.png`,
  `og-image.png`: original supplied artwork, copied without modification.
- `content/social-preview.html`: 1200×630 sharing-card authoring layout, rendered
  with the approved CyberShop artwork, original logo and current typography.
- `public/assets/amb-social-redesign-2026-10.png`: exported sharing card. This new
  filename is used by Open Graph and Twitter metadata on all three locale pages
  and the privacy page.
- `public/privacypolicyaetheriaendlessforest/index.html`, `styles.css`: the policy
  in a responsive dark layout, with the approved logo and local production CSS.

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

Social titles, descriptions and image descriptions are also generated from the
translation source. `scripts/build-locales.py` writes each locale's Open Graph URL
and locale code. `src/language.js` refreshes this metadata during in-place language
changes. The sharing-card PNG is a committed browser rendering of
`content/social-preview.html`, at 1200×630 pixels; it requires no runtime image
generation or additional deployment dependency.

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

## Sharing and privacy follow-up verification

The production build and 17 targeted browser checks passed for the updated
sharing card and privacy styling. Checks covered localized Open Graph/Twitter
metadata on direct pages and all six language-switch directions, metadata after
back navigation, preserved filters and disclosures, PNG dimensions and serving,
all original policy wording and the August 20, 2025 date, the privacy stylesheet
and logo, layouts at 1440px/390px/320px, and the return link. The sharing image and
privacy screenshots were visually inspected. No JavaScript or local asset errors
were reported.

## Publishing through the existing GitHub setup

From `C:\Users\alper\Desktop\AMB\Website`, review and commit only the integrated
files, leaving the import package and unrelated `.claude/` files out of the commit:

```powershell
git add index.html src/main.ts src/styles.css src/i18n.js src/script.js src/language.js vite.config.js scripts/build-locales.py content/translations.tsv content/social-preview.html public/assets public/privacypolicyaetheriaendlessforest tr/index.html ru/index.html README-INTEGRATION.md
git diff --cached --stat
git commit -m "Integrate approved AMB redesign"
git push origin main
npm run deploy
```

`npm run deploy` runs `tsc` and Vite, then executes `gh-pages -d dist` using the
existing Git remote. After GitHub Pages updates, check `/`, `/tr/`, `/ru/` and
`/privacypolicyaetheriaendlessforest/` on the custom domain.
