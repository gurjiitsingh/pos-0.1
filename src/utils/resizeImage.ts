// utils/resizeImage.ts

export const resizeImage = (
  file: File,
  targetWidth: number = 600,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const width = targetWidth;
        const scaleFactor = width / img.width;
        const height = img.height * scaleFactor;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Could not get canvas context");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject("Failed to read file");
    reader.readAsDataURL(file);
  });
};
