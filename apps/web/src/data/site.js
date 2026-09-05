import { Crosshair, ArrowDownUp, Wrench, DraftingCompass } from 'lucide-react';

export const COMPANY = {
	name: 'HYGOAL',
	fullName: 'HYGOAL',
	email: 'info@hygoal.com',
	phone: '+86 574 8806 0075',
	whatsapp: '+86 138 6789 4521',
	address: 'Ningbo, Zhejiang, China',
	hours: 'Mon–Sat · 8:30–18:00 (GMT+8)',
	founded: 2009,
};

// Real assets from www.hygoal.com
const CDN = 'https://wds-service-1258344699.file.myqcloud.com/20/17249';
const ICON = 'https://www.hygoal.com/img/upimages/pkgimg/icon';

export const IMAGES = {
	logo: `${CDN}/png/1694079822873317823ff7efb55ad42871c25da3e64ae.png?version=1694079825`,
	banner1: `${CDN}/jpg/16946574420015c82e5254af2b0f86c7394ff4aa50cae.jpg?version=1694657444`,
	banner2: `${CDN}/jpg/16946678008475ba0a3c30ce531a21055a68088f1a527.jpg?version=0`,
	banner3: `${CDN}/jpg/1694672835489e36b9300feec30a5f8b748b143a17d2c.jpg?version=1694672837`,
	// Category representative images
	plunger: `${CDN}/png/1698647051683fb62bd92b8dd7ed94e44ded91fdc23be.png?version=1698647054`,
	foot: `${CDN}/png/171151995512937fced618de6622dbc1210e507f6be6d.png?version=1711519957`,
	lever: `${CDN}/png/170107883515732fdccd81899e30be3b4860cec3169a1.png?version=1701078837`,
	custom: `https://images.hostinger.com/5256061a-a7cb-47b0-be88-8a79acc98511.png`,
	// Feature icons from hygoal.com
	iconReliable: `${ICON}/icon2.png`,
	iconEconomic: `${ICON}/icon4.png`,
	iconQuality: `${ICON}/icon3.png`,
};

export const CATEGORIES = [
	{
		slug: 'indexing-plunger',
		name: 'Indexing Plunger',
		icon: Crosshair,
		image: IMAGES.plunger,
		blurb: 'Indexing plungers with knob, pull ring or ball handle — steel and full stainless steel.',
	},
	{
		slug: 'levelling-feet',
		name: 'Levelling Feet',
		icon: ArrowDownUp,
		image: IMAGES.foot,
		blurb: 'Levelling mounts with tapped socket or rubber pad, in metric and inch sizes.',
	},
	{
		slug: 'cam-lever',
		name: 'Cam Lever',
		icon: Wrench,
		image: IMAGES.lever,
		blurb: 'Cam levers with stud or internal thread, adjustable nut, in metric and inch.',
	},
	{
		slug: 'customized-service',
		name: 'Customized Service',
		icon: DraftingCompass,
		image: IMAGES.custom,
		blurb: 'OEM / ODM customized components manufactured to your specific requirements.',
	},
];

