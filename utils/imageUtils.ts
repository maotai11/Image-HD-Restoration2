export const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      if (!data) {
          return reject(new Error('Invalid file format'));
      }
      const mimeType = header.split(';')[0].split(':')[1];
      resolve({ base64Data: data, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};


const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
};

export const cropImage = async (
  imageUrl: string,
  position: [number, number, number, number]
): Promise<{ croppedBase64: string; croppedMimeType: string }> => {
    const image = await loadImage(imageUrl);
    const [x1, y1, x2, y2] = position;
    
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    const sx = x1 * naturalWidth;
    const sy = y1 * naturalHeight;
    const sWidth = (x2 - x1) * naturalWidth;
    const sHeight = (y2 - y1) * naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = sWidth;
    canvas.height = sHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

    const dataUrl = canvas.toDataURL('image/png');
    return {
        croppedBase64: dataUrl.split(',')[1],
        croppedMimeType: 'image/png',
    };
};

export const pasteImage = async (
  baseImageUrl: string,
  patchImageUrl: string,
  position: [number, number, number, number]
): Promise<string> => {
    const baseImage = await loadImage(baseImageUrl);
    const patchImage = await loadImage(patchImageUrl);
    
    const [x1, y1] = position;
    const naturalWidth = baseImage.naturalWidth;
    const naturalHeight = baseImage.naturalHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(baseImage, 0, 0);

    ctx.drawImage(
        patchImage,
        x1 * naturalWidth,
        y1 * naturalHeight
    );
    
    const mimeType = baseImageUrl.startsWith('data:') ? baseImageUrl.split(';')[0].split(':')[1] : 'image/png';
    return canvas.toDataURL(mimeType);
};