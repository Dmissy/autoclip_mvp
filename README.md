# AutoClip - 智能视频切片工具

🎬 基于AI的智能视频切片和合集推荐系统，支持从B站视频自动下载、字幕提取、智能切片和合集生成。

## ✨ 功能特性

- 🔥 **智能视频切片**：基于AI分析视频内容，自动生成高质量切片
- 📺 **B站视频下载**：支持B站视频自动下载和字幕提取
- 🎯 **智能合集推荐**：AI自动分析切片内容，推荐相关合集
- 🎨 **手动合集编辑**：支持拖拽排序、添加/删除切片
- 📦 **一键打包下载**：支持所有切片和合集的一键打包下载
- 🌐 **现代化Web界面**：React + TypeScript + Ant Design
- ⚡ **实时处理状态**：实时显示处理进度和日志

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- 通义千问API密钥（用于AI分析）

### 安装步骤

1. **克隆项目**
```bash
git clone git@github.com:zhouxiaoka/autoclip_mvp.git
cd autoclip_mvp
```

2. **安装后端依赖**
```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

3. **安装前端依赖**
```bash
cd frontend
npm install
cd ..
```

4. **配置API密钥**
```bash
# 复制示例配置文件
cp data/settings.example.json data/settings.json

# 编辑配置文件，填入你的API密钥
{
  "dashscope_api_key": "你的通义千问API密钥",
  "model_name": "qwen-plus",
  "chunk_size": 5000,
  "min_score_threshold": 0.7,
  "max_clips_per_collection": 5,
  "default_browser": "chrome"
}
```

### 启动服务

#### 方式一：使用启动脚本（推荐）
```bash
chmod +x start_dev.sh
./start_dev.sh
```

#### 方式二：手动启动
```bash
# 启动后端服务
source venv/bin/activate
python backend_server.py

# 新开终端，启动前端服务
cd frontend
npm run dev
```

#### 方式三：命令行工具
```bash
# 处理本地视频文件
python main.py --video input.mp4 --srt input.srt --project-name "我的项目"

# 处理现有项目
python main.py --project-id <project_id>

# 列出所有项目
python main.py --list-projects
```

### 访问地址

- 🌐 **前端界面**: http://localhost:3000
- 🔌 **后端API**: http://localhost:8000
- 📚 **API文档**: http://localhost:8000/docs

## 📁 项目结构

```
autoclip_mvp/
├── backend_server.py          # FastAPI后端服务
├── main.py                   # 命令行入口
├── start_dev.sh              # 开发环境启动脚本
├── requirements.txt           # Python依赖
├── .gitignore               # Git忽略文件
├── README.md                # 项目文档
│
├── frontend/                # React前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   └── hooks/          # 自定义Hooks
│   ├── package.json        # 前端依赖
│   └── vite.config.ts      # Vite配置
│
├── src/                    # 核心业务逻辑
│   ├── main.py            # 主处理逻辑
│   ├── config.py          # 配置管理
│   ├── api.py             # API接口
│   ├── pipeline/          # 处理流水线
│   │   ├── step1_outline.py    # 大纲提取
│   │   ├── step2_timeline.py   # 时间轴生成
│   │   ├── step3_scoring.py    # 评分计算
│   │   ├── step4_title.py      # 标题生成
│   │   ├── step5_clustering.py # 聚类分析
│   │   └── step6_video.py      # 视频生成
│   ├── utils/             # 工具函数
│   │   ├── llm_client.py      # AI客户端
│   │   ├── video_processor.py # 视频处理
│   │   ├── text_processor.py  # 文本处理
│   │   ├── project_manager.py # 项目管理
│   │   ├── error_handler.py   # 错误处理
│   │   └── bilibili_downloader.py # B站下载
│   └── upload/            # 文件上传
│       └── upload_manager.py
│
├── data/                  # 数据文件
│   ├── projects.json     # 项目数据
│   └── settings.json     # 配置文件
│
├── uploads/              # 上传文件存储
│   ├── tmp/             # 临时下载文件
│   └── {project_id}/    # 项目文件
│       ├── input/       # 原始文件
│       └── output/      # 处理结果
│           ├── clips/   # 切片视频
│           └── collections/ # 合集视频
│
├── prompt/               # AI提示词模板
│   ├── business/        # 商业财经
│   ├── knowledge/       # 知识科普
│   ├── entertainment/   # 娱乐内容
│   └── ...
│
└── tests/               # 测试文件
    ├── test_config.py
    └── test_error_handler.py
```

## 🔧 配置说明

### API密钥配置
在 `data/settings.json` 中配置你的通义千问API密钥：
```json
{
  "dashscope_api_key": "your-api-key-here",
  "model_name": "qwen-plus",
  "chunk_size": 5000,
  "min_score_threshold": 0.7,
  "max_clips_per_collection": 5,
  "default_browser": "chrome"
}
```

### 浏览器配置
支持Chrome、Firefox、Safari等浏览器用于B站视频下载：
```json
{
  "default_browser": "chrome"
}
```

## 📖 使用指南

### 1. 上传本地视频
1. 访问 http://localhost:3000
2. 点击"上传视频"按钮
3. 选择视频文件和字幕文件（可选）
4. 填写项目名称和分类
5. 点击"开始处理"

### 2. 下载B站视频
1. 在首页点击"B站视频下载"
2. 输入B站视频链接
3. 选择浏览器（用于获取登录状态）
4. 点击"开始下载"

### 3. 编辑合集
1. 进入项目详情页面
2. 点击合集卡片进入编辑模式
3. 拖拽切片调整顺序
4. 添加或删除切片
5. 保存更改

### 4. 下载项目
1. 在项目卡片上点击下载按钮
2. 自动打包所有切片和合集
3. 下载完整的zip文件

## 🛠️ 开发指南

### 后端开发
```bash
# 启动开发服务器（支持热重载）
python backend_server.py

# 运行测试
pytest tests/
```

### 前端开发
```bash
cd frontend
npm run dev    # 开发模式
npm run build  # 生产构建
npm run lint   # 代码检查
```

### 添加新的视频分类
1. 在 `prompt/` 目录下创建新的分类文件夹
2. 添加对应的提示词模板文件
3. 在前端 `src/services/api.ts` 中添加分类选项

## 🐛 常见问题

### Q: 下载B站视频失败？
A: 确保已登录B站账号，并选择正确的浏览器。建议使用Chrome浏览器。

### Q: AI分析速度慢？
A: 可以调整 `chunk_size` 参数，较小的值会提高速度但可能影响质量。

### Q: 切片质量不高？
A: 调整 `min_score_threshold` 参数，较高的值会提高切片质量但减少数量。

### Q: 合集数量太少？
A: 调整 `max_clips_per_collection` 参数，增加每个合集的最大切片数量。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

### 💬 QQ交流群
> 请扫描下方二维码加入QQ交流群
> 
> ![QQ群二维码](./assets/qq_qr.jpg)

### 📱 飞书交流群  
> 请扫描下方二维码加入飞书交流群
> 
> ![飞书群二维码](./assets/feishu_qr.jpg)

### 📧 其他联系方式
- 提交 [GitHub Issue](https://github.com/zhouxiaoka/autoclip_mvp/issues)
- 发送邮件至：your-email@example.com
- 加入上述QQ或飞书交流群

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

⭐ 如果这个项目对你有帮助，请给它一个星标！