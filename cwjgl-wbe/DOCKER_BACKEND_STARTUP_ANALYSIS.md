# Docker 部署后端无法启动排查说明

## 结论

当前 Docker 部署后端无法启动，**最主要的原因不是业务代码本身，而是容器编排和镜像构建方式存在明显问题**。经过代码审查，可以确认以下几个高风险点：

1. `docker-compose.yml` 中存在 **backend 与 nginx 互相 depends_on 的循环依赖**。
2. `Dockerfile` 的前端构建阶段使用了错误的依赖安装方式，可能导致 **前端构建失败**，进而影响整个镜像构建流程。
3. 运行时后端依赖的外部业务接口在 Docker 容器内使用 `localhost`，会指向容器自身，而不是宿主机或外部服务，导致 **业务数据拉取失败**。
4. `docker-compose.yml` 里把 `./dist` 挂载到 nginx，但如果宿主机没有提前构建 `dist`，Nginx 将找不到前端静态文件。

这些问题会让人误以为“后端起不来”，但实际上常见表现是：
- 容器启动后立刻退出
- `docker-compose up` 失败
- backend 容器能启动，但健康检查失败
- 接口请求一直报错或返回空数据

---

## 一、后端技术栈说明

从当前项目代码看，后端是：

- **Node.js**
- **Express**
- **SQLite3**
- **Axios** 用于调用外部 API
- 入口文件：`server.js`
- 启动命令：`node server.js`

项目的 `package.json` 中已经定义：

- `npm run server` → `node server.js`
- `npm run db:init` → 初始化数据库

---

## 二、关键问题分析

### 1. `docker-compose.yml` 存在循环依赖

当前配置中：

- `backend` 依赖 `nginx`
- `nginx` 又依赖 `backend`

这会导致 Docker Compose 在调度容器启动顺序时出现冲突。对于服务编排来说，这种写法是不合理的。

#### 影响

- Compose 可能直接报错
- 或者服务启动顺序不稳定
- 容器互相等待，表现为“服务无法起来”

#### 建议

- **backend 不要依赖 nginx**
- `nginx` 可以依赖 `backend`，但更推荐只依赖 backend 的健康检查结果，或者完全取消 `depends_on`

---

### 2. `Dockerfile` 的依赖安装方式有问题

当前 Dockerfile 中前端构建阶段写法是：

```dockerfile
RUN npm ci --only=production && \
    npm ci --only=development
```

这个写法有问题。

#### 问题原因

- `npm ci --only=production` 只装生产依赖
- 紧接着 `npm ci --only=development` 会重新清理并只装开发依赖
- 构建前端需要 Vue、Vite 这类依赖，而它们的安装状态会被第二次安装覆盖

#### 典型结果

- `vite: command not found`
- `npm run build` 失败
- 镜像在构建阶段就失败，后端容器自然不会起来

#### 正确思路

前端构建阶段应安装 **完整依赖**：

```bash
npm ci
```

然后执行：

```bash
npm run build
```

构建完成后，最终运行镜像再安装生产依赖即可。

---

### 3. 容器内访问 `localhost` 会失效

在 `server.js` 中，业务接口地址写的是：

```javascript
const CWJ_API_BASE = 'http://localhost:8080/api';
```

#### 为什么这会出问题

在 Docker 容器中：

- `localhost` 指的是 **容器内部自己**
- 不是宿主机
- 也不是外部服务

因此后端容器启动后，去请求这个地址时，大概率会失败。

#### 影响

- 设备列表拉取失败
- 门店列表拉取失败
- AI 上下文为空
- 日志里会看到类似：

```text
Failed to fetch devices:
Failed to fetch stores:
```

#### 这会不会导致“后端起不来”

通常**不会直接阻止 Express 启动**，但会让功能表现异常，用户会误以为后端没启动成功。

#### 建议

把外部业务接口地址改成可配置环境变量，例如：

