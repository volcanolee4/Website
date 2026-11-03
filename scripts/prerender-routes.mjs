/**
 * Post-build route prerender for GitHub Pages.
 * Copies the Vite-built index.html into each SPA path as path/index.html
 * and injects per-route <title>, description, canonical, og tags, and
 * (for products) a Product JSON-LD block into the first paint HTML.
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

const products = JSON.parse(
	readFileSync(join(root, 'apps', 'web', 'src', 'content', 'products.json'), 'utf8'),
).products;

const DEFAULT_DESC =
	'HYGOAL manufactures and exports precision machine components — indexing plungers, leveling feet, cam levers and custom CNC-machined parts — from Ningbo, China to 40+ countries.';

const routes = [
	{
		path: '/',
		title: 'HYGOAL | Indexing Plunger, Leveling Feet & Cam Lever Manufacturer',
		description: DEFAULT_DESC,
	},
	{
		path: '/about',
		title: 'Why Choose HYGOAL | Precision Components Manufacturer in Ningbo, China',
		description:
			'Why choose HYGOAL — precision craftsmanship, cost-effective factory pricing, and customized industrial components from Ningbo, China.',
	},
	{
		path: '/products',
		title: 'Products | Indexing Plungers, Leveling Feet, Cam Levers — HYGOAL',
		description:
			'Browse HYGOAL standard machine components: indexing plungers, leveling feet, cam levers and related industrial accessories.',
	},
	{
		path: '/contact',
		title: 'Contact HYGOAL | Request a Quotation Within 48 Hours',
		description:
			'Contact HYGOAL Precision Components in Ningbo for quotations on indexing plungers, leveling feet, cam levers and custom CNC parts.',
	},
	...products.map((p) => ({
		path: `/products/${p.id}`,
		title: `${p.name} — HYGOAL`,
		description: `${p.name}. ${p.spec || p.category || 'Precision machine component from HYGOAL, Ningbo, China.'}`,
		product: p,
	})),
];

function escapeHtml(s) {
	return String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function injectHead(html, route) {
	const canonical = SITE_URL + (route.path === '/' ? '/' : route.path);
	const title = escapeHtml(route.title);
	const description = escapeHtml(route.description);
	const image = route.product?.image
		? SITE_URL + (route.product.image.startsWith('/') ? route.product.image : `/${route.product.image}`)
		: `${SITE_URL}/images/logoa.svg`;

	let out = html;
	out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
	if (/<meta\s+name="description"[^>]*>/i.test(out)) {
		out = out.replace(
			/<meta\s+name="description"[^>]*>/i,
			`<meta name="description" content="${description}" />`,
		);
	} else {
		out = out.replace(
			/<\/title>/i,
			`</title>\n\t\t<meta name="description" content="${description}" />`,
		);
	}

	const headExtras = `
		<link rel="canonical" href="${canonical}" />
		<meta property="og:url" content="${canonical}" />
		<meta property="og:type" content="${route.product ? 'product' : 'website'}" />
		<meta property="og:site_name" content="HYGOAL" />
		<meta property="og:title" content="${title}" />
		<meta property="og:description" content="${description}" />
		<meta property="og:image" content="${escapeHtml(image)}" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="${title}" />
		<meta name="twitter:description" content="${description}" />
		<meta name="twitter:image" content="${escapeHtml(image)}" />
`;

	// Drop any previous prerender markers to keep rebuilds idempotent.
	// Remove shell/home SEO tags so each route owns a single canonical + social set.
	out = out.replace(/\n?\t\t<!-- hygoal-prerender-start -->[\s\S]*?<!-- hygoal-prerender-end -->\n?/g, '\n');
	out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
	out = out.replace(/\s*<meta\s+property="og:[^"]+"[^>]*>/gi, '');
	out = out.replace(/\s*<meta\s+name="twitter:[^"]+"[^>]*>/gi, '');

	let jsonLd = '';
	if (route.product) {
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
				{ '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
				{ '@type': 'ListItem', position: 3, name: route.product.name, item: canonical },
			],
		};
		jsonLd = `
		<script type="application/ld+json">${JSON.stringify(productLd)}</script>
		<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
	}

	const block = `\t\t<!-- hygoal-prerender-start -->${headExtras}${jsonLd}\n\t\t<!-- hygoal-prerender-end -->\n`;
	out = out.replace(/<\/head>/i, `${block}</head>`);
	return out;
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
	const html = injectHead(baseHtml, route);
	const dest = destFor(route.path);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, html);
	written += 1;
}

console.log(`✅ Prerendered ${written} routes under ${distDir}`);
