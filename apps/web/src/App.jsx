import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import { CATEGORIES } from './data/site';

/*
 * Route-level splitting: only the homepage ships in the entry chunk. Product
 * pages drag 260kB of productDetails.json behind them, so keeping them out of
 * the entry cuts the first payload roughly in half for anything landing on /.
 */
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

/**
 * Fade out and drop the inline first-paint shell from index.html.
 * Waits for fonts (capped) + two frames so the real page has already painted
 * underneath before the overlay goes away — avoids a FOUT/reflow flash.
 */
function useBootSkeletonRemoval() {
	useEffect(() => {
		const el = document.getElementById('boot-skeleton');
		if (!el) return undefined;

		let done = false;
		let rafA = 0;
		let rafB = 0;
		let capTimer = 0;

		const reveal = () => {
			if (done) return;
			done = true;
			window.clearTimeout(capTimer);
			el.classList.add('is-done');
			window.setTimeout(() => el.remove(), 400);
		};

		const afterTwoFrames = () => {
			rafA = requestAnimationFrame(() => {
				rafB = requestAnimationFrame(reveal);
			});
		};

		capTimer = window.setTimeout(afterTwoFrames, 1200);
		const fonts = document.fonts && document.fonts.ready;
		if (fonts && typeof fonts.then === 'function') {
			fonts.then(afterTwoFrames).catch(afterTwoFrames);
		} else {
			afterTwoFrames();
		}

		return () => {
			window.clearTimeout(capTimer);
			cancelAnimationFrame(rafA);
			cancelAnimationFrame(rafB);
		};
	}, []);
}

/**
 * Rendered *inside* the Suspense boundary on purpose: when a lazy route is
 * still loading the boundary shows its fallback, so this never mounts and the
 * boot skeleton keeps covering the viewport. It only runs once the real page
 * has rendered — no blank frame on deep links.
 */
function BootReveal() {
	useBootSkeletonRemoval();
	return null;
}

function PageFallback() {
	return <div className="min-h-[60vh] bg-navy" aria-hidden="true" />;
}

function App() {
	return (
		<Router basename="/">
			<ScrollToTop />
			<div className="flex min-h-screen flex-col bg-background text-foreground">
				<Header />
				<main className="flex-1">
					<Suspense fallback={<PageFallback />}>
						<BootReveal />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/about" element={<AboutPage />} />
							<Route path="/products" element={<ProductsPage />} />
							<Route path="/products/:productId" element={<ProductDetailPage />} />
							{CATEGORIES.map((cat) => (
								<Route
									key={cat.slug}
									path={`/${cat.slug}`}
									element={<CategoryPage categorySlug={cat.slug} />}
								/>
							))}
							<Route path="/contact" element={<ContactPage />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</Suspense>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
