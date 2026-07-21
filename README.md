# 🔐 网页版云注入客户端

> 基于 [laobi465/wlyz](https://github.com/laobi465/wlyz) (KeyAuth SaaS v0.6.6) SDK 规范构建的浏览器端云注入工具

<p align="center">
  <strong>无需安装客户端软件，浏览器即可完成卡密验证、云变量获取、心跳保活等全流程注入测试</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#安全特性">安全特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#签名算法">签名算法</a>
</p>

---

## 📖 项目介绍

**网页版云注入客户端** 是 `wlyz` 多租户卡密验证平台的配套工具，专为开发者、测试人员和技术支持团队设计。

### 🎯 解决什么问题？

在传统工作流中，要测试 `wlyz` 平台的云注入功能，开发者需要：
- ❌ 在客户端软件中集成 SDK
- ❌ 编写测试代码
- ❌ 编译运行调试
- ❌ 反复修改才能定位问题

**本工具** 将整个流程搬到浏览器：
- ✅ 输入后端地址 + AppKey + SignSecret 即可使用
- ✅ 所有客户端 API 一键调用
- ✅ 响应结果实时展示 + JSON 格式化
- ✅ 自动记录请求日志（脱敏）
- ✅ 支持心跳保活测试

### ✨ 核心能力

| 能力 | 描述 | 对应 wlyz API |
|------|------|--------------|
| 🔌 连接配置 | 配置后端地址和应用认证信息 | - |
| 🔑 登录验证 | 卡密登录、验证、登出 | `/api/v1/client/login` |
| ☁️ 云变量获取 | **核心功能** - 获取 AES-256-GCM 加密的云变量 | `/api/v1/client/get_var` |
| 💓 心跳保活 | 自动定时发送心跳，保持设备在线 | `/api/v1/client/heartbeat` |
| 📢 公告获取 | 获取应用公告 | `/api/v1/client/notice` |
| 🔄 版本检查 | 检查应用版本更新 | `/api/v1/client/version` |
| 📋 安全日志 | 记录所有请求/响应（脱敏） | - |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- 现代浏览器（Chrome 90+ / Firefox 88+ / Safari 14+）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/laobi465/yunzhuru.git
cd yunzhuru

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 打开 http://localhost:5173

# 生产构建
npm run build
# dist/ 目录可部署到任何静态托管
```

### 部署方式

本工具是**纯前端应用**，无后端依赖，可直接部署到：

- GitHub Pages
- Vercel
- Cloudflare Pages
- Netlify
- 任何静态文件服务器

---

## 📚 使用指南

### 1️⃣ 配置连接

打开网页后，在「连接配置」页填写：

| 字段 | 说明 | 示例 |
|------|------|------|
| 后端 API 地址 | wlyz 后端部署地址 | `https://your-server.com` |
| AppKey | 从 wlyz 后台「应用管理」复制 | `ak_xxxxxxxxxxxx` |
| SignSecret | 从 wlyz 后台「应用管理」复制 | `xxxxxxxxxxxx` |

点击「测试连接」验证配置正确性。

### 2️⃣ 登录验证

切换到「登录验证」页：
1. 输入 32 字符卡密（或从剪贴板粘贴）
2. 输入硬件指纹（HWID）或点击按钮自动生成
3. 点击「登录」/「验证」/「登出」按钮
4. 查看响应结果

### 3️⃣ 获取云变量（核心）

切换到「云变量」页：
1. 输入变量键（如 `notice_text`、`config_json`、`max_retry`）
2. 点击「获取云变量」
3. 查看解密后的值：
   - **string** 类型：纯文本展示
   - **number** 类型：数字展示
   - **json** 类型：自动格式化高亮
   - **bool** 类型：布尔值展示

### 4️⃣ 心跳保活

切换到「心跳」页：
1. 设置心跳间隔（默认 60 秒，范围 30-300 秒）
2. 点击「启动心跳」
3. 查看在线状态和心跳日志
4. 完成后点击「停止心跳」

### 5️⃣ 查看日志

切换到「日志」页：
- 查看所有请求的时间、操作、状态、耗时
- 点击展开查看请求和响应详情（已脱敏）
- 点击「清除日志」清空记录

---

## 🔒 安全特性

### 前端安全

- **🛡️ 敏感信息不持久化**：SignSecret 仅存储在运行时内存，不会写入 localStorage 或 sessionStorage
- **🔐 HTTPS 强制**：生产环境部署需配置 HSTS
- **🚫 CSP 头**：限制脚本和样式来源
- **👁️ 日志脱敏**：自动隐藏卡密、密钥等敏感信息

### 签名算法

完全对齐 wlyz Node.js SDK (`sdks/nodejs/index.js`)：

```
签名原文 = METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY
签名算法 = HMAC-SHA512/256（SHA-512 前 32 字节）
输出格式 = 64 位小写 hex
```

请求头：
| 头部 | 说明 |
|------|------|
| `X-App-Key` | 应用 AppKey |
| `X-Timestamp` | Unix 时间戳（秒） |
| `X-Nonce` | 32 字符随机 hex |
| `X-Signature` | 64 字符 hex 签名 |

### 实现细节

```typescript
// 使用浏览器原生 Web Crypto API
async function hmacSha512_256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  
  // SHA-512/256 = SHA-512 前 32 字节（256 位）
  const truncated = new Uint8Array(signature).slice(0, 32);
  return Array.from(truncated)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.4+ | 前端框架（组合式 API） |
| TypeScript | 5.3+ | 类型安全 |
| Vite | 5.x | 构建工具 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由 |
| Tailwind CSS | 3.4+ | 样式 |
| Web Crypto API | 浏览器内置 | HMAC-SHA512/256 签名 |

---

## 📁 项目结构

```
cloud-injection-client/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── KeyAuthClient.ts      # API 封装 + HMAC 签名
│   ├── layouts/
│   │   └── MainLayout.vue        # 主布局（顶部导航）
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── stores/
│   │   ├── config.ts             # 连接配置状态
│   │   └── logs.ts               # 日志状态
│   ├── views/
│   │   ├── Config.vue            # 连接配置页
│   │   ├── Login.vue             # 登录验证页
│   │   ├── CloudVars.vue         # 云变量页
│   │   ├── Heartbeat.vue         # 心跳管理页
│   │   ├── Notice.vue            # 公告与版本页
│   │   └── Logs.vue              # 安全日志页
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔗 wlyz 后端 CORS 配置

使用本工具前，需在 wlyz 后端配置 CORS 允许前端域名：

```go
// apps/server/internal/router/router.go
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://your-frontend-domain.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{
        "Content-Type",
        "X-App-Key",
        "X-Timestamp",
        "X-Nonce",
        "X-Signature",
    },
    AllowCredentials: false,
    MaxAge:           300,
}))
```

---

## 🎨 界面预览

### 设计风格

- **主色调**：深空蓝（#0B1220）+ 霓虹青（#00E5FF）+ 警示红（#FF4757）+ 成功绿（#00D68F）
- **字体**：JetBrains Mono（密钥/卡密）+ Inter（正文）
- **布局**：顶部标签页 + 主内容卡片，桌面优先响应式

### 页面亮点

- **连接配置**：深色玻璃拟态卡片，SignSecret 默认隐藏可临时显示
- **登录验证**：三按钮横向排列，响应结果代码块展示
- **云变量**：类型彩色 tag，JSON 自动格式化高亮
- **心跳**：圆形状态灯 + 时间戳，心跳日志列表
- **日志**：时间线样式，可折叠查看详情

---

## 📝 使用示例

### 场景 1：调试云变量注入

开发者创建了一个云变量 `config_json`，需要在客户端软件中注入。使用本工具验证：

1. 配置连接 → 测试连接成功
2. 输入测试卡密 → 登录成功
3. 切换到「云变量」→ 输入 `config_json` → 获取
4. 查看 JSON 格式化的值，确认内容正确
5. 客户端软件使用相同卡密调用 SDK，获取相同值注入到运行时

### 场景 2：验证心跳保活

测试心跳功能是否正常工作：

1. 登录后切换到「心跳」页
2. 设置间隔为 30 秒
3. 点击「启动心跳」
4. 观察 1 分钟内是否稳定在线
5. 在 wlyz 后台「设备/会话」页确认设备状态为在线

### 场景 3：排查签名问题

客户端 SDK 调用失败，怀疑签名算法不匹配：

1. 使用本工具登录，确认成功（说明签名算法正确）
2. 查看日志页的请求详情
3. 对比客户端 SDK 的签名原文和签名结果
4. 定位差异并修复

---

## ❓ 常见问题

### Q1: 连接测试失败怎么办？

**A**: 检查以下几点：
1. 后端地址是否正确（不要带末尾斜杠）
2. AppKey 和 SignSecret 是否从 wlyz 后台正确复制
3. wlyz 后端是否配置了 CORS 允许当前域名
4. 后端服务是否正常运行

### Q2: 登录失败提示「卡密不存在」？

**A**: 卡密可能未正确生成，或属于其他应用。在 wlyz 后台「卡密管理」页确认卡密状态和所属应用。

### Q3: 获取云变量失败提示「云变量不存在」？

**A**: 云变量可能在其他应用下，或变量键拼写错误。在 wlyz 后台「云变量」页确认变量所属应用和键名。

### Q4: 心跳停止后设备还显示在线？

**A**: wlyz 后端心跳超时时间默认为 90 秒，需等待超时后设备才会自动下线。

### Q5: 签名校验失败怎么办？

**A**: 确认：
1. SignSecret 是否从 wlyz 后台「应用管理」正确复制（不是 AppSecret）
2. 本地系统时间是否准确（签名允许 ±5 分钟偏差）
3. 浏览器是否支持 Web Crypto API（Chrome 90+ / Firefox 88+ / Safari 14+）

---

## 🤝 关联项目

- **wlyz (KeyAuth SaaS)**: [https://github.com/laobi465/wlyz](https://github.com/laobi465/wlyz)
  - 多租户卡密验证 SaaS 平台后端
  - 提供 `/api/v1/client/*` 系列客户端验证 API

---

## 📦 在线 Demo

部署完成后可通过 GitHub Pages 访问在线版本：

👉 **[https://laobi465.github.io/yunzhuru/](https://laobi465.github.io/yunzhuru/)**

---

## 📜 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [wlyz](https://github.com/laobi465/wlyz) 项目提供的 SDK 规范和签名算法
- [Vue.js](https://vuejs.org/) 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) 实用优先的 CSS 框架
- [Element Plus](https://element-plus.org/) Vue 3 组件库

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/laobi465">laobi465</a>
</p>