import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHero({ kicker, title, description }) {
	return (
		<section className="relative overflow-hidden bg-navy">
			<div
				className="absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						'repeating-linear-gradient(-45deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 14px)',
				}}
			/>
			<div className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
				<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
					<span className="h-[3px] w-10 bg-brand" />
					{kicker}
				</p>
				<h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-none tracking-tight text-white md:text-6xl">
					{title}
				</h1>
				{description ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{description}</p> : null}
				<nav className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-white/50" aria-label="Breadcrumb">
					<Link to="/" className="transition-colors hover:text-brand">Home</Link>
					<ChevronRight className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
					<span className="text-white/80">{title}</span>
				</nav>
			</div>
		</section>
	);
}
