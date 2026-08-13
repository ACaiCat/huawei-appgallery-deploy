import axios from 'axios'
import { assertRetOk, type Ret } from './ret.js'

export const CREATE_TEST_VERSION_API =
  'https://connect-api.cloud.huawei.com/api/publish/v2/test/app/version'

export interface CreateTestVersionParams {
  appId: string
  /** HarmonyOS 测试发布方式（API>=10），默认 6。 */
  releaseType?: number
  /** 测试类型，3 HarmonyOS 邀请测试，4 HarmonyOS 公开测试。 */
  testType: number
  /** 测试版本描述，最长 50 个字符。 */
  testDesc: string
  /** 是否进行上架自检，0 否，1 是。 */
  onshelfSelfDetect?: number
}

export interface CreateTestVersionResponse {
  ret: Ret
  /** 测试版本 ID。 */
  versionId?: string
}

/**
 * 创建 HarmonyOS 应用/元服务的测试版本。
 */
export async function createTestVersion(
  token: string,
  params: CreateTestVersionParams,
  clientId?: string
): Promise<CreateTestVersionResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }
  if (clientId) headers['client_id'] = clientId

  const { appId, ...body } = params

  const { data } = await axios.post<CreateTestVersionResponse>(
    CREATE_TEST_VERSION_API,
    body,
    {
      headers,
      params: { appId }
    }
  )

  assertRetOk(data.ret)

  return data
}
