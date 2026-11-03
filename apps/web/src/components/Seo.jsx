import React from 'react';
import { Helmet } from 'react-helmet';

// Social + canonical tags only. The page's own <Helmet> must keep a literal
// <title> and <meta name="description"> so the raw HTML stays crawlable.
export const SITE_URL = 'https://www.hygoal.com';

/** Prefer trailing-slash paths (GitHub Pages 200); root stays "/". */
export function toCanonicalPath(pathname) {
	if (!pathname || pathname === '/') return '/';
	const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return clean.endsWith('/') ? clean : `${clean}/`;
}

export function toCanonicalUrl(pathOrUrl) {
	if (!pathOrUrl) return `${SITE_URL}/`;
	if (/^https?:\/\//i.test(pathOrUrl)) {
		try {
			const u = new URL(pathOrUrl);
			return SITE_URL + toCanonicalPath(u.pathname);
		} catch {
			return pathOrUrl;
		}
	}
	return SITE_URL + toCanonicalPath(pathOrUrl);
}

// og:image / twitter:image must be absolute URLs
const toAbsolute = (url) => {
	if (!url) return url;
	if (/^https?:\/\//i.test(url)) return url;
	return SITE_URL + (url.startsWith('/') ? url : `/${url}`);
};

const Seo = ({ title, description, image, url, siteName, type = 'website' }) => {
	const pathname =
		typeof window !== 'undefined' ? window.location.pathname : '/';
	const canonical = url
		? toCanonicalUrl(url)
		: SITE_URL + toCanonicalPath(pathname);

	return (
		<Helmet>
			<link rel="canonical" href={canonical} />
			<meta property="og:url" content={canonical} />
			<meta property="og:type" content={type} />
			{siteName && <meta property="og:site_name" content={siteName} />}
			{title && <meta property="og:title" content={title} />}
			{description && <meta property="og:description" content={description} />}
			{image && <meta property="og:image" content={toAbsolute(image)} />}
			<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
			{title && <meta name="twitter:title" content={title} />}
			{description && <meta name="twitter:description" content={description} />}
			{image && <meta name="twitter:image" content={toAbsolute(image)} />}
		</Helmet>
	);
};

export default Seo;

export { Seo };
