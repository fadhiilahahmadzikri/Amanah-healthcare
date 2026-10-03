$ErrorActionPreference = "Stop"

$childPatientId = $null
$appointmentId = $null

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $loginBody = @{
        email = "admin@amanah.com"
        password = "secret123"
    } | ConvertTo-Json

    $loginUrl = "http://localhost:3001/api/auth/sign-in/email"
    $loginRes = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
    Write-Output "STEP 0: Authenticated as $($loginRes.user.email)"

    $testNik = "3201998877660001"
    $childPayload = @{
        name = "Budi Pratama Canonical Test"
        nik = $testNik
        birth_date = "2023-06-15"
        tempat_lahir = "Bandung"
        gender = "Laki-laki"
        blood_type = "Belum Tahu"
        nama_ibu_kandung = "Siti Rahayu"
        relationship_type = "child"
        phone = "081234567890"
        alamat_detail = "Jl. Cisitu Indah No 12"
    } | ConvertTo-Json

    $affilUrl = "http://localhost:3001/api/v1/patients/affiliations"
    $affilRes = Invoke-RestMethod -Uri $affilUrl -Method Post -Body $childPayload -ContentType "application/json" -WebSession $session

    if (-not $affilRes -or -not $affilRes.data.patientId) {
        Write-Error "Failed to create patient affiliation for child"
        exit 1
    }

    $childPatientId = $affilRes.data.patientId
    Write-Output "STEP 1: Created child affiliation. Patient ID: $childPatientId"

    $poliId = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM clinic_units WHERE name = 'Poli Umum' LIMIT 1;").Trim()
    $serviceId = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM clinic_services WHERE medical_flow IS NULL LIMIT 1;").Trim()

    $apptPayload = @{
        patientId = $childPatientId
        poliklinikId = $poliId
        layananId = $serviceId
        appointmentDate = "2026-10-10"
        session = "PAGI"
        visitType = "Pemeriksaan Baru"
        complaint = "Pemeriksaan Rekam Jantung (ECG)"
    } | ConvertTo-Json

    $apptUrl = "http://localhost:3001/api/v1/appointments"
    $apptRes = Invoke-RestMethod -Uri $apptUrl -Method Post -Body $apptPayload -ContentType "application/json" -WebSession $session

    if (-not $apptRes -or -not $apptRes.id) {
        Write-Error "Failed to create regular appointment"
        exit 1
    }

    $appointmentId = $apptRes.id
    Write-Output "STEP 2: Created regular appointment with ID: $appointmentId"

    $unifiedUrl = "http://localhost:3001/api/v1/medical-records/intakes/by-appointment/$appointmentId"
    $unifiedRes = Invoke-RestMethod -Uri $unifiedUrl -Method Get -WebSession $session

    if (-not $unifiedRes -or -not $unifiedRes.data) {
        Write-Error "Unified intake returned empty response"
        exit 1
    }

    $patient = $unifiedRes.data.patient
    if (-not $patient) {
        Write-Error "Unified intake for regular appointment does not contain patient object!"
        exit 1
    }

    Write-Output "STEP 3: Received Unified Intake response. Verifying patient demographics..."
    Write-Output "Patient Full Name: $($patient.fullName)"
    Write-Output "Patient MRN: $($patient.medicalRecordNumber)"
    Write-Output "Patient NIK: $($patient.nik)"
    Write-Output "Patient Blood Type: $($patient.bloodType)"
    Write-Output "Patient Email: $($patient.email)"
    Write-Output "Patient Phone: $($patient.phone)"

    if ($patient.nik -ne $testNik) {
        Write-Error "ASSERTION FAILED: Expected NIK '$testNik', but got '$($patient.nik)'"
        exit 1
    }

    if ($patient.fullName -ne "Budi Pratama Canonical Test") {
        Write-Error "ASSERTION FAILED: Full Name mismatch"
        exit 1
    }

    if ($patient.bloodType -ne "Belum Tahu") {
        Write-Error "ASSERTION FAILED: Expected initial blood type 'Belum Tahu', got '$($patient.bloodType)'"
        exit 1
    }

    if ($patient.email -ne "admin@amanah.com") {
        Write-Error "ASSERTION FAILED: Expected inherited email 'admin@amanah.com', got '$($patient.email)'"
        exit 1
    }

    if ($patient.phone -ne "081234567890") {
        Write-Error "ASSERTION FAILED: Expected phone '081234567890', got '$($patient.phone)'"
        exit 1
    }

    Write-Output "STEP 3 PASS: Canonical patient NIK, email inheritance, and demographics verified in regular appointment view!"

    Write-Output "STEP 4: Testing safe bi-directional profile enrichment (Updating Blood Type to 'O' and explicit email)..."
    $enrichPayload = @{
        name = "Budi Pratama Canonical Test"
        nik = $testNik
        birth_date = "2023-06-15"
        gender = "Laki-laki"
        blood_type = "O"
        email = "budi.child@test.com"
        relationship_type = "child"
    } | ConvertTo-Json

    $enrichRes = Invoke-RestMethod -Uri $affilUrl -Method Post -Body $enrichPayload -ContentType "application/json" -WebSession $session
    $recheckRes = Invoke-RestMethod -Uri $unifiedUrl -Method Get -WebSession $session

    Write-Output "Enriched Patient Blood Type: $($recheckRes.data.patient.bloodType)"
    Write-Output "Enriched Patient Email: $($recheckRes.data.patient.email)"
    if ($recheckRes.data.patient.bloodType -ne "O") {
        Write-Error "ASSERTION FAILED: Blood Type was not enriched to 'O'"
        exit 1
    }
    if ($recheckRes.data.patient.email -ne "budi.child@test.com") {
        Write-Error "ASSERTION FAILED: Email was not enriched to 'budi.child@test.com'"
        exit 1
    }
    Write-Output "STEP 4 PASS: Bi-directional enrichment successfully updated profile blood type and email!"
    Write-Output "ALL VERIFICATION CHECKS PASSED 100%!"
} finally {
    Write-Output "STEP 5: Cleaning up test records from database..."
    if ($appointmentId) {
        docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM appointments WHERE id = '$appointmentId';" | Out-Null
    }
    if ($childPatientId) {
        docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM patient_affiliations WHERE patient_id = '$childPatientId'; DELETE FROM patient_profiles WHERE id = '$childPatientId';" | Out-Null
    }
    docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM patient_affiliations WHERE patient_id IN (SELECT id FROM patient_profiles WHERE national_id_hash = '3201998877660001'); DELETE FROM patient_profiles WHERE national_id_hash = '3201998877660001';" | Out-Null
    Write-Output "STEP 5 PASS: Database test records cleanly flushed."
}
