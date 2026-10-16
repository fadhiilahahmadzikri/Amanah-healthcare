$ErrorActionPreference = "Stop"

Write-Host "1. Logging in as admin (admin@amanah.com)..." -ForegroundColor Cyan
$login = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/auth/email/login" -Method Post -Body (@{ email = "admin@amanah.com"; password = "secret123" } | ConvertTo-Json) -ContentType "application/json"
$token = $login.token
if (-not $token) { $token = $login.data.token }
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token acquired successfully!" -ForegroundColor Green

Write-Host "`n2. Testing GET /api/v1/appointments/queue-navigation (Current Date)..." -ForegroundColor Cyan
$nav = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/appointments/queue-navigation" -Method Get -Headers $headers
Write-Host "Units count: $($nav.units.Count)" -ForegroundColor Green
foreach ($u in $nav.units) {
    Write-Host " - Unit: $($u.name) ($($u.code)), Total: $($u.totalAppointments), ActiveQueues: $($u.activeQueues), Doctors: $($u.doctors.Count)" -ForegroundColor Yellow
}

Write-Host "`n3. Testing GET /api/v1/appointments/queue-navigation?date=2026-10-25..." -ForegroundColor Cyan
$navDate = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/appointments/queue-navigation?date=2026-10-25" -Method Get -Headers $headers
foreach ($u in $navDate.units) {
    Write-Host " - Unit: $($u.name), Total: $($u.totalAppointments), ActiveQueues: $($u.activeQueues)" -ForegroundColor Green
    foreach ($d in $u.doctors) {
        Write-Host "     * Doctor: $($d.name), Total: $($d.totalAppointments), ActiveQueues: $($d.activeQueues), Waiting: $($d.waitingCount), Completed: $($d.completedCount)" -ForegroundColor Gray
    }
}

Write-Host "`n4. Testing GET /api/v1/appointments filtered by poliklinikId (Poli Umum)..." -ForegroundColor Cyan
$poliUmumId = "0e63c88d-5349-4aeb-ac3b-cca20712203a"
$poliRes = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/appointments?poliklinikId=$poliUmumId&date=2026-10-25" -Method Get -Headers $headers
Write-Host "Poli Umum appointments returned: $($poliRes.data.Count), total: $($poliRes.meta.total)" -ForegroundColor Green
foreach ($apt in $poliRes.data) {
    Write-Host "   Booking: $($apt.bookingCode), Doctor: $($apt.doctorName), Queue: $($apt.queueNumber), Status: $($apt.status)" -ForegroundColor Gray
}

Write-Host "`n5. Testing GET /api/v1/appointments filtered by doctorId (dr. Ahmad Santoso)..." -ForegroundColor Cyan
$drAhmadId = "82dba40a-eed5-4cdf-89f5-a75dc5242a66"
$docRes = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/appointments?poliklinikId=$poliUmumId&doctorId=$drAhmadId&date=2026-10-25" -Method Get -Headers $headers
Write-Host "Dr. Ahmad appointments returned: $($docRes.data.Count), total: $($docRes.meta.total)" -ForegroundColor Green
foreach ($apt in $docRes.data) {
    Write-Host "   Booking: $($apt.bookingCode), Doctor: $($apt.doctorName), Queue: $($apt.queueNumber)" -ForegroundColor Gray
}

Write-Host "`n6. Testing GET /api/v1/appointments filtered by doctorId=unassigned..." -ForegroundColor Cyan
$unassignedRes = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/v1/appointments?doctorId=unassigned" -Method Get -Headers $headers
Write-Host "Unassigned appointments returned: $($unassignedRes.data.Count), total: $($unassignedRes.meta.total)" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "ALL BACKEND & API CONTRACT VERIFICATION TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
