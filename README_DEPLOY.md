# BS Works — SEO and layout-preserving update (3 November 2026)

## Deployment

**Deploy the contents of this folder as the Netlify publish directory.** In a manual deployment, unzip the archive, then drag the `bsworks-seo-fixed` **folder**, which contains `index.html`, to Netlify Deploys. Keep `css/`, `js/`, `assets/`, `work/`, `blog/`, `services/`, `_headers`, `_redirects`, `robots.txt`, and `sitemap.xml` in their current relative positions. The pages use root-relative links and **will not work correctly by double-clicking index.html from disk**.

Keep the **original** uploaded ZIP for an immediate rollback. This update was made in a local Git working repository with an original-source commit: `892e586` (`Backup original uploaded site before SEO changes`). The deploy ZIP intentionally excludes `.git/` and unneeded development scripts.

## Changes made

- The eight homepage case-study overlays now contain two short, project-specific paragraphs and a link to the relevant complete `/work/<slug>/` case study. Existing overlay IDs, metadata, statistics, galleries, modal controls and animation selectors remain intact.
- Moved **the identical original homepage CSS** out of `index.html` into `css/home.20261103.css`; moved the original homepage animation/application JavaScript into `js/home.20261103.js`. Except for the blog chatbot response, the large JS block was preserved verbatim. This means the HTML file is **53.7% smaller**, but the total cold-visit transfer and LCP have **not** been benchmarked or proven faster.
- Images with existing `data-src`/`data-srcset` are loaded on near-viewport visibility. The hero portrait remains high priority. Preserved image dimensions and the Netlify Image CDN responsive-source setup.
- Converted site logo references to a locally generated 360px WebP (~61 KB) rather than loading the original 316 KB PNG. Original `assets/logo.png` remains in the bundle for restoration.
- All **22 pages use the same homepage-style footer design and link set**. Inner-page footer CTA links direct visitors to the homepage contact section (only the homepage has the modal contact form). The inner page's main design, header, and content CSS were not changed.
- Updated long-tail description text on principal service and hub pages, without adding thin new pages, changing permanent URL slugs, or keyword-stuffing headings.
- Fixed the chatbot's outdated claim that no blog exists; the blog has two existing full articles.
- Kept the existing privacy page, canonical URLs, schema, robots.txt, sitemap.xml and Netlify static form registration code. Home footer links directly to `/privacy-policy/`.
- Added proper immutable caches for the versioned homepage CSS/JS and shared footer stylesheet, preserving the original cache behavior for other resources.
- Added `seo-reports/keyword-evidence.csv` and a static test and launch checklist.

## Verified locally (source/parse tests only)

- All **22 HTML pages** exist and match all 22 canonical sitemap URLs.
- **220/220** page-level checks passed for title, single H1, description, canonical, matching footer, privacy link, visible `<main>`, no `noindex`, sitemap inclusion and parseable JSON-LD.
- All ordinary internal links and local CSS/JS/image references resolve on disk.
- Homepage includes **88 image elements** and the static `data-netlify="true"` contact form with honeypot and AJAX form-name parameter.
- Original homepage CSS is byte-for-byte the same as the original inline style; the main JS differs only in the repaired blog assistant response.
- All JavaScript files passed `node --check`; all CSS stylesheets passed syntax parsing.

## Not independently verified / do not assume production is ready

