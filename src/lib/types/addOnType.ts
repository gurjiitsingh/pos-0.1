export type addOnType = {
    id: string | undefined;
    name: string;
    price: number;
    categoryId:string;
    productCat:string | undefined;
    baseProductId: string;
    desc: string;
    sortOrder: number;
    image: string;
    isFeatured: boolean;
    purchaseSession: string | null;
    quantity: number | null;
    status: string | null;
    flavors: boolean;
  };