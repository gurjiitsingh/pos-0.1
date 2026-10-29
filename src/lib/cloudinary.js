
  import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not set');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not set');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not set');
}

const folder = process.env.CLOUDINARY_FOLDER || 'masala-food';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function upload(image) {
  const imageData = await image.arrayBuffer();
  const mime = image.type;
  const encoding = 'base64';
  const base64Data = Buffer.from(imageData).toString('base64');
  const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;
  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
  });

  return result.secure_url;
}

export async function uploadOutletLogo(image, outletId) {
  const imageData = await image.arrayBuffer();
  const mime = image.type;
  const encoding = "base64";

  const base64Data = Buffer.from(imageData).toString("base64");
  const fileUri = `data:${mime};${encoding},${base64Data}`;

  const result = await cloudinary.uploader.upload(fileUri, {
    folder: "outlets", // optional (keeps things organized)
    public_id: `outlets/${outletId}/logo`, // ✅ FIXED PATH
    overwrite: true, // ✅ REPLACE OLD IMAGE
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export const deleteFile = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId.trim(), // is the public_id field in the resource object
      { resource_type: 'image' }, //tell the resource type you wanna delete (image, raw, video)
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};


export async function deleteImage(public_id){// not tested just try
//  cloudinary.v2.uploader.destroy(public_id, options).then(callback);
//   cloudinary.v2.uploader.destroy("public_id", function(error,result) {
//     console.log(result, error) });
cloudinary.uploader.destroy(public_id, function(error,result) {console.log(error); console.log(result) });
 }






//  export async function deleteOldImage(oldImageUrl){

//     const imageUrlArray = oldImageUrl.split('/');
//     console.log(imageUrlArray[imageUrlArray.length-1])
//     const imageName = imageUrlArray[imageUrlArray.length-2]+"/"+imageUrlArray[imageUrlArray.length-1]
 
//     const image_public_id = imageName.split('.')[0] 
//     try {
//       let deleteResult = await deleteImage(image_public_id);
//       console.log("image delete data", deleteResult);
//    } catch (error) {
//     console.log(error)
//    }
//    }



// import { v2 as cloudinary } from 'cloudinary';

// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: 'dyhs5oy4s', 
//         api_key: '851124764949739', 
//         api_secret: '<your_api_secret>' // Click 'View Credentials' below to copy your API secret
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();