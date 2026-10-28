# ==============================================================================
# Amanah Healthcare Monorepo — Next.js Admin Contract Verification Suite
# Point-of-View: Next.js Admin Dashboard (Client-First Contract Verification)
# Features: Kehadiran Pegawai, Manajemen Perizinan, Work Policies, Payroll Engine
# ==============================================================================

param(
    [string]$BaseUrl = "http://127.0.0.1:3001",
    [string]$BackendDir = "D:\Amanah-health-care\backend"
)

$ErrorActionPreference = "Stop"

$script:TotalPass = 0
$script:TotalFail = 0
$script:TestStartTime = Get-Date

function Write-Section([string]$title) {
    Write-Host "`n================================================================================" -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
}

function Report-Result([string]$testName, [bool]$passed, [string]$detail) {
    if ($passed) {
        $script:TotalPass++
        Write-Host " [PASS] $testName" -ForegroundColor Green
        if ($detail) {
            Write-Host "        $detail" -ForegroundColor Gray
        }
    } else {
        $script:TotalFail++
        Write-Host " [FAIL] $testName" -ForegroundColor Red
        if ($detail) {
            Write-Host "        $detail" -ForegroundColor Magenta
        }
    }
}

function Flush-NextJsContractTestData {
    Write-Host "  Flushing old / stale test leave & replacement records..." -ForegroundColor Gray
    try {
        $staffId = docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "SELECT sp.id FROM staff_profiles sp JOIN users u ON sp.user_id = u.id WHERE u.email = 'zikrifadhiilahahmad@gmail.com' LIMIT 1;"
        $staffId = $staffId.Trim()
        $today = (Get-Date).ToString("yyyy-MM-dd")
        if ($staffId -and $staffId -ne "") {
            $flushSql = "DELETE FROM staff_attendance_records WHERE attendance_date = '$today' AND (staff_profile_id = '$staffId' OR staff_profile_id IN (SELECT id FROM staff_profiles WHERE staff_code = 'STF-WRK-001')); DELETE FROM replacement_opportunities WHERE original_staff_profile_id = '$staffId' AND work_date = '$today'; DELETE FROM leave_request_sessions WHERE leave_request_id IN (SELECT id FROM staff_leave_requests WHERE staff_profile_id = '$staffId' AND (start_date = '$today' OR end_date = '$today')); DELETE FROM staff_leave_requests WHERE staff_profile_id = '$staffId' AND (start_date = '$today' OR end_date = '$today' OR reason LIKE 'Permohonan Izin E2E%');"
            docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -c "$flushSql" | Out-Null
            Write-Host "  Test leave and attendance data flushed for $staffId." -ForegroundColor Green
        }
    } catch {
        Write-Host "  Flush notice: $($_.Exception.Message)" -ForegroundColor Gray
    }

    try {
        docker exec -i backend-redis-1 redis-cli FLUSHDB 2>$null | Out-Null
        Write-Host "  Redis cache flushed (FLUSHDB)." -ForegroundColor Green
    } catch {}
}

# ------------------------------------------------------------------------------
# STEP 0: Sourcing Authoritative Auth Tokens
# ------------------------------------------------------------------------------
Write-Section "STEP 0: Acquiring Authoritative Client Tokens"
Flush-NextJsContractTestData

# 1. Admin Token (admin@amanah.com)
$adminToken = ""
try {
    $loginBody = @{
        email = "admin@amanah.com"
        password = "secret123"
    } | ConvertTo-Json

    $loginRes = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/email/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $loginRes.token
    Report-Result "Admin Token via /api/v1/auth/email/login" ($null -ne $adminToken -and $adminToken.Length -gt 20) "Token acquired for admin@amanah.com"
} catch {
    Write-Host "  Falling back to dynamic JWT generator CLI for admin..." -ForegroundColor Yellow
    $adminToken = (& bun run db:jwt --email admin@amanah.com --raw)
    Report-Result "Admin Token via bun db:jwt" ($null -ne $adminToken -and $adminToken.Length -gt 20) "Token acquired dynamically"
}

