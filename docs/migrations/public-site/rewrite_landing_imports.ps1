$ErrorActionPreference = 'Stop'

$root = Join-Path (Get-Location) 'src\landing-import'
$extensions = @('*.ts', '*.tsx', '*.css')

$files = Get-ChildItem -LiteralPath $root -Recurse -File -Include $extensions

foreach ($file in $files) {
  $original = Get-Content -LiteralPath $file.FullName -Raw
  $updated = $original

  $updated = $updated.Replace('@/components/ui/carousel', '@landing/components/ui/carousel')
  $updated = $updated.Replace('@/components/ui/card-fan-carousel', '@landing/components/ui/card-fan-carousel')
  $updated = $updated.Replace('@/components/healthcare', '@landing/components/healthcare')
  $updated = $updated.Replace('@/features/healthcare', '@landing/features/healthcare')
  $updated = $updated.Replace('@/utils/', '@landing/utils/')

  $updated = $updated.Replace('/assets/', '/landing-import/assets/')
  $updated = $updated.Replace('/opengraph-image.png', '/landing-import/opengraph-image.png')
  $updated = $updated.Replace('/twitter-image.png', '/landing-import/twitter-image.png')

  if ($updated -ne $original) {
    Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline
    Write-Host "rewrote $($file.FullName)"
  }
}
