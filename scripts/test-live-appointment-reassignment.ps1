$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " LIVE E2E APPOINTMENT REASSIGNMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"

# 1. Admin Authentication
Write-Host "`n[1] Authenticating as Admin (admin@amanah.com)..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@amanah.com"
    password = "secret123"
} | ConvertTo-Json

$authRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/email/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $authRes.token
if (-not $token) {
    throw "Failed to obtain admin token"
}
Write-Host "Admin token obtained successfully! (Token length: $($token.Length))" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Find an active appointment from DB
Write-Host "`n[2] Finding active appointments in database..." -ForegroundColor Yellow
$dbAptRaw = docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT id, scheduled_date, scheduled_start_time, status, practitioner_id, room_id FROM appointments WHERE status NOT IN ('cancelled', 'completed') ORDER BY created_at DESC LIMIT 1;"
$dbAptRaw = $dbAptRaw.Trim()

if (-not $dbAptRaw) {
    Write-Host "No active appointment found in DB. Creating a dummy booking or searching any appointment..." -ForegroundColor Yellow
    $dbAptRaw = (docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT id, scheduled_date, scheduled_start_time, status, practitioner_id, room_id FROM appointments ORDER BY created_at DESC LIMIT 1;").Trim()
}

Write-Host "Selected Appointment from DB: $dbAptRaw" -ForegroundColor Green
$parts = $dbAptRaw -split '\|'
$aptId = $parts[0]
$aptDate = $parts[1]
$aptTime = $parts[2]
$aptStatus = $parts[3]
$currentDocId = $parts[4]
$currentRoomId = $parts[5]

Write-Host "Appointment ID: $aptId, Date: $aptDate, Time: $aptTime, Status: $aptStatus, Doctor: $currentDocId, Room: $currentRoomId" -ForegroundColor Cyan

# 3. Test Candidate Doctors Resolution
Write-Host "`n[3] Calling GET /api/v1/admin/appointments/$aptId/candidates/doctors..." -ForegroundColor Yellow
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$docCandRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/appointments/$aptId/candidates/doctors" -Method Get -Headers $headers
$sw.Stop()
Write-Host "Candidate Doctors response received in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
Write-Host ($docCandRes | ConvertTo-Json -Depth 5) -ForegroundColor White

# Assertions for Doctor Candidates
if ($docCandRes.appointmentId -ne $aptId) {
    throw "Doctor candidates result appointmentId mismatch: expected $aptId got $($docCandRes.appointmentId)"
}
$allCandidateDoctors = @()
foreach ($group in $docCandRes.groups) {
    foreach ($doc in $group.doctors) {
        $allCandidateDoctors += $doc
    }
}
Write-Host "Total Candidate Doctors available across $($docCandRes.groups.Count) groups: $($allCandidateDoctors.Count)" -ForegroundColor Green

# 4. Test Candidate Rooms Resolution
Write-Host "`n[4] Calling GET /api/v1/admin/appointments/$aptId/candidates/rooms..." -ForegroundColor Yellow
$sw.Restart()
$roomCandRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/appointments/$aptId/candidates/rooms" -Method Get -Headers $headers
$sw.Stop()
Write-Host "Candidate Rooms response received in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
Write-Host ($roomCandRes | ConvertTo-Json -Depth 5) -ForegroundColor White

$availableRooms = $roomCandRes | Where-Object { $_.isAvailable -eq $true }
Write-Host "Total Rooms: $($roomCandRes.Count), Available Rooms: $($availableRooms.Count)" -ForegroundColor Green

# 5. Test Change Doctor Mutation
if ($allCandidateDoctors.Count -gt 0) {
    $targetDoc = $allCandidateDoctors[0]
    Write-Host "`n[5] Testing PATCH /api/v1/admin/appointments/$aptId/doctor to target doctor $($targetDoc.name) ($($targetDoc.id))..." -ForegroundColor Yellow
    
    $patchDocBody = @{
        doctorId = $targetDoc.id
    } | ConvertTo-Json
    
    $sw.Restart()
    $patchDocRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/appointments/$aptId/doctor" -Method Patch -Body $patchDocBody -ContentType "application/json" -Headers $headers
    $sw.Stop()
    Write-Host "Change doctor completed in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
    Write-Host ($patchDocRes | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    # Verify in DB
    $dbDocCheck = (docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT practitioner_id FROM appointments WHERE id = '$aptId';").Trim()
    if ($dbDocCheck -eq $targetDoc.id) {
        Write-Host "DB VERIFIED: appointments.practitioner_id correctly updated to $($targetDoc.id)" -ForegroundColor Green
    } else {
        throw "DB MISMATCH: Expected practitioner_id $($targetDoc.id) but found $dbDocCheck"
    }
} else {
    Write-Host "No candidate doctor available to reassign." -ForegroundColor Yellow
}

# 6. Test Change Room Mutation
if ($availableRooms.Count -gt 0) {
    $targetRoom = $availableRooms | Where-Object { $_.id -ne $currentRoomId } | Select-Object -First 1
    if (-not $targetRoom) {
        $targetRoom = $availableRooms[0]
    }
    Write-Host "`n[6] Testing PATCH /api/v1/admin/appointments/$aptId/room to target room $($targetRoom.name) ($($targetRoom.id))..." -ForegroundColor Yellow
    
    $patchRoomBody = @{
        roomId = $targetRoom.id
    } | ConvertTo-Json
    
    $sw.Restart()
    $patchRoomRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/appointments/$aptId/room" -Method Patch -Body $patchRoomBody -ContentType "application/json" -Headers $headers
    $sw.Stop()
    Write-Host "Change room completed in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
    Write-Host ($patchRoomRes | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    # Verify in DB
    $dbRoomCheck = (docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT room_id FROM appointments WHERE id = '$aptId';").Trim()
    if ($dbRoomCheck -eq $targetRoom.id) {
        Write-Host "DB VERIFIED: appointments.room_id correctly updated to $($targetRoom.id)" -ForegroundColor Green
    } else {
        throw "DB MISMATCH: Expected room_id $($targetRoom.id) but found $dbRoomCheck"
    }
} else {
    Write-Host "No available room to reassign." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " ALL REAL BACKEND ASSIGNMENT TESTS PASSED!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
