# Nginx 配置和部署指南

## 概述

本指南说明如何使用 Nginx 作为反向代理来部署 VTuber 歌单管理网站，并通过 Let's Encrypt SSL 证书启用 HTTPS。

---

## 前置条件

- 服务器（Linux/Ubuntu/Debian）
- 域名：`vlive.top`（已指向服务器IP）
- 已安装：Nginx、Node.js、Certbot

### 安装依赖

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx nodejs npm -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 步骤 1：配置 SSL 证书

### 使用 Let's Encrypt 获取免费证书

```bash
# 申请证书
sudo certbot certonly --standalone -d vlive.top -d www.vlive.top

# 或者使用 Nginx 插件（更推荐）
sudo certbot certonly --nginx -d vlive.top -d www.vlive.top
```

**验证证书位置：**
```bash
ls -la /etc/letsencrypt/live/vlive.top/
```

你应该看到：
- `fullchain.pem` - 完整证书链
- `privkey.pem` - 私钥

---

## 步骤 2：配置 Nginx

### 复制 nginx.conf 到 Nginx 站点目录

```bash
# 方法 1：使用提供的配置文件
sudo cp nginx.conf /etc/nginx/sites-available/vlive.top

# 方法 2：编辑现有配置
sudo nano /etc/nginx/sites-available/vlive.top
```

### 配置文件内容

使用项目中提供的 `nginx.conf` 文件，其中包含：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name vlive.top www.vlive.top;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name vlive.top www.vlive.top;
    
    ssl_certificate /etc/letsencrypt/live/vlive.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vlive.top/privkey.pem;
    
    # 反向代理到 Node.js 应用（端口 5000）
    location / {
        proxy_pass http://localhost:5000;
        # ...其他配置
    }
}
```

### 启用配置

```bash
# 创建符号链接到 sites-enabled
sudo ln -s /etc/nginx/sites-available/vlive.top /etc/nginx/sites-enabled/

# 禁用默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置语法
sudo nginx -t

# 输出应该是：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 重新加载 Nginx

```bash
sudo systemctl reload nginx
```

---

## 步骤 3：启动 Node.js 应用

### 构建项目

```bash
cd /home/user/SongList-master
npm install
npm run build
```

### 启动应用

#### 方法 1：直接运行（开发/测试）
```bash
npm start
```

#### 方法 2：使用 PM2 管理进程（推荐生产环境）

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start npm --name "vlive-song-list" -- start

# 开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs vlive-song-list
```

#### 方法 3：使用 Systemd 服务

创建 `/etc/systemd/system/vlive-songlist.service`：

```ini
[Unit]
Description=VTuber Song List Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/user/SongList-master
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl start vlive-songlist
sudo systemctl enable vlive-songlist
```

---

## 步骤 4：配置防火墙

```bash
# 允许 HTTP
sudo ufw allow 80/tcp

# 允许 HTTPS
sudo ufw allow 443/tcp

# 允许 SSH（重要！避免被锁定）
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable
```

---

## 步骤 5：验证部署

### 测试 HTTPS 访问

```bash
# 使用 curl 测试
curl -I https://vlive.top

# 应该返回 200 OK
# HTTP/2 200
# ...
```

### 测试 HTTP 重定向

```bash
curl -I http://vlive.top

# 应该返回 301 重定向到 HTTPS
# HTTP/1.1 301 Moved Permanently
# Location: https://vlive.top/
```

### 测试 API 接口

```bash
# 获取配置
curl https://vlive.top/api/config

# 应该返回 JSON 配置数据
```

---

## 步骤 6：SSL 证书自动续期

Let's Encrypt 证书有效期为 90 天，需要自动续期。

### 配置自动续期

```bash
# 测试续期（不实际执行）
sudo certbot renew --dry-run

# 设置 cron 任务自动续期
sudo crontab -e

# 添加以下行：
# 每月1号凌晨2点运行续期，并重新加载 Nginx
0 2 1 * * /usr/bin/certbot renew --quiet && /bin/systemctl reload nginx
```

### 验证续期

```bash
# 查看证书过期日期
openssl x509 -noout -dates -in /etc/letsencrypt/live/vlive.top/cert.pem

# 输出示例：
# notBefore=Dec 25 10:00:00 2025 GMT
# notAfter=Mar 25 10:00:00 2026 GMT
```

---

## Nginx 配置详解

### 关键配置说明

#### 1. SSL 协议和密码
```nginx
ssl_protocols TLSv1.2 TLSv1.3;           # 使用安全的 TLS 版本
ssl_ciphers HIGH:!aNULL:!MD5;            # 高强度加密套件
ssl_prefer_server_ciphers on;             # 优先使用服务器指定的密码
```

#### 2. HSTS 头
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
# 强制浏览器使用 HTTPS，有效期 1 年
```

#### 3. Gzip 压缩
```nginx
gzip on;
gzip_types text/plain text/css ...;      # 启用压缩，指定压缩文件类型
gzip_min_length 1000;                     # 只压缩 >1KB 的响应
```

