/**
 * High-performance, robust CSV and JSON product parser for JoJo Effects & Co.
 * Handles quoted fields, embedded commas, newlines, escaped quotes,
 * and key-value specification syntax.
 */

export interface ParsedRawProduct {
  rowIndex: number;
  id?: string;
  name: string;
  slug?: string;
  category: string; // name, slug, or ID
  description: string;
  base_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  is_published?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  image_filenames: string[]; // filenames listed in the import file
  variants_raw?: string; // e.g. "22 Inches:+0:4 | 26 Inches:+25:5" or JSON
  specifications_raw?: string; // e.g. "Material: Virgin Hair; Lace: 13x4 HD" or JSON
  sku?: string;
}

export function parseCSV(text: string): Record<string, string>[] {
  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        // Only push row if not completely empty
        if (currentRow.some(f => f.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  // Normalize header keys: lowercase, trim, remove non-alphanumeric except underscore
  const headers = rows[0].map(h => 
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );

  const result: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const item: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      item[header] = row[c] !== undefined ? row[c].trim() : '';
    }
    result.push(item);
  }

  return result;
}

export function parseProductImportFile(content: string, filename: string): { 
  products: ParsedRawProduct[]; 
  parseErrors: string[] 
} {
  const parseErrors: string[] = [];
  const products: ParsedRawProduct[] = [];
  const isJson = filename.toLowerCase().endsWith('.json');

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item, idx) => {
        const prod = normalizeProductObject(item, idx + 1);
        if (prod) products.push(prod);
      });
    } catch (e: any) {
      parseErrors.push(`Invalid JSON format: ${e.message}`);
    }
    return { products, parseErrors };
  }

  // Parse CSV
  try {
    const rawRows = parseCSV(content);
    if (rawRows.length === 0) {
      parseErrors.push('The CSV file contains no product rows or headers.');
      return { products, parseErrors };
    }

    rawRows.forEach((row, idx) => {
      const prod = normalizeProductRow(row, idx + 2); // row 1 is header
      if (prod) products.push(prod);
    });
  } catch (e: any) {
    parseErrors.push(`Failed to parse CSV: ${e.message}`);
  }

  return { products, parseErrors };
}

function normalizeProductRow(row: Record<string, string>, rowNumber: number): ParsedRawProduct {
  // Find fields with flexible matching
  const name = row['product_name'] || row['name'] || row['title'] || '';
  const category = row['category'] || row['category_name'] || row['category_id'] || row['category_slug'] || '';
  const description = row['description'] || row['product_description'] || row['details'] || '';
  
  const rawBasePrice = row['base_price'] || row['price'] || row['unit_price'] || '0';
  const rawSalePrice = row['sale_price'] || row['discount_price'] || '';
  const rawStock = row['stock_quantity'] || row['stock'] || row['quantity'] || '10';

  const basePrice = parseFloat(rawBasePrice.replace(/[^0-9.]/g, '')) || 0;
  const salePrice = rawSalePrice.trim() ? (parseFloat(rawSalePrice.replace(/[^0-9.]/g, '')) || null) : null;
  const stockQuantity = parseInt(rawStock.replace(/[^0-9]/g, ''), 10) || 0;

  // Image filenames: comma or semicolon separated
  const rawImages = row['image_filenames'] || row['images'] || row['image'] || row['photos'] || '';
  const image_filenames = rawImages
    ? rawImages.split(/[;,|]/).map(s => s.trim()).filter(Boolean)
    : [];

  const rawPublished = (row['is_published'] || row['published'] || 'true').toLowerCase();
  const is_published = ['true', 'yes', '1', 'y', 'published'].includes(rawPublished);

  const rawFeatured = (row['is_featured'] || row['featured'] || 'false').toLowerCase();
  const is_featured = ['true', 'yes', '1', 'y'].includes(rawFeatured);

  const rawNew = (row['is_new_arrival'] || row['new_arrival'] || row['new'] || 'false').toLowerCase();
  const is_new_arrival = ['true', 'yes', '1', 'y'].includes(rawNew);

  return {
    rowIndex: rowNumber,
    id: row['id'] || undefined,
    name: name.trim(),
    slug: row['slug'] || undefined,
    category: category.trim(),
    description: description.trim(),
    base_price: basePrice,
    sale_price: salePrice,
    stock_quantity: stockQuantity,
    is_published,
    is_featured,
    is_new_arrival,
    image_filenames,
    variants_raw: row['variants'] || row['options'] || '',
    specifications_raw: row['specifications'] || row['specs'] || '',
    sku: row['sku'] || '',
  };
}

