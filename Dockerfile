# 简化的Dockerfile for 云托管
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "index.js"]
