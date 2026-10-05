export async function compressImage(
  file: File,
  maxW = 1600,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string }> {
  if (!file.type.startsWith("image/")) {
    const dataUrl = await readAsDataURL(file);
    return { blob: file, dataUrl };
  }

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxW / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, dataUrl };
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
  const outUrl = await readAsDataURL(blob);
  return { blob, dataUrl: outUrl };
}

export function readAsDataURL(file: Blob, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

export function validateFile(file: File): string | null {
  const isImg = file.type.startsWith("image/");
  const isVid = file.type.startsWith("video/");
  if (!isImg && !isVid) return "Only images or short videos are accepted.";
  if (isImg && file.size > 10 * 1024 * 1024) return "Images must be under 10 MB before compression.";
  if (isVid && file.size > 50 * 1024 * 1024) return "Videos must be under 50 MB.";
  return null;
}
