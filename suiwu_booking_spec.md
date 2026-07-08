# 随舞路演比赛约拍登记网页 MVP Spec

## 1. 项目定位

本项目是一个面向单次路演比赛活动的轻量网页系统，用于解决“舞者查询可约摄影师、摄影师维护自己可接节目状态”的问题。

第一版不是完整用户系统，也不是正式约拍平台，而是一个：

- 舞者查询系统
- 摄影师状态登记系统
- 单活动节目约拍辅助工具

## 2. MVP 目标

### 2.1 主要目标

舞者可以输入自己的昵称，查询自己参与的节目，并查看这些节目目前有哪些摄影师可接拍。

摄影师可以通过已登记的摄影 ID 进入系统，首次设置自己的密码、微信号和可选样片链接，之后登录管理自己对各个节目的可接状态。

### 2.2 非目标

第一版暂不实现以下功能：

- 正式用户注册系统
- 邮箱登录、短信登录、第三方登录
- Supabase Auth
- 约拍申请记录
- 摄影确认接单流程
- 记录具体约了哪位舞者
- 聊天系统
- 支付系统
- 多活动管理
- 小程序端
- 复杂后台管理系统

## 3. 用户角色

## 3.1 舞者 Dancer

舞者不需要注册，也不需要密码。

舞者通过输入昵称查询：

- 自己参与的所有节目
- 每个节目当前可接拍的摄影师列表
- 点开摄影师后查看：
  - 摄影师显示名
  - 微信号
  - 样片链接，若有
  - 一键复制微信号
  - 一键复制样片链接，若有

当前假设舞者昵称不会重复，因此第一版不处理重名问题。

## 3.2 摄影师 Photographer

摄影师名单由主办方提前导入。

摄影师不能自由注册，必须使用预先登记的摄影 ID 进入系统。

摄影师首次登录流程：

1. 输入摄影 ID。
2. 系统验证该 ID 是否存在于已登记摄影名单。
3. 如果存在且还未设置密码，进入首次设置页。
4. 摄影师设置密码。
5. 摄影师填写微信号。
6. 摄影师可选填写样片链接。
7. 完成后进入摄影管理页。

摄影师后续登录流程：

1. 输入摄影 ID。
2. 输入密码。
3. 登录成功后进入摄影管理页。

摄影师可以：

- 查看完整节目单。
- 对每个节目切换“可接 / 不可接”。
- 默认所有节目均为“不可接”。
- 点击某个节目旁边的“可接”按钮后，该节目变为可接。
- 再次点击或关闭后，该节目变回不可接。
- 使用“一键全部可接”按钮，将全部节目设为可接。
- 使用“一键全部不可接”按钮，将全部节目设为不可接。
- 修改自己的微信号。
- 修改自己的样片链接。
- 修改密码。

## 4. 核心业务规则

## 4.1 节目和舞者关系

一个节目可以有多个舞者。

一个舞者可以参加多个节目。

因此节目和舞者是多对多关系。

## 4.2 摄影和节目关系

一个摄影师可以选择多个节目为“可接”。

一个节目可以有多个摄影师为“可接”。

摄影师接了某个节目中的任意一个舞者后，应自行将该节目切换为“不可接”。

系统不记录摄影师具体接了哪个舞者，也不记录约拍过程。

## 4.3 可接状态

第一版只保留二元状态：

- 可接：available = true
- 不可接：available = false

不区分“已约”“不拍”“未设置”。

默认状态为不可接。

舞者端只展示 available = true 的摄影师。

## 4.4 联系方式展示

舞者在节目下只看到可接摄影师列表。

列表中可以显示：

- 摄影师显示名
- “查看详情”按钮

点开摄影师详情后显示：

- 微信号
- 样片链接，若有
- 复制微信按钮
- 复制样片链接按钮，若有

## 5. 页面结构

## 5.1 首页 `/`

首页提供两个入口：

- 我是舞者，查询可约摄影
- 我是摄影，管理可接节目

手机端优先设计。

## 5.2 舞者查询页 `/dancer`

### 页面元素

- 标题：舞者约拍查询
- 昵称输入框
- 查询按钮

### 查询成功后显示

按节目分组展示：

- 节目序号
- 节目名称
- 歌曲名，若有
- 同组舞者名单，若需要显示
- 当前可接摄影师列表

### 无结果情况

如果昵称不在舞者名单中：

> 未找到该昵称对应的参赛节目，请确认昵称是否与报名名单一致。

如果舞者有节目，但某节目暂无可接摄影：

> 当前暂无可接摄影，请稍后刷新查看。

## 5.3 摄影登录页 `/photographer/login`

### 页面元素

- 摄影 ID 输入框
- 密码输入框
- 登录按钮

### 首次登录逻辑

如果摄影 ID 存在，但 password_hash 为空：

- 跳转到首次设置页 `/photographer/setup`
- 要求设置密码、填写微信号、可选填写样片链接

