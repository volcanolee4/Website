import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Seo, { SITE_URL } from '@/components/Seo';
import { ArrowRight, PackageSearch } from 'lucide-react';
import Reveal from '@/components/Reveal';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import { CATEGORIES, PRODUCTS, categoryName } from '@/data/site';

const modelSortKey = (id) => {
	const [num, ...rest] = id.split('-');
	const n = Number(num);
	return { num: Number.isFinite(n) ? n : Infinity, suffix: rest.join('-') };
};

const sortByModel = (a, b) => {
	const ka = modelSortKey(a.id);
	const kb = modelSortKey(b.id);
	if (ka.num !== kb.num) return ka.num - kb.num;
	return ka.suffix.localeCompare(kb.suffix);
};

export default function CategoryPage({ categorySlug }) {
	const category = CATEGORIES.find((c) => c.slug === categorySlug);

	if (!category) {
		return <Navigate to="/products" replace />;
	}

	const products = PRODUCTS.filter((p) => p.category === category.slug).sort(sortByModel);
	const title = category.seoTitle || `${category.name} Manufacturer | HYGOAL`;
	const description =
		category.seoDescription ||
		`Browse HYGOAL ${category.name.toLowerCase()} products manufactured in Ningbo, China. Stock sizes and OEM / ODM support with 48-hour quotation.`;
	const canonical = `${SITE_URL}/${category.slug}`;
	const heroTitle = category.heroTitle || category.name;
	const heroDescription = category.heroDescription || category.blurb;

	return (
		<>
			<Helmet>
				<title>{title}</title>
				<meta name="description" content={description} />
				<script type="application/ld+json">
					{JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'CollectionPage',
						name: title,
						description,
						url: canonical,
						isPartOf: { '@type': 'WebSite', name: 'HYGOAL', url: `${SITE_URL}/` },
						mainEntity: {
							'@type': 'ItemList',
							itemListElement: products.map((p, i) => ({
								'@type': 'ListItem',
								position: i + 1,
								url: `${SITE_URL}/products/${p.id}`,
								name: p.name,
							})),
						},
					})}
				</script>
			</Helmet>

			<Seo
				title={title}
				description={description}
				image={category.image}
				url={canonical}
				siteName="HYGOAL"
			/>

			<PageHero
				kicker="Product Category"
				title={heroTitle}
				description={heroDescription}
			/>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6">
					<nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
						<ol className="flex flex-wrap items-center gap-2">
							<li>
								<Link to="/" className="transition-colors hover:text-brand">
									Home
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<li>
								<Link to="/products" className="transition-colors hover:text-brand">
									Products
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<li className="font-semibold text-foreground">{category.name}</li>
						</ol>
					</nav>

					<div className="flex flex-wrap justify-center gap-3" role="navigation" aria-label="Other categories">
						<Link
							to="/products"
							className="min-h-[44px] border-2 border-foreground/10 bg-white px-6 font-display text-lg font-semibold uppercase tracking-wide text-foreground transition-all hover:border-brand hover:text-brand"
						>
							All Products
						</Link>
						{CATEGORIES.map((cat) => (
							<Link
								key={cat.slug}
								to={`/${cat.slug}`}
								aria-current={cat.slug === category.slug ? 'page' : undefined}
								className={`min-h-[44px] border-2 px-6 font-display text-lg font-semibold uppercase tracking-wide transition-all ${
									cat.slug === category.slug
										? 'border-brand bg-brand text-brand-foreground'
										: 'border-foreground/10 bg-white text-foreground hover:border-brand hover:text-brand'
								}`}
							>
								{cat.name}
							</Link>
						))}
					</div>

					{products.length > 0 ? (
						<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{products.map((product, i) => (
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

					<Reveal>
						<div className="mt-16 flex flex-col items-start gap-6 border-l-4 border-brand bg-secondary/70 p-8 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground">
									Need a custom variant?
								</h2>
								<p className="mt-2 max-w-xl text-muted-foreground">
									Send a sketch, sample or STEP file and receive a firm quotation within 48 hours.
									Browse our full catalogue or jump to customized CNC service.
								</p>
							</div>
							<div className="flex flex-wrap gap-3">
								<Link
									to="/customized-service"
									className="inline-flex min-h-[48px] shrink-0 items-center gap-2 border-2 border-brand bg-white px-8 text-sm font-semibold uppercase tracking-widest text-brand transition-all hover:bg-brand hover:text-brand-foreground active:scale-[0.98]"
								>
									Custom Service
								</Link>
								<Link
									to="/contact"
									className="inline-flex min-h-[48px] shrink-0 items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
								>
									Send Your Drawing
									<ArrowRight className="h-4 w-4" strokeWidth={2} />
								</Link>
							</div>
						</div>
					</Reveal>
				</div>
			</section>

			<CtaBand />
		</>
	);
}
