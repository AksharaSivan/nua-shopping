export interface ProductColor {
  name: string;
  value: string; // Hex color code
  filterClass: string; // CSS filter class or style for image tint
}

export type StockState = 'available' | 'low' | 'soldout';

export interface VariantStock {
  color: string;
  size: string;
  quantity: number;
  state: StockState;
}

export interface EnrichedProduct {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  brand: string;
  colors: ProductColor[];
  sizes: string[];
  stock: VariantStock[];
  views: {
    id: string;
    label: string;
    style: React.CSSProperties;
  }[];
}

const BRANDS_BY_CATEGORY: { [key: string]: string[] } = {
  "men's clothing": ["UrbanWear", "VeloSport", "NordicThread", "ApexFit"],
  "women's clothing": ["AuraGlow", "LuxeBlend", "ZaraBella", "Siren&Co"],
  "jewelery": ["Vespera", "Orum", "Aetheria", "Stellar"],
  "electronics": ["TechForge", "NovaCore", "Quantum", "ApexCompute"]
};

const DEFAULT_BRANDS = ["LuxeBrand", "Esprit", "Nomad"];

const COLORS_BY_CATEGORY: { [key: string]: ProductColor[] } = {
  "men's clothing": [
    { name: "Navy Blue", value: "#1e3a8a", filterClass: "hue-rotate-180 saturate-150" },
    { name: "Forest Green", value: "#064e3b", filterClass: "hue-rotate-90 brightness-75 saturate-150" },
    { name: "Crimson", value: "#991b1b", filterClass: "hue-rotate-0 saturate-200 brightness-75" },
    { name: "Charcoal", value: "#374151", filterClass: "grayscale brightness-75" }
  ],
  "women's clothing": [
    { name: "Dusty Rose", value: "#fda4af", filterClass: "hue-rotate-340 saturate-150 brightness-110" },
    { name: "Emerald", value: "#047857", filterClass: "hue-rotate-110 saturate-150 brightness-90" },
    { name: "Lavender", value: "#c084fc", filterClass: "hue-rotate-260 saturate-150" },
    { name: "Off White", value: "#f3f4f6", filterClass: "brightness-125 saturate-50" }
  ],
  "jewelery": [
    { name: "Gold", value: "#fbbf24", filterClass: "hue-rotate-40 saturate-150 brightness-110" },
    { name: "Silver", value: "#9ca3af", filterClass: "grayscale brightness-110" },
    { name: "Rose Gold", value: "#f472b6", filterClass: "hue-rotate-320 saturate-150 brightness-105" }
  ],
  "electronics": [
    { name: "Matte Black", value: "#1f2937", filterClass: "grayscale brightness-50" },
    { name: "Space Grey", value: "#6b7280", filterClass: "grayscale brightness-90" },
    { name: "Titanium Silver", value: "#d1d5db", filterClass: "grayscale brightness-125" }
  ]
};

const DEFAULT_COLORS: ProductColor[] = [
  { name: "Classic Navy", value: "#1e3a8a", filterClass: "hue-rotate-180" },
  { name: "Sunset Orange", value: "#ea580c", filterClass: "hue-rotate-30 saturate-150" }
];

const SIZES_BY_CATEGORY: { [key: string]: string[] } = {
  "men's clothing": ["S", "M", "L", "XL", "XXL"],
  "women's clothing": ["XS", "S", "M", "L", "XL"],
  "jewelery": ["6", "7", "8", "One Size"],
  "electronics": ["Standard", "Pro", "Enterprise"]
};

const DEFAULT_SIZES = ["S", "M", "L"];

// Deterministic mock stock level generator
export function getStockQuantity(productId: number, colorName: string, sizeName: string): number {
  // Create a pseudo-random hash from names and ID
  const str = `${productId}-${colorName}-${sizeName}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash);

  // Deterministically assign stock states
  // 15% chance: Sold out (0)
  // 25% chance: Low Stock (1 to 4)
  // 60% chance: High Stock (5 to 15)
  const remainder = positiveHash % 100;
  if (remainder < 15) {
    return 0;
  } else if (remainder < 40) {
    return (positiveHash % 4) + 1; // 1 to 4
  } else {
    return (positiveHash % 11) + 5; // 5 to 15
  }
}

export function enrichProduct(product: any): EnrichedProduct {
  const { id, category, price } = product;

  // Determine Brand
  const brands = BRANDS_BY_CATEGORY[category] || DEFAULT_BRANDS;
  const brandIndex = id % brands.length;
  const brand = brands[brandIndex];

  // Determine Colors
  const colors = COLORS_BY_CATEGORY[category] || DEFAULT_COLORS;

  // Determine Sizes
  const sizes = SIZES_BY_CATEGORY[category] || DEFAULT_SIZES;

  // Generate Stock levels for all color-size combinations
  const stock: VariantStock[] = [];
  colors.forEach(color => {
    sizes.forEach(size => {
      const quantity = getStockQuantity(id, color.name, size);
      let state: StockState = 'available';
      if (quantity === 0) {
        state = 'soldout';
      } else if (quantity <= 4) {
        state = 'low';
      }
      stock.push({ color: color.name, size, quantity, state });
    });
  });

  // Determine Original Price (sale item if id is odd)
  let originalPrice: number | undefined;
  if (id % 2 !== 0) {
    originalPrice = Math.round(price * 1.35 * 100) / 100;
  }

  // Gallery view configurations (crops/zooms of primary image)
  const views = [
    { id: 'default', label: 'Front View', style: {} },
    { id: 'zoomed', label: 'Detail View', style: { transform: 'scale(1.5)', transformOrigin: 'center' } },
    { id: 'collar', label: 'Top Focus', style: { transform: 'scale(1.4)', transformOrigin: 'top center' } }
  ];

  return {
    ...product,
    brand,
    colors,
    sizes,
    stock,
    originalPrice,
    views
  };
}
