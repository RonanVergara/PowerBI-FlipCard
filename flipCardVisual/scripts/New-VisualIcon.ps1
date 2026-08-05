$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$scale = 4
$bitmap = [System.Drawing.Bitmap]::new(20 * $scale, 20 * $scale)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

$blue = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#0F6CBD"))
$light = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#DCEBFA"))
$whitePen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 1.5 * $scale)
$bluePen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#0F6CBD"), 1.4 * $scale)
$whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$bluePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$bluePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$graphics.FillRectangle($light, 5 * $scale, 5 * $scale, 13 * $scale, 11 * $scale)
$graphics.FillRectangle($blue, 2 * $scale, 2 * $scale, 13 * $scale, 11 * $scale)
$graphics.DrawLine($whitePen, 5 * $scale, 9 * $scale, 5 * $scale, 7 * $scale)
$graphics.DrawLine($whitePen, 8 * $scale, 9 * $scale, 8 * $scale, 5 * $scale)
$graphics.DrawLine($whitePen, 11 * $scale, 9 * $scale, 11 * $scale, 4 * $scale)
$graphics.DrawArc($bluePen, 8 * $scale, 10 * $scale, 9 * $scale, 7 * $scale, 12, 210)
$graphics.DrawLine($bluePen, 16.2 * $scale, 14.9 * $scale, 16.6 * $scale, 11.8 * $scale)
$graphics.DrawLine($bluePen, 16.2 * $scale, 14.9 * $scale, 13.3 * $scale, 14.3 * $scale)

$targetPath = Join-Path (Split-Path $PSScriptRoot -Parent) "assets\icon.png"
$resized = [System.Drawing.Bitmap]::new(20, 20)
$resizer = [System.Drawing.Graphics]::FromImage($resized)
$resizer.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$resizer.DrawImage($bitmap, 0, 0, 20, 20)
$resized.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)

$resizer.Dispose()
$resized.Dispose()
$bluePen.Dispose()
$whitePen.Dispose()
$light.Dispose()
$blue.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
