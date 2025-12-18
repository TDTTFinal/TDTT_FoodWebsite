# Script kiem tra nha hang trong MongoDB
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/restaurants?limit=5" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

Write-Host "`n=== DANH SACH 5 NHA HANG MOI NHAT ===" -ForegroundColor Yellow
Write-Host "Tong so trong DB: $($data.total)`n" -ForegroundColor Green

$data.data | ForEach-Object {
    Write-Host "- $($_.name)" -ForegroundColor Cyan
    Write-Host "  Dia chi: $($_.address)" -ForegroundColor Gray
    Write-Host "  ID: $($_._id)" -ForegroundColor DarkGray
    Write-Host "  Ngay tao: $($_.createdAt)" -ForegroundColor DarkGray
    Write-Host ""
}
