import * as core from '@actions/core'
import * as fs from 'fs'
import * as crypto from 'node:crypto'
import { loginWithCredentials } from './api/login.js'
import { getUploadUrl } from './api/get_upload_url.js'
import { uploadFile } from './api/upload_file.js'
import { submitApp } from './api/app_submit.js'
import { updateAppPackageInfo } from './api/update_app_package_info.js'
import { createTestVersion } from './api/create_test_version.js'
import { updateTestVersion } from './api/update_test_version.js'
import { submitTestVersion } from './api/submit_test_version.js'
import { queryPackageStatus } from './api/query_package_status.js'

export async function run(): Promise<void> {
  try {
    const appId = core.getInput('app-id')
    const fileName = core.getInput('file-name')
    const filePath = core.getInput('file-path')
    const chineseMainlandFlag = core.getInput('chinese-mainland-flag')
    const submit = core.getBooleanInput('submit')
    const testSubmit = core.getBooleanInput('test-submit')
    const testType = parseInt(core.getInput('test-type'), 10)
    const testDesc = core.getInput('test-desc')
    const versionDesc = core.getInput('version-desc')
    const onshelfSelfDetect = core.getInput('onshelf-self-detect')
    const testGroupIds = core.getInput('test-group-ids')
    const needNotify = parseInt(core.getInput('need-notify'), 10)
    const startTimeInput = core.getInput('test-start-time')
    const endTimeInput = core.getInput('test-end-time')

    console.log('🍥 Trying to login...')
    const token = await loginWithCredentials()
    console.log('✅ Login successful!')
    const file = fs.readFileSync(filePath)
    const sha256 = crypto.createHash('sha256').update(file).digest('hex')

    console.log('🔗 Getting upload URL...')
    const getUploadUrlResp = await getUploadUrl(token, {
      appId,
      fileName,
      contentLength: file.length,
      sha256,
      chineseMainlandFlag: parseInt(chineseMainlandFlag, 10)
    })

    console.log('📦 Uploading file...')
    await uploadFile({
      urlInfo: getUploadUrlResp.urlInfo,
      content: file,
      fileName
    })
    console.log('⤴️ Upload successful!')

    console.log('📦 Updating app package info...')
    const packageInfoResp = await updateAppPackageInfo(token, {
      appId: appId,
      fileName: fileName,
      objectId: getUploadUrlResp.urlInfo.objectId
    })

    if (testSubmit) {
      const packageId = packageInfoResp.packageId
      if (!packageId) throw new Error('Failed to get package ID')

      console.log('⏳ Waiting for package to compile...')
      await waitForPackageReady(token, appId, packageId)

      console.log('🧪 Creating test version...')
      const testVersionResp = await createTestVersion(token, {
        appId,
        testType,
        testDesc,
        onshelfSelfDetect: parseInt(onshelfSelfDetect, 10)
      })
      const versionId = testVersionResp.versionId
      if (!versionId) throw new Error('Failed to get test version ID')

      console.log('📝 Updating test version...')
      const groupInfos = parseGroupIds(testGroupIds).map((groupId) => ({
        groupId
      }))
      const now = Date.now()
      const startTime = startTimeInput ? parseInt(startTimeInput, 10) : now
      const endTime = endTimeInput
        ? parseInt(endTimeInput, 10)
        : startTime + 90 * 24 * 60 * 60 * 1000
      await updateTestVersion(token, {
        appId,
        versionId,
        pkgId: packageId,
        openTestInfo: {
          startTime,
          endTime,
          testDesc: versionDesc,
          testTaskInfo: {
            groupInfos,
            needNotify
          }
        }
      })

      console.log('🧪 Submitting test version...')
      await submitTestVersion(token, { appId, versionId })
    }

    if (submit) {
      console.log('👷 Submitting app...')
      await submitApp(token, appId, {})
    }

    console.log('🎉 Deploy successful!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * 解析测试群组 ID 列表输入，支持两种格式：
 * - 逗号分隔字符串，如 "id1,id2"
 * - JSON 数组字符串，如 '["id1","id2"]'
 */
function parseGroupIds(input: string): string[] {
  const trimmed = input.trim()
  if (trimmed === '') return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (id): id is string => typeof id === 'string' && id.trim() !== ''
        )
      }
    } catch {
      // 非合法 JSON，回退到逗号分隔解析
    }
  }

  return trimmed
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

const PACKAGE_POLL_INTERVAL_MS = 30 * 1000
const PACKAGE_POLL_TIMEOUT_MS = 30 * 60 * 1000

/**
 * 轮询查询软件包编译状态，直到编译完成（successStatus 为 0）或失败（为 2）。
 * 华为文档提示软件包采用异步解析方式，传包后约需等待 2 分钟。
 */
async function waitForPackageReady(
  token: string,
  appId: string,
  pkgId: string
): Promise<void> {
  const deadline = Date.now() + PACKAGE_POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const resp = await queryPackageStatus(token, { appId, pkgIds: pkgId })
    const state = resp.pkgStateList?.find((s) => s.pkgId === pkgId)

    if (!state) {
      console.log('⏳ Package status not found yet, retrying...')
    } else if (state.successStatus === 0) {
      console.log('✅ Package compiled successfully')
      return
    } else if (state.successStatus === 2) {
      throw new Error(`Package compilation failed: pkgId=${pkgId}`)
    } else {
      console.log(`⏳ Package still parsing (status ${state.successStatus})...`)
    }

    await sleep(PACKAGE_POLL_INTERVAL_MS)
  }
  throw new Error(`Timed out waiting for package to compile: pkgId=${pkgId}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
