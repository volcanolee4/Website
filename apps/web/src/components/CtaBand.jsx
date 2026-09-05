import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { COMPANY } from '@/data/site';

export default function CtaBand() {
	return (
		<section className="relative overflow-hidden bg-navy">
			<div
				className="absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						'repeating-linear-gradient(-45deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)',
				}}
			/>
			<div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
				<Reveal>
					<div>
						<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
							<span className="h-[3px] w-10 bg-brand" />
							Start Your Sourcing
						</p>
						<h2 className="mt-4 max-w-xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white md:text-5xl">
							Need a custom part or a bulk quotation?
						</h2>
						<p className="mt-4 max-w-lg text-white/70">
							Send us your drawing or part number — our engineers reply with a firm quotation within 48 hours.
						</p>
					</div>
				</Reveal>
				<Reveal delay={0.15}>
					<div className="flex flex-wrap gap-4">
						<Link
							to="/contact"
							className="inline-flex min-h-[48px] items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
						>
							Get a Quote
							<ArrowRight className="h-4 w-4" strokeWidth={2} />
						</Link>
						<a
							href={`mailto:${COMPANY.email}`}
							className="inline-flex min-h-[48px] items-center gap-2 border border-white/40 px-8 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-[0.98]"
						>
							<Mail className="h-4 w-4" strokeWidth={2} />
							{COMPANY.email}
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
