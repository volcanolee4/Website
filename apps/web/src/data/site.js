import { Crosshair, ArrowDownUp, Wrench, DraftingCompass } from 'lucide-react';
import siteData from '@/content/site.json';
import categoriesData from '@/content/categories.json';
import productsData from '@/content/products.json';

// icon 字符串标识 → lucide-react 组件（JSON 里存字符串，这里映射回组件）
const ICON_MAP = {
	crosshair: Crosshair,
	'arrow-down-up': ArrowDownUp,
	wrench: Wrench,
	'drafting-compass': DraftingCompass,
};

// 防垃圾邮件爬虫：邮箱拆成两段存（@ 前后），运行时拼接，源码与打包产物里都不出现完整邮箱
export const COMPANY = {
	...siteData.company,
	email: `${siteData.company.emailUser}@${siteData.company.emailDomain}`,
};

export const IMAGES = siteData.images;

export const CATEGORIES = categoriesData.categories.map((c) => ({
	...c,
	icon: ICON_MAP[c.icon] ?? Crosshair,
}));

export const PRODUCTS = productsData.products;

export const FEATURES = siteData.features;

export const COMPANY_INTRO = siteData.companyIntro;

export const WHY_CHOOSE = siteData.whyChoose;

export const MATERIALS = siteData.materials;

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
