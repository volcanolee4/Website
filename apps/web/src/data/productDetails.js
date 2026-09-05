import productDetailsData from '@/content/productDetails.json';

export const CATEGORY_DRAWINGS = productDetailsData.categoryDrawings;

// details 在 JSON 里是数组（含 id 字段），这里转回 id → 详情的映射
const detailsMap = {};
for (const d of productDetailsData.details) {
	detailsMap[d.id] = d;
}

export const PRODUCT_DETAILS = detailsMap;

export function getProductDetail(id) {
	return PRODUCT_DETAILS[id] ?? null;
}
