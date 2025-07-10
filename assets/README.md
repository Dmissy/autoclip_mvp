# Assets 目录

此目录用于存放项目的静态资源文件，包括二维码图片等。

## 📱 二维码图片上传指南

### 1. 准备二维码图片
- QQ群二维码：保存为 `qq_qr.png`
- 飞书群二维码：保存为 `feishu_qr.png`
- 建议图片尺寸：300x300 像素
- 格式：PNG 或 JPG

### 2. 上传到GitHub
有两种方式上传图片：

#### 方式一：通过GitHub网页界面
1. 在GitHub仓库页面点击 "Add file" → "Upload files"
2. 将二维码图片拖拽到上传区域
3. 确保文件保存在 `assets/` 目录下
4. 填写提交信息，如："Add QR code images"
5. 点击 "Commit changes"

#### 方式二：通过Git命令行
```bash
# 将二维码图片复制到assets目录
cp /path/to/your/qq_qr.png assets/
cp /path/to/your/feishu_qr.png assets/

# 提交到Git
git add assets/
git commit -m "Add QR code images"
git push origin main
```

### 3. 验证显示
上传完成后，README.md中的二维码图片应该能正常显示。

## 📁 目录结构
```
assets/
├── README.md          # 本说明文件
├── qq_qr.png         # QQ群二维码（需要上传）
└── feishu_qr.png     # 飞书群二维码（需要上传）
``` 