## 5.4 摄影首次设置页 `/photographer/setup`

### 页面元素

- 摄影 ID，只读展示
- 摄影显示名，只读展示
- 设置密码
- 确认密码
- 微信号，必填
- 样片链接，选填
- 保存并进入管理页按钮

### 校验规则

- 密码不能为空。
- 两次密码必须一致。
- 微信号不能为空。
- 样片链接若填写，应为 URL 格式，暂不强制复杂校验。

## 5.5 摄影管理页 `/photographer/dashboard`

### 顶部信息

- 摄影师显示名
- 微信号
- 样片链接，若有
- 编辑资料按钮
- 退出登录按钮

### 快捷操作

- 一键全部可接
- 一键全部不可接

### 节目列表

每个节目以卡片展示：

- 节目序号
- 节目名称
- 歌曲名，若有
- 当前状态：可接 / 不可接
- 状态切换按钮

推荐按钮文案：

如果当前不可接：

> 设为可接

如果当前可接：

> 设为不可接

## 5.6 摄影资料编辑页或弹窗

允许摄影师修改：

- 微信号
- 样片链接
- 密码

## 6. 数据库设计

建议使用 Supabase Postgres。

第一版不使用 Supabase Auth。

## 6.1 `programs` 节目表

```sql
create table programs (
  id uuid primary key default gen_random_uuid(),
  order_no int not null,
  title text not null,
  song_name text,
  group_name text,
  note text,
  created_at timestamptz default now()
);
```

字段说明：

- `order_no`：节目顺序。
- `title`：节目名称。
- `song_name`：歌曲名，可选。
- `group_name`：分组名，可选。
- `note`：备注，可选。

## 6.2 `dancers` 舞者表

```sql
create table dancers (
  id uuid primary key default gen_random_uuid(),
  nickname text unique not null,
  display_name text,
  created_at timestamptz default now()
);
```

字段说明：

- `nickname`：舞者查询用昵称，第一版假设唯一。
- `display_name`：展示名，可选。

## 6.3 `program_dancers` 节目-舞者关联表

```sql
create table program_dancers (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  dancer_id uuid not null references dancers(id) on delete cascade,
  unique (program_id, dancer_id)
);
```

## 6.4 `photographers` 摄影师表

