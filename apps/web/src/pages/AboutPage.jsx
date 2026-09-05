import React from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import { IMAGES, WHY_CHOOSE } from '@/data/site';

export default function AboutPage() {
	return (
		<>
			<Helmet>
				<title>Why Choose HYGOAL | Precision Components Manufacturer in Ningbo, China</title>
				<meta
					name="description"
					content="Why choose HYGOAL — precision craftsmanship, cutting-edge technology, cost-effective solutions, experienced experts, seamless customization and global reach from Ningbo, China."
				/>
			</Helmet>

			<PageHero
				kicker="Advantage"
				title="Why Choose HYGOAL?"
				description="Precision-engineered solutions that redefine industry standards — combining cutting-edge technology, cost-effective manufacturing and unwavering commitment to excellence."
			/>

			{/* Intro split — image left, text right */}
			<section className="bg-white py-20 md:py-28">
				<div className="mx-auto grid max-w-7xl items-stretch gap-10 px-6 md:grid-cols-2 md:gap-14">
					<Reveal>
						<div className="relative h-full">
							<div className="absolute -left-4 -top-4 h-full w-full border-2 border-brand" aria-hidden="true" />
							<img
								src={IMAGES.workshop}
								alt="HYGOAL factory workshop with CNC machining equipment"
								loading="lazy"
								className="relative h-full min-h-[320px] w-full object-cover shadow-xl"
							/>
						</div>
					</Reveal>
					<Reveal delay={0.15}>
						<div className="flex h-full flex-col justify-center">
							<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								Our Advantage
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
								Precision Craftsmanship, Exceptional Performance
							</h2>
							<p className="mt-6 leading-relaxed text-muted-foreground">
								At HYGOAL, we pride ourselves on delivering precision-engineered solutions that
								redefine industry standards. Specializing in the production of indexing plungers,
								levelling feet, and cam levers, our commitment to meticulous craftsmanship ensures
								that each component surpasses expectations in performance and durability.
							</p>
							<p className="mt-4 leading-relaxed text-muted-foreground">
								Choose HYGOAL for a partnership that combines cutting-edge technology, cost-effective
								solutions, and unwavering commitment to excellence. Elevate your expectations — we're
								here to exceed them.
							</p>
						</div>
					</Reveal>
				</div>
			</section>

			{/* Advantages list */}
			<section className="bg-secondary/50 py-20 md:py-24">
				<div className="mx-auto max-w-7xl px-6">
					<Reveal>
						<div className="text-center">
							<p className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								What Sets Us Apart
								<span className="h-[3px] w-10 bg-brand" />
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-5xl">
								The HYGOAL Difference
							</h2>
						</div>
					</Reveal>

					<div className="mt-12 grid gap-6 md:grid-cols-2">
						{WHY_CHOOSE.map((item, i) => (
							<Reveal key={item.title} delay={0.06 * (i % 2)}>
								<div className="h-full border border-border bg-white p-7 transition-shadow hover:shadow-lg">
									<div className="flex items-start gap-4">
										<CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-brand" strokeWidth={2} />
										<div>
											<h3 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">
												{item.title}
											</h3>
											<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
										</div>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			<CtaBand />
		</>
	);
}
