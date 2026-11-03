/**
 * Post-build route prerender for GitHub Pages.
 * Copies the Vite-built index.html into each SPA path as path/index.html
 * and injects per-route <title>, description, canonical, og tags,
 * JSON-LD, and a crawlable HTML body inside #root (h1 + main copy).
 *
 * Body injection is safe with ReactDOM.createRoot (not hydrateRoot):
 * the client wipe-replaces #root on boot while crawlers still see text.
 * The injected block is wrapped in <div id="seo-prerender" hidden> so it never
 * flashes unstyled text before React mounts; crawlers still parse the text.
 *
 * Usage (after vite build):
 *   node scripts/prerender-routes.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist', 'apps', 'web');
const SITE_URL = 'https://www.hygoal.com';
/** Core-page social image: PNG (not SVG) so crawlers/share cards accept it. */
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/1698647051683fb62bd92b8dd7ed94e44ded91fdc23be.png`;

const products = JSON.parse(
	readFileSync(join(root, 'apps', 'web', 'src', 'content', 'products.json'), 'utf8'),
).products;

const categories = JSON.parse(
	readFileSync(join(root, 'apps', 'web', 'src', 'content', 'categories.json'), 'utf8'),
).categories;

const productDetails = JSON.parse(
	readFileSync(join(root, 'apps', 'web', 'src', 'content', 'productDetails.json'), 'utf8'),
).details;

const siteContent = JSON.parse(
	readFileSync(join(root, 'apps', 'web', 'src', 'content', 'site.json'), 'utf8'),
);

/**
 * Above-the-fold image of the homepage hero. Preloading it starts the download
 * at HTML-parse time instead of after the JS bundle mounts, which is when the
 * browser would otherwise discover the <img> (LCP was ~3.2s on Slow 4G).
 * Only the homepage gets it: PageHero on every other route has no image.
 */
const HOME_HERO_IMAGE = siteContent?.images?.banner1 || '';

const detailsById = new Map(productDetails.map((d) => [d.id, d]));
const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));

// Homepage description: kept <= 160 chars so Google does not truncate it.
// Must stay identical to apps/web/index.html + HomePage.jsx.
const DEFAULT_DESC =
	'HYGOAL manufactures indexing plungers, leveling feet, cam levers and custom CNC parts in Ningbo, China — factory-direct, exported to 40+ countries.';

/** Pads appended only when the description is still under MIN chars. */
const DESC_PADS = [
	'Factory-direct from HYGOAL in Ningbo, China; quotation within 48 hours.',
	'HYGOAL, Ningbo, China.',
];
const DESC_MIN = 120;
const DESC_MAX = 160;

function escapeHtml(s) {
	return String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

const cleanText = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/**
 * Join whole sentences while they fit within DESC_MAX — never cut mid-sentence
 * (no trailing "…"). Sentence may be dropped; pads keep us above DESC_MIN.
 */
function truncateSentence(text) {
	const cut = text
		.slice(0, DESC_MAX)
		.replace(/\s+\S*$/, '')
		.replace(/[.,;:·—-]$/, '')
		.trimEnd();
	return `${cut}.`;
}

function fitDescription(parts) {
	const list = parts.map(cleanText).filter(Boolean);
	let out = '';
	for (const s of list) {
		const candidate = out ? `${out} ${s}` : s;
		if (candidate.length <= DESC_MAX) out = candidate;
	}
	// A single over-long source sentence must be trimmed, not dropped.
	if (!out && list.length) out = truncateSentence(list[0]);
	for (const pad of DESC_PADS) {
		if (out.length >= DESC_MIN) break;
		const candidate = `${out} ${pad}`;
		if (candidate.length <= DESC_MAX) out = candidate;
	}
	if (out.length > DESC_MAX) out = truncateSentence(out);
	return out;
}

/** Summary lines after the first (the first line repeats the product name). */
function summaryExtra(detail, spec) {
	const extra = (detail?.summary || '')
		.split('\n')
		.slice(1)
		.map((line) => cleanText(line))
		.filter(Boolean)
		.join(' ');
	// Some records repeat the spec line verbatim — do not print it twice.
	if (extra && cleanText(spec) && extra.toLowerCase() === cleanText(spec).toLowerCase()) return '';
	return extra;
}

function productMetaDescription(product) {
	const detail = detailsById.get(product.id);
	const extra = summaryExtra(detail, product.spec);
	return fitDescription([
		`${product.name} — ${product.spec || 'Precision machine component'}.`,
		extra ? `${extra}.` : '',
	]);
}

function absoluteImage(pathOrUrl) {
	if (!pathOrUrl) return DEFAULT_OG_IMAGE;
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	return SITE_URL + (pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`);
}

