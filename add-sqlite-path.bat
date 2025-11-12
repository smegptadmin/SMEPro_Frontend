# Add C:\sqlite\ to the system PATH environment variable

$targetPath = "C:\sqlite\"

# Get current PATH
$oldPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)

# Check if already present
if ($oldPath -like "*$targetPath*") {
    Write-Output "PATH already contains $targetPath"
} else {
    $newPath = "$oldPath;$targetPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::Machine)
    Write-Output "✅ Added $targetPath to PATH. Restart PowerShell or log out/in for changes to take effect."
}