export const PRODUCTS = [
	// Indexing Plunger
	{ id: '6400-a', name: 'Knurled Knob Index Plunger 6400-A', category: 'indexing-plunger', image: `${CDN}/png/1698647051683fb62bd92b8dd7ed94e44ded91fdc23be.png?version=1698647054`, spec: 'Knurled knob · Steel / Stainless steel' },
	{ id: '7600-b', name: 'Index Plunger 7600-B Full Stainless Steel', category: 'indexing-plunger', image: `${CDN}/png/169814950361889fab76c4d5cd688647ce11ea6bdbd44.png?version=1698149506`, spec: 'Full stainless steel · Locking type' },
	{ id: '7600-a', name: 'Index Plunger 7600-A Full Stainless Steel', category: 'indexing-plunger', image: `${CDN}/png/1698127384574b6b0ecce941a74899a202abb360e5b2b.png?version=1698127387`, spec: 'Full stainless steel · Non-locking' },
	{ id: '7500-st', name: 'Index Plunger 7500-ST', category: 'indexing-plunger', image: `${CDN}/jpg/169804266099523229ac638a140e48b1cde2f3f48a017.jpg?version=1698042663`, spec: 'Steel · With rest position' },
	{ id: '8800', name: 'Indexing Plunger with Knurled Knob 8800', category: 'indexing-plunger', image: `${CDN}/png/16951140334537ac52e3f2729d1b3f6d2b7e8f6467226.png?version=1695114037`, spec: 'Knurled knob · Metric sizes' },
	{ id: '7100-b', name: 'Retractable Indexing Plunger with Rest Position 7100-B', category: 'indexing-plunger', image: `${CDN}/png/16953609416945ce8be38e15c264e3b006ee942d07b66.png?version=1695360945`, spec: 'Retractable · Rest position' },
	{ id: '90000', name: 'T-Handle Indexing Plunger 90000', category: 'indexing-plunger', image: `${CDN}/png/16954377099872d821b814eec9b0afa7acf5a8607265e.png?version=1695437713`, spec: 'T-handle · Weld-in version' },
	{ id: '9100', name: 'Ball Handle Indexing Plunger 9100', category: 'indexing-plunger', image: `${CDN}/png/16956230222666bad1b7fd2b3f8028a08ed095e504c9c.png?version=1695623025`, spec: 'Ball handle · Weld-in version' },
	{ id: '9200', name: 'Indexing Plunger with T-Handle 9200', category: 'indexing-plunger', image: `${CDN}/png/169568974954593c98df25c230311da17b3e231a19549.png?version=1695689752`, spec: 'T-handle · Threaded body' },
	{ id: '9300', name: 'Indexing Plunger with Ball Handle 9300', category: 'indexing-plunger', image: `${CDN}/png/16957078884738d40710fd005ae657f43d0b9c5b15327.png?version=1695707891`, spec: 'Ball handle · Threaded body' },
	{ id: '9400', name: 'Indexing Plunger 9400', category: 'indexing-plunger', image: `${CDN}/png/16957093414521f96f39006a1a8fdfbce8a99a5224d50.png?version=1695709344`, spec: 'Standard · Steel zinc-plated' },
	{ id: '9500', name: 'Indexing Plunger 9500', category: 'indexing-plunger', image: `${CDN}/png/16957065635625c5437edf1564c6107c068181b50213e.png?version=1695707029`, spec: 'Standard · Stainless steel' },

	// Cam Lever
	{ id: '9900', name: 'Cam Lever with Stud in Metric 9900', category: 'cam-lever', image: `${CDN}/png/170107883515732fdccd81899e30be3b4860cec3169a1.png?version=1701078837`, spec: 'With stud · Metric thread' },
	{ id: '9800', name: 'Cam Lever in Metric 9800', category: 'cam-lever', image: `${CDN}/png/1701078414552adb1a73e2fe7547bb8227f5f997293e2.png?version=1701078416`, spec: 'Metric thread · Steel' },
	{ id: '9700', name: 'Cam Lever with Adjustable Nut in Metric 9700', category: 'cam-lever', image: `${CDN}/png/17010775041319026826b7c70782c23ced3f96f0b360d.png?version=0`, spec: 'Adjustable nut · Metric' },
	{ id: '9600', name: 'Cam Lever with Stud in Inch 9600', category: 'cam-lever', image: `${CDN}/png/17010758309628e454950dd96f7e8b591dfeea88df1cc.png?version=0`, spec: 'With stud · Inch thread' },
	{ id: 'cl-9300', name: 'Cam Lever with Internal Thread in Metric 9300', category: 'cam-lever', image: `${CDN}/png/170107408842550b996eb7302cd44403a7c82fba43bdb.png?version=0`, spec: 'Internal thread · Metric' },

	// Levelling Feet
	{ id: '1600', name: 'Levelling Mounts 1600', category: 'levelling-feet', image: `${CDN}/png/171151995512937fced618de6622dbc1210e507f6be6d.png?version=1711519957`, spec: 'Stainless steel · Heavy duty' },
	{ id: '1500', name: 'Levelling Mounts with Rubber Pad 1500', category: 'levelling-feet', image: `${CDN}/png/1711429886641a8140642bfb7e8bda07354d399bc7571.png?version=1711429888`, spec: 'With rubber pad · Anti-vibration' },
	{ id: '1400', name: 'Levelling Mounts with Tapped Socket in Metric 1400', category: 'levelling-feet', image: `${CDN}/png/17010693826001c47b5ba6fa585cc685fda68138ef703.png?version=0`, spec: 'Tapped socket · Metric' },
	{ id: '1300', name: 'Levelling Mounts with Tapped Socket in Inch 1300', category: 'levelling-feet', image: `${CDN}/png/170106858995472d22954fd7a7eb53a3fd89d393d8b38.png?version=1701068592`, spec: 'Tapped socket · Inch' },

	// Customized Service
	{ id: 'custom', name: 'Customized Service', category: 'customized-service', image: `${CDN}/png/169484513943433f2ee11f1130c5c6e11061cc91d9b9a.png?version=1694845144`, spec: 'OEM / ODM · Machined to your drawing' },
];

