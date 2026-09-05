import productDetailsData from '@/content/productDetails.json';

export const CATEGORY_DRAWINGS = productDetailsData.categoryDrawings;

export const PRODUCT_DETAILS = productDetailsData.details;

export function getProductDetail(id) {
	return PRODUCT_DETAILS[id] ?? null;
}
