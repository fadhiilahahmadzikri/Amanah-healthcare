# ==============================================================================
# AMANAH HEALTHCARE - DOCTOR ROSTER OVERRIDE PRIORITY VERIFICATION
# ==============================================================================

. "$PSScriptRoot\..\backend\scripts\e2e\common.ps1"

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$baseUrl = Get-E2EBaseUrl
$apiBaseUrl = Get-E2EApiBaseUrl

Reset-TestCounters

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " [TEST] Doctor Roster Override Priority Verification " -ForegroundColor Cyan
Write-Host " Target API: $apiBaseUrl" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# 0. Wait for API readiness
Wait-E2EApiReady -url $baseUrl

# 1. Login Admin
Write-Host "`n[STEP 1] Logging in as Admin..." -ForegroundColor Yellow
$adminAuth = Login-Admin
$headers = $adminAuth.headers
Assert-Test "Admin authenticated successfully" ($null -ne $adminAuth.token)

# 2. Test Doctor Schedule List for Sunday (2026-10-11)
$targetDate = "2026-10-11"
Write-Host "`n[STEP 2] Fetching Doctor Schedule List for Sunday ($targetDate)..." -ForegroundColor Yellow
$listResponse = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules?date=$targetDate" -Method Get -Headers $headers

$doctors = $listResponse.data.doctors
Assert-Test "Schedule list returned doctors array" ($doctors.Count -gt 0) "Count: $($doctors.Count)"

# Find Dr. Ahmad Santoso (82dba40a-eed5-4cdf-89f5-a75dc5242a66)
$drAhmad = $doctors | Where-Object { $_.practitioner_id -eq "82dba40a-eed5-4cdf-89f5-a75dc5242a66" }
Assert-Test "Dr. Ahmad Santoso exists in list" ($null -ne $drAhmad)

Write-Host "`nDr. Ahmad Santoso Schedule Status (Sunday $targetDate):" -ForegroundColor Magenta
Write-Host "  Name: $($drAhmad.nama_dokter)"
Write-Host "  Doctor Status: $($drAhmad.status_dokter)"
Write-Host "  Schedule Status: $($drAhmad.status_jadwal)"
Write-Host "  Today Schedule: $($drAhmad.jadwal_hari_ini)"
Write-Host "  Upcoming Schedule: $($drAhmad.jadwal_praktik_mendatang)"
Write-Host "  Daily Sessions Count: $($drAhmad.sesi_harian.Count)"

foreach ($sesi in $drAhmad.sesi_harian) {
    Write-Host "    - $($sesi.nama_sesi) ($($sesi.waktu)): Status = $($sesi.status_sesi), ClosureReason = $($sesi.closure_reason), Room = $($sesi.ruang)" -ForegroundColor Green
}

# Assertions for Dr. Ahmad
Assert-Test "Dr. Ahmad status_dokter is OPEN" ($drAhmad.status_dokter -eq "OPEN") "Actual: $($drAhmad.status_dokter)"
Assert-Test "Dr. Ahmad status_jadwal is OPEN" ($drAhmad.status_jadwal -eq "OPEN") "Actual: $($drAhmad.status_jadwal)"
Assert-Test "Dr. Ahmad has at least 2 sessions on Sunday" ($drAhmad.sesi_harian.Count -ge 2) "Count: $($drAhmad.sesi_harian.Count)"

$allAhmadSessionsOpen = $true
foreach ($sesi in $drAhmad.sesi_harian) {
    if ($sesi.status_sesi -ne "OPEN") {
        $allAhmadSessionsOpen = $false
    }
}
Assert-Test "All Sunday sessions for Dr. Ahmad are OPEN" ($allAhmadSessionsOpen -eq $true)

# 3. Check Other Doctors (generic template doctors should be CLOSED on Sunday)
Write-Host "`n[STEP 3] Verifying Generic Template Doctors on Sunday..." -ForegroundColor Yellow
$otherDoctors = $doctors | Where-Object { $_.practitioner_id -ne "82dba40a-eed5-4cdf-89f5-a75dc5242a66" }
$allOthersClosed = $true
foreach ($other in $otherDoctors) {
    Write-Host "  Doctor: $($other.nama_dokter), Status: $($other.status_dokter)"
    if ($other.status_dokter -ne "CLOSED") {
        $allOthersClosed = $false
        Write-Host "    Warning: $($other.nama_dokter) is $($other.status_dokter)" -ForegroundColor Red
    }
}
Assert-Test "All generic template doctors are CLOSED on Sunday" ($allOthersClosed -eq $true)

