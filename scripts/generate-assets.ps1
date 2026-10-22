Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$buildDir = Join-Path $projectDir "build"
$appxDir = Join-Path $buildDir "appx"
$publicDir = Join-Path $projectDir "public"
$rendererAssetsDir = Join-Path $projectDir "src\renderer\assets"

$masterIconPath = "C:\Users\karthikeyan\.gemini\antigravity-ide\brain\3afd5b4a-f096-4728-9d52-3534edc787ea\transparent_icon.png"

if (-not (Test-Path $masterIconPath)) {
    $masterIconPath = Join-Path $buildDir "icon.png"
}

if (-not (Test-Path $buildDir)) { New-Item -ItemType Directory -Path $buildDir -Force | Out-Null }
if (-not (Test-Path $appxDir)) { New-Item -ItemType Directory -Path $appxDir -Force | Out-Null }
if (-not (Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force | Out-Null }
if (-not (Test-Path $rendererAssetsDir)) { New-Item -ItemType Directory -Path $rendererAssetsDir -Force | Out-Null }

function Resize-Image {
    param(
        [System.Drawing.Image]$SourceImage,
        [int]$Width,
        [int]$Height
    )
    $destBitmap = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($SourceImage, 0, 0, $Width, $Height)
    $graphics.Dispose()
    return $destBitmap
}

$origIcon = [System.Drawing.Image]::FromFile($masterIconPath)

# 1. 512x512 icon.png
$icon512 = Resize-Image -SourceImage $origIcon -Width 512 -Height 512
$iconPngPath = Join-Path $buildDir "icon.png"
$icon512.Save($iconPngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Dispose()

# Copy to public and renderer assets
Copy-Item -Path $iconPngPath -Destination (Join-Path $publicDir "icon.png") -Force
Copy-Item -Path $iconPngPath -Destination (Join-Path $rendererAssetsDir "icon.png") -Force
Write-Host "Updated build/icon.png, public/icon.png, and src/renderer/assets/icon.png"

# 2. Multi-resolution icon.ico with alpha transparency
$sizes = @(256, 128, 64, 48, 32, 24, 16)
$pngStreams = @()

foreach ($sz in $sizes) {
    $resized = Resize-Image -SourceImage $origIcon -Width $sz -Height $sz
    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngStreams += ,@($sz, $ms.ToArray())
    $resized.Dispose()
    $ms.Dispose()
}

$icoPath = Join-Path $buildDir "icon.ico"
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter($fs)

# ICONDIR
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type 1 = ICO
$bw.Write([uint16]$pngStreams.Count) # Image count

$offset = 6 + ($pngStreams.Count * 16)

foreach ($item in $pngStreams) {
    $sz = $item[0]
    $data = $item[1]
    
    $bw.Write([byte]$(if ($sz -ge 256) { 0 } else { $sz })) # Width
    $bw.Write([byte]$(if ($sz -ge 256) { 0 } else { $sz })) # Height
    $bw.Write([byte]0) # Color count
    $bw.Write([byte]0) # Reserved
    $bw.Write([uint16]1) # Planes
    $bw.Write([uint16]32) # Bit count
    $bw.Write([uint32]$data.Length) # Image bytes
    $bw.Write([uint32]$offset) # Offset
    $offset += $data.Length
}

foreach ($item in $pngStreams) {
    $bw.Write($item[1])
}

$bw.Close()
$fs.Close()
Write-Host "Created transparent multi-resolution icon.ico"

# 3. Microsoft Store AppX visual assets
$appxTransparentSizes = @{
    "StoreLogo.png" = @(50, 50)
    "Square44x44Logo.png" = @(44, 44)
    "Square150x150Logo.png" = @(150, 150)
    "Square310x310Logo.png" = @(310, 310)
}

foreach ($name in $appxTransparentSizes.Keys) {
    $dim = $appxTransparentSizes[$name]
    $w = $dim[0]
    $h = $dim[1]
    $dest = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $iconDim = [Math]::Min($w, $h)
    $x = ($w - $iconDim) / 2
    $y = ($h - $iconDim) / 2
    $g.DrawImage($origIcon, [float]$x, [float]$y, [float]$iconDim, [float]$iconDim)
    $g.Dispose()

    $targetFile = Join-Path $appxDir $name
    $dest.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created transparent AppX asset: $name ($w x $h)"
}

# Wide & Splash assets (centered icon on dark theme #181a1f background)
$appxDarkBgSizes = @{
    "Wide310x150Logo.png" = @(310, 150)
    "SplashScreen.png" = @(620, 300)
}

foreach ($name in $appxDarkBgSizes.Keys) {
    $dim = $appxDarkBgSizes[$name]
    $w = $dim[0]
    $h = $dim[1]
    $dest = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.Clear([System.Drawing.Color]::FromArgb(24, 26, 31))
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $iconDim = [int]($h * 0.72)
    $x = ($w - $iconDim) / 2
    $y = ($h - $iconDim) / 2
    $g.DrawImage($origIcon, [float]$x, [float]$y, [float]$iconDim, [float]$iconDim)
    $g.Dispose()

    $targetFile = Join-Path $appxDir $name
    $dest.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created AppX banner asset: $name ($w x $h)"
}

# Monochrome BadgeLogo (24x24) with transparent background
$badgeDest = New-Object System.Drawing.Bitmap 24, 24, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gBadge = [System.Drawing.Graphics]::FromImage($badgeDest)
$gBadge.Clear([System.Drawing.Color]::Transparent)
$gBadge.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gBadge.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gBadge.DrawImage($origIcon, 1, 1, 22, 22)
$gBadge.Dispose()
$badgeFile = Join-Path $appxDir "BadgeLogo.png"
$badgeDest.Save($badgeFile, [System.Drawing.Imaging.ImageFormat]::Png)
$badgeDest.Dispose()
Write-Host "Created BadgeLogo.png"

# 4. NSIS Installer Sidebar (164 x 314 BMP)
$sidebarBmp = New-Object System.Drawing.Bitmap 164, 314
$gSidebar = [System.Drawing.Graphics]::FromImage($sidebarBmp)
$gSidebar.Clear([System.Drawing.Color]::FromArgb(24, 26, 31))
# Draw subtle vertical accent bar
$accentBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point(164, 314)), ([System.Drawing.Color]::FromArgb(35, 45, 65)), ([System.Drawing.Color]::FromArgb(18, 20, 26))
$gSidebar.FillRectangle($accentBrush, 0, 0, 164, 314)
$accentBrush.Dispose()

$iconSidebarSize = 64
$sidebarIconX = (164 - $iconSidebarSize) / 2
$sidebarIconY = 40
$gSidebar.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSidebar.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gSidebar.DrawImage($origIcon, [float]$sidebarIconX, [float]$sidebarIconY, [float]$iconSidebarSize, [float]$iconSidebarSize)

# Draw elegant installer title text
$font = New-Object System.Drawing.Font ("Segoe UI", [float]11, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 243, 248))
$strFormat = New-Object System.Drawing.StringFormat
$strFormat.Alignment = [System.Drawing.StringAlignment]::Center
$gSidebar.DrawString("Simple Note", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 115, 164, 30)), $strFormat)

