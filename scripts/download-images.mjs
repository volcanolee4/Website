/**
 * 图片本地化脚本：把 content JSON 里所有外部图片 URL 下载到
 * apps/web/public/images/，并把 JSON 里的 URL 改写为 /Website/images/<文件名>。
 *
 * 用法：node scripts/download-images.mjs
 * （运行后外部 CDN/图床的依赖即可完全剥离，全部改由 GitHub Pages 自托管）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'apps', 'web', 'src', 'content');
const imagesDir = join(root, 'apps', 'web', 'public', 'images');

const JSON_FILES = ['site.json', 'categories.json', 'products.json', 'productDetails.json'];

// 1. 读取所有 content JSON
const data = {};
for (const f of JSON_FILES) {
	data[f] = JSON.parse(readFileSync(join(contentDir, f), 'utf8'));
}

// 2. 深度收集所有 http(s) URL
function collectUrls(obj, urls) {
	if (typeof obj === 'string') {
		if (/^https?:\/\//.test(obj)) urls.add(obj);
	} else if (Array.isArray(obj)) {
		for (const v of obj) collectUrls(v, urls);
	} else if (obj && typeof obj === 'object') {
		for (const v of Object.values(obj)) collectUrls(v, urls);
	}
}
const allUrls = new Set();
for (const f of JSON_FILES) collectUrls(data[f], allUrls);

// 3. 统计来源域名
const hostCount = {};
for (const u of allUrls) {
	const h = new URL(u).hostname;
	hostCount[h] = (hostCount[h] || 0) + 1;
}
console.log('唯一图片 URL 总数:', allUrls.size);
for (const [h, n] of Object.entries(hostCount)) console.log('  ' + h + ': ' + n + ' 张');

// 4. 生成本地文件名（取 URL 路径 basename，去 query；无扩展名则补 .img；冲突则加短哈希）
function filenameFor(url) {
	const pathname = new URL(url).pathname;
	let name = basename(pathname);
	if (!name || !name.includes('.')) name = name + '.img';
	return name;
}

// 5. 下载每个 URL
mkdirSync(imagesDir, { recursive: true });
const urlToLocal = new Map();
const failed = [];

for (const url of allUrls) {
	const filename = filenameFor(url);
	const target = join(imagesDir, filename);
	// 已存在则直接复用（幂等，重复运行不会重复下载/产生重复文件）
	if (existsSync(target)) {
		urlToLocal.set(url, '/Website/images/' + filename);
		console.log('  ↻ 复用 ' + filename);
		continue;
	}
	try {
		const res = await fetch(url, { redirect: 'follow' });
		if (!res.ok) throw new Error('HTTP ' + res.status);
		const buf = Buffer.from(await res.arrayBuffer());
		if (buf.length === 0) throw new Error('空文件');
		writeFileSync(target, buf);
		urlToLocal.set(url, '/Website/images/' + filename);
		console.log('  ✓ ' + filename + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
	} catch (err) {
		failed.push(url + ' -> ' + err.message);
		console.log('  ✗ 失败: ' + url + ' (' + err.message + ')');
	}
}

// 6. 重写 JSON 里的 URL
function replaceUrls(obj) {
	if (typeof obj === 'string') return urlToLocal.get(obj) ?? obj;
	if (Array.isArray(obj)) return obj.map(replaceUrls);
	if (obj && typeof obj === 'object') {
		const out = {};
		for (const [k, v] of Object.entries(obj)) out[k] = replaceUrls(v);
		return out;
	}
	return obj;
}

for (const f of JSON_FILES) {
	writeFileSync(join(contentDir, f), JSON.stringify(replaceUrls(data[f]), null, 2) + '\n');
}

console.log('\n完成：成功下载 ' + urlToLocal.size + '/' + allUrls.size + ' 张，重写 ' + JSON_FILES.length + ' 个 JSON');
if (failed.length) {
	console.log('\n⚠️ 以下 ' + failed.length + ' 张下载失败（URL 保留原样，未改写）：');
	failed.forEach((f) => console.log('  ' + f));
}