# 4. Detail Query for Dr. Ahmad on Sunday (2026-10-11)
Write-Host "`n[STEP 4] Fetching Detail Query for Dr. Ahmad Santoso ($targetDate)..." -ForegroundColor Yellow
$detailResponse = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/82dba40a-eed5-4cdf-89f5-a75dc5242a66?date=$targetDate" -Method Get -Headers $headers
$detail = $detailResponse.data

Assert-Test "Detail query status_dokter is OPEN" ($detail.status_dokter -eq "OPEN") "Actual: $($detail.status_dokter)"
Assert-Test "Detail query has sessions" ($detail.sesi_harian.Count -ge 2) "Count: $($detail.sesi_harian.Count)"

$sundayMonthlyDay = $detail.monthly_schedule | Where-Object { $_.date -eq $targetDate }
Write-Host "  Monthly Schedule for $targetDate : Status = $($sundayMonthlyDay.status), DayStatus = $($sundayMonthlyDay.dayStatus), Label = $($sundayMonthlyDay.statusLabel), ActiveSessions = $($sundayMonthlyDay.activeSessions)"

Assert-Test "Monthly calendar day is OPEN on Sunday" ($sundayMonthlyDay.status -eq "OPEN" -and $sundayMonthlyDay.dayStatus -eq "OPEN")

# 5. Roster Assignments Matrix
Write-Host "`n[STEP 5] Fetching Doctor Roster Matrix..." -ForegroundColor Yellow
$rosterResponse = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/82dba40a-eed5-4cdf-89f5-a75dc5242a66/assignments" -Method Get -Headers $headers
$rosterData = Get-ResponseData $rosterResponse

$sundayRoster = $rosterData.days | Where-Object { $_.dow -eq 0 }
Write-Host "  Sunday Roster (dow = 0): $($sundayRoster.dayName), isOperatingDay = $($sundayRoster.isOperatingDay)"
foreach ($sess in $sundayRoster.sessions) {
    Write-Host "    - $($sess.sessionLabel) ($($sess.timeRange)): isActive = $($sess.isActive), Room = $($sess.preferredRoomName)"
}

$sundayActiveSessions = $sundayRoster.sessions | Where-Object { $_.isActive -eq $true }
Assert-Test "Sunday roster has active sessions for Dr. Ahmad" ($sundayActiveSessions.Count -ge 2) "Count: $($sundayActiveSessions.Count)"

# 6. Audit History
Write-Host "`n[STEP 6] Checking Audit History..." -ForegroundColor Yellow
$historyResponse = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/82dba40a-eed5-4cdf-89f5-a75dc5242a66/history?limit=5" -Method Get -Headers $headers
$historyData = Get-ResponseData $historyResponse
Assert-Test "Audit history endpoint accessible" ($null -ne $historyData)
Write-Host "  Total History Records: $($historyData.total)"
foreach ($item in $historyData.items) {
    Write-Host "  - [$($item.createdAt)] Action: $($item.action), NewStatus: $($item.newStatus), Reason: $($item.reason)"
}

# 7. Mutation Roundtrip & History Verification
Write-Host "`n[STEP 7] Testing Roster Update Mutation..." -ForegroundColor Yellow
$currentAssignments = @()
foreach ($d in $rosterData.days) {
    foreach ($s in $d.sessions) {
        $currentAssignments += @{
            dow = $d.dow
            sessionId = $s.sessionId
            isActive = $s.isActive
            preferredRoomId = $s.preferredRoomId
        }
    }
}

$updatePayload = @{
    reason = "Penyesuaian verifikasi sistem roster override"
    assignments = $currentAssignments
} | ConvertTo-Json -Depth 5

$updateResponse = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/82dba40a-eed5-4cdf-89f5-a75dc5242a66/assignments" -Method Put -Headers $headers -Body $updatePayload -ContentType "application/json"
$updatedRoster = Get-ResponseData $updateResponse
Assert-Test "PUT /assignments succeeded and returned roster" ($null -ne $updatedRoster.days)

$historyAfter = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/82dba40a-eed5-4cdf-89f5-a75dc5242a66/history?limit=1" -Method Get -Headers $headers
$historyAfterData = Get-ResponseData $historyAfter
Assert-Test "Audit history recorded the new assign_roster action" ($historyAfterData.items[0].reason -eq "Penyesuaian verifikasi sistem roster override")

Print-TestSummary "Doctor Roster Override Verification"
