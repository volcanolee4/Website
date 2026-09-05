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

export const COMPANY = siteData.company;

export const IMAGES = siteData.images;

export const CATEGORIES = categoriesData.map((c) => ({
	...c,
	icon: ICON_MAP[c.icon] ?? Crosshair,
}));

export const PRODUCTS = productsData;

export const FEATURES = siteData.features;

export const COMPANY_INTRO = siteData.companyIntro;

export const WHY_CHOOSE = siteData.whyChoose;

export const MATERIALS = siteData.materials;

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
