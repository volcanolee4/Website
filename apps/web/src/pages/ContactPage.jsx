import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import PageHero from '@/components/PageHero';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { COMPANY } from '@/data/site';

const INFO = [
	{ icon: MapPin, label: 'Factory Address', value: COMPANY.address },
	{ icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
	{ icon: Phone, label: 'Phone / WhatsApp', value: `${COMPANY.phone} `, href: `tel:${COMPANY.phone.replace(/\s/g, '')}` },
	{ icon: Clock, label: 'Working Hours', value: COMPANY.hours },
];

const initialForm = { name: '', email: '', company: '', message: '' };

export default function ContactPage() {
	const [form, setForm] = useState(initialForm);
	const [sent, setSent] = useState(false);

	const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		const subject = `Inquiry from ${form.name}${form.company ? ` — ${form.company}` : ''}`;
		const body = [
			`Name: ${form.name}`,
			`Email: ${form.email}`,
			form.company ? `Company: ${form.company}` : null,
			'',
			form.message,
		]
			.filter((line) => line !== null)
			.join('\n');
		window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
		setSent(true);
	};

	return (
		<>
			<Helmet>
				<title>Contact HYGOAL | Request a Quotation Within 48 Hours</title>
				<meta
					name="description"
					content="Contact HYGOAL Precision Components in Ningbo, China for quotations on indexing plungers, levelling feet, cam levers and custom CNC machining. Engineers reply within 48 hours."
				/>
			</Helmet>

			<PageHero
				kicker="Contact Us"
				title="Get a Firm Quotation"
				description="Tell us the part number, drawing or quantity you need — our engineers reply within 48 hours, Monday to Saturday."
			/>

			<section className="bg-white py-16 md:py-24">
				<div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-5">
					{/* Contact info */}
					<Reveal className="lg:col-span-2">
						<div>
							<p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								<span className="h-[3px] w-10 bg-brand" />
								Direct Lines
							</p>
							<h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
								Talk to Our Sales Engineers
							</h2>
							<div className="mt-9 space-y-4">
								{INFO.map((item) => (
									<div key={item.label} className="flex gap-4 border border-border bg-secondary/50 p-5">
										<span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand/10 text-brand">
											<item.icon className="h-5 w-5" strokeWidth={2} />
										</span>
										<div>
											<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
												{item.label}
											</p>
											{item.href ? (
												<a href={item.href} className="mt-1 block font-medium text-foreground transition-colors hover:text-brand">
													{item.value}
												</a>
											) : (
												<p className="mt-1 font-medium text-foreground">{item.value}</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</Reveal>

					{/* Inquiry form */}
					<Reveal delay={0.15} className="lg:col-span-3">
						<form onSubmit={handleSubmit} className="border border-border bg-white p-8 shadow-sm md:p-10">
							<h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground">
								Send an Inquiry
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Fields marked * are required. Your inquiry opens in your email client, addressed to {COMPANY.email}.
							</p>

							<div className="mt-8 grid gap-6 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="name">Your Name *</Label>
									<Input id="name" required value={form.name} onChange={update('name')} placeholder="e.g. Anna Schmidt" className="h-12" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Business Email *</Label>
									<Input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@company.com" className="h-12" />
								</div>
								<div className="grid gap-2 sm:col-span-2">
									<Label htmlFor="company">Company</Label>
									<Input id="company" value={form.company} onChange={update('company')} placeholder="Company name and country" className="h-12" />
								</div>
								<div className="grid gap-2 sm:col-span-2">
									<Label htmlFor="message">Your Requirement *</Label>
									<Textarea
										id="message"
										required
										rows={6}
										value={form.message}
										onChange={update('message')}
										placeholder="Part number or drawing reference, material, quantity, target delivery…"
									/>
								</div>
							</div>

							<button
								type="submit"
								className="mt-8 inline-flex min-h-[48px] items-center gap-2 bg-brand px-8 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition-all hover:bg-brand/90 active:scale-[0.98]"
							>
								<Send className="h-4 w-4" strokeWidth={2} />
								Send Inquiry
							</button>

							{sent ? (
								<p className="mt-5 flex items-start gap-2 border border-brand/30 bg-brand/5 p-4 text-sm text-foreground">
									<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
									Your email client should now open with the inquiry pre-filled. If it didn't, email us
									directly at {COMPANY.email} — we reply within 48 hours.
								</p>
							) : null}
						</form>
					</Reveal>
				</div>
			</section>
		</>
	);
}
