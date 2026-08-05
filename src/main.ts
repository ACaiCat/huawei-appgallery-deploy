import * as core from '@actions/core'
import * as fs from 'fs'
import * as crypto from 'node:crypto'
import { loginWithCredentials } from './api/login.js'
import { getUploadUrl } from './api/get_upload_url.js'
import { uploadFile } from './api/upload_file.js'
import { submitApp } from './api/app_submit.js'

export async function run(): Promise<void> {
  try {
    const appId = core.getInput('app-id')
    const fileName = core.getInput('file-name')
    const filePath = core.getInput('file-path')
    const chineseMainlandFlag = core.getInput('chinese-mainland-flag')
    const submit = core.getBooleanInput('submit')

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

    if (submit) {
      console.log('👷 Submitting app...')
      await submitApp(token, appId, {})
      console.log('🎉 Submit successful!')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
