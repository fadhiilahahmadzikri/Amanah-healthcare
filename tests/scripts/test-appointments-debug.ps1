$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\..\backend\scripts\e2e\common.ps1"

$auth = Login-Admin
$apiBase = Get-E2EApiBaseUrl

try {
    $res = Invoke-RestMethod -Uri "$apiBase/appointments?page=1&limit=10" -Headers $auth.headers -Method Get
    Write-Host "Success! Response:" ($res | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error: " $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "Details: " $_.ErrorDetails.Message
    }
}
