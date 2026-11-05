# File-level change log

## Core files
- `index.html`: externalized unmodified original CSS and main JS; shortened eight case-study overlay paragraphs; kept modal/animation selectors, legal page links and priority hero image; replaced original logo reference with optimized WebP; updated home description; deferred `data-src` images when near viewport.
- `css/home.20261103.css`: exact original homepage inline stylesheet, unchanged.
- `js/home.20261103.js`: original homepage code, unchanged apart from fixing the blog-chatbot response.
- `css/site-footer.20261103.css`: footer-only styling taken from the homepage to keep same footer on all internal pages; no changes to inner `pages.css`.
- `assets/logo-360.webp`: reduced logo image dimensions/bytes; `assets/logo.png` retained. Removed an unused experimental logo file.
- `_headers`: configured cache behavior for new versioned CSS/JS and retained previously existing policies.

## All 21 internal HTML pages
- Replaced compact `pg-ft` footer with the same branded footer structure used on the homepage, with inner-page contact links navigating to the homepage.
- Switched referenced logo asset to `assets/logo-360.webp`.
- Added reference to `css/site-footer.20261103.css` so only the footer styling is affected.

## Selected content updates
- `services/index.html`, `services/website-design/index.html`, `services/shopify-development/index.html`, `services/shopify-theme-customization/index.html`, `services/wordpress-development/index.html`, `services/woocommerce-development/index.html`, `services/website-maintenance/index.html`, `services/seo-services/index.html`: differentiated natural long-tail meta descriptions without altering service content blocks.
- `work/index.html`, `blog/index.html`: updated meta descriptions for project and informational intents.
- `privacy-policy/index.html`: corrected references to self-hosted animation libraries; retains accurate stated presence of Netlify/Ahrefs/Google Fonts/Iconify/FormSubmit.
- Eight `/work/<slug>/` pages: full article content and project-specific related-service links preserved; only common footer + image asset update.
- Two `/blog/<slug>/` pages: full article content preserved; only common footer + logo asset update.

## Not changed deliberately
- URLs/slugs, primary page H1s, page layout outside footers, homepage GSAP/Lenis animation scripts, existing client imagery, static page CSS, existing contact form send order, chat assistant layout, hero portrait, domain routing logic, canonical data and sitemap architecture.