```sql
create table photographers (
  id uuid primary key default gen_random_uuid(),
  photographer_code text unique not null,
  display_name text not null,
  password_hash text,
  wechat text,
  sample_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

字段说明：

- `photographer_code`：摄影师登录 ID，由主办方提前导入。
- `display_name`：摄影师展示名。
- `password_hash`：密码哈希。为空表示还未首次设置密码。
- `wechat`：微信号。
- `sample_url`：样片链接，可选。
- `is_active`：是否允许使用系统。

## 6.5 `photographer_program_status` 摄影-节目可接状态表

```sql
create table photographer_program_status (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references photographers(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  available boolean not null default false,
  updated_at timestamptz default now(),
  unique (photographer_id, program_id)
);
```

字段说明：

- `available = true`：摄影师该节目可接。
- `available = false`：摄影师该节目不可接。

## 7. 推荐 API 设计

可以使用 Next.js Route Handlers。

## 7.1 舞者查询

### `POST /api/dancer/search`

请求：

```json
{
  "nickname": "小七"
}
```

返回：

```json
{
  "dancer": {
    "id": "uuid",
    "nickname": "小七",
    "display_name": "小七"
  },
  "programs": [
    {
      "id": "uuid",
      "order_no": 1,
      "title": "Drama",
      "song_name": "aespa - Drama",
      "dancers": [
        {
          "nickname": "小七"
        },
        {
          "nickname": "小A"
        }
      ],
      "available_photographers": [
        {
          "id": "uuid",
          "display_name": "Nico",
          "wechat": "nico_wechat",
          "sample_url": "https://example.com"
        }
      ]
    }
  ]
}
```

## 7.2 摄影登录

### `POST /api/photographer/login`

请求：

```json
{
  "photographer_code": "nico001",
  "password": "password"
}
```

返回：

```json
{
  "success": true,
  "needs_setup": false
}
```

如果摄影 ID 存在但还没设置密码：

```json
{
  "success": true,
  "needs_setup": true
}
```

如果不存在：

```json
{
  "success": false,
  "message": "未找到该摄影 ID，请确认是否已登记。"
}
```

## 7.3 摄影首次设置

### `POST /api/photographer/setup`

请求：

```json
{
  "photographer_code": "nico001",
  "password": "password",
  "wechat": "nico_wechat",
  "sample_url": "https://example.com"
}
```

## 7.4 获取摄影管理数据

### `GET /api/photographer/dashboard`

返回当前摄影师信息和节目状态列表。

```json
{
  "photographer": {
    "display_name": "Nico",
    "wechat": "nico_wechat",
    "sample_url": "https://example.com"
  },
  "programs": [
    {
      "id": "uuid",
      "order_no": 1,
      "title": "Drama",
      "song_name": "aespa - Drama",
      "available": true
    }
  ]
}
```

## 7.5 更新单个节目状态

### `POST /api/photographer/program-status`

请求：

```json
{
  "program_id": "uuid",
  "available": true
}
```

## 7.6 批量更新全部节目状态

### `POST /api/photographer/program-status/bulk`

请求：

```json
{
  "available": true
}
```

## 7.7 更新摄影资料

### `POST /api/photographer/profile`

请求：

```json
{
  "wechat": "new_wechat",
  "sample_url": "https://example.com",
  "password": "new_password_optional"
}
```

## 8. Session 和安全要求

因为第一版不使用 Supabase Auth，所以需要自定义轻量 session。

建议：

- 登录成功后设置 httpOnly cookie。
- cookie 中不要存明文密码。
- 可以存一个签名 session token。
- token 在服务端校验。
- 所有摄影端写操作都必须验证 session。
- 不要把 Supabase service role key 暴露到浏览器。
- Supabase service role key 只能在 server-side API route 中使用。
- 密码必须使用 bcrypt 或 argon2 哈希保存。
- 舞者查询接口只读，不允许写数据库。

## 9. UI 风格要求

整体风格：

- 手机端优先。
- 简洁、清楚、少步骤。
- 卡片式布局。
- 按钮足够大，方便手机点击。
- 状态颜色清晰：
  - 可接：明显绿色或高亮
  - 不可接：灰色
- 不做复杂表格。
- 不做花哨动效。

建议使用：

- Tailwind CSS
- shadcn/ui
- lucide-react 图标，可选

## 10. 移动端交互细节

## 10.1 舞者端

摄影师列表中不要直接堆太多信息。

推荐结构：

```text
Nico
[查看联系方式]
```

点开详情弹窗：

```text
摄影师：Nico
微信号：nico_wechat
[复制微信]

样片链接：
https://example.com
[复制链接]
```

复制成功后显示 toast：

```text
已复制
```

## 10.2 摄影端

节目列表使用卡片：

```text
节目 01
Drama
aespa - Drama

当前：不可接
[设为可接]
```

如果可接：

```text
当前：可接
[设为不可接]
```

顶部放批量按钮：

```text
[一键全部可接]
[一键全部不可接]
```

批量操作需要确认弹窗，避免误触。

## 11. 数据导入方式

第一版可以不做导入后台。

建议通过 Supabase Table Editor 或 SQL seed 文件导入：

- 节目单
- 舞者名单
- 节目-舞者关联
- 摄影师名单

可以在项目中保留一个 `supabase/seed.sql`，用于初始化测试数据。

## 12. 推荐项目结构

```text
app/
  page.tsx
  dancer/
    page.tsx
  photographer/
    login/
      page.tsx
    setup/
      page.tsx
    dashboard/
      page.tsx
  api/
    dancer/
      search/
        route.ts
    photographer/
      login/
        route.ts
      setup/
        route.ts
      dashboard/
        route.ts
      program-status/
        route.ts
        bulk/
          route.ts
      profile/
        route.ts

components/
  DancerSearchForm.tsx
  ProgramCard.tsx
  PhotographerCard.tsx
  PhotographerDetailDialog.tsx
  PhotographerLoginForm.tsx
  PhotographerSetupForm.tsx
  PhotographerProgramStatusCard.tsx

lib/
  supabaseAdmin.ts
  auth.ts
  password.ts
  validators.ts
  types.ts

supabase/
  schema.sql
  seed.sql
```

## 13. 验收标准

## 13.1 舞者端

- 输入存在的舞者昵称后，可以看到该舞者参与的所有节目。
- 每个节目下只显示当前 available = true 的摄影师。
- 点击摄影师可以看到微信号和样片链接。
- 微信号可以一键复制。
- 样片链接可以一键复制。
- 输入不存在的昵称时有清晰错误提示。
- 某节目暂无可约摄影时有清晰提示。

## 13.2 摄影端

- 未登记摄影 ID 无法进入系统。
- 已登记但未设置密码的摄影师可以首次设置密码、微信和样片链接。
- 已设置密码的摄影师需要输入正确密码才能进入。
- 摄影师可以看到完整节目单。
- 默认全部节目不可接。
- 摄影师可以单独切换某个节目可接或不可接。
- 摄影师可以一键全部可接。
- 摄影师可以一键全部不可接。
- 摄影师可修改微信号和样片链接。
- 摄影师修改状态后，舞者端查询结果能反映最新状态。

## 14. 后续可扩展方向

第一版不要实现，但数据库和代码可以尽量不阻碍未来扩展：

- 多活动支持
- 正式账号系统
- 小程序端
- 摄影师审核
- 约拍申请记录
- 接单容量限制
- 主办方后台
- 导入 CSV
- 现场数据看板
