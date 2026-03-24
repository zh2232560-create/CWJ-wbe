#!/bin/bash

# ============================================================================
# Docker 部署快速启动脚本
# 用法: chmod +x docker-start.sh && ./docker-start.sh
# ============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# 工具函数
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

log_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# ============================================================================
# 检查环境
# ============================================================================

log_info "检查 Docker 环境..."

if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装或不在 PATH 中"
    echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 未安装或不在 PATH 中"
    echo "请访问 https://docs.docker.com/compose/install/ 安装 Docker Compose"
    exit 1
fi

log_success "Docker: $(docker --version)"
log_success "Docker Compose: $(docker-compose --version)"

# ============================================================================
# 检查配置文件
# ============================================================================

log_info "检查配置文件..."

if [ ! -f ".env" ]; then
    log_warning ".env 文件不存在，从 .env.docker 复制"
    cp .env.docker .env
    log_info "请编辑 .env 文件，设置 DOUBAO_API_KEY、CWJ_API_BASE 等必要配置"
    log_warning "按 Enter 继续，或 Ctrl+C 退出编辑 .env 文件..."
    read -r
fi

if [ ! -d "dist" ]; then
    log_warning "未检测到 dist 目录，建议先执行 npm run build，否则 Nginx 可能无法提供前端静态文件"
fi

if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml 文件不存在"
    exit 1
fi

# ============================================================================
# 清理旧容器（可选）
# ============================================================================

if [ "$1" = "clean" ]; then
    log_info "清理旧容器..."
    docker-compose down -v
    log_success "清理完毕"
fi

# ============================================================================
# 构建镜像
# ============================================================================

log_info "构建 Docker 镜像..."

# 检查是否需要构建
if [ "$1" = "build" ] || [ "$1" = "rebuild" ]; then
    log_info "强制重新构建..."
    docker-compose build --no-cache
else
    docker-compose build
fi

log_success "镜像构建完毕"

# ============================================================================
# 启动服务
# ============================================================================

log_info "启动容器..."

docker-compose up -d

log_success "容器启动完毕"

# ============================================================================
# 等待服务就绪
# ============================================================================

log_info "等待服务就绪..."

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        log_success "后端服务已就绪"
        break
    fi
    attempt=$((attempt + 1))
    echo -ne "\r等待中... ($attempt/$max_attempts)"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    log_warning "后端服务启动超时，请检查日志"
fi

# ============================================================================
# 跟踪日志（可选）
# ============================================================================

if [ "$1" = "logs" ] || [ "$1" != "detach" ]; then
    log_info "显示日志（Ctrl+C 退出）..."
    docker-compose logs -f
fi

# ============================================================================
# 启动总结
# ============================================================================

echo ""
log_success "════════════════════════════════════════════════════════════"
log_success "蔡文姬智能管理系统已启动！"
log_success "════════════════════════════════════════════════════════════"
echo ""
echo "📍 访问地址："
echo "   前端应用: http://localhost"
echo "   后端 API: http://localhost:3000"
echo "   健康检查: http://localhost:3000/health"
echo ""
echo "📋 常用命令："
echo "   查看日志: docker-compose logs -f backend"
echo "   进入容器: docker-compose exec backend sh"
echo "   重启服务: docker-compose restart"
echo "   停止服务: docker-compose down"
echo "   清理数据: docker-compose down -v"
echo ""
echo "📊 容器状态："
docker-compose ps
echo ""
