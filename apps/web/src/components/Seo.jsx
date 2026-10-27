import React from 'react';
import { Helmet } from 'react-helmet';

// Social + canonical tags only. The page's own <Helmet> must keep a literal
// <title> and <meta name="description"> so the raw HTML stays crawlable.
export const SITE_URL = 'https://www.hygoal.com';

// og:image / twitter:image 必须是绝对 URL，相对路径社交爬虫抓不到
const toAbsolute = (url) => {
	if (!url) return url;
	if (/^https?:\/\//i.test(url)) return url;
	return SITE_URL + (url.startsWith('/') ? url : `/${url}`);
};

const Seo = ({ title, description, image, url, siteName, type = 'website' }) => {
	const canonical = url || SITE_URL + window.location.pathname;

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