function normalizeProductObject(item: any, rowNumber: number): ParsedRawProduct {
  const name = item.name || item.product_name || item.title || '';
  const category = item.category || item.category_name || item.category_id || item.category_slug || '';
  const description = item.description || item.details || '';

  const basePrice = Number(item.base_price || item.price || 0);
  const salePrice = item.sale_price !== undefined && item.sale_price !== null && item.sale_price !== ''
    ? Number(item.sale_price)
    : null;
  const stockQuantity = Number(item.stock_quantity ?? item.stock ?? 10);

  let image_filenames: string[] = [];
  if (Array.isArray(item.image_filenames)) {
    image_filenames = item.image_filenames.map((s: any) => String(s).trim());
  } else if (Array.isArray(item.images)) {
    image_filenames = item.images.map((img: any) => typeof img === 'string' ? img : (img.filename || img.name || img.url || ''));
  } else if (typeof item.image_filenames === 'string') {
    image_filenames = item.image_filenames.split(/[;,|]/).map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof item.images === 'string') {
    image_filenames = item.images.split(/[;,|]/).map((s: string) => s.trim()).filter(Boolean);
  }

  let variants_raw = '';
  if (typeof item.variants === 'string') {
    variants_raw = item.variants;
  } else if (Array.isArray(item.variants)) {
    variants_raw = JSON.stringify(item.variants);
  }

  let specifications_raw = '';
  if (typeof item.specifications === 'string') {
    specifications_raw = item.specifications;
  } else if (item.specifications && typeof item.specifications === 'object') {
    specifications_raw = JSON.stringify(item.specifications);
  }

  return {
    rowIndex: rowNumber,
    id: item.id || undefined,
    name: String(name).trim(),
    slug: item.slug || undefined,
    category: String(category).trim(),
    description: String(description).trim(),
    base_price: basePrice,
    sale_price: salePrice,
    stock_quantity: stockQuantity,
    is_published: item.is_published !== false,
    is_featured: Boolean(item.is_featured),
    is_new_arrival: Boolean(item.is_new_arrival),
    image_filenames,
    variants_raw,
    specifications_raw,
    sku: item.sku || '',
  };
}

export function parseSpecifications(raw?: string): Record<string, string> {
  if (!raw || !raw.trim()) return {};

  // Try JSON
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const res: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        res[k] = String(v);
      }
      return res;
    }
  } catch (_) {}

  // Parse Key: Value; Key2: Value2
  const result: Record<string, string> = {};
  const pairs = raw.split(/[;\n]/);
  for (const pair of pairs) {
    const idx = pair.indexOf(':');
    if (idx > 0) {
      const k = pair.substring(0, idx).trim();
      const v = pair.substring(idx + 1).trim();
      if (k && v) {
        result[k] = v;
      }
    }
  }
  return result;
}

export function parseVariants(raw?: string): { id: string; name: string; price_adjustment: number; stock_quantity: number }[] {
  if (!raw || !raw.trim()) return [];

  // Try JSON
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        id: item.id || `var-b-${Date.now()}-${idx}`,
        name: String(item.name || 'Option'),
        price_adjustment: Number(item.price_adjustment || 0),
        stock_quantity: Number(item.stock_quantity ?? 5),
      }));
    }
  } catch (_) {}

  // Parse Format: Option Name:priceAdj:stock | Option 2:priceAdj:stock
  const result: { id: string; name: string; price_adjustment: number; stock_quantity: number }[] = [];
  const items = raw.split(/[|\n]/);
  for (let idx = 0; idx < items.length; idx++) {
    const parts = items[idx].split(':');
    if (parts.length >= 1 && parts[0].trim()) {
      const name = parts[0].trim();
      const priceAdj = parts.length > 1 ? parseFloat(parts[1].replace(/[^0-9.-]/g, '')) || 0 : 0;
      const stock = parts.length > 2 ? parseInt(parts[2].replace(/[^0-9]/g, ''), 10) || 5 : 5;
      result.push({
        id: `var-b-${Date.now()}-${idx}`,
        name,
        price_adjustment: priceAdj,
        stock_quantity: stock,
      });
    }
  }
  return result;
}

/**
 * Generates sample CSV template ready for immediate administrative download
 */