$subFont = New-Object System.Drawing.Font ("Segoe UI", [float]8, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 165, 185))
$gSidebar.DrawString("Offline Note Taking", $subFont, $subBrush, (New-Object System.Drawing.RectangleF(0, 142, 164, 24)), $strFormat)

$font.Dispose()
$subFont.Dispose()
$textBrush.Dispose()
$subBrush.Dispose()
$strFormat.Dispose()
$gSidebar.Dispose()

$sidebarBmpPath = Join-Path $buildDir "installerSidebar.bmp"
$sidebarBmp.Save($sidebarBmpPath, [System.Drawing.Imaging.ImageFormat]::Bmp)
$sidebarBmp.Dispose()
Write-Host "Created installerSidebar.bmp"

# 5. NSIS Installer Header (150 x 57 BMP)
$headerBmp = New-Object System.Drawing.Bitmap 150, 57
$gHeader = [System.Drawing.Graphics]::FromImage($headerBmp)
$gHeader.Clear([System.Drawing.Color]::FromArgb(24, 26, 31))
$iconHeaderSize = 44
$headerX = 150 - $iconHeaderSize - 8
$headerY = (57 - $iconHeaderSize) / 2
$gHeader.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gHeader.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gHeader.DrawImage($origIcon, [float]$headerX, [float]$headerY, [float]$iconHeaderSize, [float]$iconHeaderSize)
$gHeader.Dispose()

$headerBmpPath = Join-Path $buildDir "installerHeader.bmp"
$headerBmp.Save($headerBmpPath, [System.Drawing.Imaging.ImageFormat]::Bmp)
$headerBmp.Dispose()
Write-Host "Created installerHeader.bmp"

$origIcon.Dispose()
Write-Host "All assets generated successfully!"
