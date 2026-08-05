import axios from 'axios'

export const GET_UPLOAD_URL_API =
  'https://connect-api.cloud.huawei.com/api/publish/v2/upload-url/for-obs'

export interface ChunkUrlInfo {
  chunkUrl: string
  chunkNo: number
  chunkSize: number
}

export interface UploadUrlInfo {
  authCode: string
  uploadUrl: string
  requestMethod: string
  /** 预签名上传请求头，上传文件时需原样透传（含 Authorization、x-amz-content-sha256、x-amz-date、Host、user-agent、Content-Type）。 */
  headers: Record<string, string> | string
  chunkSize: number
  chunkList: ChunkUrlInfo[]
}

export interface GetUploadUrlResponse {
  ret: {
    code: number
    msg: string
  }
  urlInfo: UploadUrlInfo
}

export interface GetUploadUrlParams {
  appId: string
  fileName: string
  contentLength: number
  sha256?: string
  chineseMainlandFlag?: number
}

/**
 * 获取文件上传地址（图片、视频、APP、PDF 等）。
 *
 * 返回的上传 URL 有效期约为 5 分钟，超时后需重新调用本接口。
 */
export async function getUploadUrl(
  token: string,
  params: GetUploadUrlParams,
  clientId?: string
): Promise<GetUploadUrlResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { data } = await axios.get<GetUploadUrlResponse>(GET_UPLOAD_URL_API, {
    headers,
    params
  })

  return data
}