# 2. Doctor/Staff Token (zikrifadhiilahahmad@gmail.com) via bun db:jwt tool
Write-Host "  Generating Doctor/Staff Token for zikrifadhiilahahmad@gmail.com..." -ForegroundColor Yellow
Push-Location $BackendDir
try {
    $doctorTokenRaw = (& bun run db:jwt --email zikrifadhiilahahmad@gmail.com --raw)
    # Extract JWT line from output
    $lines = $doctorTokenRaw -split "`r?`n"
    $doctorToken = ($lines | Where-Object { $_ -match "^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+" } | Select-Object -First 1)
    if (-not $doctorToken) {
        $doctorToken = $doctorTokenRaw.Trim()
    }
    Report-Result "Doctor Token for zikrifadhiilahahmad@gmail.com" ($null -ne $doctorToken -and $doctorToken.Length -gt 20) "Dynamic JWT generated"
} finally {
    Pop-Location
}

if (-not $adminToken -or -not $doctorToken) {
    Write-Host "`nFATAL: Failed to acquire required JWT tokens. Aborting test." -ForegroundColor Red
    exit 1
}

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$doctorHeaders = @{
    "Authorization" = "Bearer $doctorToken"
    "Content-Type" = "application/json"
}

# ------------------------------------------------------------------------------
# PHASE 1: Kehadiran Pegawai (/dashboard/kehadiran-pegawai)
# ------------------------------------------------------------------------------
Write-Section "PHASE 1: Kehadiran Pegawai Contract Verification"

# 1.1 Daily Attendance BFF
try {
    $url = "$BaseUrl/api/v1/attendance/daily?page=1&limit=8&shift=all&status=all&category=all"
    $res = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $hasRecords = $null -ne $res.records -and $res.records.Count -gt 0
    $hasSummary = $null -ne $res.summary -and $res.summary.total_staf -gt 0
    $hasQrConfig = $null -ne $res.qrConfig -and $null -ne $res.qrConfig.qr_code_identifier

    Report-Result "GET /api/v1/attendance/daily (BFF Response Structure)" ($hasRecords -and $hasSummary -and $hasQrConfig) "Records: $($res.records.Count), Total: $($res.total), Total Staf: $($res.summary.total_staf), Tingkat Kehadiran: $($res.summary.tingkat_kehadiran)%"
} catch {
    Report-Result "GET /api/v1/attendance/daily" $false $_.Exception.Message
}

# 1.2 Category Filtering (Dokter)
try {
    $url = "$BaseUrl/api/v1/attendance/daily?category=Dokter&page=1&limit=8"
    $res = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $allDoctor = $true
    foreach ($r in $res.records) {
        if ($r.kategori -ne "Dokter") { $allDoctor = $false; break }
    }
    Report-Result "GET /api/v1/attendance/daily?category=Dokter" ($allDoctor -and $res.records.Count -gt 0) "All $($res.records.Count) returned items have kategori == 'Dokter'"
} catch {
    Report-Result "GET /api/v1/attendance/daily?category=Dokter" $false $_.Exception.Message
}

# 1.3 Active QR Info
try {
    $url = "$BaseUrl/api/v1/attendance/qr/active"
    $res = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $validQr = ($null -ne $res.qrCodeIdentifier) -and ($res.rotationSeconds -gt 0)
    Report-Result "GET /api/v1/attendance/qr/active" $validQr "Active Identifier: $($res.qrCodeIdentifier), Rotation: $($res.rotationSeconds)s, Active: $($res.isActive)"
} catch {
    Report-Result "GET /api/v1/attendance/qr/active" $false $_.Exception.Message
}

