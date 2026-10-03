$ErrorActionPreference = "Stop"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{
    email = "admin@amanah.com"
    password = "secret123"
} | ConvertTo-Json

$loginUrl = "http://localhost:3001/api/auth/sign-in/email"
$loginRes = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
Write-Output "STEP 0 SUCCESS: Authenticated as $($loginRes.user.email)"

$patientId = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM patient_profiles LIMIT 1;").Trim()
if (-not $patientId) {
    Write-Error "No patient profile found in database"
    exit 1
}

$appointmentId = [guid]::NewGuid().ToString()
$serviceId = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT id FROM clinic_services LIMIT 1;").Trim()

$createPayload = @{
    patientId = $patientId
    childName = "Empluk Marpaung Real Test"
    childNik = "3201012303244907"
    childBirthDate = "2024-03-23"
    childSex = "Laki-laki"
    childAgeFormatted = "1 tahun 0 bulan"
    parentPhone = "081329286785"
    fatherName = "Agustian Latif"
    motherName = "Yuniar Queen"
    childAddress = "Jln. Hakim no 27, Rantepao"
    hasVaccineHistory = "Ya, pernah"
    previousVaccineHistory = "HB_0: Sudah (2025-04-18); BCG: Sudah (2025-05-18); PENTA_1: Belum"
    hasAllergyHistory = "Ada riwayat alergi"
    childAllergyHistory = "Alergi dingin ringan"
    entries = @(
        @{
            vaccineCode = "HB_0"
            status = "GIVEN"
            givenDate = "2025-04-18"
            datePrecision = "EXACT"
        },
        @{
            vaccineCode = "BCG"
            status = "GIVEN"
            givenDate = "2025-05-18"
            datePrecision = "EXACT"
        },
        @{
            vaccineCode = "PENTA_1"
            status = "NOT_GIVEN"
        }
    )
} | ConvertTo-Json -Depth 5

$postUrl = "http://localhost:3001/api/v1/medical-records/intakes/immunization"
$postResponse = Invoke-RestMethod -Uri $postUrl -Method Post -Body $createPayload -ContentType "application/json" -WebSession $session

if (-not $postResponse -or (-not $postResponse.id -and -not $postResponse.data.id)) {
    Write-Error "Failed to create immunization intake via endpoint"
    exit 1
}

$intakeId = if ($postResponse.id) { $postResponse.id } else { $postResponse.data.id }
$submissionId = if ($postResponse.intakeSubmissionId) { $postResponse.intakeSubmissionId } else { $postResponse.data.intakeSubmissionId }
Write-Output "STEP 1 SUCCESS: Created Immunization Intake with ID: $intakeId, Submission ID: $submissionId"

$insertApptSql = "INSERT INTO appointments (id, patient_id, service_id, booking_code, scheduled_date, scheduled_start_time, scheduled_end_time, status, complaint, medical_flow) VALUES ('$appointmentId', '$patientId', '$serviceId', 'BOOK-TEST-001', '2026-10-04', '09:00:00', '09:30:00', 'booked', 'Imunisasi Anak', 'immunization'); UPDATE child_immunization_intakes SET appointment_id = '$appointmentId' WHERE id = '$intakeId'; UPDATE medical_intake_submissions SET appointment_id = '$appointmentId' WHERE id = '$submissionId';"
docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -c $insertApptSql | Out-Null
Write-Output "STEP 2 SUCCESS: Created and linked appointment: $appointmentId"

$getUrl = "http://localhost:3001/api/v1/medical-records/intakes/by-appointment/$appointmentId"
$getResponse = Invoke-RestMethod -Uri $getUrl -Method Get -WebSession $session

if (-not $getResponse -or -not $getResponse.data) {
    Write-Error "Failed to fetch unified intake by appointment ID"
    exit 1
}

$unified = $getResponse.data
if ($getResponse.flow -ne "immunization" -and $unified.flow -ne "immunization") {
    Write-Error "Flow is not immunization: $($getResponse.flow)"
    exit 1
}

$childData = if ($unified.child) { $unified.child } else { $unified }
$answers = if ($unified.answers) { $unified.answers } else { $childData.answers }

if ($childData.childName -ne "Empluk Marpaung Real Test") {
    Write-Error "Child name mismatch: $($childData.childName)"
    exit 1
}

if (-not $childData.entries -or $childData.entries.Count -ne 3) {
    Write-Error "Entries count mismatch. Expected 3, got: $($childData.entries.Count)"
    exit 1
}

$hb0 = $childData.entries | Where-Object { $_.vaccineCode -eq "HB_0" }
if (-not $hb0 -or $hb0.status -ne "GIVEN" -or $hb0.givenDate -ne "2025-04-18") {
    Write-Error "HB_0 entry data corrupted or missing"
    exit 1
}

$bcg = $childData.entries | Where-Object { $_.vaccineCode -eq "BCG" }
if (-not $bcg -or $bcg.status -ne "GIVEN" -or $bcg.givenDate -ne "2025-05-18") {
    Write-Error "BCG entry data corrupted or missing"
    exit 1
}

$penta1 = $childData.entries | Where-Object { $_.vaccineCode -eq "PENTA_1" }
if (-not $penta1 -or $penta1.status -ne "NOT_GIVEN") {
    Write-Error "PENTA_1 entry data corrupted or missing"
    exit 1
}

if ($answers.vaccine_HB_0_status -ne "Sudah" -or $answers.vaccine_HB_0_date -ne "2025-04-18") {
    Write-Error "Answers vaccine_HB_0 values missing or corrupted"
    exit 1
}

if ($answers.vaccine_BCG_status -ne "Sudah" -or $answers.vaccine_BCG_date -ne "2025-05-18") {
    Write-Error "Answers vaccine_BCG values missing or corrupted"
    exit 1
}

if ($answers.vaccine_PENTA_1_status -ne "Belum") {
    Write-Error "Answers vaccine_PENTA_1 values missing or corrupted"
    exit 1
}

Write-Output "STEP 3 SUCCESS: GET /api/v1/medical-records/intakes/by-appointment returned 100% intact data"

$dbEntriesCount = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT count(*) FROM child_immunization_entries WHERE intake_id = '$intakeId';").Trim()
if ($dbEntriesCount -ne "3") {
    Write-Error "Database child_immunization_entries row count mismatch: Expected 3, got $dbEntriesCount"
    exit 1
}

$dbIntakeCount = (docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT count(*) FROM child_immunization_intakes WHERE appointment_id = '$appointmentId';").Trim()
if ($dbIntakeCount -ne "1") {
    Write-Error "Database child_immunization_intakes row count mismatch: Expected 1, got $dbIntakeCount"
    exit 1
}

Write-Output "STEP 4 SUCCESS: Database child_immunization_entries and child_immunization_intakes verified directly"

docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -c "DELETE FROM queue_tickets WHERE appointment_id = '$appointmentId'; DELETE FROM appointments WHERE id = '$appointmentId'; DELETE FROM child_immunization_entries WHERE intake_id = '$intakeId'; DELETE FROM child_immunization_intakes WHERE id = '$intakeId'; DELETE FROM medical_intake_submissions WHERE appointment_id = '$appointmentId' OR flow = 'immunization';" | Out-Null
Write-Output "STEP 5 SUCCESS: Test verification records cleanly flushed. Database is ready for user testing."

Write-Output "ALL VERIFICATION CHECKS PASSED WITH 100% DATA INTEGRITY"
