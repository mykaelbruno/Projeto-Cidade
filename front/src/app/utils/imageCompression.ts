const maxDimension = 1600;
const quality = 0.78;

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Nao foi possivel compactar a imagem.'));
    }, type, quality);
  });
}

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'));
      image.src = objectUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

    if (scale === 1 && file.size <= 900_000) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const targetType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, targetType);

    if (blob.size >= file.size) {
      return file;
    }

    const extension = targetType === 'image/webp' ? 'webp' : 'jpg';
    const originalName = file.name.replace(/\.[^.]+$/, '');

    return new File([blob], `${originalName}.${extension}`, {
      type: targetType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