#### 4. 反向代理
```nginx
location / {
    proxy_pass http://localhost:5000;     # 转发到 Node.js 应用
    proxy_set_header Host $host;          # 保留原始 Host 头
    proxy_set_header X-Real-IP $remote_addr;        # 传递客户端 IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 转发链
}
```

#### 5. 静态文件缓存
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
    expires 30d;                          # 浏览器缓存 30 天
    add_header Cache-Control "public, immutable";
}
```

#### 6. 上传文件大小限制
```nginx
client_max_body_size 10M;                 # 允许最大 10MB 上传
```

---

## 常见问题

### Q1: SSL 证书获取失败？

**原因**：DNS 未指向服务器，或防火墙阻止了 80/443 端口。

**解决**：
```bash
# 1. 验证 DNS
nslookup vlive.top
# 应该返回服务器 IP 地址

# 2. 检查防火墙
sudo ufw status

# 3. 确保端口开放
sudo ss -tlnp | grep :80
sudo ss -tlnp | grep :443
```

### Q2: Nginx 连接被拒绝？

**可能原因**：Node.js 应用未启动

**解决**：
```bash
# 检查应用是否运行
ps aux | grep "npm start"

# 检查端口 5000 是否监听
sudo ss -tlnp | grep 5000

# 查看应用日志
npm start  # 直接运行查看错误信息
```

### Q3: 网站显示 502 Bad Gateway？

**原因**：Nginx 无法连接到 Node.js 应用

**解决**：
```bash
# 1. 确认应用运行
pm2 status

# 2. 检查应用日志
pm2 logs vlive-song-list

# 3. 测试本地连接
curl http://localhost:5000

# 4. 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### Q4: HTTPS 显示不安全警告？

**原因**：证书问题

**解决**：
```bash
# 检查证书日期
openssl x509 -noout -dates -in /etc/letsencrypt/live/vlive.top/cert.pem

# 手动续期
sudo certbot renew --force-renewal
```

### Q5: 怎样提高网站速度？

**建议**：
1. 启用 HTTP/2（已在配置中启用）
2. 启用 Gzip 压缩（已在配置中启用）
3. 配置静态文件缓存（已在配置中启用）
4. 考虑使用 CDN

---

## 监控和维护

### 查看 Nginx 状态

```bash
# 进程状态
sudo systemctl status nginx

# 重载配置
sudo systemctl reload nginx

# 查看日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 查看应用状态（PM2）

```bash
# 进程列表
pm2 list

# 实时日志
pm2 logs vlive-song-list

# 重启应用
pm2 restart vlive-song-list
```

### 性能监控

```bash
# 查看 Nginx 工作进程
ps aux | grep nginx

# 查看端口占用
sudo netstat -tlnp | grep -E ':(80|443|5000)'

# 查看磁盘使用
df -h
du -sh /home/user/SongList-master
```

---

## 备份建议

定期备份以下内容：

```bash
# 备份 SSL 证书
sudo tar -czf ~/backup/ssl-certs.tar.gz /etc/letsencrypt/

# 备份应用配置
tar -czf ~/backup/songlist-data.tar.gz /home/user/SongList-master/data/

# 备份应用数据（图片等）
tar -czf ~/backup/songlist-uploads.tar.gz /home/user/SongList-master/client/public/uploads/
```

---

## 恢复步骤

如果需要恢复：

```bash
# 恢复 SSL 证书
sudo tar -xzf ~/backup/ssl-certs.tar.gz -C /

# 恢复应用数据
tar -xzf ~/backup/songlist-data.tar.gz -C /

# 恢复上传的文件
tar -xzf ~/backup/songlist-uploads.tar.gz -C /

# 重启应用
sudo systemctl restart vlive-songlist
sudo systemctl reload nginx
```

---

## 安全建议

1. **定期更新**：保持 Nginx、Node.js、系统补丁最新
2. **监控日志**：定期检查 Nginx 和应用日志
3. **备份数据**：定期备份所有用户数据
4. **SSL 续期**：确保自动续期正常运行
5. **防火墙**：只开放必要的端口（80, 443, 22）
6. **密码安全**：定期更改管理员密码
7. **DDoS 防护**：考虑使用 Cloudflare 或其他 DDoS 防护服务

---

## 完成清单

- [ ] 安装 Nginx、Certbot、Node.js
- [ ] 申请 SSL 证书
- [ ] 复制 nginx.conf 配置
- [ ] 启动 Node.js 应用
- [ ] 配置防火墙
- [ ] 测试 HTTPS 访问
- [ ] 设置自动续期
- [ ] 配置 PM2 开机自启
- [ ] 设置备份策略
- [ ] 监控应用状态

---

**最后更新**：2025年12月25日

更多帮助，请参考：
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [Certbot 使用指南](https://certbot.eff.org/instructions)