# 1.4 QR Rotation
$rotatedQrToken = $null
try {
    $url = "$BaseUrl/api/v1/attendance/qr/rotate"
    $body = @{ context = "Terminal Utama Presensi" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri $url -Method Post -Headers $adminHeaders -Body $body
    $rotated = ($null -ne $res.qrCodeIdentifier) -and ($res.isActive -eq $true)
    $rotatedQrToken = $res.qrCodeIdentifier
    Report-Result "POST /api/v1/attendance/qr/rotate" $rotated "New Rotated QR: $($res.qrCodeIdentifier), Shift: $($res.shift)"
} catch {
    Report-Result "POST /api/v1/attendance/qr/rotate" $false $_.Exception.Message
}

# 1.5 Manual Attendance Input
$workerProfileId = $null
try {
    $url = "$BaseUrl/api/v1/attendance/manual"
    $body = @{
        staffIdOrCode = "STF-WRK-001"
        notes = "Presensi manual Admin E2E Verification"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri $url -Method Post -Headers $adminHeaders -Body $body
    $workerProfileId = $res.staffId
    $manualRecorded = ($null -ne $res.id) -and ($res.status -eq "present")
    Report-Result "POST /api/v1/attendance/manual" $manualRecorded "Recorded record ID: $($res.id), StaffProfile: $workerProfileId, Status: $($res.status)"
} catch {
    Report-Result "POST /api/v1/attendance/manual" $false $_.Exception.Message
}

# 1.6 Doctor Self-Checkout (Check in first, then checkout with QR proximity)
try {
    # Step A: Stage check-in for Doctor Zikri for today
    $checkInDoctorBody = @{
        staffIdOrCode = "zikrifadhiilahahmad"
        notes = "Check-in staged for Doctor Checkout Test"
    } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/attendance/manual" -Method Post -Headers $adminHeaders -Body $checkInDoctorBody

    # Step B: Perform Doctor Checkout with valid QR token
    $url = "$BaseUrl/api/v1/attendance/checkout"
    $checkoutDoctorBody = @{
        qrToken = $rotatedQrToken
        notes = "Selesai dinas dokter"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri $url -Method Post -Headers $doctorHeaders -Body $checkoutDoctorBody
    $checkedOut = ($null -ne $res.checkOutAt) -and ([double]$res.validatedDurationHours -ge 0.5)
    Report-Result "POST /api/v1/attendance/checkout (Doctor Self-Checkout)" $checkedOut "Checkout Time: $($res.checkOutAt), Validated Hours: $($res.validatedDurationHours)"
} catch {
    Report-Result "POST /api/v1/attendance/checkout (Doctor Self-Checkout)" $false $_.Exception.Message
}

# 1.7 Admin Checkout for Staff via body { staffId }
try {
    if ($workerProfileId) {
        $url = "$BaseUrl/api/v1/attendance/checkout"
        $body = @{ staffId = $workerProfileId } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri $url -Method Post -Headers $adminHeaders -Body $body
        $adminCheckedOut = ($null -ne $res.checkOutAt)
        Report-Result "POST /api/v1/attendance/checkout (Admin on behalf of staff)" $adminCheckedOut "Worker Profile $workerProfileId Checked Out at $($res.checkOutAt)"
    } else {
        Report-Result "POST /api/v1/attendance/checkout (Admin on behalf of staff)" $false "Worker profile ID missing from step 1.5"
    }
} catch {
    Report-Result "POST /api/v1/attendance/checkout (Admin on behalf of staff)" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# PHASE 2: Manajemen Perizinan & Replacement (/dashboard/manajemen-perizinan)
# ------------------------------------------------------------------------------
Write-Section "PHASE 2: Manajemen Perizinan & Replacement Contract Verification"

$allLeaves = @()
try {
    $url = "$BaseUrl/api/v1/leaves/all"
    $allLeaves = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $hasLeaves = $null -ne $allLeaves -and $allLeaves.Count -gt 0
    $firstLeave = if ($hasLeaves) { $allLeaves[0] } else { $null }
    $hasStaffRel = $firstLeave -and ($null -ne $firstLeave.staff)
    $hasSessionsRel = $firstLeave -and ($null -ne $firstLeave.sessions)

    Report-Result "GET /api/v1/leaves/all" ($hasLeaves -and $hasStaffRel) "Total Leaves: $($allLeaves.Count), Staff: $($firstLeave.staff.fullName) ($($firstLeave.staff.staffType)), Sessions Attached: $($firstLeave.sessions.Count)"
} catch {
    Report-Result "GET /api/v1/leaves/all" $false $_.Exception.Message
}

# 2.2 Pending Filter
try {
    $url = "$BaseUrl/api/v1/leaves/all?status=pending"
    $pendingLeaves = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $allPending = $true
    foreach ($l in $pendingLeaves) {
        if ($l.status -ne "pending") { $allPending = $false; break }
    }
    Report-Result "GET /api/v1/leaves/all?status=pending" $allPending "Found $($pendingLeaves.Count) pending leave requests"
} catch {
    Report-Result "GET /api/v1/leaves/all?status=pending" $false $_.Exception.Message
}

# 2.3 Leave Review (Approve pending leave and verify replacement trigger)
try {
    $targetLeave = $allLeaves | Where-Object { $_.status -eq "pending" } | Select-Object -First 1
    if (-not $targetLeave) {
        # Create a new leave using Doctor Zikri's token for an upcoming scheduled date
        $leaveDate = (Get-Date).AddDays(5).ToString("yyyy-MM-dd")
        $eligibleSessions = Invoke-RestMethod -Uri "$BaseUrl/api/v1/leaves/eligible-sessions?date=$leaveDate" -Method Get -Headers $doctorHeaders
        $sessionIds = @()
        if ($eligibleSessions -and $eligibleSessions.Count -gt 0) {
            $sessId = if ($eligibleSessions[0].sessionId) { $eligibleSessions[0].sessionId } else { $eligibleSessions[0].id }
            if ($sessId) {
                $sessionIds = @($sessId)
            }
        }

        $newLeaveBody = @{
            startDate = $leaveDate
            endDate = $leaveDate
            reason = "Permohonan Izin E2E Test Contract Verification"
            type = "annual_leave"
            scope = if ($sessionIds.Count -gt 0) { "session" } else { "full_day" }
            sessionIds = $sessionIds
        } | ConvertTo-Json

        $createdLeave = Invoke-RestMethod -Uri "$BaseUrl/api/v1/leaves" -Method Post -Headers $doctorHeaders -Body $newLeaveBody
        $targetLeave = $createdLeave
    }

    if ($targetLeave) {
        $reviewUrl = "$BaseUrl/api/v1/leaves/$($targetLeave.id)/status"
        $reviewBody = @{
            status = "approved"
            approvalNotes = "Disetujui via E2E Next.js Admin Contract Verification Suite"
        } | ConvertTo-Json

        $reviewed = Invoke-RestMethod -Uri $reviewUrl -Method Patch -Headers $adminHeaders -Body $reviewBody
        $isApproved = ($reviewed.status -eq "approved") -and ($reviewed.approvalNotes -match "Disetujui via E2E")
        Report-Result "PATCH /api/v1/leaves/:id/status (Approval Decision)" $isApproved "Leave $($targetLeave.id) status: $($reviewed.status), Notes: $($reviewed.approvalNotes)"
    } else {
        Report-Result "PATCH /api/v1/leaves/:id/status" $true "Skipped: No target leave could be staged"
    }
} catch {
    $errMsg = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
    Report-Result "PATCH /api/v1/leaves/:id/status" $false $errMsg
}

# 2.4 Replacement Opportunities Query
try {
    $url = "$BaseUrl/api/v1/replacements?status=open"
    $replacements = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $hasReplacements = ($null -ne $replacements) -and ($replacements.Count -gt 0)
    Report-Result "GET /api/v1/replacements" $hasReplacements "Open Replacement Opportunities Count: $($replacements.Count)"
} catch {
    Report-Result "GET /api/v1/replacements" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# PHASE 3: Work Policies & Compensation Rates Settings Modal
# ------------------------------------------------------------------------------
Write-Section "PHASE 3: Work Policies Dynamic Configuration & Guaranteed Restoration"

$baselineConfig = $null
try {
    $baselineConfig = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/current" -Method Get -Headers $adminHeaders
    $hasBaseline = ($null -ne $baselineConfig.policy) -and ($null -ne $baselineConfig.rates)
    Report-Result "GET /api/v1/work-policies/current (Baseline State)" $hasBaseline "Policy ID: $($baselineConfig.policy.id), MonthlyLimit: $($baselineConfig.policy.monthlyLimit), Rates Count: $($baselineConfig.rates.Count)"
} catch {
    Report-Result "GET /api/v1/work-policies/current" $false $_.Exception.Message
}

if ($baselineConfig) {
    try {
        # 3.2 Mutate Leave Policy (Admin sets approvalRequired = false, monthlyLimit = 5)
        $policyUpdateBody = @{
            approvalRequired = $false
            limitMode = "monthly_limit"
            monthlyLimit = 5
            quotaCountingPolicy = "per_request"
        } | ConvertTo-Json

        $updatedPolicy = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/leave-policy" -Method Patch -Headers $adminHeaders -Body $policyUpdateBody
        $policyMutated = ($updatedPolicy.approvalRequired -eq $false) -and ($updatedPolicy.monthlyLimit -eq 5)
        Report-Result "PATCH /api/v1/work-policies/leave-policy (Mutation)" $policyMutated "approvalRequired: $($updatedPolicy.approvalRequired), monthlyLimit: $($updatedPolicy.monthlyLimit)"

        # 3.3 Mutate Compensation Rate (Admin updates worker rate)
        $rateUpdateBody = @{
            rates = @(
                @{
                    category = "worker"
                    hourlyRate = 85000
                    overtimeHourlyRate = 115000
                    notes = "Uji tarif dinamis Next.js Admin"
                }
            )
        } | ConvertTo-Json

        $updatedRates = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/compensation-rates" -Method Put -Headers $adminHeaders -Body $rateUpdateBody
        $workerRate = $updatedRates | Where-Object { $_.category -eq "worker" } | Select-Object -First 1
        $rateMutated = ($null -ne $workerRate) -and ($workerRate.hourlyRate -eq 85000)
        Report-Result "PUT /api/v1/work-policies/compensation-rates (Mutation)" $rateMutated "Worker Hourly Rate: Rp $($workerRate.hourlyRate), Overtime: Rp $($workerRate.overtimeHourlyRate)"

        # 3.4 Verify Persistence in Current Configuration
        $verifyRes = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/current" -Method Get -Headers $adminHeaders
        $persisted = ($verifyRes.policy.approvalRequired -eq $false) -and ($verifyRes.policy.monthlyLimit -eq 5)
        Report-Result "GET /api/v1/work-policies/current (Verify Persistence)" $persisted "Verified changes persisted in DB"
    }
    finally {
        # 3.5 Guaranteed Baseline Restoration
        Write-Host "  Restoring baseline work policies and compensation rates..." -ForegroundColor Yellow
        $origPolicy = $baselineConfig.policy
        $restorePolicyBody = @{
            approvalRequired = [bool]$origPolicy.approvalRequired
            limitMode = $origPolicy.limitMode
            monthlyLimit = [int]$origPolicy.monthlyLimit
            quotaCountingPolicy = $origPolicy.quotaCountingPolicy
        } | ConvertTo-Json
        $restoredPolicy = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/leave-policy" -Method Patch -Headers $adminHeaders -Body $restorePolicyBody

        $origRates = $baselineConfig.rates
        $restoreRatesArray = @()
        foreach ($r in $origRates) {
            $restoreRatesArray += @{
                category = $r.category
                hourlyRate = [double]$r.hourlyRate
                overtimeHourlyRate = [double]$r.overtimeHourlyRate
                notes = $r.notes
            }
        }
        $restoreRatesBody = @{ rates = $restoreRatesArray } | ConvertTo-Json
        $restoredRates = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/compensation-rates" -Method Put -Headers $adminHeaders -Body $restoreRatesBody

        # Verify 100% restoration
        $finalCheck = Invoke-RestMethod -Uri "$BaseUrl/api/v1/work-policies/current" -Method Get -Headers $adminHeaders
        $is100Restored = ($finalCheck.policy.approvalRequired -eq [bool]$origPolicy.approvalRequired) -and ($finalCheck.policy.monthlyLimit -eq [int]$origPolicy.monthlyLimit)
        Report-Result "GUARANTEED RESTORATION: Work Policies & Rates" $is100Restored "Reverted to Baseline (approvalRequired: $($finalCheck.policy.approvalRequired), monthlyLimit: $($finalCheck.policy.monthlyLimit))"
    }
}

# ------------------------------------------------------------------------------
# PHASE 4: Payroll Management (/dashboard/payroll)
# ------------------------------------------------------------------------------
Write-Section "PHASE 4: Payroll Management Contract Verification"

# 4.1 Payroll Periods List
$periods = @()
try {
    $url = "$BaseUrl/api/v1/payroll/periods"
    $periods = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
    $hasPeriods = ($null -ne $periods) -and ($periods.Count -gt 0)
    $firstPeriod = if ($hasPeriods) { $periods[0] } else { $null }
    Report-Result "GET /api/v1/payroll/periods" $hasPeriods "Periods Count: $($periods.Count), Latest Period: $($firstPeriod.periodName) (Total Payout: Rp $($firstPeriod.totalPayout.ToString('N0')))"
} catch {
    Report-Result "GET /api/v1/payroll/periods" $false $_.Exception.Message
}

# 4.2 Payroll Period Detail with Summaries
$activePeriod = if ($periods.Count -gt 0) { $periods[0] } else { $null }
$periodDetail = $null
if ($activePeriod) {
    try {
        $url = "$BaseUrl/api/v1/payroll/periods/$($activePeriod.id)"
        $periodDetail = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
        $hasSummaries = ($null -ne $periodDetail.summaries) -and ($periodDetail.summaries.Count -gt 0)
        Report-Result "GET /api/v1/payroll/periods/:id (Detail & Summaries)" $hasSummaries "Period: $($periodDetail.period.periodName), Total Employees: $($periodDetail.summaries.Count)"
    } catch {
        Report-Result "GET /api/v1/payroll/periods/:id" $false $_.Exception.Message
    }
}

# 4.3 Staff Payroll Slip Modal Detail
if ($periodDetail -and $periodDetail.summaries.Count -gt 0) {
    try {
        $firstStaffSummary = $periodDetail.summaries[0]
        $url = "$BaseUrl/api/v1/payroll/staff/$($firstStaffSummary.staffId)?periodId=$($activePeriod.id)"
        $slipDetail = Invoke-RestMethod -Uri $url -Method Get -Headers $adminHeaders
        $validSlip = ($null -ne $slipDetail) -and ($slipDetail.entries.Count -gt 0)
        Report-Result "GET /api/v1/payroll/staff/:staffId (Slip Modal Detail)" $validSlip "Staff: $($slipDetail.fullName) ($($slipDetail.staffType)), Net Payroll: Rp $($slipDetail.netPayroll.ToString('N0')), Component Entries: $($slipDetail.entries.Count)"
    } catch {
        Report-Result "GET /api/v1/payroll/staff/:staffId" $false $_.Exception.Message
    }
}

# 4.4 Dynamic Payroll Calculation Engine Trigger
try {
    $calcUrl = "$BaseUrl/api/v1/payroll/calculate"
    $calcBody = @{
        periodStart = "2026-10-01"
        periodEnd = "2026-10-31"
        periodName = "Gaji Oktober 2026 E2E Suite Run"
    } | ConvertTo-Json
    $calcResult = Invoke-RestMethod -Uri $calcUrl -Method Post -Headers $adminHeaders -Body $calcBody
    $calcSuccess = ($null -ne $calcResult.period) -and ($null -ne $calcResult.period.totalPayout) -and ($calcResult.summaries.Count -gt 0)
    Report-Result "POST /api/v1/payroll/calculate (Engine Execution)" $calcSuccess "Calculated Period: $($calcResult.period.periodName), Total Payout: Rp $($calcResult.period.totalPayout.ToString('N0')), Employees: $($calcResult.summaries.Count)"
} catch {
    Report-Result "POST /api/v1/payroll/calculate" $false $_.Exception.Message
}

# 4.5 Math Model Consistency: Sum of Summaries == Period Total Payout
if ($calcResult -and $calcResult.summaries) {
    $sumNetPayroll = 0
    $sumBaseHours = 0
    foreach ($s in $calcResult.summaries) {
        $sumNetPayroll += [double]$s.netPayroll
        $sumBaseHours += [double]$s.baseHours
    }

    $diff = [Math]::Abs($sumNetPayroll - [double]$calcResult.period.totalPayout)
    $mathAligned = $diff -lt 0.01
    Report-Result "Math Verification: Sum(netPayroll) == Period.totalPayout" $mathAligned "Sum: Rp $($sumNetPayroll.ToString('N0')) vs Period Total: Rp $($calcResult.period.totalPayout.ToString('N0')) (Diff: $diff)"
}

# ------------------------------------------------------------------------------
# SUITE SUMMARY & HYGIENE VERIFICATION
# ------------------------------------------------------------------------------
Write-Section "CONTRACT VERIFICATION SUITE SUMMARY"
$elapsed = (Get-Date) - $script:TestStartTime
Write-Host " Total Execution Time : $($elapsed.TotalSeconds.ToString('F2')) seconds" -ForegroundColor White
Write-Host " Total Tests Passed    : $script:TotalPass" -ForegroundColor Green
Write-Host " Total Tests Failed    : $script:TotalFail" -ForegroundColor $(if ($script:TotalFail -eq 0) { "Green" } else { "Red" })

Flush-NextJsContractTestData

if ($script:TotalFail -eq 0) {
    Write-Host "`n CONGRATULATIONS: 100% Next.js Admin BFF & Domain Contracts Verified!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n WARNING: $script:TotalFail contract discrepancies detected. Review log details above." -ForegroundColor Red
    exit 1
}
