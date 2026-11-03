/**
 * 生成 sitemap.xml（站点地图），帮助搜索引擎和 AI 爬虫发现所有页面。
 * 用法：node scripts/generate-sitemap.mjs
 * 仅列出将由 prerender 产出真实 HTML 的干净路径（https://www.hygoal.com/...）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const BASE_URL = 'https://www.hygoal.com/';

const products = JSON.parse(readFileSync(join(root, 'apps', 'web', 'src', 'content', 'products.json'), 'utf8'));
const categories = JSON.parse(readFileSync(join(root, 'apps', 'web', 'src', 'content', 'categories.json'), 'utf8'));

const urls = [
  '',
  'about',
  'products',
  'contact',
  ...categories.categories.map((c) => c.slug),
  ...products.products.map((p) => `products/${p.id}`),
];

const now = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}${u}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${u === '' ? '1.0' : u.startsWith('products/') ? '0.8' : categories.categories.some((c) => c.slug === u) ? '0.7' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'apps', 'web', 'public', 'sitemap.xml'), xml);
console.log(`✓ 已生成 sitemap.xml，共 ${urls.length} 个 URL（BASE_URL: ${BASE_URL}）`);