const routes = [
	{
		path: '/',
		title: 'HYGOAL | Indexing Plunger, Leveling Feet & Cam Lever Manufacturer',
		description: DEFAULT_DESC,
		bodyHtml: `
			<main>
				<h1>Precision Machine Components from Ningbo, China</h1>
				<p>${escapeHtml(DEFAULT_DESC)}</p>
				<p>Indexing plungers, leveling feet, cam levers and custom CNC-machined parts, manufactured in-house since 2009 and exported to 40+ countries.</p>
				<ul>
					<li><a href="/indexing-plunger/">Indexing Plungers</a></li>
					<li><a href="/levelling-feet/">Leveling Feet</a></li>
					<li><a href="/cam-lever/">Cam Levers</a></li>
					<li><a href="/customized-service/">Customized CNC Service</a></li>
					<li><a href="/products/">All Products</a></li>
					<li><a href="/about/">About HYGOAL</a></li>
					<li><a href="/contact/">Contact / Request a Quotation</a></li>
				</ul>
			</main>`,
	},
	{
		path: '/about',
		title: 'Why Choose HYGOAL | Precision Components Manufacturer in Ningbo, China',
		description:
			'Why choose HYGOAL — precision craftsmanship, cost-effective factory pricing, and customized industrial components from Ningbo, China.',
		bodyHtml: `
			<main>
				<h1>Why Choose HYGOAL</h1>
				<p>Precision craftsmanship, factory-direct pricing and customized industrial components from Ningbo, China.</p>
				<p>HYGOAL has manufactured indexing plungers, leveling feet and cam levers since 2009, with OEM / ODM machining to drawing or sample and export to 40+ countries.</p>
				<p><a href="/products/">Browse products</a> · <a href="/contact/">Request a quotation</a></p>
			</main>`,
	},
	{
		path: '/products',
		title: 'Products | Indexing Plungers, Leveling Feet, Cam Levers — HYGOAL',
		description:
			'Browse HYGOAL standard machine components: indexing plungers, leveling feet, cam levers and related industrial accessories.',
		bodyHtml: `
			<main>
				<h1>HYGOAL Products</h1>
				<p>Standard machine components manufactured in Ningbo, China: indexing plungers, leveling feet and cam levers, plus custom CNC machining to drawing.</p>
				<ul>
					<li><a href="/indexing-plunger/">Indexing Plunger</a></li>
					<li><a href="/levelling-feet/">Leveling Feet</a></li>
					<li><a href="/cam-lever/">Cam Lever</a></li>
					<li><a href="/customized-service/">Customized Service</a></li>
				</ul>
				<p><a href="/contact/">Request a quotation</a></p>
			</main>`,
	},
	{
		path: '/contact',
		title: 'Contact HYGOAL | Request a Quotation Within 48 Hours',
		description:
			'Contact HYGOAL Precision Components in Ningbo for quotations on indexing plungers, leveling feet, cam levers and custom CNC parts.',
		bodyHtml: `
			<main>
				<h1>Contact HYGOAL</h1>
				<p>Quotations for indexing plungers, leveling feet, cam levers and custom CNC parts — engineers reply within 48 hours, Monday to Saturday.</p>
				<p>Tell us the part number, drawing or quantity you need and we will quote to your destination port.</p>
				<p><a href="/products/">View products</a></p>
			</main>`,
	},
	...categories.map((c) => {
		const catProducts = products.filter((p) => p.category === c.slug);
		const description = fitDescription([
			c.seoDescription ||
				`Browse HYGOAL ${c.name.toLowerCase()} products manufactured in Ningbo, China.`,
		]);
		const h1 = c.heroTitle || c.name;
		const list = catProducts
			.map(
				(p) =>
					`<li><a href="/products/${p.id}/">${escapeHtml(p.name)}</a> — ${escapeHtml(p.spec || '')}</li>`,
			)
			.join('\n');
		return {
			path: `/${c.slug}`,
			title: c.seoTitle || `${c.name} Manufacturer | HYGOAL`,
			description,
			category: c,
			products: catProducts,
			bodyHtml: `
			<main>
				<h1>${escapeHtml(h1)}</h1>
				<p>${escapeHtml(c.heroDescription || c.blurb || description)}</p>
				<ul>
					${list}
				</ul>
				<p><a href="/products/">All products</a> · <a href="/contact/">Request a quotation</a></p>
			</main>`,
		};
	}),
	...products.map((p) => {
		const description = productMetaDescription(p);
		const detail = detailsById.get(p.id);
		const extra = summaryExtra(detail, p.spec);
		const categoryName = categoryNames.get(p.category) || p.category;
		return {
			path: `/products/${p.id}`,
			title: `${p.name} — HYGOAL`,
			description,
			product: p,
			bodyHtml: `
			<main>
				<article>
					<h1>${escapeHtml(p.name)}</h1>
					<p>${escapeHtml(cleanText(p.spec || ''))}${extra ? `. ${escapeHtml(extra)}` : ''}.</p>
					<p>Category: <a href="/${escapeHtml(p.category)}/">${escapeHtml(categoryName)}</a> · SKU: ${escapeHtml(p.id)}</p>
					<p><a href="/products/">All products</a> · <a href="/contact/">Request a quotation</a></p>
				</article>
			</main>`,
		};
	}),
];

