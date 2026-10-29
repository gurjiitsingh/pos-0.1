




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


const price = (product.price.toString()).replace(/\./g, ',')


## ask customer email once and set it, ask again only if customer want to change (on click)
## exapple code for pagination and sort order -- used in save ordermaster
## product description on click show notification
## use react notification insted of js aleart
## pagination
## product search
## andon product type 1. variant 2. offers 3. flavours 4.souses

const collectionRef = collection(db, 'orderMaster')
    
 const targetQuery = query(collectionRef, orderBy("srno", "desc"), limit(1));
 const querySnapshot = await getDocs(targetQuery)

//  const q = query(collectionRef);
//  const querySnapshot = await getDocs(q);
let new_srno =1;
const orderData = [] as orderMasterDataT[];
  querySnapshot.forEach((doc) => {
     const  data = doc.data() as orderMasterDataT;
    //   console.log("last order ----------", data)
       orderData.push(data)
     });
 
   
   if(orderData[0]?.srno !== undefined){
     new_srno =orderData[0].srno + 1;
   }
 //  console.log("sr No ----------", new_srno)

 // const timeId = new Date().toISOString();
  const orderMasterData = {
    // also add auto increment to order,
    customerName,
    userId: UserAddedId,
    addressId: addressAddedId,
    total:total,
    status:"NEW",
    totalDiscountG,
    time: now_german,
   srno:new_srno,
   
  } as orderMasterDataT; 

  
const orderMasterId = await addOrderToMaster(orderMasterData) as string;


## colors

bg-[#F8ED8C]
bg-[#FF8989]

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
