import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import Seo from '@/components/Seo';
import HeroCarousel from '@/components/HeroCarousel';
import CtaBand from '@/components/CtaBand';
import { CATEGORIES, IMAGES, MATERIALS, COMPANY_INTRO, FEATURES } from '@/data/site';

const STATS = [
	{ value: 15, suffix: '+', label: 'Years of Manufacturing' },
	{ value: 1200, suffix: '+', label: 'Standard SKUs in Stock' },
	{ value: 40, suffix: '+', label: 'Export Countries' },
	{ value: 98, suffix: '%', label: 'On-Time Delivery Rate' },
];

export default function HomePage() {
	return (
		<>
			<Helmet>
				<title>HYGOAL | Indexing Plunger, Levelling Feet & Cam Lever Manufacturer</title>
				<meta
					name="description"
					content="HYGOAL manufactures and exports precision machine components — indexing plungers, levelling feet, cam levers and custom CNC-machined parts — from Ningbo, China to 40+ countries."
				/>
			</Helmet>
			<Seo
				title="HYGOAL | Precision Machine Components Manufacturer"
				description="Indexing plungers, levelling feet, cam levers and custom CNC-machined parts, exported worldwide from Ningbo, China."
				image={IMAGES.banner2}
				siteName="HYGOAL"
			/>

			{/* 1 — Scrolling banner carousel */}
			<HeroCarousel />

			{/* 2 — Materials / standards marquee */}
			<div className="overflow-hidden border-y border-white/10 bg-navy py-4" aria-hidden="true">
				<div className="flex w-max motion-safe:animate-marquee">
					{[...MATERIALS, ...MATERIALS].map((m, i) => (
						<span
							key={`${m}-${i}`}
							className="flex items-center gap-6 pr-6 font-display text-sm font-semibold uppercase tracking-[0.25em] text-white/60"
						>
							{m}
							<span className="h-1.5 w-1.5 rotate-45 bg-brand" />
						</span>
					))}
				</div>
			</div>

			{/* 3 — Four centered category buttons */}
			<section className="bg-white py-20 md:py-24">
				<div className="mx-auto max-w-7xl px-6">
					<Reveal>
						<div className="text-center">
							<p className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								Product Categories
								<span className="h-[3px] w-10 bg-brand" />
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-5xl">
								What We Manufacture
							</h2>
						</div>
					</Reveal>
					<Reveal delay={0.1}>
						<div className="mt-12 flex flex-nowrap justify-between gap-3">
							{CATEGORIES.map((cat) => (
								<Link
									key={cat.slug}
									to={`/products?cat=${cat.slug}`}
									className="group flex min-h-[56px] flex-1 items-center justify-center gap-2 border-2 border-foreground/10 bg-white px-3 text-center transition-all hover:border-primary hover:bg-primary active:scale-[0.98] md:gap-3 md:px-5"
								>
									<cat.icon className="h-5 w-5 text-brand transition-colors group-hover:text-brand" strokeWidth={2} />
									<span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground transition-colors group-hover:text-primary-foreground md:text-xl">
										{cat.name}
									</span>
								</Link>
							))}
						</div>
					</Reveal>

					{/* 4 — Row of four product images */}
					<div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
						{CATEGORIES.map((cat, i) => (
							<Reveal key={cat.slug} delay={0.08 * i}>
								<Link to={`/products?cat=${cat.slug}`} className="group block">
									<div className="relative overflow-hidden bg-secondary">
										<img
											src={cat.image}
											alt={cat.name}
											loading="lazy"
											className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
										<div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
											<span className="font-display text-lg font-semibold uppercase tracking-wide text-white">
												{cat.name}
											</span>
											<span className="flex h-8 w-8 items-center justify-center bg-brand text-brand-foreground transition-transform duration-300 group-hover:translate-x-1">
												<ArrowRight className="h-4 w-4" strokeWidth={2} />
											</span>
										</div>
									</div>
								</Link>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* 5 — Company introduction + feature icons */}
			<section className="bg-secondary/40 py-20 md:py-28">
				<div className="mx-auto max-w-7xl px-6">
					<Reveal>
						<div className="text-center">
							<p className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								About HYGOAL
								<span className="h-[3px] w-10 bg-brand" />
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-5xl">
								A Leading Factory in Ningbo, China
							</h2>
						</div>
					</Reveal>

					<Reveal delay={0.1}>
						<div className="mx-auto mt-10 max-w-4xl space-y-5 text-center text-lg leading-relaxed text-muted-foreground">
							{COMPANY_INTRO.map((para, i) => (
								<p key={i}>{para}</p>
							))}
						</div>
					</Reveal>

					{/* Feature icons — Reliable / Economic / Quality */}
					<div className="mt-16 grid grid-cols-1 items-stretch gap-8 sm:grid-cols-3">
						{FEATURES.map((feat, i) => (
							<Reveal key={feat.title} delay={0.1 * i} className="h-full">
								<div className="flex h-full flex-col items-center rounded-sm border border-border bg-white p-8 text-center transition-shadow hover:shadow-lg">
									<div className="flex h-24 w-24 shrink-0 items-center justify-center">
										<img src={feat.icon} alt={feat.title} loading="lazy" className="h-20 w-20 object-contain" />
									</div>
									<h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-primary">{feat.title}</h3>
									<p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">{feat.sub}</p>
								</div>
							</Reveal>
						))}
					</div>

					{/* Stats band */}
					<div className="mt-20">
						<Reveal>
							<div className="grid grid-cols-2 divide-border border border-border bg-white md:grid-cols-4 md:divide-x">
								{STATS.map((stat) => (
									<div key={stat.label} className="px-6 py-8 text-center">
										<p className="font-display text-4xl font-extrabold text-primary md:text-5xl">
											<CountUp value={stat.value} suffix={stat.suffix} />
										</p>
										<p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
											{stat.label}
										</p>
									</div>
								))}
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* 6 — CTA */}
			<CtaBand />
		</>
	);
}
