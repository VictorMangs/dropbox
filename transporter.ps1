# Define the output file
$OutputFile = "project_context.txt"

# Clear previous output file if it exists
if (Test-Path $OutputFile) { Remove-Item $OutputFile }

# Define the folders to scan (relative to current directory)
$TargetFolders = @("src")

# Extensions to exclude (images, lockfiles, etc.)
$ExcludeExtensions = @(".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".pdf", ".zip", ".tar", ".gz", ".lock", ".map")

# Files or folders to explicitly skip (safety check)
$ExcludeNames = @("node_modules", ".git", ".next", "dist", "build", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "storage", "test")

Write-Host "Gathering project context..." -ForegroundColor Cyan

foreach ($Folder in $TargetFolders) {
    if (Test-Path $Folder) {
        Write-Host "Scanning: $Folder" -ForegroundColor Yellow
        
        # Get all files recursively inside the target directory
        $Files = Get-ChildItem -Path $Folder -Recurse -File | Where-Object {
            $RelativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            
            # Check if file matches any exclusion rules
            $MatchesExtension = $ExcludeExtensions -contains $_.Extension.ToLower()
            $MatchesName = $ExcludeNames | Where-Object { $RelativePath -like "*$_*" }
            
            -not $MatchesExtension -and -not $MatchesName
        }

        foreach ($File in $Files) {
            # Convert absolute path to a clean relative path with forward slashes
            $RelativePath = $File.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            
            # Append headers and file content to the output text file
            Add-Content -Path $OutputFile -Value "================================================"
            Add-Content -Path $OutputFile -Value "FILE: $RelativePath"
            Add-Content -Path $OutputFile -Value "================================================"
            
            # Read file content safely as raw text
            $Content = Get-Content -Raw -Path $File.FullName
            Add-Content -Path $OutputFile -Value $Content
            Add-Content -Path $OutputFile -Value "`n" # Add a trailing blank line
        }
    } else {
        Write-Host "Warning: Folder '$Folder' not found. Skipping." -ForegroundColor DarkYellow
    }
}

Write-Host "Done! Context bundled safely into $OutputFile" -ForegroundColor Green
