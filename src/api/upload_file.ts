import axios from 'axios'
import type { UploadUrlInfo } from './get_upload_url.js'

export interface UploadFileParams {
  urlInfo: UploadUrlInfo
  content: Buffer
  fileName: string
}

function normalizeHeaders(
  headers: Record<string, string> | string
): Record<string, string> {
  if (typeof headers === 'string') {
    // 文档中返回的 headers 为字符串，需要解析成键值对。
    return JSON.parse(headers) as Record<string, string>
  }
  return headers
}

/**
 * 将文件内容上传至 getUploadUrl 返回的上传地址。
 *
 * 按“上传文件”接口文档要求：
 * - 使用 HTTPS PUT（对应 getUploadUrl 返回的 requestMethod）；
 * - 请求头必须原样透传 getUploadUrl 返回的 headers 参数
 *   （Authorization、x-amz-content-sha256、x-amz-date、Host、user-agent、Content-Type）；
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
  const method = urlInfo.requestMethod.toLowerCase() as 'put' | 'post'
  const headers = normalizeHeaders(urlInfo.headers)

  await axios.request({
    method,
    url: urlInfo.uploadUrl,
    headers: {
      ...headers,
      'Content-Length': content.length
    },
    data: content,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  console.log(`uploaded ${fileName} (${content.length} bytes)`)
}