- **Live domain redirects**: both `http` and `https` for apex and `www` were unreachable from this environment. Configure **www.bsworks.store as primary** under Netlify Domain management, add apex as domain alias, and check redirect chains and TLS at deployment. Netlify automatically 301-redirects the alias to the primary when configured. The included `_redirects` covers legacy URLs only; it deliberately does not add a potentially conflicting domain catch-all rule.
- **Form delivery**: Netlify forms are discoverable in deployed static HTML, but detection, actual email inbox delivery, FormSubmit activation, spam filtering and fallback behavior require an **actual production test**. Web3Forms backup has no configured key. On deployment, check *Site → Forms* and notifications, submit a real message, confirm receipt and inspect submission entries. The FormSubmit backup requires mailbox activation before it can be trusted; if unactivated, use the existing WhatsApp/email emergency links.
- **Core Web Vitals/Lighthouse**: Cannot verify the live LCP element, CLS, INP, mobile/desktop benchmarks or before/after gains. Re-run PageSpeed Insights after deploy, compare with a saved old version, and verify largest image requests.
- **Interactive/browser regressions**: This execution environment blocked local browser navigation (Chromium error: `ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore responsive layouts, hover/reveal animations, mega menu, modal, form AJAX, chatbot and JavaScript console **must be tested manually on a Netlify deploy preview** at 390px, 768px, 1024px and 1440px before going live.
- **Search Console**: Cannot inspect coverage, sitemaps, crawl reports or referring domains without permission. Submit `https://www.bsworks.store/sitemap.xml` and examine Page Indexing after launch.
- **DNS SPF/DKIM/DMARC**: The site shows a `gmail.com` contact email. Do not insert SPF or DKIM records for `bsworks.store` without first confirming which domain/email services are authorized to send mail on your behalf.
- **Google Business Profile**: Verify real business eligibility and compliant address/service-area presentation before creating a profile. A Patiala location in copy does not establish storefront eligibility.
- **Netlify headers**: `_headers` is present; actual cache/HUD response headers can be checked only on the deployed site. No Netlify HUD script was added by this change.
- **Third-party media**: several portfolio image previews are live WordPress mShots/client-hosted images. Their availability and appearance depend on those sites and services. A future approved phase could host suitably licensed, optimized captures locally, but this change intentionally does not replace their visual content.

## Launch checklist

1. Create a **Netlify deploy preview**; keep the existing production deployment available to roll back.
2. Review `/`, `/services/`, every `/services/<service>/`, all eight `/work/<project>/`, `/blog/`, two articles, and `/privacy-policy/` on mobile, tablet and desktop. Check stylesheets have HTTP 200, header/nav/footer, sliders, scrolling animation, footer CTA, case-study overlay, every modal, links and console errors.
3. Set `www.bsworks.store` as Netlify primary. Inspect `curl -IL` for all four host/protocol variants; require one canonical `https://www.bsworks.store/` destination and avoid multi-hop redirect chains.
4. Enable Netlify form detection/notifications, deploy **again** if form detection was previously disabled, and submit a test enquiry. Check both Forms dashboard and actual mail inbox. Test required fields, invalid email, blank honeypot, success/failure display and configured backup activation.
5. Test `/robots.txt`, `/sitemap.xml`, representative page HTTP statuses and canonical meta in the **rendered** DOM.
6. Use PageSpeed Insights/Lighthouse mobile and desktop: record LCP source element, LCP/CLS/INP and waterfall, compare before and after; do not claim improvements without evidence.
7. Validate structured data using Google's Rich Results Test and Schema.org Validator. Ensure keyboard tab/focus, contrast, menu, dialog focus restoration and reduced-motion behavior are acceptable.
8. Inspect Google Search Console's indexing, queries, sitemap, external links and coverage. Confirm SPF/DKIM/DMARC with the actual email host. Review Google Business Profile eligibility before making changes.
9. Once deployed, save the Netlify deploy URL and metrics in `seo-reports/static-test-results.json` or in a project issue tracker; if regressions appear, use Netlify rollback to the original deployment.

## SEO evidence caveat

`seo-reports/keyword-evidence.csv` contains long-tail keyword targets, matching URLs, search intent, qualitative competition and the publicly observable source for that assessment. **It contains no fabricated search-volume or keyword-difficulty figures.** It is a planning shortlist, not a Google Keyword Planner/Ahrefs keyword export; check country-level Google impressions and intent before aggressively rewriting page content.
