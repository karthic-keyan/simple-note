import fs from 'fs';

function convert32to24(filePath) {
  const buf = fs.readFileSync(filePath);
  const offset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const height = buf.readInt32LE(22);
  const bpp = buf.readUInt16LE(28);

  console.log(`Checking ${filePath}: ${width}x${height}, bpp: ${bpp}`);
  if (bpp !== 32) {
    console.log(`${filePath} is already not 32bpp, skipping.`);
    return;
  }

  const absHeight = Math.abs(height);
  const rowStride24 = Math.ceil((width * 3) / 4) * 4;
  const imageSize24 = rowStride24 * absHeight;
  const fileSize24 = 54 + imageSize24;
  const out = Buffer.alloc(fileSize24);

  // BITMAPFILEHEADER
  out.write('BM', 0, 2, 'ascii');
  out.writeUInt32LE(fileSize24, 2);
  out.writeUInt32LE(0, 6);
  out.writeUInt32LE(54, 10);

  // BITMAPINFOHEADER
  out.writeUInt32LE(40, 14);
  out.writeInt32LE(width, 18);
  out.writeInt32LE(height, 22);
  out.writeUInt16LE(1, 26); // planes
  out.writeUInt16LE(24, 28); // 24-bit RGB
  out.writeUInt32LE(0, 30);  // BI_RGB uncompressed
  out.writeUInt32LE(imageSize24, 34);
  out.writeInt32LE(2835, 38);
  out.writeInt32LE(2835, 42);
  out.writeUInt32LE(0, 46);
  out.writeUInt32LE(0, 50);

  // Copy B, G, R pixels
  const rowStride32 = width * 4;
  for (let y = 0; y < absHeight; y++) {
    const srcRowStart = offset + y * rowStride32;
    const dstRowStart = 54 + y * rowStride24;
    for (let x = 0; x < width; x++) {
      const srcPx = srcRowStart + x * 4;
      const dstPx = dstRowStart + x * 3;
      out[dstPx] = buf[srcPx];         // Blue
      out[dstPx + 1] = buf[srcPx + 1]; // Green
      out[dstPx + 2] = buf[srcPx + 2]; // Red
    }
  }

  fs.writeFileSync(filePath, out);
  console.log(`Successfully converted ${filePath} to 24-bit BMP. Old size: ${buf.length}, New size: ${out.length}`);
}

convert32to24('build/installerSidebar.bmp');
convert32to24('build/installerHeader.bmp');
