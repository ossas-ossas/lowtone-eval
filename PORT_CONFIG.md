# 端口配置说明

## 端口80配置

您的云托管服务已配置为使用端口80，这是HTTP协议的标准端口。

### 配置位置

1. **云托管服务文件** (`cloudbase/index.js`)
   ```javascript
   const PORT = process.env.PORT || 80;
   ```

2. **云托管配置文件** (`cloudbase.json`)
   ```json
   "environment": {
     "NODE_ENV": "production",
     "PORT": "80"
   }
   ```

### 端口80的优势

1. **标准端口**：HTTP协议的标准端口，无需在URL中指定端口号
2. **简化访问**：用户可以直接访问 `https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/`
3. **防火墙友好**：大多数防火墙默认允许80端口流量
4. **负载均衡**：云托管服务会自动处理端口映射

### 访问方式

- **HTTPS访问**：`https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/`
- **API接口**：`https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/`
- **健康检查**：`https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/`

### 环境变量

在云托管控制台中，确保设置了以下环境变量：

- `PORT`: 80
- `NODE_ENV`: production
- `DB_URL`: 数据库连接字符串
- `STORAGE_BUCKET`: 存储桶名称

### 注意事项

1. **HTTPS重定向**：云托管服务会自动处理HTTP到HTTPS的重定向
2. **端口映射**：云托管会自动将外部80端口映射到内部容器端口
3. **负载均衡**：多个实例会自动进行负载均衡
4. **监控**：可以通过云托管控制台监控端口80的流量

### 测试端口配置

您可以通过以下方式测试端口配置：

```bash
# 测试健康检查
curl https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/

# 测试API接口
curl https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/dictionary
```

### 故障排除

如果端口80无法访问，请检查：

1. 云托管服务是否正常运行
2. 环境变量PORT是否正确设置为80
3. 云托管控制台中的服务状态
4. 防火墙和安全组配置
5. 域名解析是否正确

### 相关文档

- [微信云托管文档](https://cloud.tencent.com/document/product/1243)
- [端口配置指南](https://cloud.tencent.com/document/product/1243/50100)
- [环境变量配置](https://cloud.tencent.com/document/product/1243/50101)
