# Docker部署说明

## Dockerfile配置

### 根目录Dockerfile
项目根目录的Dockerfile用于云托管的基础镜像构建：

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 80
CMD ["node", "index.js"]
```

### cloudbase/Dockerfile
cloudbase目录下的Dockerfile用于具体的API服务部署：

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 80
CMD ["node", "index.js"]
```

## .dockerignore配置

### 根目录.dockerignore
```dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
*.log
cloudfunctions
pages
utils
ec-canvas
*.md
deploy.*
project.*.json
sitemap.json
app.*
```

### cloudbase/.dockerignore
```dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
*.log
```

## 部署步骤

### 1. 检查Dockerfile
确保以下文件存在：
- `Dockerfile` (根目录)
- `cloudbase/Dockerfile`
- `.dockerignore` (根目录)
- `cloudbase/.dockerignore`

### 2. 本地测试Docker构建
```bash
# 进入cloudbase目录
cd cloudbase

# 构建Docker镜像
docker build -t low-tension-assessment .

# 运行容器测试
docker run -p 80:80 low-tension-assessment
```

### 3. 云托管部署
```bash
# 登录云托管
tcb login

# 部署服务
tcb hosting deploy
```

## 常见问题

### 1. Dockerfile未找到
**错误**: `InvalidParameter, 代码仓库中没有找到Dockerfile`

**解决方案**:
1. 确保项目根目录存在Dockerfile
2. 确保cloudbase目录存在Dockerfile
3. 检查文件路径和名称是否正确

### 2. 构建失败
**错误**: Docker构建过程中失败

**解决方案**:
1. 检查package.json是否存在
2. 检查依赖是否正确安装
3. 检查.dockerignore是否排除了必要文件

### 3. 端口配置问题
**错误**: 端口80无法访问

**解决方案**:
1. 确保Dockerfile中EXPOSE 80
2. 确保应用监听端口80
3. 检查云托管环境变量PORT=80

## 优化建议

### 1. 多阶段构建
```dockerfile
# 构建阶段
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 运行阶段
FROM node:16-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 80
CMD ["node", "index.js"]
```

### 2. 安全优化
```dockerfile
FROM node:16-alpine

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 80
CMD ["node", "index.js"]
```

### 3. 健康检查
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80
CMD ["node", "index.js"]
```

## 监控和日志

### 1. 查看容器日志
```bash
# 云托管控制台查看日志
tcb logs --service api
```

### 2. 监控容器状态
```bash
# 查看服务状态
tcb service list
```

### 3. 调试模式
```bash
# 本地调试
docker run -it --rm -p 80:80 low-tension-assessment /bin/sh
```

## 相关文档

- [Docker官方文档](https://docs.docker.com/)
- [Node.js Docker最佳实践](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [微信云托管Docker部署](https://cloud.tencent.com/document/product/1243)
