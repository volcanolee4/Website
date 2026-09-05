/**
 * Product detail content (gallery, drawings, spec tables)
 * sourced from www.hygoal.com product subpages.
 */
const CDN = 'https://wds-service-1258344699.file.myqcloud.com/20/17249';

/**
 * Technical drawing image per product category.
 * The original hygoal.com detail pages pair each product photo with a
 * dimension drawing; these replicate that second image slot.
 */
export const CATEGORY_DRAWINGS = {
	'indexing-plunger': 'https://images.hostinger.com/d25afa1a-ac87-48e4-8b93-d431a47ca147.png',
	'cam-lever': 'https://images.hostinger.com/41905541-4eaf-4b70-8b02-d2c046cec5e8.png',
	'levelling-feet': 'https://images.hostinger.com/23f9fea2-b417-4a28-85c0-ea96db1889da.png',
};

const plungerNotes = {
	left: [
		'Knob: Zinc plated steel or Stainless steel 304',
		'Threaded body: zinc plated steel or stainless steel 304',
		'Plunger: zinc plated steel or stainless steel 304',
		'Applications: indexing plungers are used where positioning operations are required',
	],
	right: [
		'XX-A: without rest positions',
		'XX-B: with rest positions',
		'XX-ST: made by zinc plated steel',
		'XX-SS: made by stainless steel 304',
		'XX-P: with locking patch',
	],
};

const camNotes = {
	left: [
		"Handle: plastic or steel",
		'Cam / stud: zinc plated steel or stainless steel',
		'Applications: quick clamping and release without tools',
	],
	right: [
		'Metric and inch thread options',
		'With stud or internal thread',
		'Adjustable nut versions available',
	],
};

const footNotes = {
	left: [
		'Base: steel, stainless steel or zinc die-cast',
		'Stem: zinc plated steel or stainless steel',
		'Optional rubber pad for anti-vibration',
	],
	right: [
		'Tapped socket or solid stud',
		'Metric and inch sizes',
		'Heavy-duty load ratings on request',
	],
};

/** Shared inch-style plunger dimension table (from hygoal 6400-A / 7400 series page) */
const plungerTableInch = {
	headers: ['Item #', 'H', 'D', 'B', 'A', 'C', 'E', 'd'],
	rows: [
		['7401', '10-32', '.38"', '.19"', '.25"', '.40"', '.09"', '.05"'],
		['7402', '1/4-20', '.5"', '.19"', '.31"', '.50"', '.13"', '.12"'],
		['7403', '5/16-18', '.63"', '.25"', '.38"', '.63"', '.19"', '.16"'],
		['7404', '3/8-16', '.75"', '.31"', '.50"', '.75"', '.22"', '.19"'],
		['7405', '1/2-13', '1.0"', '.38"', '.63"', '.88"', '.25"', '.25"'],
		['7406', '5/8-11', '1.25"', '.44"', '.75"', '1.0"', '.32"', '.31"'],
		['7407', '3/4-10', '1.50"', '.50"', '.81"', '1.2"', '.45"', '.38"'],
	],
};

const plungerTableMetric = {
	headers: ['Item #', 'd1', 'l1', 'l2', 'd2', 'd3', 'A/F', 'Spring force initial (N)', 'Spring force final (N)'],
	rows: [
		['M5', 'M5', '12', '5', '4', '12', '7', '5', '12'],
		['M6', 'M6', '14', '6', '5', '14', '8', '6', '14'],
		['M8', 'M8', '16', '8', '6', '18', '10', '8', '20'],
		['M10', 'M10', '18', '9', '8', '21', '12', '10', '25'],
		['M12', 'M12', '20', '10', '10', '25', '14', '12', '32'],
		['M16', 'M16', '24', '12', '12', '30', '17', '18', '45'],
	],
};

const camTableMetric = {
	headers: ['Item #', 'd1', 'l1', 'l2', 'l3', 'h', 'A', 'B'],
	rows: [
		['M5', 'M5', '20', '10', '8', '12', '45', '16'],
		['M6', 'M6', '25', '12', '10', '14', '55', '18'],
		['M8', 'M8', '30', '16', '12', '16', '65', '22'],
		['M10', 'M10', '35', '18', '14', '18', '75', '26'],
		['M12', 'M12', '40', '20', '16', '20', '90', '30'],
	],
};

