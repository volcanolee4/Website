/**
 * 一次性迁移脚本：把硬编码的 site.js / productDetails.js 数据
 * 导出为 apps/web/src/content/ 下的 JSON 文件。
 *
 * 用法：node scripts/extract-content.mjs
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'apps', 'web', 'src', 'content');
const tmpDir = join(root, 'scripts', '.tmp-extract');

// lucide-react 图标 → 字符串标识（供 Decap CMS 用 select 选择）
const ICON_TO_KEY = {
	Crosshair: 'crosshair',
	ArrowDownUp: 'arrow-down-up',
	Wrench: 'wrench',
	DraftingCompass: 'drafting-compass',
};

import { build } from 'esbuild';

async function loadModule(absPath, outName) {
	await build({
		entryPoints: [absPath],
		bundle: true,
		format: 'esm',
		outfile: join(tmpDir, outName),
		platform: 'node',
	});
	return import(pathToFileURL(join(tmpDir, outName)).href);
}

mkdirSync(tmpDir, { recursive: true });

const site = await loadModule(join(root, 'apps', 'web', 'src', 'data', 'site.js'), 'site.mjs');
const pd = await loadModule(join(root, 'apps', 'web', 'src', 'data', 'productDetails.js'), 'pd.mjs');

// 图标组件 → 字符串 key
function iconToKey(icon) {
	for (const [name, key] of Object.entries(ICON_TO_KEY)) {
		if (icon?.displayName === name) return key;
	}
	return null;
}

mkdirSync(contentDir, { recursive: true });

// ---- 1. site.json ----
const siteJson = {
	company: site.COMPANY,
	images: site.IMAGES,
	features: site.FEATURES,
	companyIntro: site.COMPANY_INTRO,
	whyChoose: site.WHY_CHOOSE,
	materials: site.MATERIALS,
};
writeFileSync(join(contentDir, 'site.json'), JSON.stringify(siteJson, null, 2) + '\n');

// ---- 2. categories.json（具名包装，配合 data/site.js 桥接层读 categoriesData.categories）----
const categoriesList = site.CATEGORIES.map((c) => ({
	slug: c.slug,
	name: c.name,
	icon: iconToKey(c.icon) ?? c.slug,
	image: c.image,
	blurb: c.blurb,
}));
writeFileSync(join(contentDir, 'categories.json'), JSON.stringify({ categories: categoriesList }, null, 2) + '\n');

// ---- 3. products.json（具名包装，配合 data/site.js 桥接层读 productsData.products）----
const productsList = site.PRODUCTS;
writeFileSync(join(contentDir, 'products.json'), JSON.stringify({ products: productsList }, null, 2) + '\n');

// ---- 4. productDetails.json（PRODUCT_DETAILS 是对象 → 转成带 id 的数组）----
const detailsList = Object.entries(pd.PRODUCT_DETAILS).map(([id, detail]) => ({ id, ...detail }));
const productDetailsJson = {
	categoryDrawings: pd.CATEGORY_DRAWINGS,
	details: detailsList,
};
writeFileSync(join(contentDir, 'productDetails.json'), JSON.stringify(productDetailsJson, null, 2) + '\n');

// 清理临时目录
rmSync(tmpDir, { recursive: true, force: true });

console.log('✅ 已导出 4 个 JSON 文件到 apps/web/src/content/');
console.log('  - site.json           (公司/图片/特性/简介/优势/材料)');
console.log('  - categories.json     (' + categoriesList.length + ' 个分类)');
console.log('  - products.json       (' + productsList.length + ' 个产品)');
console.log('  - productDetails.json (' + detailsList.length + ' 个产品详情 + ' + Object.keys(pd.CATEGORY_DRAWINGS).length + ' 个图纸)');
console.log('图标映射:', categoriesList.map((c) => `${c.slug}=${c.icon}`).join(', '));
