#!/bin/bash
# 云托管部署脚本

echo "开始部署低张儿综合功能发育量表系统到云托管..."

# 检查是否安装了云托管CLI
if ! command -v tcb &> /dev/null; then
    echo "正在安装云托管CLI..."
    npm install -g @cloudbase/cli
fi

# 进入云托管目录
cd cloudbase

# 安装依赖
echo "安装依赖..."
npm install

# 检查是否已登录
if ! tcb whoami &> /dev/null; then
    echo "请先登录云托管..."
    tcb login
fi

# 部署到云托管
echo "部署到云托管..."
tcb hosting deploy

echo "部署完成！"
echo "访问地址: https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/"
echo "端口: 80"
echo "API文档: https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/docs"
