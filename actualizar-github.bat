@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Actualizando repositorio en GitHub
echo ===================================
echo.

:: Verificar si git está instalado
where git >nul 2>nul
if errorlevel 1 (
    echo ERROR: Git no está instalado o no está en el PATH
    goto :error
)

:: Verificar si estamos en el directorio correcto
if not exist package.json (
    echo ERROR: No se encuentra package.json. Asegúrese de estar en el directorio raíz del proyecto.
    goto :error
)

:: Verificar si el repositorio está inicializado
if not exist .git (
    echo Inicializando repositorio Git...
    git init
    if errorlevel 1 (
        echo ERROR: No se pudo inicializar el repositorio
        goto :error
    )
    echo Repositorio inicializado correctamente
)

:: Verificar la rama actual
for /f "tokens=*" %%a in ('git branch --show-current 2^>nul') do set current_branch=%%a
if "%current_branch%"=="" (
    echo Creando rama main...
    git checkout -b main
    if errorlevel 1 (
        echo ERROR: No se pudo crear la rama main
        goto :error
    )
    set current_branch=main
    echo Rama main creada correctamente
) else (
    echo Rama actual: %current_branch%
)

:: Verificar si hay cambios pendientes
echo.
echo Estado actual del repositorio:
git status
echo.

:: Preguntar si se desea continuar
set /p continuar="¿Desea continuar con la actualización? (S/N): "
if /i "%continuar%" neq "S" goto :fin

:: Verificar si el repositorio remoto está configurado
git remote -v | findstr "origin" >nul
if errorlevel 1 (
    echo Configurando repositorio remoto...
    git remote add origin https://github.com/SUPERMITA777/reset-pro-v1.git
    if errorlevel 1 (
        echo ERROR: No se pudo configurar el repositorio remoto
        goto :error
    )
    echo Repositorio remoto configurado correctamente
)

:: Agregar todos los cambios
echo.
echo Agregando cambios...
git add .
if errorlevel 1 (
    echo ERROR: No se pudieron agregar los cambios
    goto :error
)

:: Solicitar mensaje del commit
echo.
set /p mensaje="Ingrese el mensaje del commit: "
if "%mensaje%"=="" (
    echo ERROR: El mensaje del commit no puede estar vacío
    goto :error
)

:: Realizar el commit
echo.
echo Realizando commit...
git commit -m "%mensaje%"
if errorlevel 1 (
    echo ERROR: No se pudo realizar el commit
    goto :error
)

:: Intentar obtener cambios del repositorio remoto
echo.
echo Intentando obtener cambios del repositorio remoto...
git pull origin %current_branch% --allow-unrelated-histories 2>nul
if errorlevel 1 (
    echo Aviso: No se pudieron obtener cambios del remoto, esto es normal en el primer push
)

:: Subir cambios al repositorio remoto
echo.
echo Subiendo cambios a GitHub...
git push -u origin %current_branch% --force
if errorlevel 1 (
    echo ERROR: No se pudieron subir los cambios a GitHub
    echo Verifique que:
    echo 1. Tiene acceso al repositorio
    echo 2. Sus credenciales de GitHub están configuradas
    echo 3. No hay conflictos con el repositorio remoto
    goto :error
)

:: Eliminar el archivo del historial de Git
git rm --cached zzzcursor.zip

:: Crear un nuevo commit sin el archivo grande
git commit -m "Eliminar archivo zip grande del repositorio"

:: Forzar el push al repositorio remoto
git push -f origin main

echo.
echo ===================================
echo ¡Actualización completada con éxito!
echo ===================================
goto :fin

:error
echo.
echo ===================================
echo Se produjo un error durante el proceso
echo ===================================
echo.

:fin
echo Presione cualquier tecla para salir...
pause >nul 