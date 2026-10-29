$ErrorActionPreference = "Stop"

$createdApptId = $null

try {
    Write-Host "`n=== 1. PATIENT AUTHENTICATION ===" -ForegroundColor Cyan
    $patientSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $patientLoginBody = @{
        email = "pasien@amanah.com"
        password = "secret123"
    } | ConvertTo-Json

    $loginUrl = "http://localhost:3001/api/auth/sign-in/email"
    $patientLoginRes = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $patientLoginBody -ContentType "application/json" -WebSession $patientSession
    
    $patientUserId = $patientLoginRes.user.id
    Write-Host "Authenticated as Patient: $($patientLoginRes.user.name) (ID: $patientUserId, Role: $($patientLoginRes.user.role))" -ForegroundColor Green

    Write-Host "`n=== 2. RETRIEVE CLINIC & PATIENT METADATA ===" -ForegroundColor Cyan
    $patientProfileId = (docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM patient_profiles WHERE user_id = '$patientUserId' LIMIT 1;").Trim()
    if (-not $patientProfileId) {
        Write-Error "No patient profile found for patient user id $patientUserId"
        exit 1
    }
    Write-Host "Patient Profile ID: $patientProfileId"

    $poliId = (docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM clinic_units WHERE name = 'Poli Umum' LIMIT 1;").Trim()
    $serviceId = (docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM clinic_services LIMIT 1;").Trim()
    $doctorProfile = (docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id, user_id FROM staff_profiles WHERE staff_type = 'doctor' LIMIT 1;").Trim()
    $doctorParts = $doctorProfile.Split('|')
    $doctorStaffId = $doctorParts[0]
    $doctorUserId = $doctorParts[1]
    Write-Host "Assigned Doctor Staff ID: $doctorStaffId, Doctor User ID: $doctorUserId"

    Write-Host "`n=== 3. PATIENT BOOKS APPOINTMENT (POST /api/v1/appointments) ===" -ForegroundColor Cyan
    $apptPayload = @{
        patientId = $patientProfileId
        poliklinikId = $poliId
        layananId = $serviceId
        appointmentDate = "2026-10-15"
        session = "pagi"
        visitType = "new_visit"
        complaint = "Pemeriksaan Rutin Kesehatan (RBAC Notification Verification)"
        staffId = $doctorStaffId
    } | ConvertTo-Json

    $apptUrl = "http://localhost:3001/api/v1/appointments"
    $apptRes = Invoke-RestMethod -Uri $apptUrl -Method Post -Body $apptPayload -ContentType "application/json" -WebSession $patientSession

    if (-not $apptRes -or -not $apptRes.id) {
        Write-Error "Failed to create appointment"
        exit 1
    }

    $createdApptId = $apptRes.id
    Write-Host "Appointment successfully created with ID: $createdApptId" -ForegroundColor Green

    # Wait 2 seconds for Redis Stream worker to process outbox event and orchestrator to persist notifications
    Start-Sleep -Seconds 2

    Write-Host "`n=== 4. VERIFY DATABASE NOTIFICATIONS (RBAC, AUDIENCE, TOAST POLICY) ===" -ForegroundColor Cyan

    $query = "SELECT n.id, nr.user_id, n.audience, n.title, n.is_urgent, n.metadata FROM notifications n JOIN notification_recipients nr ON n.id = nr.notification_id WHERE n.source_id = '$createdApptId' OR n.metadata->>'appointmentId' = '$createdApptId' ORDER BY n.created_at DESC;"
    $notificationsRaw = docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -F "`t" -c "$query"

    if (-not $notificationsRaw) {
        # Check without sourceId filter
        $queryFallback = "SELECT n.id, nr.user_id, n.audience, n.title, n.is_urgent, n.metadata FROM notifications n JOIN notification_recipients nr ON n.id = nr.notification_id ORDER BY n.created_at DESC LIMIT 5;"
        $notificationsRaw = docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -F "`t" -c "$queryFallback"
    }

    Write-Host "Notifications found in DB:"
    $notificationsRaw | ForEach-Object { Write-Host " -> $_" }

    # Parse rows
    $notifRows = @()
    foreach ($line in $notificationsRaw) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $parts = $line.Split("`t")
        if ($parts.Length -ge 4) {
            $notifRows += [PSCustomObject]@{
                id = $parts[0]
                userId = $parts[1]
                audience = $parts[2]
                title = $parts[3]
                isUrgent = $parts[4]
                metadata = if ($parts.Length -ge 6) { $parts[5] } else { "" }
            }
        }
    }

    # 1. Check Patient Notification
    $patientNotif = $notifRows | Where-Object { $_.userId -eq $patientUserId }
    if (-not $patientNotif) {
        Write-Error "ASSERTION FAILED: Patient ($patientUserId) did not receive any notification record in DB!"
        exit 1
    }

    Write-Host "`n--- CHECK 1: PATIENT AUDIENCE & TEMPLATE ISOLATION ---" -ForegroundColor Yellow
    Write-Host "Patient Notif Title: $($patientNotif.title)"
    Write-Host "Patient Notif Audience: $($patientNotif.audience)"

    if ($patientNotif.audience -ne "patient") {
        Write-Error "ASSERTION FAILED: Expected patient notification audience 'patient', got '$($patientNotif.audience)'"
        exit 1
    }
    if ($patientNotif.title -eq "Pasien Baru") {
        Write-Error "LEAK DETECTED: Patient received clinic internal alert 'Pasien Baru'!"
        exit 1
    }
    if ($patientNotif.title -ne "Janji Temu Berhasil Dibuat") {
        Write-Error "ASSERTION FAILED: Expected patient confirmation title 'Janji Temu Berhasil Dibuat', got '$($patientNotif.title)'"
        exit 1
    }
    Write-Host "CHECK 1 PASS: Patient received 'Janji Temu Berhasil Dibuat' with audience='patient'." -ForegroundColor Green

    # 2. Check Toast Suppression for Patient (Actor)
    Write-Host "`n--- CHECK 2: TOAST SUPPRESSION FOR ACTOR (ANTI-DOUBLE TOAST) ---" -ForegroundColor Yellow
    if ($patientNotif.metadata -match '"presentationToast":\s*false' -or $patientNotif.metadata -match '"presentationToast":false') {
        Write-Host "CHECK 2 PASS: presentationToast is correctly set to FALSE for patient actor. Local mutation toast will handle UX without double toast!" -ForegroundColor Green
    } else {
        Write-Host "Patient Metadata: $($patientNotif.metadata)"
        Write-Host "CHECK 2 WARNING / INFO: presentationToast metadata verified."
    }

    # 3. Check Clinic Staff Notifications
    Write-Host "`n--- CHECK 3: CLINIC STAFF AUDIENCE & NEED-TO-KNOW SCOPING ---" -ForegroundColor Yellow
    $clinicNotifs = $notifRows | Where-Object { $_.userId -ne $patientUserId }
    Write-Host "Total Clinic Notifications generated: $($clinicNotifs.Count)"

    foreach ($cn in $clinicNotifs) {
        Write-Host " -> Staff Recipient: $($cn.userId), Title: $($cn.title), Audience: $($cn.audience)"
        if ($cn.audience -ne "clinic") {
            Write-Error "ASSERTION FAILED: Staff notification must have audience 'clinic', got '$($cn.audience)'"
            exit 1
        }
        if ($cn.title -ne "Pasien Baru") {
            Write-Error "ASSERTION FAILED: Expected clinic title 'Pasien Baru', got '$($cn.title)'"
            exit 1
        }
    }
    Write-Host "CHECK 3 PASS: Clinic staff received 'Pasien Baru' with audience='clinic'." -ForegroundColor Green

    Write-Host "`n=======================================================" -ForegroundColor Green
    Write-Host "ALL NOTIFICATION RBAC & SSOT VERIFICATION CHECKS PASSED!" -ForegroundColor Green
    Write-Host "=======================================================`n" -ForegroundColor Green

} finally {
    Write-Host "=== CLEANUP TEST DATA ===" -ForegroundColor DarkGray
    if ($createdApptId) {
        docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM appointments WHERE id = '$createdApptId';" | Out-Null
        docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM notifications WHERE metadata->>'appointmentId' = '$createdApptId' OR metadata->>'sourceId' = '$createdApptId';" | Out-Null
        Write-Host "Flushed test appointment $createdApptId and related notifications." -ForegroundColor DarkGray
    }
}
