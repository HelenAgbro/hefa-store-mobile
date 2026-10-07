/**
 * Pants size guide, copied from the website (web app:
 * src/components/product/SizeGuide.tsx).
 *
 * Measurements are approximate and in centimetres. Kept as data rather than
 * hard-coded into the modal so the product screen and any future screen can
 * share the same numbers.
 */

export interface SizeRow {
  size: string;
  waist: string;
  hip: string;
  inseam: string;
}

export const SIZE_ROWS: SizeRow[] = [
  { size: '28', waist: '71', hip: '91', inseam: '76' },
  { size: '30', waist: '76', hip: '96', inseam: '77' },
  { size: '32', waist: '81', hip: '101', inseam: '78' },
  { size: '34', waist: '86', hip: '106', inseam: '79' },
  { size: '36', waist: '91', hip: '111', inseam: '80' },
  { size: '38', waist: '96', hip: '116', inseam: '81' },
];
