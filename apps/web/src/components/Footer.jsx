import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { COMPANY, CATEGORIES, IMAGES } from '@/data/site';

const QUICK_LINKS = [
	{ to: '/', label: 'Home' },
	{ to: '/products', label: 'Product' },
	{ to: '/about', label: 'Why Choose Us' },
	{ to: '/contact', label: 'Contact' },
];

export default function Footer() {
	return (
		<footer className="bg-navy text-navy-foreground">
			<div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<img src={IMAGES.logo} alt="HYGOAL" className="h-14 w-auto max-w-[200px] object-contain" />
					<p className="mt-5 max-w-xs text-sm leading-relaxed text-navy-foreground/70">
						A leading factory located in Ningbo, China, specializing in indexing plungers, levelling
						feet, cam levers and customized industrial components.
					</p>
				</div>

				<div>
					<h3 className="font-display text-lg font-semibold uppercase tracking-widest text-white">Quick Links</h3>
					<span className="mt-3 block h-[3px] w-10 bg-brand" />
					<ul className="mt-5 space-y-3 text-sm">
						{QUICK_LINKS.map((link) => (
							<li key={link.to}>
								<Link to={link.to} className="text-navy-foreground/70 transition-colors hover:text-brand">
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="font-display text-lg font-semibold uppercase tracking-widest text-white">Products</h3>
					<span className="mt-3 block h-[3px] w-10 bg-brand" />
					<ul className="mt-5 space-y-3 text-sm">
						{CATEGORIES.map((cat) => (
							<li key={cat.slug}>
								<Link
									to={`/products?cat=${cat.slug}`}
									className="text-navy-foreground/70 transition-colors hover:text-brand"
								>
									{cat.name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="font-display text-lg font-semibold uppercase tracking-widest text-white">Contact</h3>
					<span className="mt-3 block h-[3px] w-10 bg-brand" />
					<ul className="mt-5 space-y-4 text-sm text-navy-foreground/70">
						<li className="flex gap-3">
							<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
							{COMPANY.address}
						</li>
						<li className="flex gap-3">
							<Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
							<a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-brand">
								{COMPANY.phone}
							</a>
						</li>
						<li className="flex gap-3">
							<Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
							<a href={`mailto:${COMPANY.email}`} className="transition-colors hover:text-brand">
								{COMPANY.email}
							</a>
						</li>
						<li className="flex gap-3">
							<Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
							{COMPANY.hours}
						</li>
					</ul>
				</div>
			</div>

			<div className="border-t border-white/10">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-6 py-6 text-center text-xs text-navy-foreground/60 md:flex-row md:gap-2">
					<p className="font-semibold uppercase tracking-widest">COPYRIGHT @ HYGOAL ALL RIGHTS RESERVED</p>
					<span className="hidden text-brand md:inline">|</span>
					<nav className="flex flex-wrap items-center justify-center gap-2 uppercase tracking-widest">
						<Link to="/" className="transition-colors hover:text-brand">Home</Link>
						<span className="text-white/20">|</span>
						<Link to="/products" className="transition-colors hover:text-brand">Product</Link>
						<span className="text-white/20">|</span>
						<Link to="/about" className="transition-colors hover:text-brand">Why Choose Us</Link>
					</nav>
				</div>
			</div>
		</footer>
	);
}
