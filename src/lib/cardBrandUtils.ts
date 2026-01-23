// Card brand detection based on BIN (Bank Identification Number)
export type CardBrand = 
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

interface CardBrandInfo {
  brand: CardBrand;
  name: string;
  color: string;
}

const cardPatterns: { pattern: RegExp; brand: CardBrand }[] = [
  // Visa: starts with 4
  { pattern: /^4/, brand: "visa" },
  // Mastercard: 51-55 or 2221-2720
  { pattern: /^5[1-5]/, brand: "mastercard" },
  { pattern: /^2(2[2-9][1-9]|2[3-9]|[3-6]|7[01]|720)/, brand: "mastercard" },
  // American Express: 34 or 37
  { pattern: /^3[47]/, brand: "amex" },
  // Discover: 6011, 622126-622925, 644-649, 65
  { pattern: /^6011/, brand: "discover" },
  { pattern: /^65/, brand: "discover" },
  { pattern: /^64[4-9]/, brand: "discover" },
  { pattern: /^622(12[6-9]|1[3-9]|[2-8]|9[01]|92[0-5])/, brand: "discover" },
  // Diners Club: 300-305, 36, 38-39
  { pattern: /^3(0[0-5]|[68])/, brand: "diners" },
  // JCB: 3528-3589
  { pattern: /^35(2[89]|[3-8])/, brand: "jcb" },
  // UnionPay: 62
  { pattern: /^62/, brand: "unionpay" },
];

export const detectCardBrand = (cardNumber: string): CardBrand => {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  for (const { pattern, brand } of cardPatterns) {
    if (pattern.test(cleanNumber)) {
      return brand;
    }
  }
  
  return "unknown";
};

export const getCardBrandInfo = (brand: CardBrand): CardBrandInfo => {
  const brandInfoMap: Record<CardBrand, CardBrandInfo> = {
    visa: { brand: "visa", name: "Visa", color: "#1A1F71" },
    mastercard: { brand: "mastercard", name: "Mastercard", color: "#EB001B" },
    amex: { brand: "amex", name: "American Express", color: "#006FCF" },
    discover: { brand: "discover", name: "Discover", color: "#FF6600" },
    diners: { brand: "diners", name: "Diners Club", color: "#0079BE" },
    jcb: { brand: "jcb", name: "JCB", color: "#0B4EA2" },
    unionpay: { brand: "unionpay", name: "UnionPay", color: "#D7282F" },
    unknown: { brand: "unknown", name: "Card", color: "#6B7280" },
  };
  
  return brandInfoMap[brand];
};
