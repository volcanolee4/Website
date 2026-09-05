import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { IMAGES } from '@/data/site';

const SLIDES = [
	{
		image: IMAGES.banner1,
		alt: 'HYGOAL industrial components banner',
		kicker: 'Precision Machine Components',
		titleA: 'Engineered to Hold.',
		titleB: 'Built to Last.',
		text: 'Indexing plungers, levelling feet and cam levers manufactured to DIN / GN standards and shipped worldwide.',
	},
	{
		image: IMAGES.banner2,
		alt: 'HYGOAL standard parts banner',
		kicker: 'Standard Parts In Stock',
		titleA: 'Standard Parts,',
		titleB: 'Ready for Export.',
		text: 'Stainless and carbon-steel standard elements with competitive factory-direct pricing and full export documentation.',
	},
	{
		image: IMAGES.banner3,
		alt: 'HYGOAL customized service banner',
		kicker: 'OEM / ODM Customized Service',
		titleA: 'Custom Machining',
		titleB: 'From Your Drawing.',
		text: 'CNC turning, milling and surface treatment under one roof — tailored solutions to your specific requirements.',
	},
];

const item = {
	hidden: { opacity: 0, y: 24 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HeroCarousel() {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		if (paused) return undefined;
		const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
		return () => clearInterval(timer);
	}, [paused]);

	const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
	const slide = SLIDES[index];

	return (
		<section
			className="relative min-h-[92dvh] overflow-hidden bg-navy"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			aria-label="Featured banners"
		>
			<AnimatePresence>
				<motion.div
					key={index}
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.9, ease: 'easeOut' }}
				>
					<motion.img
						src={slide.image}
						alt={slide.alt}
						className="h-full w-full object-cover"
						initial={reduceMotion ? false : { scale: 1.1 }}
						animate={{ scale: 1 }}
						transition={{ duration: 6.5, ease: 'easeOut' }}
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/60 to-navy/15" />
					<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy/80 to-transparent" />
				</motion.div>
			</AnimatePresence>

			<div className="relative z-10 mx-auto flex min-h-[92dvh] max-w-7xl items-center px-6 py-24">
				<motion.div
					key={`content-${index}`}
					initial="hidden"
					animate="show"
					variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
					className="max-w-3xl"
				>
					<motion.p
						variants={item}
						className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80"
					>
						<span className="h-[3px] w-10 bg-brand" />
						{slide.kicker}
					</motion.p>
					<motion.h1
						variants={item}
						className="mt-5 font-display text-6xl font-extrabold uppercase leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
					>
						{slide.titleA}
						<span className="block text-brand">{slide.titleB}</span>
					</motion.h1>
					<motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
						{slide.text}
					</motion.p>
					<motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
						<Link
							to="/products"
							className="inline-flex min-h-[48px] items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
						>
							Explore Products
							<ArrowRight className="h-4 w-4" strokeWidth={2} />
						</Link>
						<Link
							to="/contact"
							className="inline-flex min-h-[48px] items-center border border-white/40 px-8 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-[0.98]"
						>
							Contact Us
						</Link>
					</motion.div>
				</motion.div>
			</div>

			{/* Arrows */}
			<button
				type="button"
				onClick={() => go(-1)}
				aria-label="Previous banner"
				className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand md:flex"
			>
				<ChevronLeft className="h-5 w-5" strokeWidth={2} />
			</button>
			<button
				type="button"
				onClick={() => go(1)}
				aria-label="Next banner"
				className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand md:flex"
			>
				<ChevronRight className="h-5 w-5" strokeWidth={2} />
			</button>

			{/* Dots + counter */}
			<div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
				{SLIDES.map((s, i) => (
					<button
						key={s.kicker}
						type="button"
						onClick={() => setIndex(i)}
						aria-label={`Go to banner ${i + 1}`}
						className={`h-1 rounded-full transition-all duration-300 ${
							i === index ? 'w-10 bg-brand' : 'w-5 bg-white/40 hover:bg-white/70'
						}`}
					/>
				))}
			</div>
			<div className="absolute bottom-6 right-6 z-20 hidden font-display text-lg font-semibold tracking-widest text-white/60 md:block">
				{String(index + 1).padStart(2, '0')} <span className="text-brand">/</span> {String(SLIDES.length).padStart(2, '0')}
			</div>
		</section>
	);
}
