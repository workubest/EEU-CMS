@echo off
echo 🚀 Building EEU Complaint Management APK...
echo.

echo 📦 Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 goto error

echo 🏗️ Step 2: Building web assets...
call npm run build
if %errorlevel% neq 0 goto error

echo 🔄 Step 3: Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 goto error

echo 📱 Step 4: Building Android APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 goto error

echo.
echo ✅ SUCCESS! APK built successfully!
echo 📱 APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 📲 Install on Android:
echo 1. Transfer APK to Android device
echo 2. Enable "Install from Unknown Sources"
echo 3. Tap APK file to install
echo 4. Launch EEU Complaint Management app!
echo.
pause
goto end

:error
echo ❌ Error occurred during build!
echo Please check the error messages above.
pause

:end
cd ..