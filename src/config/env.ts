// src/config/env.ts
export const productCardType: 1 | 2 = 
  (Number(process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE) as 1 | 2) || 1;
