// utils/resizeImage.ts

export const resizeImage = (
  file: File,
  targetHeight: number = 800,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const scaleFactor = targetHeight / img.height;
      const height = targetHeight;
      const width = img.width * scaleFactor;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get canvas context");

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Canvas is empty");

          const resizedFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject("Failed to load image");
  });
};
