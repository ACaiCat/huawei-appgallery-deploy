# Deploy to Huawei App Gallery

A GitHub Action that uploads and optionally submits HarmonyOS apps to Huawei
AppGallery Connect.

## Usage

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

## Inputs

| Name                    | Required | Description                                                                          |
| ----------------------- | -------- | ------------------------------------------------------------------------------------ |
| `credentials`           | Yes      | Huawei Service Account credentials as JSON (the `.json` file contents).              |
| `app-id`                | Yes      | Your AppGallery Connect app ID.                                                      |
| `file-path`             | Yes      | Path to the app package (`.app`) to upload.                                          |
| `file-name`             | Yes      | Desired file name used for the upload (default: `app-release`).                      |
| `chinese-mainland-flag` | No       | Set to `1` if your developer account is registered in Mainland China (default: `0`). |
| `submit`                | No       | Whether to submit the app for review after upload (default: `false`).                |

## Workflow

1. Sign in using the service account credentials.
2. Request an upload URL for the package.
3. Upload the package to Huawei's object storage.
4. Optionally submit the app for review (add ~2 minutes before submitting).

## Setting up credentials

Create a service account in AppGallery Connect, download the credential `.json`
file, and store its contents in a repository secret, e.g. `HUAWEI_CREDENTIALS`.