export function generateSampleCSV(): string {
  const headers = [
    'name',
    'category',
    'base_price',
    'sale_price',
    'stock_quantity',
    'is_published',
    'description',
    'image_filenames',
    'specifications',
    'variants',
    'sku'
  ];

  const rows = [
    [
      '"Raw Virgin Straight Lace Front Wig (180% Density)"',
      '"Women\'s Hair"',
      '185.00',
      '159.00',
      '12',
      'true',
      '"Hand-tied transparent HD Swiss lace front wig crafted from 100% cuticle-intact raw human hair. Can be bleached and heat styled."',
      '"wig_front.jpg; wig_side.jpg"',
      '"Lace Type: 13x4 HD Swiss Lace; Hair Texture: Bone Straight; Density: 180%"',
      '"22 Inches:0:4 | 26 Inches:25:5 | 30 Inches:45:3"',
      '"WIG-RAW-STR-01"'
    ],
    [
      '"Luxe Structured Top-Handle Flap Handbag with Gold Clasp"',
      '"Women\'s Fashion Handbags"',
      '89.00',
      '74.99',
      '14',
      'true',
      '"An iconic silhouette tailored in two-tone structured vegan leather in tan and midnight black. Features signature gold turn-lock."',
      '"handbag_tan.jpg; handbag_black.jpg"',
      '"Material: Vegan Leather; Hardware: 18K Gold Plated; Dimensions: 10.5x4.2x8.0 in"',
      '"Caramel Tan & Black:0:8 | Classic All-Black:0:6"',
      '"BAG-LUXE-FLAP-01"'
    ],
    [
      '"Aurora Fluted Bezel Two-Tone Quartz Timepiece"',
      '"Watches"',
      '110.00',
      '89.99',
      '15',
      'true',
      '"Classic luxury watch styling featuring precision fluted gold-plated bezel, silver sunray dial, and jubilee link bracelet."',
      '"watch_silver_gold.png"',
      '"Movement: Japanese Quartz; Case Diameter: 36mm; Water Resistance: 3 ATM"',
      '"Two-Tone Gold & Silver:0:10 | Pure Gold Plated:10:5"',
      '"WCH-AURORA-36"'
    ],
    [
      '"Slim Matte Magnetic Case with Gold Trim + Fast Wireless Pad"',
      '"Phone Accessories"',
      '42.00',
      '34.50',
      '35',
      'true',
      '"Precision engineered shock-absorbent phone case with electroplated gold camera guard ring and strong built-in magnetic ring."',
      '"case_black_gold.jpg"',
      '"Compatibility: MagSafe; Material: Matte PC & TPU; Charger Output: 15W"',
      '"iPhone 15 / 16:0:20 | Samsung Galaxy S24:0:15"',
      '"ACC-MAG-CASE-01"'
    ]
  ];

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generates sample JSON template ready for immediate administrative download
 */
export function generateSampleJSON(): string {
  const sample = [
    {
      name: "Raw Virgin Straight Lace Front Wig (180% Density)",
      category: "Women's Hair",
      base_price: 185.00,
      sale_price: 159.00,
      stock_quantity: 12,
      is_published: true,
      description: "Hand-tied transparent HD Swiss lace front wig crafted from 100% cuticle-intact raw human hair.",
      image_filenames: ["wig_front.jpg", "wig_side.jpg"],
      specifications: {
        "Lace Type": "13x4 HD Swiss Lace",
        "Hair Texture": "Bone Straight",
        "Density": "180%"
      },
      variants: [
        { name: "22 Inches", price_adjustment: 0, stock_quantity: 4 },
        { name: "26 Inches", price_adjustment: 25, stock_quantity: 5 }
      ],
      sku: "WIG-RAW-STR-01"
    },
    {
      name: "Aurora Fluted Bezel Two-Tone Quartz Timepiece",
      category: "Watches",
      base_price: 110.00,
      sale_price: 89.99,
      stock_quantity: 15,
      is_published: true,
      description: "Classic luxury watch styling featuring precision fluted gold-plated bezel and jubilee link bracelet.",
      image_filenames: ["watch_silver_gold.png"],
      specifications: {
        "Movement": "Japanese Quartz",
        "Case Diameter": "36mm"
      },
      variants: [
        { name: "Two-Tone Gold & Silver", price_adjustment: 0, stock_quantity: 10 }
      ],
      sku: "WCH-AURORA-36"
    }
  ];

  return JSON.stringify(sample, null, 2);
}
