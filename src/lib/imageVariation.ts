// Redesenha a imagem num canvas, o que descarta qualquer metadado (EXIF/GPS/device) do
// arquivo original, e aplica um jitter aleatório imperceptível de brilho/contraste + 1px de
// ruído subpixel. Isso garante que cada upload do mesmo criativo gere um arquivo com hash de
// conteúdo diferente, prática padrão da indústria para evitar que o Facebook trate variações
// de teste A/B do mesmo criativo como cópia idêntica — sem alterar o conteúdo visível.
export async function cleanMetadataAndVaryHash(source: Blob, mimeType = "image/webp"): Promise<Blob> {
  const img = await loadImage(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context indisponível");

    const brightnessPct = 100 + (Math.random() * 1.2 - 0.6); // ±0.6%
    const contrastPct = 100 + (Math.random() * 1.2 - 0.6);
    ctx.filter = `brightness(${brightnessPct.toFixed(2)}%) contrast(${contrastPct.toFixed(2)}%)`;
    ctx.drawImage(img, 0, 0);

    ctx.filter = "none";
    const noiseX = Math.floor(Math.random() * canvas.width);
    const noiseY = Math.floor(Math.random() * canvas.height);
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgba(${r},${g},${b},0.004)`;
    ctx.fillRect(noiseX, noiseY, 1, 1);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Falha ao gerar blob a partir do canvas"));
      }, mimeType, 0.92);
    });
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem para limpeza de metadados"));
    img.src = URL.createObjectURL(source);
  });
}
