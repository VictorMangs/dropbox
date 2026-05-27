param (
    [switch]$Cleanup,
    [switch]$Start,
    [switch]$Restart
)

function Cleanup-Database {
    Write-Host "Cleaning up old migrations and database..."
    $Paths = "./prisma/migrations", "./prisma/dev.db"
    foreach ($Path in $Paths) {
        if (Test-Path $Path) {
            Remove-Item -Recurse -Force -Path $Path
            Write-Host "Removed: $Path"
        }
    }
}

function Start-Database {
    Write-Host "Running Prisma migrations..."
    npx prisma migrate dev --name init
}

function Start-AppServer {
    Write-Host "Starting application in development mode..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command npm run start:dev"
}

# Execution Logic based on Flags
if ($Cleanup) {
    Cleanup-Database
}
elseif ($Start) {
    Start-Database
    Start-AppServer
}
else {
    # Default behavior if no flags are passed
    Write-Host "No flags provided. Defaulting to full restart..."
    Cleanup-Database
    Start-Database
    Start-AppServer
}
