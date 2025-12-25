# 部署指南 - VTuber歌单管理系统

## 快速开始

### 前置要求
- Node.js 18+ 和 npm
- （可选）PostgreSQL 数据库（当前使用JSON文件存储）

### 开发环境部署

1. **克隆项目**
```bash
cd SongList-master
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```
服务器将在 `http://localhost:5000` 启动

3. **访问应用**
   - 公共主页：`http://localhost:5000/`
   - 配置面板：`http://localhost:5000/config`（需要密码）
   - 歌单管理：`http://localhost:5000/yu`（需要密码）

### 生产环境部署

#### 步骤 1：构建项目
```bash
npm run build
```
这会生成：
- `dist/public/` - 前端资源
- `dist/index.cjs` - 后端服务器

#### 步骤 2：启动生产服务器
```bash
npm start
```

#### 步骤 3：配置环境变量（可选）

如果使用PostgreSQL数据库，创建 `.env` 文件：
```
DATABASE_URL=postgresql://user:password@localhost:5432/vtuber_songs
NODE_ENV=production
```

### 在 Replit 上部署

#### 方法 1：点击"发布"按钮
1. 在Replit编辑器中，点击右上角"发布"按钮
2. Replit会自动生成公开URL
3. 你的网站将可在该URL访问

#### 方法 2：手动配置

在Replit中配置部署：
```
部署类型：Autoscale
运行命令：npm start
```

### 文件结构说明

```
SongList-master/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── config.tsx  # 配置管理页面
│   │   │   ├── admin-songs.tsx # 歌单管理页面
│   │   │   └── home.tsx    # 公共主页
│   │   ├── components/     # 可复用组件
│   │   │   ├── hero-section.tsx  # 顶部卡片展示
│   │   │   └── ...
│   │   └── App.tsx
│   └── public/
│       └── uploads/        # 用户上传的图片
├── server/                 # 后端代码
│   ├── index.ts           # 应用入口
│   ├── routes.ts          # API路由
│   └── storage.ts         # 数据持久化
├── shared/                # 共享代码
│   └── schema.ts          # Zod schema定义
├── data/                  # 数据文件
│   ├── site-config.json   # 网站配置
│   └── songs.json         # 歌单数据
└── dist/                  # 构建输出
    ├── public/
    └── index.cjs
```

### 数据存储

#### JSON 文件模式（默认）
- 配置：`data/site-config.json`
- 歌单：`data/songs.json`
- 上传图片：`client/public/uploads/`

#### PostgreSQL 模式（可选）
```bash
npm run db:push  # 初始化数据库
```

### 常见问题

#### Q: 如何修改管理员密码？
A: 在配置页面 → 主题标签 → 管理密码，输入新密码并保存

#### Q: 上传的图片存储在哪里？
A: 默认存储在 `client/public/uploads/` 目录

#### Q: 可以使用自己的域名吗？
A: 可以。在Replit发布后，在域名DNS设置中指向Replit提供的域名，或使用自定义域名功能

#### Q: 如何备份数据？
A: 备份 `data/site-config.json` 和 `data/songs.json` 文件

### 性能优化建议

1. **启用HTTPS**：生产环境应使用HTTPS
2. **CDN**：使用CDN加速静态资源
3. **缓存**：配置适当的HTTP缓存头
4. **图片优化**：上传前压缩图片大小

### 监控和维护

**检查服务器状态**
```bash
# 查看运行日志
npm run dev  # 开发模式
# 或在Replit的Logs标签页查看
```

**定期备份**
- 每周备份 `data/` 目录
- 每周备份 `client/public/uploads/` 目录

### 故障排除

#### 网站无法访问
1. 确认服务器运行：`npm run dev`
2. 检查防火墙设置
3. 检查端口是否被占用

#### 上传图片失败
1. 检查文件大小（限制5MB）
2. 确认上传目录权限
3. 检查磁盘空间

#### 配置修改未生效
1. 重新加载页面（Ctrl+F5）
2. 检查浏览器缓存
3. 重启服务器

### 更新项目

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 启动服务器
npm start
```
