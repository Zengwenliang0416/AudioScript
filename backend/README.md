# AudioScript Backend

音频转录服务后端 API

## 技术栈

- FastAPI: 高性能异步 Web 框架
- Pydantic: 数据验证和序列化
- SQLAlchemy: ORM 数据库操作
- Alembic: 数据库迁移工具
- pytest: 单元测试框架

## 开发环境设置

1. 创建虚拟环境:
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
.\venv\Scripts\activate  # Windows
```

2. 安装依赖:
```bash
pip install -e .
```

3. 运行开发服务器:
```bash
uvicorn app.main:app --reload
```

服务器将在 http://localhost:8000 运行

## API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── api/            # API 路由
│   ├── core/           # 核心配置
│   ├── models/         # 数据模型
│   ├── services/       # 业务逻辑
│   └── utils/          # 工具函数
├── tests/              # 测试用例
└── uploads/            # 上传文件临时目录
```

## 环境变量

可以通过创建 `.env` 文件来配置环境变量:

```env
PROJECT_NAME=AudioScript
VERSION=0.1.0
API_V1_STR=/api/v1
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=104857600
``` 