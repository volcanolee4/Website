import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import ContactPage from './pages/ContactPage';
import { CATEGORIES } from './data/site';

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

function App() {
	useBootSkeletonRemoval();

	return (
		<Router basename="/">
			<ScrollToTop />
			<div className="flex min-h-screen flex-col bg-background text-foreground">
				<Header />
				<main className="flex-1">
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
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
