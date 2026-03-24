# 蔡文姬智能管理系统 - 多阶段 Docker 构建
# 优化：分离前端和后端，减小镜像体积，加快构建速度

# ============================================================================
# 阶段 1: 前端构建（Node.js 构建环境）
# ============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 安装依赖（复用缓存层）
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.js index.html .env.production ./
COPY tsconfig*.json ./

# 构建前端
RUN npm run build

# ============================================================================
# 阶段 2: 后端运行环境（最终镜像）
# ============================================================================
FROM node:18-alpine

WORKDIR /app

# 安装系统依赖（sqlite3 运行需要）
RUN apk add --no-cache \
    dumb-init \
    tini \
    curl

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# 应用用户（安全性）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force && \
    chown -R nodejs:nodejs /app

# 复制后端代码
COPY server.js ./
COPY scripts/ ./scripts/

# 从前端构建阶段复制静态文件（可选：前端也可以用专门容器提供）
COPY --from=frontend-builder /app/dist ./dist

# 创建必要的目录
RUN mkdir -p db logs && \
    chown -R nodejs:nodejs ./db ./logs

# 切换到非 root 用户
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 优雅关闭处理
ENTRYPOINT ["/sbin/tini", "--"]

# 启动命令
CMD ["node", "server.js"]

# ============================================================================
# 镜像元数据
# ============================================================================
LABEL maintainer="Caiwenjiweb Team" \
      version="1.0.0" \
      description="蔡文姬智能管理系统 - AI 助手服务" \
      org.opencontainers.image.source="https://your-repo-url"

# 暴露端口
EXPOSE 3000
