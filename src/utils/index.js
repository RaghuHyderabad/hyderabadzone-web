// ═══════════════════════════════════════════════════
// src/utils/priceFormat.js
// ═══════════════════════════════════════════════════

/**
 * Format total price into readable Indian format
 * e.g. 5400000 → "₹54 L"
 */
export function formatPrice(price, priceType, area) {
  const total = priceType === 'total'
    ? Number(price)
    : Number(price) * Number(area)

  if (isNaN(total) || total <= 0) return '₹ --'
  if (total >= 10_000_000) return `₹${(total / 10_000_000).toFixed(2)} Cr`
  if (total >= 100_000)    return `₹${(total / 100_000).toFixed(0)} L`
  return `₹${total.toLocaleString('en-IN')}`
}

/**
 * Short label for price type
 */
export function priceLabel(priceType) {
  if (priceType === 'sqft') return '/ sq.ft'
  if (priceType === 'sqyd') return '/ sq.yd'
  return ''
}

/**
 * Format unit price  e.g. ₹4,500 / sq.ft
 */
export function formatUnitPrice(price, priceType) {
  const num = Number(price)
  if (isNaN(num)) return ''
  return `₹${num.toLocaleString('en-IN')} ${priceLabel(priceType)}`
}

/**
 * Budget filter labels for UI
 */
export const BUDGET_RANGES = [
  { label: 'Under ₹20 L',   min: 0,          max: 2_000_000   },
  { label: '₹20 – 40 L',    min: 2_000_000,  max: 4_000_000   },
  { label: '₹40 – 80 L',    min: 4_000_000,  max: 8_000_000   },
  { label: '₹80 L – 1.5 Cr',min: 8_000_000,  max: 15_000_000  },
  { label: 'Above ₹1.5 Cr', min: 15_000_000, max: 999_000_000 },
]


// ═══════════════════════════════════════════════════
// src/utils/emiCalc.js
// ═══════════════════════════════════════════════════

/**
 * Calculate monthly EMI
 * @param {number} principal  - Loan amount in ₹
 * @param {number} rateYear   - Annual interest rate (default 8.5%)
 * @param {number} tenureYears- Loan tenure in years (default 20)
 */
export function calcEMI(principal, rateYear = 8.5, tenureYears = 20) {
  const P = principal * 0.8             // 80% loan (20% down)
  const r = rateYear / 12 / 100         // Monthly rate
  const n = tenureYears * 12            // Total months
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  return Math.round(emi)
}

export function formatEMI(emi) {
  return `₹${emi.toLocaleString('en-IN')}/mo`
}


// ═══════════════════════════════════════════════════
// src/utils/slugify.js
// ═══════════════════════════════════════════════════
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}


// ═══════════════════════════════════════════════════
// src/utils/whatsapp.js
// ═══════════════════════════════════════════════════
export function waLink(phone, message) {
  const clean = phone.replace(/[^0-9]/g, '')
  const num   = clean.startsWith('91') ? clean : '91' + clean.replace(/^0/, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}
