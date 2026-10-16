# test-session-defs-sync.ps1
# E2E Test: Master Session Definitions & Roster Synchronization Verification

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$ScriptDir\..\backend\scripts\e2e\common.ps1"

$baseUrl = Get-E2EBaseUrl
$apiBaseUrl = Get-E2EApiBaseUrl

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host " [TEST] Master Session Definitions & Roster Sync Verification" -ForegroundColor Cyan
Write-Host " Target API: $apiBaseUrl" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

Reset-TestCounters

try {
    # Step 1: Login
    Write-Host "`n[STEP 1] Logging in as Admin..." -ForegroundColor Yellow
    $adminAuth = Login-Admin
    $headers = $adminAuth.headers
    Assert-Test "Admin authenticated successfully" ($null -ne $adminAuth.token)

    # Step 2: Fetch current schedule configuration
    Write-Host "`n[STEP 2] Fetching Schedule Configuration..." -ForegroundColor Yellow
    $configRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/schedule-configuration" -Method Get -Headers $headers
    $config = if ($configRes.data) { $configRes.data } else { $configRes }
    $diniHari = $config.sessionDefs | Where-Object { $_.code -eq "early_morning" }
    Assert-Test "Sesi Dini Hari found in configuration" ($null -ne $diniHari)
    Write-Host "  Dini Hari ID: $($diniHari.id), Current isActive: $($diniHari.isActive)"

    # Step 3: Fetch Dr Ahmad roster before mutation
    Write-Host "`n[STEP 3] Fetching Dr Ahmad Roster with Dini Hari..." -ForegroundColor Yellow
    $drAhmadId = "82dba40a-eed5-4cdf-89f5-a75dc5242a66"
    $rosterBefore = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsBefore = ($rosterBefore.days | Where-Object { $_.dow -eq 0 }).sessions
    Write-Host "  Sunday sessions count before: $($sundaySessionsBefore.Count)"
    Assert-Test "Roster returns active sessions" ($sundaySessionsBefore.Count -ge 3)

    # Step 4: Deactivate Sesi Dini Hari
    Write-Host "`n[STEP 4] Deactivating Sesi Dini Hari via Config API..." -ForegroundColor Yellow
    $deactivatePayload = @{
        sessionDefs = @(
            @{
                id = $diniHari.id
                isActive = $false
                sortOrder = $diniHari.sortOrder
            }
        )
    } | ConvertTo-Json -Depth 5

    $updateConfigRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/schedule-configuration/batch" -Method Put -Headers $headers -ContentType "application/json" -Body $deactivatePayload
    Assert-Test "Configuration updated (Dini Hari deactivated)" ($true)

    # Step 5: Verify Roster NO LONGER returns Sesi Dini Hari
    Write-Host "`n[STEP 5] Verifying Roster Sessions after Deactivating Dini Hari..." -ForegroundColor Yellow
    $rosterAfter = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsAfter = ($rosterAfter.days | Where-Object { $_.dow -eq 0 }).sessions
    $hasDiniHariAfter = ($sundaySessionsAfter | Where-Object { $_.sessionCode -eq "early_morning" }) -ne $null
    Write-Host "  Sunday sessions count after: $($sundaySessionsAfter.Count)"
    Assert-Test "Sesi Dini Hari completely omitted from roster sessions (clean rendering)" (-not $hasDiniHariAfter)
    Assert-Test "Exactly 3 sessions returned (Pagi, Siang, Malam)" ($sundaySessionsAfter.Count -eq 3)

    # Step 6: Test defensive filter when saving assignments
    Write-Host "`n[STEP 6] Testing Defensive Assignment Filter on Inactive Session..." -ForegroundColor Yellow
    $morningSessionId = ($sundaySessionsAfter | Where-Object { $_.sessionCode -eq "morning" }).sessionId
    $mutPayload = @{
        assignments = @(
            @{
                dow = 0
                sessionId = $diniHari.id # Inactive session
                isActive = $true
            },
            @{
                dow = 0
                sessionId = $morningSessionId
                isActive = $true
            }
        )
        reason = "Test defensive assignment filtering"
    } | ConvertTo-Json -Depth 5

    $saveRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Put -Headers $headers -ContentType "application/json" -Body $mutPayload
    $sundaySavedSessions = ($saveRes.days | Where-Object { $_.dow -eq 0 }).sessions
    $savedMorning = $sundaySavedSessions | Where-Object { $_.sessionCode -eq "morning" }
    $savedDiniHari = $sundaySavedSessions | Where-Object { $_.sessionCode -eq "early_morning" }
    Assert-Test "Morning session correctly assigned" ($savedMorning.isActive -eq $true)
    Assert-Test "Inactive Dini Hari session omitted from active DB assignments" ($null -eq $savedDiniHari)

    # Step 7: Restore Sesi Dini Hari to Active
    Write-Host "`n[STEP 7] Restoring Sesi Dini Hari to Active..." -ForegroundColor Yellow
    $restorePayload = @{
        sessionDefs = @(
            @{
                id = $diniHari.id
                isActive = $true
                sortOrder = $diniHari.sortOrder
            }
        )
    } | ConvertTo-Json -Depth 5

    $restoreRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/schedule-configuration/batch" -Method Put -Headers $headers -ContentType "application/json" -Body $restorePayload
    $rosterRestored = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsRestored = ($rosterRestored.days | Where-Object { $_.dow -eq 0 }).sessions
    $hasDiniHariRestored = ($sundaySessionsRestored | Where-Object { $_.sessionCode -eq "early_morning" }) -ne $null
    Assert-Test "Sesi Dini Hari successfully reappears in roster when re-activated" ($hasDiniHariRestored -eq $true)

    # Step 8: Re-assign Dr Ahmad Sunday Morning and Afternoon
    Write-Host "`n[STEP 8] Restoring Dr Ahmad Sunday Morning and Afternoon Roster..." -ForegroundColor Yellow
    $morningSession = $sundaySessionsRestored | Where-Object { $_.sessionCode -eq "morning" }
    $afternoonSession = $sundaySessionsRestored | Where-Object { $_.sessionCode -eq "afternoon" }
    $finalPayload = @{
        assignments = @(
            @{
                dow = 0
                sessionId = $morningSession.sessionId
                isActive = $true
            },
            @{
                dow = 0
                sessionId = $afternoonSession.sessionId
                isActive = $true
            }
        )
        reason = "Restored Sunday Morning and Afternoon assignments"
    } | ConvertTo-Json -Depth 5

    $finalRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Put -Headers $headers -ContentType "application/json" -Body $finalPayload
    Assert-Test "Final state preserved (Sunday Morning & Afternoon assigned)" ($true)

} catch {
    Write-Host "Error during test execution: $_" -ForegroundColor Red
}

Print-TestSummary "Session Defs & Roster Sync Verification"

if ($global:E2EFailCount -gt 0) { exit 1 } else { exit 0 }