export const FEATURES = [
	{ icon: IMAGES.iconReliable, title: 'Reliable', sub: 'Trustworthy · Dependable' },
	{ icon: IMAGES.iconEconomic, title: 'Economic', sub: 'Factory to Customer' },
	{ icon: IMAGES.iconQuality, title: 'Quality', sub: 'High-grade · Top-notch' },
];

export const COMPANY_INTRO = [
	'Hygoal is a leading factory located in Ningbo, China, specializing in the production of industrial components such as indexing plungers, leveling feet, cam levers, and more. With a strong focus on quality, our products are known for their reliability and durability.',
	'What sets us apart is our commitment to providing high-quality industrial accessories at competitive prices. We understand the importance of delivering products that not only meet industry standards but also exceed customer expectations.',
	'At Hygoal, we take pride in our ability to offer customized solutions tailored to your specific requirements. Our team of skilled professionals is dedicated to working closely with you to ensure that you receive products that perfectly align with your needs.',
	'With a track record of excellence and a reputation for delivering on our promises, we have built strong relationships with clients worldwide. We are committed to maintaining the highest standards of manufacturing and service, and we look forward to the opportunity to serve you.',
	'Choose Hygoal for reliable, affordable, and customized industrial components. Experience the difference in quality and service that sets us apart in the industry.',
];

export const WHY_CHOOSE = [
	{
		title: 'Precision Craftsmanship, Exceptional Performance',
		text: 'At HYGOAL, we pride ourselves on delivering precision-engineered solutions that redefine industry standards. Specializing in the production of indexing plungers, levelling feet, and cam levers, our commitment to meticulous craftsmanship ensures that each component surpasses expectations in performance and durability.',
	},
	{
		title: 'Cutting-Edge Technology',
		text: 'Situated in the heart of China\'s manufacturing hub in Ningbo, our state-of-the-art facility embraces cutting-edge technology. We leverage advanced manufacturing processes and equipment to guarantee the highest level of precision and consistency in every product. At HYGOAL, we stay at the forefront of technological innovation to meet the evolving needs of our clients.',
	},
	{
		title: 'Cost-Effective Solutions without Compromise',
		text: 'HYGOAL stands out as a cost-effective manufacturing partner without compromising on quality. Our strategic location in Ningbo allows us to benefit from the region\'s industrial ecosystem, optimizing production costs without sacrificing the excellence of our products. Choose HYGOAL for unbeatable value – where quality and affordability coexist seamlessly.',
	},
	{
		title: 'Experienced Team of Experts',
		text: 'Backed by a team of skilled engineers and professionals, HYGOAL brings years of industry expertise to the table. Our dedicated team is committed to understanding your unique requirements and delivering tailored solutions. From concept to completion, our experts ensure that every product meets the highest standards of quality and functionality.',
	},
	{
		title: 'Seamless Customization Experience',
		text: 'Navigating our user-friendly website, you\'ll discover a seamless customization experience. Tailor our indexing plungers, levelling feet, and cam levers to your specific requirements effortlessly. HYGOAL empowers you to create components that perfectly align with your application needs, providing a level of customization that sets us apart.',
	},
	{
		title: 'Global Reach, Local Commitment',
		text: 'While our reach extends globally, our commitment to personalized service remains local. HYGOAL fosters strong relationships with clients worldwide, offering reliable solutions and responsive communication. Experience the global expertise of HYGOAL with the personal touch of a local partner.',
	},
];

export const MATERIALS = [
	'Stainless Steel 304',
	'Carbon Steel C45',
	'Aluminum 6061',
	'Brass CW614N',
	'Zinc Die-Cast',
	'ISO 9001:2015',
	'DIN / GN Standards',
	'OEM · ODM',
	'RoHS Compliant',
];

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
