# 勇闯泰兰德旅行手册

在线访问：<https://wyf921118-a11y.github.io/thailand-trip-guide/>

## 本地预览

在当前目录运行：

```bash
python3 -m http.server 4173
```

然后打开 `http://localhost:4173/`。也可以直接打开 `index.html` 阅读，但本地服务器更接近实际部署环境。

## 文件

- `index.html`：页面正文、行程、票卡、待办、行李清单和预算。
- `styles.css`：浅色／深色主题、手机／桌面适配及打印样式。
- `app.js`：倒计时、此刻关注、主题偏好、分享、复制和导航高亮。
- `luggage.js`：行李清单、遗漏检查、出门前确认及逐条同步逻辑。
- `luggage-config.js`：共享数据库连接信息；留空时页面会明确显示演示模式。
- `supabase/migrations/202609170001_luggage_checklist.sql`：共享清单的数据表、初始物品和访问规则。

## 内容维护

1. 修改行程正文：编辑 `index.html` 对应 D1—D5 的时间轴。
2. 修改动态“此刻关注”：同步编辑 `app.js` 顶部 `schedule` 数组。时间必须使用带时区偏移的 ISO 格式，例如澳门 `2026-10-02T14:15:00+08:00`、曼谷 `2026-10-02T16:05:00+07:00`。
3. 修改每日 Google Maps 路线：编辑 `index.html` 中对应按钮的 `data-route-origin`、`data-route-waypoints` 和 `data-route-destination`。多个途经点以 `||` 分隔；手机浏览器最多可靠支持 3 个途经点，更多站点应拆成第二段路线。
4. 修改预订状态或共享待办：编辑 `index.html` 中的交通卡片或 `#preparation` 区域。
5. 修改主题色：编辑 `styles.css` 顶部的颜色变量；深色主题需要同时调整 `html[data-theme="dark"]` 和系统深色媒体查询。

## 连接共享行李清单

1. 在 Supabase 新建项目，打开 SQL Editor，执行 `supabase/migrations/202609170001_luggage_checklist.sql`。
2. 在项目设置中复制 Project URL 和 anon public key，填入 `luggage-config.js`。不要填入 service role key。
3. 重新发布网站。状态显示“已同步”后，两个人即可通过同一链接逐条修改。

清单有意采用“拿到链接即可修改”的公开链接模式，只开放 `luggage_settings`、`luggage_items` 和 `luggage_suggestion_choices` 三张表。不要在这些表中保存证件号码、密码、支付信息或其他敏感数据。每件物品单独保存，并以 `updated_at` 检查同一条目的并发修改，不会用整份清单覆盖另一人的更改。离线时不会提交修改。

## 发布前检查

- 补齐回程航班号并核对最终订单。
- 确认两段船班、候船要求与码头—机场衔接。
- 核实 D3 开放时间、票价、着装、渡轮和 chom arun 预约。
- 确定澳门半天路线、Big C 分店与所有地图终点。
- 不要把订单号、证件号、二维码、个人手机号、住宅位置或带分享令牌的原链接加入发布文件。

旅行正文仍是无需构建的静态网站；共享行李清单需要 Supabase，外部地图链接也需要联网。数据库未连接时会进入明确标注的演示模式，修改不会伪装成已同步。
