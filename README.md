# Deploy to Huawei App Gallery

一个用于将 HarmonyOS 应用上传并可选提交到华为 AppGallery Connect 的 GitHub Action。

## 用法

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: ACaiCat/huawei-appgallery-deploy@v1
        with:
          credentials: ${{ secrets.HUAWEI_CREDENTIALS }}
          app-id: your-app-id
          file-path: ./app-release.app
          file-name: app-release
          chinese-mainland-flag: 0
          submit: false
```

## 输入参数

| 名称                    | 必填 | 说明                                                                                       |
| ----------------------- | ---- | ------------------------------------------------------------------------------------------ |
| `credentials`           | 是   | 华为 Service Account 凭据（`.json` 文件内容）。                                            |
| `app-id`                | 是   | 你的 AppGallery Connect 应用 ID。                                                          |
| `file-path`             | 是   | 待上传的应用包（`.app`）路径。                                                             |
| `file-name`             | 是   | 上传使用的文件名称（默认：`app-release`）。                                                |
| `chinese-mainland-flag` | 否   | 如果开发者账号注册地为中国大陆则设为 `1`（默认：`0`）。                                    |
| `submit`                | 否   | 上传后是否将应用提交审核（默认：`false`）。                                                |
| `test-submit`           | 否   | 是否创建并提交测试版本（默认：`false`）。                                                  |
| `test-type`             | 否   | 测试类型：`3` 为 HarmonyOS 邀请测试，`4` 为 HarmonyOS 公开测试（默认：`3`）。              |
| `test-desc`             | 否   | 创建测试版本时的描述，最长 50 个字符（默认：空）。                                       |
| `version-desc`          | 否   | 更新测试版本时的描述，最长 50 个字符（默认：空）。                                       |
| `onshelf-self-detect`   | 否   | 是否进行上架自检：`0` 否，`1` 是（默认：`0`）。                                          |
| `test-group-ids`        | 否   | 测试任务要加入的测试群组 ID 列表，英文逗号分隔（默认：空）。                           |
| `need-notify`           | 否   | 是否向用户发送测试通知：`0` 否，`1` 是（默认：`1`）。                                    |
| `test-start-time`       | 否   | 测试版本开始时间（毫秒时间戳），不填默认当前时间。                                       |
| `test-end-time`         | 否   | 测试版本结束时间（毫秒时间戳），不填默认开始时间 + 90 天。                               |

## 工作流程

1. 使用 Service Account 凭据登录。
2. 获取软件包的上传地址。
3. 将软件包上传到华为对象存储。
4. 更新应用软件包信息（解析软件包中的构建版本号）。
5. 可选：创建并提交测试版本（邀请测试 / 公开测试）。
6. 可选：将应用提交审核（提交前约需等待 2 分钟）。

## 配置凭据

在 AppGallery Connect 中创建 Service Account，下载凭据 `.json` 文件，
并将其内容存入仓库密钥，例如 `HUAWEI_CREDENTIALS`。
