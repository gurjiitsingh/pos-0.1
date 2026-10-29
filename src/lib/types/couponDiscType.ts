import {  z } from "zod";
 // "coupon code is required"
export const couponCodeSchema = z.object({
    
    coupon: z.string().min(4, { message: 
     
      "Gutscheincode ist erforderlich"
     })
  })

export   type TcouponCodeSchema = z.infer<typeof couponCodeSchema>;


export type couponDiscType ={ 
couponDesc:string;
isFeatured:boolean;
minSpend:number;
name:string;
price:string;
productCat:string;
}