```javascript
const CWJ_API_BASE = process.env.CWJ_API_BASE || 'http://host.docker.internal:8080/api';
```

Linux 下可通过 `extra_hosts` 或 Docker 网络访问宿主服务。

---

### 4. Nginx 挂载的 `dist` 目录可能不存在

当前 `docker-compose.yml` 中：

```yaml
- ./dist:/usr/share/nginx/html:ro
```

#### 问题

如果在宿主机上没有先执行：

```bash
npm run build
```

那么 `./dist` 目录可能不存在，Nginx 启动后就找不到前端静态文件。

#### 影响

- 前端页面 404
- Nginx 配置表面正常，但访问空白页
- 用户可能会误判为后端异常

#### 建议

- 在宿主机先构建前端
- 或者改成单独前端容器，不依赖宿主机 `dist`
- 或者由 CI/CD 先生成静态文件，再进行部署

---

## 三、当前项目的真实启动链路

从代码看，后端启动过程大致是：

1. `node server.js`
2. 创建 Express 实例
3. 连接 SQLite 数据库
4. 初始化数据库表
5. 加载 `./data/详细分析报告.md`
6. 监听 `PORT=3000`
7. 接收 `/api/chat` 请求

如果容器日志里没有看到：

- `✅ SQLite Database connected`
- `✅ Database tables initialized`
- `Backend Server Started`

那说明问题发生在：

- 镜像构建阶段
- 容器启动命令阶段
- 端口映射阶段
- 或 Docker Compose 编排阶段

---

## 四、建议的修正方向

### 方案 A：先修编排，再修代码

优先修改以下内容：

1. 删除 `backend` 对 `nginx` 的 depends_on
2. 修改 Dockerfile 前端构建依赖安装方式
3. 把 `CWJ_API_BASE` 改成环境变量
4. 确保宿主机先有 `dist` 或由容器内统一生成

### 方案 B：拆成两个容器

更稳妥的方案是：

- 一个容器只跑后端 Node.js
- 一个容器只跑 Nginx 静态资源
- 前端静态文件单独构建后挂载或复制

这样更容易排查问题。

### 方案 C：先单独启动后端验证

建议先不启用 compose，单独验证：

```bash
npm install
npm run db:init
npm run server
```

确认后端本身没有问题后，再上 Docker。

---

## 五、推荐的排查顺序

如果 Docker 启动失败，按这个顺序排查：

1. 查看 `docker-compose logs backend`
2. 查看 `docker-compose logs nginx`
3. 检查 `docker-compose.yml` 是否存在循环依赖
4. 检查 `Dockerfile` 是否在构建阶段报错
5. 检查 `.env` 是否设置了 `DOUBAO_API_KEY`
6. 检查 `./dist` 是否已构建
7. 检查宿主机 3000、80、443 端口是否被占用
8. 检查后端是否能访问外部接口

---

## 六、建议的配置修正摘要

### `docker-compose.yml`

- 删除：`backend -> depends_on: nginx`
- 保留或调整：`nginx -> depends_on: backend`

### `Dockerfile`

把：

```dockerfile
RUN npm ci --only=production && \
    npm ci --only=development
```

改成：

```dockerfile
RUN npm ci
```

然后在最终镜像阶段只安装生产依赖。

### `server.js`

把：

```javascript
const CWJ_API_BASE = 'http://localhost:8080/api';
```

改成：

```javascript
const CWJ_API_BASE = process.env.CWJ_API_BASE || 'http://host.docker.internal:8080/api';
```

---

## 七、最终判断

当前 Docker 部署后端无法启动，**更像是部署配置问题，不是业务逻辑错误**。最可能的根因是：

1. **循环依赖导致容器无法按预期启动**
2. **Dockerfile 的依赖安装方式导致构建失败**
3. **容器内 localhost 指向错误导致业务请求失败**

如果你愿意，我下一步可以直接帮你把这些 Docker 配置修正掉，改成一版可以实际启动的 Docker 方案。
