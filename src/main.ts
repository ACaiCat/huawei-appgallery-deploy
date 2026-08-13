import * as core from '@actions/core'
import * as fs from 'fs'
import * as crypto from 'node:crypto'
import { loginWithCredentials } from './api/login.js'
import { getUploadUrl } from './api/get_upload_url.js'
import { uploadFile } from './api/upload_file.js'
import { submitApp } from './api/app_submit.js'
import { updateAppPackageInfo } from './api/update_app_package_info.js'
import { createTestVersion } from './api/create_test_version.js'
import { submitTestVersion } from './api/submit_test_version.js'

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
    const onshelfSelfDetect = core.getInput('onshelf-self-detect')

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
    await updateAppPackageInfo(token, {
      appId: appId,
      fileName: fileName,
      objectId: getUploadUrlResp.urlInfo.objectId
    })

    if (testSubmit) {
      console.log('🧪 Creating test version...')
      const testVersionResp = await createTestVersion(token, {
        appId,
        testType,
        testDesc,
        onshelfSelfDetect: parseInt(onshelfSelfDetect, 10)
      })
      const versionId = testVersionResp.versionId
      if (!versionId) throw new Error('Failed to get test version ID')

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
