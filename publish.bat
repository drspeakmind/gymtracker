@echo off
REM ============================================================
REM  Gym Tracker - one-click publish to GitHub Pages
REM  Double-click this file to push the latest app live.
REM ============================================================
cd /d "%~dp0"

echo Staging changes...
git add -A

REM Commit only if there is something staged
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Publish %date% %time%"
) else (
  echo No new changes to commit.
)

echo Pushing to GitHub...
git push

echo.
echo ------------------------------------------------------------
echo Done. GitHub Pages updates in about a minute.
echo Reopen the app on your phone (online) to get the new version.
echo ------------------------------------------------------------
pause
