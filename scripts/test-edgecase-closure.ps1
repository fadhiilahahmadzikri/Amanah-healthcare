$loginUrl = "http://localhost:3001/api/v1/auth/email/login"
$loginBody = @{
    email = "admin@amanah.com"
    password = "secret123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Find an appointment with session
$dbOutput = docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT id, practitioner_id, schedule_session_id FROM appointments WHERE status NOT IN ('cancelled', 'completed') AND schedule_session_id IS NOT NULL LIMIT 1;"
$dbOutput = $dbOutput.Trim()
if (-not $dbOutput) {
    # If none found with session, pick any active appointment
    $dbOutput = (docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT id, practitioner_id, COALESCE(schedule_session_id, '') FROM appointments WHERE status NOT IN ('cancelled', 'completed') LIMIT 1;").Trim()
}

$parts = $dbOutput -split '\|'
$aptId = $parts[0]
$oldDoc = $parts[1]
$oldSess = $parts[2]

Write-Host "Selected Appointment: $aptId, Old Doc: $oldDoc, Old Session: $oldSess"

# Fetch candidates
$candUrl = "http://localhost:3001/api/v1/admin/appointments/$aptId/candidates/doctors"
$cands = Invoke-RestMethod -Uri $candUrl -Headers $headers
$targetDoc = $cands.groups[0].doctors[0].id
$targetDocName = $cands.groups[0].doctors[0].name
Write-Host "Reassigning to Target Doctor: $targetDocName ($targetDoc) with closeOldSchedule = true..."

# Execute PATCH
$patchUrl = "http://localhost:3001/api/v1/admin/appointments/$aptId/doctor"
$patchBody = @{
    doctorId = $targetDoc
    closeOldSchedule = $true
    reason = "Dokter berhalangan hadir mendadak"
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri $patchUrl -Method Patch -Headers $headers -Body $patchBody
Write-Host "PATCH Success! Updated Doctor: $($res.doctorName)"

# Verify PostgreSQL
if ($oldSess) {
    $sessCheck = docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT status, available_slots FROM practitioner_schedule_sessions WHERE id = '$oldSess';"
    Write-Host "Old Session DB Status: $sessCheck"
}

$auditCheck = docker compose -f "../Amanah-healthcare-backend/docker-compose.yaml" exec -T postgres psql -U amanah -d amanah_healthcare -t -A -c "SELECT reason FROM appointment_status_events WHERE appointment_id = '$aptId' ORDER BY created_at DESC LIMIT 1;"
Write-Host "Latest Audit Event Reason: $auditCheck"
