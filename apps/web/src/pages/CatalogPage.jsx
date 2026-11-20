import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Download, ArrowRight, FileText, Ruler, Layers, Box, PenTool } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CtaBand from '@/components/CtaBand';
import { CATEGORIES, PRODUCTS, COMPANY } from '@/data/site';

/**
 * Catalogue landing page.
 *
 * The PDF lives in public/catalogue/ so the download URL is stable and the file
 * is served straight from Pages (no build step copies it). It is the same file
 * that goes out when a prospect replies asking for the catalogue.
 */
const PDF_PATH = '/catalogue/HYGOAL-Catalogue-2026.pdf';
const COVER = '/images/catalogue-cover.jpg';

const TITLE = 'Product Catalogue 2026 | HYGOAL';
const DESCRIPTION =
	'Download the HYGOAL product catalogue (PDF): 34 series of indexing plungers, leveling mounts and cam levers with full size tables in metric and inch.';

const INSIDE = [
	{ icon: Layers, title: '34 series, 40 pages', body: 'Every series gets its own page with a photo and a dimension drawing.' },
	{ icon: Ruler, title: 'Full size tables', body: 'Item number, D, L, L1, H and thread in millimetres and inches — the same tables as the product pages.' },
	{ icon: Box, title: 'Materials and options', body: 'Steel zinc-plated and stainless steel 304, with the variants (rest position, knob style, body material) listed per series.' },
	{ icon: PenTool, title: 'Custom machined parts', body: 'Turning, milling and grinding to your drawing, with the tolerances we hold.' },
];

export default function CatalogPage() {
	return (
		<>
			<Helmet>
				<title>{TITLE}</title>
				<meta name="description" content={DESCRIPTION} />
			</Helmet>

			<Seo title={TITLE} description={DESCRIPTION} image={COVER} siteName="HYGOAL" />

			<PageHero
				kicker="Catalogue"
				title="Product Catalogue 2026"
				description="40 pages, 34 series — indexing plungers, leveling mounts and cam levers with full size tables in metric and inch, plus our custom machining service."
			/>

			<section className="bg-white py-16 md:py-24">
				<div className="mx-auto grid max-w-7xl items-start gap-14 px-6 lg:grid-cols-5">
					<Reveal className="lg:col-span-2">
						<div className="border border-border bg-secondary/50 p-4">
							<img
								src={COVER}
								alt="HYGOAL product catalogue 2026 — cover page"
								className="w-full border border-border bg-white"
								loading="lazy"
							/>
						</div>
					</Reveal>

					<Reveal delay={0.1} className="lg:col-span-3">
						<div>
							<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								What's inside
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
								Everything your buyer needs to quote
							</h2>

							<div className="mt-9 space-y-4">
								{INSIDE.map((item) => (
									<div key={item.title} className="flex gap-4 border border-border bg-secondary/50 p-5">
										<item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
										<div>
											<p className="font-semibold text-foreground">{item.title}</p>
											<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
										</div>
									</div>
								))}
							</div>

							<div className="mt-9 flex flex-wrap items-center gap-4">
								<a
									href={PDF_PATH}
									download
									className="inline-flex min-h-[52px] items-center gap-3 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
								>
									Download the catalogue
									<Download className="h-4 w-4" strokeWidth={2} />
								</a>
								<Link
									to="/products"
									className="inline-flex min-h-[52px] items-center gap-2 border border-border px-6 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:text-brand"
								>
									Browse products
									<ArrowRight className="h-4 w-4" strokeWidth={2} />
								</Link>
							</div>

							<p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
								<FileText className="h-3.5 w-3.5" strokeWidth={2} />
								PDF, 40 pages, 2 MB — no sign-up, no email required.
							</p>
						</div>
					</Reveal>
				</div>
			</section>

			<section className="border-t border-border bg-secondary/40 py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6">
					<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
						<span className="h-[3px] w-10 bg-brand" />
						Families in this edition
					</p>
					<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
						Four families, one factory
					</h2>

					<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{CATEGORIES.map((category) => {
							const series = PRODUCTS.filter((p) => p.category === category.slug).length;
							return (
								<Link
									key={category.slug}
									to={`/${category.slug}`}
									className="group border border-border bg-white p-6 transition-colors hover:border-brand"
								>
									<div className="flex h-32 items-center justify-center">
										<img
											src={category.image}
											alt={category.name}
											className="max-h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
											loading="lazy"
										/>
									</div>
									<h3 className="mt-5 font-display text-lg font-bold uppercase tracking-wide text-foreground">
										{category.name}
									</h3>
									<p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand">{series} series</p>
									<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.blurb}</p>
									<span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground">
										View range
										<ArrowRight className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
									</span>
								</Link>
							);
						})}
					</div>

					<p className="mt-10 text-sm text-muted-foreground">
						Need a printed copy or a drawing for a part that is not in the catalogue? Write to{' '}
						<a href={`mailto:${COMPANY.email}`} className="font-semibold text-foreground underline decoration-brand decoration-2 underline-offset-4">
							{COMPANY.email}
						</a>{' '}
						— we quote within 48 hours.
					</p>
				</div>
			</section>

			<CtaBand />
		</>
	);
}
