import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import { PRODUCTS, categoryName } from '@/data/site';
import { getProductDetail, CATEGORY_DRAWINGS } from '@/data/productDetails';

const RECENT_KEY = 'hygoal_recent_products';

function readRecent() {
	try {
		const raw = sessionStorage.getItem(RECENT_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function pushRecent(id) {
	try {
		const prev = readRecent().filter((x) => x !== id);
		sessionStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, 6)));
	} catch {
		/* ignore */
	}
}

function computeColWidths(table) {
	const headers = table?.headers;
	if (!headers?.length) return null;
	const n = headers.length;
	const lens = new Array(n).fill(0);
	headers.forEach((h, i) => {
		if (h == null) return;
		const t = typeof h === 'object' && h !== null ? (h.text ?? '') : String(h ?? '');
		lens[i] = Math.max(lens[i], t.length);
	});
	(table.rows || []).forEach((row) => {
		(row || []).forEach((cell, i) => {
			if (cell == null || i >= n) return;
			const t = typeof cell === 'object' && cell !== null ? (cell.text ?? '') : String(cell ?? '');
			lens[i] = Math.max(lens[i], t.length);
		});
	});
	const total = lens.reduce((a, l) => a + Math.max(l, 1), 0);
	if (!total) return null;
	return lens.map((l) => (Math.max(l, 1) / total) * 100);
}

