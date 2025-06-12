@echo off
:: Script para actualizar el repositorio GitHub automáticamente
:: Repositorio: https://github.com/SUPERMITA777/reset-fire
:: Autor: Emanuel Cotta

cd /d %~dp0

:: Establece o reestablece el remoto
git remote remove origin >nul 2>&1
git remote add origin https://github.com/SUPERMITA777/reset-fire.git

:: Verificar si hay cambios sin commitear
git diff --quiet && git diff --cached --quiet
if %errorlevel%==0 (
    echo No hay cambios para subir.
) else (
    :: Obtener fecha y hora para el commit
    for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
        set dia=%%a
        set mes=%%b
        set anio=%%c
    )
    for /f "tokens=1-2 delims=: " %%i in ("%time%") do (
        set hora=%%i
        set minuto=%%j
    )

    git add .
    git commit -m "Actualización automática %dia%/%mes%/%anio% %hora%:%minuto%"
    git push origin main
)

pause

