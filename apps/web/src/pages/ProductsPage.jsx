import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Reveal from '@/components/Reveal';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import { CATEGORIES, PRODUCTS, categoryName } from '@/data/site';
import { getProductDetail } from '@/data/productDetails';

const ALL = 'all';

export default function ProductsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const catParam = searchParams.get('cat');
	const active = CATEGORIES.some((c) => c.slug === catParam) ? catParam : ALL;

	const filtered = active === ALL ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

	const select = (slug) => {
		setSearchParams(slug === ALL ? {} : { cat: slug }, { replace: true });
	};

	return (
		<>
			<Helmet>
				<title>Products | Indexing Plungers, Levelling Feet, Cam Levers — HYGOAL</title>
				<meta
					name="description"
					content="Browse HYGOAL standard machine elements: indexing plungers, levelling feet, cam levers and customized CNC machining service. 48-hour quotation, export worldwide."
				/>
			</Helmet>

			<PageHero
				kicker="Product Range"
				title="Standard Parts & Custom Machining"
				description="Four focused product families, deep stock and full OEM / ODM support. Select a category to filter the range."
			/>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6">
					{/* Filter tabs */}
					<div className="flex flex-wrap justify-center gap-3" role="tablist" aria-label="Product categories">
						{[{ slug: ALL, name: 'All Products' }, ...CATEGORIES].map((cat) => (
							<button
								key={cat.slug}
								type="button"
								role="tab"
								aria-selected={active === cat.slug}
								onClick={() => select(cat.slug)}
								className={`min-h-[44px] border-2 px-6 font-display text-lg font-semibold uppercase tracking-wide transition-all active:scale-[0.98] ${
									active === cat.slug
										? 'border-brand bg-brand text-brand-foreground'
										: 'border-foreground/10 bg-white text-foreground hover:border-brand hover:text-brand'
								}`}
							>
								{cat.name}
							</button>
						))}
					</div>

					{/* Customized Service: show detail directly (no two-level drill-down) */}
					{active === 'customized-service' ? (
						<CustomDetail />
					) : filtered.length > 0 ? (
						<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{filtered.map((product, i) => (
								<Reveal key={product.id} delay={0.06 * (i % 4)}>
									<article className="group flex h-full flex-col border border-border bg-white transition-shadow hover:shadow-lg">
										<Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-secondary">
											<img
												src={product.image}
												alt={product.name}
												loading="lazy"
												className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
											/>
											<span className="absolute left-3 top-3 bg-navy px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
												{categoryName(product.category)}
											</span>
										</Link>
										<div className="flex flex-1 flex-col p-5">
											<h2 className="font-display text-xl font-semibold uppercase leading-tight tracking-wide text-foreground">
												<Link to={`/products/${product.id}`} className="transition-colors hover:text-brand">
													{product.name}
												</Link>
											</h2>
											<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.spec}</p>
											<Link
												to={`/products/${product.id}`}
												className="mt-4 inline-flex items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-widest text-brand transition-colors hover:text-primary"
											>
												View Specs
												<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
											</Link>
										</div>
									</article>
								</Reveal>
							))}
						</div>
					) : (
						<div className="mt-12 flex flex-col items-center border border-dashed border-border py-20 text-center">
							<PackageSearch className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
							<p className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide text-foreground">
								No products in this category yet
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								We machine to drawing — send us your part and we will quote it.
							</p>
						</div>
					)}

					{/* Custom note */}
					<Reveal>
						<div className="mt-16 flex flex-col items-start gap-6 border-l-4 border-brand bg-secondary/70 p-8 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground">
									Can't find your exact part?
								</h2>
								<p className="mt-2 max-w-xl text-muted-foreground">
									Over half of our output is machined to customer drawings. Send a sketch, sample or
									STEP file and receive a firm quotation within 48 hours.
								</p>
							</div>
							<Link
								to="/contact"
								className="inline-flex min-h-[48px] shrink-0 items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
							>
								Send Your Drawing
								<ArrowRight className="h-4 w-4" strokeWidth={2} />
							</Link>
						</div>
					</Reveal>
				</div>
			</section>

			<CtaBand />
		</>
	);
}

function CustomDetail() {
	const product = PRODUCTS.find((p) => p.id === 'custom');
	const detail = getProductDetail('custom');
	const gallery = detail?.gallery?.length ? detail.gallery : [product?.image];
	const [active, setActive] = useState(0);
	const prevImg = () => setActive((i) => (i - 1 + gallery.length) % gallery.length);
	const nextImg = () => setActive((i) => (i + 1) % gallery.length);
	const summaryLines = (detail?.summary || product?.spec || '').split('\n');
	const table = detail?.table;
	const notes = detail?.notes;

	return (
		<div className="mt-12">
			<div className="grid gap-10 lg:grid-cols-2">
				{/* Gallery */}
				<div>
					<div className="relative flex aspect-square items-center justify-center border border-border bg-secondary/40 p-6">
						<img
							src={gallery[active]}
							alt="Customized Service"
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
					<h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
						{product?.name || 'Customized Service'}
					</h2>
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
						<table className="w-full min-w-[520px] border-collapse text-sm">
							<thead>
								<tr className="bg-secondary">
									{table.headers.map((h) => (
										<th
											key={h}
											className="border border-border px-3 py-2.5 text-left font-semibold text-foreground"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{table.rows.map((row, ri) => (
									<tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-secondary/40'}>
										{row.map((cell, ci) => (
											<td
												key={ci}
												className={`border border-border px-3 py-2 ${
													ci === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
												}`}
											>
												{cell}
											</td>
										))}
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
	);
}
