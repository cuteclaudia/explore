const fileInput = document.querySelector<HTMLInputElement>('#photo-file')!;
const canvas = document.querySelector<HTMLCanvasElement>('#photo-canvas')!;
const status = document.querySelector<HTMLElement>('#photo-status')!;
const controls = document.querySelector<HTMLFieldSetElement>('#photo-controls')!;
const crop = document.querySelector<HTMLSelectElement>('#photo-crop')!;
const size = document.querySelector<HTMLSelectElement>('#photo-size')!;
const sliders = ['brightness', 'contrast', 'saturation'].map(name => document.querySelector<HTMLInputElement>('#photo-'+name)!);
let image: ImageBitmap | undefined;
let rotation = 0;
let flipped = false;
let filename = 'explore-photograph';
let request = 0;
function draw() {
  if (!image) return;
  const rotated = document.createElement('canvas');
  const swapped = rotation % 180 !== 0;
  rotated.width = swapped ? image.height : image.width;
  rotated.height = swapped ? image.width : image.height;
  const source = rotated.getContext('2d')!;
  source.translate(rotated.width / 2, rotated.height / 2);
  source.rotate(rotation * Math.PI / 180);
  source.drawImage(image, -image.width / 2, -image.height / 2);
  let width = rotated.width, height = rotated.height;
  if (crop.value !== 'original') {
    const ratio = Number(crop.value);
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
  }
  const scale = Math.min(1, Number(size.value) / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.filter = `brightness(${sliders[0].value}%) contrast(${sliders[1].value}%) saturate(${sliders[2].value}%)`;
  if (flipped) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(rotated, (rotated.width-width)/2, (rotated.height-height)/2, width, height, 0, 0, canvas.width, canvas.height);
  status.textContent = `${filename} · ${canvas.width} × ${canvas.height} px · Ready to download`;
}
function reset() {
  rotation = 0; flipped = false; crop.value = 'original'; size.value = '2400';
  sliders.forEach(input => {input.value = '100'; document.getElementById(input.id.replace('photo-', '')+'-value')!.textContent = '100%';});
  draw();
}
fileInput.addEventListener('change', async () => {
  const current = ++request;
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 30*1024*1024) {
    status.textContent = 'Choose a JPEG, PNG or WebP under 30 MB.'; return;
  }
  status.textContent = 'Opening photograph…';
  try {
    const decoded = await createImageBitmap(file);
    if (current !== request) { decoded.close(); return; }
    if (decoded.width*decoded.height > 50_000_000) { decoded.close(); throw Error('Image is too large'); }
    image?.close(); image = decoded;
    filename = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0,80) || 'explore-photograph';
    controls.disabled = false; canvas.hidden = false;
    document.getElementById('photo-empty')!.hidden = true;
    reset();
  } catch { if (current === request) status.textContent = 'This image could not be opened. Try another image under 50 megapixels.'; }
});
crop.addEventListener('change', draw); size.addEventListener('change', draw);
sliders.forEach(input => input.addEventListener('input', () => {
  document.getElementById(input.id.replace('photo-', '')+'-value')!.textContent = input.value+'%'; draw();
}));
document.getElementById('photo-rotate')!.addEventListener('click', () => { rotation = (rotation+90)%360; draw(); });
document.getElementById('photo-flip')!.addEventListener('click', () => { flipped = !flipped; draw(); });
document.getElementById('photo-reset')!.addEventListener('click', reset);
document.getElementById('photo-download')!.addEventListener('click', () => {
  canvas.toBlob(blob => {
    if (!blob) { status.textContent = 'Export failed. Please try again.'; return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename+'-explore.jpg'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = `Downloaded ${canvas.width} × ${canvas.height} px JPEG. Ready to upload in your story or gallery.`;
  }, 'image/jpeg', 0.9);
});
