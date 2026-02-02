@echo off
echo ==========================================
echo CASINO PLATFORM FIXER
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no esta en el PATH.
    echo.
    echo Necesitas instalar Node.js para que la plataforma funcione.
    echo Abriendo la pagina de descarga oficial...
    start https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
    echo.
    echo 1. Descarga e instala el archivo que se esta abriendo.
    echo 2. Cierra todas las ventanas de terminal y VS Code.
    echo 3. Vuelve a abrir VS Code y ejecuta este archivo de nuevo.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado.
echo.

echo 1. Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar dependencias.
    pause
    exit /b 1
)

echo 2. Generando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al generar cliente Prisma.
    pause
    exit /b 1
)

echo 3. Sincronizando base de datos...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al sincronizar base de datos.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [EXITO] Todo ha sido arreglado correctamente.
echo Ahora puedes ejecutar 'npm run dev' para iniciar el servidor.
echo ==========================================
pause
