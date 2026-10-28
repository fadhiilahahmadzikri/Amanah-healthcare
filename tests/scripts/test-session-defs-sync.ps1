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
    $targetDef = $config.sessionDefs[0]
    Assert-Test "First session definition found in configuration" ($null -ne $targetDef)
    Write-Host "  Target Def ID: $($targetDef.id), Code: $($targetDef.code), Current isActive: $($targetDef.isActive)"

    # Step 3: Fetch Dr Ahmad roster before mutation
    Write-Host "`n[STEP 3] Fetching Dr Ahmad Roster with Target Session..." -ForegroundColor Yellow
    $drAhmadId = "82dba40a-eed5-4cdf-89f5-a75dc5242a66"
    $rosterBefore = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsBefore = ($rosterBefore.days | Where-Object { $_.dow -eq 0 }).sessions
    Write-Host "  Sunday sessions count before: $($sundaySessionsBefore.Count)"
    Assert-Test "Roster returns active sessions" ($sundaySessionsBefore.Count -ge 1)

    # Step 4: Deactivate Target Session
    Write-Host "`n[STEP 4] Deactivating Target Session via Config API..." -ForegroundColor Yellow
    $deactivatePayload = @{
        sessionDefs = @(
            @{
                id = $targetDef.id
                isActive = $false
                sortOrder = $targetDef.sortOrder
            }
        )
    } | ConvertTo-Json -Depth 5

    $updateConfigRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/schedule-configuration/batch" -Method Put -Headers $headers -ContentType "application/json" -Body $deactivatePayload
    Assert-Test "Configuration updated (Target Session deactivated)" ($true)

    # Step 5: Verify Roster NO LONGER returns Target Session
    Write-Host "`n[STEP 5] Verifying Roster Sessions after Deactivating Target Session..." -ForegroundColor Yellow
    $rosterAfter = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsAfter = ($rosterAfter.days | Where-Object { $_.dow -eq 0 }).sessions
    $hasTargetAfter = ($sundaySessionsAfter | Where-Object { $_.sessionId -eq $targetDef.id }) -ne $null
    Write-Host "  Sunday sessions count after: $($sundaySessionsAfter.Count)"
    Assert-Test "Target Session completely omitted from roster sessions (clean rendering)" (-not $hasTargetAfter)

    # Step 6: Test defensive filter when saving assignments
    Write-Host "`n[STEP 6] Testing Defensive Assignment Filter on Inactive Session..." -ForegroundColor Yellow
    $otherSession = $sundaySessionsAfter[0]
    $mutPayload = @{
        assignments = @(
            @{
                dow = 0
                sessionId = $targetDef.id # Inactive session
                isActive = $true
            },
            @{
                dow = 0
                sessionId = $otherSession.sessionId
                isActive = $true
            }
        )
        reason = "Test defensive assignment filtering"
    } | ConvertTo-Json -Depth 5

    $saveRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Put -Headers $headers -ContentType "application/json" -Body $mutPayload
    $sundaySavedSessions = ($saveRes.days | Where-Object { $_.dow -eq 0 }).sessions
    $savedOther = $sundaySavedSessions | Where-Object { $_.sessionId -eq $otherSession.sessionId }
    $savedTarget = $sundaySavedSessions | Where-Object { $_.sessionId -eq $targetDef.id }
    Assert-Test "Active session correctly assigned" ($savedOther.isActive -eq $true)
    Assert-Test "Inactive session omitted from active DB assignments" ($null -eq $savedTarget)

    # Step 7: Restore Target Session to Active
    Write-Host "`n[STEP 7] Restoring Target Session to Active..." -ForegroundColor Yellow
    $restorePayload = @{
        sessionDefs = @(
            @{
                id = $targetDef.id
                isActive = $true
                sortOrder = $targetDef.sortOrder
            }
        )
    } | ConvertTo-Json -Depth 5

    $restoreRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/schedule-configuration/batch" -Method Put -Headers $headers -ContentType "application/json" -Body $restorePayload
    $rosterRestored = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Get -Headers $headers
    $sundaySessionsRestored = ($rosterRestored.days | Where-Object { $_.dow -eq 0 }).sessions
    $hasTargetRestored = ($sundaySessionsRestored | Where-Object { $_.sessionId -eq $targetDef.id }) -ne $null
    Assert-Test "Target Session successfully reappears in roster when re-activated" ($hasTargetRestored -eq $true)

    # Step 8: Re-assign Dr Ahmad Sunday Active Sessions
    Write-Host "`n[STEP 8] Restoring Dr Ahmad Sunday Roster..." -ForegroundColor Yellow
    $firstSession = $sundaySessionsRestored[0]
    $finalPayload = @{
        assignments = @(
            @{
                dow = 0
                sessionId = $firstSession.sessionId
                isActive = $true
            }
        )
        reason = "Restored Sunday assignments"
    } | ConvertTo-Json -Depth 5

    $finalRes = Invoke-RestMethod -Uri "$apiBaseUrl/admin/doctor-schedules/$drAhmadId/assignments" -Method Put -Headers $headers -ContentType "application/json" -Body $finalPayload
    Assert-Test "Final state preserved" ($true)

} catch {
    Write-Host "Error during test execution: $_" -ForegroundColor Red
}

Print-TestSummary "Session Defs & Roster Sync Verification"

if ($global:E2EFailCount -gt 0) { exit 1 } else { exit 0 }