function injectHead(html, route) {
	const pathWithSlash = route.path === '/' ? '/' : route.path.endsWith('/') ? route.path : route.path + '/';
	const canonical = SITE_URL + pathWithSlash;
	const title = escapeHtml(route.title);
	const description = escapeHtml(route.description);
	const image = route.product?.image
		? absoluteImage(route.product.image)
		: route.category?.image
			? absoluteImage(route.category.image)
			: DEFAULT_OG_IMAGE;

	let out = html;
	out = out.replace(
		/<title[^>]*>[^<]*<\/title>/i,
		`<title data-react-helmet="true">${title}</title>`,
	);
	if (/<meta\s+name="description"[^>]*>/i.test(out)) {
		out = out.replace(
			/<meta\s+name="description"[^>]*>/i,
			`<meta name="description" data-react-helmet="true" content="${description}" />`,
		);
	} else {
		out = out.replace(
			/<\/title>/i,
			`</title>\n\t\t<meta name="description" data-react-helmet="true" content="${description}" />`,
		);
	}

	if (/<meta\s+name="robots"[^>]*>/i.test(out)) {
		out = out.replace(
			/<meta\s+name="robots"[^>]*>/i,
			`<meta name="robots" data-react-helmet="true" content="index, follow" />`,
		);
	} else {
		out = out.replace(
			/<\/title>/i,
			`</title>\n\t\t<meta name="robots" data-react-helmet="true" content="index, follow" />`,
		);
	}

	const heroPreload =
		route.path === '/' && HOME_HERO_IMAGE
			? `		<link rel="preload" as="image" href="${escapeHtml(HOME_HERO_IMAGE)}" fetchpriority="high" />\n`
			: '';

	const headExtras = `
${heroPreload}		<link rel="canonical" data-react-helmet="true" href="${canonical}" />
		<meta property="og:url" data-react-helmet="true" content="${canonical}" />
		<meta property="og:type" data-react-helmet="true" content="${route.product ? 'product' : 'website'}" />
		<meta property="og:site_name" data-react-helmet="true" content="HYGOAL" />
		<meta property="og:title" data-react-helmet="true" content="${title}" />
		<meta property="og:description" data-react-helmet="true" content="${description}" />
		<meta property="og:image" data-react-helmet="true" content="${escapeHtml(image)}" />
		<meta name="twitter:card" data-react-helmet="true" content="summary_large_image" />
		<meta name="twitter:title" data-react-helmet="true" content="${title}" />
		<meta name="twitter:description" data-react-helmet="true" content="${description}" />
		<meta name="twitter:image" data-react-helmet="true" content="${escapeHtml(image)}" />
`;

	// Drop any previous prerender markers to keep rebuilds idempotent.
	// Remove shell/home SEO tags so each route owns a single canonical + social set.
	out = out.replace(/\n?\t\t<!-- hygoal-prerender-start -->[\s\S]*?<!-- hygoal-prerender-end -->\n?/g, '\n');
	out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
	out = out.replace(/\s*<meta\s+property="og:[^"]+"[^>]*>/gi, '');
	out = out.replace(/\s*<meta\s+name="twitter:[^"]+"[^>]*>/gi, '');

	let jsonLd = '';
	if (route.product) {
		// No offers block: HYGOAL does not publish prices (quote-only B2B), and an
		// Offer without `price` is flagged by Google as a missing required field.
		const productLd = {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: route.product.name,
			description: route.description,
			sku: route.product.id,
			brand: { '@type': 'Brand', name: 'HYGOAL' },
			url: canonical,
			image: image,
		};
		const breadcrumbLd = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
				{ '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products/` },
				{ '@type': 'ListItem', position: 3, name: route.product.name, item: canonical },
			],
		};
		jsonLd = `
		<script type="application/ld+json">${JSON.stringify(productLd)}</script>
		<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
	} else if (route.category) {
		const collectionLd = {
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: route.title,
			description: route.description,
			url: canonical,
			isPartOf: { '@type': 'WebSite', name: 'HYGOAL', url: `${SITE_URL}/` },
			mainEntity: {
				'@type': 'ItemList',
				itemListElement: (route.products || []).map((p, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					url: `${SITE_URL}/products/${p.id}/`,
					name: p.name,
				})),
			},
		};
		const breadcrumbLd = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
				{ '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products/` },
				{ '@type': 'ListItem', position: 3, name: route.category.name, item: canonical },
			],
		};
		jsonLd = `
		<script type="application/ld+json">${JSON.stringify(collectionLd)}</script>
		<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
	}

	const block = `\t\t<!-- hygoal-prerender-start -->${headExtras}${jsonLd}\n\t\t<!-- hygoal-prerender-end -->\n`;
	out = out.replace(/<\/head>/i, `${block}</head>`);
	return out;
}

/**
 * Crawlable body. Wrapped in a hidden wrapper so it never paints before React
 * boots (no flash of unstyled text); crawlers still read the text content.
 */
function injectBody(html, route) {
	const inner = (route.bodyHtml || '').trim();
	if (!inner) return html;
	const wrapped = `<div id="seo-prerender" hidden>\n${inner}\n\t\t</div>`;
	if (/<div id="root">[\s\S]*?<\/div>\s*<script/i.test(html)) {
		return html.replace(/<div id="root">[\s\S]*?<\/div>(\s*<script)/i, `<div id="root">\n${wrapped}\n\t\t</div>$1`);
	}
	return html.replace(/<div id="root"><\/div>/i, `<div id="root">\n\t\t\t${wrapped}\n\t\t</div>`);
}

function destFor(routePath) {
	if (routePath === '/') return join(distDir, 'index.html');
	const clean = routePath.replace(/^\//, '').replace(/\/$/, '');
	return join(distDir, clean, 'index.html');
}

if (!existsSync(join(distDir, 'index.html'))) {
	console.error(`Missing ${join(distDir, 'index.html')}. Run npm run build first.`);
	process.exit(1);
}

const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
let written = 0;
for (const route of routes) {
	let html = injectHead(baseHtml, route);
	html = injectBody(html, route);
	const dest = destFor(route.path);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, html);
	written += 1;
}

console.log(`✓ Prerendered ${written} routes under ${distDir}`);
