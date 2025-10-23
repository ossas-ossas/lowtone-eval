@echo off
echo 开始部署低张儿综合功能发育量表系统到云托管...

REM 检查是否安装了云托管CLI
where tcb >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装云托管CLI...
    npm install -g @cloudbase/cli
)

REM 检查Dockerfile是否存在
if not exist "Dockerfile" (
    echo 错误: 未找到Dockerfile文件
    echo 请确保项目根目录存在Dockerfile
    pause
    exit /b 1
)

REM 进入云托管目录
cd cloudbase

REM 检查cloudbase目录下的Dockerfile
if not exist "Dockerfile" (
    echo 错误: cloudbase目录下未找到Dockerfile文件
    pause
    exit /b 1
)

REM 安装依赖
echo 安装依赖...
npm install

REM 检查是否已登录
tcb whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 请先登录云托管...
    tcb login
)

REM 部署到云托管
echo 部署到云托管...
tcb hosting deploy

echo 部署完成！
echo 访问地址: https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/
echo 端口: 80
echo API文档: https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/docs

pause
