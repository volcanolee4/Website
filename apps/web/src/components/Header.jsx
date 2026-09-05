import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Mail, Phone, BadgeCheck, Globe } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { COMPANY, IMAGES } from '@/data/site';

const NAV = [
	{ to: '/', label: 'Home' },
	{ to: '/products', label: 'Products' },
	{ to: '/about', label: 'Why Choose Us' },
	{ to: '/contact', label: 'Contact' },
];

function navLinkClass({ isActive }) {
	return [
		'relative border-b-2 px-1 py-2 text-sm font-semibold uppercase tracking-widest transition-colors',
		isActive ? 'border-brand text-brand' : 'border-transparent text-foreground hover:text-brand',
	].join(' ');
}

export default function Header() {
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Utility top bar */}
			<div className="hidden bg-navy text-navy-foreground md:block">
				<div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs tracking-wide">
					<div className="flex items-center gap-6">
						<a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 transition-colors hover:text-brand">
							<Mail className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
							{COMPANY.email}
						</a>
						<a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 transition-colors hover:text-brand">
							<Phone className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
							{COMPANY.phone}
						</a>
					</div>
					<div className="flex items-center gap-6">
						<span className="flex items-center gap-2">
							<BadgeCheck className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
							ISO 9001:2015 Certified
						</span>
						<span className="flex items-center gap-2">
							<Globe className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
							Exporting to 40+ Countries
						</span>
					</div>
				</div>
			</div>

			{/* Main header */}
			<header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
				<div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
					<Link to="/" aria-label="HYGOAL home" className="flex items-center">
						<img src={IMAGES.logo} alt="HYGOAL — Precision Components" className="h-12 w-auto max-w-[180px] object-contain" />
					</Link>

					<nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
						{NAV.map((item) => (
							<NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
								{item.label}
							</NavLink>
						))}
						<Link
							to="/contact"
							className="ml-2 inline-flex min-h-[44px] items-center bg-brand px-6 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
						>
							Get a Quote
						</Link>
					</nav>

					{/* Mobile menu */}
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<button
								type="button"
								aria-label="Open menu"
								className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground md:hidden"
							>
								<Menu className="h-5 w-5" strokeWidth={2} />
							</button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] bg-white p-0">
							<SheetHeader className="border-b border-border px-6 py-5 text-left">
								<SheetTitle>
									<img src={IMAGES.logo} alt="HYGOAL" className="h-10 w-auto max-w-[160px] object-contain" />
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col px-6 py-4" aria-label="Mobile navigation">
								{NAV.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										end={item.to === '/'}
										onClick={() => setOpen(false)}
										className={({ isActive }) =>
											[
												'border-b border-border py-4 font-display text-xl font-semibold uppercase tracking-wide transition-colors',
												isActive ? 'text-brand' : 'text-foreground hover:text-brand',
											].join(' ')
										}
									>
										{item.label}
									</NavLink>
								))}
								<Link
									to="/contact"
									onClick={() => setOpen(false)}
									className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-brand px-6 text-sm font-semibold uppercase tracking-widest text-brand-foreground"
								>
									Get a Quote
								</Link>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</header>
		</>
	);
}
