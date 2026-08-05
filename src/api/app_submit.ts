import axios from 'axios'

export const APP_SUBMIT_API =
  'https://connect-api.cloud.huawei.com/api/publish/v3/app-submit'

export interface SubmitAppParams {
  /** 指定发布时间，UTC 格式 yyyy-MM-ddTHH:mm:ssZZ，不填则立即发布。 */
  releaseTime?: string
  /** 提审发布备注，可为空，填写则长度范围为 10-300。 */
  remark?: string
  /** 应用发布方式，1 全网，默认 1。 */
  releaseType?: number
  /** 分阶段发布标识，0 全网发布，3 分阶段发布（7 天内自动更新），默认 0。 */
  releasePhase?: number
  /** 分阶段发布说明，releasePhase 为 3 时必填。 */
  phasedReleaseDescription?: string
}

export interface SubmitAppResponse {
  ret: {
    code: number
    msg: string
  }
}

/**
 * 提交 HarmonyOS 应用/元服务审核。
 *
 * 调用前必须保证应用信息已补充完整、应用软件包已上传，且传包后等待约 2 分钟。
 */
export async function submitApp(
  token: string,
  appId: string,
  params: SubmitAppParams,
  clientId?: string
): Promise<SubmitAppResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { data } = await axios.post<SubmitAppResponse>(APP_SUBMIT_API, params, {
    headers,
    params: { appId }
  })

  return data
}