export default function ProductDetailPage() {
	const { productId } = useParams();
	const product = PRODUCTS.find((p) => p.id === productId);
	const detail = product ? getProductDetail(product.id) : null;

	const gallery = useMemo(() => {
		if (!product) return [];
		const g = detail?.gallery?.length ? [...detail.gallery] : [product.image];
		// Pair the product photo with its technical drawing (as on hygoal.com).
		const drawing = CATEGORY_DRAWINGS[product.category];
		if (drawing && !g.includes(drawing)) g.push(drawing);
		return [...new Set(g)];
	}, [product, detail]);

	const [active, setActive] = useState(0);

	useEffect(() => {
		setActive(0);
		if (product) pushRecent(product.id);
	}, [product?.id]);

	const recent = useMemo(() => {
		if (!product) return [];
		return readRecent()
			.filter((id) => id !== product.id)
			.map((id) => PRODUCTS.find((p) => p.id === id))
			.filter(Boolean)
			.slice(0, 4);
	}, [product?.id]);

	if (!product) {
		return <Navigate to="/products" replace />;
	}

	const summaryLines = (detail?.summary || product.spec).split('\n');
	const table = detail?.table;
	const colWidths = computeColWidths(table);
	const notes = detail?.notes;

	// —— 结构化数据（JSON-LD）：产品 + 面包屑，帮助搜索引擎和 AI 理解页面 ——
	const origin = window.location.origin;
	const productImage = product.image.startsWith('http') ? product.image : origin + product.image;
	const productUrl = `${origin}/Website/products/${product.id}`;
	const productJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		image: productImage,
		description: product.spec,
		sku: product.id,
		category: categoryName(product.category),
		brand: { '@type': 'Brand', name: 'HYGOAL' },
		manufacturer: { '@type': 'Organization', name: 'HYGOAL' },
	});
	const breadcrumbJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/Website/` },
			{ '@type': 'ListItem', position: 2, name: 'Products', item: `${origin}/Website/products` },
			{ '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
		],
	});

	const prevImg = () => setActive((i) => (i - 1 + gallery.length) % gallery.length);
	const nextImg = () => setActive((i) => (i + 1) % gallery.length);

	return (
		<>
			<Helmet>
				<title>{product.name} — HYGOAL</title>
				<meta
					name="description"
					content={`${product.name}. ${product.spec}. Specs, drawings and technical data from HYGOAL.`}
				/>
				<script type="application/ld+json">{productJsonLd}</script>
				<script type="application/ld+json">{breadcrumbJsonLd}</script>
			</Helmet>

			<PageHero
				kicker={categoryName(product.category)}
				title={product.name}
				description="Product photo, technical drawing and specification table."
			/>

			<section className="bg-white py-12 md:py-16">
				<div className="mx-auto max-w-7xl px-6">
					<Link
						to={`/products?cat=${product.category}`}
						className="mb-8 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
					>
						<ArrowLeft className="h-4 w-4" strokeWidth={2} />
						Back to products
					</Link>

					{/* Top: gallery + title + recently viewed */}
					<div className="grid gap-10 lg:grid-cols-[1fr_1fr_200px]">
						{/* Gallery */}
						<div>
							<div className="relative flex aspect-square items-center justify-center border border-border bg-secondary/40 p-6">
								<img
									src={gallery[active]}
									alt={`${product.name} view ${active + 1}`}
									className="max-h-full max-w-full object-contain"
								/>
							</div>
							{gallery.length > 1 && (
								<div className="mt-4 flex items-center gap-2">
									<button
										type="button"
										aria-label="Previous image"
										onClick={prevImg}
										className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:border-brand hover:text-brand"
									>
										<ChevronLeft className="h-5 w-5" strokeWidth={2} />
									</button>
									<div className="flex flex-1 gap-2 overflow-x-auto">
										{gallery.map((src, i) => (
											<button
												key={`${src}-${i}`}
												type="button"
												onClick={() => setActive(i)}
												className={`h-16 w-16 shrink-0 border-2 bg-white p-1 transition-colors ${
													i === active ? 'border-brand' : 'border-border hover:border-foreground/30'
												}`}
												aria-label={`Show image ${i + 1}`}
												aria-current={i === active}
											>
												<img src={src} alt="" className="h-full w-full object-contain" />
											</button>
										))}
									</div>
									<button
										type="button"
										aria-label="Next image"
										onClick={nextImg}
										className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:border-brand hover:text-brand"
									>
										<ChevronRight className="h-5 w-5" strokeWidth={2} />
									</button>
								</div>
							)}
						</div>

						{/* Title + summary */}
						<div className="flex flex-col">
							<h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
								{product.name}
							</h1>
							<div className="mt-6 border-t border-border pt-6 text-base leading-relaxed text-muted-foreground">
								{summaryLines.map((line) => (
									<p key={line} className="mb-1 last:mb-0">
										{line}
									</p>
								))}
							</div>
							<div className="mt-auto pt-10">
								<Link
									to="/contact"
									className="inline-flex min-h-[48px] items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
								>
									Request Quote
									<ArrowRight className="h-4 w-4" strokeWidth={2} />
								</Link>
							</div>
						</div>

						{/* Recently viewed */}
						<aside className="hidden border border-border p-4 lg:block">
							<p className="text-center text-sm font-semibold uppercase tracking-widest text-foreground">
								— Recently Viewed —
							</p>
							<ul className="mt-4 space-y-4">
								{recent.length === 0 && (
									<li className="text-center text-xs text-muted-foreground">Browse more products</li>
								)}
								{recent.map((p) => (
									<li key={p.id}>
										<Link to={`/products/${p.id}`} className="group block text-center">
											<img
												src={p.image}
												alt={p.name}
												className="mx-auto h-20 w-20 object-contain transition-transform group-hover:scale-105"
											/>
											<span className="mt-1 block truncate text-xs text-muted-foreground group-hover:text-brand">
												{p.name}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</aside>
					</div>

					{/* Details: specification table + notes */}
					<div className="mt-14 border border-border">
						<div className="flex border-b border-border bg-secondary/60">
							<span className="border-r border-border bg-white px-6 py-3 text-sm font-semibold text-foreground">
								Details
							</span>
							<span className="flex-1" />
						</div>

						<div className="overflow-x-auto p-4 md:p-6">
							{table && (
								<table className="w-full min-w-[520px] border-collapse text-sm table-fixed">
									{colWidths && (
										<colgroup>
											{table.headers.map((_, i) => (
												<col key={i} style={{ width: `${colWidths[i]}%` }} />
											))}
										</colgroup>
									)}
									<thead>
										<tr className="bg-secondary">
											{table.headers.map((h, i) => {
												if (h == null) return null;
												const isObj = typeof h === 'object' && h !== null && !Array.isArray(h);
												const hText = isObj ? h.text : h;
												const colSpan = isObj && h.colspan > 1 ? h.colspan : undefined;
												const hStyle = isObj
													? {
														textAlign: h.align || undefined,
														fontWeight: h.bold ? 'bold' : undefined,
														fontFamily: h.font || undefined,
														fontSize: h.size != null ? `${h.size}px` : undefined,
													}
													: undefined;
												return (
													<th
														key={i}
														colSpan={colSpan}
														style={hStyle}
														className="border border-border px-3 py-2.5 text-left font-semibold break-words text-foreground"
													>
														{hText}
													</th>
												);
											})}
										</tr>
									</thead>
									<tbody>
										{table.rows.map((row, ri) => (
											<tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-secondary/40'}>
												{row.map((cell, ci) => {
													if (cell == null) return null;
													const isObj = typeof cell === 'object' && cell !== null && !Array.isArray(cell);
													const cellText = isObj ? cell.text : cell;
													const tdStyle = isObj ? { textAlign: cell.align || undefined } : undefined;
													const cellStyle = isObj
														? {
														fontFamily: cell.font || undefined,
														fontSize: cell.size != null ? `${cell.size}px` : undefined,
														fontWeight: cell.bold ? 'bold' : undefined,
													}
														: undefined;
													const colSpan = isObj && cell.colspan > 1 ? cell.colspan : undefined;
													const rowSpan = isObj && cell.rowspan > 1 ? cell.rowspan : undefined;
													return (
														<td
															key={ci}
															colSpan={colSpan}
															rowSpan={rowSpan}
															style={tdStyle}
															className={`border border-border px-3 py-2 break-words ${
																ci === 0 ? 'text-foreground' : 'text-muted-foreground'
															}`}
														>
															{cellStyle ? <span style={cellStyle}>{cellText}</span> : cellText}
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							)}

							{notes && (
								<div className="mt-6 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
									<ul className="space-y-2 bg-white p-4 text-sm leading-relaxed text-muted-foreground">
										{notes.left.map((n) => (
											<li key={n} className="flex gap-2">
												<span className="mt-0.5 font-semibold text-brand">►</span>
												<span>{n}</span>
											</li>
										))}
									</ul>
									<ul className="space-y-2 bg-white p-4 text-sm leading-relaxed text-muted-foreground">
										{notes.right.map((n) => (
											<li key={n} className="flex gap-2">
												<span className="mt-0.5 font-semibold text-brand">►</span>
												<span>{n}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			<CtaBand />
		</>
	);
}
