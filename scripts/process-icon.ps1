$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageProcessor {
    public static void ProcessIcon(string inputJpg, string outputPng, int targetSize = 512) {
        using (Bitmap src = new Bitmap(inputJpg)) {
            int w = src.Width;
            int h = src.Height;
            
            // 1. Lock source bits (32bpp ARGB)
            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] pixels = new byte[srcData.Stride * h];
            Marshal.Copy(srcData.Scan0, pixels, 0, pixels.Length);
            src.UnlockBits(srcData);

            // 2. Identify background via BFS floodfill from outer border
            // Background is contiguous white/near-white starting from all edges
            byte[] mask = new byte[w * h]; // 0 = unknown, 1 = background, 2 = foreground
            Queue<int> queue = new Queue<int>();

            Func<int, int, bool> isNearWhite = (px, py) => {
                int idx = (py * w + px) * 4;
                byte b = pixels[idx];
                byte g = pixels[idx + 1];
                byte r = pixels[idx + 2];
                // Check if color is close to white
                return (r >= 238 && g >= 238 && b >= 238);
            };

            // Seed queue with outer perimeter
            for (int x = 0; x < w; x++) {
                if (isNearWhite(x, 0)) { mask[x] = 1; queue.Enqueue(x); }
                if (isNearWhite(x, h - 1)) { mask[(h - 1) * w + x] = 1; queue.Enqueue((h - 1) * w + x); }
            }
            for (int y = 0; y < h; y++) {
                if (mask[y * w] == 0 && isNearWhite(0, y)) { mask[y * w] = 1; queue.Enqueue(y * w); }
                if (mask[y * w + (w - 1)] == 0 && isNearWhite(w - 1, y)) { mask[y * w + (w - 1)] = 1; queue.Enqueue(y * w + (w - 1)); }
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (queue.Count > 0) {
                int curr = queue.Dequeue();
                int cx = curr % w;
                int cy = curr / w;

                for (int d = 0; d < 4; d++) {
                    int nx = cx + dx[d];
                    int ny = cy + dy[d];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        int nidx = ny * w + nx;
                        if (mask[nidx] == 0 && isNearWhite(nx, ny)) {
                            mask[nidx] = 1;
                            queue.Enqueue(nidx);
                        }
                    }
                }
            }

            // Find bounding box of foreground (mask != 1)
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    if (mask[y * w + x] != 1) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            Console.WriteLine(string.Format("Foreground Bounding Box: ({0},{1}) to ({2},{3}) - Size: {4}x{5}",
                minX, minY, maxX, maxY, maxX - minX + 1, maxY - minY + 1));

            // Create 32bpp output with alpha transparency
            // For edge pixels (transition between background white and foreground),
            // calculate smooth alpha and unmultiply white background.
            using (Bitmap result1024 = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                BitmapData resData = result1024.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                byte[] outPixels = new byte[resData.Stride * h];

                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int pos = (y * w + x) * 4;
                        if (mask[y * w + x] == 1) {
                            // Background pixel -> fully transparent
                            outPixels[pos] = 0;
                            outPixels[pos + 1] = 0;
                            outPixels[pos + 2] = 0;
                            outPixels[pos + 3] = 0; // Alpha 0
                        } else {
                            byte b = pixels[pos];
                            byte g = pixels[pos + 1];
                            byte r = pixels[pos + 2];

                            // Check if this foreground pixel is adjacent to background for anti-aliasing
                            bool isBorder = false;
                            for (int d = 0; d < 4; d++) {
                                int nx = x + dx[d];
                                int ny = y + dy[d];
                                if (nx >= 0 && nx < w && ny >= 0 && ny < h && mask[ny * w + nx] == 1) {
                                    isBorder = true;
                                    break;
                                }
                            }

                            if (isBorder && (r > 200 || g > 200 || b > 200)) {
                                // Smooth alpha calculation
                                double maxDiff = Math.Max(255 - r, Math.Max(255 - g, 255 - b));
                                double alpha = Math.Min(1.0, maxDiff / 40.0);
                                if (alpha < 0.1) alpha = 0.0;
                                byte a = (byte)(alpha * 255);
                                outPixels[pos] = b;
                                outPixels[pos + 1] = g;
                                outPixels[pos + 2] = r;
                                outPixels[pos + 3] = a;
                            } else {
                                outPixels[pos] = b;
                                outPixels[pos + 1] = g;
                                outPixels[pos + 2] = r;
                                outPixels[pos + 3] = 255; // Fully opaque
                            }
                        }
                    }
                }

                Marshal.Copy(outPixels, 0, resData.Scan0, outPixels.Length);
                result1024.UnlockBits(resData);

                // Now create nicely framed targetSize x targetSize image
                // Crop tightly to bounding box with ~6% padding for standard Windows 11 icon silhouette
                int fgW = maxX - minX + 1;
                int fgH = maxY - minY + 1;
                int maxDim = Math.Max(fgW, fgH);

                // Add 6% padding around icon
                int pad = (int)(maxDim * 0.06);
                int cropX = Math.Max(0, minX - pad);
                int cropY = Math.Max(0, minY - pad);
                int cropW = Math.Min(w - cropX, fgW + pad * 2);
                int cropH = Math.Min(h - cropY, fgH + pad * 2);

                using (Bitmap target = new Bitmap(targetSize, targetSize, PixelFormat.Format32bppArgb)) {
                    using (Graphics g = Graphics.FromImage(target)) {
                        g.Clear(Color.Transparent);
                        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                        g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                        g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;

                        // Center in targetSize
                        double scale = Math.Min((double)targetSize / cropW, (double)targetSize / cropH);
                        int drawW = (int)(cropW * scale);
                        int drawH = (int)(cropH * scale);
                        int drawX = (targetSize - drawW) / 2;
                        int drawY = (targetSize - drawH) / 2;

                        Rectangle srcRect = new Rectangle(cropX, cropY, cropW, cropH);
                        Rectangle dstRect = new Rectangle(drawX, drawY, drawW, drawH);
                        g.DrawImage(result1024, dstRect, srcRect, GraphicsUnit.Pixel);
                    }
                    target.Save(outputPng, ImageFormat.Png);
                    Console.WriteLine("Saved transparent icon to " + outputPng);
                }
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies "System.Drawing.dll"
$inputJpg = "C:\Users\karthikeyan\.gemini\antigravity-ide\brain\3afd5b4a-f096-4728-9d52-3534edc787ea\simple_note_icon_1792672109739.jpg"
$outputPng = "C:\Users\karthikeyan\.gemini\antigravity-ide\brain\3afd5b4a-f096-4728-9d52-3534edc787ea\transparent_icon.png"

[ImageProcessor]::ProcessIcon($inputJpg, $outputPng, 512)
