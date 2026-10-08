/**
 * Helper to convert points number to Arabic words (Tafqeet)
 * specifically formatted for reward points (نقاط).
 */

const ONES = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
  "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"
];

// Special forms for 3..10 with 'نقاط' (feminine numerals because نقطة is feminine)
const ONES_FEMININE = [
  "", "واحدة", "اثنتان", "ثلاث", "أربع", "خمس", "ست", "سبع", "ثمان", "تسع", "عشر"
];

const TENS = [
  "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"
];

const HUNDREDS = [
  "", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
];

function convertUnder1000(num) {
  if (num === 0) return "";
  let parts = [];

  const h = Math.floor(num / 100);
  const rem = num % 100;

  if (h > 0) {
    parts.push(HUNDREDS[h]);
  }

  if (rem > 0) {
    if (rem < 20) {
      parts.push(ONES[rem]);
    } else {
      const o = rem % 10;
      const t = Math.floor(rem / 10);
      if (o > 0) {
        parts.push(`${ONES[o]} و${TENS[t]}`);
      } else {
        parts.push(TENS[t]);
      }
    }
  }

  return parts.join(" و");
}

export function numberToArabicWords(number) {
  const n = Math.floor(Number(number) || 0);
  if (n <= 0) return "صفر";

  if (n < 20) return ONES[n];
  if (n < 100) {
    const o = n % 10;
    const t = Math.floor(n / 10);
    return o > 0 ? `${ONES[o]} و${TENS[t]}` : TENS[t];
  }

  if (n < 1000) {
    return convertUnder1000(n);
  }

  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rem = n % 1000;
    let thText = "";
    if (thousands === 1) thText = "ألف";
    else if (thousands === 2) thText = "ألفان";
    else if (thousands >= 3 && thousands <= 10) thText = `${ONES_FEMININE[thousands] || ONES[thousands]} آلاف`;
    else thText = `${convertUnder1000(thousands)} ألف`;

    if (rem > 0) {
      return `${thText} و${convertUnder1000(rem)}`;
    }
    return thText;
  }

  return String(n);
}

/**
 * Converts points to Arabic sentence ending with "فقط لا غير"
 * Example:
 * 0 => "صفر نقاط فقط لا غير"
 * 1 => "نقطة واحدة فقط لا غير"
 * 2 => "نقطتان فقط لا غير"
 * 5 => "خمس نقاط فقط لا غير"
 * 50 => "خمسون نقطة فقط لا غير"
 */
export function pointsToArabicWords(points) {
  const p = Math.floor(Number(points) || 0);
  if (p <= 0) {
    return "صفر نقاط فقط لا غير";
  }
  if (p === 1) {
    return "نقطة واحدة فقط لا غير";
  }
  if (p === 2) {
    return "نقطتان فقط لا غير";
  }
  if (p >= 3 && p <= 10) {
    const word = ONES_FEMININE[p] || ONES[p];
    return `${word} نقاط فقط لا غير`;
  }
  
  const words = numberToArabicWords(p);
  return `${words} نقطة فقط لا غير`;
}

/**
 * Normalizes Arabic text for flexible search:
 * - strips tashkeel / harakat
 * - unifies alif forms (أ, إ, آ, ٱ -> ا)
 * - unifies taa marbuta / haa (ة -> ه)
 * - unifies alif maqsura / yaa (ى -> ي)
 */
export function normalizeArabic(text) {
  if (!text) return "";
  return String(text)
    .replace(/[\u064B-\u065F\u0670]/g, "") // tashkeel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .toLowerCase()
    .trim();
}
