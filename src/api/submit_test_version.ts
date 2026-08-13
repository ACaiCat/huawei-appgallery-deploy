import axios from 'axios'
import { assertRetOk, type Ret } from './ret.js'

export const SUBMIT_TEST_VERSION_API =
  'https://connect-api.cloud.huawei.com/api/publish/v2/test/app/version/submit'

export interface SubmitTestVersionParams {
  appId: string
  /** 测试版本 ID，由创建测试版本接口返回。 */
  versionId: string
}

export interface SubmitTestVersionResponse {
  ret: Ret
}

/**
 * 提交测试版本审核。
 */
export async function submitTestVersion(
  token: string,
  params: SubmitTestVersionParams,
  clientId?: string
): Promise<SubmitTestVersionResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { appId, versionId } = params

  const { data } = await axios.post<SubmitTestVersionResponse>(
    SUBMIT_TEST_VERSION_API,
    { versionId },
    {
      headers,
      params: { appId }
    }
  )

  assertRetOk(data.ret)

  return data
}
