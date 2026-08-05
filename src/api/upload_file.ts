import axios from 'axios'
import type { UploadUrlInfo } from './get_upload_url.js'

export interface UploadFileParams {
  urlInfo: UploadUrlInfo
  content: Buffer
  fileName: string
}

/**
 * 将文件内容上传至 getUploadUrl 返回的上传地址。
 *
 * 按“上传文件”接口文档要求：
 * - 使用 HTTPS PUT（getUploadUrl 返回的 urlInfo.method 固定为 PUT）；
 * - 请求头必须原样透传 urlInfo.headers 参数（含 Authorization、
 *   x-amz-content-sha256、x-amz-date、Host、user-agent、Content-Type）；
 * - Body 为二进制文件内容，Content-Type 为 application/octet-stream；
 * - 文件大小必须与调用 getUploadUrl 时填写的 contentLength 一致。
 *
 * HTTP 状态码为 200 时表示上传成功。
 */
export async function uploadFile({
  urlInfo,
  content,
  fileName
}: UploadFileParams): Promise<void> {
  const method = urlInfo.method.toLowerCase() as 'put' | 'post'

  await axios.request({
    method,
    url: urlInfo.url,
    headers: {
      ...urlInfo.headers,
      'Content-Length': content.length
    },
    data: content,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  console.log(`uploaded ${fileName} (${content.length} bytes)`)
}
