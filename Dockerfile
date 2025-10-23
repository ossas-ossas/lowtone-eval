# 修复的Dockerfile for 云托管
FROM node:16-alpine

# 安装ca-certificates包以支持证书更新
RUN apk add --no-cache ca-certificates

# 设置工作目录
WORKDIR /app

# 复制cloudbase目录的内容
COPY cloudbase/ ./

# 安装依赖
RUN npm install --production

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "index.js"]
