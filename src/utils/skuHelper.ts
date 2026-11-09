/**
 * SKU generator and validation utilities for JoJo Effects & Co.
 * Generates clean, professional SKUs from product names and item types
 * while ensuring collision avoidance against existing catalog SKUs.
 */

export function generateUniqueSku(
  productName: string,
  productType: string | undefined,
  existingSkus: Set<string>
): string {
  // Use product type prefix or product name initials
  const typeClean = (productType || productName || 'PROD')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  const prefix = typeClean.slice(0, 3).padEnd(3, 'X');

  // Name acronym or key letters
  const words = productName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  
  let mid = '';
  if (words.length >= 2) {
    mid = words.slice(0, 3).map(w => w.slice(0, 3)).join('-');
  } else {
    mid = (words[0] || 'ITEM').slice(0, 6);
  }

  // Find non-colliding numeric suffix
  let counter = 1;
  let candidate = `${prefix}-${mid}-${String(counter).padStart(3, '0')}`;
  
  while (existingSkus.has(candidate)) {
    counter += 1;
    candidate = `${prefix}-${mid}-${String(counter).padStart(3, '0')}`;
  }

  return candidate;
}

export function isPriceValid(value: string | number | undefined | null): boolean {
  if (value === undefined || value === null || value === '') return false;
  const num = typeof value === 'number' ? value : parseFloat(value.toString().trim());
  return !isNaN(num) && num > 0;
}

export function isStockValid(value: string | number | undefined | null): boolean {
  if (value === undefined || value === null || value === '') return false;
  const str = value.toString().trim();
  if (str === '') return false;
  const num = Number(str);
  return Number.isInteger(num) && num >= 0;
}