const footTableMetric = {
	headers: ['Item #', 'd1', 'd2', 'h', 'l', 'Load (kN)'],
	rows: [
		['M8', 'M8', '40', '18', '50', '3.5'],
		['M10', 'M10', '50', '20', '60', '5.0'],
		['M12', 'M12', '60', '22', '80', '7.5'],
		['M16', 'M16', '80', '25', '100', '12'],
		['M20', 'M20', '100', '30', '120', '18'],
		['M24', 'M24', '120', '35', '150', '25'],
	],
};

/** Drawing image for 6400-A from hygoal.com detail page */
const DRAW_6400 = `${CDN}/png/1698647074293a0f20475584b3fc464b7eaccf731a709.png?version=0`;

/**
 * Map product id -> detail payload
 * gallery: product photos + technical drawing when available
 */
export const PRODUCT_DETAILS = {
	'6400-a': {
		summary: 'Knurled Knob Index Plunger 6400-A\nWith or without locking patch',
		gallery: [
			`${CDN}/png/1698647051683fb62bd92b8dd7ed94e44ded91fdc23be.png?version=1698647054`,
			DRAW_6400,
		],
		table: plungerTableInch,
		notes: plungerNotes,
	},
	'7600-b': {
		summary: 'Index Plunger 7600-B Full Stainless Steel\nLocking type · rest position',
		gallery: [`${CDN}/png/169814950361889fab76c4d5cd688647ce11ea6bdbd44.png?version=1698149506`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'7600-a': {
		summary: 'Index Plunger 7600-A Full Stainless Steel\nNon-locking type',
		gallery: [`${CDN}/png/1698127384574b6b0ecce941a74899a202abb360e5b2b.png?version=1698127387`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'7500-st': {
		summary: 'Index Plunger 7500-ST\nSteel · With rest position',
		gallery: [`${CDN}/jpg/169804266099523229ac638a140e48b1cde2f3f48a017.jpg?version=1698042663`],
		table: plungerTableInch,
		notes: plungerNotes,
	},
	'8800': {
		summary: 'Indexing Plunger with Knurled Knob 8800\nMetric sizes',
		gallery: [`${CDN}/png/16951140334537ac52e3f2729d1b3f6d2b7e8f6467226.png?version=1695114037`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'7100-b': {
		summary: 'Retractable Indexing Plunger with Rest Position 7100-B',
		gallery: [`${CDN}/png/16953609416945ce8be38e15c264e3b006ee942d07b66.png?version=1695360945`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'90000': {
		summary: 'T-Handle Indexing Plunger 90000\nWeld-in version',
		gallery: [`${CDN}/png/16954377099872d821b814eec9b0afa7acf5a8607265e.png?version=1695437713`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9100': {
		summary: 'Ball Handle Indexing Plunger 9100\nWeld-in version',
		gallery: [`${CDN}/png/16956230222666bad1b7fd2b3f8028a08ed095e504c9c.png?version=1695623025`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9200': {
		summary: 'Indexing Plunger with T-Handle 9200\nThreaded body',
		gallery: [`${CDN}/png/169568974954593c98df25c230311da17b3e231a19549.png?version=1695689752`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9300': {
		summary: 'Indexing Plunger with Ball Handle 9300\nThreaded body',
		gallery: [`${CDN}/png/16957078884738d40710fd005ae657f43d0b9c5b15327.png?version=1695707891`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9400': {
		summary: 'Indexing Plunger 9400\nStandard · Steel zinc-plated',
		gallery: [`${CDN}/png/16957093414521f96f39006a1a8fdfbce8a99a5224d50.png?version=1695709344`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9500': {
		summary: 'Indexing Plunger 9500\nStandard · Stainless steel',
		gallery: [`${CDN}/png/16957065635625c5437edf1564c6107c068181b50213e.png?version=1695707029`],
		table: plungerTableMetric,
		notes: plungerNotes,
	},
	'9900': {
		summary: "Cam Lever with Stud in Metric 9900\nIt's for quick clamping and release",
		gallery: [`${CDN}/png/170107883515732fdccd81899e30be3b4860cec3169a1.png?version=1701078837`],
		table: camTableMetric,
		notes: camNotes,
	},
	'9800': {
		summary: "Cam Lever in Metric 9800\nIt's for quick clamping and release",
		gallery: [`${CDN}/png/1701078414552adb1a73e2fe7547bb8227f5f997293e2.png?version=1701078416`],
		table: camTableMetric,
		notes: camNotes,
	},
	'9700': {
		summary: 'Cam Lever with Adjustable Nut in Metric 9700',
		gallery: [`${CDN}/png/17010775041319026826b7c70782c23ced3f96f0b360d.png?version=0`],
		table: camTableMetric,
		notes: camNotes,
	},
	'9600': {
		summary: 'Cam Lever with Stud in Inch 9600',
		gallery: [`${CDN}/png/17010758309628e454950dd96f7e8b591dfeea88df1cc.png?version=0`],
		table: {
			headers: ['Item #', 'Thread', 'l1', 'l2', 'h', 'A', 'B'],
			rows: [
				['1/4-20', '1/4-20', '1.00"', '.50"', '.55"', '2.2"', '.70"'],
				['5/16-18', '5/16-18', '1.25"', '.63"', '.63"', '2.6"', '.80"'],
				['3/8-16', '3/8-16', '1.50"', '.75"', '.70"', '3.0"', '.90"'],
				['1/2-13', '1/2-13', '1.75"', '.88"', '.80"', '3.5"', '1.0"'],
			],
		},
		notes: camNotes,
	},
	'cl-9300': {
		summary: 'Cam Lever with Internal Thread in Metric 9300',
		gallery: [`${CDN}/png/170107408842550b996eb7302cd44403a7c82fba43bdb.png?version=0`],
		table: camTableMetric,
		notes: camNotes,
	},
	'1600': {
		summary: 'Levelling Mounts 1600\nStainless steel · Heavy duty',
		gallery: [`${CDN}/png/171151995512937fced618de6622dbc1210e507f6be6d.png?version=1711519957`],
		table: footTableMetric,
		notes: footNotes,
	},
	'1500': {
		summary: 'Levelling Mounts with Rubber Pad 1500\nAnti-vibration',
		gallery: [`${CDN}/png/1711429886641a8140642bfb7e8bda07354d399bc7571.png?version=1711429888`],
		table: footTableMetric,
		notes: footNotes,
	},
	'1400': {
		summary: 'Levelling Mounts with Tapped Socket in Metric 1400',
		gallery: [`${CDN}/png/17010693826001c47b5ba6fa585cc685fda68138ef703.png?version=0`],
		table: footTableMetric,
		notes: footNotes,
	},
	'1300': {
		summary: 'Levelling Mounts with Tapped Socket in Inch 1300',
		gallery: [`${CDN}/png/170106858995472d22954fd7a7eb53a3fd89d393d8b38.png?version=1701068592`],
		table: {
			headers: ['Item #', 'Thread', 'Base Ø', 'h', 'l', 'Load (lbs)'],
			rows: [
				['1/4-20', '1/4-20', '1.57"', '.70"', '2.0"', '800'],
				['5/16-18', '5/16-18', '1.97"', '.80"', '2.4"', '1100'],
				['3/8-16', '3/8-16', '2.36"', '.90"', '3.1"', '1700'],
				['1/2-13', '1/2-13', '3.15"', '1.0"', '4.0"', '2700'],
			],
		},
		notes: footNotes,
	},
	custom: {
		summary: 'Customized Service\nOEM / ODM · Machined to your drawing',
		gallery: [`${CDN}/png/169484513943433f2ee11f1130c5c6e11061cc91d9b9a.png?version=1694845144`],
		table: {
			headers: ['Capability', 'Range'],
			rows: [
				['Materials', 'SS304 / C45 / Al6061 / Brass'],
				['Process', 'CNC turning · milling · grinding'],
				['Tolerance', 'Up to ±0.01 mm'],
				['MOQ', 'Prototype to volume'],
				['Lead time', 'Quote within 48 hours'],
			],
		},
		notes: {
			left: [
				'Send STEP / DWG / sample for quotation',
				'Full export documentation available',
			],
			right: [
				'ISO 9001:2015 manufacturing',
				'RoHS compliant materials on request',
			],
		},
	},
};

export function getProductDetail(id) {
	return PRODUCT_DETAILS[id] ?? null;
}
