# API 文档

## 基础信息

- **API地址**: https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com
- **端口**: 80
- **版本**: v1.0.0
- **格式**: JSON

## 接口列表

### 1. 健康检查

**GET** `/`

检查服务状态

**响应示例**:
```json
{
  "message": "低张儿综合功能发育量表API服务",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2025-01-XX"
}
```

### 2. 获取量表字典

**GET** `/api/dictionary`

获取所有量表题目数据

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "category": "听知觉",
      "itemCode": "AUD01",
      "title": "能听到家长叫名字",
      "weight": 1
    }
  ]
}
```

### 3. 提交评估数据

**POST** `/api/submissions`

提交儿童评估数据

**请求参数**:
```json
{
  "childName": "刘小宝",
  "dob": "2020-04-06",
  "assessmentDate": "2025-01-XX",
  "answers": [
    {
      "category": "听知觉",
      "value": "yes"
    }
  ],
  "ownerOpenId": "user_openid"
}
```

**响应示例**:
```json
{
  "success": true,
  "submissionId": "submission_id",
  "message": "保存成功"
}
```

### 4. 获取评估记录列表

**GET** `/api/submissions`

获取用户的评估记录列表

**查询参数**:
- `openId`: 用户openId
- `role`: 用户角色 (parent/staff)
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认10)

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "submission_id",
      "childName": "刘小宝",
      "dob": "2020-04-06",
      "assessmentDate": "2025-01-XX",
      "summary": [
        {
          "category": "听知觉",
          "numerator": 8,
          "denominator": 10,
          "ratio": 0.8,
          "band": "G"
        }
      ],
      "createdAt": "2025-01-XX"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

### 5. 获取单个评估记录

**GET** `/api/submissions/:id`

获取指定ID的评估记录详情

**路径参数**:
- `id`: 评估记录ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "submission_id",
    "childName": "刘小宝",
    "dob": "2020-04-06",
    "assessmentDate": "2025-01-XX",
    "answers": [...],
    "summary": [...],
    "createdAt": "2025-01-XX"
  }
}
```

### 6. 生成报告

**POST** `/api/reports/generate`

为指定评估记录生成报告

**请求参数**:
```json
{
  "submissionId": "submission_id"
}
```

**响应示例**:
```json
{
  "success": true,
  "reportUrl": "https://your-domain.com/reports/submission_id.pdf",
  "message": "报告生成成功"
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 错误响应格式

```json
{
  "success": false,
  "message": "错误描述"
}
```

## 使用示例

### JavaScript (小程序)

```javascript
// 获取量表字典
wx.request({
  url: 'https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/dictionary',
  method: 'GET',
  success: res => {
    console.log('量表数据:', res.data);
  }
});

// 提交评估数据
wx.request({
  url: 'https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/submissions',
  method: 'POST',
  data: {
    childName: '刘小宝',
    dob: '2020-04-06',
    assessmentDate: '2025-01-XX',
    answers: answers,
    ownerOpenId: 'user_openid'
  },
  success: res => {
    console.log('提交成功:', res.data);
  }
});
```

### curl

```bash
# 健康检查
curl https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/

# 获取量表字典
curl https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/dictionary

# 提交评估数据
curl -X POST https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"childName":"刘小宝","dob":"2020-04-06","assessmentDate":"2025-01-XX","answers":[],"ownerOpenId":"user_openid"}'
```

## 注意事项

1. 所有API请求都需要设置正确的Content-Type
2. 建议使用HTTPS协议
3. 请妥善保管用户openId等敏感信息
4. 建议实现请求重试机制
5. 注意API调用频率限制
