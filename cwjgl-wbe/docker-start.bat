@echo off
REM ============================================================================
REM Docker 部署快速启动脚本（Windows 版本）
REM 用法: docker-start.bat
REM ============================================================================

setlocal enabledelayedexpansion

REM 颜色代码（Windows 10+ 支持）
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM ============================================================================
REM 工具函数
REM ============================================================================

setlocal

echo.
echo %BLUE%蔡文姬智能管理系统 Docker 启动脚本%NC%
echo ============================================================================
echo.

REM ============================================================================
REM 检查 Docker 环境
REM ============================================================================

echo.%BLUE%ℹ 检查 Docker 环境...%NC%

where docker >nul 2>nul
if errorlevel 1 (
    echo %RED%✗ Docker 未安装或不在 PATH 中%NC%
    echo 请访问 https://www.docker.com/products/docker-desktop 安装 Docker
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if errorlevel 1 (
    echo %RED%✗ Docker Compose 未安装或不在 PATH 中%NC%
    exit /b 1
)

for /f "tokens=*" %%i in ('docker --version') do set version=%%i
echo %GREEN%✓ !version!%NC%

for /f "tokens=*" %%i in ('docker-compose --version') do set version=%%i
echo %GREEN%✓ !version!%NC%

REM ============================================================================
REM 检查配置文件
REM ============================================================================

echo.%BLUE%ℹ 检查配置文件...%NC%

if not exist ".env" (
    echo %YELLOW%⚠ .env 文件不存在，从 .env.docker 复制%NC%
    copy .env.docker .env
    echo %BLUE%ℹ 请编辑 .env 文件，设置 DOUBAO_API_KEY 等必要配置%NC%
    echo %YELLOW%⚠ 按任意键继续...%NC%
    pause
)

if not exist "docker-compose.yml" (
    echo %RED%✗ docker-compose.yml 文件不存在%NC%
    pause
    exit /b 1
)

REM ============================================================================
REM 处理命令行参数
REM ============================================================================

if "%1"=="clean" (
    echo %BLUE%ℹ 清理旧容器...%NC%
    docker-compose down -v
    echo %GREEN%✓ 清理完毕%NC%
    exit /b 0
)

if "%1"=="rebuild" (
    set build_flag=--no-cache
) else (
    set build_flag=
)

REM ============================================================================
REM 构建镜像
REM ============================================================================

echo.%BLUE%ℹ 构建 Docker 镜像...%NC%

if "%1"=="build" or "%1"=="rebuild" (
    echo %BLUE%ℹ 强制重新构建...%NC%
    docker-compose build --no-cache
) else (
    docker-compose build
)

echo %GREEN%✓ 镜像构建完毕%NC%

REM ============================================================================
REM 启动服务
REM ============================================================================

echo.%BLUE%ℹ 启动容器...%NC%

docker-compose up -d

echo %GREEN%✓ 容器启动完毕%NC%

REM ============================================================================
REM 等待服务就绪
REM ============================================================================

echo.%BLUE%ℹ 等待服务就绪...%NC%

setlocal enabledelayedexpansion
set "attempt=0"
set "max_attempts=30"

:wait_loop
if !attempt! geq !max_attempts! (
    echo %YELLOW%⚠ 后端服务启动超时，请检查日志%NC%
    goto show_status
)

timeout /t 1 /nobreak >nul

REM 简单的健康检查
curl -f http://localhost:3000/health >nul 2>&1
if errorlevel 0 (
    echo.%GREEN%✓ 后端服务已就绪%NC%
    goto startup_complete
)

set /a attempt=!attempt! + 1
echo 等待中... (!attempt!/!max_attempts!)
goto wait_loop

REM ============================================================================
REM 启动总结
REM ============================================================================

:startup_complete
echo.
echo %GREEN%════════════════════════════════════════════════════════════%NC%
echo %GREEN%✓ 蔡文姬智能管理系统已启动！%NC%
echo %GREEN%════════════════════════════════════════════════════════════%NC%
echo.
echo 📍 访问地址：
echo    前端应用: http://localhost
echo    后端 API: http://localhost:3000
echo    健康检查: http://localhost:3000/health
echo.

:show_status
echo 📋 常用命令：
echo    查看日志: docker-compose logs -f backend
echo    停止服务: docker-compose down
echo    清理数据: docker-compose down -v
echo    重启服务: docker-compose restart
echo.
echo 📊 容器状态：

docker-compose ps

echo.
echo %YELLOW%提示: 使用 Ctrl+C 停止，或关闭此窗口%NC%
echo.

pause
