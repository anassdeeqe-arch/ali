@echo off
REM Colors for Windows (using PowerShell-like output)
setlocal enabledelayedexpansion

echo.
echo ==================================================
echo    ZARA STYLE (ALI) - TESTING SUITE
echo ==================================================
echo.

REM Test 1: Check Node.js
echo [Test 1/6] Checking Node.js installation...
node --version
if !errorlevel! equ 0 (
    echo [OK] Node.js Check - PASSED
) else (
    echo [FAILED] Node.js Check - Node.js not found
    pause
    exit /b 1
)
echo.

REM Test 2: Check npm
echo [Test 2/6] Checking npm installation...
npm --version
if !errorlevel! equ 0 (
    echo [OK] npm Check - PASSED
) else (
    echo [FAILED] npm Check - npm not found
    pause
    exit /b 1
)
echo.

REM Test 3: Install dependencies
echo [Test 3/6] Installing dependencies...
call npm install
if !errorlevel! equ 0 (
    echo [OK] Dependency Installation - PASSED
) else (
    echo [FAILED] Dependency Installation - FAILED
    pause
    exit /b 1
)
echo.

REM Test 4: Run linting
echo [Test 4/6] Running TypeScript linting...
call npm run lint
if !errorlevel! equ 0 (
    echo [OK] TypeScript Linting - PASSED
) else (
    echo [FAILED] TypeScript Linting - FAILED
    pause
    exit /b 1
)
echo.

REM Test 5: Clean and build
echo [Test 5/6] Cleaning and building project...
call npm run clean
call npm run build
if !errorlevel! equ 0 (
    echo [OK] Production Build - PASSED
) else (
    echo [FAILED] Production Build - FAILED
    pause
    exit /b 1
)
echo.

REM Test 6: Verify dist folder
echo [Test 6/6] Verifying dist folder...
if exist "dist" (
    for /f %%A in ('dir /b dist ^| find /c /v ""') do set count=%%A
    if !count! gtr 0 (
        echo [OK] Dist folder created and populated - PASSED
        echo.
        echo Build artifacts:
        for /d %%D in (dist\*) do echo   %%D
    ) else (
        echo [FAILED] Dist folder is empty - FAILED
    )
) else (
    echo [FAILED] Dist folder not found - FAILED
)
echo.

echo ==================================================
echo    TEST SUMMARY
echo ==================================================
echo [OK] All tests completed!
echo.
echo Next Steps:
echo 1. Check for any errors above
echo 2. Run: npm run dev
echo 3. Test features in browser at http://localhost:5173
echo 4. Once ready, deploy with: firebase deploy
echo.
pause
